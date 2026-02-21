import { useState } from 'react';
import { X, Loader2, CheckCircle, Handshake, Upload, Camera } from 'lucide-react';
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
        senha: '',
        confirmarSenha: '',

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
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        try {
            console.log('Iniciando inscrição B2B...');
            // Validação de Logo (Obrigatória agora que o usuário pediu)
            if (!logoFile) {
                throw new Error('Por favor, anexe a logomarca da sua empresa.');
            }
            // Validação básica
            if (!formData.nome_representante || !formData.cargo || !formData.email ||
                !formData.telefone || !formData.senha || !formData.confirmarSenha ||
                !formData.nome_empresa || !formData.setor ||
                !formData.porte || !formData.descricao_empresa || !formData.produtos_servicos ||
                !formData.tipo_interesse || !formData.areas_interesse || !formData.descricao_objetivos) {
                throw new Error('Por favor, preencha todos os campos obrigatórios');
            }

            // Validação de senhas
            if (formData.senha !== formData.confirmarSenha) {
                throw new Error('As senhas não coincidem');
            }

            if (formData.senha.length < 6) {
                throw new Error('A senha deve ter pelo menos 6 caracteres');
            }

            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor, insira um email válido');
            }

            // 0. Verificar se já existe uma sessão ativa
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            let user = existingSession?.user;
            let authError = null;

            if (!user) {
                // 1. Criar usuário no Supabase Auth se não houver sessão
                const { data: authData, error: sError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.senha,
                    options: {
                        data: {
                            name: formData.nome_representante,
                            phone: formData.telefone,
                            role: 'b2b'
                        }
                    }
                });
                user = authData?.user ?? undefined;
                authError = sError;
            }

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('Este email já está cadastrado. Por favor, faça login ou use outro email.');
                }
                throw authError;
            }

            if (!user) {
                throw new Error('Erro ao identificar usuário para inscrição');
            }

            // 1.5 Upload Logo if exists
            let logoUrl = '';
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `b2b-logos/${fileName}`;

                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('event-assets')
                    .upload(filePath, logoFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('event-assets')
                    .getPublicUrl(filePath);

                logoUrl = publicUrl;
            }

            // Preparar dados para inserção
            const dataToInsert = {
                user_id: user.id,
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
                logo_url: logoUrl,
                status: 'pendente',
            };

            // Inserir no Supabase
            const { error: supabaseError } = await supabase
                .from('rodada_negocios_b2b')
                .insert(dataToInsert);

            if (supabaseError) throw supabaseError;

            // Analytics tracking
            const win = window as Window & { gtag?: (type: string, name: string, data: Record<string, unknown>) => void };
            if (typeof window !== 'undefined' && win.gtag) {
                win.gtag('event', 'b2b_inscricao', {
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
                    senha: '',
                    confirmarSenha: '',
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
        } catch (err: unknown) {
            console.error('Erro na inscrição B2B:', err);
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card max-w-2xl w-full p-4 sm:p-6 max-h-[96vh] sm:max-h-[85vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300 rounded-2xl sm:rounded-3xl">
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
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                    <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">Rodada de Negócios</h2>
                                    <p className="text-xs sm:text-gray-400">Matchmaking B2B</p>
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
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                                            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                            placeholder="Confirme sua senha"
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
                                </div>

                                {/* Seção: Logomarca da Empresa */}
                                <div className="md:col-span-2 p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl mb-6">
                                    <label className="block text-sm font-bold text-teal-400 mb-3 uppercase tracking-wider">
                                        Logomarca da Empresa *
                                    </label>
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-teal-500/30 rounded-xl p-6 hover:bg-teal-500/10 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            required
                                        />
                                        {logoPreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={logoPreview}
                                                    alt="Preview do Logo"
                                                    className="w-32 h-32 object-contain rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <Camera className="text-white h-8 w-8" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Upload className="h-8 w-8 text-teal-400" />
                                                </div>
                                                <p className="text-teal-400 font-medium">Clique ou arraste o logo</p>
                                                <p className="text-gray-500 text-xs mt-1">PNG ou JPG até 2MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
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
                                    <p className="text-red-400 text-xs sm:text-sm">{error}</p>
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
                                    className="order-1 sm:order-2 flex-1 bg-teal-500 hover:bg-teal-600 text-white h-12 sm:h-10 font-bold"
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
