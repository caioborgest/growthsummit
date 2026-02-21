
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
            <div className="text-left sm:text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">Qual sua maior dor hoje?</h3>
                <p className="text-gray-400 text-sm sm:text-lg">Selecione o tema da sua mentoria 1:1</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {areasMentoria.map((area) => (
                    <Card
                        key={area}
                        onClick={() => onContinuar(area)}
                        className={`p-4 sm:p-6 cursor-pointer transition-all hover:scale-[1.02] sm:hover:scale-105 border-white/10 ${areaSelecionada === area
                            ? 'bg-brand-orange-coral/20 border-brand-orange-coral shadow-glow-orange/20'
                            : 'bg-dark-200 hover:bg-dark-300'
                            }`}
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${areaSelecionada === area ? 'bg-brand-orange-coral text-white' : 'bg-brand-blue/20 text-brand-orange-coral'
                                }`}>
                                <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-base sm:text-lg leading-tight">{area}</h4>
                                <p className="text-[10px] sm:text-xs text-gray-400">Mentoria Individual</p>
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
                        className="w-full sm:w-auto bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold px-12 h-12 sm:h-14 text-lg rounded-xl"
                    >
                        Continuar <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
