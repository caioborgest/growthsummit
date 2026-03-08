import React from 'react';
import { User, Bell, LogOut, HelpCircle, Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface PremiumHeaderProps {
    userName?: string;
    userAvatar?: string;
    projectName?: string;
    roleLabel: string;
    isPro?: boolean;
    isActuallyPaid?: boolean;
    statusFinanceiro?: { label: string };
    notifications: any[];
    onLogout: () => void;
    onGuideClick: () => void;
    onNotificationRead: (id: string) => void;
}

export function PremiumHeader({
    userName,
    userAvatar,
    projectName,
    roleLabel,
    isPro,
    isActuallyPaid,
    statusFinanceiro,
    notifications,
    onLogout,
    onGuideClick,
    onNotificationRead
}: PremiumHeaderProps) {
    const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative">
            {/* Top Utility Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-0.5">Growth Summit</span>
                    <span className="text-white/40 font-bold text-[9px] uppercase tracking-widest">{projectName || 'Growth Experience 2026'}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onGuideClick}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 h-8 px-3 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 border border-white/5"
                    >
                        <HelpCircle className="h-3 w-3" /> GUIA
                    </button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="relative bg-white/5 hover:bg-white/10 text-gray-400 h-8 w-8 flex items-center justify-center rounded-full transition-all border border-white/5">
                                <Bell className="h-3.5 w-3.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-dark-200 border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <h3 className="text-white font-bold text-sm">Notificações</h3>
                                <Badge className="bg-teal-500/10 text-teal-400 text-[9px] font-black border-none px-2 h-5">
                                    {unreadCount} NOVAS
                                </Badge>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => onNotificationRead(n.id)}
                                        className={`p-3 rounded-xl border transition-all cursor-pointer ${n.read || n.isRead ? 'bg-white/5 border-transparent' : 'bg-orange-500/5 border-orange-500/20'}`}
                                    >
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <p className="text-white text-[11px] font-bold leading-tight">{n.title}</p>
                                            <span className="text-[8px] text-gray-500 font-bold">{n.time || (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '')}</span>
                                        </div>
                                        <p className="text-gray-400 text-[10px] leading-tight opacity-70">{n.message}</p>
                                    </div>
                                )) : (
                                    <p className="text-center py-4 text-gray-600 text-[10px] font-bold uppercase">Nenhuma notificação</p>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <button
                        onClick={onLogout}
                        className="bg-red-500/5 hover:bg-red-500/10 text-red-400 h-8 w-8 flex items-center justify-center rounded-full transition-all border border-red-500/10"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                {/* Primary Info */}
                <div className="flex items-center gap-6">
                    <div className="relative group/avatar">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-[2rem] bg-gradient-to-br from-orange-500/30 to-orange-500/5 p-1 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden transition-all duration-500 group-hover/avatar:shadow-orange-500/20 group-hover/avatar:scale-[1.02]">
                            <div className="w-full h-full bg-dark-400 rounded-[1.8rem] flex items-center justify-center overflow-hidden relative">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                                ) : (
                                    <div className="text-3xl md:text-4xl font-black text-orange-400 drop-shadow-lg group-hover/avatar:scale-110 transition-transform duration-500">
                                        {userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || <User className="h-10 w-10" />}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-dark-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] z-10"></div>
                            </div>
                        </div>
                        {/* Shine Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-teal-500/20 rounded-[2.2rem] opacity-0 group-hover/avatar:opacity-100 blur transition-opacity -z-10"></div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-3 italic">
                                {userName?.split(' ')[0] || 'Bem-vindo'}
                                <span className="text-orange-500 not-italic">.</span>
                            </h1>
                            <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] opacity-60">
                                {userName || roleLabel}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest flex items-center gap-1.5 ${isPro
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                }`}>
                                {isPro ? <Moon className="h-2.5 w-2.5" /> : <Sun className="h-2.5 w-2.5" />}
                                {isPro ? 'Exp. Pro' : 'Free Morning'}
                            </Badge>

                            {isPro && (
                                <Badge className={`px-2.5 py-1 text-[9px] font-black border uppercase tracking-widest ${isActuallyPaid
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                    : 'bg-orange-500/5 text-orange-500 border-orange-500/20'
                                    }`}>
                                    {isActuallyPaid ? 'Acesso Ativo' : 'Pagamento Pendente'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
