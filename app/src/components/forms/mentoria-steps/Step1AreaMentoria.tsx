
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, ArrowRight } from 'lucide-react';
import { areasMentoria } from '@/data/mentores';

interface Step1AreaMentoriaProps {
    areaSelecionada: string;
    onContinuar: (area: string) => void;
}

export function Step1AreaMentoria({ areaSelecionada, onContinuar }: Step1AreaMentoriaProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-3">Qual sua maior dor hoje?</h3>
                <p className="text-gray-400 text-lg">Selecione o tema da sua mentoria 1:1</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areasMentoria.map((area) => (
                    <Card
                        key={area}
                        onClick={() => onContinuar(area)}
                        className={`p-6 cursor-pointer transition-all hover:scale-105 border-white/10 ${areaSelecionada === area
                                ? 'bg-brand-orange-coral/20 border-brand-orange-coral shadow-glow-orange'
                                : 'bg-dark-200 hover:bg-dark-300'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${areaSelecionada === area ? 'bg-brand-orange-coral text-white' : 'bg-brand-blue/20 text-brand-orange-coral'
                                }`}>
                                <Target className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{area}</h4>
                                <p className="text-xs text-gray-400">Mentoria Individual</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {areaSelecionada && (
                <div className="flex justify-center pt-6">
                    <Button
                        size="lg"
                        onClick={() => onContinuar(areaSelecionada)}
                        className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold px-12 py-7 text-lg rounded-xl"
                    >
                        Continuar <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
