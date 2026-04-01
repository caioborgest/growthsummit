import React from 'react';
import { Rocket, Handshake, Share2, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface QuickActionCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
    colorFrom: string;
    colorTo: string;
    glowColor: string;
    badge?: string;
    delay?: number;
}

function QuickActionCard({ icon, title, subtitle, onClick, colorFrom, colorTo, glowColor, badge, delay = 0 }: QuickActionCardProps) {
    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClick}
            className="group relative flex items-center gap-4 p-5 rounded-[1.75rem] overflow-hidden text-left w-full transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98]"
            style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)'
            }}
        >
            {/* Hover background */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[1.75rem]"
                style={{ background: `linear-gradient(135deg, ${colorFrom}18 0%, transparent 70%)` }}
            />

            {/* Icon */}
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 relative transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                style={{
                    background: `linear-gradient(135deg, ${colorFrom}30, ${colorTo}20)`,
                    border: `1px solid ${colorFrom}30`
                }}
            >
                <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
                    style={{ background: `${colorFrom}40` }}
                />
                <div className="relative z-10" style={{ color: colorFrom }}>
                    {icon}
                </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-foreground font-black text-sm uppercase tracking-tight italic leading-none">
                        {title}
                    </h4>
                    {badge && (
                        <span
                            className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none"
                            style={{ background: `${colorFrom}20`, color: colorFrom, border: `1px solid ${colorFrom}30` }}
                        >
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
            </div>

            {/* Arrow */}
            <ChevronRight
                className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1 shrink-0"
                style={{ color: 'var(--text-muted)' }}
            />
        </motion.button>
    );
}

interface QuickActionsProps {
    onStartupClick: () => void;
    onB2BClick: () => void;
    onMentoriaClick?: () => void;
    showMentoria?: boolean;
    showStartup?: boolean;
    showB2B?: boolean;
}

export function QuickActions({
    onStartupClick,
    onB2BClick,
    onMentoriaClick,
    showMentoria = false,
    showStartup = false,
    showB2B = false
}: QuickActionsProps) {
    const handleShare = async () => {
        const shareData = {
            title: 'Growth Experience Triunfo 2026',
            text: 'Vem comigo para o maior evento de Growth e Negócios do Triunfo! 🚀',
            url: window.location.origin
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success('Link copiado para a área de transferência!');
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    };

    return (
        <div className="space-y-2.5 mt-6">
            <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.25em] px-1 mb-3">
                Ações Rápidas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {showB2B && (
                    <QuickActionCard
                        icon={<Handshake className="h-5 w-5" />}
                        title="Rodada Negócios"
                        subtitle="Matchmaking B2B"
                        onClick={onB2BClick}
                        colorFrom="#14b8a6"
                        colorTo="#0d9488"
                        glowColor="rgba(20,184,166,0.4)"
                        delay={0}
                    />
                )}
                {showStartup && (
                    <QuickActionCard
                        icon={<Rocket className="h-5 w-5" />}
                        title="Expo StartUp"
                        subtitle="Inscrição Arena"
                        onClick={onStartupClick}
                        colorFrom="#ff7043"
                        colorTo="#ff4035"
                        glowColor="rgba(255,112,67,0.4)"
                        badge="NOVO"
                        delay={0.05}
                    />
                )}
                {showMentoria && onMentoriaClick && (
                    <QuickActionCard
                        icon={<Sparkles className="h-5 w-5" />}
                        title="Mentoria VIP"
                        subtitle="Agendar Sessão"
                        onClick={onMentoriaClick}
                        colorFrom="#ff7043"
                        colorTo="#ff4035"
                        glowColor="rgba(255,112,67,0.4)"
                        badge="VIP"
                        delay={0.1}
                    />
                )}
                <QuickActionCard
                    icon={<Share2 className="h-5 w-5" />}
                    title="Indicar Evento"
                    subtitle="Growth Experience"
                    onClick={handleShare}
                    colorFrom="#a78bfa"
                    colorTo="#7c3aed"
                    glowColor="rgba(167,139,250,0.4)"
                    delay={0.15}
                />
            </div>
        </div>
    );
}
