
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Check, ArrowRight, Loader2, Clock, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import { MENTORSHIP_TIME_SLOTS } from './mentoriaTypes';

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
    slotSelecionadoId: string;
    onContinuar: (mentorId: string, slotId: string) => void;
    onVoltar: () => void;
}

export function Step2SelecionarMentor({ area, mentorSelecionadoId, slotSelecionadoId, onContinuar, onVoltar }: Step2SelecionarMentorProps) {
    const [mentores, setMentores] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [tempMentorId, setTempMentorId] = useState(mentorSelecionadoId);
    const [tempSlotId, setTempSlotId] = useState(slotSelecionadoId);
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
                setMentores(data || []);
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

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Escolha seu <span className="text-brand-orange-coral">Mentor e Horário</span></h3>
                <p className="text-gray-400 text-sm sm:text-lg">Selecione o especialista e o spot de 20 minutos desejado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Lista de Mentores */}
                <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest px-1 mb-4 flex items-center gap-2">
                        <Search className="h-3 w-3 text-brand-orange-coral" /> Especialistas em {area}
                    </h4>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 text-brand-orange-coral animate-spin" />
                            <p className="text-gray-500 text-xs font-bold uppercase">Buscando mentores...</p>
                        </div>
                    ) : (
                        mentoresSugeridos.map(mentor => {
                            const isSelected = tempMentorId === mentor.id;
                            return (
                                <Card
                                    key={mentor.id}
                                    onClick={() => setTempMentorId(mentor.id)}
                                    className={`group p-4 cursor-pointer transition-all duration-300 border-white/5 flex gap-5 items-center ${isSelected
                                        ? 'bg-brand-orange-coral/10 border-brand-orange-coral/40 shadow-glow-orange/5'
                                        : 'bg-dark-200/50 hover:bg-dark-300 hover:border-white/10'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        {mentor.foto_url ? (
                                            <img src={mentor.foto_url} alt={mentor.nome} className="w-16 h-16 rounded-2xl object-cover" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-dark-300 flex items-center justify-center"><User size={24} className="text-gray-600" /></div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 bg-brand-orange-coral rounded-full p-1 border-2 border-dark-100">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-lg font-black text-white italic leading-tight truncate">{mentor.nome}</h5>
                                        <p className="text-gray-500 text-xs font-bold truncate mt-1">{mentor.cargo} @ {mentor.empresa}</p>
                                        <div className="flex gap-1 mt-2">
                                            {mentor.especialidades?.slice(0, 3).map(e => <Badge key={e} className="text-[8px] bg-white/5 text-gray-400 border-none font-black uppercase">{e}</Badge>)}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Grid de Horários */}
                <div className="lg:col-span-4 space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest px-1 mb-4 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-brand-orange-coral" /> Spots Disponíveis
                    </h4>
                    <Card className="glass-card p-4 border-white/5 bg-dark-200/30 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 gap-2">
                            {MENTORSHIP_TIME_SLOTS.map(slot => {
                                const isSelected = tempSlotId === slot.id;
                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => setTempSlotId(slot.id)}
                                        className={`px-4 py-3 rounded-xl text-xs font-black transition-all border ${isSelected
                                            ? 'bg-brand-orange-coral text-white border-brand-orange-coral shadow-glow-orange/20'
                                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        {slot.label}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>
                    <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight p-2 italic text-center">
                        * Duração máxima: 20 minutos
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-10 sticky bottom-0 bg-dark-100/10 backdrop-blur-sm -mx-4 pb-2">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onVoltar}
                    className="flex-1 border-white/10 text-white hover:bg-white/10 font-bold h-14 sm:h-16 rounded-2xl"
                >
                    Voltar
                </Button>
                <Button
                    size="lg"
                    disabled={!tempMentorId || !tempSlotId}
                    onClick={() => onContinuar(tempMentorId, tempSlotId)}
                    className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 sm:h-16 text-xl rounded-2xl shadow-glow-orange disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                >
                    Continuar <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
