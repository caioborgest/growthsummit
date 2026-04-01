import { QrCode, Calendar as CalendarIcon, Sun, Moon, MapPin, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface AgendaSession {
    id: string;
    title?: string;
    titulo?: string;
    startTime?: string;
    horario_inicio?: string;
    endTime?: string;
    horario_fim?: string;
    room?: string;
    local?: string;
    type?: string;
    tipo?: string;
    category?: string;
    color?: string;
    description?: string;
}

interface AgendaSectionProps {
    myRegistration: { id: string; nome?: string; palestrasNoturnas?: boolean } | null;
    isActuallyPaid?: boolean;
    onUpgradeClick?: () => void;
    cursosSelecionados: AgendaSession[];
    myMentorships?: Array<{
        id: string;
        mentorName: string;
        scheduledAt: string;
        status: string;
        category?: string;
    }>;
    setIsSelfCheckInOpen: (open: boolean) => void;
    navigate: (path: string) => void;
    selectedProject?: any;
    activityCheckIns?: Array<{ sessionId: string; registrationId: string; checkInAt?: string }>;
    onSessionClick?: (session: AgendaSession) => void;
    allSessions?: AgendaSession[];
}

export function AgendaSection({
    myRegistration,
    isActuallyPaid,
    onUpgradeClick,
    cursosSelecionados,
    myMentorships = [],
    setIsSelfCheckInOpen,
    navigate,
    activityCheckIns = [],
    onSessionClick,
    allSessions = [],
    selectedProject
}: AgendaSectionProps) {
    const isTriunfo = selectedProject?.slug?.includes('triunfo');
    const mappedMentorships = myMentorships
        .filter(m => m.status === 'scheduled' || m.status === 'completed')
        .map(m => {
            const date = new Date(m.scheduledAt);
            const startTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const endDate = new Date(date.getTime() + 20 * 60000);
            const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            return {
                ...m, id: m.id,
                title: `Mentoria: ${m.mentorName}`, titulo: `Mentoria: ${m.mentorName}`,
                startTime, horario_inicio: startTime, endTime, horario_fim: endTime,
                room: 'Sala de Mentorias', local: 'Sala de Mentorias',
                type: 'MENTORIA', tipo: 'MENTORIA',
                category: date.getHours() < 13 ? 'manha' : 'noturna',
                isMentoring: true
            };
        });

    const nightSessions = [
        ...allSessions.filter(s => s.category === 'noturna'),
        ...mappedMentorships.filter(m => m.category === 'noturna')
    ].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const fullMorningAgenda = [
        ...allSessions.filter(s => s.category === 'manha_ancora'),
        ...cursosSelecionados,
        ...mappedMentorships.filter(m => m.category === 'manha')
    ]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .sort((a, b) => (a.startTime || a.horario_inicio || '').localeCompare(b.startTime || b.horario_inicio || ''));

    const SessionCard = ({ item, color = '#14b8a6', delay = 0 }: { item: AgendaSession, color?: string, delay?: number }) => {
        const isCheckedIn = (isTriunfo && myRegistration?.checkedIn) || activityCheckIns.some(c => c.sessionId === item.id && c.registrationId === myRegistration?.id);
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onSessionClick?.(item)}
                className="relative overflow-hidden rounded-[1.5rem] p-5 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                    background: 'var(--surface-1)',
                    border: `1px solid ${color}20`
                }}
            >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(ellipse at top right, ${color}12, transparent 70%)` }} />

                <div className="flex items-center sm:items-start gap-4 sm:gap-5 relative z-10">
                    {/* Time */}
                    <div className="text-center min-w-[56px] sm:min-w-[64px] shrink-0">
                        <p className="font-black text-sm sm:text-base leading-tight uppercase font-mono" style={{ color }}>{item.startTime || item.horario_inicio || '--:--'}</p>
                        <p className="text-foreground/30 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-0.5">{item.endTime || item.horario_fim || ''}</p>
                    </div>
 
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                        <h4 className="text-foreground font-black leading-tight uppercase italic text-xs sm:text-sm break-words sm:truncate group-hover:transition-colors"
                            style={{ '--hover-color': color } as React.CSSProperties}>
                            {item.title || item.titulo}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[8px] sm:text-[9px] text-foreground/40 font-black uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />{item.room || item.local || 'Auditório Principal'}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                style={{ background: `${color}15`, color }}>
                                {item.type || item.tipo || 'PALESTRA'}
                            </span>
                        </div>
 
                        {!isCheckedIn && (
                            <button
                                onClick={e => { e.stopPropagation(); setIsSelfCheckInOpen(true); }}
                                className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all border active:scale-95 mt-1"
                                style={{ background: `${color}10`, color, borderColor: `${color}25` }}
                            >
                                <QrCode className="h-2.5 w-2.5" />Confirmar Presença
                            </button>
                        )}
                    </div>
 
                    {/* Status indicator */}
                    <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                        style={{ background: isCheckedIn ? 'rgba(34,197,94,0.15)' : `${color}10` }}>
                        {isCheckedIn
                            ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:h-4 text-green-400" />
                            : <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:h-4 transition-transform group-hover:translate-x-0.5" style={{ color }} />
                        }
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-foreground italic tracking-tight">Minha Agenda</h2>
                    <p className="text-foreground/40 text-sm font-medium mt-0.5">Organize suas atividades e não perca nenhum momento.</p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        onClick={() => setIsSelfCheckInOpen(true)}
                        className="flex items-center gap-2 px-4 h-11 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border active:scale-95"
                        style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', borderColor: 'rgba(20,184,166,0.25)' }}
                    >
                        <QrCode className="h-4 w-4" />Scan QR
                    </button>
                    <button
                        className="flex items-center gap-2 px-4 h-11 rounded-2xl font-black text-xs text-white uppercase tracking-wider transition-all active:scale-95"
                        style={{ background: isActuallyPaid ? 'var(--surface-2)' : 'linear-gradient(135deg,#ff7043,#ff4035)', boxShadow: isActuallyPaid ? 'none' : '0 4px 16px rgba(255,112,67,0.3)' }}
                        onClick={() => {
                            if (isActuallyPaid) navigate('/triunfo');
                            else if (onUpgradeClick) onUpgradeClick();
                            else navigate('/upgrade');
                        }}
                    >
                        <Zap className="h-4 w-4" />{isActuallyPaid ? 'Add Atividades' : 'Upgrade Pro'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-8">
                    {/* Morning timeline - only show if there are sessions */}
                    {fullMorningAgenda.length > 0 && (
                        <div className="relative pl-6 border-l-2 space-y-3" style={{ borderColor: 'rgba(20,184,166,0.2)' }}>
                            <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
                                style={{ background: '#14b8a6', boxShadow: '0 0 16px rgba(20,184,166,0.5)' }}>
                                <Sun className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex items-center justify-between mb-4 pl-2">
                                <h3 className="text-foreground/50 font-black text-[10px] uppercase tracking-[0.25em]">Conteúdo Diurno</h3>
                                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 text-[9px] font-black uppercase">Opcional</Badge>
                            </div>
                            {fullMorningAgenda.map((item, i) => (
                                <SessionCard key={i} item={item} color="#14b8a6" delay={i * 0.06} />
                            ))}
                        </div>
                    )}

                    {/* Night timeline */}
                    <div className="relative pl-6 border-l-2 space-y-3" style={{ borderColor: 'rgba(255,112,67,0.2)' }}>
                        <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#ff7043,#ff4035)', boxShadow: '0 0 16px rgba(255,112,67,0.5)' }}>
                            <Moon className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex items-center justify-between mb-4 pl-2">
                            <h3 className="text-foreground/50 font-black text-[10px] uppercase tracking-[0.25em]">Programação Oficial · Triunfo</h3>
                            <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20 text-[9px] font-black uppercase">Principal</Badge>
                        </div>

                        {nightSessions.length > 0 ? (
                            nightSessions.map((s, i) => <SessionCard key={i} item={s} color="#ff7043" delay={i * 0.06} />)
                        ) : (
                            <div className="p-8 text-center rounded-[2rem] border border-dashed" style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)' }}>
                                <Zap className="h-8 w-8 mx-auto mb-3 text-brand-orange-coral/30" />
                                <p className="text-foreground/40 text-sm mb-4">A programação oficial do Growth Experience Triunfo está sendo finalizada.</p>
                                <p className="text-[10px] text-foreground/20 font-bold uppercase tracking-widest leading-relaxed">
                                    O evento acontece dia 16/04 às 17h no Espaço Parque.<br/>Fique atento às notificações do App.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="rounded-[2rem] p-6" style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
                        <h3 className="text-foreground font-black text-sm mb-5 flex items-center gap-2 uppercase">
                            <CalendarIcon className="h-4 w-4 text-teal-400" />Notas da Agenda
                        </h3>
                        <ul className="space-y-3">
                            {[
                                'O credenciamento Triunfo abre às 17:00h no dia 16/04.',
                                'Local: Espaço Parque (Triunfo-PE).',
                                'Programação Pocket Edition: 4 palestras explosivas.',
                                'Networking ativo com mais de 500 empresários.',
                            ].map((note, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs text-foreground/50 leading-relaxed font-medium">
                                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[2rem] p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}>
                        <h3 className="text-foreground font-black text-sm mb-4">Networking do Dia</h3>
                        <div className="flex -space-x-2 mb-4">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-9 h-9 rounded-full border-2 overflow-hidden" style={{ borderColor: 'var(--surface-1)' }}>
                                    <img src={`https://i.pravatar.cc/80?img=${i+10}`} alt="" className="w-full h-full object-cover grayscale opacity-70" />
                                </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white"
                                style={{ background: 'linear-gradient(135deg,#ff7043,#ff4035)', borderColor: 'var(--surface-1)' }}>
                                +250
                            </div>
                        </div>
                        <p className="text-foreground/40 text-xs leading-relaxed">
                            Mais de 250 participantes na sua trilha. Use o intervalo para trocar experiências!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
