
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, ArrowRight } from 'lucide-react';
import { areasMentoria } from '@/data/mentores';

interface Step1AreaMentoriaProps {
    areaSelecionada: string;
    descricaoProblema: string;
    onContinuar: (area: string, descricao: string) => void;
}

export function Step1AreaMentoria({ areaSelecionada, descricaoProblema, onContinuar }: Step1AreaMentoriaProps) {
    const [tempArea, setTempArea] = useState(areaSelecionada);
    const [tempDesc, setTempDesc] = useState(descricaoProblema);

    return (
        <div className="space-y-8">
            <div className="text-left sm:text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">Como podemos te ajudar?</h3>
                <p className="text-gray-400 text-sm sm:text-lg">Selecione o tema e descreva brevemente seu desafio.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {areasMentoria.map((area) => (
                        <Card
                            key={area}
                            onClick={() => setTempArea(area)}
                            className={`p-4 sm:p-5 cursor-pointer transition-all hover:scale-[1.02] border-white/10 ${tempArea === area
                                ? 'bg-brand-orange-coral/20 border-brand-orange-coral shadow-glow-orange/20'
                                : 'bg-dark-200 hover:bg-dark-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tempArea === area ? 'bg-brand-orange-coral text-white' : 'bg-brand-blue/20 text-brand-orange-coral'
                                    }`}>
                                    <Target className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold text-white text-sm sm:text-base leading-tight">{area}</h4>
                            </div>
                        </Card>
                    ))}
                </div>

                {tempArea && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="text-sm font-medium text-gray-300 block">
                            Descreva seu problema ou situação que deseja atenção do mentor *
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none resize-none"
                            value={tempDesc}
                            onChange={e => setTempDesc(e.target.value)}
                            placeholder="Ex: Minha empresa fatura X e gostaria de escalar para Y utilizando tráfego pago mas estou com dificuldade no CAC..."
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-center pt-6">
                <Button
                    size="lg"
                    disabled={!tempArea || !tempDesc || tempDesc.length < 10}
                    onClick={() => onContinuar(tempArea, tempDesc)}
                    className="w-full sm:w-auto bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-bold px-12 h-12 sm:h-14 text-lg rounded-xl shadow-glow-orange"
                >
                    Buscar Mentores <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

import { useState } from 'react';
