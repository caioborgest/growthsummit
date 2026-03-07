import { Award, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CertificatesSectionProps {
    certificados: any[];
    loadingCerts: boolean;
    fetchCertificados: () => void;
}

export function CertificatesSection({
    certificados,
    loadingCerts,
    fetchCertificados
}: CertificatesSectionProps) {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-teal-400" />
                        <span className="text-teal-400 font-black text-[10px] uppercase tracking-[0.4em]">Recognition Program</span>
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Minhas Conquistas</h2>
                    <p className="text-gray-500 text-sm max-w-sm">Seus certificados de participação e conclusão de trilhas de conhecimento.</p>
                </div>
                <Button
                    onClick={fetchCertificados}
                    disabled={loadingCerts}
                    variant="outline"
                    className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 rounded-2xl h-12 px-8 font-black text-xs transition-all hover:scale-105"
                >
                    {loadingCerts ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    ATUALIZAR LISTAGEM
                </Button>
            </div>

            <div className="glass-card p-8 border-teal-500/10 relative overflow-hidden min-h-[400px]">
                {/* Glow behind certificates */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                {certificados.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                        {certificados.map((cert) => (
                            <div key={cert.id} className="group relative">
                                {/* Certificate Background with holographic feel */}
                                <div className="bg-dark-200/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center text-center hover:border-teal-500/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/10 overflow-hidden relative">
                                    {/* Shine effect */}
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-500/40 p-1 mb-6 relative">
                                        <div className="w-full h-full bg-dark-300 rounded-full flex items-center justify-center border border-white/10">
                                            <Award className="h-8 w-8 text-teal-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                                        </div>
                                        {/* Decorative ring */}
                                        <div className="absolute inset-0 border-2 border-dashed border-teal-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                    </div>

                                    <h3 className="text-white font-black text-lg italic leading-tight mb-2 uppercase group-hover:text-teal-400 transition-colors">
                                        {cert.activity_name || 'PARTICIPAÇÃO'}
                                    </h3>

                                    <div className="space-y-1 mb-8">
                                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest leading-none">SÉRIE GS-2026</p>
                                        <p className="text-gray-500 text-[9px] font-bold">EMITIDO EM {new Date(cert.issue_date).toLocaleDateString('pt-BR')}</p>
                                    </div>

                                    <div className="flex gap-2 mb-8">
                                        <Badge className="bg-green-500/20 text-green-500 border-none text-[8px] font-black px-2 py-0.5">VALIDADO</Badge>
                                        <Badge className="bg-teal-500/20 text-teal-400 border-none text-[8px] font-black px-2 py-0.5">OFICIAL</Badge>
                                    </div>

                                    <Button
                                        onClick={() => window.open(`/certificado/${cert.id}`, '_blank')}
                                        className="w-full bg-white text-black hover:bg-teal-500 hover:text-white font-black rounded-2xl h-12 transition-all"
                                    >
                                        DOWNLOAD PDF
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center relative z-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                            <Award className="h-12 w-12 text-gray-800" />
                        </div>
                        <h3 className="text-white font-black text-xl mb-3 tracking-tight">Cofre de Conquistas Vazio</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-8">
                            Você ainda não validou sua participação em atividades. Use o escaner de QR Code nas salas para registrar sua presença.
                        </p>
                        <div className="inline-flex items-center gap-2 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                            <AlertCircle className="h-4 w-4 text-orange-400" />
                            <p className="text-orange-400 text-xs font-bold uppercase tracking-tight">Precisa de ajuda com a validação?</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
