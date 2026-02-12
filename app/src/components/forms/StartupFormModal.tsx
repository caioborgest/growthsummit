import { useState } from 'react';
import { X, Loader2, CheckCircle, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface StartupFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StartupFormModal({ isOpen, onClose }: StartupFormModalProps) {
    const [formData, setFormData] = useState({
        // Fundador
        nome_fundador: '',
        email: '',
        telefone: '',

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
        setIsSubmitting(true);
        setError('');

        try {
            // Validação básica
            if (!formData.nome_fundador || !formData.email || !formData.telefone ||
                !formData.nome_startup || !formData.descricao_startup || !formData.setor ||
                !formData.estagio || !formData.problema || !formData.solucao || !formData.diferencial) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor, insira um email válido');
            }

            // Preparar dados para inserção
            const dataToInsert = {
                nome_fundador: formData.nome_fundador,
                email: formData.email,
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

            // Inserir no Supabase
            const { error: supabaseError } = await supabase
                .from('startups_arena_pitch')
                .insert([dataToInsert] as any);

            if (supabaseError) throw supabaseError;

            // Analytics tracking
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'startup_inscricao', {
                    event_category: 'Arena Pitch',
                    event_label: formData.setor,
                    value: formData.investimento_buscado || 0,
                });
            }

            setIsSuccess(true);

            // Resetar formulário após 3 segundos
            setTimeout(() => {
                setFormData({
                    nome_fundador: '',
                    email: '',
                    telefone: '',
                    nome_startup: '',
                    descricao_startup: '',
                    setor: '',
                    estagio: '',
                    problema: '',
                    solucao: '',
                    diferencial: '',
                    faturamento_mensal: '',
                    investimento_buscado: '',
                    pitch_deck_url: '',
                    video_pitch_url: '',
                });
                setIsSuccess(false);
                onClose();
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar inscrição. Tente novamente.');
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="glass-card max-w-3xl w-full p-6 my-8 relative animate-in fade-in zoom-in duration-300">
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
                            Sua startup foi inscrita na Arena Pitch. Você receberá um email com mais informações em breve.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <Rocket className="h-6 w-6 text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Arena Pitch</h2>
                                    <p className="text-gray-400">Inscreva sua startup</p>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <p className="text-sm text-orange-400">
                                    <strong>Prêmios:</strong> Até R$ 2.000 + 3 meses de mentoria gratuita
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
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1 border-dark-300 text-gray-300 hover:text-white"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
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
