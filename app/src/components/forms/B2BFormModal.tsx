import { useState } from 'react';
import { X, Loader2, CheckCircle, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface B2BFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function B2BFormModal({ isOpen, onClose }: B2BFormModalProps) {
    const [formData, setFormData] = useState({
        // Representante
        nome_representante: '',
        cargo: '',
        email: '',
        telefone: '',

        // Empresa
        nome_empresa: '',
        cnpj: '',
        setor: '',
        porte: '',
        faturamento_anual: '',
        numero_funcionarios: '',

        // Sobre
        descricao_empresa: '',
        produtos_servicos: '',
        site_url: '',
        linkedin_url: '',

        // Objetivos
        tipo_interesse: '',
        areas_interesse: '',
        descricao_objetivos: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const setores = [
        'Tecnologia',
        'Saúde',
        'Educação',
        'Varejo',
        'Indústria',
        'Serviços',
        'Construção',
        'Agronegócio',
        'Alimentação',
        'Logística',
        'Consultoria',
        'Marketing',
        'Financeiro',
        'Outro'
    ];

    const portes = [
        { value: 'mei', label: 'MEI (Microempreendedor Individual)' },
        { value: 'micro', label: 'Microempresa (até R$ 360 mil/ano)' },
        { value: 'pequena', label: 'Pequena (R$ 360 mil a R$ 4,8 mi/ano)' },
        { value: 'media', label: 'Média (R$ 4,8 mi a R$ 300 mi/ano)' },
        { value: 'grande', label: 'Grande (acima de R$ 300 mi/ano)' }
    ];

    const tiposInteresse = [
        { value: 'comprar', label: 'Comprar produtos/serviços' },
        { value: 'vender', label: 'Vender produtos/serviços' },
        { value: 'parceria', label: 'Estabelecer parcerias estratégicas' },
        { value: 'todos', label: 'Todos os acima' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Validação básica
            if (!formData.nome_representante || !formData.cargo || !formData.email ||
                !formData.telefone || !formData.nome_empresa || !formData.setor ||
                !formData.porte || !formData.descricao_empresa || !formData.produtos_servicos ||
                !formData.tipo_interesse || !formData.areas_interesse || !formData.descricao_objetivos) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor, insira um email válido');
            }

            // Preparar dados para inserção
            const dataToInsert = {
                nome_representante: formData.nome_representante,
                cargo: formData.cargo,
                email: formData.email,
                telefone: formData.telefone,
                nome_empresa: formData.nome_empresa,
                cnpj: formData.cnpj || null,
                setor: formData.setor,
                porte: formData.porte,
                faturamento_anual: formData.faturamento_anual ? parseFloat(formData.faturamento_anual) : null,
                numero_funcionarios: formData.numero_funcionarios ? parseInt(formData.numero_funcionarios) : null,
                descricao_empresa: formData.descricao_empresa,
                produtos_servicos: formData.produtos_servicos,
                site_url: formData.site_url || null,
                linkedin_url: formData.linkedin_url || null,
                tipo_interesse: formData.tipo_interesse,
                areas_interesse: formData.areas_interesse,
                descricao_objetivos: formData.descricao_objetivos,
                status: 'pendente',
            };

            // Inserir no Supabase
            const { error: supabaseError } = await supabase
                .from('rodada_negocios_b2b')
                .insert([dataToInsert]);

            if (supabaseError) throw supabaseError;

            // Analytics tracking
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'b2b_inscricao', {
                    event_category: 'Rodada de Negócios',
                    event_label: formData.setor,
                    value: formData.faturamento_anual || 0,
                });
            }

            setIsSuccess(true);

            // Resetar formulário após 3 segundos
            setTimeout(() => {
                setFormData({
                    nome_representante: '',
                    cargo: '',
                    email: '',
                    telefone: '',
                    nome_empresa: '',
                    cnpj: '',
                    setor: '',
                    porte: '',
                    faturamento_anual: '',
                    numero_funcionarios: '',
                    descricao_empresa: '',
                    produtos_servicos: '',
                    site_url: '',
                    linkedin_url: '',
                    tipo_interesse: '',
                    areas_interesse: '',
                    descricao_objetivos: '',
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
                            Sua empresa foi inscrita na Rodada de Negócios B2B. Você receberá um email com mais informações em breve.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                    <Handshake className="h-6 w-6 text-teal-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Rodada de Negócios B2B</h2>
                                    <p className="text-gray-400">Conecte-se com outras empresas</p>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                                <p className="text-sm text-teal-400">
                                    <strong>Gratuito</strong> - Networking qualificado com empresas da região
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Seção: Representante */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Informações do Representante
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome_representante"
                                            value={formData.nome_representante}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Cargo *
                                        </label>
                                        <input
                                            type="text"
                                            name="cargo"
                                            value={formData.cargo}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="Ex: CEO, Diretor Comercial"
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
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Empresa */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Informações da Empresa
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nome da Empresa *
                                        </label>
                                        <input
                                            type="text"
                                            name="nome_empresa"
                                            value={formData.nome_empresa}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="Nome da empresa"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            CNPJ
                                        </label>
                                        <input
                                            type="text"
                                            name="cnpj"
                                            value={formData.cnpj}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="00.000.000/0000-00"
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
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Selecione o setor</option>
                                            {setores.map(setor => (
                                                <option key={setor} value={setor}>{setor}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Porte da Empresa *
                                        </label>
                                        <select
                                            name="porte"
                                            value={formData.porte}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Selecione o porte</option>
                                            {portes.map(porte => (
                                                <option key={porte.value} value={porte.value}>
                                                    {porte.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Faturamento Anual (R$)
                                        </label>
                                        <input
                                            type="number"
                                            name="faturamento_anual"
                                            value={formData.faturamento_anual}
                                            onChange={handleChange}
                                            step="0.01"
                                            min="0"
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Número de Funcionários
                                        </label>
                                        <input
                                            type="number"
                                            name="numero_funcionarios"
                                            value={formData.numero_funcionarios}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Descrição da Empresa * (máx. 500 caracteres)
                                        </label>
                                        <textarea
                                            name="descricao_empresa"
                                            value={formData.descricao_empresa}
                                            onChange={handleChange}
                                            required
                                            maxLength={500}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Descreva sua empresa..."
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Produtos/Serviços * (máx. 300 caracteres)
                                        </label>
                                        <textarea
                                            name="produtos_servicos"
                                            value={formData.produtos_servicos}
                                            onChange={handleChange}
                                            required
                                            maxLength={300}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Liste os principais produtos/serviços..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Site da Empresa
                                        </label>
                                        <input
                                            type="url"
                                            name="site_url"
                                            value={formData.site_url}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            LinkedIn da Empresa
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin_url"
                                            value={formData.linkedin_url}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="https://linkedin.com/company/..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção: Objetivos */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 border-b border-dark-300 pb-2">
                                    Objetivos na Rodada de Negócios
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Tipo de Interesse *
                                        </label>
                                        <select
                                            name="tipo_interesse"
                                            value={formData.tipo_interesse}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Selecione seu interesse</option>
                                            {tiposInteresse.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>
                                                    {tipo.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Áreas de Interesse * (máx. 300 caracteres)
                                        </label>
                                        <textarea
                                            name="areas_interesse"
                                            value={formData.areas_interesse}
                                            onChange={handleChange}
                                            required
                                            maxLength={300}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Ex: Tecnologia, Marketing Digital, Logística..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Descreva seus Objetivos * (máx. 500 caracteres)
                                        </label>
                                        <textarea
                                            name="descricao_objetivos"
                                            value={formData.descricao_objetivos}
                                            onChange={handleChange}
                                            required
                                            maxLength={500}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                            placeholder="O que você busca na rodada de negócios..."
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
                                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Handshake className="h-4 w-4 mr-2" />
                                            Inscrever Empresa
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
