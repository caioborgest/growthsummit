import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, User, Linkedin, Mail, Phone, Clock, Target, Calendar, Sparkles } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Mentor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    position: string;
    bio: string;
    specialties: string[];
    linkedin?: string;
    photo?: string;
    yearsExperience?: number;
    maxMentories?: number;
}

interface MentorCardProps {
    mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Helper to limit words
    const limitWords = (text: string, limit: number) => {
        const words = text.split(/\s+/);
        if (words.length <= limit) return text;
        return words.slice(0, limit).join(' ') + '...';
    };

    return (
        <>
            <div className="group relative glass-card p-6 border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-dark-200">
                    <img
                        src={mentor.photo || 'https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/logos/LOGO-growth-summit_branco.v2.png'}
                        alt={mentor.name}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-3 right-3 p-1.5 bg-dark-300/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="h-4 w-4 text-brand-orange-coral" />
                    </div>
                </div>

                <div className="space-y-2 flex-grow">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-orange-coral transition-colors">
                        {mentor.name}
                    </h3>
                    <p className="text-brand-orange-coral font-bold text-xs uppercase tracking-widest line-clamp-1">
                        {mentor.position} @ {mentor.company}
                    </p>
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                        {limitWords(mentor.bio, 100)}
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {(mentor.specialties || []).slice(0, 2).map((spec, sIdx) => (
                            <Badge key={sIdx} variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase tracking-wider text-gray-400">
                                {spec}
                            </Badge>
                        ))}
                    </div>

                    <Button
                        onClick={() => setIsDetailsOpen(true)}
                        variant="link"
                        className="p-0 h-auto text-brand-orange-coral font-bold flex items-center gap-2 group/btn hover:no-underline"
                    >
                        Ver Perfil Completo
                        <div className="w-6 h-6 rounded-full bg-brand-orange-coral/10 flex items-center justify-center group-hover/btn:bg-brand-orange-coral group-hover/btn:text-white transition-all">
                            <X className="h-3 w-3 rotate-45" />
                        </div>
                    </Button>
                </div>

                {/* Glow Hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity bg-brand-orange-gradient pointer-events-none" />
            </div>

            {/* Modal de Detalhes */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="bg-dark-200 border-white/10 text-white max-w-2xl p-0 overflow-hidden rounded-3xl">
                    <div className="absolute top-4 right-4 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDetailsOpen(false)}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-8 sm:p-12 overflow-y-auto max-h-[90vh]">
                        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 border-b border-white/5 pb-10">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-brand-orange-coral/30 shadow-2xl shadow-brand-orange-coral/20 shrink-0">
                                <img
                                    src={mentor.photo || ''}
                                    className="w-full h-full object-cover"
                                    alt={mentor.name}
                                />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-3xl font-black mb-2">{mentor.name}</h2>
                                <p className="text-brand-orange-coral font-bold text-lg mb-4">{mentor.position} <span className="text-gray-500 mx-2">•</span> {mentor.company}</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                    {mentor.linkedin && (
                                        <a href={mentor.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                                            <Linkedin className="h-4 w-4" />
                                            LinkedIn
                                        </a>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        {mentor.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Estatísticas do Evento</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Experiência
                                        </p>
                                        <p className="text-white font-bold">{mentor.yearsExperience || 0} anos</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1">
                                            <Target className="h-3 w-3" /> Capacidade
                                        </p>
                                        <p className="text-white font-bold">{mentor.maxMentories || 0} slots</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Especialidades</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.specialties?.map((spec, i) => (
                                        <Badge key={i} className="bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 px-3 py-1 font-bold">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Biografia & Trajetória</h4>
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {mentor.bio}
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 text-center">
                            <p className="text-gray-500 text-sm mb-6 flex items-center justify-center gap-2">
                                <Calendar className="h-4 w-4" /> Mentor oficial Growth Experience 2026
                            </p>
                            <Button className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-10 py-6 rounded-2xl text-lg h-auto shadow-glow-orange">
                                Agendar Mentoria com {mentor.name?.split(' ')[0] || 'Mentor'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
