import { Award, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CertificatesSectionProps {
    certificados: any[];
    loadingCerts: boolean;
    fetchCertificados: () => void;
    onDownload: (cert: any) => void;
}

export function CertificatesSection({ certificados, loadingCerts, fetchCertificados, onDownload }: CertificatesSectionProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400 mb-1 flex items-center gap-2">
                        <Award className="h-3.5 w-3.5" />Recognition Program
                    </p>
                    <h2 className="text-2xl font-black text-foreground italic tracking-tight leading-none">Minhas Conquistas</h2>
                    <p className="text-foreground/40 text-sm mt-1.5">Certificados de participação e conclusão de trilhas.</p>
                </div>
                <button
                    onClick={fetchCertificados}
                    disabled={loadingCerts}
                    className="flex items-center gap-2 px-5 h-11 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'rgba(20,184,166,0.08)', color: '#14b8a6', borderColor: 'rgba(20,184,166,0.25)' }}
                >
                    {loadingCerts ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Atualizar
                </button>
            </div>

            {/* Certificates grid */}
            <div className="relative overflow-hidden rounded-[2.5rem] min-h-[400px] p-6 sm:p-8"
                style={{ background: 'rgba(20,184,166,0.04)', border: '1px solid rgba(20,184,166,0.12)' }}>

                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.06) 0%, transparent 70%)' }} />

                {loadingCerts ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                        {[1,2,3].map(i => <div key={i} className="h-64 rounded-[2rem] animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
                    </div>
                ) : certificados.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                        <AnimatePresence>
                            {certificados.map((cert, i) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative overflow-hidden rounded-[2rem] p-7 flex flex-col items-center text-center group cursor-pointer"
                                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
                                >
                                    {/* Shine sweep */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />

                                    {/* Top teal line */}
                                    <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)' }} />

                                    {/* Medal icon */}
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                            style={{ background: 'rgba(20,184,166,0.12)', border: '2px solid rgba(20,184,166,0.2)' }}>
                                            <Award className="h-9 w-9 text-teal-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                                        </div>
                                        {/* Spinning ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-dashed animate-[spin_12s_linear_infinite]"
                                            style={{ borderColor: 'rgba(20,184,166,0.2)' }} />
                                    </div>

                                    <h3 className="text-foreground font-black text-base italic uppercase tracking-tight leading-tight mb-2 group-hover:text-teal-400 transition-colors">
                                        {cert.activity_name || 'Participação'}
                                    </h3>

                                    <div className="space-y-0.5 mb-5">
                                        <p className="text-foreground/30 text-[9px] font-black uppercase tracking-[0.2em]">Série GS-2026</p>
                                        <p className="text-foreground/25 text-[8px] font-bold">
                                            Emitido em {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mb-6">
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                                            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Validado</span>
                                        <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                                            style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6' }}>Oficial</span>
                                    </div>

                                    <button
                                        onClick={() => onDownload(cert)}
                                        className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95"
                                        style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)', boxShadow: '0 4px 16px rgba(20,184,166,0.3)' }}
                                    >
                                        <Download className="h-3.5 w-3.5" />Download PDF
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
                            <Award className="h-10 w-10 text-foreground/15" />
                        </div>
                        <h3 className="text-foreground font-black text-lg uppercase italic mb-2">Cofre Vazio</h3>
                        <p className="text-foreground/40 text-sm max-w-sm mx-auto leading-relaxed mb-6">
                            Você ainda não validou participação em atividades. Use o scanner QR nas salas para registrar presença.
                        </p>
                        <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl"
                            style={{ background: 'rgba(255,112,67,0.07)', border: '1px solid rgba(255,112,67,0.15)' }}>
                            <AlertCircle className="h-4 w-4 text-brand-orange-coral" />
                            <p className="text-brand-orange-coral text-[10px] font-bold uppercase tracking-widest">Precisa de ajuda com a validação?</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
