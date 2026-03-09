import { Users, Sparkles, CheckCircle2, Star, X, Lock, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MentorshipSectionProps {
    myRegistration: any;
    myMentorships: any[];
    availableSlots: any[];
    handleCancelMentoring: (id: string) => void;
    handleBookMentoring: (slotId: string, topic: string) => void;
    setRatingModal: (modal: any) => void;
    setIsMentoriaModalOpen: (open: boolean) => void;
    setShowUpgradeModal: (show: boolean) => void;
}

export function MentorshipSection({
    myRegistration,
    myMentorships,
    availableSlots,
    handleCancelMentoring,
    handleBookMentoring,
    setRatingModal,
    setIsMentoriaModalOpen,
    setShowUpgradeModal
}: MentorshipSectionProps) {

    // Mentorship is available for all participants as requested
    const canAccess = true;

    if (!canAccess) return null;

    return (
        <div className="space-y-12">
            {/* Overview & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        <span className="text-teal-400 font-black text-[10px] uppercase tracking-widest">Sessões 1-on-1 Ativas</span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">SUA JORNADA MENTORADA</h2>
                </div>
                <Button
                    onClick={() => setIsMentoriaModalOpen(true)}
                    className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-12 px-8 rounded-2xl shadow-xl shadow-brand-orange-coral/20 flex items-center gap-3 group transition-all hover:scale-[1.05]"
                >
                    <Sparkles className="h-5 w-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
                    SOLICITAR NOVA MENTORIA
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* My Mentorships */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                        </div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Meus Agendamentos</h3>
                    </div>

                    <div className="space-y-4">
                        {myMentorships.map(session => (
                            <div key={session.id} className={`glass-card p-6 border-white/5 relative overflow-hidden group transition-all ${session.status === 'completed' ? 'opacity-70 grayscale-[0.5]' : 'hover:border-teal-500/30'}`}>
                                <div className="flex items-start gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-dark-400 border border-white/10 overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {session.mentorAvatar ? (
                                            <img src={session.mentorAvatar} alt={session.mentorName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-teal-500/10 text-teal-400 font-bold text-xl">
                                                {session.mentorName?.[0]}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-white font-black text-lg uppercase italic truncate leading-none">{session.mentorName}</p>
                                            {session.status === 'completed' ? (
                                                <Badge className="bg-dark-300 text-gray-500 border-none text-[8px] font-black uppercase">Finalizada</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black uppercase animate-pulse">Confirmada</Badge>
                                            )}
                                        </div>
                                        <p className="text-teal-400 text-xs font-bold truncate mb-4">{session.topic || 'Mentoria Estratégica'}</p>

                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-teal-500/50" /> {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-teal-500/50" /> {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-teal-500/50" /> Lounge Mentorias</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/5 pt-4">
                                    {session.status === 'completed' ? (
                                        !session.feedback?.avaliadoEm ? (
                                            <Button
                                                onClick={() => setRatingModal({
                                                    isOpen: true,
                                                    sessionId: session.id,
                                                    mentorName: session.mentorName,
                                                    alreadyRated: false
                                                })}
                                                className="bg-yellow-500 text-black font-black text-[10px] h-8 rounded-lg px-4 hover:bg-yellow-400 transition-all"
                                            >
                                                <Star className="h-3 w-3 mr-2 fill-current" /> AVALIAR SESSÃO
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white text-xs font-black">{session.feedback.avaliacaoMentoria}/5</span>
                                            </div>
                                        )
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleCancelMentoring(session.id)}
                                            className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 text-[9px] font-black uppercase rounded-lg h-8"
                                        >
                                            DESISTIR DA VAGA
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {myMentorships.length === 0 && (
                            <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/5">
                                <Clock className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 text-sm italic">Sua agenda de mentorias está livre. Aproveite!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Slots */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-400" />
                        </div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest">Slots de Última Hora</h3>
                    </div>

                    <div className="grid gap-4">
                        {availableSlots.map(slot => (
                            <div key={slot.id} className="glass-card p-5 border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-dark-400 overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all">
                                        {slot.mentorAvatar && <img src={slot.mentorAvatar} alt={slot.mentorName} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-sm italic leading-none mb-1">{slot.mentorName}</p>
                                        <p className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                                            {new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}  ·  CONFIRMAÇÃO IMEDIATA
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        const topic = prompt('Qual o tema que deseja tratar na mentoria?');
                                        if (topic) handleBookMentoring(slot.id, topic);
                                    }}
                                    className="bg-white/5 hover:bg-orange-500 text-gray-400 hover:text-white font-black text-[10px] px-4 py-2 rounded-xl h-auto"
                                >
                                    RESERVAR
                                </Button>
                            </div>
                        ))}

                        {availableSlots.length === 0 && (
                            <div className="p-10 bg-dark-300/50 rounded-[2rem] border border-white/5 text-center">
                                <p className="text-gray-600 text-sm font-medium">Fique de olho! Novos slots podem aparecer a cada hora.</p>
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="p-6 bg-gradient-to-br from-teal-500/10 to-orange-500/10 border border-white/5 rounded-[2rem]">
                        <h4 className="text-white font-black text-xs uppercase mb-3 flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-orange-400" /> Mentoria GS Rules
                        </h4>
                        <ul className="space-y-2">
                            {[
                                'Duração máxima de 20 minutos por sessão.',
                                'Apenas uma mentoria por vez.',
                                'Cancelamentos com no mínimo 30 min de antecedência.',
                                'Atraso de 5 min libera a vaga automaticamente.'
                            ].map((r, i) => (
                                <li key={i} className="text-[10px] text-gray-500 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-teal-500/50"></span> {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
