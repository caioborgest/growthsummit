import { useMemo } from 'react';
import { Trophy, QrCode, Timer, CheckCircle2, Star, Gift, Ticket, Zap } from 'lucide-react';
import { useRaffles, useInscricoes } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface RaffleSectionProps {
    registrationId: string;
    setIsScanOpen: (open: boolean) => void;
}

export function RaffleSection({ registrationId, setIsScanOpen }: RaffleSectionProps) {
    const { projectId } = useProject();
    const { data: raffles, isLoading } = useRaffles();
    const { data: inscricoes } = useInscricoes();

    const activeRaffles = useMemo(() =>
        (raffles || []).filter(r => r.projectId === projectId && r.status === 'open'),
    [raffles, projectId]);

    const completedRaffles = useMemo(() =>
        (raffles || []).filter(r => r.projectId === projectId && r.status === 'completed'),
    [raffles, projectId]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1,2].map(i => (
                    <div key={i} className="h-36 rounded-[2rem] skeleton" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-foreground italic tracking-tight flex items-center gap-3">
                    <Gift className="h-7 w-7 text-brand-orange-coral" />
                    Sorteios &amp; <span className="text-gradient">Prêmios</span>
                </h2>
                <p className="text-foreground/40 text-sm mt-1">Participe das dinâmicas em tempo real e concorra a prêmios exclusivos.</p>
            </div>

            {/* Active raffles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em]">Acontecendo Agora</p>
                    <Badge className="bg-brand-orange-coral text-white border-none text-[9px] font-black animate-pulse px-2.5">AO VIVO</Badge>
                </div>

                {activeRaffles.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {activeRaffles.map((raffle, idx) => (
                                <motion.div
                                    key={raffle.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative overflow-hidden rounded-[2rem] p-6 group"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,112,67,0.1), rgba(255,64,53,0.05))',
                                        border: '1px solid rgba(255,112,67,0.25)'
                                    }}
                                >
                                    {/* Animated top line */}
                                    <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full"
                                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,112,67,0.7), transparent)' }} />

                                    <div className="absolute top-4 right-4">
                                        <Zap className="h-5 w-5 text-brand-orange-coral animate-sparkle" />
                                    </div>

                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg,#ff7043,#ff4035)', boxShadow: '0 8px 20px rgba(255,112,67,0.4)' }}>
                                            <Trophy className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-foreground font-black text-base uppercase italic leading-tight">{raffle.name}</h4>
                                            <p className="text-foreground/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                <Timer className="h-2.5 w-2.5" />Participe até o sorteio
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-foreground/50 leading-relaxed mb-5">
                                        {raffle.description || 'Fique atento ao telão para as instruções de participação!'}
                                    </p>

                                    {raffle.type === 'realtime_qr' ? (
                                        <button 
                                            onClick={() => setIsScanOpen(true)}
                                            className="w-full text-center p-4 rounded-2xl border border-dashed transition-all hover:border-brand-orange-coral/50 hover:bg-brand-orange-coral/10 group/scan"
                                            style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
                                            <QrCode className="h-6 w-6 text-brand-orange-coral mx-auto mb-2 group-hover/scan:scale-110 transition-transform" />
                                            <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Escanear QR Code no Telão</p>
                                            <p className="text-[8px] text-foreground/30 font-bold mt-1 uppercase">Clique para abrir a câmera</p>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 p-4 rounded-2xl"
                                            style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)' }}>
                                            <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Check-in Stand</p>
                                                <p className="text-[8px] text-foreground/40 font-bold uppercase mt-0.5">Visite o stand para participar</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-16 text-center rounded-[2.5rem] border border-dashed" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
                        <Timer className="h-10 w-10 mx-auto mb-4 text-foreground/15" />
                        <p className="text-foreground/30 font-black uppercase text-[10px] tracking-[0.25em]">Aguardando o próximo sorteio...</p>
                        <p className="text-foreground/20 text-[9px] mt-2 font-bold uppercase">Fique atento aos anúncios no palco</p>
                    </div>
                )}
            </div>

            {/* Past winners */}
            {completedRaffles.length > 0 && (
                <div className="space-y-4">
                    <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.25em]">Últimos Ganhadores</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedRaffles.map((raffle, i) => {
                            const winner = inscricoes.find(x => x.id === raffle.winnerRegistrationId);
                            const isMe = winner?.id === registrationId;
                            return (
                                <motion.div
                                    key={raffle.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    className="relative overflow-hidden rounded-[1.75rem] p-5"
                                    style={{
                                        background: isMe ? 'rgba(20,184,166,0.08)' : 'var(--surface-1)',
                                        border: `1px solid ${isMe ? 'rgba(20,184,166,0.25)' : 'var(--border-subtle)'}`,
                                    }}
                                >
                                    {isMe && (
                                        <div className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-2xl text-[8px] font-black uppercase text-white tracking-widest"
                                            style={{ background: 'linear-gradient(135deg,#14b8a6,#0d9488)' }}>
                                            Você Ganhou! 🎉
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                            style={{ background: isMe ? 'rgba(20,184,166,0.15)' : 'var(--surface-2)' }}>
                                            <Star className={`h-4 w-4 ${isMe ? 'text-teal-400 fill-teal-400' : 'text-foreground/30'}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-foreground font-black text-xs uppercase truncate leading-none">{raffle.name}</p>
                                            <p className="text-foreground/30 text-[8px] font-black uppercase mt-0.5">Sorteio Finalizado</p>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-2xl" style={{ background: 'var(--surface-1)', border: isMe ? '1px solid rgba(20,184,166,0.15)' : '1px solid var(--border-subtle)' }}>
                                        <p className="text-[8px] text-foreground/30 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                            <Trophy className="h-2.5 w-2.5 text-brand-orange-coral" />Ganhador Sortudo
                                        </p>
                                        <p className={`font-black uppercase italic ${isMe ? 'text-teal-400 text-base' : 'text-foreground text-sm'}`}>
                                            {winner?.nome || '—'}
                                        </p>
                                        {isMe && <p className="text-[8px] text-teal-500/70 font-bold mt-1 uppercase">Vá até o Balcão de Prêmios</p>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tip card */}
            <div className="rounded-[2rem] p-6 flex items-start gap-4" style={{ background: 'rgba(255,112,67,0.07)', border: '1px solid rgba(255,112,67,0.15)' }}>
                <div className="w-11 h-11 rounded-[1rem] flex items-center justify-center shrink-0" style={{ background: 'rgba(255,112,67,0.15)' }}>
                    <Ticket className="h-5 w-5 text-brand-orange-coral" />
                </div>
                <div>
                    <h5 className="text-foreground font-black uppercase italic text-sm mb-1.5">Dica de Sucesso</h5>
                    <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                        Mantenha o PWA aberto durante as palestras. Quando o host anunciar um sorteio, aponte sua câmera para o telão e garanta sua participação instantânea.
                    </p>
                </div>
            </div>
        </div>
    );
}
