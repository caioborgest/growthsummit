import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    Award,
    Search,
    Download,
    Eye,
    Settings2,
    Palette,
    Type,
    Save,
    Plus,
    RefreshCw,
    User,
    Stamp,
    CloudUpload,
    Loader2,
    QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { generateCertificatePDF } from '@/lib/certificateGenerator';
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
    background_url: string;
    logo_url: string;
    signature_url: string;
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
        primary_color: '#ff7043',
        secondary_color: '#21808d',
        background_url: '',
        logo_url: '',
        signature_url: ''
    });

    const [isSaving, setIsSaving] = useState(false);
    
    // Upload Refs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

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
    }, [selectedProject?.id, setCertificates]);

    useEffect(() => {
        fetchData();

        // Carregar config do projeto se existir
        if (selectedProject?.metadata?.certificate_template) {
            setTemplate(prev => ({ ...prev, ...selectedProject.metadata.certificate_template }));
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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'signature_url') => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tamanho (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB.');
            return;
        }

        try {
            toast.loading('Processando imagem...', { id: 'upload' });
            // Aqui poderíamos subir pro Supabase Storage, mas para simplificar
            // no preview, vamos converter pra Base64. Num cenário real de 
            // PDF generator, Base64 ou URL pública de storage ambos funcionam.
            
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setTemplate(prev => ({ ...prev, [field]: base64String }));
                toast.success('Imagem carregada com sucesso!', { id: 'upload' });
            };
            reader.readAsDataURL(file);
            
        } catch (error) {
            logger.error('[AdminCertificados] Erro ao processar imagem:', error);
            toast.error('Erro ao processar imagem.', { id: 'upload' });
        }
    };

    const handlePreview = async () => {
        try {
            toast.loading('Gerando preview...', { id: 'preview' });

            // Mock data for preview
            await generateCertificatePDF({
                userName: 'NOME DO PARTICIPANTE EXPLO',
                eventName: template.subtitle || selectedProject?.name || 'Evento de Teste',
                eventCity: selectedProject?.city || 'Brasil',
                sessionTitle: 'Título da Atividade Exemplo',
                date: new Date().toLocaleDateString('pt-BR'),
                certificateCode: 'PREVIEW-000',
                type: 'event',
                templateOverrides: {
                    title: template.title,
                    description: template.description,
                    ceoName: template.ceo_name,
                    ceoRole: template.ceo_role,
                    primaryColor: template.primary_color,
                    secondaryColor: template.secondary_color,
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
                        <Award className="h-9 w-9 text-teal-400" />
                        Gestão de Certificados
                    </h1>
                    <p className="text-gray-500 font-medium">Controle total sobre emissão, modelos e validação de certificados.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white bg-white/5" onClick={fetchData}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Sincronizar
                    </Button>
                    <Button 
                        className="bg-teal-500 hover:bg-teal-600 text-white font-black px-6" 
                        onClick={() => setIsManualModalOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Emitir Manualmente
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-dark-200 border border-white/5 p-1 h-14 rounded-2xl mb-8">
                    <TabsTrigger value="list" className="rounded-xl px-8 h-full data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">
                        <Award className="h-4 w-4 mr-2" />
                        Listagem Geral
                    </TabsTrigger>
                    <TabsTrigger value="template" className="rounded-xl px-8 h-full data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">
                        <Palette className="h-4 w-4 mr-2" />
                        Editor de Modelo
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="rounded-xl px-8 h-full data-[state=active]:bg-teal-500 data-[state=active]:text-white font-bold">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Configurações Robustas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    <div className="flex items-center gap-4 bg-dark-200 border border-white/5 p-4 rounded-2xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                            <Input
                                placeholder="Buscar por participante, atividade ou código..."
                                className="bg-dark-100 border-none pl-12 h-12 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-[10px] sm:text-xs uppercase font-black tracking-widest">
                                    <th className="px-6 py-5">Participante / ID</th>
                                    <th className="px-6 py-5">Atividade</th>
                                    <th className="px-6 py-5">Código Único</th>
                                    <th className="px-6 py-5 text-center">Data Emissão</th>
                                    <th className="px-6 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="h-10 w-10 text-teal-400 animate-spin mx-auto mb-4" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Acessando banco de dados...</p>
                                        </td>
                                    </tr>
                                ) : filteredCertificates.length > 0 ? (
                                    filteredCertificates.map((cert) => (
                                        <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-teal-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm tracking-tight">{cert.registration?.nome || 'Anônimo'}</p>
                                                        <p className="text-gray-500 text-[10px] uppercase font-black tracking-tighter truncate max-w-[150px]">
                                                            {cert.registration_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className="bg-dark-300 text-teal-400 border-teal-500/20 px-3 py-1 font-black text-[10px] italic">
                                                    {cert.activity_name || 'Participação Geral'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <code className="text-sm font-mono text-brand-orange-coral bg-brand-orange-coral/5 px-2 py-1 rounded-md">
                                                    {cert.code}
                                                </code>
                                            </td>
                                            <td className="px-6 py-5 text-center text-gray-400 text-sm font-bold">
                                                {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5" title="Visualizar">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-teal-400 hover:bg-white/5" title="Download">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-400 hover:bg-white/5" title="Excluir">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center mx-auto mb-4">
                                                <Award className="h-8 w-8 text-gray-700" />
                                            </div>
                                            <p className="text-gray-400 font-bold mb-1">Nenhum certificado emitido</p>
                                            <p className="text-gray-600 text-xs">Os certificados aparecem aqui à medida que os participantes fazem check-in.</p>
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
                                    <h3 className="text-lg font-black text-white">Conteúdo & Textos</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Título do Certificado</label>
                                        <Input
                                            value={template.title}
                                            onChange={e => setTemplate({ ...template, title: e.target.value })}
                                            className="bg-dark-100 border-none h-12 text-white font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Subtítulo (Evento)</label>
                                        <Input
                                            value={template.subtitle}
                                            onChange={e => setTemplate({ ...template, subtitle: e.target.value })}
                                            className="bg-dark-100 border-none h-12 text-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Descrição Padrão</label>
                                        <textarea
                                            rows={3}
                                            value={template.description}
                                            onChange={e => setTemplate({ ...template, description: e.target.value })}
                                            className="w-full bg-dark-100 border-none rounded-xl p-4 text-white text-sm resize-none"
                                        />
                                        <p className="text-[10px] text-gray-600 italic">Dica: Use frases que transmitam credibilidade e conquista.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Assinado por (Nome)</label>
                                            <Input
                                                value={template.ceo_name}
                                                onChange={e => setTemplate({ ...template, ceo_name: e.target.value })}
                                                className="bg-dark-100 border-none h-12 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cargo do Assinante</label>
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
                                    <h3 className="text-lg font-black text-white">Identidade Visual</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cor Principal</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={template.primary_color}
                                                    onChange={e => setTemplate({ ...template, primary_color: e.target.value })}
                                                    className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                                />
                                                <span className="text-gray-300 font-mono text-sm">{template.primary_color}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cor Secundária</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={template.secondary_color}
                                                    onChange={e => setTemplate({ ...template, secondary_color: e.target.value })}
                                                    className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
                                                />
                                                <span className="text-gray-300 font-mono text-sm">{template.secondary_color}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Uploaders robustos */}
                                    <div className="space-y-4">
                                        {/* Hidden inputs */}
                                        <input 
                                            type="file" 
                                            ref={logoInputRef} 
                                            onChange={(e) => handleImageUpload(e, 'logo_url')}
                                            accept="image/png, image/jpeg" 
                                            className="hidden" 
                                        />
                                        <input 
                                            type="file" 
                                            ref={signatureInputRef} 
                                            onChange={(e) => handleImageUpload(e, 'signature_url')}
                                            accept="image/png, image/jpeg" 
                                            className="hidden" 
                                        />

                                        <div 
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all cursor-pointer"
                                            onClick={() => logoInputRef.current?.click()}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CloudUpload className="h-5 w-5 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">Logomarca (Alta Defin.)</span>
                                                    {template.logo_url && <span className="text-[10px] text-teal-400 font-bold">Imagem Carregada ✓</span>}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-teal-400 hover:bg-teal-500/10" onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}>Alterar</Button>
                                        </div>

                                        <div 
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all cursor-pointer"
                                            onClick={() => signatureInputRef.current?.click()}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Stamp className="h-5 w-5 text-gray-500 group-hover:text-teal-400 transition-colors" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">Assinatura Digitalizada (PNG)</span>
                                                    {template.signature_url && <span className="text-[10px] text-teal-400 font-bold">Imagem Carregada ✓</span>}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-teal-400 hover:bg-teal-500/10" onClick={(e) => { e.stopPropagation(); signatureInputRef.current?.click(); }}>Alterar</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preview Dinâmico */}
                        <div className="lg:sticky lg:top-8 h-fit space-y-6">
                            <div className="glass-card overflow-hidden border-teal-500/20 relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button onClick={handlePreview} className="bg-teal-500 text-white font-black px-8 py-4 rounded-xl shadow-2xl">
                                        <Download className="h-4 w-4 mr-2" />
                                        GERAR DOWNLOAD TESTE
                                    </Button>
                                </div>

                                <div className="aspect-[1.41] bg-dark-300 relative flex items-center justify-center p-8">
                                    {/* Esqueleto Visual do Certificado */}
                                    <div className="w-full h-full border-[10px] border-dark-100 rounded-lg p-6 flex flex-col items-center justify-between bg-[#0a0a0f] text-center shadow-2xl relative overflow-hidden">
                                        {/* Decorative Sidebar (Mock) */}
                                        <div className="absolute left-0 top-0 w-2 h-full bg-orange-500"></div>
                                        <div className="absolute right-0 top-0 w-2 h-full bg-teal-500"></div>

                                        {template.logo_url ? (
                                            <img src={template.logo_url} alt="Logo" className="max-w-[80px] max-h-[32px] object-contain mb-4" />
                                        ) : (
                                            <div className="w-20 h-8 bg-white/10 rounded mb-4" />
                                        )}
                                        <div className="space-y-2 mb-8">
                                            <p className="text-[8px] font-black text-white/40 tracking-[0.3em] uppercase">{template.title}</p>
                                            <p className="text-[6px] text-white/20">Certificamos com orgulho que</p>
                                        </div>

                                        <div className="w-3/4 h-[1px] bg-teal-500/30" />
                                        <h4 className="text-base font-black text-white tracking-tighter uppercase italic py-2">NOME DO PARTICIPANTE</h4>
                                        <div className="w-3/4 h-[1px] bg-teal-500/30 mb-4" />

                                        <p className="text-[6px] text-white/40 px-8 leading-relaxed mb-6">
                                            {template.description.substring(0, 150)}...
                                        </p>

                                        <div className="flex justify-between w-full px-6">
                                            <div className="text-left">
                                                <div className="w-16 h-8 bg-white/5 rounded border border-white/10 mb-2 flex items-center justify-center overflow-hidden">
                                                    {template.signature_url ? (
                                                        <img src={template.signature_url} alt="Assinatura" className="max-w-full max-h-full object-contain" />
                                                    ) : (
                                                        <span className="text-[5px] text-white/20 italic">ASSINATURA</span>
                                                    )}
                                                </div>
                                                <p className="text-[6px] font-bold text-white mb-0.5">{template.ceo_name}</p>
                                                <p className="text-[5px] text-white/30">{template.ceo_role}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-orange-500 tracking-widest">EVENTO</p>
                                                <p className="text-[6px] text-white/40">{new Date().toLocaleDateString()}</p>
                                                <div className="mt-2 w-8 h-8 bg-white/5 rounded ml-auto flex items-center justify-center">
                                                    <QrCode className="h-4 w-4 text-white/20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-teal-500/10 border-t border-teal-500/20">
                                    <p className="text-[10px] text-teal-400 font-bold text-center flex items-center justify-center gap-2">
                                        <Eye className="h-3 w-3" /> PRÉ-VISUALIZAÇÃO EM TEMPO REAL
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveTemplate}
                                disabled={isSaving}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-7 h-auto rounded-2xl text-lg shadow-xl shadow-teal-500/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-5 w-5 mr-3" />
                                        SALVAR CONFIGURAÇÕES DO MODELO
                                    </>
                                )}
                            </Button>

                            <div className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-4 h-fit">
                                <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-white">Configuração Global</p>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        As alterações feitas aqui afetarão todos os certificados emitidos para o projeto
                                        <strong> {selectedProject?.name}</strong>, incluindo retroativamente.
                                    </p>
                                </div>
                            </div>
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
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}

export default AdminCertificados;
