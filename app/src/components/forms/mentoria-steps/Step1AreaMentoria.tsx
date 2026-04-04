
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Zap,
    ArrowRight,
    DollarSign,
    Brain,
    Briefcase,
    Lightbulb,
    Users,
    TrendingUp,
    Smartphone,
    Settings,
    PieChart,
    MessageSquare,
    Target,
    Building2,
    BarChart
} from 'lucide-react';
import { areasMentoria } from '@/data/mentores';

const iconMap: Record<string, any> = {
    'Growth Marketing': Zap,
    'Vendas': DollarSign,
    'Inteligência Artificial': Brain,
    'Gestão Empresarial': Briefcase,
    'Inovação': Lightbulb,
    'Liderança': Users,
    'Escala': TrendingUp,
    'Marketing Digital': Smartphone,
    'Operações & Processos': Settings,
    'Finanças': PieChart,
    'Mentoria Especializada': Target
};

interface Step1AreaMentoriaProps {
    areaSelecionada: string;
    problemDescription: string;
    businessName?: string;
    businessStage?: string;
    onContinuar: (area: string, description: string, business: string, stage: string) => void;
    onVoltar?: () => void;
}

export function Step1AreaMentoria({ areaSelecionada, problemDescription, businessName = '', businessStage = '', onContinuar, onVoltar }: Step1AreaMentoriaProps) {
    const [tempArea, setTempArea] = useState(areaSelecionada);
    const [tempDescription, setTempDescription] = useState(problemDescription);
    const [tempBusiness, setTempBusiness] = useState(businessName);
    const [tempStage, setTempStage] = useState(businessStage);

    const stages = [
        'Ideação / MVP',
        'Operação Inicial (Early Stage)',
        'Tração / Crescimento',
        'Escala (Scale-up)',
        'Empresa Consolidada'
    ];

    return (
        <div className="space-y-10">
            <div className="text-left sm:text-center max-w-2xl mx-auto">
                <h3 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight px-1">
                    Qual o seu maior <span className="text-brand-orange-coral">desafio</span> hoje?
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg px-2">
                    Preencha os dados do seu negócio e selecione a área para encontrarmos o mentor ideal.
                </p>
            </div>

            <div className="space-y-8">
                {/* Dados do Negócio */}
                <Card className="glass-card p-6 border-white/5 bg-dark-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Building2 size={14} className="text-brand-orange-coral" /> Nome do Negócio
                            </label>
                            <input
                                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-orange-coral transition-all"
                                placeholder="Sua Startup ou Empresa"
                                value={tempBusiness}
                                onChange={e => setTempBusiness(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <BarChart size={14} className="text-brand-orange-coral" /> Estágio Atual
                            </label>
                            <select
                                className="w-full bg-dark-300 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-brand-orange-coral transition-all appearance-none"
                                value={tempStage}
                                onChange={e => setTempStage(e.target.value)}
                            >
                                <option value="" disabled>Selecione o estágio</option>
                                {stages.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Grid de Áreas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                    {areasMentoria.map((area) => {
                        const Icon = iconMap[area] || Target;
                        const isActive = tempArea === area;

                        return (
                            <Card
                                key={area}
                                onClick={() => setTempArea(area)}
                                className={`group p-4 sm:p-5 cursor-pointer transition-all duration-300 border-white/5 relative overflow-hidden flex flex-col justify-center min-h-[100px] ${isActive
                                    ? 'bg-brand-orange-coral/15 border-brand-orange-coral/50 shadow-glow-orange/20 translate-y-[-4px]'
                                    : 'bg-dark-200/50 hover:bg-dark-300 hover:border-white/10 hover:translate-y-[-2px]'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive
                                        ? 'bg-brand-orange-coral text-white scale-110'
                                        : 'bg-white/5 text-brand-orange-coral group-hover:bg-white/10'
                                        }`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h4 className={`font-bold text-sm sm:text-base leading-tight transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                                        }`}>
                                        {area}
                                    </h4>
                                </div>
                                {isActive && (
                                    <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
                                        <Icon className="h-20 w-20 text-brand-orange-coral" />
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {tempArea && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-6 duration-700 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-brand-orange-coral" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Conte seu desafio/problema</h4>
                                <p className="text-gray-500 text-xs">Descreva exatamente o que deseja resolver nesta sessão.</p>
                            </div>
                        </div>

                        <textarea
                            required
                            rows={4}
                            className="w-full px-5 py-4 bg-dark-200/50 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand-orange-coral outline-none resize-none placeholder:text-gray-600 transition-all"
                            value={tempDescription}
                            onChange={e => setTempDescription(e.target.value)}
                            placeholder="Ex: Gostaria de escalar meu negócio utilizando tráfego pago mas estou com dificuldade no CAC em relação ao LTV..."
                        />
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest px-2">
                            <span className={tempDescription.length >= 10 ? 'text-green-500' : 'text-gray-600'}>
                                Mínimo 10 caracteres
                            </span>
                            <span className="text-gray-600">
                                {tempDescription.length} caracteres
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 pb-6">
                {onVoltar && (
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onVoltar}
                        className="w-full sm:w-auto px-12 h-16 rounded-2xl font-bold text-gray-400 border-white/10 hover:bg-white/5"
                    >
                        Voltar
                    </Button>
                )}
                <Button
                    size="lg"
                    disabled={!tempArea || !tempDescription || tempDescription.length < 10 || !tempBusiness || !tempStage}
                    onClick={() => onContinuar(tempArea, tempDescription, tempBusiness, tempStage)}
                    className={`flex-1 sm:w-auto px-12 h-16 rounded-2xl font-black text-xl transition-all duration-500 shadow-xl ${!tempArea || !tempDescription || tempDescription.length < 10 || !tempBusiness || !tempStage
                        ? 'bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-brand-orange-coral hover:bg-brand-orange-intense text-white shadow-glow-orange hover:scale-[1.02] active:scale-95'
                        }`}
                >
                    Próximo Passo <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
