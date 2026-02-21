import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Calendar, Clock, ArrowRight, X } from 'lucide-react';
import { palestrasNoturnas } from '@/data/programacao';

interface Step4OfertaPalestrasProps {
    dados: DadosInscricao;
    onComprar: () => void;
    onPular: () => void;
}

export function Step4OfertaPalestras({ dados, onComprar, onPular }: Step4OfertaPalestrasProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left sm:text-center">
                <Badge className="mb-3 sm:mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 px-3 py-1 sm:px-4 sm:py-1 text-xs sm:text-sm animate-pulse">
                    <Star className="h-3 w-3 mr-2 fill-current" />
                    OFERTA EXCLUSIVA
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    Sessão Noturna Premium
                </h3>
                <p className="text-gray-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    Participe das palestras magnas e do networking exclusivo com grandes líderes do mercado.
                </p>
            </div>

            {/* Grid de Palestras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {palestrasNoturnas.map((palestra) => (
                    <Card key={palestra.id} className="relative overflow-hidden group border-white/10 hover:border-brand-orange-coral/30 transition-all bg-dark-200/50">
                        <div className="absolute top-0 right-0 p-3 z-10">
                            <Badge variant="secondary" className="bg-dark/80 backdrop-blur-sm text-white border-white/20 text-[10px] sm:text-xs">
                                19:00 - 22:30
                            </Badge>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="mb-3 sm:mb-4">
                                <h4 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-brand-orange-coral transition-colors leading-tight">
                                    {palestra.titulo}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    com <span className="text-white font-semibold">{palestra.palestrante}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                {palestra.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] sm:text-xs border-white/10 text-gray-500">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed">
                                {palestra.descricao}
                            </p>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Card>
                ))}
            </div>

            {/* Card da Oferta */}
            <Card className="relative overflow-hidden border-brand-orange-coral/30 bg-gradient-to-br from-brand-orange-coral/10 via-dark-200 to-dark p-4 sm:p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-orange-coral/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-brand-orange-gradient/20 rounded-full blur-2xl" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                    <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                        <div>
                            <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">Passaporte Night Experience</h4>
                            <p className="text-xs sm:text-sm text-gray-400">Acesso completo à programação noturna + Benefícios exclusivos</p>
                        </div>

                        <ul className="space-y-1.5 sm:space-y-2">
                            {[
                                'Acesso às 2 palestras magnas',
                                'Coffee Break & Networking Premium',
                                'Lugar reservado',
                                'Certificado de participação especial (4h)',
                                'Kit exclusivo do evento'
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-[11px] sm:text-sm text-gray-300 leading-tight">
                                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 sm:gap-4 w-full md:min-w-[200px]">
                        <div className="text-center md:text-right">
                            {dados.descontoSocial && dados.descontoSocial > 0 ? (
                                <>
                                    <Badge className="mb-2 bg-green-500/20 text-green-500 border-green-500/30 text-[10px] sm:text-xs">
                                        -{dados.descontoSocial}% Parceria {dados.indicacaoTipo === 'prefeitura' ? 'Prefeitura' : 'Político'}
                                    </Badge>
                                    <p className="text-[10px] sm:text-sm text-gray-500 line-through">de R$ 179,99</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-xs sm:text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white">
                                            {(179.99 * (1 - dados.descontoSocial / 100)).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] sm:text-sm text-gray-500 line-through">de R$ 299,90</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-xs sm:text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-3xl sm:text-4xl font-black text-white">179,99</span>
                                    </div>
                                </>
                            )}
                            <p className="text-[10px] sm:text-xs text-green-500 font-semibold">em até 12x no cartão</p>
                        </div>

                        <Button
                            size="lg"
                            onClick={onComprar}
                            className="w-full bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-extrabold shadow-lg h-12 sm:h-14 py-0"
                        >
                            {dados.descontoSocial === 100 ? 'GARANTIR VAGA GRATUITA' : 'GARANTIR MINHA VAGA'}
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                        </Button>

                        <button
                            onClick={onPular}
                            className="text-[10px] sm:text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1 py-1"
                        >
                            Não tenho interesse agora
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
