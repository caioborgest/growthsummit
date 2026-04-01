import React, { useEffect, useState } from 'react';
import { Users, Calendar, TrendingUp, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatItemProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    delay?: number;
}

function StatItem({ icon, value, label, delay = 0 }: StatItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center justify-center rounded-[1.5rem] p-3 sm:p-4 min-h-[88px] text-center overflow-hidden group"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
        >
            {/* Glow hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange-coral/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.5rem]" />
            <div className="text-brand-orange-coral mb-1.5 relative z-10">
                {icon}
            </div>
            <span className="text-foreground font-black text-sm sm:text-base tracking-tight leading-tight mb-0.5 relative z-10 break-words w-full px-1">
                {value}
            </span>
            <span className="text-foreground/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest relative z-10">
                {label}
            </span>
        </motion.div>
    );
}

// ── Countdown ──────────────────────────────────────────────────────────────
interface CountdownUnit {
    value: string;
    label: string;
}

function CountdownBlock({ value, label }: CountdownUnit) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl text-foreground shadow-inner"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border-medium)' }}
                >
                    {value}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                </div>
            </div>
            <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider mt-1">{label}</span>
        </div>
    );
}

function useCountdown(targetDateStr?: string) {
    const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00', passed: false });

    useEffect(() => {
        if (!targetDateStr) return;
        const target = new Date(targetDateStr).getTime();

        const tick = () => {
            const diff = target - Date.now();
            if (diff <= 0) {
                setTimeLeft({ d: '00', h: '00', m: '00', s: '00', passed: true });
                return;
            }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft({
                d: String(d).padStart(2, '0'),
                h: String(h).padStart(2, '0'),
                m: String(m).padStart(2, '0'),
                s: String(s).padStart(2, '0'),
                passed: false
            });
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDateStr]);

    return timeLeft;
}

// ── Main Component ─────────────────────────────────────────────────────────
interface DashboardHeroProps {
    eventName?: string;
    location?: string;
    date?: string;
    eventDate?: string; // ISO string para countdown
    stats?: {
        people: string;
        content: string;
        activities: string;
    };
}

export function PwaDashboardHero({
    eventName = 'Growth Experience',
    location = 'Triunfo-PE',
    date = '16 ABR 2026',
    eventDate,
    stats = { people: '300+', content: '5h+', activities: '10+' }
}: DashboardHeroProps) {
    const countdown = useCountdown(eventDate);

    return (
        <div className="px-4 sm:px-6 pb-2 space-y-5">
            {/* ── HERO BANNER ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[2rem] p-6"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,112,67,0.15) 0%, rgba(255,64,53,0.08) 50%, rgba(12,14,18,0) 100%)',
                    border: '1px solid rgba(255,112,67,0.2)'
                }}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-orange-coral/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-orange-intense/10 rounded-full blur-2xl pointer-events-none" />

                {/* Logo + Name */}
                <div className="relative z-10 flex items-center gap-4 mb-5">
                    <motion.div
                        animate={{ boxShadow: ['0 0 20px rgba(255,112,67,0.3)', '0 0 40px rgba(255,112,67,0.55)', '0 0 20px rgba(255,112,67,0.3)'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 overflow-hidden bg-white/5"
                    >
                        <img 
                            src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" 
                            alt="Logo" 
                            className="w-12 h-12 object-contain"
                        />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-[9px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,112,67,0.15)', color: '#ff7043', border: '1px solid rgba(255,112,67,0.25)' }}
                            >
                                2026
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-tight uppercase italic">
                            {eventName}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3 w-3 text-brand-orange-coral" />
                            <span className="text-brand-orange-coral font-bold text-xs">{location}</span>
                            <span className="text-foreground/20 text-xs">•</span>
                            <Calendar className="h-3 w-3 text-foreground/40" />
                            <span className="text-foreground/50 font-bold text-xs">{date}</span>
                        </div>
                    </div>
                </div>

                {/* Countdown */}
                {eventDate && (
                    <div className="relative z-10">
                        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {countdown.passed ? 'Evento em andamento!' : 'Contagem regressiva'}
                        </p>
                        {!countdown.passed ? (
                            <div className="flex items-end gap-2">
                                <CountdownBlock value={countdown.d} label="Dias" />
                                <span className="text-brand-orange-coral font-black text-xl mb-5 animate-bounce-subtle">:</span>
                                <CountdownBlock value={countdown.h} label="Horas" />
                                <span className="text-brand-orange-coral font-black text-xl mb-5 animate-bounce-subtle">:</span>
                                <CountdownBlock value={countdown.m} label="Min" />
                                <span className="text-brand-orange-coral font-black text-xl mb-5 animate-bounce-subtle">:</span>
                                <CountdownBlock value={countdown.s} label="Seg" />
                            </div>
                        ) : (
                            <div
                                className="px-4 py-2 rounded-xl font-black text-sm text-white inline-flex items-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #ff7043, #ff4035)' }}
                            >
                                🎉 O evento já começou!
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* ── STATS ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-2.5">
                <StatItem icon={<Users className="h-5 w-5" />} value={stats.people} label="Pessoas" delay={0.1} />
                <StatItem icon={<Calendar className="h-5 w-5" />} value={stats.content} label="Conteúdo" delay={0.2} />
                <StatItem icon={<TrendingUp className="h-5 w-5" />} value={stats.activities} label="Atividades" delay={0.3} />
            </div>
        </div>
    );
}
