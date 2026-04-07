import { Bell, Clock, CheckCircle2, ChevronRight, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface NextActivityCardProps {
    title: string;
    subtitle: string;
    time: string;
    duration: string;
    isConfirmed?: boolean;
    onClick?: () => void;
    icon?: LucideIcon;
}

export function NextActivityCard({
    title,
    subtitle,
    time,
    duration,
    isConfirmed = false,
    onClick,
    icon: Icon = Bell
}: NextActivityCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClick}
            className="mx-4 sm:mx-6 cursor-pointer group"
        >
            <div
                className="relative overflow-hidden rounded-[2rem] p-6 sm:p-7 transition-all duration-300 group-hover:scale-[1.01] group-active:scale-[0.99]"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,112,67,0.1) 0%, rgba(255,64,53,0.05) 100%)',
                    border: '1px solid rgba(255,112,67,0.2)'
                }}
            >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange-coral/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

                {/* Top accent line */}
                <div
                    className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,112,67,0.6), transparent)' }}
                />

                <div className="relative z-10 space-y-4">
                    {/* Label */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand-orange-coral">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </motion.div>
                            <span className="font-black text-[9px] uppercase tracking-[0.25em]">Próxima Atividade</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-brand-orange-coral group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Title & subtitle */}
                    <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-black text-foreground leading-tight tracking-tight line-clamp-2">
                            {title}
                        </h3>
                        <p className="text-foreground/50 text-xs font-medium line-clamp-1">
                            {subtitle}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2.5">
                            <div
                                className="rounded-xl px-3 py-1.5 flex items-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #ff7043, #ff4035)', boxShadow: '0 4px 12px rgba(255,112,67,0.3)' }}
                            >
                                <Clock className="h-3 w-3 text-white/80" />
                                <span className="text-white font-black text-xs">{time}</span>
                            </div>
                            <span className="text-foreground/40 font-bold text-xs">{duration}</span>
                        </div>

                        {isConfirmed ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Confirmado
                            </Badge>
                        ) : (
                            <Badge
                                className="font-black text-[9px] uppercase tracking-widest px-2.5 py-1 text-white border-none animate-pulse"
                                style={{ background: 'rgba(255,112,67,0.2)', border: '1px solid rgba(255,112,67,0.3)' }}
                            >
                                Confirmar ›
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
