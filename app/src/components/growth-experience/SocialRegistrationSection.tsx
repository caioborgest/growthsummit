import { Trophy, Award, Landmark, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SectionShare } from '../social/SectionShare';

interface SocialRegistrationSectionProps {
    onInscrever: () => void;
}

import { useProject } from '@/contexts/ProjectContext';

export function SocialRegistrationSection({ onInscrever }: SocialRegistrationSectionProps) {
    const { selectedProject } = useProject();
    return (
        <section id="inscricao-social" className="py-24 bg-dark-200 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-orange-coral/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-brand-orange-coral/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 underline-offset-4">
                                <Landmark className="h-5 w-5" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Parceria Público-Privada</span>
                            </div>
                            <SectionShare sectionId="inscricao-social" title="Programa Social Growth Experience" />
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Programa de Inscrição <span className="text-gradient">Social</span>
                        </h2>

                        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                            Em parceria com as prefeituras e lideranças políticas da região, lançamos um programa para democratizar o acesso ao conhecimento e estimular o empreendedorismo local.
                        </p>

                        <div className="space-y-6 mb-10">
                            <Card className="p-6 bg-white/5 border-white/10 hover:border-brand-orange-coral/30 transition-all group">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange-coral transition-colors">
                                        <Trophy className="h-6 w-6 text-brand-orange-coral group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-2">Prefeitura Destaque</h4>
                                        <p className="text-gray-400">A prefeitura que mais incentivar inscrições será homenageada como <strong>"Prefeito(a) que mais investe no Empreendedorismo"</strong>.</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6 bg-white/5 border-white/10 hover:border-brand-orange-coral/30 transition-all group">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-orange-coral transition-colors">
                                        <Award className="h-6 w-6 text-brand-orange-coral group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-lg mb-2">Homenagem a Lideranças</h4>
                                        <p className="text-gray-400">Deputados e vereadores que promoverem o evento em suas bases também receberão reconhecimento oficial durante a cerimônia noturna.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Button
                            size="lg"
                            className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-10 py-7 rounded-2xl shadow-glow-orange hover:shadow-glow hover:scale-105 transition-all duration-300 h-auto group text-lg"
                            onClick={onInscrever}
                        >
                            Fazer Inscrição Social
                            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="grid gap-6">
                            {/* Ranking Prefeituras */}
                            <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                                <div className="p-4 bg-brand-orange-coral/10 border-b border-brand-orange-coral/20 flex items-center justify-between">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Landmark className="h-4 w-4 text-brand-orange-coral" />
                                        Ranking das Prefeituras
                                    </h4>
                                    <Badge className="bg-brand-orange-coral text-white text-[10px]">INSCRIÇÕES</Badge>
                                </div>
                                <div className="p-2">
                                    {[
                                        { rank: 1, name: selectedProject?.city || 'Triunfo', stats: '242', coupon: '100%' },
                                        { rank: 2, name: selectedProject?.city === 'Triunfo' ? 'Serra Talhada' : 'Cidade B', stats: '187', coupon: '75%' },
                                        { rank: 3, name: selectedProject?.city === 'Triunfo' ? 'Afogados da Ingazeira' : 'Cidade C', stats: '154', coupon: '50%' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-lg group">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-brand-orange-coral text-white' : 'bg-white/10 text-gray-400'}`}>
                                                    {item.rank}
                                                </span>
                                                <span className="text-white font-medium group-hover:text-brand-orange-coral transition-colors">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="border-brand-orange-coral/30 text-brand-orange-coral font-bold text-[10px]">
                                                    {item.coupon} OFF
                                                </Badge>
                                                <span className="text-white font-black w-8 text-right">{item.stats}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Ranking Político */}
                            <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
                                <div className="p-4 bg-brand-blue/10 border-b border-brand-blue/20 flex items-center justify-between">
                                    <h4 className="text-white font-bold flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-brand-blue" />
                                        Lideranças Engajadas
                                    </h4>
                                    <Badge className="bg-brand-blue text-white text-[10px]">PONTOS</Badge>
                                </div>
                                <div className="p-2">
                                    {[
                                        { rank: 1, name: 'Deputado A', location: selectedProject?.city || 'Triunfo', stats: '940' },
                                        { rank: 2, name: 'Vereador B', location: selectedProject?.city === 'Triunfo' ? 'Serra Talhada' : 'Cidade B', stats: '820' },
                                        { rank: 3, name: 'Liderança C', location: 'Região', stats: '750' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-lg group">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-400'}`}>
                                                    {item.rank}
                                                </span>
                                                <div>
                                                    <p className="text-white font-medium group-hover:text-brand-blue transition-colors leading-none">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">{item.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                    <div
                                                        className="h-full bg-brand-blue"
                                                        style={{ width: `${(parseInt(item.stats) / 1000) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-white font-black w-8 text-right">{item.stats}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="text-center">
                                <p className="text-[10px] text-gray-500 flex items-center justify-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-brand-orange-coral" />
                                    Atualizado em tempo real • Cerimônia Noturna
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
