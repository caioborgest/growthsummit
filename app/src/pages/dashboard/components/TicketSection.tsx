import { QrCode, Sparkles, Download, Moon, Sun, CreditCard, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import QRCode from 'react-qr-code';
import { motion } from 'framer-motion';
import { generateQRString } from '@/lib/qrUtils';


interface TicketSectionProps {
    myRegistration: any;
    user: any;
    selectedProject: any;
    statusFinanceiro: any;
    isActuallyPaid: boolean;
    generateTicketPDF: (reg: any, projectName: string) => Promise<void>;
    setShowCheckInModal: (show: boolean) => void;
    setShowUpgradeModal: (show: boolean) => void;
    onRefresh?: () => void;
}

export function TicketSection({
    myRegistration, user, selectedProject, statusFinanceiro,
    isActuallyPaid, generateTicketPDF, setShowCheckInModal, setShowUpgradeModal, onRefresh
}: TicketSectionProps) {

    const isPro = myRegistration?.palestrasNoturnas;
    const qrValue = myRegistration?.id 
        ? generateQRString('registration', myRegistration.projectId || selectedProject?.id || '', myRegistration.id)
        : 'sem-id';

    return (
        <div className="space-y-6 pb-8">
            {/* ── DIGITAL TICKET ──────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[2.5rem]"
                style={{
                    background: isPro
                        ? 'linear-gradient(135deg, rgba(255,112,67,0.12) 0%, rgba(255,64,53,0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.04) 100%)',
                    border: `1px solid ${isPro ? 'rgba(255,112,67,0.25)' : 'rgba(20,184,166,0.2)'}`,
                }}
            >
                {/* Top shimmer line */}
                <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
                    style={{ background: isPro ? 'linear-gradient(90deg, transparent, rgba(255,112,67,0.6), transparent)' : 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)' }} />

                {/* Ticket notches */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full" style={{ background: 'hsl(var(--background))' }} />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-7 h-7 rounded-full" style={{ background: 'hsl(var(--background))' }} />

                <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-6">
                        {/* Badge */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center"
                                style={{ background: isPro ? 'linear-gradient(135deg,#ff7043,#ff4035)' : 'rgba(20,184,166,0.15)', boxShadow: isPro ? '0 0 16px rgba(255,112,67,0.4)' : 'none' }}>
                                {isPro ? <Moon className="h-6 w-6 text-white" /> : <Sun className="h-6 w-6 text-teal-400" />}
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/40">Ingresso Digital</p>
                                <h3 className="text-foreground font-black text-lg uppercase italic leading-tight">
                                    {isPro ? 'Experience Pro' : 'Free Morning'}
                                </h3>
                            </div>
                        </div>

                        {/* Participant info */}
                        <div className="space-y-3">
                            {[
                                { label: 'Participante', value: myRegistration?.nome || user?.name || '—' },
                                { label: 'Evento', value: selectedProject?.name || 'Growth Experience 2026' },
                                { label: 'Tipo', value: isPro ? 'Passaporte Night + Morning' : 'Free Morning (Manhã)' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <span className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">{label}</span>
                                    <span className="text-foreground font-black text-xs text-right max-w-[60%] truncate">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Payment status */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-foreground/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Pagamento</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={`${statusFinanceiro?.color || ''} text-[9px] font-black px-2.5 py-1 cursor-pointer hover:scale-105 active:scale-95 transition-all border-none`}
                                    onClick={onRefresh}
                                    title="Clique para atualizar"
                                >
                                    {statusFinanceiro?.label || 'Verificando...'}
                                </Badge>
                                {onRefresh && (
                                    <button onClick={onRefresh} className="text-foreground/30 hover:text-foreground/70 transition-colors">
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {isPro && isActuallyPaid && (
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                                <p className="text-green-400 text-[10px] font-bold">Acesso noturno e mentorias liberados!</p>
                            </div>
                        )}
                        {isPro && !isActuallyPaid && (
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: 'rgba(255,112,67,0.08)', border: '1px solid rgba(255,112,67,0.2)' }}>
                                <AlertCircle className="h-4 w-4 text-brand-orange-coral shrink-0" />
                                <p className="text-brand-orange-coral text-[10px] font-bold">Aguardando confirmação financeira para liberar extras.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: QR Code */}
                    <div className="flex flex-col items-center gap-4 sm:pl-8 sm:border-l" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">QR Code de Acesso</p>
                        <div className="relative p-3 rounded-2xl" style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                            <QRCode value={qrValue} size={140} level="H" />
                            {/* Scanner animation */}
                            <div className="absolute left-3 right-3 h-0.5 rounded-full animate-scan-move"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,112,67,0.8), transparent)' }} />
                        </div>
                        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest text-center max-w-[140px]">
                            Apresente na entrada ou escanear nas atividades
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 sm:px-8 pb-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowCheckInModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-black text-xs uppercase tracking-wider text-white transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg,#ff7043,#ff4035)', boxShadow: '0 4px 16px rgba(255,112,67,0.35)' }}
                    >
                        <QrCode className="h-4 w-4" />Check-in com QR Code
                    </button>
                    <button
                        onClick={() => generateTicketPDF(myRegistration, selectedProject?.name || 'Growth Experience')}
                        className="flex items-center justify-center gap-2 h-12 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
                    >
                        <Download className="h-4 w-4" />Baixar PDF
                    </button>
                </div>
            </motion.div>

            {/* ── UPGRADE CARD (if free) ─────────────────────────────── */}
            {!isPro && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden rounded-[2rem] p-6 cursor-pointer group"
                    style={{ background: 'linear-gradient(135deg, rgba(255,112,67,0.1) 0%, rgba(255,64,53,0.05) 100%)', border: '1px solid rgba(255,112,67,0.2)' }}
                    onClick={() => setShowUpgradeModal(true)}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-brand-orange-coral/15 to-transparent rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,#ff7043,#ff4035)', boxShadow: '0 8px 24px rgba(255,112,67,0.4)' }}>
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-orange-coral/70 mb-1">Acesso Premium</p>
                            <h3 className="text-foreground font-black text-base uppercase italic leading-tight">
                                Faça Upgrade para Night Experience
                            </h3>
                            <p className="text-foreground/40 text-[10px] mt-1">Palestras noturnas, mentorias VIP e muito mais</p>
                        </div>
                        <div className="text-brand-orange-coral group-hover:translate-x-1 transition-transform shrink-0">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
