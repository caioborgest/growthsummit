import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle, Linkedin, Target, Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';

interface MentorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { areasMentoria } from '@/data/mentores';

const ESPECIALIDADES = areasMentoria;
const DRAFT_KEY = 'mentor_form_draft';

export function MentorFormModal({ isOpen, onClose }: MentorFormModalProps) {
    const [step, setStep] = useState(1);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        empresa: '',
        cargo: '',
        bio: '',
        linkedin: '',
        especialidades: [] as string[],
        senha: '',
        confirmarSenha: '',
        foto: null as File | null,
        fotoPreview: ''
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
                logger.info('Rascunho de mentor carregado');
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
            nome: '', email: '', telefone: '', empresa: '', cargo: '',
            bio: '', linkedin: '', especialidades: [], senha: '', confirmarSenha: '',
            foto: null, fotoPreview: ''
        });
        setStep(1);
    };

    if (!isOpen) return null;

    const toggleEspecialidade = (esp: string) => {
        setFormData(prev => ({
            ...prev,
            especialidades: prev.especialidades.includes(esp)
                ? prev.especialidades.filter(e => e !== esp)
                : [...prev.especialidades, esp]
        }));
    };

    const nextStep = (force = false) => {
        if (isProcessing && !force) return;

        // Validação obrigatória da foto no Step 1
        if (step === 1 && !formData.foto) {
            setError('Por favor, anexe uma foto de perfil. Ela é necessária para identificação no evento.');
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

            if (formData.senha !== formData.confirmarSenha) {
                throw new Error('As senhas não coincidem');
            }

            // 1. Auth SignUp / SignIn (First step to have a valid session for Storage)
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;

            if (existingSession && existingSession.user.email !== formData.email) {
                userId = undefined;
            }

            if (!userId) {
                logger.info('Tentando autenticação para:', formData.email);
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            name: formData.nome,
                            phone: formData.telefone,
                            role: 'mentor'
                        }
                    }
                });

                if (sError) {
                    if (sError.message.toLowerCase().includes('already registered')) {
                        logger.info('Usuário já cadastrado, tentando login...');
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email: formData.email,
                            password: formData.senha
                        });

                        if (!signInError) {
                            userId = signInData.user.id;
                            logger.info('Login efetuado com sucesso.');
                        } else {
                            logger.warn('Login automático falhou:', signInError.message);
                            if (signInError.message.includes('Invalid login credentials')) {
                                throw new Error('Este e-mail já está cadastrado com outra senha. Por favor, use a senha correta ou outro e-mail.');
                            }
                            throw signInError;
                        }
                    } else {
                        throw sError;
                    }
                } else {
                    userId = authData?.user?.id;
                    logger.info('Conta criada com sucesso.');
                }
            }

            // 2. Photo Upload (Now authenticated)
            if (formData.foto && formData.foto instanceof File) {
                try {
                    logger.info('Enviando foto (identidade autenticada)...');
                    const file = formData.foto;
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${userId || Math.random()}-${Date.now()}.${fileExt}`;
                    const filePath = `mentores/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('event-images')
                        .upload(filePath, file);

                    if (uploadError) {
                        logger.warn('Erro RLS/Storage, tentando upload após delay ou ignorando:', uploadError);
                        // Se falhar upload, continuamos para não travar o cadastro
                    } else {
                        const { data: urlData } = supabase.storage
                            .from('event-images')
                            .getPublicUrl(filePath);
                        fotoUrl = urlData.publicUrl;
                        logger.info('Foto enviada:', fotoUrl);
                    }
                } catch (imgErr) {
                    logger.warn('Erro ao processar imagem:', imgErr);
                }
            }

            // 3. Sync with public.users (Conflict on email is more robust)
            if (userId) {
                try {
                    logger.info('Sincronizando dados na tabela de usuários pública...');
                    const { error: syncError } = await (supabase.from('users') as any).upsert({
                        id: userId,
                        email: formData.email,
                        name: formData.nome,
                        phone: formData.telefone,
                        role: 'mentor',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'email' });

                    if (syncError) {
                        logger.warn('Sincronização falhou (pode ser restrição de banco):', syncError);
                    }
                } catch (userSyncErr) {
                    logger.warn('Erro de sincronização não fatal:', userSyncErr);
                }
            }

            // 4. Save Record in mentores_growth_experience
            logger.info('Salvando dados na tabela de mentores...');
            const targetProjectId = projectId || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Fallback para Triunfo se não detectado

            const mentorData = {
                project_id: targetProjectId,
                user_id: userId || null,
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                empresa: formData.empresa,
                cargo: formData.cargo,
                especialidades: formData.especialidades,
                bio: formData.bio,
                linkedin_url: formData.linkedin,
                foto_url: fotoUrl || formData.fotoPreview || '',
                status: 'pendente',
                created_at: new Date().toISOString()
            };

            logger.info('Dados a serem salvos:', { ...mentorData, email: '***' });

            const { error: dbError } = await supabase
                .from('mentores_growth_experience')
                .upsert(mentorData, { onConflict: 'email' });

            if (dbError) {
                logger.error('Erro ao salvar mentor no Supabase:', dbError);
                throw dbError;
            }

            logger.info('Sucesso! Mentor registrado.');
            setIsSuccess(true);
            localStorage.removeItem(DRAFT_KEY);

            // Limpeza após 5 segundos
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                clearDraft();
            }, 5000);

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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
            <div
                ref={scrollContainerRef}
                className="glass-card max-w-xl w-full max-h-[96vh] sm:max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 rounded-2xl sm:rounded-3xl"
            >
                {/* Progress Bar */}
                {!isSuccess && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <div
                            className="h-full bg-brand-orange-coral transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white transition-colors z-10 p-2"
                >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <div className="p-4 sm:p-8">
                    {isSuccess ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-10 w-10 text-green-400" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Candidatura Enviada!</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Obrigado por se candidatar para ser mentor no Growth Experience.<br />
                                Nossa equipe analisará seu perfil e entrará em contato via email ou WhatsApp em até 48 horas.
                            </p>
                            <Button onClick={onClose} className="bg-brand-orange-coral text-white px-8">
                                Voltar ao Evento
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 sm:mb-8">
                                <Badge className="mb-3 sm:mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                                    Módulo Mentor
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Seja um Mentor</h2>
                                <p className="text-sm sm:text-lg text-gray-400">Compartilhe conhecimento e impulsione negócios locais.</p>
                            </div>

                            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
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
                                                    value={formData.telefone}
                                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
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
                                                    value={formData.cargo}
                                                    onChange={e => setFormData({ ...formData, cargo: e.target.value })}
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
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.especialidades.includes(esp)
                                                            ? 'bg-brand-orange-coral text-white border-brand-orange-coral'
                                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {esp}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Breve Bio / Experiência Profissional</label>
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

                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="flex-1 border-white/10 text-gray-400 hover:bg-white/5"
                                        >
                                            Voltar
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold h-14 rounded-xl"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : step === 3 ? (
                                            'Finalizar Candidatura'
                                        ) : (
                                            'Próximo Passo'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
