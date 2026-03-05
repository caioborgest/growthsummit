import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, Rocket, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';

interface StartupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StartupFormModal({ isOpen, onClose }: StartupFormModalProps) {
    const DRAFT_KEY = 'startup_form_draft';
    const [formData, setFormData] = useState({
        // Fundador
        nome_fundador: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',

        // Startup
        nome_startup: '',
        descricao_startup: '',
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
    const { projectId } = useProject();

    // Carregar rascunho
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                logger.info('Rascunho de startup carregado');
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
            nome_fundador: '', email: '', telefone: '', senha: '', confirmarSenha: '',
            nome_startup: '', descricao_startup: '', setor: '', estagio: '',
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
            if (!formData.nome_fundador.trim()) throw new Error('Nome do fundador é obrigatório');
            if (!formData.email.trim()) throw new Error('E-mail é obrigatório');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) throw new Error('Por favor, insira um email válido');

            if (!formData.telefone.trim()) throw new Error('WhatsApp/Telefone é obrigatório');
            if (!formData.senha) throw new Error('Senha é obrigatória');
            if (formData.senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');
            if (formData.senha !== formData.confirmarSenha) throw new Error('As senhas não coincidem');

            if (!formData.nome_startup.trim()) throw new Error('Nome da Startup é obrigatório');
            if (!formData.setor) throw new Error('Setor de atuação é obrigatório');
            if (!formData.estagio) throw new Error('Estágio da Startup é obrigatório');
            if (!formData.descricao_startup.trim()) throw new Error('Descrição da Startup é obrigatória');

            if (!formData.problema.trim()) throw new Error('O problema que você resolve é obrigatório');
            if (!formData.solucao.trim()) throw new Error('Sua solução é obrigatória');
            if (!formData.diferencial.trim()) throw new Error('Seu diferencial competitivo é obrigatório');

            // 0. Verificar se já existe uma sessão ativa
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let userId = existingSession?.user?.id;
            let authError = null;

            // Se estiver logado com um email DIFERENTE do que está tentando registrar, ignorar sessão
            if (existingSession && existingSession.user.email?.toLowerCase() !== cleanEmail) {
                userId = undefined;
            }

            if (!userId) {
                // 1. Criar usuário no Supabase Auth se não houver sessão
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: formData.senha,
                    options: {
                        data: {
                            name: formData.nome_fundador,
                            phone: formData.telefone,
                            role: 'startup'
                        }
                    }
                });
                userId = authData?.user?.id;
                authError = sError;

                // Tentar login automático se não retornou sessão (Supabase pode exigir confirmação, mas vamos tentar)
                if (!authError && !authData?.session) {
                    await supabase.auth.signInWithPassword({
                        email: cleanEmail,
                        password: formData.senha
                    }).catch(e => logger.warn('Auto-login skip startup (confirmation required?):', e.message));
                }
            }

            if (authError) {
                // Se já existe, tentamos login automático
                if (authError.message.includes('already registered')) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email: cleanEmail,
                        password: formData.senha
                    });

                    if (!signInError) {
                        userId = signInData.user.id;
                    } else {
                        logger.warn('Login automático falhou:', { message: signInError.message });
                        if (signInError.message.includes('Invalid login credentials')) {
                            throw new Error('Este email já está cadastrado com outra senha. Por favor, use a senha correta ou outro email.');
                        }
                        throw signInError;
                    }
                } else {
                    throw authError;
                }
            }

            // Pequeno delay para garantir propagação do Trigger de sincronização no backend
            await new Promise(r => setTimeout(r, 1500));

            // 1.5. Sincronização com public.users (Agora tratado pelo trigger DB)
            if (userId) {
                logger.info('Vínculo de usuário identificado, sincronização via trigger aguardada.', { userId });
            }

            // Preparar dados para inserção
            const dataToInsert = {
                project_id: projectId,
                user_id: userId || null,
                nome_fundador: formData.nome_fundador,
                email: cleanEmail,
                telefone: formData.telefone,
                nome_startup: formData.nome_startup,
                descricao_startup: formData.descricao_startup,
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

            // Salvar no Supabase (usando INSERT para evitar conflitos e permitir múltiplas inscrições)
            const { error: supabaseError } = await supabase
                .from('startups_arena_pitch')
                .insert([dataToInsert]);

            if (supabaseError) throw supabaseError;

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

            // Redirecionar para o app após 3 segundos
            setTimeout(() => {
                clearDraft();
                setIsSuccess(false);
                onClose();
                window.location.href = '/startup-area';
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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card max-w-xl w-full p-4 sm:p-6 max-h-[96vh] sm:max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 rounded-2xl sm:rounded-3xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Fechar"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Inscrição Enviada!</h3>
                        <p className="text-gray-400">
                            Sua startup foi inscrita na Arena Pitch. Estamos te redirecionando para a sua área...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">Expo StartUp</h2>
                                    <p className="text-xs sm:text-gray-400">Inscreva sua startup</p>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <p className="text-sm text-orange-400">
                                    <strong>Investimento:</strong> R$ 999,00
                                </p>
                                <p className="text-xs text-orange-400/80 mt-1">
                                    Inclui: Exposição + Arena Pitch + 2 Ingressos Noturnos
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Seção: Informações do Fundador */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Informações do Fundador
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome_fundador"
                                            value={formData.nome_fundador}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Telefone/WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Senha *
                                        </label>
                                        <input
                                            type="password"
                                            name="senha"
                                            value={formData.senha}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="Crie uma senha segura"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirmar Senha *
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmarSenha"
                                            value={formData.confirmarSenha}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="Confirme sua senha"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Informações da Startup */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Informações da Startup
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome da Startup *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome_startup"
                                            value={formData.nome_startup}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="Nome da sua startup"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Setor *
                                        </label>
                                        <select
                                            name="setor"
                                            value={formData.setor}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Selecione o setor</option>
                                            {setores.map(setor => (
                                                <option key={setor} value={setor}>{setor}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Estágio *
                                        </label>
                                        <select
                                            name="estagio"
                                            value={formData.estagio}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Selecione o estágio</option>
                                            {estagios.map(estagio => (
                                                <option key={estagio.value} value={estagio.value}>
                                                    {estagio.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Descrição da Startup * (máx. 500 caracteres)
                                        </label>
                                        <textarea
                                            name="descricao_startup"
                                            value={formData.descricao_startup}
                                            onChange={handleChange}
                                            required
                                            maxLength={500}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Descreva sua startup em poucas palavras..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.descricao_startup.length}/500 caracteres
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Pitch */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Seu Pitch
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Qual problema você resolve? * (máx. 300 caracteres)
                                        </label>
                                        <textarea
                                            name="problema"
                                            value={formData.problema}
                                            onChange={handleChange}
                                            required
                                            maxLength={300}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Descreva o problema que sua startup resolve..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Qual é a sua solução? * (máx. 300 caracteres)
                                        </label>
                                        <textarea
                                            name="solucao"
                                            value={formData.solucao}
                                            onChange={handleChange}
                                            required
                                            maxLength={300}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Como sua startup resolve esse problema..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Qual seu diferencial? * (máx. 300 caracteres)
                                        </label>
                                        <textarea
                                            name="diferencial"
                                            value={formData.diferencial}
                                            onChange={handleChange}
                                            required
                                            maxLength={300}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                            placeholder="O que te diferencia da concorrência..."
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Faturamento Mensal (R$)
                                            </label>
                                            <input
                                                type="number"
                                                name="faturamento_mensal"
                                                value={formData.faturamento_mensal}
                                                onChange={handleChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Investimento Buscado (R$)
                                            </label>
                                            <input
                                                type="number"
                                                name="investimento_buscado"
                                                value={formData.investimento_buscado}
                                                onChange={handleChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Documentos */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Documentos (Opcional)
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Link do Pitch Deck (Google Drive, Dropbox, etc.)
                                        </label>
                                        <input
                                            type="url"
                                            name="pitch_deck_url"
                                            value={formData.pitch_deck_url}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Link do Vídeo Pitch (YouTube, Vimeo, etc.)
                                        </label>
                                        <input
                                            type="url"
                                            name="video_pitch_url"
                                            value={formData.video_pitch_url}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="order-2 sm:order-1 border-dark-300 text-gray-300 hover:text-white h-12 sm:h-10"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="order-1 sm:order-2 flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12 sm:h-10 font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="h-4 w-4 mr-2" />
                                            Inscrever Startup
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Ao se inscrever, você concorda com nossos termos de uso e política de privacidade.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
