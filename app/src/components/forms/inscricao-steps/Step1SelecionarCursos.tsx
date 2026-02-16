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

    const toggleCurso = (cursoId: string) => {
        setSelecionados(prev =>
            prev.includes(cursoId)
                ? prev.filter(id => id !== cursoId)
                : [...prev, cursoId]
        );
    };

    const handleContinuar = () => {
        if (selecionados.length > 0) {
            onContinuar(selecionados);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">
                    Escolha seus Cursos
                </h3>
                <p className="text-gray-400 text-lg">
                    Selecione pelo menos 1 curso para participar (todos são gratuitos!)
                </p>
                {selecionados.length > 0 && (
                    <Badge className="mt-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {selecionados.length} curso{selecionados.length !== 1 ? 's' : ''} selecionado{selecionados.length !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {/* Lista de Cursos */}
            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                {cursosDisponiveis.map((curso) => {
                    const isSelected = selecionados.includes(curso.id);

                    return (
                        <Card
                            key={curso.id}
                            className={`p-6 cursor-pointer transition-all duration-300 ${isSelected
                                    ? 'border-brand-orange-coral bg-brand-orange-coral/10 ring-2 ring-brand-orange-coral/50'
                                    : 'border-white/10 hover:border-brand-orange-coral/30 bg-dark-200/50'
                                }`}
                            onClick={() => toggleCurso(curso.id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <div className="pt-1">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => toggleCurso(curso.id)}
                                        className="border-brand-orange-coral data-[state=checked]:bg-brand-orange-coral"
                                    />
                                </div>

                                {/* Conteúdo */}
                                <div className="flex-1 min-w-0">
                                    {/* Título e Nível */}
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            {curso.titulo}
                                        </h4>
                                        {curso.nivel && (
                                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 flex-shrink-0">
                                                {curso.nivel}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Descrição */}
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                        {curso.descricao}
                                    </p>

                                    {/* Palestrante */}
                                    {curso.palestrante && (
                                        <div className="mb-3">
                                            <p className="text-sm font-semibold text-brand-orange-coral">
                                                {curso.palestrante}
                                                {curso.empresa && (
                                                    <span className="text-gray-500 font-normal"> • {curso.empresa}</span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-brand-orange-coral">
                                            <Clock className="h-4 w-4" />
                                            <span className="font-semibold">
                                                {curso.horario_inicio} - {curso.horario_fim}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{curso.local}</span>
                                        </div>

                                        {curso.vagas && (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Users className="h-4 w-4" />
                                                <span>{curso.vagas} vagas</span>
                                            </div>
                                        )}

                                        <Badge className="bg-green-500/20 text-green-500 border-green-500/40">
                                            GRATUITO
                                        </Badge>
                                    </div>

                                    {/* Tags */}
                                    {curso.tags && curso.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {curso.tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="text-xs border-white/20 text-gray-400"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Footer com Botão */}
            <div className="sticky bottom-0 bg-dark-100 pt-6 border-t border-white/10">
                <Button
                    size="lg"
                    disabled={selecionados.length === 0}
                    onClick={handleContinuar}
                    className="w-full bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selecionados.length === 0
                        ? 'Selecione pelo menos 1 curso'
                        : `Continuar com ${selecionados.length} curso${selecionados.length !== 1 ? 's' : ''}`}
                </Button>

                {selecionados.length === 0 && (
                    <p className="text-center text-sm text-gray-500 mt-3">
                        Você precisa selecionar pelo menos 1 curso para prosseguir
                    </p>
                )}
            </div>
        </div>
    );
}
