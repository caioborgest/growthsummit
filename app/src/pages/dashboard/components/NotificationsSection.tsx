import React, { useMemo } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    actionUrl?: string;
    createdAt: string;
}

interface NotificationsSectionProps {
    notifications: Notification[];
    onRefresh: () => void;
}

const typeConfig = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
};

// URL Regex for link parsing
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function NotificationsSection({ notifications, onRefresh }: NotificationsSectionProps) {
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            if (unreadIds.length === 0) return;

            const { error } = await (supabase as any).from('notifications').update({
                read: true,
                read_at: new Date().toISOString()
            }).in('id', unreadIds);

            if (error) throw error;
            toast.success('Todas as notificações foram lidas.');
            onRefresh();
        } catch (err) {
            toast.error('Erro ao marcar como lidas.');
        }
    };

    const handleRead = async (id: string, url?: string) => {
        try {
            const { error } = await (supabase as any).from('notifications').update({
                read: true,
                read_at: new Date().toISOString()
            }).eq('id', id);

            if (error) throw error;
            onRefresh();

            if (url) {
                if (url.startsWith('http')) {
                    window.open(url, '_blank');
                } else {
                    window.location.href = url;
                }
            }
        } catch (err) {
            // Silently fail if just marking read
        }
    };

    const parseMessage = (text: string) => {
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
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Minha Central</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Alertas e avisos importantes do evento</p>
                </div>
                {unreadCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest hover:bg-brand-orange-coral/10 h-8"
                    >
                        Lertudo
                    </Button>
                )}
            </div>

            {/* List */}
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif, i) => {
                        const config = typeConfig[notif.type] || typeConfig.info;
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleRead(notif.id)}
                                className={`group glass-card p-5 rounded-[2rem] border transition-all cursor-pointer ${
                                    !notif.read 
                                        ? 'bg-white/5 border-brand-orange-coral/30 shadow-[0_4px_20px_rgba(255,112,67,0.1)]' 
                                        : 'bg-white/[0.02] border-white/5 opacity-80'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0 border ${config.border}`}>
                                        <Icon className={`h-6 w-6 ${config.color}`} />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`text-sm font-black italic uppercase leading-none ${!notif.read ? 'text-white' : 'text-gray-400'}`}>
                                                {notif.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-brand-orange-coral rounded-full animate-pulse" />
                                                )}
                                                <span className="text-[9px] text-gray-500 font-bold uppercase whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-xs leading-relaxed mb-4">
                                            {parseMessage(notif.message)}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {notif.type === 'success' && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[8px] font-black uppercase px-2">
                                                        Sistema
                                                    </Badge>
                                                )}
                                                {notif.type === 'warning' && (
                                                    <Badge className="bg-amber-500/10 text-amber-400 border-none text-[8px] font-black uppercase px-2">
                                                        Urgente
                                                    </Badge>
                                                )}
                                            </div>

                                            {notif.actionUrl && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRead(notif.id, notif.actionUrl);
                                                    }}
                                                    className="flex items-center gap-2 text-[10px] font-black text-brand-orange-coral uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                                                >
                                                    Acessar Link <ExternalLink className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center glass-card rounded-[3rem] border-dashed border-white/10">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="h-10 w-10 text-gray-600" />
                        </div>
                        <h3 className="text-white font-black text-xl italic uppercase">Zen Habit</h3>
                        <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Nenhuma notificação por enquanto.</p>
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="glass-card p-6 rounded-[2.5rem] bg-gradient-to-r from-brand-orange-coral/10 to-transparent border-white/5 mt-8">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white italic uppercase">Mantenha-se Atualizado</h4>
                        <p className="text-gray-500 text-[11px] leading-tight mt-1">
                            Ative as notificações do sistema em seu navegador para receber alertas em tempo real durante o evento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
