import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useData';
import { Loader2, Clock, MapPin, Users, CheckCircle, X } from 'lucide-react';

interface Step1SelecionarCursosProps {
    cursosSelecionados: string[];
    onContinuar: (cursos: string[]) => void;
    onVoltar?: () => void;
}

export function Step1SelecionarCursos({
    cursosSelecionados: inicial,
    onContinuar,
    onVoltar
}: Step1SelecionarCursosProps) {
    const { data: sessions, isLoading } = useSessions();
    const [selecionados, setSelecionados] = useState<string[]>(inicial);

    // Mostrar toda a programação diurna disponível no banco
    const cursosDisponiveis = sessions.filter(s => {
        const category = (s.category as string)?.toLowerCase();

        // Excluir apenas atividades noturnas (que possuem fluxo de upgrade próprio no passo 4)
        if (category === 'noturna') return false;

        // Inclui tudo que for diurno (Salão Principal, Salas 1, 2, 3, etc)
        return true;
    });

    const selectCurso = (cursoId: string) => {
        // Apenas 1 seleção permitida
        setSelecionados([cursoId]);
    };

    const handleContinuar = () => {
        if (selecionados.length === 1) {
            onContinuar(selecionados);
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
                    Selecione uma atividade para personalizar sua jornada. Cada atividade tem vagas limitadas.
                </p>
                {selecionados.length > 0 && (
                    <div className="mt-4 flex animate-bounce-subtle">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-1.5 text-[10px] uppercase tracking-widest font-black shadow-glow-green">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            PRONTO PARA PROSSEGUIR
                        </Badge>
                    </div>
                )}
            </div>

            {/* Lista de Cursos */}
            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-12 w-12 animate-spin mb-4 text-brand-orange-coral" />
                        <p className="font-bold uppercase tracking-widest text-xs">Carregando atividades...</p>
                    </div>
                ) : cursosDisponiveis.length > 0 ? (
                    cursosDisponiveis.map((curso) => {
                        const isSelected = selecionados.includes(curso.id);
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
                                {/* Efeito de Gradiente no Background para o Ativo */}
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-coral/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                                )}

                                <div className="flex items-start gap-6 sm:gap-8 relative z-10">
                                    {/* Radio Circle Customizado */}
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

                                    {/* Conteúdo do Card */}
                                    <div className="flex-1 min-w-0">
                                        {/* Badge de Tipo, Nível e Título */}
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
                                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{(curso.maxCapacity ?? 0) - (curso.registeredCount || 0)} vagas restantes</span>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className={`text-xl sm:text-2xl font-black tracking-tight mb-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                            {curso.title}
                                        </h4>

                                        {/* Descrição Compacta */}
                                        <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed line-clamp-2 font-medium">
                                            {curso.description}
                                        </p>

                                        {/* Meta Info (Palestrante, Hora, Local) */}
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {onVoltar && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onVoltar}
                            className="h-16 px-10 rounded-2xl font-black text-gray-400 border-white/10 hover:bg-white/5 uppercase tracking-widest text-xs"
                        >
                            Sair
                        </Button>
                    )}
                    <Button
                        size="lg"
                        disabled={selecionados.length === 0}
                        onClick={handleContinuar}
                        className={`flex-1 h-16 rounded-2xl font-black text-lg sm:text-x; tracking-tight transition-all duration-300 shadow-2xl ${selecionados.length === 0
                            ? 'bg-dark-400 text-gray-600 border border-white/5'
                            : 'bg-brand-orange-coral hover:bg-brand-orange-intense text-white shadow-[0_15px_40px_rgba(255,112,67,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {selecionados.length === 0
                            ? 'Selecione uma Trilhas'
                            : 'Confirmar Escolha & Próximo Passo'}
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-4 py-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange-coral w-[14%]" />
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-black whitespace-nowrap">
                        Etapa 1 de 7 • Escolha Atividade
                    </p>
                    <div className="h-1 flex-1 bg-white/5 rounded-full" />
                </div>
            </div>
        </div>
    );
}
