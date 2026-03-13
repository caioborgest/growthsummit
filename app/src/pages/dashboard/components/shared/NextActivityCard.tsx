import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NextActivityCardProps {
    title: string;
    subtitle: string;
    time: string;
    duration: string;
    isConfirmed?: boolean;
    onClick?: () => void;
}

export function NextActivityCard({
    title,
    subtitle,
    time,
    duration,
    isConfirmed = false,
    onClick
}: NextActivityCardProps) {
    return (
        <div 
            onClick={onClick}
            className="mx-6 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-2 text-brand-orange-coral">
                <Bell className="h-4 w-4" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">Próximo</span>
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white leading-tight tracking-tight">
                    {title}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-orange-coral rounded-xl px-3 py-2 flex items-center justify-center">
                        <span className="text-white font-black text-sm">{time}</span>
                    </div>
                    <span className="text-gray-500 font-bold text-xs">{duration}</span>
                </div>

                {isConfirmed && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-widest px-3 py-1">
                        Confirmado
                    </Badge>
                )}
            </div>
        </div>
    );
}
