import { QrCode, Calendar as CalendarIcon, Sun, Moon, MapPin, CheckCircle2, BookOpen, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AgendaSectionProps {
    myRegistration: any;
    cursosSelecionados: any[];
    setIsSelfCheckInOpen: (open: boolean) => void;
    navigate: (path: string) => void;
}

export function AgendaSection({
    myRegistration,
    cursosSelecionados,
    setIsSelfCheckInOpen,
    navigate
}: AgendaSectionProps) {
    return (
        <div className="space-y-8">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight">Minha Agenda G.S.</h2>
                    <p className="text-gray-400 text-sm">Organize suas atividades e não perca nenhum momento.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsSelfCheckInOpen(true)}
                        variant="outline"
                        className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 rounded-xl font-bold h-11"
                    >
                        <QrCode className="h-4 w-4 mr-2" /> SCAN QR CODE
                    </Button>
                    <Button
                        className="bg-white text-black hover:bg-gray-100 rounded-xl font-black h-11 px-6 shadow-xl"
                        onClick={() => window.open('https://www.growthsummit.site/guia', '_blank')}
                    >
                        VER PROGRAMAÇÃO COMPLETA
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Day Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section Morning */}
                    <div className="relative pl-8 border-l border-white/5 space-y-4">
                        <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)] flex items-center justify-center">
                            <Sun className="h-3 w-3 text-white" />
                        </div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Manhã · Growth Experience</h3>
                            <Badge variant="outline" className="text-[10px] text-teal-400 border-teal-500/20">GRATUITO</Badge>
                        </div>

                        {cursosSelecionados.length > 0 ? (
                            <div className="space-y-3">
                                {cursosSelecionados.map((item: any, i) => (
                                    <div key={i} className="glass-card p-5 border-white/5 hover:border-teal-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-all"></div>

                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-teal-400 font-black text-lg leading-tight">{item.startTime || item.horario_inicio || '--:--'}</p>
                                                <p className="text-gray-600 text-[10px] font-bold uppercase">{item.endTime || item.horario_fim || ''}</p>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <h4 className="text-white font-black leading-tight group-hover:text-teal-400 transition-colors uppercase italic">{item.title || item.titulo}</h4>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1 text-teal-500/50" /> {item.room || item.local || 'Auditório Principial'}
                                                    </span>
                                                    <Badge className="bg-white/5 text-gray-400 border-none text-[9px] font-black">{item.type || item.tipo || 'PALESTRA'}</Badge>
                                                </div>
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-dark-200/50 rounded-3xl border border-dashed border-white/10">
                                <BookOpen className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm mb-4">Você ainda não selecionou atividades para a manhã.</p>
                                <Button
                                    variant="outline"
                                    className="border-teal-500/20 text-teal-400 hover:bg-teal-500/10 h-9 rounded-xl text-xs"
                                    onClick={() => navigate('/growth-experience-triunfo')}
                                >
                                    ESCOLHER ATIVIDADES
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Section Night */}
                    <div className="relative pl-8 border-l border-white/5 space-y-4 pt-4">
                        <div className="absolute -left-[11px] top-4 w-5 h-5 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] flex items-center justify-center">
                            <Moon className="h-3 w-3 text-white" />
                        </div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Noite · Passaporte Night</h3>
                            <Badge className="bg-orange-500/20 text-orange-400 border-none text-[10px] font-black tracking-tighter">PREMIUM</Badge>
                        </div>

                        {myRegistration?.palestrasNoturnas ? (
                            <div className="space-y-3">
                                {/* Local Sessions for Night */}
                                {[
                                    { time: '18:30', title: 'Abertura Night Summit', speaker: 'Equipe Growth' },
                                    { time: '19:00', title: 'Growth Strategies for 2026', speaker: 'Leandro Batista' },
                                    { time: '20:30', title: 'Data Driven Culture', speaker: 'Vanylton Matias' }
                                ].map((session, i) => (
                                    <div key={i} className="glass-card p-5 border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all"></div>
                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="text-center min-w-[60px]">
                                                <p className="text-orange-400 font-black text-lg leading-tight">{session.time}</p>
                                                <p className="text-gray-600 text-[10px] font-bold uppercase">CHECK-IN</p>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-black leading-tight uppercase italic group-hover:text-orange-400 transition-colors">{session.title}</h4>
                                                <p className="text-gray-500 text-xs mt-1 font-bold tracking-tight">SPEAKER: {session.speaker}</p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="text-[9px] text-gray-600 flex items-center uppercase font-black tracking-widest">
                                                        <MapPin className="h-2.5 w-2.5 mr-1 text-orange-500/50" /> Arena Principal
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-800 group-hover:text-orange-400 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-orange-500/5 rounded-3xl border border-orange-500/10">
                                <Moon className="h-8 w-8 text-orange-600/50 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm mb-4">O acesso às palestras noturnas não está incluso em seu pacote.</p>
                                <Button
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-black h-10 rounded-xl text-xs px-6"
                                    onClick={() => navigate('/upgrade')}
                                >
                                    ADQUIRIR PASSAPORTE NIGHT
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Column / Perks */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-teal-500/10 bg-teal-500/5">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-teal-400" /> Notas da Agenda
                        </h3>
                        <ul className="space-y-4">
                            {[
                                'O credenciamento começa às 07:30.',
                                'Chegue 15 min antes na sua oficina.',
                                'O almoço não está incluso no Free.',
                                'Certificados exigem check-in na sala.'
                            ].map((note, i) => (
                                <li key={i} className="flex items-start gap-3 text-xs text-gray-400 leading-relaxed">
                                    <div className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5"></div>
                                    {note}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-card p-8 border-white/5">
                        <h3 className="text-white font-bold mb-6">Networking do Dia</h3>
                        <div className="flex -space-x-3 mb-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-300 bg-dark-400 overflow-hidden shadow-xl shadow-black/40">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover grayscale opacity-80" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-dark-300 bg-teal-500 flex items-center justify-center text-[10px] font-black text-white">
                                +250
                            </div>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed">
                            Mais de 250 participantes estarão na sua mesma trilha de conhecimento. Use o intervalo para trocar experiências!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
