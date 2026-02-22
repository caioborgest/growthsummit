import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Clock, Users, Award, DollarSign } from 'lucide-react';
import { SectionShare } from '../social/SectionShare';

interface InscricaoSectionProps {
    id: string;
    icon: React.ElementType;
    titulo: string;
    subtitulo: string;
    descricao: string;
    beneficios: string[];
    valor?: string;
    gratuito?: boolean;
    vagasLimitadas?: boolean;
    destaque?: boolean;
    horario?: string;
    capacidade?: string;
    premios?: { posicao: string; premio: string }[];
    onInscrever: () => void;
    imagemUrl?: string;
}

export function InscricaoSection({
    id,
    icon: Icon,
    titulo,
    subtitulo,
    descricao,
    beneficios,
    valor,
    gratuito = false,
    vagasLimitadas = false,
    destaque = false,
    horario,
    capacidade,
    premios,
    onInscrever,
    imagemUrl
}: InscricaoSectionProps) {
    return (
        <section id={id} className={`py-16 sm:py-24 relative overflow-hidden ${destaque ? 'bg-dark-200' : 'bg-dark'}`}>
            {destaque && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange-coral via-brand-blue to-brand-orange-coral" />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`grid lg:grid-cols-2 gap-10 lg:gap-12 items-center ${destaque ? 'lg:grid-cols-5' : ''}`}>
                    {/* Conteúdo */}
                    <div className={`w-full min-w-0 ${destaque ? 'lg:col-span-3' : ''}`}>
                        {/* Ícone + badges + share — sem overflow */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            <div className="w-14 h-14 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/30 flex-shrink-0">
                                <Icon className="h-7 w-7 text-brand-orange-coral" />
                            </div>
                            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                {vagasLimitadas && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse whitespace-nowrap">
                                        Vagas Limitadas
                                    </Badge>
                                )}
                                {gratuito && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 whitespace-nowrap">
                                        Gratuito
                                    </Badge>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                <SectionShare sectionId={id} title={titulo} />
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight">{titulo}</h2>
                        <p className="text-base sm:text-xl text-brand-orange-coral mb-6 font-medium leading-snug">{subtitulo}</p>
                        <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">{descricao}</p>

                        {/* Informações Adicionais */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            {horario && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="h-5 w-5 text-brand-orange-coral flex-shrink-0" />
                                    <span>{horario}</span>
                                </div>
                            )}
                            {capacidade && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Users className="h-5 w-5 text-brand-orange-coral flex-shrink-0" />
                                    <span>{capacidade}</span>
                                </div>
                            )}
                            {valor && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-brand-orange-coral flex-shrink-0" />
                                    <span className="text-2xl font-bold text-brand-orange-coral">{valor}</span>
                                </div>
                            )}
                        </div>

                        {/* Benefícios */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-brand-orange-coral flex-shrink-0" />
                                O que está incluído:
                            </h3>
                            <ul className="space-y-3">
                                {beneficios.map((beneficio, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                                        <CheckCircle className="h-5 w-5 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                                        <span>{beneficio}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Prêmios (para Arena Pitch) */}
                        {premios && premios.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-brand-orange-coral flex-shrink-0" />
                                    Premiação:
                                </h3>
                                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                    {premios.map((premio, idx) => (
                                        <Card key={idx} className="glass-card p-3 sm:p-4 border-brand-orange-coral/30 text-center">
                                            <div className="text-2xl sm:text-3xl mb-2">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                                            </div>
                                            <p className="text-brand-orange-coral font-bold mb-1 text-xs sm:text-sm">{premio.posicao}</p>
                                            <p className="text-white text-xs sm:text-sm">{premio.premio}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA — full width sempre no mobile */}
                        <Button
                            size="lg"
                            className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-6 sm:px-10 py-6 sm:py-7 text-base sm:text-lg rounded-xl shadow-glow-orange hover:shadow-glow hover:scale-[1.02] transition-all duration-300 h-auto group"
                            onClick={onInscrever}
                        >
                            {gratuito ? 'INSCREVER-SE GRATUITAMENTE' : 'GARANTIR MEU INGRESSO'}
                            <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Imagem */}
                    <div className={`relative ${destaque ? 'lg:col-span-2' : ''}`}>
                        {imagemUrl ? (
                            <div className="relative">
                                <img
                                    src={imagemUrl}
                                    alt={titulo}
                                    className="rounded-2xl shadow-2xl border-2 border-white/10"
                                />
                                {destaque && (
                                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-orange-coral rounded-full flex items-center justify-center shadow-xl">
                                        <div className="text-center">
                                            <p className="text-dark-100 font-bold text-xs">DESTAQUE</p>
                                            <p className="text-dark-100 font-bold text-2xl">★</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card className="glass-card p-12 border-brand-orange-coral/30 flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <Icon className="h-32 w-32 text-brand-orange-coral/30 mx-auto mb-6" />
                                    <p className="text-gray-500 text-lg">{titulo}</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
