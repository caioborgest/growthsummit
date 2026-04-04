import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useData';
import { Loader2, Clock, MapPin, Users, CheckCircle, X } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

interface Step1SelecionarCursosProps {
    selectedSessions: string[];
    onContinuar: (cursos: string[]) => void;
    onVoltar?: () => void;
}

export function Step1SelecionarCursos({
    selectedSessions: inicial,
    onContinuar,
    onVoltar
}: Step1SelecionarCursosProps) {
    const { data: sessions, isLoading } = useSessions();
    const { projectId, selectedProject } = useProject();
    const [selectedIds, setSelectedIds] = useState<string[]>(inicial);

    // Debug log (client-side console)
    useEffect(() => {
        console.log(`[Step1] Loading state:`, { isLoading, projectId, sessionsCount: sessions?.length });
        
        if (sessions && sessions.length > 0) {
            console.log(`[Step1] ${sessions.length} sessions loaded for project:`, selectedProject?.name || projectId);
        } else if (!isLoading) {
            console.warn(`[Step1] No sessions found for project:`, {
                id: projectId || selectedProject?.id,
                slug: selectedProject?.slug,
                name: selectedProject?.name
            });
        }
    }, [sessions, isLoading, selectedProject, projectId]);

    const isTriunfo = selectedProject?.slug?.toLowerCase().includes('triunfo') || 
                      selectedProject?.name?.toLowerCase().includes('triunfo') ||
                      selectedProject?.id === 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

    const cursosDisponiveis = useMemo(() => {
        if (!sessions) return [];
        
        return sessions.filter(s => {
            const category = s.category?.toLowerCase() || '';
            
            // Debug individual session if Triunfo and empty list
            if (isTriunfo && sessions.length < 5) {
                console.debug("[Step1] Assessing session for Triunfo:", s.title, "category:", category);
            }

            // At Triunfo, we accept everything that belongs as it is a single package
            if (isTriunfo) {
                return true; 
            }
            
            // For other projects, maintain original filter (exclude nocturnals which are usually private/paid)
            if (category === 'noturna') return false;
            
            return true;
        });
    }, [sessions, isTriunfo]);

    // For Triunfo, selections are derived from available courses
    const selectedIdsFinal = isTriunfo ? cursosDisponiveis.map(c => c.id) : selectedIds;

    const selectCurso = (cursoId: string) => {
        // At Triunfo, we don't allow unselecting as it's a fixed bundle
        if (isTriunfo) return;

        // Only 1 selection allowed for other events/registration types
        setSelectedIds([cursoId]);
    };

    const handleContinuar = () => {
        if (selectedIdsFinal.length > 0) {
            onContinuar(selectedIdsFinal);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-left">
                <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2 sm:mb-4 tracking-tighter">
                    TRILHAS <span className="text-brand-orange-coral italic underline decoration-brand-orange-coral/30">DISPONÍVEIS</span>
                </h3>
                <p className="text-gray-400 text-base sm:text-lg max-w-xl font-medium">
                    {isTriunfo 
                        ? 'Confira a programação completa inclusa no seu ingresso.' 
                        : 'Selecione uma atividade para personalizar sua jornada. Cada atividade tem vagas limitadas.'}
                </p>
                {selectedIdsFinal.length > 0 && (
                    <div className="mt-4 flex animate-bounce-subtle">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1.5 text-[10px] uppercase tracking-widest font-black shadow-glow-green">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            PRONTO PARA CONTINUAR
                        </Badge>
                    </div>
                )}
            </div>

            {/* Course List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-brand-orange-coral" />
                        <p className="font-bold uppercase tracking-widest text-xs">Carregando atividades...</p>
                    </div>
                ) : cursosDisponiveis.length > 0 ? (
                    cursosDisponiveis.map((curso) => {
                        const isSelected = selectedIdsFinal.includes(curso.id);
                        const isFull = (curso.maxCapacity ?? 0) > 0 && (curso.registeredCount || 0) >= (curso.maxCapacity ?? 0);

                        return (
                            <div
                                key={curso.id}
                                className={`relative group p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 border-2 overflow-hidden ${isSelected
                                    ? 'border-brand-orange-coral bg-brand-orange-coral/10 shadow-[0_20px_50px_rgba(255,112,67,0.2)] ring-1 ring-brand-orange-coral/30'
                                    : isFull
                                        ? 'border-red-500/20 bg-red-500/5 cursor-not-allowed opacity-60'
                                        : 'border-white/5 hover:border-white/10 bg-dark-200/40 hover:bg-dark-200/60 cursor-pointer hover:translate-y-[-4px]'
                                    }`}
                                onClick={() => !isFull && selectCurso(curso.id)}
                            >
                                {/* Gradient Effect for Active */}
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-coral/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                                )}

                                <div className="flex items-start gap-6 sm:gap-8 relative z-10">
                                    {/* Custom Radio Circle */}
                                    <div className="pt-2 select-none">
                                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                            ? 'border-brand-orange-coral bg-brand-orange-coral shadow-[0_0_15px_rgba(255,112,67,0.5)]'
                                            : isFull
                                                ? 'border-red-500/30 bg-red-500/10'
                                                : 'border-white/10 group-hover:border-white/20 bg-dark-300'}`}>
                                            {isSelected && (
                                                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-sm" />
                                            )}
                                            {isFull && !isSelected && (
                                                <X className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Badges and Title */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`px-3 py-0.5 text-[10px] sm:text-[11px] uppercase font-black tracking-wider ${curso.type === 'workshop' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]' :
                                                    curso.type === 'circuito' ? 'bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/20' :
                                                        curso.type === 'palestra' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            curso.type === 'curso' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {(curso.type || 'CURSO').toUpperCase()}
                                                </Badge>
                                                {isFull && (
                                                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px] font-black tracking-widest">
                                                        ESGOTADO
                                                    </Badge>
                                                )}
                                            </div>
                                            {(curso.maxCapacity ?? 0) > 0 && !isFull && (
                                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{(curso.maxCapacity ?? 0) - (curso.registeredCount || 0)} vagas restantes</span>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                            {curso.title}
                                        </h4>

                                        {/* Description */}
                                        <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2 font-medium">
                                            {curso.description}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-[11px] sm:text-[13px] font-bold text-gray-400">
                                            {curso.speakers && Array.isArray(curso.speakers) && curso.speakers.length > 0 && (
                                                <div className="flex items-center gap-2.5 group-hover:text-white transition-colors capitalize">
                                                    <div className="w-7 h-7 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center">
                                                        <Users className="h-4 w-4 text-brand-orange-coral" />
                                                    </div>
                                                    <span>{curso.speakers.join(', ')}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2.5 text-brand-orange-coral">
                                                <div className="w-7 h-7 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center">
                                                    <Clock className="h-4 w-4" />
                                                </div>
                                                <span>
                                                    {curso.startTime} - {curso.endTime}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <span>{curso.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-dark-200/40 rounded-[2rem] border-2 border-dashed border-white/5">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">Nenhuma atividade disponível no momento.</p>
                    </div>
                )}
            </div>

            {/* Sticky Action Footer */}
            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="form-actions flex gap-2">
                    {onVoltar && (
                        <button type="button" onClick={onVoltar} className="btn-form-back">
                            Voltar
                        </button>
                    )}
                    <button
                        type="button"
                        disabled={selectedIdsFinal.length === 0}
                        onClick={handleContinuar}
                        className={`btn-form-primary flex-1 ${selectedIdsFinal.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                        {selectedIdsFinal.length === 0
                            ? 'Selecione sua Trilha'
                            : 'Confirmar e Próximo Passo'}
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange-coral w-[14%]" />
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black whitespace-nowrap">
                        Passo 1 de 7 • Escolha a Atividade
                    </p>
                    <div className="h-1 flex-1 bg-white/5 rounded-full" />
                </div>
            </div>

        </div>
    );
}
