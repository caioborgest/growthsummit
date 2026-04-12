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
    const { data: batches, create, update, remove, isLoading, refetch } = useRegistrationBatches();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState<RegistrationBatch | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        cnpj: '',
        responsibleName: '',
        responsibleEmail: '',
        contactEmail: '',
        voucherCode: '',
        total_slots: 5,
        ticketType: 'pro' as 'morning' | 'pro' | 'vip',
        unit_price: 179.99,
        discount_percentage: 0,
        price: 0,
        active: true,
        expiresAt: '',
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
        const matchesSearch = (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.voucherCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.contactEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.paymentStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const calculateTotal = (qty: number, unitPrice: number, discountPercentage: number) => {
        const subtotal = unitPrice * qty;
        const discountFactor = 1 - (discountPercentage / 100);
        return Number((subtotal * discountFactor).toFixed(2));
    };

    const handleValuesChange = (updates: Partial<{ total_slots: number; unit_price: number; discount_percentage: number }>) => {
        const newData = { ...formData, ...updates };
        const newTotal = calculateTotal(
            newData.total_slots,
            newData.unit_price,
            newData.discount_percentage
        );
        setFormData({ ...newData, price: newTotal });
    };

    const generateVoucher = () => {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        const prefix = (formData.name || 'GX').substring(0, 3).toUpperCase().replace(/\s/g, 'X');
        setFormData({ ...formData, voucherCode: `GX-${prefix}-${random}` });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação obrigatória: Garante que pelo menos um nome foi fornecido
        const effectiveCompanyName = formData.companyName.trim() || formData.name.trim();
        if (!effectiveCompanyName) {
            toast.error('O nome da empresa ou identificação do lote é obrigatório.');
            return;
        }

        try {
            const payload = {
                ...formData,
                companyName: effectiveCompanyName, // Aplica o fallback
                voucherCode: (formData.voucherCode || '').toUpperCase()
            };

            if (editingBatch) {
                await update(editingBatch.id, payload);
                toast.success('Lote atualizado com sucesso!');
            } else {
                await create({
                    ...payload,
                    projectId: projectId || '',
                    used_slots: 0,
                    updatedAt: new Date().toISOString()
                } as any);
                toast.success('Lote corporativo criado com sucesso!');
            }
            setIsModalOpen(false);
            resetForm();
            await refetch(true); // Force refetch
        } catch (err: any) {
            logger.error('Erro ao salvar lote:', err);
            toast.error('Erro ao salvar lote corporativo.');
        }
    };

    const resetForm = () => {
        setEditingBatch(null);
        setFormData({
            name: '',
            companyName: '',
            cnpj: '',
            responsibleName: '',
            responsibleEmail: '',
            contactEmail: '',
            voucherCode: '',
            total_slots: 5,
            ticketType: 'pro',
            unit_price: 179.99,
            discount_percentage: 0,
            price: calculateTotal(5, 179.99, 0),
            active: true,
            expiresAt: '',
            paymentStatus: 'pending',
            notes: ''
        });
    };

    const handleEdit = (batch: RegistrationBatch) => {
        setEditingBatch(batch);
        setFormData({
            name: batch.name,
            companyName: batch.companyName || batch.name || '',
            cnpj: batch.cnpj || '',
            responsibleName: batch.responsibleName || '',
            responsibleEmail: batch.responsibleEmail || '',
            contactEmail: batch.contactEmail,
            voucherCode: batch.voucherCode,
            total_slots: batch.total_slots,
            ticketType: batch.ticketType as any,
            unit_price: batch.unit_price || 179.99,
            discount_percentage: batch.discount_percentage || 0,
            price: batch.price,
            active: batch.active !== undefined ? batch.active : true,
            expiresAt: batch.expiresAt || '',
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
                    { label: 'Vagas Vendidas', value: batches.reduce((sum, b) => sum + b.total_slots, 0), icon: Users, color: 'emerald' },
                    { label: 'Vagas Utilizadas', value: batches.reduce((sum, b) => sum + b.used_slots, 0), icon: Ticket, color: 'orange' },
                    { label: 'Receita Equipes', value: `R$ ${batches.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + Number(b.price), 0).toLocaleString()}`, icon: TrendingDown, color: 'purple' },
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
                                            <p className="text-white font-black italic tracking-tight">{batch.name}</p>
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
                                                <span>{batch.used_slots} / {batch.total_slots}</span>
                                                <span className="text-brand-orange-coral">{Math.round((batch.used_slots / Math.max(1, batch.total_slots)) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-brand-orange-coral shadow-[0_0_8px_rgba(255,112,67,0.4)]"
                                                    style={{ width: `${(batch.used_slots / Math.max(1, batch.total_slots)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-white font-black text-sm italic tracking-tight" data-label="Valor">
                                        R$ {Number(batch.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5" data-label="Status">
                                        <Badge className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 ${
                                            batch.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            batch.paymentStatus === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                        }`}>
                                            {batch.paymentStatus === 'paid' ? 'Paid' : 
                                             batch.paymentStatus === 'cancelled' ? 'Cancelled' : 'Pending'}
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
                                                <DropdownMenuItem className="text-red-400" onClick={async () => {
                                                    if (confirm('Excluir este lote?')) {
                                                        await remove(batch.id);
                                                        await refetch(true);
                                                    }
                                                }}>
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
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="admin-modal-header">
                            <div>
                                <h2 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">
                                    {editingBatch ? 'Editar Lote Equipe' : 'Novo Lote Corporativo'}
                                </h2>
                                <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">Configuração de Vouchers em Lote</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <XCircle className="h-6 w-6" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                            <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                                {/* Seção Empresa */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identificação do Lote</Label>
                                        <Input 
                                            required 
                                            value={formData.name} 
                                            onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            className="bg-dark-100 border-white/10 text-white h-11 rounded-xl focus:border-brand-orange-coral/50" 
                                            placeholder="Ex: Lote VIP CBX"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Razão Social / Empresa</Label>
                                        <Input 
                                            value={formData.companyName} 
                                            onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                                            className="bg-dark-100 border-brand-orange-coral/20 text-white h-11 rounded-xl focus:border-brand-orange-coral/50" 
                                            placeholder="Obrigatório para corporativo"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CNPJ</Label>
                                        <Input 
                                            value={formData.cnpj} 
                                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="00.000.000/0001-00"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail de Contato</Label>
                                        <Input 
                                            type="email" 
                                            value={formData.contactEmail} 
                                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="financeiro@empresa.com.br"
                                        />
                                    </div>
                                </div>
                                {/* Seção Responsável */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome do Responsável</Label>
                                        <Input 
                                            required 
                                            value={formData.responsibleName} 
                                            onChange={e => setFormData({ ...formData, responsibleName: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="Ex: João Silva"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail do Responsável</Label>
                                        <Input 
                                            required
                                            type="email"
                                            value={formData.responsibleEmail} 
                                            onChange={e => setFormData({ ...formData, responsibleEmail: e.target.value })} 
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl focus:border-brand-orange-coral/30" 
                                            placeholder="responsavel@empresa.com.br"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Código do Voucher</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            required 
                                            value={formData.voucherCode} 
                                            onChange={e => setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })} 
                                            className="bg-dark-100 border-brand-orange-coral/20 text-brand-orange-coral font-black uppercase h-11 rounded-xl tracking-widest" 
                                            placeholder="Gerado automaticamente"
                                        />
                                        <button
                                            type="button"
                                            onClick={generateVoucher}
                                            className="border-white/5 hover:border-brand-orange-coral/50 text-gray-400 hover:text-brand-orange-coral h-11 w-11 rounded-xl bg-dark-100 border flex items-center justify-center transition-colors"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Seção Valores/Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total de Vagas</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.total_slots}
                                            onChange={e => handleValuesChange({ total_slots: Number(e.target.value) })}
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl font-bold"
                                            placeholder="Ex: 10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Unitário (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.unit_price}
                                            onChange={e => handleValuesChange({ unit_price: Number(e.target.value) })}
                                            className="bg-dark-100 border-white/5 text-white h-11 rounded-xl font-bold"
                                            placeholder="179.99"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desconto (%)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={formData.discount_percentage}
                                                onChange={e => handleValuesChange({ discount_percentage: Number(e.target.value) })}
                                                className="bg-dark-100 border-white/5 text-white h-11 rounded-xl font-bold pr-10"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-brand-orange-coral uppercase tracking-widest">Valor Total Calculado (R$)</Label>
                                        <div className="bg-brand-orange-coral/5 border border-brand-orange-coral/20 rounded-xl h-11 flex items-center px-4 text-brand-orange-coral font-black text-xl shadow-inner">
                                            R$ {formData.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status do Pagamento</Label>
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
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Ingresso</Label>
                                    <select
                                        value={formData.ticketType}
                                        onChange={e => setFormData({ ...formData, ticketType: e.target.value as any })}
                                        className="w-full h-11 px-4 bg-dark-100 border border-white/5 rounded-xl text-white text-sm font-bold focus:ring-1 focus:ring-brand-orange-coral/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="pro">Pro</option>
                                        <option value="morning">Standard</option>
                                        <option value="vip">VIP</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observações</Label>
                                    <textarea 
                                        value={formData.notes} 
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                                        className="w-full bg-dark-100 border border-white/5 rounded-xl p-4 text-white text-sm min-h-[80px] focus:border-brand-orange-coral/30 outline-none transition-colors" 
                                        placeholder="Informações adicionais..." 
                                    />
                                </div>
                            </div>

                            <div className="admin-modal-footer">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-white/5 text-gray-400 hover:text-white hover:bg-white/5 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                                <Button type="submit" className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black shadow-lg shadow-brand-orange-coral/20 h-11 rounded-xl uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] disabled:opacity-50" disabled={isLoading}>
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
