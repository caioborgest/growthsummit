
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Check, ArrowRight, Loader2, Clock, Search, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import type { Mentor } from '@/types';
import { useMentoringSessions } from '@/hooks/useData';

interface Step2SelecionarMentorProps {
    area: string;
    mentorSelecionadoId: string;
    slotSelecionadoId?: string;
    onContinuar: (mentorId: string, slotId: string, selectedDate: string) => void;
    onVoltar: () => void;
}

export function Step2SelecionarMentor({ area, mentorSelecionadoId, slotSelecionadoId, onContinuar, onVoltar }: Step2SelecionarMentorProps) {
    const [mentores, setMentores] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    const [tempMentorId, setTempMentorId] = useState(mentorSelecionadoId);
    const { projectId } = useProject();
    const { data: allSessions, isLoading: loadingSessions } = useMentoringSessions();

    const [selectedFullSlot, setSelectedFullSlot] = useState<{ slotId: string, date: string } | null>(null);
    const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000';

    // Filter available slots for the selected mentor
    const availableSessionsForMentor = (allSessions || []).filter(s => 
        s.mentorId === tempMentorId && 
        s.status === 'scheduled' && 
        (!s.menteeId || s.menteeId === PLACEHOLDER_ID || s.menteeName === 'Disponível' || s.menteeName === 'Slot Livre')
    );

    // Group available slots by date
    const slotsByDate: Record<string, string[]> = {};
    availableSessionsForMentor.forEach(s => {
        const dateKey = new Date(s.scheduledAt).toISOString().split('T')[0];
        const timeKey = new Date(s.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (!slotsByDate[dateKey]) slotsByDate[dateKey] = [];
        if (!slotsByDate[dateKey].includes(timeKey)) slotsByDate[dateKey].push(timeKey);
    });

    const dates = Object.keys(slotsByDate).sort();

    useEffect(() => {
        async function fetchMentores() {
            try {
                const { data, error } = await (supabase
                    .from('mentores_growth_experience')
                    .select('id,project_id,user_id,nome,email,empresa,cargo,especialidades,bio,foto_url,status,years_experience,max_mentories')
                    .eq('project_id', projectId as any)
                    .in('status', ['aprovado', 'approved']) as any);

                if (error) throw error;
                // Database returns snake_case, but we use camelCase in the app
                const mapped = (data || []).map((m: any) => {
                    let specs = m.especialidades || [];
                    if (typeof specs === 'string') {
                        try {
                            // Tenta parsear se for um JSON stringificado
                            const parsed = JSON.parse(specs);
                            specs = Array.isArray(parsed) ? parsed : [specs];
                        } catch {
                            // Se não for JSON, apenas quebra por vírgula
                            specs = specs.split(',').map((s: string) => s.trim()).filter(Boolean);
                        }
                    }
                    
                    return {
                        id: m.id,
                        projectId: m.project_id,
                        userId: m.user_id,
                        name: m.nome,
                        email: m.email,
                        company: m.empresa,
                        position: m.cargo,
                        specialties: Array.isArray(specs) ? specs : [],
                        bio: m.bio,
                        photo: m.foto_url,
                        status: m.status,
                        yearsExperience: m.years_experience,
                        maxMentories: m.max_mentories
                    };
                });
                setMentores(mapped as any[]);
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
        if (lower.includes('gestão')) return ['gestão', 'gestao', 'liderança', 'business', 'empresarial'];
        if (lower.includes('especializada')) return []; // Mostrar todos para especializada
        return [lower];
    };

    const suggested = mentores.filter(m => {
        if (!m.specialties || m.specialties.length === 0) return false;
        const normalizedAreaOptions = normalizeFilter(area);
        if (normalizedAreaOptions.length === 0) return true; // Mostrar todos se área for muito genérica
        
        return m.specialties.some((e: string) => {
            const specLower = String(e).toLowerCase();
            return normalizedAreaOptions.some(opt => specLower.includes(opt) || opt.includes(specLower));
        });
    });

    // Se não houver sugestões, mostrar todos os mentores aprovados como fallback
    const mentoresExibidos = suggested.length > 0 ? suggested : mentores;

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">Escolha seu <span className="text-brand-orange-coral">Mentor e Horário</span></h3>
                <p className="text-gray-400 text-sm sm:text-lg">Selecione o especialista e o spot de 20 minutos desejado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Lista de Mentores */}
                <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest px-1 mb-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Search className="h-3 w-3 text-brand-orange-coral" /> Especialistas em {area}
                        </div>
                        {suggested.length === 0 && (
                            <span className="text-[9px] text-gray-500 lowercase font-normal italic">Mostrando todos os mentores</span>
                        )}
                    </h4>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <Loader2 className="h-8 w-8 text-brand-orange-coral animate-spin" />
                            <p className="text-gray-500 text-xs font-bold uppercase">Buscando mentores...</p>
                        </div>
                    ) : (
                        mentoresExibidos.map(mentor => {
                            const isSelected = tempMentorId === mentor.id;
                            
                            // Calcular avaliação média
                            const mentorCompletedSessions = (allSessions || []).filter(s => 
                                s.mentorId === mentor.id && 
                                s.status === 'completed' && 
                                s.feedback?.avaliacaoMentoria
                            );
                            
                            const totalRating = mentorCompletedSessions.reduce((acc, s) => acc + (s.feedback?.avaliacaoMentoria || 0), 0);
                            const avgRating = mentorCompletedSessions.length > 0 ? (totalRating / mentorCompletedSessions.length).toFixed(1) : null;

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
                                        {mentor.photo ? (
                                            <img src={mentor.photo} alt={mentor.name} className="w-16 h-16 rounded-2xl object-cover" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-dark-300 flex items-center justify-center"><User size={24} className="text-gray-600" /></div>
                                        )}
                                        {avgRating && (
                                            <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full px-2 py-0.5 border-2 border-dark-100 flex items-center gap-1 shadow-lg">
                                                <Star size={8} className="text-black fill-black" />
                                                <span className="text-[9px] font-black text-black">{avgRating}</span>
                                            </div>
                                        )}
                                        {isSelected && !avgRating && (
                                            <div className="absolute -top-2 -right-2 bg-brand-orange-coral rounded-full p-1 border-2 border-dark-100">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-lg font-black text-white italic leading-tight truncate">{mentor.name}</h5>
                                        <p className="text-gray-500 text-xs font-bold truncate mt-1">{mentor.position} @ {mentor.company}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex gap-1">
                                                {mentor.specialties?.slice(0, 3).map((e: string) => <Badge key={e} className="text-[8px] bg-white/5 text-gray-400 border-none font-black uppercase">{e}</Badge>)}
                                            </div>
                                            {mentorCompletedSessions.length > 0 && (
                                                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">
                                                    {mentorCompletedSessions.length} {mentorCompletedSessions.length === 1 ? 'Avaliação' : 'Avaliações'}
                                                </span>
                                            )}
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
                            {loading || loadingSessions ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 text-brand-orange-coral animate-spin" />
                                </div>
                            ) : !tempMentorId ? (
                                <p className="text-gray-500 text-[10px] font-bold uppercase text-center py-4">
                                    Selecione um mentor para ver os horários
                                </p>
                            ) : dates.length > 0 ? (
                                <div className="space-y-6">
                                    {dates.map(date => (
                                        <div key={date} className="space-y-3">
                                            <p className="text-[10px] text-brand-orange-coral font-black uppercase tracking-widest px-1">
                                                {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' }).toUpperCase()}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {slotsByDate[date].sort().map(time => {
                                                    const isSelected = selectedFullSlot?.slotId === time && selectedFullSlot?.date === date;
                                                    return (
                                                        <button
                                                            key={`${date}-${time}`}
                                                            onClick={() => setSelectedFullSlot({ slotId: time, date })}
                                                            className={`px-3 py-2.5 rounded-xl text-[10px] font-black transition-all border ${isSelected
                                                                ? 'bg-brand-orange-coral text-white border-brand-orange-coral shadow-glow-orange/20'
                                                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-[10px] font-bold uppercase leading-relaxed">
                                        Nenhum horário disponível<br />para este mentor ainda.
                                    </p>
                                </div>
                            )}
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
                    disabled={!tempMentorId || !selectedFullSlot}
                    onClick={() => onContinuar(tempMentorId, selectedFullSlot!.slotId, selectedFullSlot!.date)}
                    className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-14 sm:h-16 text-xl rounded-2xl shadow-glow-orange disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                >
                    Continuar <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
}
