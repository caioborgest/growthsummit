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
import { toast } from 'sonner';
import {
    useInscricoesTriunfo,
    useStartupsArenaPitch,
    useEmpresasB2B,
    useGrowthExperienceStats
} from '@/hooks/useGrowthExperienceData';
import { useProject } from '@/contexts/ProjectContext';

export function AdminGrowthExperienceTriunfo() {
    const { selectedProject } = useProject();
    const stats = useGrowthExperienceStats();
    const { data: inscricoes, loading: loadingInscricoes } = useInscricoesTriunfo();
    const { data: startups, loading: loadingStartups, updateStatus: updateStartupStatus } = useStartupsArenaPitch();
    const { data: empresasB2B, loading: loadingB2B, updateStatus: updateB2BStatus } = useEmpresasB2B();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'inscricoes' | 'startups' | 'b2b'>('inscricoes');

    const loading = loadingInscricoes || loadingStartups || loadingB2B;

    const handleExport = () => {
        let activeData: any[] = [];
        let filename = 'export';
        
        if (activeTab === 'inscricoes') {
            activeData = inscricoes;
            filename = 'registrations.csv';
        } else if (activeTab === 'startups') {
            activeData = startups;
            filename = 'arena_pitch_startups.csv';
        } else if (activeTab === 'b2b') {
            activeData = empresasB2B;
            filename = 'empresas_b2b.csv';
        }

        if (activeData.length === 0) {
            toast.error('Nenhum dado para exportar');
            return;
        }

        const headers = Object.keys(activeData[0]).join(',');
        const rows = activeData.map(obj => 
            Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        const csv = [headers, ...rows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        link.click();
        
        toast.success(`Exportado com sucesso: ${filename}`);
    };

    const filterData = (data: any[]) => {
        if (!searchQuery) return data;
        return data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {selectedProject?.name || 'Projeto Growth Experience'}
                    </h1>
                    <p className="text-gray-400">
                        Painel de gestão do evento • {selectedProject?.startDate ? new Date(selectedProject.startDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data não definida'}
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
                        <Users className="h-8 w-8 text-brand-orange-coral" />
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral">
                            {stats.inscricoesPendentes} pendentes
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        {stats.totalInscricoes}
                    </p>
                    <p className="text-gray-400 text-sm">Total de Inscrições</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-brand-blue">{stats.inscricoesPagas} pagas</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-orange-400">{stats.inscricoesPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Startups */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Rocket className="h-8 w-8 text-brand-blue" />
                        <Badge className="bg-brand-blue/20 text-brand-blue">
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
                        <span className="text-orange-400">{stats.startupsPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Empresas B2B */}
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Handshake className="h-8 w-8 text-brand-orange-coral" />
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral">
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
                        <span className="text-orange-400">{stats.empresasPendentes} pendentes</span>
                    </div>
                </Card>

                {/* Receita */}
                <Card className="glass-card p-6 border-brand-orange-coral/20">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="h-8 w-8 text-brand-orange-coral" />
                        <Badge className="bg-brand-orange-coral/20 text-brand-orange-coral">
                            Receita
                        </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">
                        R$ {stats.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-gray-400 text-sm">Receita Confirmada</p>
                    <div className="mt-3 flex gap-2 text-xs">
                        <span className="text-orange-400">
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
                            className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white justify-start"
                            onClick={() => setActiveTab('startups')}
                        >
                            <Rocket className="h-4 w-4 mr-2" />
                            Avaliar Startups ({stats.startupsPendentes})
                        </Button>
                        <Button
                            className="w-full bg-brand-orange-coral hover:bg-brand-orange-coral/80 text-dark-100 justify-start"
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
                        ? 'text-brand-orange-coral border-b-2 border-brand-orange-coral'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('inscricoes')}
                >
                    Inscrições ({inscricoes.length})
                </button>
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'startups'
                        ? 'text-brand-blue border-b-2 border-brand-blue'
                        : 'text-gray-400 hover:text-white'
                        }`}
                    onClick={() => setActiveTab('startups')}
                >
                    Startups ({startups.length})
                </button>
                <button
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'b2b'
                        ? 'text-brand-orange-coral border-b-2 border-brand-orange-coral'
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
                <div className="text-center py-24 glass-card border-none">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-coral"></div>
                    <p className="text-gray-400 mt-4 font-black uppercase tracking-widest text-[10px]">Sincronizando Ecossistema...</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden border-white/5 bg-dark-200/50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Informações</th>
                                    <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Detalhes</th>
                                    <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeTab === 'inscricoes' && filterData(inscricoes).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                                                    <Users className="h-5 w-5 text-brand-orange-coral" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{item.nome}</p>
                                                    <p className="text-xs text-gray-500">{item.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1">
                                                <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 font-black uppercase text-[8px] tracking-widest px-2">
                                                    {item.registration_type}
                                                </Badge>
                                                <p className="text-xs text-gray-400">R$ {Number(item.paid_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge className={`font-black uppercase text-[8px] tracking-widest ${
                                                item.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.payment_status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white">
                                                <Filter className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'startups' && filterData(startups).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
                                                    <Rocket className="h-5 w-5 text-brand-blue" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{item.startup_name}</p>
                                                    <p className="text-xs text-gray-500">{item.setor} • {item.estagio}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-xs text-gray-400 line-clamp-2 max-w-xs">{item.startup_description}</p>
                                        </td>
                                        <td className="p-6">
                                            <Badge className={`font-black uppercase text-[8px] tracking-widest ${
                                                item.status === 'aprovado' ? 'bg-green-500/20 text-green-400' : 
                                                item.status === 'rejeitado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="outline" size="sm" 
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-green-500 hover:text-white"
                                                    onClick={() => updateStartupStatus(item.id, 'aprovado').then(() => toast.success('Startup aprovada!'))}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                                                </Button>
                                                <Button 
                                                    variant="outline" size="sm" 
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-red-500 hover:text-white"
                                                    onClick={() => updateStartupStatus(item.id, 'rejeitado').then(() => toast.success('Startup rejeitada'))}
                                                >
                                                    <XCircle className="h-3 w-3 mr-1" /> Rejeitar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'b2b' && filterData(empresasB2B).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                                                    <Handshake className="h-5 w-5 text-brand-orange-coral" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{item.company_name}</p>
                                                    <p className="text-xs text-gray-500">{item.porte} • {item.setor}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-xs text-gray-400">
                                            {item.interest_areas?.join(', ')}
                                        </td>
                                        <td className="p-6">
                                            <Badge className={`font-black uppercase text-[8px] tracking-widest ${
                                                item.status === 'aprovado' ? 'bg-green-500/20 text-green-400' : 
                                                item.status === 'rejeitado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="outline" size="sm" 
                                                    className="h-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-brand-orange-coral hover:text-white"
                                                    onClick={() => updateB2BStatus(item.id, 'aprovado').then(() => toast.success('Empresa B2B aprovada!'))}
                                                >
                                                    <CheckCircle className="h-3 w-3 mr-1" /> Aprovar
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filterData(activeTab === 'inscricoes' ? inscricoes : activeTab === 'startups' ? startups : empresasB2B).length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5 opacity-20">
                                                <Search className="h-10 w-10 text-gray-500" />
                                            </div>
                                            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Nenhum registro localizado no horizonte</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
