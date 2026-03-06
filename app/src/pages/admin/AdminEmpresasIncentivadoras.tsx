import { useState } from 'react';
import {
    Search,
    Trophy,
    Plus,
    Trash2,
    CheckCircle,
    XCircle,
    Building2,
    Users,
    Mail,
    Phone,
    Medal,
    TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmpresasIncentivadoras } from '@/hooks/useData';
import { toast } from 'sonner';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';

const statusColors: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    rejected: 'bg-red-500/20 text-red-400',
    aprovado: 'bg-green-500/20 text-green-400', // Backward compatibility
    pendente: 'bg-yellow-500/20 text-yellow-400',
    rejeitado: 'bg-red-500/20 text-red-400',
};

export default function AdminEmpresasIncentivadoras() {
    const { data: empresas, update, remove, isLoading } = useEmpresasIncentivadoras();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredEmpresas = (empresas || []).filter(emp => {
        const q = searchQuery.toLowerCase();
        return (
            (emp.nomeEmpresa?.toLowerCase() || '').includes(q) ||
            (emp.nomeResponsavel?.toLowerCase() || '').includes(q) ||
            (emp.email?.toLowerCase() || '').includes(q)
        );
    });

    // Calcular Ranking (Apenas aprovados)
    const ranking = [...(empresas || [])]
        .filter(emp => (emp.status as string) === 'approved' || (emp.status as string) === 'aprovado')
        .map(emp => ({
            ...emp,
            score: (emp.quantidadeDia || 0) + (emp.quantidadeNoite || 0)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const handleApprove = async (id: string) => {
        try {
            await update(id, { status: 'approved' });
            toast.success('Empresa aprovada!');
        } catch {
            toast.error('Erro ao aprovar empresa');
        }
    };

    const handleReject = async (id: string) => {
        try {
            if (confirm('Deseja rejeitar esta empresa?')) {
                await update(id, { status: 'rejected' });
                toast.success('Empresa rejeitada');
            }
        } catch {
            toast.error('Erro ao rejeitar empresa');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (confirm('Deseja EXCLUIR permanentemente esta empresa? Esta ação não pode ser desfeita.')) {
                await remove(id);
                toast.success('Empresa excluída com sucesso');
            }
        } catch {
            toast.error('Erro ao excluir empresa');
        }
    };

    return (
        <div className="space-y-6">
            {/* Banner de Premiação */}
            <div className="bg-gradient-to-r from-teal-500/20 to-brand-orange-coral/20 border border-teal-500/30 rounded-3xl p-6 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-10 w-10 text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight mb-2 uppercase italic">
                            Prêmio Especial: Empresa Incentivadora na Educação Empreendedora
                        </h2>
                        <p className="text-gray-300 text-sm max-w-3xl leading-relaxed">
                            A empresa que levar a <strong className="text-teal-400">maior quantidade de colaboradores</strong> para a programação diurna e noturna (paga) receberá o prêmio oficial
                            por seu compromisso com a educação empreendedora de sua equipe.
                        </p>
                    </div>
                    <div className="flex-1" />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-brand-orange-coral/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Inserir Empresa
                    </Button>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Ranking Leaderboard */}
            {ranking.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ranking.map((emp, index) => (
                        <div key={emp.id} className={`relative overflow-hidden glass-card p-4 border-l-4 ${index === 0 ? 'border-yellow-500 bg-yellow-500/5' :
                            index === 1 ? 'border-slate-400 bg-slate-400/5' :
                                'border-amber-700 bg-amber-700/5'
                            }`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${index === 0 ? 'bg-yellow-500 text-black' :
                                    index === 1 ? 'bg-slate-400 text-black' :
                                        'bg-amber-700 text-white'
                                    }`}>
                                    {index + 1}º
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white truncate">{emp.nomeEmpresa}</h4>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3 text-teal-400" />
                                        {emp.score} pontos totais
                                    </p>
                                </div>
                                {index === 0 && <Medal className="h-6 w-6 text-yellow-500 animate-pulse" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Buscar empresa ou responsável..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmpresas.map((emp) => (
                    <div key={emp.id} className="glass-card p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <div className="flex gap-2">
                                <Badge className={statusColors[emp.status] || 'bg-gray-500/20 text-gray-400'}>
                                    {emp.status}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(emp.id)}
                                    className="h-8 w-8 p-0 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{emp.nomeEmpresa}</h3>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-teal-500/5 rounded-lg p-2 border border-teal-500/10">
                                    <p className="text-[10px] uppercase font-black text-teal-400/60 leading-none mb-1">Dia</p>
                                    <p className="text-lg font-bold text-white leading-none">{emp.quantidadeDia || 0}</p>
                                </div>
                                <div className="bg-brand-orange-coral/5 rounded-lg p-2 border border-brand-orange-coral/10">
                                    <p className="text-[10px] uppercase font-black text-brand-orange-coral/60 leading-none mb-1">Noite</p>
                                    <p className="text-lg font-bold text-white leading-none">{emp.quantidadeNoite || 0}</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mt-3 flex items-center">
                                <Users className="h-3 w-3 mr-1 text-teal-400" />
                                Engajamento Total: {(emp.quantidadeDia || 0) + (emp.quantidadeNoite || 0)}
                            </p>
                        </div>

                        <div className="space-y-2 py-4 border-y border-white/5">
                            <div className="flex items-center text-sm text-gray-300">
                                <Building2 className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.nomeResponsavel}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <Mail className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <Phone className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.phone}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Objetivo/Incentivo</p>
                            <p className="text-sm text-gray-400 line-clamp-3 italic">"{emp.objetivo}"</p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            {((emp.status as string) === 'pendente' || (emp.status as string) === 'pending') && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApprove(emp.id)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprovar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReject(emp.id)}
                                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Rejeitar
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {filteredEmpresas.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center">
                        <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma empresa encontrada.</p>
                    </div>
                )}
            </div>


            <EmpresaIncentivadoraModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isAdmin={true}
            />
        </div>
    );
}
