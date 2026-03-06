import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Check, ArrowRight, Loader2, Star, BadgeCheck, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';

interface Mentor {
    id: string;
    nome: string;
    cargo?: string;
    empresa: string;
    bio: string;
    foto_url?: string;
    especialidades?: string[];
}

interface Step2SelecionarMentorProps {
    area: string;
    mentorSelecionadoId: string;
    onContinuar: (mentorId: string) => void;
    onVoltar: () => void;
}

export function Step2SelecionarMentor({ area, mentorSelecionadoId, onContinuar, onVoltar }: Step2SelecionarMentorProps) {
    const [mentores, setMentores] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const { projectId } = useProject();

    useEffect(() => {
        async function fetchMentores() {
            try {
                const { data, error } = await supabase
                    .from('mentores_growth_experience')
                    .select('*')
                    .eq('project_id', projectId)
                    .eq('status', 'aprovado');

                if (error) throw error;

                if (!data || data.length === 0) {
                    const { data: allData } = await supabase
                        .from('mentores_growth_experience')
                        .select('*')
                        .eq('project_id', projectId);
                    setMentores(allData || []);
                } else {
                    setMentores(data);
                }
            } catch (err) {
                logger.error('Erro ao buscar mentores:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchMentores();
    }, [projectId]);


    const normalizeFilter = (text: string) => {
        const lower = text.toLowerCase();
        if (lower === 'ia' || lower.includes('inteligência artificial')) return ['ia', 'inteligência artificial', 'inteligencia artificial'];
        if (lower.includes('growth')) return ['growth', 'marketing digital', 'marketing'];
        if (lower.includes('vendas')) return ['vendas', 'comercial', 'negociação'];
        if (lower.includes('gestão')) return ['gestão', 'gestao', 'liderança', 'business'];
        return [lower];
    };

    const mentoresSugeridos = mentores.filter(m => {
        if (!m.especialidades) return false;
        const normalizedAreaOptions = normalizeFilter(area);
        return m.especialidades.some((e: string) => {
            const specLower = e.toLowerCase();
            return normalizedAreaOptions.some(opt => specLower.includes(opt) || opt.includes(specLower));
        });
    });

    const renderMentorCard = (mentor: Mentor) => {
        const isSelected = mentorSelecionadoId === mentor.id;

        return (
            <Card
                key={mentor.id}
                onClick={() => onContinuar(mentor.id)}
                className={`group p-5 sm:p-6 cursor-pointer transition-all duration-500 border-white/5 relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center sm:items-stretch ${isSelected
                    ? 'bg-brand-orange-coral/10 border-brand-orange-coral/40 shadow-glow-orange/10 translate-x-1'
                    : 'bg-dark-200/50 hover:bg-dark-300 hover:border-white/10'
                    }`}
            >
                {/* Visual Accent */}
                {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange-coral shadow-[0_0_10px_rgba(255,112,67,0.5)]" />
                )}

                <div className="relative shrink-0 flex flex-col items-center">
                    <div className="relative">
                        {mentor.foto_url ? (
                            <img
                                src={mentor.foto_url}
                                alt={mentor.nome}
                                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover transition-all duration-500 border-2 ${isSelected ? 'border-brand-orange-coral scale-105 shadow-glow-orange/20' : 'border-white/10 grayscale group-hover:grayscale-0 group-hover:scale-105'
                                    }`}
                            />
                        ) : (
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-dark-300 flex items-center justify-center border-2 border-white/5">
                                <User className="h-12 w-12 text-gray-500" />
                            </div>
                        )}
                        {isSelected && (
                            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-brand-orange-coral flex items-center justify-center border-4 border-dark-100 animate-in zoom-in duration-300 shadow-glow-orange/40">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 opacity-60">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="h-2.5 w-2.5 fill-brand-orange-coral text-brand-orange-coral" />
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Gold Mentor</span>
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left flex flex-col justify-between py-1">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{mentor.nome}</h4>
                            <BadgeCheck className="h-5 w-5 text-brand-orange-coral hidden sm:block" />
                        </div>
                        <p className="text-brand-orange-coral/90 text-sm font-bold mb-4 flex items-center justify-center sm:justify-start gap-2">
                            <span className="bg-brand-orange-coral/10 py-0.5 px-2 rounded-md">{mentor.cargo || 'Especialista'}</span>
                            <span className="text-gray-600">@</span>
                            <span>{mentor.empresa}</span>
                        </p>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 italic">
                            "{mentor.bio}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {mentor.especialidades?.map((esp: string) => (
                            <Badge
                                key={esp}
                                variant="secondary"
                                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight py-1 rounded-lg border transition-all ${esp.toLowerCase().includes(area.toLowerCase())
                                    ? 'bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30'
                                    : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}
                            >
                                {esp}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Desktop Selection Button Hint */}
                <div className="hidden lg:flex flex-col items-center justify-center px-4 border-l border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="rounded-full bg-brand-orange-coral hover:bg-brand-orange-intense w-12 h-12 shadow-glow-orange">
                        <ArrowRight className="h-6 w-6" />
                    </Button>
                    <span className="text-[10px] font-black text-gray-500 uppercase mt-2">Escolher</span>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Escolha seu <span className="text-brand-orange-coral">Mentor</span></h3>
                <p className="text-gray-400 text-sm sm:text-lg">Temos especialistas prontos para analisar seu desafio em <span className="text-white font-bold">{area}</span>.</p>
            </div>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-brand-orange-coral/10 border-t-brand-orange-coral animate-spin" />
                            <Search className="h-6 w-6 text-brand-orange-coral absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm animate-pulse">Buscando mentores especialistas...</p>
                    </div>
                ) : mentoresSugeridos.length > 0 ? (
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {mentoresSugeridos.map(renderMentorCard)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-dark-200/50 rounded-[40px] border border-white/5 space-y-8 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-brand-orange-coral/5 flex items-center justify-center mx-auto border border-brand-orange-coral/10">
                            <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-white font-black text-2xl">Nenhum mentor encontrado</h4>
                            <p className="text-gray-500 text-base max-w-md mx-auto px-6">
                                Infelizmente não encontramos mentores especialistas para <strong>{area}</strong> no momento.
                            </p>
                        </div>
                        <Button
                            variant="link"
                            onClick={onVoltar}
                            className="text-brand-orange-coral font-bold text-lg hover:text-brand-orange-intense transition-all"
                        >
                            ← Ver outras áreas
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 sticky bottom-0 bg-dark-100/10 backdrop-blur-sm -mx-4 pb-2">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    className="flex-1 border-white/10 text-white hover:bg-white/10 font-bold h-14 sm:h-16 rounded-2xl"
                >
                    Filtros
                </Button>
                {mentorSelecionadoId && (
                    <Button
                        size="lg"
                        onClick={() => onContinuar(mentorSelecionadoId)}
                        className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 sm:h-16 text-xl rounded-2xl shadow-glow-orange animate-bounce-subtle"
                    >
                        Continuar <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                )}
            </div>
        </div>
    );
}

import { Search } from 'lucide-react';

