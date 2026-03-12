import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    Award,
    Search,
    Download,
    Eye,
    Palette,
    Type,
    Save,
    Plus,
    RefreshCw,
    User,
    Stamp,
    CloudUpload,
    Loader2,
    QrCode,
    Trash2,
    Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { generateCertificatePDF, imageUrlToBase64 } from '@/lib/certificateGenerator';
import { ManualCertificateModal } from './components/ManualCertificateModal';

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Certificate {
    id: string;
    registration_id: string;
    project_id: string;
    activity_name: string;
    issue_date: string;
    status: string;
    code: string;
    type: string;
    metadata: any;
    registration?: {
        nome: string;
        email: string;
    };
}

interface CertificateTemplate {
    title: string;
    description: string;
    subtitle: string;
    organization: string;
    ceo_name: string;
    ceo_role: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    show_pattern: boolean;
    background_url: string;
    logo_url: string;
    signature_url: string;
    partner_logos: string[];
}

export function AdminCertificados() {
    const { selectedProject } = useProject();
    const [activeTab, setActiveTab] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    // Template State
    const [template, setTemplate] = useState<CertificateTemplate>({
        title: 'CERTIFICADO DE PARTICIPAÇÃO',
        description: 'Certificamos com orgulho que o participante concluiu com sucesso todas as etapas da atividade proposta no evento.',
        subtitle: 'Growth Experience 2026',
        organization: 'Growth & IA Hub',
        ceo_name: 'Caio Diniz Borges',
        ceo_role: 'CEO Growth & IA',
        primary_color: '#fe4c38',
        secondary_color: '#21808d',
        accent_color: '#ffffff',
        show_pattern: true,
        background_url: '',
        logo_url: '',
        signature_url: '',
        partner_logos: []
    });

    const [isSaving, setIsSaving] = useState(false);
    
    // Upload Refs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);
    const partnerLogoInputRef = useRef<HTMLInputElement>(null);

    // ── Carregar Dados ──────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        if (!selectedProject?.id) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('certificates' as any)
                .select('*, registration:inscricoes_growth_experience(nome, email)')
                .eq('project_id', selectedProject.id)
                .order('issue_date', { ascending: false });

            if (error) throw error;
            setCertificates(data || []);
        } catch (err) {
            logger.error('[AdminCertificados] Erro ao carregar certificados:', err);
            toast.error('Erro ao carregar listagem.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedProject?.id]);

    useEffect(() => {
        fetchData();

        // Carregar config do projeto se existir
        if (selectedProject?.metadata?.certificate_template) {
            const savedTemplate = selectedProject.metadata.certificate_template;
            setTemplate(prev => ({ 
                ...prev, 
                ...savedTemplate,
                partner_logos: savedTemplate.partner_logos || []
            }));
        }
    }, [fetchData, selectedProject]);

    // ── Ações ────────────────────────────────────────────────────────────────
    const handleSaveTemplate = async () => {
        if (!selectedProject?.id) return;
        setIsSaving(true);
        try {
            const newMetadata = {
                ...(selectedProject.metadata || {}),
                certificate_template: template
            };

            const { error } = await supabase
                .from('projects')
                .update({ metadata: newMetadata })
                .eq('id', selectedProject.id);

            if (error) throw error;
            toast.success('Configurações de modelo salvas com sucesso!');
        } catch (err) {
            logger.error('[AdminCertificados] Erro ao salvar template:', err);
            toast.error('Erro ao salvar configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async (cert: Certificate, mode: 'save' | 'bloburl' = 'save') => {
        const toastId = toast.loading(mode === 'save' ? 'Gerando certificado...' : 'Preparando visualização...');
        try {
            // Extract overrides from certificate metadata if they exist (for manual edits)
            const manualOverrides = cert.metadata?.overrides || {};

            // Preparar dados do template
            const certData: any = {
                userName: cert.registration?.nome || 'Participante',
                eventName: selectedProject?.name || 'Growth Experience',
                date: new Date(cert.issue_date).toLocaleDateString('pt-BR'),
                certificateCode: cert.code,
                type: cert.type || 'lecture',
                sessionTitle: cert.activity_name,
                totalHours: cert.metadata?.total_hours || 8,
                templateOverrides: {
                    title: manualOverrides.title || template.title,
                    description: manualOverrides.description || template.description,
                    ceoName: template.ceo_name,
                    ceoRole: template.ceo_role,
                    primaryColor: template.primary_color,
                    secondaryColor: template.secondary_color,
                    accentColor: template.accent_color,
                    showBackgroundPattern: template.show_pattern
                }
            };

            // Carregar Imagens
            if (template.logo_url) {
                certData.logoBase64 = await imageUrlToBase64(template.logo_url).catch(e => {
                    console.error('Erro logo:', e);
                    return undefined;
                });
            }
            if (template.signature_url) {
                certData.signatureBase64 = await imageUrlToBase64(template.signature_url).catch(e => {
                    console.error('Erro assinatura:', e);
                    return undefined;
                });
            }
            if (template.background_url) {
                certData.templateOverrides.customBackgroundBase64 = await imageUrlToBase64(template.background_url).catch(e => {
                    console.error('Erro BG:', e);
                    return undefined;
                });
            }
            if (template.partner_logos?.length > 0) {
                certData.partnerLogosBase64 = await Promise.all(
                    template.partner_logos.map(url => imageUrlToBase64(url).catch(() => null))
                ).then(res => res.filter(Boolean));
            }

            const result = await generateCertificatePDF(certData, mode);
            
            if (mode === 'bloburl' && typeof result === 'string') {
                window.open(result, '_blank');
                toast.success('Visualização aberta!', { id: toastId });
            } else {
                toast.success('Certificado gerado com sucesso!', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao processar certificado.', { id: toastId });
        }
    };

    const handleView = (cert: Certificate) => {
        handleDownload(cert, 'bloburl');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.')) return;
        
        try {
            const { error } = await supabase
                .from('certificates' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Certificado excluído.');
            fetchData();
        } catch (err) {
            logger.error('[AdminCertificados] Erro ao excluir:', err);
            toast.error('Erro ao excluir certificado.');
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'signature_url' | 'partner_logos') => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB.');
            return;
        }

        try {
            toast.loading('Processando imagem...', { id: 'upload' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (field === 'partner_logos') {
                    setTemplate(prev => ({ 
                        ...prev, 
                        partner_logos: [...(prev.partner_logos || []), base64String] 
                    }));
                } else {
                    setTemplate(prev => ({ ...prev, [field]: base64String }));
                }
                toast.success('Imagem carregada com sucesso!', { id: 'upload' });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            logger.error('[AdminCertificados] Erro ao processar imagem:', error);
            toast.error('Erro ao processar imagem.', { id: 'upload' });
        }
    };

    const removePartnerLogo = (index: number) => {
        setTemplate(prev => ({
            ...prev,
            partner_logos: prev.partner_logos.filter((_, i) => i !== index)
        }));
    };

    const handlePreview = async () => {
        try {
            toast.loading('Gerando preview...', { id: 'preview' });

            await generateCertificatePDF({
                userName: 'Participante de Exemplo',
                eventName: template.subtitle || selectedProject?.name || 'Growth Experience',
                eventCity: selectedProject?.city || 'Brasil',
                sessionTitle: 'Workshop de Inovação e Growth',
                date: new Date().toLocaleDateString('pt-BR'),
                certificateCode: 'PREVIEW-GX',
                type: 'workshop',
                totalHours: 8,
                logoBase64: template.logo_url,
                signatureBase64: template.signature_url,
                partnerLogosBase64: template.partner_logos,
                templateOverrides: {
                    title: template.title,
                    description: template.description,
                    ceoName: template.ceo_name,
                    ceoRole: template.ceo_role,
                    primaryColor: template.primary_color,
                    secondaryColor: template.secondary_color,
                    accentColor: template.accent_color,
                    showBackgroundPattern: template.show_pattern
                }
            });

            toast.success('Preview gerado!', { id: 'preview' });
        } catch (err) {
            console.error(err);
            toast.error('Erro ao gerar preview.', { id: 'preview' });
        }
    };

    const filteredCertificates = useMemo(() => {
        return certificates.filter(c =>
            c.registration?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.activity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [certificates, searchTerm]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header com Glass effect */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Award className="h-9 w-9 text-brand-orange-coral" />
                        Portal de Certificados
                    </h1>
                    <p className="text-gray-500 font-medium">Design inovador, marcas parceiras e emissão automatizada.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white bg-white/5" onClick={fetchData}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                    <Button 
                        className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black px-6 shadow-lg shadow-orange-500/20" 
                        onClick={() => setIsManualModalOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Emissão
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-dark-200 border border-white/5 p-1 h-14 rounded-2xl mb-8">
                    <TabsTrigger value="list" className="rounded-xl px-8 h-full data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white font-bold">
                        <Award className="h-4 w-4 mr-2" />
                        Emissões
                    </TabsTrigger>
                    <TabsTrigger value="template" className="rounded-xl px-8 h-full data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white font-bold">
                        <Palette className="h-4 w-4 mr-2" />
                        Editor Premium
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    <div className="flex items-center gap-4 bg-dark-200 border border-white/5 p-4 rounded-2xl shadow-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <Input
                                placeholder="Buscar por participante, atividade ou código..."
                                className="bg-dark-100 border-none pl-12 h-12 text-white placeholder:text-gray-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-[10px] sm:text-xs uppercase font-black tracking-widest">
                                    <th className="px-6 py-5">Participante</th>
                                    <th className="px-6 py-5">Atividade</th>
                                    <th className="px-6 py-5">Chave / Código</th>
                                    <th className="px-6 py-5 text-center">Data</th>
                                    <th className="px-6 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="h-10 w-10 text-brand-orange-coral animate-spin mx-auto mb-4" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando dados...</p>
                                        </td>
                                    </tr>
                                ) : filteredCertificates.length > 0 ? (
                                    filteredCertificates.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors group border-b border-white/5 last:border-0">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-brand-orange-coral" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm tracking-tight">{cert.registration?.nome || 'Inscrito'}</p>
                                                        <p className="text-gray-500 text-[10px] uppercase font-black tracking-tighter truncate max-w-[150px]">
                                                            {cert.registration?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className="bg-dark-300 text-teal-400 border-teal-500/20 px-3 py-1 font-black text-[10px] italic">
                                                    {cert.activity_name || 'Geral'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <code className="text-sm font-mono text-brand-orange-coral bg-brand-orange-coral/5 px-2 py-1 rounded-md border border-brand-orange-coral/10">
                                                    {cert.code}
                                                </code>
                                            </td>
                                            <td className="px-6 py-5 text-center text-gray-400 text-sm font-bold">
                                                {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-gray-400 hover:text-white hover:bg-white/5" 
                                                        title="Visualizar"
                                                        onClick={() => handleView(cert)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-teal-400 hover:bg-teal-500/10" 
                                                        title="Download"
                                                        onClick={() => handleDownload(cert)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-red-400 hover:bg-red-500/10" 
                                                        title="Excluir"
                                                        onClick={() => handleDelete(cert.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                                <Award className="h-8 w-8 text-gray-700" />
                                            </div>
                                            <p className="text-gray-400 font-bold mb-1">Nenhum certificado encontrado</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="template" className="space-y-8 animate-fade-in-up">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Editor de Texto */}
                        <div className="space-y-6">
                            <div className="glass-card p-8 border-teal-500/20 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                                    <div className="p-2 bg-teal-500/20 rounded-xl">
                                        <Type className="h-5 w-5 text-teal-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white">Configuração Global de Textos</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Título do Documento</label>
                                        <Input
                                            value={template.title}
                                            onChange={e => setTemplate({ ...template, title: e.target.value })}
                                            className="bg-dark-100 border-none h-12 text-white font-bold focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Evento / Subtítulo</label>
                                        <Input
                                            value={template.subtitle}
                                            onChange={e => setTemplate({ ...template, subtitle: e.target.value })}
                                            className="bg-dark-100 border-none h-12 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Corpo do Texto (Participação)</label>
                                        <textarea
                                            rows={3}
                                            value={template.description}
                                            onChange={e => setTemplate({ ...template, description: e.target.value })}
                                            className="w-full bg-dark-100 border-none rounded-xl p-4 text-white text-sm resize-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Nome do Assinante</label>
                                            <Input
                                                value={template.ceo_name}
                                                onChange={e => setTemplate({ ...template, ceo_name: e.target.value })}
                                                className="bg-dark-100 border-none h-12 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cargo / Título</label>
                                            <Input
                                                value={template.ceo_role}
                                                onChange={e => setTemplate({ ...template, ceo_role: e.target.value })}
                                                className="bg-dark-100 border-none h-12 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 border-orange-500/20 space-y-6">
                                <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
                                    <div className="p-2 bg-orange-500/20 rounded-xl">
                                        <Palette className="h-5 w-5 text-orange-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white">Identidade & Marcas Parceiras</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cor Primária</label>
                                            <input type="color" value={template.primary_color} onChange={e => setTemplate({ ...template, primary_color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer bg-dark-100 border-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cor Secundária</label>
                                            <input type="color" value={template.secondary_color} onChange={e => setTemplate({ ...template, secondary_color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer bg-dark-100 border-none" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Destaque</label>
                                            <input type="color" value={template.accent_color} onChange={e => setTemplate({ ...template, accent_color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer bg-dark-100 border-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo_url')} accept="image/png, image/jpeg" className="hidden" />
                                        <input type="file" ref={signatureInputRef} onChange={(e) => handleImageUpload(e, 'signature_url')} accept="image/png, image/jpeg" className="hidden" />
                                        <input type="file" ref={partnerLogoInputRef} onChange={(e) => handleImageUpload(e, 'partner_logos')} accept="image/png, image/jpeg" className="hidden" />

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                                            <div className="flex items-center gap-3">
                                                <CloudUpload className="h-5 w-5 text-gray-500" />
                                                <span className="text-sm font-bold text-gray-400">Logomarca Principal (GX)</span>
                                            </div>
                                            {template.logo_url && <Badge className="bg-teal-500/20 text-teal-400 border-none">OK</Badge>}
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all cursor-pointer" onClick={() => signatureInputRef.current?.click()}>
                                            <div className="flex items-center gap-3">
                                                <Stamp className="h-5 w-5 text-gray-500" />
                                                <span className="text-sm font-bold text-gray-400">Assinatura do CEO</span>
                                            </div>
                                            {template.signature_url && <Badge className="bg-teal-500/20 text-teal-400 border-none">OK</Badge>}
                                        </div>

                                        {/* Gestão de Marcas Parceiras: SEBRAE, etc. */}
                                        <div className="space-y-3 pt-2">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center justify-between">
                                                Marcas Parceiras (Ex: SEBRAE, Prefeitura)
                                                <Button size="xs" variant="ghost" className="text-teal-400 h-6 px-2" onClick={() => partnerLogoInputRef.current?.click()}>
                                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Logo
                                                </Button>
                                            </label>
                                            <div className="flex flex-wrap gap-3">
                                                {template.partner_logos && template.partner_logos.map((logo, idx) => (
                                                    <div key={idx} className="relative group w-16 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                                                        <img src={logo} alt="Partner" className="max-w-[80%] max-h-[80%] object-contain" />
                                                        <button 
                                                            onClick={() => removePartnerLogo(idx)}
                                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Plus className="h-4 w-4 rotate-45" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!template.partner_logos || template.partner_logos.length === 0) && (
                                                    <p className="text-[10px] text-gray-600 italic">Nenhuma marca parceira adicionada ainda.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Dinâmico Estilizado */}
                        <div className="lg:sticky lg:top-8 h-fit space-y-6">
                            <div className="glass-card overflow-hidden border-teal-500/20 relative group shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button onClick={handlePreview} className="bg-brand-orange-coral text-white font-black px-10 py-5 rounded-2xl shadow-2xl scale-110">
                                        <Download className="h-5 w-5 mr-3" />
                                        VER CERTIDÃO EM PDF
                                    </Button>
                                </div>

                                <div className="aspect-[1.41] bg-[#0A0A0F] relative flex items-center justify-center p-6 sm:p-10 overflow-hidden">
                                    {/* Esqueleto Visual Premium */}
                                    <div className="w-full h-full border-[1px] border-white/10 rounded-sm p-8 flex flex-col items-center justify-between text-center relative">
                                        {/* Lateral Bands */}
                                        <div className="absolute left-0 top-0 w-2 h-full" style={{ backgroundColor: template.primary_color }} />
                                        <div className="absolute right-0 top-0 w-2 h-full" style={{ backgroundColor: template.secondary_color }} />
                                        
                                        {/* Header Row */}
                                        <div className="w-full flex justify-between items-start mb-4">
                                            <div className="w-20 h-6 bg-white/5 rounded flex items-center justify-center">
                                                {template.logo_url ? <img src={template.logo_url} className="max-h-full max-w-full opacity-60" /> : <span className="text-[5px] text-gray-600">GX LOGO</span>}
                                            </div>
                                            <div className="flex gap-2">
                                                {template.partner_logos.map((_, i) => (
                                                    <div key={i} className="w-6 h-6 bg-white/5 rounded-full" />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black tracking-[0.4em] text-white" style={{ color: template.primary_color }}>{template.title}</p>
                                            <h4 className="text-xl font-black text-white italic tracking-tighter">NOME PARTICIPANTE</h4>
                                            <div className="w-32 h-[2px] mx-auto bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
                                        </div>

                                        <p className="text-[7px] text-gray-500 max-w-[200px] leading-relaxed">
                                            {template.description.substring(0, 120)}...
                                        </p>

                                        <div className="w-full flex justify-between items-end mt-4">
                                            <div className="text-left relative">
                                                {template.signature_url && (
                                                    <img src={template.signature_url} className="absolute -top-6 left-0 h-6 w-auto opacity-70 pointer-events-none" alt="Assinatura" />
                                                )}
                                                <div className="w-12 h-[1px] bg-white/20 mb-2" />
                                                <p className="text-[6px] font-bold text-white">{template.ceo_name}</p>
                                                <p className="text-[5px] text-gray-600">{template.ceo_role}</p>
                                            </div>
                                            <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                                                <QrCode className="h-4 w-4 text-white/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-teal-500/10 border-t border-teal-500/20 text-center">
                                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Preview Instantâneo</p>
                                </div>
                            </div>

                            <Button onClick={handleSaveTemplate} disabled={isSaving} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-7 rounded-2xl text-lg shadow-xl shadow-teal-500/30">
                                {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="h-5 w-5 mr-3" /> SALVAR DESIGN DO PROJETO</>}
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {selectedProject?.id && (
                <ManualCertificateModal
                    isOpen={isManualModalOpen}
                    onClose={() => setIsManualModalOpen(false)}
                    projectId={selectedProject.id}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

export default AdminCertificados;
