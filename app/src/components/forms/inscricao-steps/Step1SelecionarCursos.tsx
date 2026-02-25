import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useData';
import { Loader2, Clock, MapPin, Users, CheckCircle, X } from 'lucide-react';

interface Step1SelecionarCursosProps {
    cursosSelecionados: string[];
    onContinuar: (cursos: string[]) => void;
}

export function Step1SelecionarCursos({
    cursosSelecionados: inicial,
    onContinuar
}: Step1SelecionarCursosProps) {
    const { data: sessions, isLoading } = useSessions();
    const [selecionados, setSelecionados] = useState<string[]>(inicial);

    // Filtrar sessões que são cursos/oficinas (tipo 'workshop' ou 'circuito')
    const cursosDisponiveis = sessions.filter(s =>
        (s.type as string) === 'workshop' || (s.type as string) === 'circuito'
    );

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
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 sm:mb-4">
                    Atividades <span className="text-brand-orange-coral">Disponíveis</span>
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-xl">
                    Selecione uma atividade para personalizar sua jornada no evento. Cursos, oficinas e workshops disponíveis.
                </p>
                {selecionados.length > 0 && (
                    <div className="mt-4 flex animate-fade-in">
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1 text-xs uppercase tracking-widest font-bold">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Pronto para prosseguir
                        </Badge>
                    </div>
                )}
            </div>

            {/* Lista de Cursos */}
            <div className="grid gap-4 pr-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-brand-orange-coral" />
                        <p>Carregando atividades...</p>
                    </div>
                ) : cursosDisponiveis.length > 0 ? (
                    cursosDisponiveis.map((curso) => {
                        const isSelected = selecionados.includes(curso.id);
                        const isFull = (curso.maxCapacity ?? 0) > 0 && (curso.registeredCount || 0) >= (curso.maxCapacity ?? 0);

                        return (
                            <div
                                key={curso.id}
                                className={`relative group p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all duration-500 border-2 overflow-hidden ${isSelected
                                    ? 'border-brand-orange-coral bg-brand-orange-coral/5 shadow-[0_10px_30px_rgba(255,112,67,0.15)] ring-1 ring-brand-orange-coral/20'
                                    : isFull
                                        ? 'border-red-500/20 bg-red-500/5 cursor-not-allowed opacity-60'
                                        : 'border-white/5 hover:border-white/10 bg-dark-200/40 hover:bg-dark-200/60 cursor-pointer'
                                    }`}
                                onClick={() => !isFull && selectCurso(curso.id)}
                            >
                                {/* Efeito de Gradiente no Background para o Ativo */}
                                {isSelected && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                                )}

                                <div className="flex items-start gap-6 relative z-10">
                                    {/* Radio Circle Customizado */}
                                    <div className="pt-0.5 sm:pt-1 select-none">
                                        <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                            ? 'border-brand-orange-coral bg-brand-orange-coral'
                                            : isFull
                                                ? 'border-red-500/30 bg-red-500/10'
                                                : 'border-white/10 group-hover:border-white/20 bg-dark-300'}`}>
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 sm:w-2.5 sm:w-2.5 rounded-full bg-white shadow-sm" />
                                            )}
                                            {isFull && !isSelected && (
                                                <X className="h-3 w-3 text-red-500" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Conteúdo do Card */}
                                    <div className="flex-1 min-w-0">
                                        {/* Badge de Tipo, Nível e Título */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={`px-2 py-0 text-[10px] uppercase font-black tracking-tighter ${curso.type === 'workshop' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    curso.type === 'circuito' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {(curso.type || 'CURSO').toUpperCase()}
                                                </Badge>
                                                {isFull && (
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/30 text-[10px] uppercase font-black">
                                                        ESGOTADO
                                                    </Badge>
                                                )}
                                            </div>
                                            {(curso.maxCapacity ?? 0) > 0 && !isFull && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                    <Users className="h-3 w-3" />
                                                    <span>{(curso.maxCapacity ?? 0) - (curso.registeredCount || 0)} vagas restantes</span>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-orange-coral/90 transition-colors">
                                            {curso.title}
                                        </h4>

                                        {/* Descrição Compacta */}
                                        <p className="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-2">
                                            {curso.description}
                                        </p>

                                        {/* Meta Info (Palestrante, Hora, Local) */}
                                        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-semibold">
                                            {curso.speakers && Array.isArray(curso.speakers) && curso.speakers.length > 0 && (
                                                <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-brand-orange-coral/10 flex items-center justify-center">
                                                        <Users className="h-3 w-3 text-brand-orange-coral" />
                                                    </div>
                                                    <span className="text-gray-300">{curso.speakers.join(', ')}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-brand-orange-coral">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {curso.startTime} - {curso.endTime}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-500">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span>{curso.room}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-dark-200/40 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 italic">Nenhuma atividade disponível no momento.</p>
                    </div>
                )}
            </div>

            {/* Sticky Action Footer */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                <Button
                    size="lg"
                    disabled={selecionados.length === 0}
                    onClick={handleContinuar}
                    className={`w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg tracking-tight transition-all duration-300 shadow-2xl ${selecionados.length === 0
                        ? 'bg-dark-400 text-gray-600 border border-white/5'
                        : 'bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white shadow-[0_10px_30px_rgba(255,112,67,0.3)]'
                        }`}
                >
                    {selecionados.length === 0
                        ? 'Selecione uma trilha'
                        : 'Confirmar Escolha'}
                </Button>

                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
                    Passo 1 de 6 • Escolha Obrigatória
                </p>
            </div>
        </div>
    );
}
