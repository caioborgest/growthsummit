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
    Plus
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
    const { data: empresas, update, isLoading } = useEmpresasIncentivadoras();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredEmpresas = (empresas || []).filter(emp => {
        const q = searchQuery.toLowerCase();
        return (
            (emp.nome_empresa?.toLowerCase() || '').includes(q) ||
            (emp.nome_responsavel?.toLowerCase() || '').includes(q) ||
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

    return (
        <div className="space-y-6">
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
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmpresas.map((emp) => (
                    <div key={emp.id} className="glass-card p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-xl bg-brand-orange-coral/20 flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <Badge className={statusColors[emp.status] || 'bg-gray-500/20 text-gray-400'}>
                                {emp.status}
                            </Badge>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white">{emp.nome_empresa}</h3>
                            <p className="text-gray-400 text-sm flex items-center mt-1">
                                <Users className="h-4 w-4 mr-2 text-teal-400" />
                                {emp.quantidade_equipe} colaboradores
                            </p>
                        </div>

                        <div className="space-y-2 py-4 border-y border-white/5">
                            <div className="flex items-center text-sm text-gray-300">
                                <Building2 className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.nome_responsavel}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <Mail className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                                <Phone className="h-4 w-4 mr-3 text-brand-orange-coral" />
                                <span>{emp.telefone}</span>
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
            />
        </div>
    );
}
