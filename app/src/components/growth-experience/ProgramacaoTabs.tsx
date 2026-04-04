import { useState, useMemo } from 'react';
import { Clock, Users, MapPin, Coffee, Mic2, Zap, UserPlus, Radio, ChevronRight, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { useSessionFavorites } from '@/hooks/useSessionFavorites';

export interface Atividade {
    id?: string;
    horario?: string;
    titulo?: string;
    tipo?: string;
    capacidade?: number;
    inscritos?: number;
    topicos?: string[];
    atividade?: string;
    local?: string;
}

export interface Sala extends Atividade {
    numero: number;
}

export interface Bloco {
    horario: string;
    titulo: string;
    salao?: Atividade;
    salas?: Sala[];
}

export interface Circulacao {
    horario: string;
    atividade: string;
}

export interface ProgramacaoDiurna {
    bloco1: Bloco;
    circulacao1: Circulacao;
    bloco2: Bloco;
    encerramento: Circulacao;
}

export interface ProgramacaoTarde {
    bloco3: Bloco;
    circulacao2: Circulacao;
    bloco4: Bloco;
    retirement?: Circulacao;
    encerramento: Circulacao;
}

export interface Estacao {
    icon: any;
    nome: string;
    subtitulo?: string;
    parceiro: string;
    formato: string;
    capacidade: string;
    totalDia: string;
    temas: string[];
    cor: string;
    tempo?: string;
}

export interface MomentoAncora {
    horario: string;
    atividade: string;
    local: string;
}

export interface AgoraProximoItem {
    id: string;
    titulo: string;
    horario: string;
    local?: string;
    status: 'agora' | 'proximo';
}

export interface ProgramacaoTabsProps {
    programacaoManha: ProgramacaoDiurna;
    programacaoTarde: ProgramacaoTarde;
    programacaoNoturna: { horario: string; atividade: string }[];
    circuitoExperiencias: Estacao[];
    momentosAncora: {
        manha: MomentoAncora[];
        tarde: MomentoAncora[];
    };
    onInscricao?: () => void;
    /** Data do evento (YYYY-MM-DD) e atividades com horário para jornada Agora/Próximo */
    eventDate?: string;
    allActivitiesWithTimes?: { id: string; titulo: string; horario: string; startTime?: string; endTime?: string; local?: string }[];
    hasNightAccess?: boolean;
    isLoading?: boolean;
}


function parseTimeToMinutes(t: string): number {
    const m = (t || '').match(/(\d{1,2}):(\d{2})/);
    if (!m) return 0;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function ProgramacaoTabs({
    programacaoManha,
    programacaoTarde,
    programacaoNoturna,
    circuitoExperiencias,
    momentosAncora,
    onInscricao,
    eventDate,
    allActivitiesWithTimes = [],
    hasNightAccess = false,
    isLoading = false
}: ProgramacaoTabsProps) {
    const [activeTab, setActiveTab] = useState<'diurna' | 'noturna' | 'circuito'>('diurna');
    const { projectId } = useProject();
    const { favorites, toggle, isFavorite } = useSessionFavorites(projectId);

    const { agoraItem, proximoItem } = useMemo(() => {
        if (!eventDate || allActivitiesWithTimes.length === 0) return { agoraItem: null, proximoItem: null };
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const currentMin = now.getHours() * 60 + now.getMinutes();

        const eventMin = eventDate === today ? currentMin : (eventDate < today ? 24 * 60 : -1);
        if (eventDate !== today) return { agoraItem: null, proximoItem: null };

        let agora: typeof allActivitiesWithTimes[0] | null = null;
        let proximo: typeof allActivitiesWithTimes[0] | null = null;

        const sorted = [...allActivitiesWithTimes]
            .filter(a => a.startTime)
            .sort((a, b) => parseTimeToMinutes(a.startTime || '') - parseTimeToMinutes(b.startTime || ''));

        for (const a of sorted) {
            const start = parseTimeToMinutes(a.startTime || '');
            const end = parseTimeToMinutes(a.endTime || '') || start + 60;
            if (currentMin >= start && currentMin < end) {
                agora = a;
                break;
            }
            if (!proximo && currentMin < start) {
                proximo = a;
                break;
            }
        }
        if (!agora && sorted.length > 0 && currentMin < parseTimeToMinutes(sorted[0].startTime || '')) {
            proximo = sorted[0];
        }

        return {
            agoraItem: agora ? { ...agora, status: 'agora' as const } : null,
            proximoItem: proximo ? { ...proximo, status: 'proximo' as const } : null,
        };
    }, [eventDate, allActivitiesWithTimes]);

    const renderBloco = (bloco: Bloco) => (
        <div className="mb-10 last:mb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                        <Clock className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <div>
                        <span className="text-2xl font-black text-white tracking-tight block leading-none mb-1">{bloco.horario}</span>
                        <Badge className="bg-brand-orange-coral/10 text-brand-orange-coral border-brand-orange-coral/30 px-3 py-0.5 font-bold text-[10px] uppercase">
                            {bloco.titulo}
                        </Badge>
                    </div>
                </div>

                {(activeTab !== 'noturna' || !hasNightAccess) && (
                    <Button
                        onClick={onInscricao}
                        size="sm"
                        className="bg-brand-orange-coral/10 border border-brand-orange-coral/30 text-brand-orange-coral hover:bg-brand-orange-coral hover:text-white transition-all font-black text-[10px] uppercase tracking-widest px-6 h-9 rounded-full"
                    >
                        <UserPlus className="h-3 w-3 mr-2" />
                        Garantir Vaga Gratuita
                    </Button>
                )}
            </div>

            {/* Salão Principal */}
            {bloco.salao && (
                <div className="mb-6">
                    <div className="text-xs font-black text-brand-orange-coral/60 uppercase tracking-widest mb-3 ml-1">Salão Principal (80 Pessoas)</div>
                    <Card className="glass-card p-8 border-white/10 hover:border-brand-orange-coral/40 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange-coral/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-orange-coral/10 transition-colors" />
                        {bloco.salao.id && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggle(bloco.salao!.id!); }}
                                className="absolute top-6 right-6 z-20 p-2 rounded-full hover:bg-white/10 transition-colors"
                                aria-label={isFavorite(bloco.salao.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                                <Heart className={`h-5 w-5 transition-colors ${isFavorite(bloco.salao.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                            </button>
                        )}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                            <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20 group-hover:scale-110 transition-transform">
                                    <Mic2 className="h-7 w-7 text-brand-orange-coral" />
                                </div>
                                <div>
                                    <h5 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight group-hover:text-brand-orange-coral transition-colors">
                                        {bloco.salao.titulo}
                                    </h5>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant="outline" className="border-brand-orange-coral/30 text-brand-orange-coral bg-brand-orange-coral/5">
                                            {bloco.salao.tipo}
                                        </Badge>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                            <Users className="h-4 w-4" />
                                            <span>{bloco.salao.inscritos || 0} / {bloco.salao.capacidade} inscritos</span>
                                            {bloco.salao.capacidade && (bloco.salao.inscritos || 0) >= bloco.salao.capacidade && (
                                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 ml-2">ESGOTADO</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {bloco.salao.topicos && (
                            <div className="mt-8 grid sm:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                {bloco.salao.topicos.map((topico, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-gray-300">
                                        <Zap className="h-4 w-4 text-brand-orange-coral mt-0.5 flex-shrink-0" />
                                        <span className="text-sm font-medium leading-relaxed">{topico}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Salas Paralelas */}
            {bloco.salas && bloco.salas.length > 0 && (
                <div>
                    <div className="text-xs font-black text-brand-orange-coral/60 uppercase tracking-widest mb-3 ml-1">Workshops Simultâneos (Salas 1 a 3)</div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {bloco.salas.map((sala) => (
                            <Card key={sala.id || sala.numero} className="glass-card p-6 border-white/5 hover:border-brand-orange-coral/30 transition-all hover:-translate-y-1 relative group bg-white/[0.02]">
                                <div className="absolute top-0 left-0 w-1 h-0 bg-brand-orange-coral group-hover:h-full transition-all duration-300" />
                                {sala.id && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggle(sala.id!); }}
                                        className="absolute top-4 right-4 z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                        aria-label={isFavorite(sala.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                    >
                                        <Heart className={`h-4 w-4 transition-colors ${isFavorite(sala.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
                                    </button>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-3 py-1 rounded bg-brand-orange-coral/20 border border-brand-orange-coral/30">
                                        <span className="text-brand-orange-coral font-black text-xs tracking-tighter">SALA 0{sala.numero}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase">
                                        <Users className="h-3 w-3" />
                                        <span>{sala.inscritos || 0}/{sala.capacidade} VAGAS</span>
                                        {sala.capacidade && (sala.inscritos || 0) >= sala.capacidade && (
                                            <span className="text-red-500 ml-1">LOTADO</span>
                                        )}
                                    </div>
                                </div>
                                <h6 className="text-white font-bold text-base mb-3 leading-snug group-hover:text-brand-orange-coral transition-colors">{sala.titulo}</h6>
                                <p className="text-[11px] font-black uppercase tracking-wider text-brand-orange-coral/70 mb-4">{sala.tipo}</p>

                                {sala.topicos && (
                                    <div className="space-y-2.5">
                                        {sala.topicos.map((topico, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-[13px] text-gray-400 group-hover:text-gray-300">
                                                <div className="w-1 h-1 rounded-full bg-brand-orange-coral mt-1.5 flex-shrink-0" />
                                                <span className="leading-tight">{topico}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderCirculacao = (circulacao: Circulacao) => (
        <div className="relative group mb-10">
            <div className="absolute inset-0 bg-brand-orange-coral/5 blur-xl group-hover:bg-brand-orange-coral/10 transition-colors rounded-3xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 py-5 px-8 border border-brand-orange-coral/20 rounded-2xl bg-dark-100/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-orange-coral/30" />
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-orange-coral/10 border border-brand-orange-coral/20">
                        <Coffee className="h-5 w-5 text-brand-orange-coral" />
                    </div>
                    <span className="text-brand-orange-coral font-black text-lg tracking-tight">{circulacao.horario}</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden sm:block mx-2" />
                <span className="text-gray-200 font-bold text-lg">{circulacao.atividade}</span>
                <div className="ml-auto hidden md:block">
                    <Badge variant="outline" className="text-[10px] border-white/10 text-gray-500 uppercase tracking-widest px-3 py-0.5">Networking</Badge>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            {/* Minhas atividades favoritas */}
            {favorites.length > 0 && allActivitiesWithTimes.length > 0 && (
                <div className="mb-10 p-5 rounded-2xl bg-brand-orange-coral/5 border border-brand-orange-coral/20">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        Minhas atividades ({favorites.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {favorites
                            .map((id) => allActivitiesWithTimes.find((a) => a.id === id))
                            .filter(Boolean)
                            .map((a) => (
                                <div
                                    key={a!.id}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10"
                                >
                                    <span className="text-brand-orange-coral font-bold text-sm">{a!.horario}</span>
                                    <span className="text-white font-medium">{a!.titulo}</span>
                                    {a!.local && <span className="text-gray-500 text-xs">• {a!.local}</span>}
                                    <button
                                        type="button"
                                        onClick={() => toggle(a!.id)}
                                        className="ml-1 p-1 rounded hover:bg-white/10"
                                        aria-label="Remover dos favoritos"
                                    >
                                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            {/* Jornada Agora / Próximo */}
            {(agoraItem || proximoItem) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {agoraItem && (
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 flex-shrink-0">
                                <Radio className="h-6 w-6 text-emerald-400 animate-pulse" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Acontecendo agora</span>
                                <p className="text-white font-bold text-lg truncate">{agoraItem.titulo}</p>
                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                    {agoraItem.horario}
                                    {agoraItem.local && <><span>•</span><MapPin className="h-3 w-3" />{agoraItem.local}</>}
                                </p>
                            </div>
                        </div>
                    )}
                    {proximoItem && (
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-brand-orange-coral/10 border border-brand-orange-coral/30">
                            <div className="w-12 h-12 rounded-full bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/40 flex-shrink-0">
                                <ChevronRight className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest">Próximo</span>
                                <p className="text-white font-bold text-lg truncate">{proximoItem.titulo}</p>
                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                    {proximoItem.horario}
                                    {proximoItem.local && <><span>•</span><MapPin className="h-3 w-3" />{proximoItem.local}</>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Tabs Navigation */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-12 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                {[
                    { id: 'diurna', label: 'Programação Diurna', labelMobile: 'Diurna', icon: Clock, desc: '8h30 - 17h30' },
                    { id: 'circuito', label: 'Circuito Experiência', labelMobile: 'Circuito', icon: Zap, desc: 'Consultoria Real-time' },
                    { id: 'noturna', label: 'Palestras Noturnas', labelMobile: 'Noturnas', icon: Mic2, desc: 'Night Experience' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 group px-3 sm:px-4 py-4 sm:py-5 rounded-[14px] transition-all duration-300 relative overflow-hidden ${activeTab === tab.id
                            ? 'bg-brand-orange-coral text-dark-100 shadow-glow'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                <tab.icon className={`h-4 w-4 flex-shrink-0 ${activeTab === tab.id ? 'text-dark-100' : 'text-brand-orange-coral animate-pulse'}`} />
                                <span className="font-black uppercase tracking-wide text-[11px] sm:text-xs leading-tight text-center">
                                    <span className="sm:hidden">{tab.labelMobile}</span>
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </span>
                            </div>
                            <p className={`text-[9px] sm:text-[10px] font-bold ${activeTab === tab.id ? 'text-dark-100/60' : 'text-gray-500'}`}>{tab.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/10" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                        <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                        <div className="h-48 bg-white/5 rounded-2xl border border-white/10" />
                    </div>
                    <div className="h-64 bg-white/5 rounded-2xl border border-white/10" />
                </div>
            )}

            {/* Tab Content */}
            {!isLoading && (
                <div className="min-h-[500px] animate-fade-in">
                {/* Nota sobre alteração de programação */}
                <div className="mb-10 px-6 py-4 bg-brand-orange-coral/5 rounded-2xl border border-brand-orange-coral/20 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Zap className="h-20 w-20 text-brand-orange-coral" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand-orange-coral/20 flex items-center justify-center border border-brand-orange-coral/30 flex-shrink-0">
                        <Zap className="h-5 w-5 text-brand-orange-coral animate-pulse" />
                    </div>
                    <p className="text-gray-300 text-sm md:text-base text-center md:text-left font-medium">
                        <span className="text-white font-black uppercase tracking-tighter mr-2 italic">Aviso Importante:</span>
                        As trilhas de conhecimento e horários podem sofrer ajustes para garantir a melhor experiência.
                        Todas as atualizações serão enviadas em tempo real via **WhatsApp e Aplicativo**.
                    </p>
                </div>

                {activeTab === 'diurna' && (
                    <div className="space-y-16">
                        {/* Manhã */}
                        <div>
                            <div className="flex items-center gap-4 mb-10 border-l-4 border-brand-orange-coral pl-6">
                                <div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                        MANHÃ
                                        <span className="text-brand-orange-coral text-lg opacity-50">☀️</span>
                                    </h3>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Abertura e Trilhas Iniciais</p>
                                </div>
                            </div>

                            {/* Momentos Âncora Manhã */}
                            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {momentosAncora.manha.map((momento, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-orange-coral/20 transition-colors group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-brand-orange-coral font-black text-base">{momento.horario}</span>
                                            <div className="w-2 h-2 rounded-full bg-brand-orange-coral animate-pulse" />
                                        </div>
                                        <p className="text-white font-bold leading-tight mb-2 group-hover:text-brand-orange-coral transition-colors">{momento.atividade}</p>
                                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-black">
                                            <MapPin className="h-3 w-3" />
                                            {momento.local}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-10">
                                {renderBloco(programacaoManha.bloco1)}
                                {renderCirculacao(programacaoManha.circulacao1)}
                                {renderBloco(programacaoManha.bloco2)}
                                <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                    {programacaoManha.encerramento.horario} • {programacaoManha.encerramento.atividade}
                                </div>
                            </div>
                        </div>

                        {/* Tarde */}
                        <div>
                            <div className="flex items-center gap-4 mb-10 border-l-4 border-brand-orange-coral pl-6">
                                <div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                                        TARDE
                                        <span className="text-brand-orange-coral text-lg opacity-50">🌅</span>
                                    </h3>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Estratégia e Casos de Sucesso</p>
                                </div>
                            </div>

                            {/* Momentos Âncora Tarde */}
                            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {momentosAncora.tarde.map((momento, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-orange-coral/20 transition-colors group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-brand-orange-coral font-black text-base">{momento.horario}</span>
                                            <div className="w-2 h-2 rounded-full bg-brand-orange-coral animate-pulse" />
                                        </div>
                                        <p className="text-white font-bold leading-tight mb-2 group-hover:text-brand-orange-coral transition-colors">{momento.atividade}</p>
                                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase font-black">
                                            <MapPin className="h-3 w-3" />
                                            {momento.local}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-10">
                                {renderBloco(programacaoTarde.bloco3)}
                                {renderCirculacao(programacaoTarde.circulacao2)}
                                {renderBloco(programacaoTarde.bloco4)}
                                <div className="p-6 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-brand-orange-coral font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                                    {programacaoTarde.encerramento.atividade}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'noturna' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tighter mb-2">NIGHT EXPERIENCE</h3>
                                <p className="text-brand-orange-coral font-black uppercase tracking-widest text-xs">O ponto alto do evento • 19h00 às 23h00</p>
                            </div>
                            {hasNightAccess ? (
                                <div className="flex flex-col items-start md:items-end bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl shadow-glow">
                                    <span className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-1 opacity-70">Sua Credencial Premium</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-500 text-dark-100 font-black border-none px-4 py-1">ACESSO CONFIRMADO</Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start md:items-end bg-brand-orange-coral p-5 rounded-2xl shadow-glow">
                                    <span className="text-dark-100 font-black text-xs uppercase tracking-widest mb-1 opacity-70">Ingresso Premium</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-dark-100 text-3xl font-black tracking-tighter">R$ 179,99</span>
                                        <Badge className="bg-dark-100 text-brand-orange-coral font-black border-none">ÚLTIMAS VAGAS</Badge>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {programacaoNoturna.map((item, idx) => (
                                <Card key={idx} className="glass-card p-6 border-white/5 hover:border-brand-orange-coral/40 transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                        <Mic2 className="h-24 w-24 text-white" />
                                    </div>
                                    <div className="relative z-10 flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-brand-orange-coral font-black text-xl italic tracking-tighter">{item.horario}</span>
                                            <div className="w-px h-10 bg-gradient-to-b from-brand-orange-coral to-transparent mt-2" />
                                        </div>
                                        <div>
                                            <h5 className="text-white font-black text-lg leading-snug group-hover:text-brand-orange-coral transition-colors">{item.atividade}</h5>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400 font-bold">Palco Principal</Badge>
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'circuito' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-l-4 border-brand-orange-coral pl-6">
                            <div>
                                <h3 className="text-4xl font-black text-white tracking-tighter">CIRCUITO DE EXPERIÊNCIAS</h3>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">Consultoria & Conexões em Fluxo Contínuo</p>
                            </div>
                            <Button
                                onClick={onInscricao}
                                className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-8 py-6 rounded-2xl shadow-glow-orange transition-all hover:scale-105"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Garantir Vaga Gratuita
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {circuitoExperiencias.map((estacao, idx) => {
                                const Icon = estacao.icon;
                                const isOrange = estacao.cor === 'orange';

                                return (
                                    <Card key={idx} className={`glass-card p-8 transition-all group relative overflow-hidden ${isOrange ? 'border-brand-orange-coral/20 hover:border-brand-orange-coral/50' : 'border-white/5 hover:border-white/20'}`}>
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-start gap-5 mb-6">
                                                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${isOrange
                                                    ? 'bg-brand-orange-coral/10 border-brand-orange-coral/20 text-brand-orange-coral'
                                                    : 'bg-white/5 border-white/10 text-gray-400'
                                                    }`}>
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-white font-black text-xl tracking-tight group-hover:text-brand-orange-coral transition-colors">{estacao.nome}</h4>
                                                        <Badge className={`${isOrange ? 'bg-brand-orange-coral text-dark-100' : 'bg-white/10 text-gray-400'} font-black text-[9px] uppercase tracking-tighter border-none`}>
                                                            {estacao.parceiro}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-400 text-sm font-medium">{estacao.subtitulo}</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${isOrange ? 'bg-brand-orange-coral/5 border-brand-orange-coral/10' : 'bg-white/[0.02] border-white/5'}`}>
                                                    <p className={`text-[10px] uppercase font-black mb-1 tracking-[0.2em] ${isOrange ? 'text-brand-orange-coral/60' : 'text-gray-500'}`}>Duração da Experiência</p>
                                                    <p className={`font-black text-2xl tracking-tighter ${isOrange ? 'text-brand-orange-coral' : 'text-white'}`}>{estacao.tempo || '10-15 min'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {estacao.temas.map((tema, tIdx) => (
                                                        <span key={tIdx} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isOrange ? 'bg-brand-orange-coral/5 border-brand-orange-coral/20 text-brand-orange-coral/80' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                            #{tema}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
        </div>
    );
}
