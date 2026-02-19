import { Trophy, Award, Landmark, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SectionShare } from '../social/SectionShare';

interface SocialRegistrationSectionProps {
    onInscrever: () => void;
}

export function SocialRegistrationSection({ onInscrever }: SocialRegistrationSectionProps) {
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
                        <div className="absolute -inset-4 bg-brand-orange-coral/20 blur-2xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1577416416829-d4434f47ef05?q=80&w=1974&auto=format&fit=crop"
                                className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                alt="Encontro de Lideranças"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="glass-card p-6 border-brand-orange-coral/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-orange-coral bg-dark overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Líder" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-white font-bold">+12 Prefeituras Confirmadas</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-brand-orange-coral font-black text-sm uppercase tracking-widest">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange-coral opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange-coral"></span>
                                        </span>
                                        Evento Noturno • Cerimônia de Premiação
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
