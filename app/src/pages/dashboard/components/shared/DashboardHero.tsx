import React from 'react';
import { Users, Calendar, Zap } from 'lucide-react';

interface StatItemProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
    return (
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-3 sm:p-4 min-h-[100px] text-center">
            <div className="text-brand-orange-coral mb-2">
                {icon}
            </div>
            <span className="text-white font-black text-xs sm:text-lg tracking-tight leading-tight mb-1 break-words w-full px-1">{value}</span>
            <span className="text-gray-500 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
    );
}

interface DashboardHeroProps {
    eventName?: string;
    location?: string;
    date?: string;
    stats?: {
        people: string;
        content: string;
        activities: string;
    };
}

export function PwaDashboardHero({
    eventName = "Growth Experience",
    location = "Triunfo-PE",
    date = "16 ABR 2026",
    stats = { people: "500+", content: "12h", activities: "20+" }
}: DashboardHeroProps) {
    return (
        <div className="pt-8 px-6 pb-4 space-y-8">
            {/* Logo and branding */}
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF8E53] to-[#FE6B8B] rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(255,142,83,0.3)] shrink-0">
                    <span className="text-white font-black text-3xl italic">GE</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight leading-tight uppercase italic flex flex-col">
                        {eventName}
                        <span className="text-brand-orange-coral not-italic text-lg">{location}</span>
                    </h1>
                </div>
            </div>

            {/* Date Pill */}
            <div className="inline-flex items-center gap-2 bg-brand-orange-coral/10 border border-brand-orange-coral/30 px-5 py-2 rounded-full">
                <Calendar className="h-4 w-4 text-brand-orange-coral" />
                <span className="text-brand-orange-coral font-black text-xs uppercase tracking-widest">{date}</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <StatItem
                    icon={<Users className="h-6 w-6" />}
                    value={stats.people}
                    label="Pessoas"
                />
                <StatItem
                    icon={<Calendar className="h-6 w-6" />}
                    value={stats.content}
                    label="Conteúdo"
                />
                <StatItem
                    icon={<Zap className="h-6 w-6" />}
                    value={stats.activities}
                    label="Atividades"
                />
            </div>
        </div>
    );
}
