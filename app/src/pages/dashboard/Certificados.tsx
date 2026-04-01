import { useState } from 'react';
import {
    Award,
    Download,
    Search,
    Calendar,
    CheckCircle2,
    Lock,
    ArrowRight,
    Loader2,
    Linkedin,
    Twitter,
    MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCertificates } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { generateCertificatePDF } from '@/lib/certificateGenerator';
import { CertificateService } from '@/lib/certificateService';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

export function Certificados() {
    const { user } = useAuth();
    const { selectedProject } = useProject();
    const { data: certificates, isLoading } = useCertificates();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCerts = (certificates || []).filter(cert => {
        const sessionTitle = ((cert as any).activity_name || '').toLowerCase();
        const type = (cert.type || '').toLowerCase();
        return sessionTitle.includes(searchTerm.toLowerCase()) ||
            type.includes(searchTerm.toLowerCase());
    });

    const handleAddToLinkedIn = (cert: any) => {
        const baseUrl = 'https://www.linkedin.com/profile/add';
        const params = new URLSearchParams({
            startTask: 'CERTIFICATION_NAME',
            name: `${cert.activity_name || 'Conclusão'} - ${selectedProject?.name || 'Growth Experience'}`,
            organizationName: 'Growth Experience',
            issueYear: new Date(cert.issue_date).getFullYear().toString(),
            issueMonth: (new Date(cert.issue_date).getMonth() + 1).toString(),
            certId: cert.code,
            certUrl: `${window.location.origin}/validar/${cert.code}`
        });

        window.open(`${baseUrl}?${params.toString()}`, '_blank');
        CertificateService.trackShare(cert.id);
        toast.info('Redirecionando para o LinkedIn...');
    };

    const handleShareTwitter = (cert: any) => {
        const text = `Acabei de receber minha certificação oficial em "${cert.activity_name}" no #GrowthExperience2026! 🚀 Confira a validação:`;
        const url = `${window.location.origin}/validar/${cert.code}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        CertificateService.trackShare(cert.id);
    };

    const handleShareWhatsApp = (cert: any) => {
        const text = `Confira minha nova certificação do Growth Experience 2026: ${cert.activity_name}. Validação: ${window.location.origin}/validar/${cert.code}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        CertificateService.trackShare(cert.id);
    };

    const handleDownload = async (cert: any) => {
        try {
            toast.loading('Gerando seu certificado premium...', { id: 'cert-gen' });

            const template = (selectedProject as any)?.metadata?.certificate_template;
            
            // Extract overrides from certificate metadata if they exist (for manual edits)
            const manualOverrides = (cert as any).metadata?.overrides || {};

            await generateCertificatePDF({
                userName: user?.name || 'Participante',
                eventName: template?.subtitle || selectedProject?.name || 'Growth Experience',
                eventCity: selectedProject?.city || 'Brasil',
                sessionTitle: cert.activity_name || 'Participação Geral',
                date: new Date(cert.issue_date).toLocaleDateString('pt-BR'),
                certificateCode: cert.code,
                type: cert.type as any,
                totalHours: cert.metadata?.total_hours || 8,
                logoBase64: template?.logo_url,
                signatureBase64: template?.signature_url,
                partnerLogosBase64: template?.partner_logos || [],
                templateOverrides: {
                    title: manualOverrides.title || template?.title,
                    description: manualOverrides.description || template?.description,
                    ceoName: template?.ceo_name,
                    ceoRole: template?.ceo_role,
                    primaryColor: template?.primary_color,
                    secondaryColor: template?.secondary_color,
                    accentColor: template?.accent_color,
                    showBackgroundPattern: template?.show_pattern !== undefined ? template.show_pattern : true
                }
            });

            toast.success('Certificado baixado com sucesso!', { id: 'cert-gen' });
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            toast.error('Erro ao gerar o arquivo PDF.', { id: 'cert-gen' });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Award className="text-brand-orange-coral h-8 w-8" />
                        Minhas Conquistas
                    </h1>
                    <p className="text-gray-400 mt-2">Documentação oficial de sua jornada no ecossistema Growth.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por atividade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 bg-white/[0.03] border-white/5 text-white focus:ring-brand-orange-coral h-12 rounded-2xl"
                    />
                </div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-brand-orange-coral/20 bg-brand-orange-coral/5 group hover:bg-brand-orange-coral/10 transition-all rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/10 blur-3xl -z-10" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/20">
                            <CheckCircle2 className="text-brand-orange-coral h-6 w-6" />
                        </div>
                        <span className="text-4xl font-black text-white">{certificates?.length || 0}</span>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">Certificados Oficiais</p>
                    <p className="text-gray-400 text-sm mt-1">Conquistas validadas via QR Code</p>
                </div>

                <div className="glass-card p-6 border-white/5 hover:bg-white/[0.02] transition-all rounded-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Calendar className="text-gray-400 h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">Próximos Desafios</p>
                    <p className="text-gray-400 text-sm mt-1">Novas certificações em breve</p>
                </div>

                <div className="glass-card p-6 border-white/5 flex items-center justify-center text-center border-dashed rounded-3xl opacity-50">
                    <div>
                        <Lock className="text-gray-700 h-8 w-8 mx-auto mb-2" />
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Trilhas Bloqueadas</p>
                    </div>
                </div>
            </div>

            {/* Certificates List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-24 glass-card border-none">
                        <Loader2 className="animate-spin h-10 w-10 text-brand-orange-coral mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Acessando cofre de conquistas...</p>
                    </div>
                ) : filteredCerts.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredCerts.map((cert) => (
                            <div
                                key={cert.id}
                                className="glass-card p-6 border-white/5 hover:border-teal-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group rounded-[2.5rem] relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-orange-coral group-hover:bg-teal-500 transition-colors" />
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-dark-300 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-xl">
                                        <Award className="h-8 w-8 text-brand-orange-coral group-hover:text-teal-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-white/5 text-gray-400 border-none text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                                                ID: {(cert as any).code}
                                            </Badge>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase italic">VALIDADO ✓</span>
                                        </div>
                                        <h3 className="text-white font-black text-xl italic tracking-tight group-hover:text-brand-orange-coral transition-colors uppercase">
                                            {(cert as any).activity_name || 'Participação Geral'}
                                        </h3>
                                        <p className="text-gray-500 text-xs font-medium flex items-center gap-2 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date((cert as any).issueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                 <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-2xl border border-white/5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleAddToLinkedIn(cert)}
                                            className="text-gray-400 hover:text-white hover:bg-[#0077b5] h-12 w-12 rounded-xl transition-all"
                                            title="Adicionar ao LinkedIn"
                                        >
                                            <Linkedin className="h-5 w-5" />
                                        </Button>
                                        
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleShareTwitter(cert)}
                                            className="text-gray-400 hover:text-white hover:bg-black h-12 w-12 rounded-xl transition-all border border-transparent hover:border-white/10"
                                            title="Compartilhar no X"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleShareWhatsApp(cert)}
                                            className="text-gray-400 hover:text-white hover:bg-[#25D366] h-12 w-12 rounded-xl transition-all"
                                            title="Enviar via WhatsApp"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={() => handleDownload(cert)}
                                        className="w-full sm:w-auto bg-white text-black hover:bg-brand-orange-coral hover:text-white font-black px-8 h-14 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <Download className="h-5 w-5" />
                                        BAIXAR PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 glass-card border-dashed border-white/10 rounded-[3rem]">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/5">
                            <Award className="h-12 w-12 text-gray-800" />
                        </div>
                        <h3 className="text-white font-black text-xl mb-3 tracking-tight">Nenhuma conquista registrada</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-10">
                            Participe das sessões, workshops e mentorias. O check-in valida sua presença e libera o certificado instantaneamente.
                        </p>
                        <Button
                            variant="outline"
                            className="h-14 px-10 rounded-2xl border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest"
                            onClick={() => window.location.href = '/programacao'}
                        >
                            Ver Programação
                            <ArrowRight className="h-4 w-4 ml-3" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
