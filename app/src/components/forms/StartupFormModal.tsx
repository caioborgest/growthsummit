import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Rocket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { getOrCreateUser, waitForUserSync } from '@/lib/auth-helpers';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface StartupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StartupFormModal({ isOpen, onClose }: StartupFormModalProps) {
    const DRAFT_KEY = 'startup_form_draft';
    const [formData, setFormData] = useState({
        // Fundador
        founder_name: '',
        email: '',
        phone: '',
        senha: '',
        confirmarSenha: '',
        lgpdConsent: false,

        // Startup
        startup_name: '',
        startup_description: '',
        setor: '',
        estagio: '',

        // Pitch
        problema: '',
        solucao: '',
        diferencial: '',
        faturamento_mensal: '',
        investimento_buscado: '',

        // URLs
        pitch_deck_url: '',
        video_pitch_url: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
    const { projectId } = useProject();
    const { user } = useAuth();

    // Carregar rascunho
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                logger.debug('Rascunho de startup carregado');
            } catch (e) {
                logger.warn('Erro ao carregar rascunho de startup:', e);
            }
        }
    }, []);

    // Salvar rascunho
    useEffect(() => {
        if (isOpen && !isSuccess) {
            const draftData = {
                data: {
                    ...formData,
                    senha: '', // Higienizar
                    confirmarSenha: ''
                },
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [formData, isOpen, isSuccess]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setFormData({
            founder_name: '', email: '', phone: '', senha: '', confirmarSenha: '', lgpdConsent: false,
            startup_name: '', startup_description: '', setor: '', estagio: '',
            problema: '', solucao: '', diferencial: '', faturamento_mensal: '',
            investimento_buscado: '', pitch_deck_url: '', video_pitch_url: '',
        });
    };

    if (!isOpen) return null;

    const setores = [
        'Tecnologia',
        'Saúde',
        'Educação',
        'Fintech',
        'E-commerce',
        'Agronegócio',
        'Logística',
        'Marketing',
        'Alimentação',
        'Serviços',
        'Outro'
    ];

    const estagios = [
        { value: 'ideia', label: 'Ideia (ainda não validada)' },
        { value: 'mvp', label: 'MVP (produto mínimo viável)' },
        { value: 'validacao', label: 'Validação (primeiros clientes)' },
        { value: 'tracao', label: 'Tração (crescimento consistente)' },
        { value: 'escala', label: 'Escala (expansão acelerada)' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            // Limpeza de email
            const cleanEmail = formData.email.trim().toLowerCase();

            // Validações específicas
            if (!formData.founder_name.trim()) throw new Error('Nome do fundador é obrigatório');
            if (!formData.email.trim()) throw new Error('E-mail é obrigatório');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) throw new Error('Por favor, insira um email válido');

            if (!formData.phone.trim()) throw new Error('WhatsApp/Telefone é obrigatório');
            if (!formData.senha) throw new Error('Senha é obrigatória');
            if (formData.senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');
            if (formData.senha !== formData.confirmarSenha) throw new Error('As senhas não coincidem');

            if (!formData.startup_name.trim()) throw new Error('Nome da Startup é obrigatório');
            if (!formData.setor) throw new Error('Setor de atuação é obrigatório');
            if (!formData.estagio) throw new Error('Estágio da Startup é obrigatório');
            if (!formData.startup_description.trim()) throw new Error('Descrição da Startup é obrigatória');

            if (!formData.problema.trim()) throw new Error('O problema que você resolve é obrigatório');
            if (!formData.solucao.trim()) throw new Error('Sua solução é obrigatória');
            if (!formData.diferencial.trim()) {
                setFieldErrors(prev => ({ ...prev, diferencial: 'Seu diferencial competitivo é obrigatório' }));
                throw new Error('Seu diferencial competitivo é obrigatório');
            }
            if (!formData.lgpdConsent) {
                setFieldErrors(prev => ({ ...prev, lgpdConsent: 'É necessário concordar com a LGPD' }));
                throw new Error('É necessário concordar com a LGPD');
            }

            // 1. Garantir Usuário (Auth)
            const { userId } = await getOrCreateUser({
                email: cleanEmail,
                password: formData.senha,
                name: formData.founder_name,
                phone: formData.phone,
                role: 'startup-founder'
            });

            // 1.1. Aguardar sincronização
            await waitForUserSync(userId);

            // Preparar dados para inserção
            const dataToInsert = {
                project_id: projectId,
                user_id: userId,
                founder_name: formData.founder_name,
                email: cleanEmail,
                phone: formData.phone,
                startup_name: formData.startup_name,
                startup_description: formData.startup_description,
                setor: formData.setor,
                estagio: formData.estagio,
                problema: formData.problema,
                solucao: formData.solucao,
                diferencial: formData.diferencial,
                faturamento_mensal: formData.faturamento_mensal ? parseFloat(formData.faturamento_mensal) : null,
                investimento_buscado: formData.investimento_buscado ? parseFloat(formData.investimento_buscado) : null,
                pitch_deck_url: formData.pitch_deck_url || null,
                video_pitch_url: formData.video_pitch_url || null,
                status: 'pendente',
            };

            // Salvar no Supabase
            const { error: supabaseError } = await supabase
                .from('arena_pitch_startups')
                .insert([dataToInsert]);

            if (supabaseError) throw supabaseError;

            // registrar consentimento LGPD caso o usuário tenha marcado
            if (formData.lgpdConsent) {
                await supabase.from('user_consents').insert([{
                    user_id: userId,
                    consent_type: 'startup_application',
                    granted_at: new Date().toISOString(),
                }]);
            }

            // Analytics tracking
            const win = window as unknown as { gtag?: (type: string, name: string, data: Record<string, unknown>) => void };
            if (typeof window !== 'undefined' && win.gtag) {
                win.gtag('event', 'startup_inscricao', {
                    event_category: 'Arena Pitch',
                    event_label: formData.setor,
                    value: formData.investimento_buscado || 0,
                });
            }

            setIsSuccess(true);
            localStorage.removeItem(DRAFT_KEY);

            // Redirecionar para a área correta baseada no role
            setTimeout(() => {
                clearDraft();
                setIsSuccess(false);
                onClose();
                const redirectPath = (user?.role === 'admin') ? '/admin' : '/startup-area';
                window.location.href = redirectPath;
            }, 3000);
        } catch (err: unknown) {
            logger.error('Erro na inscrição de startup:', { error: err });
            let errorMessage = 'Ops! Houve um erro ao processar sua inscrição.';

            if (err instanceof Error) {
                if (err.message.includes('rate limit exceeded')) {
                    errorMessage = 'Muitas tentativas em pouco tempo. Por favor, aguarde 60 segundos e tente confirmar novamente.';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        // limpa erro daquele campo
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content max-w-xl bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center py-20 px-6">
                        <div className="w-20 h-20 rounded-3xl bg-teal-500/20 flex items-center justify-center mx-auto mb-6 shadow-glow-teal border border-teal-500/30">
                            <CheckCircle className="h-10 w-10 text-teal-400" />
                        </div>
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Inscrição <span className="text-teal-500">Confirmada!</span></h3>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
                            Sua startup foi inscrita com sucesso na Arena Pitch. <br/>Aguarde o redirecionamento...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="admin-modal-header">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/30 shadow-glow-orange">
                                    <Rocket className="h-6 w-6 text-brand-orange-coral" />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                                        Expo <span className="text-brand-orange-coral">StartUp</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">
                                        Arena Pitch 2026 • Inscrição de Expositores
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

                        <div className="admin-modal-body bg-dark-200">
                            <div className="space-y-10 py-6">
                                {/* Promo Card */}
                                <div className="p-6 rounded-[2rem] bg-brand-orange-coral/5 border-2 border-brand-orange-coral/20 shadow-inner group">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange-coral italic">Pacote de Exposição</p>
                                        <p className="text-2xl font-black text-white italic tracking-tighter italic uppercase underline decoration-brand-orange-coral/30 decoration-4 underline-offset-4">R$ 999,00</p>
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-wider">
                                        Inclui: Stand na Expo + Pitch na Arena Principal + 2 Ingressos Full Pass (Acesso Total)
                                    </p>
                                </div>

                                <form id="startup-form" onSubmit={handleSubmit} className="space-y-10 pb-10">
                                    {/* Seção: Informações do Fundador */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] px-2 italic flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                            Perfil do Fundador
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome Completo *</label>
                                                <input
                                                    type="text"
                                                    name="founder_name"
                                                    value={formData.founder_name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                    placeholder="Seu nome completo"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Email Corporativo *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                    placeholder="exemplo@startup.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">WhatsApp direto *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Senha de Acesso *</label>
                                                <input
                                                    type="password"
                                                    name="senha"
                                                    value={formData.senha}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Confirmar Senha *</label>
                                                <input
                                                    type="password"
                                                    name="confirmarSenha"
                                                    value={formData.confirmarSenha}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                    placeholder="Repita sua senha"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção: Informações da Startup */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] px-2 italic flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral" />
                                            Pitch & Business
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome da Startup *</label>
                                                <input
                                                    type="text"
                                                    name="startup_name"
                                                    value={formData.startup_name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/30 appearance-none px-4"
                                                    placeholder="Nome comercial"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Vertical de Atuação *</label>
                                                <select
                                                    name="setor"
                                                    value={formData.setor}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/10 border border-brand-orange-coral/20 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50 appearance-none px-4"
                                                >
                                                    <option value="" className="bg-dark-100">Selecione...</option>
                                                    {setores.map(setor => (
                                                        <option key={setor} value={setor} className="bg-dark-100">{setor}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Estágio de Maturação *</label>
                                                <select
                                                    name="estagio"
                                                    value={formData.estagio}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full h-12 bg-white/10 border border-brand-orange-coral/20 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50 appearance-none px-4"
                                                >
                                                    <option value="" className="bg-dark-100">Selecione...</option>
                                                    {estagios.map(estagio => (
                                                        <option key={estagio.value} value={estagio.value} className="bg-dark-100">
                                                            {estagio.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Elevator Pitch *</label>
                                                <textarea
                                                    name="startup_description"
                                                    value={formData.startup_description}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={500}
                                                    rows={3}
                                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/30 appearance-none resize-none"
                                                    placeholder="Descreva sua startup como se estivéssemos num elevador..."
                                                />
                                                <div className="flex justify-end pr-2">
                                                    <span className="text-[9px] font-black uppercase text-gray-700 tracking-widest">
                                                        {formData.startup_description.length}/500
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção: Pitch Detalhado */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] px-2 italic flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            O Problema e a Solução
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Qual é a "dor" que você resolve? *</label>
                                                <textarea
                                                    name="problema"
                                                    value={formData.problema}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={300}
                                                    rows={2}
                                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/30 appearance-none resize-none"
                                                    placeholder="Seja direto no problema..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Como você cura essa dor? *</label>
                                                <textarea
                                                    name="solucao"
                                                    value={formData.solucao}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={300}
                                                    rows={2}
                                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/30 appearance-none resize-none"
                                                    placeholder="Sua solução e valor entregue..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Unique Selling Proposition (Diferencial) *</label>
                                                <textarea
                                                    name="diferencial"
                                                    value={formData.diferencial}
                                                    onChange={handleChange}
                                                    required
                                                    maxLength={300}
                                                    rows={2}
                                                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/30 appearance-none resize-none"
                                                    placeholder="O que te faz único no mercado..."
                                                />
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">MRR / Faturamento Atual (R$)</label>
                                                    <input
                                                        type="number"
                                                        name="faturamento_mensal"
                                                        value={formData.faturamento_mensal}
                                                        onChange={handleChange}
                                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Investimento Alvo (R$)</label>
                                                    <input
                                                        type="number"
                                                        name="investimento_buscado"
                                                        value={formData.investimento_buscado}
                                                        onChange={handleChange}
                                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-teal-500/50 appearance-none px-4"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção: Documentos */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] text-gray-700 font-black uppercase tracking-[0.3em] px-2 italic flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            Links e Media (Opcional)
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Pitch Deck (Drive/Dropbox)</label>
                                                <input
                                                    type="url"
                                                    name="pitch_deck_url"
                                                    value={formData.pitch_deck_url}
                                                    onChange={handleChange}
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-blue-500/50 appearance-none px-4"
                                                    placeholder="https://suapresentacao.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Video Pitch (YouTube/Vimeo)</label>
                                                <input
                                                    type="url"
                                                    name="video_pitch_url"
                                                    value={formData.video_pitch_url}
                                                    onChange={handleChange}
                                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl text-white font-bold outline-none focus:border-red-500/50 appearance-none px-4"
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* LGPD Consentimento */}
                                    <div className="bg-dark-100/50 p-6 rounded-[1.5rem] border border-white/5">
                                        <div className="flex items-start gap-4">
                                            <input
                                                id="lgpdConsent"
                                                type="checkbox"
                                                name="lgpdConsent"
                                                checked={formData.lgpdConsent}
                                                onChange={e => setFormData({ ...formData, lgpdConsent: e.target.checked })}
                                                className="mt-1 h-5 w-5 bg-dark-300 border-white/10 rounded text-brand-orange-coral focus:ring-brand-orange-coral cursor-pointer"
                                            />
                                            <label htmlFor="lgpdConsent" className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed">
                                                Concordo com a <a href="/lgpd" target="_blank" className="text-white underline hover:text-brand-orange-coral transition-colors">POLÍTICA DE TRATAMENTO DE DADOS (LGPD)</a> PARA ESTE EVENTO.
                                            </label>
                                        </div>
                                        {fieldErrors.lgpdConsent && (
                                            <p className="text-red-400 text-[10px] font-black uppercase italic mt-3">{fieldErrors.lgpdConsent}</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                                disabled={isSubmitting}
                            >
                                CANCELAR
                            </Button>
                            <Button
                                form="startup-form"
                                type="submit"
                                className="flex-1 h-14 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        PROCESSANDO...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="h-5 w-5 mr-2" />
                                        CONFIRMAR INSCRIÇÃO
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
