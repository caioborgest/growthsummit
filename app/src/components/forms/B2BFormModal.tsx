import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, Loader2, CheckCircle, Handshake, Upload, Camera, AlertCircle } from 'lucide-react';
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

interface B2BFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function B2BFormModal({ isOpen, onClose }: B2BFormModalProps) {
    const DRAFT_KEY = 'b2b_form_draft';
    const [formData, setFormData] = useState({
        // Representante
        representative_name: '',
        role_title: '',
        email: '',
        phone: '',
        senha: '',
        confirmarSenha: '',

        // Empresa
        company_name: '',
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
        interest_type: '',
        interest_areas: '',
        objectives_description: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const { projectId } = useProject();
    const { user } = useAuth();

    // Carregar rascunho
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed.data }));
                if (parsed.data.logoPreview) {
                    setLogoPreview(parsed.data.logoPreview);
                }
                logger.debug('Rascunho B2B carregado');
            } catch (e) {
                logger.warn('Erro ao carregar rascunho B2B:', e);
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
                    confirmarSenha: '',
                    logoPreview // Tentar persistir base64 se disponível
                },
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        }
    }, [formData, logoPreview, isOpen, isSuccess]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setFormData({
            representative_name: '', role_title: '', email: '', phone: '', senha: '',
            confirmarSenha: '', company_name: '', cnpj: '', setor: '', porte: '',
            faturamento_anual: '', numero_funcionarios: '', descricao_empresa: '',
            produtos_servicos: '', site_url: '', linkedin_url: '', interest_type: '',
            interest_areas: '', objectives_description: '',
        });
        setLogoFile(null);
        setLogoPreview(null);
    };

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
            // Limpeza de email
            const cleanEmail = formData.email.trim().toLowerCase();

            // Validação de Logo
            if (!logoFile) throw new Error('A logomarca da empresa é obrigatória');

            // Validações específicas do Representante
            // Validações básicas
            if (!formData.representative_name.trim()) throw new Error('Nome do representante é obrigatório');
            if (!formData.email.trim()) throw new Error('E-mail é obrigatório');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) throw new Error('Por favor, insira um email válido');

            if (!formData.phone.trim()) throw new Error('WhatsApp/Telefone é obrigatório');
            if (!formData.senha) throw new Error('Senha é obrigatória');
            if (formData.senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres');
            if (formData.senha !== formData.confirmarSenha) throw new Error('As senhas não coincidem');

            if (!formData.company_name.trim()) throw new Error('Nome da empresa é obrigatório');
            if (!formData.setor) throw new Error('Setor de atuação é obrigatório');
            if (!formData.interest_type) throw new Error('Objetivo é obrigatório'); // Changed from 'objetivo' to 'interest_type' based on formData structure

            // 1. Garantir Usuário (Auth)
            const { userId } = await getOrCreateUser({
                email: cleanEmail,
                password: formData.senha,
                name: formData.representative_name,
                phone: formData.phone,
                role: 'b2b-matchmaking'
            });

            // 1.1. Aguardar sincronização do usuário para evitar erro de FK
            await waitForUserSync(userId);

            // 1.5 Upload Logo do B2B
            let logoUrl = '';
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `b2b-${userId}-${Date.now()}.${fileExt}`;
                const filePath = `logos/${fileName}`;

                logger.info('Iniciando upload do logo B2B...', { filePath });

                const { error: uploadError } = await supabase.storage
                    .from('event-images') // Usando event-images que é o padrão verificado
                    .upload(filePath, logoFile, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    logger.error('Erro no upload do logo:', uploadError);
                    throw new Error(`Erro ao enviar logo: ${uploadError.message}`);
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('event-images')
                    .getPublicUrl(filePath);

                logoUrl = publicUrl;
                logger.info('Logo B2B enviado com sucesso:', { logoUrl });
            }

            // 2. Salvar na tabela de rodadas de negócios
            const { error: dbError } = await supabase
                .from('b2b_business_rounds')
                .insert([{
                    project_id: projectId,
                    user_id: userId,
                    representative_name: formData.representative_name,
                    email: cleanEmail,
                    phone: formData.phone,
                    company_name: formData.company_name,
                    cnpj: formData.cnpj || null,
                    porte: formData.porte || null,
                    faturamento_anual: formData.faturamento_anual ? parseFloat(formData.faturamento_anual) : null,
                    numero_funcionarios: formData.numero_funcionarios ? parseInt(formData.numero_funcionarios) : null,
                    descricao_empresa: formData.descricao_empresa,
                    produtos_servicos: formData.produtos_servicos,
                    site_url: formData.site_url || null,
                    linkedin_url: formData.linkedin_url || null,
                    setor: formData.setor,
                    role_title: formData.role_title,
                    interest_type: formData.interest_type,
                    interest_areas: formData.interest_areas,
                    objectives_description: formData.objectives_description,
                    logo_url: logoUrl || null,
                    status: 'pendente'
                }]);

            if (dbError) {
                logger.error('Erro ao salvar B2B no Banco:', dbError);
                throw dbError;
            }

            // Analytics tracking
            const win = window as any;
            if (typeof window !== 'undefined' && win.gtag) {
                win.gtag('event', 'b2b_inscricao', {
                    event_category: 'Rodada de Negócios',
                    event_label: formData.setor,
                    value: formData.faturamento_anual || 0,
                });
            }

            setIsSuccess(true);
            localStorage.removeItem(DRAFT_KEY);

            // Redirecionar para a área correta baseada no role do usuário
            setTimeout(() => {
                clearDraft();
                setIsSuccess(false);
                onClose();
                // Super admin fica no admin; empresa vai para área empresa
                const redirectPath = (user?.role === 'admin') ? '/admin' : '/empresa-area';
                window.location.href = redirectPath;
            }, 3000);
        } catch (err: unknown) {
            logger.error('Erro na inscrição B2B:', { error: err });
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="admin-modal-content max-w-2xl bg-dark-200 border-none p-0 overflow-hidden shadow-2xl">
                {/* Success State */}

                {/* Success State */}
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Inscrição Enviada!</h3>
                        <p className="text-gray-400">
                            Sua empresa foi inscrita na Rodada de Negócios B2B. Estamos te redirecionando para a sua área...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="admin-modal-header">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                                    <Handshake className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle className="text-xl sm:text-2xl font-bold text-white leading-tight uppercase italic tracking-tighter">
                                        Rodada <span className="text-teal-500">de Negócios</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs sm:text-gray-500 uppercase font-black tracking-widest italic">
                                        Matchmaking B2B 2026
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

                        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                            <div className="admin-modal-body bg-dark-200">
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
                                            name="representative_name"
                                            value={formData.representative_name}
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
                                            value={formData.role_title}
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
                                            value={formData.phone}
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
                                            name="company_name"
                                            value={formData.company_name}
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
                                            name="interest_type"
                                            value={formData.interest_type}
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
                                            name="interest_areas"
                                            value={formData.interest_areas}
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
                                            name="objectives_description"
                                            value={formData.objectives_description}
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
                        </div>

                        <div className="admin-modal-footer">

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                    className="order-1 sm:order-2 flex-1 bg-teal-500 hover:bg-teal-600 text-white h-14 font-black rounded-2xl shadow-glow-teal uppercase tracking-widest text-[10px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            PROCESSANDO...
                                        </>
                                    ) : (
                                        <>
                                            <Handshake className="h-5 w-5 mr-2" />
                                            INSCREVER EMPRESA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </DialogContent>
        </Dialog>
    );
}
