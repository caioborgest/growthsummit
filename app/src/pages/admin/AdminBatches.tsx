import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Building2,
    CheckCircle2,
    XCircle,
    Copy,
    Users,
    Calendar,
    Filter,
    CreditCard,
    TrendingDown,
    MoreVertical,
    Download,
    Eye,
    Trash2,
    Ticket
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useRegistrationBatches } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { RegistrationBatch } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export default function AdminBatches() {
    const { projectId, isProjectSelected } = useProject();
    const navigate = useNavigate();
    const { data: batches, create, update, remove, isLoading } = useRegistrationBatches();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'pago' | 'cancelado'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<RegistrationBatch | null>(null);

    const [formData, setFormData] = useState({
        nomeEmpresa: '',
        cnpj: '',
        nomeResponsavel: '',
        emailResponsavel: '',
        emailContato: '',
        voucherCode: '',
        quantidadeVagas: 5,
        tipoIngresso: 'pro' as 'morning' | 'pro',
        valorTotal: 0,
        statusPagamento: 'pendente' as 'pendente' | 'pago' | 'cancelado',
        observacoes: ''
    });

    if (!isProjectSelected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="glass-card max-w-lg w-full p-8 text-center border-orange-500/20 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                        <Building2 className="w-10 h-10 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                        Selecione um Projeto
                    </h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Para gerenciar lotes de equipes, selecione um projeto primeiro.
                    </p>
                    <Button onClick={() => navigate('/admin/projetos')} className="bg-brand-orange-coral text-white font-bold px-8">
                        Ir para Projetos
                    </Button>
                </div>
            </div>
        );
    }

    const filteredBatches = batches.filter(b => {
        const matchesSearch = b.nomeEmpresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.voucherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.emailContato.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.statusPagamento === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const calculateTotal = (qty: number) => {
        const unitPrice = 179.99;
        const subtotal = unitPrice * qty;
        // 30% discount for 5 or more
        const discount = qty >= 5 ? 0.3 : 0;
        return Number((subtotal * (1 - discount)).toFixed(2));
    };

    const handleQtyChange = (qty: number) => {
        setFormData({
            ...formData,
            quantidadeVagas: qty,
            valorTotal: calculateTotal(qty)
        });
    };

    const generateVoucher = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const prefix = formData.nomeEmpresa.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
        setFormData({ ...formData, voucherCode: `GS-${prefix}-${random}` });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBatch) {
                await update(editingBatch.id, {
                    ...formData,
                    voucherCode: formData.voucherCode.toUpperCase()
                });
                toast.success('Lote atualizado com sucesso!');
            } else {
                await create({
                    ...formData,
                    projectId: projectId || '',
                    vagasUtilizadas: 0,
                    voucherCode: formData.voucherCode.toUpperCase()
                });
                toast.success('Lote corporativo criado com sucesso!');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            logger.error('Erro ao salvar lote:', err);
            toast.error('Erro ao salvar lote corporativo.');
        }
    };

    const resetForm = () => {
        setEditingBatch(null);
        setFormData({
            nomeEmpresa: '',
            cnpj: '',
            nomeResponsavel: '',
            emailResponsavel: '',
            emailContato: '',
            voucherCode: '',
            quantidadeVagas: 5,
            tipoIngresso: 'pro',
            valorTotal: calculateTotal(5),
            statusPagamento: 'pendente',
            observacoes: ''
        });
    };

    const handleEdit = (batch: RegistrationBatch) => {
        setEditingBatch(batch);
        setFormData({
            nomeEmpresa: batch.nomeEmpresa,
            cnpj: batch.cnpj || '',
            nomeResponsavel: batch.nomeResponsavel || '',
            emailResponsavel: batch.emailResponsavel || '',
            emailContato: batch.emailContato,
            voucherCode: batch.voucherCode,
            quantidadeVagas: batch.quantidadeVagas,
            tipoIngresso: batch.tipoIngresso,
            valorTotal: batch.valorTotal,
            statusPagamento: batch.statusPagamento,
            observacoes: batch.observacoes || ''
        });
        setIsModalOpen(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Código copiado!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input
                            placeholder="Empresa, voucher ou email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-12 w-full bg-dark-100 border-dark-300 text-white"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <Button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-brand-orange-coral text-white shadow-glow-orange"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Lote Corporativo
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total de Lotes', value: batches.length, icon: Building2, color: 'blue' },
                    { label: 'Vagas Vendidas', value: batches.reduce((sum, b) => sum + b.quantidadeVagas, 0), icon: Users, color: 'emerald' },
                    { label: 'Vagas Utilizadas', value: batches.reduce((sum, b) => sum + b.vagasUtilizadas, 0), icon: Ticket, color: 'orange' },
                    { label: 'Receita Equipes', value: `R$ ${batches.filter(b => b.statusPagamento === 'pago').reduce((sum, b) => sum + Number(b.valorTotal), 0).toLocaleString()}`, icon: TrendingDown, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-l-4 border-brand-orange-coral shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-[10px] font-black uppercase mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                            </div>
                            <stat.icon className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-left text-gray-500 font-extrabold text-[10px] uppercase">Empresa</th>
                                <th className="px-6 py-4 text-left text-gray-500 font-extrabold text-[10px] uppercase">Voucher</th>
                                <th className="px-6 py-4 text-left text-gray-500 font-extrabold text-[10px] uppercase">Vagas</th>
                                <th className="px-6 py-4 text-left text-gray-500 font-extrabold text-[10px] uppercase">Valor</th>
                                <th className="px-6 py-4 text-left text-gray-500 font-extrabold text-[10px] uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-gray-500 font-extrabold text-[10px] uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredBatches.map(batch => (
                                <tr key={batch.id} className="hover:bg-white/[0.03] transition-all">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-white font-bold">{batch.nomeEmpresa}</p>
                                            <p className="text-gray-500 text-xs">{batch.emailContato}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-brand-orange-coral/10 text-brand-orange-coral px-2 py-1 rounded border border-brand-orange-coral/20 font-bold text-xs uppercase">
                                                {batch.voucherCode}
                                            </code>
                                            <button onClick={() => copyToClipboard(batch.voucherCode)} className="text-gray-500 hover:text-white">
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                                                <span>{batch.vagasUtilizadas} / {batch.quantidadeVagas}</span>
                                                <span>{Math.round((batch.vagasUtilizadas / batch.quantidadeVagas) * 100)}%</span>
                                            </div>
                                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-orange-coral"
                                                    style={{ width: `${(batch.vagasUtilizadas / batch.quantidadeVagas) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-bold text-sm">
                                        R$ {Number(batch.valorTotal).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={
                                            batch.statusPagamento === 'pago' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                batch.statusPagamento === 'pendente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                        }>
                                            {batch.statusPagamento.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-dark-200 border-white/10 text-white">
                                                <DropdownMenuItem onClick={() => handleEdit(batch)}>
                                                    <Eye className="h-4 w-4 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`/admin/inscricoes?lote=${batch.id}`)}>
                                                    <Users className="h-4 w-4 mr-2" /> Ver Integrantes
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-400" onClick={() => remove(batch.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card max-w-2xl w-full p-0 overflow-hidden shadow-2xl border-brand-orange-coral/20">
                        <div className="p-6 border-b border-dark-300 flex justify-between items-center bg-dark-300/30">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingBatch ? 'Editar Lote Equipe' : 'Novo Lote Corporativo'}
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">Configure a compra de vagas em grupo com desconto.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Empresa</label>
                                    <Input required value={formData.nomeEmpresa} onChange={e => setFormData({ ...formData, nomeEmpresa: e.target.value })} className="bg-dark-100 border-dark-300 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">CNPJ (Opcional)</label>
                                    <Input value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} className="bg-dark-100 border-dark-300 text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Nome Completo do Portador (Líder da Equipe)</label>
                                    <Input required value={formData.nomeResponsavel} onChange={e => setFormData({ ...formData, nomeResponsavel: e.target.value })} className="bg-dark-100 border-dark-300 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">E-mail do Líder da Equipe (Esse e-mail terá acesso as métricas)</label>
                                    <Input value={formData.emailResponsavel} onChange={e => setFormData({ ...formData, emailResponsavel: e.target.value, emailContato: e.target.value })} className="bg-dark-100 border-dark-300 text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">E-mail Secundário Contato (NF / Financeiro)</label>
                                    <Input type="email" value={formData.emailContato} onChange={e => setFormData({ ...formData, emailContato: e.target.value })} className="bg-dark-100 border-dark-300 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Código do Voucher</label>
                                    <div className="flex gap-2">
                                        <Input required value={formData.voucherCode} onChange={e => setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })} className="bg-dark-100 border-white/5 text-brand-orange-coral font-bold uppercase" />
                                        <Button type="button" variant="outline" size="icon" onClick={generateVoucher} className="border-white/5 text-gray-400">
                                            <CreditCard className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Qtd de Vagas</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.quantidadeVagas}
                                        onChange={e => handleQtyChange(Number(e.target.value))}
                                        className="bg-dark-100 border-dark-300 text-white"
                                    />
                                    {formData.quantidadeVagas < 5 && (
                                        <p className="text-[10px] text-yellow-500">Mínimo de 5 para desconto de 30%</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Valor Total</label>
                                    <div className="bg-dark-100 border border-dark-300 rounded-lg h-10 flex items-center px-4 text-white font-bold">
                                        R$ {formData.valorTotal}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Status Pagamento</label>
                                    <select
                                        value={formData.statusPagamento}
                                        onChange={e => setFormData({ ...formData, statusPagamento: e.target.value as any })}
                                        className="w-full h-10 px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="pago">Pago</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Observações Internas</label>
                                <textarea value={formData.observacoes} onChange={e => setFormData({ ...formData, observacoes: e.target.value })} className="w-full bg-dark-100 border border-dark-300 rounded-lg p-3 text-white text-sm min-h-[60px]" placeholder="Motivo do desconto, forma de pagamento acertada, etc..." />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-white/5 text-gray-400">Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-brand-orange-coral text-white font-bold" disabled={isLoading}>
                                    {isLoading ? 'Salvando...' : editingBatch ? 'Salvar Lote' : 'Gerar Lote'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
