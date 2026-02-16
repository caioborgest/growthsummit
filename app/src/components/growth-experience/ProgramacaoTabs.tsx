import { useState } from 'react';
import { Clock, Users, MapPin, Coffee, Mic2, Award, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Atividade {
    horario: string;
    titulo?: string;
    tipo?: string;
    capacidade?: number;
    topicos?: string[];
    atividade?: string;
    local?: string;
}

interface Sala extends Atividade {
    numero: number;
}

interface Bloco {
    horario: string;
    titulo: string;
    salao?: Atividade;
    salas?: Sala[];
}

interface Circulacao {
    horario: string;
    atividade: string;
}

interface ProgramacaoDiurna {
    bloco1: Bloco;
    circulacao1: Circulacao;
    bloco2: Bloco;
    encerramento: Circulacao;
}

interface ProgramacaoTarde {
    bloco3: Bloco;
    circulacao2: Circulacao;
    bloco4: Bloco;
    encerramento: Circulacao;
}

interface Estacao {
    icon: any;
    nome: string;
    subtitulo: string;
    parceiro: string;
    formato: string;
    capacidade: string;
    totalDia: string;
    temas: string[];
    cor: string;
}

interface MomentoAncora {
    horario: string;
    atividade: string;
    local: string;
}

interface ProgramacaoTabsProps {
    programacaoManha: ProgramacaoDiurna;
    programacaoTarde: ProgramacaoTarde;
    programacaoNoturna: { horario: string; atividade: string }[];
    circuitoExperiencias: Estacao[];
    momentosAncora: {
        manha: MomentoAncora[];
        tarde: MomentoAncora[];
    };
}

const corMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

export function ProgramacaoTabs({
    programacaoManha,
    programacaoTarde,
    programacaoNoturna,
    circuitoExperiencias,
    momentosAncora
}: ProgramacaoTabsProps) {
    const [activeTab, setActiveTab] = useState<'diurna' | 'noturna' | 'circuito'>('diurna');

    const renderBloco = (bloco: Bloco) => (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <Clock className="h-5 w-5 text-brand-orange-coral" />
                <h4 className="text-xl font-bold text-white">{bloco.horario}</h4>
                <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30">
                    {bloco.titulo}
                </Badge>
            </div>

            {/* Salão Principal */}
            {bloco.salao && (
                <Card className="glass-card p-6 mb-4 border-brand-blue/30 hover:border-brand-orange-coral/50 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center">
                                <Mic2 className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <div>
                                <h5 className="text-lg font-bold text-white">{bloco.salao.titulo}</h5>
                                <p className="text-sm text-gray-400">{bloco.salao.tipo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{bloco.salao.capacidade} pessoas</span>
                        </div>
                    </div>
                    {bloco.salao.topicos && (
                        <ul className="space-y-2">
                            {bloco.salao.topicos.map((topico, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                                    <span className="text-brand-orange-coral mt-1">•</span>
                                    <span>{topico}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            {/* Salas Paralelas */}
            {bloco.salas && bloco.salas.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                    {bloco.salas.map((sala) => (
                        <Card key={sala.numero} className="glass-card p-5 border-white/10 hover:border-brand-orange-coral/30 transition-all">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded bg-brand-orange-coral/20 flex items-center justify-center">
                                    <span className="text-brand-orange-coral font-bold text-sm">S{sala.numero}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                    <Users className="h-3 w-3" />
                                    <span>{sala.capacidade}</span>
                                </div>
                            </div>
                            <h6 className="text-white font-semibold text-sm mb-2 leading-tight">{sala.titulo}</h6>
                            <p className="text-xs text-brand-orange-coral mb-3">{sala.tipo}</p>
                            {sala.topicos && (
                                <ul className="space-y-1">
                                    {sala.topicos.map((topico, idx) => (
                                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-1">
                                            <span className="text-brand-orange-coral">→</span>
                                            <span>{topico}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCirculacao = (circulacao: Circulacao) => (
        <div className="flex items-center gap-4 py-4 px-6 bg-brand-orange-coral/5 rounded-lg border border-brand-orange-coral/20 mb-8">
            <Coffee className="h-5 w-5 text-brand-orange-coral" />
            <div className="flex-1">
                <span className="text-white font-medium">{circulacao.horario}</span>
                <span className="text-gray-400 mx-3">•</span>
                <span className="text-gray-300">{circulacao.atividade}</span>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 mb-8 p-1 bg-dark-200 rounded-xl border border-white/5">
                <button
                    onClick={() => setActiveTab('diurna')}
                    className={`flex-1 min-w-[150px] px-6 py-4 rounded-lg font-semibold transition-all ${activeTab === 'diurna'
                            ? 'bg-brand-orange-coral text-dark-100 shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Programação Diurna
                </button>
                <button
                    onClick={() => setActiveTab('noturna')}
                    className={`flex-1 min-w-[150px] px-6 py-4 rounded-lg font-semibold transition-all ${activeTab === 'noturna'
                            ? 'bg-brand-orange-coral text-dark-100 shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Mic2 className="h-4 w-4 inline mr-2" />
                    Palestras Noturnas
                </button>
                <button
                    onClick={() => setActiveTab('circuito')}
                    className={`flex-1 min-w-[150px] px-6 py-4 rounded-lg font-semibold transition-all ${activeTab === 'circuito'
                            ? 'bg-brand-orange-coral text-dark-100 shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Circuito de Experiências
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'diurna' && (
                    <div className="space-y-12">
                        {/* Manhã */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange-coral to-brand-blue flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">☀️</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Manhã</h3>
                                    <p className="text-gray-400">8h30 - 12h00</p>
                                </div>
                            </div>

                            {/* Momentos Âncora Manhã */}
                            <div className="mb-6 p-4 bg-brand-blue/10 rounded-lg border border-brand-blue/30">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-brand-orange-coral" />
                                    Momentos Âncora
                                </h4>
                                <div className="grid md:grid-cols-3 gap-3">
                                    {momentosAncora.manha.map((momento, idx) => (
                                        <div key={idx} className="text-sm">
                                            <span className="text-brand-orange-coral font-semibold">{momento.horario}</span>
                                            <p className="text-gray-300">{momento.atividade}</p>
                                            <p className="text-gray-500 text-xs">{momento.local}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {renderBloco(programacaoManha.bloco1)}
                            {renderCirculacao(programacaoManha.circulacao1)}
                            {renderBloco(programacaoManha.bloco2)}
                            {renderCirculacao(programacaoManha.encerramento)}
                        </div>

                        {/* Tarde */}
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-orange-coral flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">🌅</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Tarde</h3>
                                    <p className="text-gray-400">14h00 - 17h30</p>
                                </div>
                            </div>

                            {/* Momentos Âncora Tarde */}
                            <div className="mb-6 p-4 bg-brand-blue/10 rounded-lg border border-brand-blue/30">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-brand-orange-coral" />
                                    Momentos Âncora
                                </h4>
                                <div className="grid md:grid-cols-3 gap-3">
                                    {momentosAncora.tarde.map((momento, idx) => (
                                        <div key={idx} className="text-sm">
                                            <span className="text-brand-orange-coral font-semibold">{momento.horario}</span>
                                            <p className="text-gray-300">{momento.atividade}</p>
                                            <p className="text-gray-500 text-xs">{momento.local}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {renderBloco(programacaoTarde.bloco3)}
                            {renderCirculacao(programacaoTarde.circulacao2)}
                            {renderBloco(programacaoTarde.bloco4)}
                            {renderCirculacao(programacaoTarde.encerramento)}
                        </div>
                    </div>
                )}

                {activeTab === 'noturna' && (
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-brand-orange-coral flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🌙</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Palestras Noturnas</h3>
                                <p className="text-gray-400">19h00 - 23h00</p>
                            </div>
                        </div>

                        <div className="mb-6 p-6 bg-gradient-to-r from-brand-orange-coral/10 to-brand-blue/10 rounded-xl border border-brand-orange-coral/30">
                            <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-brand-orange-coral text-dark-100 font-bold">INGRESSO PAGO</Badge>
                                <span className="text-2xl font-bold text-brand-orange-coral">R$ 179,99</span>
                            </div>
                            <p className="text-gray-300">Acesso exclusivo às palestras com CEOs de destaque nacional</p>
                        </div>

                        <div className="space-y-4">
                            {programacaoNoturna.map((item, idx) => (
                                <Card key={idx} className="glass-card p-6 border-white/10 hover:border-brand-orange-coral/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-blue flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-brand-orange-coral" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-brand-orange-coral font-bold mb-1">{item.horario}</p>
                                            <p className="text-white font-semibold">{item.atividade}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'circuito' && (
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange-coral to-yellow-500 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-dark-100" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Circuito de Experiências</h3>
                                <p className="text-gray-400">Funcionamento contínuo: 8h30 - 17h30</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-8 text-lg">
                            10 estações abertas em funcionamento contínuo com sessões cronometradas. Alto giro de pessoas e muitas interações rápidas!
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {circuitoExperiencias.map((estacao, idx) => {
                                const Icon = estacao.icon;
                                const corClass = corMap[estacao.cor] || corMap.blue;

                                return (
                                    <Card key={idx} className="glass-card p-6 border-white/10 hover:border-brand-orange-coral/30 transition-all group">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${corClass} flex items-center justify-center border`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-bold text-lg mb-1">{estacao.nome}</h4>
                                                <p className="text-gray-400 text-sm mb-2">{estacao.subtitulo}</p>
                                                <Badge className={`${corClass} text-xs`}>{estacao.parceiro}</Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-brand-orange-coral flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-gray-400">Formato:</p>
                                                    <p className="text-white">{estacao.formato}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <p className="text-gray-400">Capacidade/hora:</p>
                                                    <p className="text-white font-semibold">{estacao.capacidade}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400">Total/dia:</p>
                                                    <p className="text-brand-orange-coral font-semibold">{estacao.totalDia}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5">
                                            <p className="text-gray-400 text-xs mb-2 font-semibold">Temas:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {estacao.temas.map((tema, tIdx) => (
                                                    <span key={tIdx} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded">
                                                        {tema}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
