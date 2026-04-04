import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Building2,
    XCircle,
    Copy,
    Users,
    CreditCard,
    TrendingDown,
    MoreVertical,
    Eye,
    Trash2,
    Ticket
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<RegistrationBatch | null>(null);

    const [formData, setFormData] = useState({
        companyName: '',
        cnpj: '',
        responsibleName: '',
        responsibleEmail: '',
        contactEmail: '',
        voucherCode: '',
        totalSlots: 5,
        ticketType: 'pro' as 'morning' | 'pro',
        totalAmount: 0,
        paymentStatus: 'pending' as 'pending' | 'paid' | 'cancelled',
        notes: ''
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
        const matchesSearch = (b.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.voucherCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.contactEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
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
            totalSlots: qty,
            totalAmount: calculateTotal(qty)
        });
    };

    const generateVoucher = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const prefix = formData.companyName.substring(0, 3).toUpperCase().replace(/\s/g, 'X');
        setFormData({ ...formData, voucherCode: `GX-${prefix}-${random}` });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBatch) {
                await update(editingBatch.id, {
                    ...formData,
                    voucherCode: (formData.voucherCode || '').toUpperCase()
                });
                toast.success('Lote atualizado com sucesso!');
            } else {
                await create({
                    ...formData,
                    projectId: projectId || '',
                    usedSlots: 0,
                    voucherCode: (formData.voucherCode || '').toUpperCase()
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
            companyName: '',
            cnpj: '',
            responsibleName: '',
            responsibleEmail: '',
            contactEmail: '',
            voucherCode: '',
            totalSlots: 5,
            ticketType: 'pro',
            totalAmount: calculateTotal(5),
            paymentStatus: 'pending',
            notes: ''
        });
    };

    const handleEdit = (batch: RegistrationBatch) => {
        setEditingBatch(batch);
        setFormData({
            companyName: batch.companyName,
            cnpj: batch.cnpj || '',
            responsibleName: batch.responsibleName || '',
            responsibleEmail: batch.responsibleEmail || '',
            contactEmail: batch.contactEmail,
            voucherCode: batch.voucherCode,
            totalSlots: batch.totalSlots,
            ticketType: batch.ticketType as any,
            totalAmount: batch.totalAmount,
            paymentStatus: batch.paymentStatus as any,
            notes: batch.notes || ''
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
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="cancelled">Cancelado</option>
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
                    { label: 'Vagas Vendidas', value: batches.reduce((sum, b) => sum + b.totalSlots, 0), icon: Users, color: 'emerald' },
                    { label: 'Vagas Utilizadas', value: batches.reduce((sum, b) => sum + b.usedSlots, 0), icon: Ticket, color: 'orange' },
                    { label: 'Receita Equipes', value: `R$ ${batches.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'pago').reduce((sum, b) => sum + Number(b.totalAmount), 0).toLocaleString()}`, icon: TrendingDown, color: 'purple' },
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
                <div className="overflow-x-auto responsive-table">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Empresa</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Voucher</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Vagas</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Valor</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-right text-gray-500 font-extrabold text-[10px] uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredBatches.map(batch => (
                                <tr key={batch.id} className="hover:bg-white/[0.04] transition-all group">
                                    <td className="px-6 py-5" data-label="Empresa">
                                        <div>
                                            <p className="text-white font-black italic tracking-tight">{batch.companyName}</p>
                                            <p className="text-gray-500 text-[10px] font-medium">{batch.contactEmail}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Voucher">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-brand-orange-coral/10 text-brand-orange-coral px-3 py-1.5 rounded-xl border border-brand-orange-coral/20 font-black text-xs uppercase tracking-tighter shadow-inner">
                                                {batch.voucherCode}
                                            </code>
                                            <button onClick={() => copyToClipboard(batch.voucherCode)} className="text-gray-600 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100">
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Vagas">
                                        <div className="space-y-1.5 w-full lg:w-32">
                                            <div className="flex justify-between text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                                <span>{batch.usedSlots} / {batch.totalSlots}</span>
                                                <span className="text-brand-orange-coral">{Math.round((batch.usedSlots / batch.totalSlots) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-brand-orange-coral shadow-[0_0_8px_rgba(255,112,67,0.4)]"
                                                    style={{ width: `${(batch.usedSlots / batch.totalSlots) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-white font-black text-sm italic tracking-tight" data-label="Valor">
                                        R$ {Number(batch.totalAmount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5" data-label="Status">
                                        <Badge className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                                            (batch.paymentStatus === 'paid' || batch.paymentStatus === 'pago') ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                (batch.paymentStatus === 'pending' || batch.paymentStatus === 'pendente') ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                            {(batch.paymentStatus === 'paid' || batch.paymentStatus === 'pago' ? 'PAGO' : 
                                              batch.paymentStatus === 'pending' || batch.paymentStatus === 'pendente' ? 'PENDENTE' : 
                                              'CANCELADO')}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div className="glass-card max-w-2xl w-full p-0 overflow-hidden shadow-2xl border-brand-orange-coral/20 flex flex-col min-h-0 max-h-[90vh]">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-dark-300/50 shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-white italic tracking-tight uppercase leading-none">
                                    {editingBatch ? 'Editar Lote Equipe' : 'Novo Lote Corporativo'}
                                </h2>
                                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">Configuração de Vouchers em Lote</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                                {/* Seção Empresa */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Empresa</Label>
                                        <Input 
                                            required 
                                            value={formData.companyName} 
                                            onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="Ex: Growth & IA Hub"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNPJ (Opcional)</Label>
                                        <Input 
                                            value={formData.cnpj} 
                                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="00.000.000/0000-00"
                                        />
                                    </div>
                                </div>

                                {/* Seção Responsável */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsável (Líder)</Label>
                                        <Input 
                                            required 
                                            value={formData.responsibleName} 
                                            onChange={e => setFormData({ ...formData, responsibleName: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="Nome Completo"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail de Acesso</Label>
                                        <Input 
                                            required
                                            type="email"
                                            value={formData.responsibleEmail} 
                                            onChange={e => setFormData({ ...formData, responsibleEmail: e.target.value, contactEmail: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="email@equipe.com"
                                        />
                                    </div>
                                </div>

                                {/* Seção Financeira/Voucher */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail Financeiro</Label>
                                        <Input 
                                            type="email" 
                                            value={formData.contactEmail} 
                                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="pago@empresa.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Voucher Personalizado</Label>
                                        <div className="flex gap-2">
                                            <Input 
                                                required 
                                                value={formData.voucherCode} 
                                                onChange={e => setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })} 
                                                className="bg-dark-100 border-brand-orange-coral/20 text-brand-orange-coral font-black uppercase h-11 rounded-xl tracking-widest" 
                                            />
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={generateVoucher} 
                                                className="border-white/5 hover:border-brand-orange-coral/50 text-gray-400 hover:text-brand-orange-coral h-11 w-11 rounded-xl"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Seção Valores/Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qtd de Vagas</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.totalSlots}
                                            onChange={e => handleQtyChange(Number(e.target.value))}
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl font-bold"
                                        />
                                        {formData.totalSlots < 5 && (
                                            <p className="text-[9px] text-yellow-500 font-bold uppercase tracking-tighter">Mín. 5 para 30% desc.</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Total</Label>
                                        <div className="bg-dark-100 border border-white/5 rounded-xl h-11 flex items-center px-4 text-white font-black text-lg">
                                            R$ {formData.totalAmount}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</Label>
                                        <select
                                            value={formData.paymentStatus}
                                            onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                                            className="w-full h-11 px-4 bg-dark-100 border border-white/5 rounded-xl text-white text-sm font-bold focus:ring-1 focus:ring-brand-orange-coral/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="pending">Pendente</option>
                                            <option value="paid">Pago</option>
                                            <option value="cancelled">Cancelado</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações</Label>
                                    <textarea 
                                        value={formData.notes} 
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                                        className="w-full bg-dark-100 border border-white/5 rounded-xl p-4 text-white text-sm min-h-[80px] focus:border-brand-orange-coral/30 outline-none transition-colors" 
                                        placeholder="Forma de pagamento, responsável pela venda..." 
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 shrink-0 bg-dark-300/50">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-white/5 text-gray-400 hover:text-white hover:bg-white/5 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black shadow-lg shadow-brand-orange-coral/20 h-11 rounded-xl uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] disabled:opacity-50" disabled={isLoading}>
                                    {isLoading ? 'ENVIANDO...' : editingBatch ? 'SALVAR ALTERAÇÕES' : 'GERAR LOTE DE EQUIPE'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
