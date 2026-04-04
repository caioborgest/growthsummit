import { Users, Sparkles, CheckCircle2, Star, MapPin, Calendar, Clock, AlertCircle, MessageSquare, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MentorshipSectionProps {
    myMentorships: any[];
    availableSlots: any[];
    handleCancelMentoring: (id: string) => void;
    handleBookMentoring: (slotId: string, topicOfInterest: string) => void;
    handleJoinWaitlist: (challenge: string) => void;
    setRatingModal: (modal: any) => void;
    setIsMentoriaModalOpen: (open: boolean) => void;
}

export function MentorshipSection({
    myMentorships,
    availableSlots,
    handleCancelMentoring,
    handleBookMentoring,
    handleJoinWaitlist,
    setRatingModal,
    setIsMentoriaModalOpen,
}: MentorshipSectionProps) {

    const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
    const [challenge, setChallenge] = useState('');

    const activeMentorships = myMentorships.filter(m => m.status === 'scheduled' || m.status === 'pending');
    const pastMentorships = myMentorships.filter(m => m.status === 'completed' || m.status === 'no_show' || m.status === 'cancelled');

    return (
        <div className="space-y-8">
            {/* Próximas Mentorias */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Minhas <span className="text-brand-orange-coral">Mentorias</span></h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Acompanhe seus agendamentos</p>
                    </div>
                </div>

                {activeMentorships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeMentorships.map((mentorship) => (
                            <div key={mentorship.id} className="glass-card p-6 border-l-4 border-brand-orange-coral">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 uppercase font-black text-white flex items-center justify-center text-xl">
                                            {mentorship.mentorAvatar ? (
                                                <img src={mentorship.mentorAvatar} alt={mentorship.mentorName} className="w-full h-full object-cover" />
                                            ) : (
                                                mentorship.mentorName?.substring(0, 2)
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white uppercase tracking-tight">{mentorship.mentorName}</h4>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{mentorship.topicOfInterest || 'Mentoria Estratégica'}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral font-black text-[9px] uppercase tracking-widest border-none">
                                        AGENDADO
                                    </Badge>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(mentorship.scheduledAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(mentorship.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ({mentorship.duration}min)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <MapPin className="h-3 w-3" />
                                        <span>{mentorship.tableNumber ? `Mesa ${mentorship.tableNumber}` : 'Local: Arena de Mentorias'}</span>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline"
                                    onClick={() => handleCancelMentoring(mentorship.id)}
                                    className="w-full border-white/10 hover:bg-red-500/10 hover:text-red-400 text-gray-400 text-[10px] font-black uppercase tracking-widest h-10"
                                >
                                    CANCELAR AGENDAMENTO
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-10 text-center border-dashed border-white/5">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-gray-600" />
                        </div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Nenhuma mentoria agendada</p>
                        <Button 
                            onClick={() => setIsMentoriaModalOpen(true)}
                            className="mt-6 bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-12 rounded-xl px-8"
                        >
                            AGENDAR AGORA
                        </Button>
                    </div>
                )}
            </div>

            {/* Fila de Espera / Slots Disponíveis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Abertas para <span className="text-brand-orange-coral">Inscrição</span></h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Horários disponíveis com mentores</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableSlots.length > 0 ? (
                            availableSlots.slice(0, 6).map((slot) => (
                                <div key={slot.id} className="glass-card p-5 group hover:border-brand-orange-coral/30 transition-all cursor-pointer" onClick={() => handleBookMentoring(slot.id, 'Mentoria Estratégica')}>
                                    <div className="flex justify-between items-center mb-3">
                                        <Badge className="bg-teal-500/20 text-teal-400 font-black text-[9px] uppercase tracking-widest border-none">
                                            LIVRE
                                        </Badge>
                                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center font-black text-white">
                                            {slot.mentorAvatar ? (
                                                <img src={slot.mentorAvatar} alt={slot.mentorName} className="w-full h-full object-cover" />
                                            ) : (
                                                slot.mentorName?.substring(0, 2)
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm uppercase tracking-tight">{slot.mentorName}</h4>
                                            <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Especialista</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 glass-card p-10 text-center border-dashed border-white/5">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-6 w-6 text-gray-600" />
                                </div>
                                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Sem horários livres no momento</p>
                                <Button 
                                    onClick={() => setIsWaitlistModalOpen(true)}
                                    className="mt-4 bg-white/5 hover:bg-white/10 text-white font-black h-10 rounded-xl px-6 text-[10px] uppercase tracking-widest border border-white/10"
                                >
                                    ENTRAR NA FILA DE ESPERA
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Desafios <span className="text-brand-orange-coral">Diretos</span></h2>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Acesso rápido aos mentores</p>
                    </div>
                    <div className="glass-card p-6 bg-gradient-to-br from-brand-orange-coral/10 to-transparent">
                        <Sparkles className="h-8 w-8 text-brand-orange-coral mb-4" />
                        <h4 className="text-white font-black uppercase tracking-tight mb-2">Fila Global</h4>
                        <p className="text-gray-500 text-xs mb-6">Não encontrou o horário que queria? Entre na nossa fila de espera global. Mentores disponíveis podem te chamar a qualquer momento!</p>
                        <Button 
                            onClick={() => setIsWaitlistModalOpen(true)}
                            className="w-full bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-12 rounded-xl uppercase italic tracking-tighter"
                        >
                            PEDIR UMA MENTORIA AGORA
                        </Button>
                    </div>
                </div>
            </div>

            {/* Histórico */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Histórico de Sessões</h3>
                <div className="space-y-3">
                    {pastMentorships.length > 0 ? (
                        pastMentorships.map((m) => (
                            <div key={m.id} className="glass-card p-4 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-4">
                                    <CheckCircle2 className={`h-5 w-5 ${m.status === 'completed' ? 'text-teal-400' : 'text-gray-600'}`} />
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight">{m.mentorName}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{new Date(m.scheduledAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                </div>
                                {m.status === 'completed' && !m.feedback ? (
                                    <Button 
                                        onClick={() => setRatingModal({ isOpen: true, mentorshipId: m.id, mentorName: m.mentorName })}
                                        className="h-8 px-4 bg-teal-500 hover:bg-teal-600 text-dark-500 font-black text-[9px] rounded-lg"
                                    >
                                        AVALIAR
                                    </Button>
                                ) : (
                                    <div className="flex gap-1 text-teal-400">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className={`h-3 w-3 ${m.feedback?.rating >= s ? 'fill-current' : 'opacity-20'}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest text-center py-4">Sem histórico de mentorias realizadas.</p>
                    )}
                </div>
            </div>

            {/* Modal de Fila de Espera */}
            <Dialog open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen}>
                <DialogContent className="bg-dark-200 border-white/10 text-white max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Entrar na <span className="text-brand-orange-coral">Fila</span></DialogTitle>
                        <DialogDescription className="text-gray-500 text-xs font-bold uppercase tracking-widest">Descreva seu desafio para que possamos te direcionar</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Seu Desafio / Problema</label>
                            <Textarea 
                                placeholder="Descreva brevemente em que você precisa de ajuda..." 
                                value={challenge}
                                onChange={(e) => setChallenge(e.target.value)}
                                className="bg-white/5 border-white/10 h-32 rounded-2xl p-4 text-sm focus:border-brand-orange-coral focus:ring-1 focus:ring-brand-orange-coral resize-none"
                            />
                        </div>

                        <div className="glass-card p-4 bg-blue-500/5 border-blue-500/20">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-400 shrink-0" />
                                <p className="text-[10px] text-blue-400 font-bold leading-relaxed uppercase tracking-widest">
                                    Seu pedido será enviado a todos os mentores disponíveis. Você receberá uma notificação assim que um mentor aceitar o desafio.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsWaitlistModalOpen(false)}
                                className="flex-1 border-white/10 hover:bg-white/5 text-gray-400 font-black h-12 rounded-xl"
                            >
                                CANCELAR
                            </Button>
                            <Button 
                                onClick={() => {
                                    handleJoinWaitlist(challenge);
                                    setIsWaitlistModalOpen(false);
                                    setChallenge('');
                                }}
                                disabled={!challenge.trim()}
                                className="flex-2 bg-brand-orange-coral hover:bg-orange-600 text-white font-black h-12 rounded-xl px-8 shadow-lg shadow-orange-500/20"
                            >
                                CONFIRMAR PEDIDO
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
