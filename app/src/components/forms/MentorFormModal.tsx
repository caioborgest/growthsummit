import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle, Linkedin, Target, Camera, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { getOrCreateUser, waitForUserSync } from '@/lib/auth-helpers';
import { mentorService } from '@/services/mentorService';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { areasMentoria } from '@/data/mentores';

const DRAFT_KEY = 'mentor_form_draft';
const ESPECIALIDADES = areasMentoria;

interface MentorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MentorFormModal({ isOpen, onClose }: MentorFormModalProps) {
    const [step, setStep] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        phone: '',
        empresa: '',
        role_title: '',
        bio: '',
        linkedin: '',
        specialties: [] as string[],
        senha: '',
        confirmarSenha: '',
        foto: null as File | null,
        fotoPreview: '',
        anosExperiencia: 0,
        capacidadeSlots: 3
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const { projectId } = useProject();

    // Auto-scroll to top when step changes
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [step]);

    // Carregar rascunho ao iniciar
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data, foto: null })); // Files não persistem
                if (parsed.data.fotoPreview) {
                    setFormData(prev => ({ ...prev, fotoPreview: parsed.data.fotoPreview }));
                }
                setStep(parsed.step || 1);
                logger.debug('Rascunho de mentor carregado');
            } catch (e) {
                logger.warn('Erro ao carregar rascunho:', e);
            }
        }
    }, []);

    // Salvar rascunho periodicamente
    useEffect(() => {
        if (isOpen && !isSuccess) {
            const draftData = {
                data: {
                    ...formData,
                    foto: null, // Não salvar objeto File
                    senha: '', // Higienizar
                    confirmarSenha: ''
                },
                step,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [formData, step, isOpen, isSuccess]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setFormData({
            nome: '', email: '', phone: '', empresa: '', role_title: '',
            bio: '', linkedin: '', specialties: [], senha: '', confirmarSenha: '',
            foto: null, fotoPreview: '', anosExperiencia: 0, capacidadeSlots: 3
        });
        setStep(1);
    };

    if (!isOpen) return null;

    const toggleEspecialidade = (esp: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(esp)
                ? prev.specialties.filter(e => e !== esp)
                : [...prev.specialties, esp]
        }));
    };

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.foto && !formData.fotoPreview) return 'Por favor, anexe uma foto de perfil.';
            if (!formData.nome.trim()) return 'O nome completo é obrigatório.';
            if (!formData.email.trim()) return 'O e-mail é obrigatório.';
            if (!formData.phone.trim()) return 'O WhatsApp é obrigatório.';
            if (!formData.empresa.trim()) return 'A empresa/instituição é obrigatória.';
            if (!formData.role_title.trim()) return 'O cargo/função é obrigatório.';
            if (!formData.senha.trim()) return 'A senha é obrigatória.';
            if (formData.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
            if (formData.senha !== formData.confirmarSenha) return 'As senhas não coincidem.';
        } else if (currentStep === 2) {
            if (formData.specialties.length === 0) return 'Selecione pelo menos uma especialidade.';
            if (!formData.bio.trim()) return 'A bio/experiência é obrigatória.';
            if (formData.bio.length < 50) return 'Sua bio deve ter pelo menos 50 caracteres para uma boa apresentação.';
            const wordCount = formData.bio.trim().split(/\s+/).length;
            if (wordCount > 100) return `Sua bio deve ter no máximo 100 palavras (atual: ${wordCount}).`;
        }
        return null;
    };

    const nextStep = () => {
        if (isProcessing) return;

        const errorMsg = validateStep(step);
        if (errorMsg) {
            setError(errorMsg);
            return;
        }

        setError('');
        setIsProcessing(true);
        setStep(prev => prev + 1);
        setTimeout(() => setIsProcessing(false), 500);
    };

    const prevStep = () => {
        if (isProcessing) return;
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');
        let fotoUrl = '';

        try {
            logger.info('Iniciando submissão de mentor...');

            // Validação final de todos os passos
            const step1Err = validateStep(1);
            if (step1Err) throw new Error(step1Err);
            const step2Err = validateStep(2);
            if (step2Err) throw new Error(step2Err);

            // Limpeza de email
            const cleanEmail = formData.email.trim().toLowerCase();

            // 1. Auth SignUp / SignIn (Centralized)
            const { userId } = await getOrCreateUser({
                email: cleanEmail,
                password: formData.senha,
                name: formData.nome,
                phone: formData.phone,
                role: 'mentor'
            });

            if (!userId) throw new Error('Não foi possível identificar o usuário para o registro.');

            // Wait for user record to appear in public.users via DB trigger (with timeout safety)
            await waitForUserSync(userId);

            // 2. Photo Upload (Now authenticated)
            // ... (keep photo upload logic as is)
            // 2. Photo Upload (Now authenticated)
            if (formData.foto && formData.foto instanceof File) {
                try {
                    logger.info('Enviando foto de perfil...');
                    const file = formData.foto;
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${userId || 'anon'}-${Date.now()}.${fileExt}`;
                    const filePath = `mentores/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('event-images')
                        .upload(filePath, file, {
                            upsert: true,
                            contentType: file.type
                        });

                    if (uploadError) {
                        logger.error('Erro no upload da foto (Storage):', uploadError);
                        // Tentativa de fallback se for erro generico
                    } else {
                        const { data: urlData } = supabase.storage
                            .from('event-images')
                            .getPublicUrl(filePath);
                        fotoUrl = urlData.publicUrl;
                        logger.info('Foto enviada com sucesso:', fotoUrl);
                    }
                } catch (imgErr) {
                    logger.error('Erro fatal no processamento da imagem:', imgErr);
                }
            }

            // 3. Update public.users table EXPLICITLY to ensure consistency
            if (userId) {
                try {
                    const { error: userUpdateError } = await supabase
                        .from('users')
                        .update({
                            name: formData.nome,
                            phone: formData.phone,
                            avatar_url: fotoUrl || formData.fotoPreview || undefined
                        })
                        .eq('id', userId);

                    if (userUpdateError) logger.warn('Erro ao atualizar tabela users (não crítico):', userUpdateError);
                } catch (userErr) {
                    logger.warn('User update error ignored:', userErr);
                }
            }

            // 3. Sync with public.users (Agora via trigger)
            if (userId) {
                logger.info('ID de usuário identificado para mentor:', { userId });
            }

            // 4. Save Record in growth_experience_mentors via Service Layer
            await mentorService.apply({
                projectId: projectId || '',
                userId: userId, // Agora retornamos garantido
                nome: formData.nome,
                email: cleanEmail,
                phone: formData.phone,
                empresa: formData.empresa,
                role_title: formData.role_title,
                specialties: formData.specialties,
                bio: formData.bio,
                linkedinUrl: formData.linkedin,
                fotoUrl: fotoUrl || formData.fotoPreview || '',
                yearsExperience: Number(formData.anosExperiencia) || 0,
                maxMentories: Number(formData.capacidadeSlots) || 3
            });

            logger.info('Sucesso! Mentor registrado.');
            setIsSuccess(true);
            localStorage.removeItem(DRAFT_KEY);

            // Redirecionar para o app após 3 segundos
            setTimeout(() => {
                onClose();
                window.location.href = '/mentor-area';
            }, 3000);
        } catch (err: unknown) {
            logger.error('Erro na inscrição de mentor:', err);
            let errorMessage = 'Ops! Houve um erro ao processar sua inscrição.';

            if (err instanceof Error && err.message?.toLowerCase().includes('rate limit')) {
                errorMessage = 'Muitas tentativas em pouco tempo. Aguarde 60 segundos.';
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content max-w-xl bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                {!isSuccess && (
                    <div className="admin-modal-header">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/30 shadow-glow-orange">
                                <Target className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                                    Módulo <span className="text-brand-orange-coral">Mentor</span>
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                                    Growth Experience 2026 • Candidatura
                                </DialogDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                )}

                <div className="admin-modal-body bg-dark-200" ref={scrollContainerRef}>
                    <div className="pt-2">
                        {isSuccess ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-10 w-10 text-green-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Candidatura Enviada!</h2>
                                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                    Obrigado por se candidatar para ser mentor no Growth Experience.<br />
                                    Estamos te redirecionando para a sua área de mentor...
                                </p>
                                <Button onClick={onClose} className="bg-brand-orange-coral text-white px-8">
                                    Voltar ao Evento
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-0">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-orange-coral transition-all duration-500 shadow-glow-orange"
                                                style={{ width: `${(step / 3) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-brand-orange-coral italic uppercase">Step 0{step}/03</span>
                                    </div>
                                </div>

                                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    {step === 1 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            {/* Foto de Perfil */}
                                            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-full bg-dark-200 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-orange-coral/50">
                                                        {formData.fotoPreview ? (
                                                            <img src={formData.fotoPreview} className="w-full h-full object-cover" alt="Preview" />
                                                        ) : (
                                                            <User className="h-10 w-10 text-gray-500" />
                                                        )}
                                                    </div>
                                                    <label className="absolute bottom-0 right-0 p-2 bg-brand-orange-coral rounded-full cursor-pointer shadow-lg hover:bg-brand-orange-intense transition-colors">
                                                        <Camera className="h-4 w-4 text-white" />
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        foto: file,
                                                                        fotoPreview: URL.createObjectURL(file)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-white">Foto de Identificação *</p>
                                                    <p className="text-xs text-gray-500">Obrigatória para visualização dos inscritos</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                                                    <input
                                                        required
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.nome}
                                                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                                        placeholder="Como quer ser chamado"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Email Profissional</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="seu@email.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">WhatsApp</label>
                                                    <input
                                                        required
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="(00) 00000-0000"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Empresa / Instituição</label>
                                                    <input
                                                        required
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.empresa}
                                                        onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                                                        placeholder="Onde você atua hoje"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Cargo / Função</label>
                                                    <input
                                                        required
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.role_title}
                                                        onChange={e => setFormData({ ...formData, role_title: e.target.value })}
                                                        placeholder="Ex: Diretor de Vendas"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Crie uma Senha</label>
                                                    <input
                                                        required
                                                        type="password"
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.senha}
                                                        onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                                        placeholder="Mínimo 6 caracteres"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Confirme a Senha</label>
                                                    <input
                                                        required
                                                        type="password"
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.confirmarSenha}
                                                        onChange={e => setFormData({ ...formData, confirmarSenha: e.target.value })}
                                                        placeholder="Repita a senha"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-300">Suas Especialidades (Selecione até 3)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {ESPECIALIDADES.map(esp => (
                                                        <button
                                                            key={esp}
                                                            type="button"
                                                            onClick={() => toggleEspecialidade(esp)}
                                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.specialties.includes(esp)
                                                                ? 'bg-brand-orange-coral text-white border-brand-orange-coral'
                                                                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                                }`}
                                                        >
                                                            {esp}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Anos de Experiência</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.anosExperiencia}
                                                        onChange={e => setFormData({ ...formData, anosExperiencia: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300">Capacidade (Sessões/Slots)</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                        value={formData.capacidadeSlots}
                                                        onChange={e => setFormData({ ...formData, capacidadeSlots: parseInt(e.target.value) || 0 })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-sm font-medium text-gray-300">Breve Bio / Experiência Profissional</label>
                                                    <span className={`text-[10px] ${formData.bio.trim().split(/\s+/).filter(Boolean).length > 100 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                        {formData.bio.trim().split(/\s+/).filter(Boolean).length}/100 palavras
                                                    </span>
                                                </div>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none resize-none"
                                                    value={formData.bio}
                                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Conte-nos um pouco sobre sua trajetória e como você pode ajudar outros empreendedores..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Linkedin className="h-4 w-4 text-blue-400" /> URL do LinkedIn (Opcional)
                                                </label>
                                                <input
                                                    type="url"
                                                    className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none"
                                                    value={formData.linkedin}
                                                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                                    placeholder="https://linkedin.com/in/seu-perfil"
                                                />
                                            </div>

                                            <div className="bg-brand-orange-coral/10 p-6 rounded-2xl border border-brand-orange-coral/20">
                                                <h4 className="text-brand-orange-coral font-bold mb-2 flex items-center gap-2">
                                                    <Target className="h-5 w-5" /> Compromisso
                                                </h4>
                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                    Ao se candidatar, você concorda em disponibilizar pelo menos 1h30 (3 sessões de 30min) durante o evento para as mentorias 1:1. Em troca, você receberá acesso VIP, kit oficial e destaque como mentor oficial.
                                                </p>
                                            </div>

                                        </div>
                                    )}

                            </form>
                        </>
                    )}
                    </div>
                </div>

                {!isSuccess && (
                    <div className="admin-modal-footer">
                        <div className="flex gap-4 w-full">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={prevStep}
                                    className="flex-1 h-14 border-white/10 text-gray-500 hover:text-white font-black text-[10px] uppercase tracking-widest"
                                >
                                    VOLTAR
                                </Button>
                            )}
                            <Button
                                onClick={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}
                                disabled={isSubmitting}
                                className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 rounded-2xl shadow-glow-orange uppercase tracking-widest text-[10px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        PROCESSANDO...
                                    </>
                                ) : step === 3 ? (
                                    'FINALIZAR CANDIDATURA'
                                ) : (
                                    'PRÓXIMO PASSO'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
