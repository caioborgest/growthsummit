import { Users, Sparkles, CheckCircle2, Star, X, Lock, MapPin, Calendar, Clock, ChevronRight, AlertCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MentorshipSectionProps {
    myRegistration: any;
    myMentorships: any[];
    availableSlots: any[];
    handleCancelMentoring: (id: string) => void;
    handleBookMentoring: (slotId: string, topic: string) => void;
    handleJoinWaitlist: (challenge: string) => void;
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
    handleJoinWaitlist,
    setRatingModal,
    setIsMentoriaModalOpen,
    setShowUpgradeModal
}: MentorshipSectionProps) {

    const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
    const [challenge, setChallenge] = useState('');

    // Mentorship is available for all participants as requested
    const canAccess = true;

    if (!canAccess) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Overview & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                        <span className="text-teal-400 font-black text-[10px] uppercase tracking-widest">Sessões 1-on-1 Ativas</span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">SUA <span className="text-teal-500 text-brand-orange-coral">JORNADA</span> MENTORADA</h2>
                </div>
                <Button
                    onClick={() => setIsMentoriaModalOpen(true)}
                    className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 px-10 rounded-[1.5rem] shadow-2xl shadow-brand-orange-coral/20 flex items-center gap-3 group transition-all hover:scale-[1.05] active:scale-95"
                >
                    <Sparkles className="h-6 w-6 text-yellow-300 group-hover:rotate-12 transition-transform" />
                    AGENDAR AGORA
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* My Mentorships */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-teal-400" />
                        </div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest leading-none">Meus Agendamentos</h3>
                    </div>

                    <div className="space-y-4">
                        {myMentorships.map(session => (
                            <div key={session.id} className={`glass-card p-6 border-white/5 relative overflow-hidden group transition-all rounded-[2rem] ${session.status === 'completed' ? 'opacity-70 grayscale-[0.5]' : 'hover:border-teal-500/30'}`}>
                                <div className="flex items-start gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-dark-400 border border-white/10 overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {session.mentorAvatar ? (
                                            <img src={session.mentorAvatar} alt={session.mentorName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-teal-500/10 text-teal-400 font-bold text-xl uppercase italic">
                                                {session.mentorName?.[0]}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-white font-black text-lg uppercase italic truncate leading-none">{session.mentorName}</p>
                                            {session.status === 'completed' ? (
                                                <Badge className="bg-dark-300 text-gray-500 border-none text-[8px] font-black uppercase rounded-lg">Finalizada</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/20 text-green-400 border-none text-[8px] font-black uppercase animate-pulse rounded-lg">Confirmada</Badge>
                                            )}
                                        </div>
                                        <p className="text-teal-400 text-xs font-extrabold truncate mb-4 uppercase tracking-tight">{session.topic || 'Mentoria Estratégica'}</p>

                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
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
                                                className="bg-yellow-500 text-black font-black text-[10px] h-9 rounded-xl px-5 hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10 uppercase tracking-widest"
                                            >
                                                <Star className="h-3 w-3 mr-2 fill-current" /> AVALIAR SESSÃO
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white text-[10px] font-black uppercase tracking-widest">{session.feedback.avaliacaoMentoria}/5 Estrelas</span>
                                            </div>
                                        )
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleCancelMentoring(session.id)}
                                            className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 text-[9px] font-black uppercase rounded-xl h-9 px-4 transition-colors"
                                        >
                                            DESISTIR DA VAGA
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {myMentorships.length === 0 && (
                            <div className="p-16 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-3xl bg-dark-400 flex items-center justify-center mb-6">
                                    <Clock className="h-8 w-8 text-gray-700 mx-auto" />
                                </div>
                                <p className="text-gray-500 text-sm italic font-medium">Sua agenda de mentorias está livre.</p>
                                <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest mt-2">GARANTA SEU HORÁRIO COM OS MELHORES</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Slots / Waitlist */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-orange-400" />
                        </div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest leading-none">Vagas de Última Hora</h3>
                    </div>

                    <div className="grid gap-4">
                        {availableSlots.slice(0, 4).map(slot => (
                            <div key={slot.id} className="glass-card p-6 border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between gap-4 group rounded-[2rem] relative overflow-hidden">
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-dark-400 overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 transition-all flex items-center justify-center text-orange-500 font-black italic shadow-inner">
                                        {slot.mentorAvatar ? <img src={slot.mentorAvatar} alt={slot.mentorName} className="w-full h-full object-cover" /> : slot.mentorName?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-sm italic leading-none mb-1.5">{slot.mentorName}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-orange-500/10 text-orange-500 border-none text-[8px] font-black uppercase py-0 px-2">IMEDIATO</Badge>
                                            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => {
                                        const topic = prompt('Qual o principal desafio que deseja tratar?');
                                        if (topic) handleBookMentoring(slot.id, topic);
                                    }}
                                    className="bg-white/5 hover:bg-brand-orange-coral text-gray-400 hover:text-white font-black text-[10px] px-6 h-11 rounded-xl transition-all uppercase tracking-widest relative z-10"
                                >
                                    RESERVAR
                                </Button>
                            </div>
                        ))}

                        {availableSlots.length === 0 && (
                            <div className="p-10 bg-dark-200/50 rounded-[3rem] border border-white/5 text-center space-y-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex justify-center">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-2">
                                        <AlertCircle className="h-8 w-8 text-orange-500" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg uppercase italic tracking-tighter mb-2">Todos os slots ocupados</h4>
                                    <p className="text-gray-500 text-xs font-bold leading-relaxed max-w-[250px] mx-auto uppercase tracking-wide">Os mentores estão em sessões ativas no momento.</p>
                                </div>
                                <Button
                                    onClick={() => setIsWaitlistModalOpen(true)}
                                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 uppercase tracking-widest italic"
                                >
                                    ENTRAR NA FILA DE ESPERA
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Info Card - Rule System */}
                    <div className="p-8 bg-dark-300 border border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Sparkles className="h-24 w-24 text-teal-400" />
                        </div>
                        <h4 className="text-white font-black text-[10px] uppercase mb-5 flex items-center gap-2 tracking-[0.2em]">
                            <div className="w-5 h-5 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-teal-500" />
                            </div>
                            Mentoria GS Rules
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Foco Total', d: '20 min por sessão' },
                                { t: 'Limite', d: '1 slot por vez' },
                                { t: 'Tolerância', d: '5 min de atraso' },
                                { t: 'No-Show', d: 'Libera automático' }
                            ].map((r, i) => (
                                <li key={i} className="flex flex-col gap-1">
                                    <span className="text-teal-400 text-[9px] font-black uppercase tracking-widest">{r.t}</span>
                                    <span className="text-white text-xs font-bold italic">{r.d}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Waitlist (Fila de Espera) Modal */}
            <Dialog open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen}>
                <DialogContent className="bg-dark-200 border border-white/10 text-white rounded-[2.5rem] max-w-md p-8 shadow-2xl shadow-black/80">
                    <DialogHeader>
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                            <Users className="h-8 w-8 text-orange-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tight leading-none mb-2">Fila de <span className="text-orange-500">Demanda</span></DialogTitle>
                        <DialogDescription className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Cadastre seu desafio para ser chamado assim que liberarmos novos mentores</DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-6 space-y-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                <MessageSquare className="h-3 w-3 text-orange-500" /> O que você precisa resolver hoje?
                            </label>
                            <Textarea 
                                placeholder="Ex: Preciso de ajuda com meu pitch deck ou estratégia de vendas para o setor agro..."
                                className="bg-dark-300 border-white/5 rounded-2xl h-32 focus:border-orange-500/50 transition-colors text-sm font-medium resize-none"
                                value={challenge}
                                onChange={(e) => setChallenge(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-3">
                        <Button 
                            className="bg-orange-500 hover:bg-orange-600 text-white font-black h-14 w-full rounded-2xl shadow-xl shadow-orange-500/20 uppercase tracking-widest italic"
                            onClick={() => {
                                if (!challenge) return;
                                handleJoinWaitlist(challenge);
                                setChallenge('');
                                setIsWaitlistModalOpen(false);
                            }}
                        >
                            ENVIAR PARA O PAINEL ADMIN
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest"
                            onClick={() => setIsWaitlistModalOpen(false)}
                        >
                            TALVEZ DEPOIS
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
