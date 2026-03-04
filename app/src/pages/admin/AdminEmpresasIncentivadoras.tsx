import { useState } from 'react';
import {
    Search,
    Trophy,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Users,
    Mail,
    Phone,
    Plus,
    Trash2,
    Info,
    AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmpresasIncentivadoras } from '@/hooks/useData';
import { toast } from 'sonner';
import { EmpresaIncentivadoraModal } from '@/components/forms/EmpresaIncentivadoraModal';

const statusColors: Record<string, string> = {
    aprovado: 'bg-green-500/20 text-green-400',
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

    const handleApprove = async (id: string) => {
        try {
            await update(id, { status: 'aprovado' });
            toast.success('Empresa aprovada!');
        } catch (err) {
            toast.error('Erro ao aprovar empresa');
        }
    };

    const handleReject = async (id: string) => {
        try {
            if (confirm('Deseja rejeitar esta empresa?')) {
                await update(id, { status: 'rejeitado' });
                toast.success('Empresa rejeitada');
            }
        } catch (err) {
            toast.error('Erro ao rejeitar empresa');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            if (confirm('Deseja EXCLUIR permanentemente esta empresa? Esta ação não pode ser desfeita.')) {
                await remove(id);
                toast.success('Empresa excluída com sucesso');
            }
        } catch (err) {
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
                            <h3 className="text-xl font-bold text-white">{emp.nomeEmpresa}</h3>
                            <p className="text-gray-400 text-sm flex items-center mt-1">
                                <Users className="h-4 w-4 mr-2 text-teal-400" />
                                {emp.quantidadeEquipe} colaboradores
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
                            {emp.status === 'pendente' && (
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
