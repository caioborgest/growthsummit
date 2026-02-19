import { useState } from 'react'; // Module Refresh Force
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Search, BookOpen } from 'lucide-react';
import { programacaoCompleta } from '@/data/programacao';
import type { TipoAtividade } from '@/data/programacao';
import { Input } from '@/components/ui/input';

interface ProgramacaoCompletaProps {
    onInscrever: (tipo: TipoAtividade | 'todos') => void;
}

export function ProgramacaoCompleta({ onInscrever }: ProgramacaoCompletaProps) {
    const [filtroTipo, setFiltroTipo] = useState<TipoAtividade | 'todos'>('todos');
    const [busca, setBusca] = useState('');

    const atividadesFiltradas = programacaoCompleta.filter(atividade => {
        const matchTipo = filtroTipo === 'todos' || atividade.tipo === filtroTipo;
        const matchBusca = atividade.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            atividade.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchTipo && matchBusca;
    });

    const tipos: { id: TipoAtividade | 'todos'; label: string }[] = [
        { id: 'todos', label: 'Tudo' },
        { id: 'curso', label: 'Cursos' },
        { id: 'palestra', label: 'Palestras' },
        { id: 'mentoria', label: 'Mentorias' },
        { id: 'networking', label: 'Networking' },
        { id: 'startup', label: 'Startups' },
        { id: 'b2b', label: 'B2B' }
    ];

    return (
        <section id="programacao-completa" className="py-24 bg-dark relative overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2032&auto=format&fit=crop')]  opacity-5 bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/95 to-dark" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/30 px-4 py-1">
                        <BookOpen className="h-3 w-3 mr-2" />
                        PROGRAMAÇÃO 2026
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Uma Jornada Completa de<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient">
                            Conhecimento e Conexões
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Explore nossa grade de atividades e monte sua agenda personalizada. Cursos, mentorias e palestras para impulsionar seu negócio.
                    </p>
                </div>

                {/* Filtros e Busca */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-dark-200/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm sticky top-[80px] md:top-[80px] z-[40] shadow-xl transition-all duration-300">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        {tipos.map((tipo) => (
                            <Button
                                key={tipo.id}
                                variant={filtroTipo === tipo.id ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFiltroTipo(tipo.id)}
                                className={`rounded-full whitespace-nowrap transition-all ${filtroTipo === tipo.id
                                    ? 'bg-brand-orange-coral text-white hover:bg-brand-orange-intense'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tipo.label}
                            </Button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar atividade..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="pl-10 bg-dark-100 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-orange-coral transition-colors"
                        />
                    </div>
                </div>

                {/* Grid de Atividades */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {atividadesFiltradas.length > 0 ? (
                        atividadesFiltradas.map((atividade) => (
                            <Card
                                key={atividade.id}
                                className={`group relative overflow-hidden border-white/10 bg-dark-200/30 hover:bg-dark-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-orange-coral/10 ${atividade.tipo === 'palestra' ? 'border-brand-orange-coral/30' : ''
                                    }`}
                            >
                                {/* Faixa de Tipo */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${atividade.tipo === 'palestra' ? 'bg-brand-orange-coral' :
                                    atividade.tipo === 'curso' ? 'bg-blue-500' :
                                        atividade.tipo === 'mentoria' ? 'bg-purple-500' :
                                            'bg-gray-500'
                                    }`} />

                                <div className="p-6 pl-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className={`border-white/10 text-xs uppercase tracking-wider ${atividade.tipo === 'palestra' ? 'text-brand-orange-coral bg-brand-orange-coral/10' :
                                            atividade.tipo === 'curso' ? 'text-blue-400 bg-blue-500/10' :
                                                atividade.tipo === 'mentoria' ? 'text-purple-400 bg-purple-500/10' :
                                                    'text-gray-400 bg-gray-500/10'
                                            }`}>
                                            {atividade.tipo}
                                        </Badge>
                                        {atividade.gratuito ? (
                                            <Badge className="bg-green-500/20 text-green-500 border-green-500/40 text-[10px]">
                                                GRÁTIS
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral border-brand-orange-coral/40 text-[10px]">
                                                PAGO
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-orange-coral transition-colors">
                                        {atividade.titulo}
                                    </h3>

                                    <p className="text-sm text-gray-400 mb-4 line-clamp-3 h-[60px]">
                                        {atividade.descricao}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-300 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-brand-orange-coral" />
                                            <span>{atividade.horario_inicio} - {atividade.horario_fim}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-500" />
                                            <span>{atividade.local}</span>
                                        </div>
                                        {atividade.palestrante && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-500" />
                                                <span>{atividade.palestrante}</span>
                                            </div>
                                        )}
                                    </div>

                                    {atividade.tipo !== 'networking' && (
                                        <Button
                                            className="w-full bg-white/5 hover:bg-brand-orange-coral hover:text-white border border-white/10 hover:border-brand-orange-coral transition-all group-hover:bg-brand-orange-coral group-hover:text-white"
                                            onClick={() => onInscrever(atividade.tipo)}
                                        >
                                            {atividade.tipo === 'palestra' ? 'Garantir Ingresso' : 'Inscrever-se'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-400 text-lg">Nenhuma atividade encontrada para esta busca.</p>
                            <Button
                                variant="link"
                                onClick={() => { setFiltroTipo('todos'); setBusca(''); }}
                                className="text-brand-orange-coral mt-2"
                            >
                                Limpar filtros
                            </Button>
                        </div>
                    )}
                </div>

                {/* CTA Final */}
                <div className="mt-16 text-center">
                    <Button
                        size="lg"
                        onClick={() => onInscrever('todos')}
                        className="bg-gradient-to-r from-brand-orange-coral to-brand-orange-gradient hover:from-brand-orange-intense hover:to-brand-orange-coral text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-brand-orange-coral/30 animate-pulse hover:animate-none transform hover:scale-105 transition-all"
                    >
                        QUERO PARTICIPAR DE TUDO
                    </Button>
                    <p className="text-sm text-gray-500 mt-4">
                        Vagas limitadas para todas as atividades. Garanta a sua agora!
                    </p>
                </div>
            </div>
        </section>
    );
}
