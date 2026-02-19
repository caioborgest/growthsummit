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
            <div className="text-center">
                <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 px-4 py-1 text-sm animate-pulse">
                    <Star className="h-3 w-3 mr-2 fill-current" />
                    OFERTA EXCLUSIVA
                </Badge>
                <h3 className="text-3xl font-bold text-white mb-3">
                    Sessão Noturna Premium
                </h3>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Participe das palestras magnas e do networking exclusivo com grandes líderes do mercado.
                </p>
            </div>

            {/* Grid de Palestras */}
            <div className="grid md:grid-cols-2 gap-4">
                {palestrasNoturnas.map((palestra) => (
                    <Card key={palestra.id} className="relative overflow-hidden group border-white/10 hover:border-brand-orange-coral/30 transition-all bg-dark-200/50">
                        <div className="absolute top-0 right-0 p-3">
                            <Badge variant="secondary" className="bg-dark/80 backdrop-blur-sm text-white border-white/20">
                                19:00 - 22:30
                            </Badge>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="text-xl font-bold text-white mb-1 group-hover:text-brand-orange-coral transition-colors">
                                    {palestra.titulo}
                                </h4>
                                <p className="text-sm text-gray-400">
                                    com <span className="text-white font-semibold">{palestra.palestrante}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {palestra.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs border-white/10 text-gray-500">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-3">
                                {palestra.descricao}
                            </p>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Card>
                ))}
            </div>

            {/* Card da Oferta */}
            <Card className="relative overflow-hidden border-brand-orange-coral/30 bg-gradient-to-br from-brand-orange-coral/10 via-dark-200 to-dark p-8">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-orange-coral/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-brand-orange-gradient/20 rounded-full blur-2xl" />

                <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="text-2xl font-bold text-white mb-2">Passaporte Night Experience</h4>
                            <p className="text-gray-400">Acesso completo à programação noturna + Benefícios exclusivos</p>
                        </div>

                        <ul className="space-y-2">
                            {[
                                'Acesso às 2 palestras magnas',
                                'Coffee Break & Networking Premium',
                                'Lugar reservado',
                                'Certificado de participação especial (4h)',
                                'Kit exclusivo do evento'
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                        <div className="text-center md:text-right">
                            {dados.descontoSocial && dados.descontoSocial > 0 ? (
                                <>
                                    <Badge className="mb-2 bg-green-500/20 text-green-500 border-green-500/30">
                                        -{dados.descontoSocial}% Parceria {dados.indicacaoTipo === 'prefeitura' ? 'Prefeitura' : 'Político'}
                                    </Badge>
                                    <p className="text-sm text-gray-500 line-through">de R$ 179,99</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-4xl font-black text-white">
                                            {(179.99 * (1 - dados.descontoSocial / 100)).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 line-through">de R$ 299,90</p>
                                    <div className="flex items-baseline gap-1 justify-center md:justify-end">
                                        <span className="text-sm text-brand-orange-coral font-bold">R$</span>
                                        <span className="text-4xl font-black text-white">179,99</span>
                                    </div>
                                </>
                            )}
                            <p className="text-xs text-green-500 font-semibold">em até 12x no cartão</p>
                        </div>

                        <Button
                            size="lg"
                            onClick={onComprar}
                            className="w-full bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold shadow-lg transform hover:scale-105 transition-all"
                        >
                            {dados.descontoSocial === 100 ? 'GARANTIR VAGA GRATUITA' : 'GARANTIR MINHA VAGA'}
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>

                        <button
                            onClick={onPular}
                            className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1"
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
