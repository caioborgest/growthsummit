import { useState } from 'react';
import {
    Users,
    Rocket,
    Handshake,
    DollarSign,
    Download,
    Search,
    Filter,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    useInscricoesTriunfo,
    useStartupsArenaPitch,
    useEmpresasB2B,
    useGrowthExperienceStats
} from '@/hooks/useGrowthExperienceData';

export function AdminGrowthExperienceTriunfo() {
    const stats = useGrowthExperienceStats();
    const { data: inscricoes, loading: loadingInscricoes } = useInscricoesTriunfo();
    const { data: startups, loading: loadingStartups } = useStartupsArenaPitch();
    const { data: empresasB2B, loading: loadingB2B } = useEmpresasB2B();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'inscricoes' | 'startups' | 'b2b'>('inscricoes');

    const loading = loadingInscricoes || loadingStartups || loadingB2B;

    const handleExport = () => {
        alert('Exportando dados...');
        // TODO: Implementar exportação para Excel
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Growth Experience Triunfo-PE 2026
                    </h1>
                    <p className="text-gray-400">
                        Painel de gestão do evento • 09 de Abril de 2026
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="border-dark-300 text-gray-300"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Dados
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total de Inscrições */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="h-8 w-8 text-orange-400" />
                        <Badge className="bg-orange-500/20 text-orange-400">
                            {stats.inscricoesPendentes} pendentes
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {stats.totalInscricoes}
                    </p>
                    <p className="text-gray-400 text-sm">Total de Inscrições</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-teal-400">{stats.inscricoesPagas} pagas</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-yellow-400">{stats.inscricoesPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Startups */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Rocket className="h-8 w-8 text-teal-400" />
                        <Badge className="bg-teal-500/20 text-teal-400">
                            Arena Pitch
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {stats.totalStartups}
                    </p>
                    <p className="text-gray-400 text-sm">Startups Inscritas</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-green-400">{stats.startupsAprovadas} aprovadas</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-yellow-400">{stats.startupsPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Empresas B2B */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Handshake className="h-8 w-8 text-orange-400" />
                        <Badge className="bg-orange-500/20 text-orange-400">
                            Rodada B2B
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {stats.totalEmpresasB2B}
                    </p>
                    <p className="text-gray-400 text-sm">Empresas B2B</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-green-400">{stats.empresasAprovadas} aprovadas</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-yellow-400">{stats.empresasPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Receita */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="h-8 w-8 text-green-400" />
                        <Badge className="bg-green-500/20 text-green-400">
                            Receita
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        R$ {stats.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-400 text-sm">Receita Confirmada</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-yellow-400">
                            R$ {stats.receitaPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
                        </span>
                    </div>
                </Card>
            </div>

            {/* Breakdown por Tipo */}
            <div className="grid lg:grid-cols-3 gap-4">
                <Card className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Inscrições por Tipo</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Palestras Noturnas</span>
                            <span className="text-white font-semibold">{stats.inscricoesPalestra}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Mentores 1:1</span>
                            <span className="text-white font-semibold">{stats.inscricoesMentor}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">Cursos/Treinamentos</span>
                            <span className="text-white font-semibold">{stats.inscricoesCursos}</span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Status Geral</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="text-gray-400">Confirmados</span>
                            </div>
                            <span className="text-white font-semibold">
                                {stats.inscricoesPagas + stats.startupsAprovadas + stats.empresasAprovadas}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-400" />
                                <span className="text-gray-400">Pendentes</span>
                            </div>
                            <span className="text-white font-semibold">
                                {stats.inscricoesPendentes + stats.startupsPendentes + stats.empresasPendentes}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-400" />
                                <span className="text-gray-400">Rejeitados</span>
                            </div>
                            <span className="text-white font-semibold">
                                {stats.startupsRejeitadas + stats.empresasRejeitadas}
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                    <div className="space-y-2">
                        <Button
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white justify-start"
                            onClick={() => setActiveTab('startups')}
                        >
                            <Rocket className="h-4 w-4 mr-2" />
                            Avaliar Startups ({stats.startupsPendentes})
                        </Button>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start"
                            onClick={() => setActiveTab('b2b')}
                        >
                            <Handshake className="h-4 w-4 mr-2" />
                            Aprovar Empresas B2B ({stats.empresasPendentes})
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-dark-300 text-gray-300 justify-start"
                            onClick={() => setActiveTab('inscricoes')}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Ver Todas Inscrições
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-dark-300">
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'inscricoes'
                        ? 'text-orange-400 border-b-2 border-orange-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('inscricoes')}
                >
                    Inscrições ({inscricoes.length})
                </button>
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'startups'
                        ? 'text-teal-400 border-b-2 border-teal-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('startups')}
                >
                    Startups ({startups.length})
                </button>
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'b2b'
                        ? 'text-orange-400 border-b-2 border-orange-400'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('b2b')}
                >
                    Empresas B2B ({empresasB2B.length})
                </button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 bg-dark-100 border-dark-300 text-white"
                    />
                </div>
                <Button variant="outline" className="border-dark-300 text-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="text-gray-400 mt-4">Carregando dados...</p>
                </div>
            ) : (
                <div className="glass-card p-6">
                    <p className="text-gray-400 text-center py-8">
                        Selecione uma aba acima para visualizar os dados detalhados
                    </p>
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">
                            Use os painéis específicos para gerenciar:
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Badge className="bg-teal-500/20 text-teal-400">
                                Admin Arena Pitch
                            </Badge>
                            <Badge className="bg-orange-500/20 text-orange-400">
                                Admin Rodada B2B
                            </Badge>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
