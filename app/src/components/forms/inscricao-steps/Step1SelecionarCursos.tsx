import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import { cursosDisponiveis } from '@/data/programacao';

interface Step1SelecionarCursosProps {
    cursosSelecionados: string[];
    onContinuar: (cursos: string[]) => void;
}

export function Step1SelecionarCursos({
    cursosSelecionados: inicial,
    onContinuar
}: Step1SelecionarCursosProps) {
    const [selecionados, setSelecionados] = useState<string[]>(inicial);

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
            <div className="text-left mb-8">
                <h3 className="text-3xl font-black text-white leading-none mb-4">
                    Atividades <span className="text-brand-orange-coral">Disponíveis</span>
                </h3>
                <p className="text-gray-400 text-lg max-w-xl">
                    Selecione uma trilha de conhecimento para personalizar sua jornada no evento.
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
                {cursosDisponiveis.map((curso) => {
                    const isSelected = selecionados.includes(curso.id);

                    return (
                        <div
                            key={curso.id}
                            className={`relative group p-6 rounded-3xl cursor-pointer transition-all duration-500 border-2 overflow-hidden ${isSelected
                                ? 'border-brand-orange-coral bg-brand-orange-coral/5 shadow-[0_10px_30px_rgba(255,112,67,0.15)] ring-1 ring-brand-orange-coral/20'
                                : 'border-white/5 hover:border-white/10 bg-dark-200/40 hover:bg-dark-200/60'
                                }`}
                            onClick={() => selectCurso(curso.id)}
                        >
                            {/* Efeito de Gradiente no Background para o Ativo */}
                            {isSelected && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                            )}

                            <div className="flex items-start gap-6 relative z-10">
                                {/* Radio Circle Customizado */}
                                <div className="pt-1 select-none">
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                                        ? 'border-brand-orange-coral bg-brand-orange-coral'
                                        : 'border-white/10 group-hover:border-white/20 bg-dark-300'}`}>
                                        {isSelected && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                                        )}
                                    </div>
                                </div>

                                {/* Conteúdo do Card */}
                                <div className="flex-1 min-w-0">
                                    {/* Badge de Nível e Título */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                        <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-brand-orange-coral/90 transition-colors">
                                            {curso.titulo}
                                        </h4>
                                        {curso.nivel && (
                                            <Badge className={`px-2 py-0 text-[10px] uppercase font-black tracking-tighter ${curso.nivel === 'Iniciante' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    curso.nivel === 'Intermediário' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                }`}>
                                                {curso.nivel}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Descrição Compacta */}
                                    <p className="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-2">
                                        {curso.descricao}
                                    </p>

                                    {/* Meta Info (Palestrante, Hora, Local) */}
                                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-semibold">
                                        {curso.palestrante && (
                                            <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-brand-orange-coral/10 flex items-center justify-center">
                                                    <Users className="h-3 w-3 text-brand-orange-coral" />
                                                </div>
                                                <span className="text-gray-300">{curso.palestrante}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-brand-orange-coral">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                {curso.horario_inicio} - {curso.horario_fim}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{curso.local}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Action Footer */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                <Button
                    size="lg"
                    disabled={selecionados.length === 0}
                    onClick={handleContinuar}
                    className={`w-full h-14 rounded-2xl font-black text-lg tracking-tight transition-all duration-300 shadow-2xl ${selecionados.length === 0
                            ? 'bg-dark-400 text-gray-600 border border-white/5'
                            : 'bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white shadow-[0_10px_30px_rgba(255,112,67,0.3)] hover:scale-[1.02]'
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
