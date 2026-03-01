import { useState, useEffect } from 'react';
import {
    Award,
    Download,
    ExternalLink,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Lock,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCertificates, useSessions } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { generateCertificatePDF, imageUrlToBase64 } from '@/lib/certificateGenerator';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function Certificados() {
    const { user } = useAuth();
    const { selectedProject } = useProject();
    const { data: certificates, isLoading } = useCertificates();
    const { data: sessions } = useSessions();
    const [searchTerm, setSearchTerm] = useState('');
    const [signatureBase64, setSignatureBase64] = useState<string | undefined>();

    // Carregar assinatura do Supabase Storage uma vez na montagem
    useEffect(() => {
        const loadSignature = async () => {
            try {
                const { data } = supabase.storage
                    .from('event-files')
                    .getPublicUrl('assinatura/assinatura-caio.png');
                if (data?.publicUrl) {
                    const b64 = await imageUrlToBase64(data.publicUrl);
                    setSignatureBase64(b64);
                }
            } catch {
                // Falha silenciosa: certificado é gerado sem imagem
            }
        };
        loadSignature();
    }, []);

    const filteredCerts = (certificates || []).filter(cert => {
        const sessionTitle = (cert.metadata?.session_title as string || '').toLowerCase();
        const eventName = (cert.metadata?.event_name as string || '').toLowerCase();
        return sessionTitle.includes(searchTerm.toLowerCase()) ||
            eventName.includes(searchTerm.toLowerCase()) ||
            cert.type.includes(searchTerm.toLowerCase());
    });

    const handleDownload = async (cert: any) => {
        try {
            toast.loading('Gerando seu certificado premium...', { id: 'cert-gen' });

            await generateCertificatePDF({
                userName: user?.name || 'Participante',
                eventName: cert.metadata?.event_name || selectedProject?.name || 'Growth Experience',
                eventCity: selectedProject?.city,
                sessionTitle: cert.metadata?.session_title,
                date: new Date(cert.issueDate).toLocaleDateString('pt-BR'),
                certificateCode: cert.code,
                type: cert.type as 'event' | 'course' | 'lecture' | 'workshop',
                signatureBase64,
                totalHours: cert.metadata?.total_hours,
            });

            toast.success('Certificado baixado com sucesso!', { id: 'cert-gen' });
        } catch (err) {
            console.error('Erro ao gerar PDF:', err);
            toast.error('Erro ao gerar o arquivo PDF.', { id: 'cert-gen' });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Award className="text-brand-orange-coral h-8 w-8" />
                        Meus Certificados
                    </h1>
                    <p className="text-gray-400 mt-2">Sua jornada de aprendizado e crescimento documentada.</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar certificados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-dark-200 border-white/5 text-white focus:ring-brand-orange-coral h-11"
                    />
                </div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-brand-orange-coral/20 bg-brand-orange-coral/5 group hover:bg-brand-orange-coral/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center">
                            <CheckCircle2 className="text-brand-orange-coral h-6 w-6" />
                        </div>
                        <span className="text-4xl font-black text-white">{certificates.length}</span>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">Certificados Conquistados</p>
                    <p className="text-gray-400 text-sm mt-1">Sua evolução no evento</p>
                </div>

                <div className="glass-card p-6 border-white/5 hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                            <Calendar className="text-gray-400 h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-white font-bold text-lg leading-tight">Próximos em Triunfo</p>
                    <p className="text-gray-400 text-sm mt-1">Participe para desbloquear</p>
                </div>

                <div className="glass-card p-6 border-white/5 hover:bg-white/[0.02] transition-all border-dashed">
                    <div className="flex items-center justify-center h-full text-center py-4">
                        <div>
                            <Lock className="text-gray-700 h-8 w-8 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Mais em Breve</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificates List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral mx-auto mb-4"></div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando conquistas...</p>
                    </div>
                ) : filteredCerts.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredCerts.map((cert) => (
                            <div
                                key={cert.id}
                                className="glass-card p-5 border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-dark-300 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <Award className="h-8 w-8 text-brand-orange-coral opacity-80" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20 text-[10px] uppercase font-black tracking-widest">
                                                {cert.type === 'event' ? 'PARTICIPAÇÃO GERAL' : 'SESSÃO / CURSO'}
                                            </Badge>
                                            <span className="text-[10px] text-gray-600 font-bold">EMITIDO EM {new Date(cert.issueDate).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-white font-bold text-xl group-hover:text-brand-orange-coral transition-colors">
                                            {cert.metadata?.session_title || cert.metadata?.event_name || 'Certificado de Participação'}
                                        </h3>
                                        <p className="text-gray-400 text-sm flex items-center gap-2">
                                            {cert.metadata?.room && (
                                                <>
                                                    <span className="font-bold text-gray-500 tracking-tighter">{cert.metadata?.room}</span>
                                                    <span className="text-gray-700">•</span>
                                                </>
                                            )}
                                            <span>CÓD: {cert.code}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => handleDownload(cert)}
                                        className="flex-1 md:flex-none bg-white text-dark hover:bg-brand-orange-coral hover:text-white font-black px-6 py-4 h-auto rounded-xl transition-all shadow-xl"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        BAIXAR PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
                        <div className="w-20 h-20 rounded-full bg-dark-200 flex items-center justify-center mx-auto mb-6">
                            <Award className="h-10 w-10 text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-2">Você ainda não possui certificados</p>
                        <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
                            Participe das atividades do evento e faça o check-in via QR Code para desbloquear suas certificações automaticamente.
                        </p>
                        <Button variant="outline" className="border-white/10 text-gray-400" onClick={() => window.location.href = '#programacao'}>
                            Explorar Programação
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
