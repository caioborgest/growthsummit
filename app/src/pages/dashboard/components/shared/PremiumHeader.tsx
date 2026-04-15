import React from 'react';
import { Bell, LogOut, Sun, Star, Headset, Moon } from 'lucide-react';
import { useOutdoorTheme } from '@/hooks/useOutdoorTheme';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumHeaderProps {
    userName?: string;
    userAvatar?: string;
    projectName?: string;
    roleLabel: string;
    isPro?: boolean;
    isActuallyPaid?: boolean;
    checkedIn?: boolean;
    notifications: any[];
    onLogout: () => void;
    onGuideClick: () => void;
    onSupportClick: () => void;
    onNotificationsClick?: () => void;
    onNotificationRead: (id: string) => void;
}

export function PremiumHeader({
    userName,
    userAvatar,
    projectName,
    roleLabel,
    isPro,
    isActuallyPaid,
    checkedIn,
    notifications,
    onLogout,
    onGuideClick,
    onSupportClick,
    onNotificationsClick,
    onNotificationRead
}: PremiumHeaderProps) {
    const unreadCount = (notifications || []).filter(n => n && !n.read && !n.isRead).length;
    const { isOutdoor, toggle: toggleOutdoor } = useOutdoorTheme();
    const { theme, toggleTheme } = useTheme();

    const initials = userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    // URL Regex for link parsing
    const URL_REGEX = /(https?:\/\/[^\s]+)/g;

    const parseMessage = (text: string) => {
        if (!text) return '';
        return text.split(URL_REGEX).map((part, i) => {
            if (part.match(URL_REGEX)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-orange-coral underline font-bold break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-safe-top relative">
            {/* ── TOP UTILITY BAR ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between py-4">
                {/* Brand */}
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2.5"
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                        <img src="https://xeuqtxxhncvechrxerqw.supabase.co/storage/v1/object/public/logos/favicon.png" alt="Growth Experience" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,112,67,0.5)]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-orange-coral uppercase tracking-[0.25em] leading-none">
                            Growth Experience
                        </span>
                        <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest leading-none mt-0.5">
                            {projectName || '2026'}
                        </span>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-1.5"
                >
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`h-8 w-8 flex items-center justify-center rounded-full transition-all border ${
                            theme === 'light'
                                ? 'bg-amber-100 border-amber-300 text-amber-600'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-amber-300 hover:bg-amber-500/10'
                        }`}
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    >
                        <motion.div
                            key={theme}
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ duration: 0.3, type: 'spring' }}
                        >
                            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                        </motion.div>
                    </button>



                    {/* Support */}
                    <button
                        onClick={onSupportClick}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-orange-coral/10 hover:bg-brand-orange-coral/20 text-brand-orange-coral transition-all border border-brand-orange-coral/20"
                        title="Abrir Suporte"
                    >
                        <Headset className="h-3.5 w-3.5" />
                    </button>

                    {/* Notifications */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="relative h-8 w-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
                                <Bell className="h-3.5 w-3.5" />
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-brand-orange-coral to-brand-orange-intense rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,112,67,0.6)]"
                                        >
                                            <span className="text-[8px] text-white font-black">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-card/90 backdrop-blur-2xl border-white/10 p-4 rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                <h3 className="text-foreground font-bold text-sm">Notificações</h3>
                                <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral text-[9px] font-black border-none px-2 h-5">
                                    {unreadCount} NOVAS
                                </Badge>
                            </div>
                            <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => onNotificationRead(n.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                            n.read || n.isRead
                                                ? 'bg-white/3 border-transparent'
                                                : 'bg-brand-orange-coral/5 border-brand-orange-coral/20 hover:bg-brand-orange-coral/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className="text-foreground text-[11px] font-bold leading-tight">{n.title}</p>
                                            <span className="text-[8px] text-foreground/40 font-bold shrink-0">{n.time}</span>
                                        </div>
                                        <p className="text-foreground/50 text-[10px] leading-tight mt-1">{parseMessage(n.message)}</p>
                                    </div>
                                )) : (
                                    <p className="text-center py-6 text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                                        🎉 Tudo em dia!
                                    </p>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-white/5 text-center">
                                    <button
                                        onClick={() => {
                                            // Close popover and navigate (or set tab)
                                            // The parent should handle the tab change if we are in Dashboard
                                            // Or we just use a generic 'onNavigate' if available, but for now we expect the user to click
                                            (document.activeElement as HTMLElement)?.blur(); // Close popover hack
                                            onNotificationsClick && onNotificationsClick();
                                        }}
                                        className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest hover:underline"
                                    >
                                        Ver todas as notificações
                                    </button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500/5 hover:bg-red-500/15 text-red-400/70 hover:text-red-400 transition-all border border-red-500/10"
                        title="Sair"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </motion.div>
            </div>

            {/* ── PROFILE SECTION ──────────────────────────────────────────── */}
            <div className="flex items-center gap-5 pb-8 pt-2">
                {/* Avatar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: 'spring', bounce: 0.3 }}
                    className="relative shrink-0"
                >
                    {/* Animated ring */}
                    <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-br from-[#ff7043] to-[#ff4035] animate-spin-slow opacity-60 blur-sm scale-110" />
                    <div className="relative w-[72px] h-[72px] md:w-24 md:h-24 rounded-[1.8rem] overflow-hidden border-2 border-white/10 shadow-2xl">
                        {userAvatar ? (
                            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#ff7043]/30 to-[#0c0e12] flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-black text-brand-orange-coral drop-shadow-lg">
                                    {initials || '?'}
                                </span>
                            </div>
                        )}
                        {/* Online indicator */}
                        <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 border-2 border-card rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    </div>
                </motion.div>

                {/* User info */}
                <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 min-w-0"
                >
                    <div className="flex items-baseline gap-1.5 mb-1">
                        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter italic leading-none truncate">
                            {userName?.split(' ')[0] || 'Bem-vindo'}
                        </h1>
                        <span className="text-brand-orange-coral font-black text-2xl leading-none">.</span>
                    </div>
                    <p className="text-foreground/40 font-bold uppercase text-[9px] tracking-[0.2em] truncate mb-2.5">
                        {userName || roleLabel}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                        {roleLabel.includes('MENTOR') ? (
                            <Badge className="px-2.5 py-1 text-[9px] font-black border-none uppercase tracking-widest flex items-center gap-1 bg-gradient-to-r from-[#ff7043] to-[#ff4035] text-white shadow-[0_0_12px_rgba(255,112,67,0.4)]">
                                <Star className="h-2.5 w-2.5 fill-current" />
                                Mentor Oficial
                            </Badge>
                        ) : (
                            <>
                                <Badge className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest flex items-center gap-1 ${
                                    isPro
                                        ? 'bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/25'
                                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                }`}>
                                    {isPro ? <Moon className="h-2.5 w-2.5" /> : <Sun className="h-2.5 w-2.5" />}
                                    {isPro ? 'Exp. Pro' : (projectName?.toLowerCase().includes('triunfo') ? 'Exp. Night' : 'Free Morning')}
                                </Badge>

                                {isPro && isActuallyPaid !== undefined && (
                                    <Badge className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest ${
                                        isActuallyPaid
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                        {isActuallyPaid ? '✓ Acesso Ativo' : '⏳ Pendente'}
                                    </Badge>
                                )}

                                {checkedIn && (
                                    <Badge className="px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        ✓ Presença Confirmada
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
