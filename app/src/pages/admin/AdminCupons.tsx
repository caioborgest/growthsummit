import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Ticket,
    Trash2,
    Pencil,
    CheckCircle,
    Copy,
    Users,
    Calendar,
    Filter,
    TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCoupons } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { Coupon } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const typeConfig: Record<Coupon['referralType'], { label: string; color: string }> = {
    promotional: { label: 'Promocional', color: 'bg-blue-500/20 text-blue-400' },
    company: { label: 'Empresa / Equipe', color: 'bg-teal-500/20 text-teal-400' },
    government: { label: 'Government', color: 'bg-orange-500/20 text-orange-400' },
    political: { label: 'Liderança Política', color: 'bg-purple-500/20 text-purple-400' },
    influencer: { label: 'Influenciador', color: 'bg-pink-500/20 text-pink-400' },
    association: { label: 'Associação', color: 'bg-yellow-500/20 text-yellow-500' },
    institution: { label: 'Instituição', color: 'bg-indigo-500/20 text-indigo-400' },
    other: { label: 'Outro', color: 'bg-gray-500/20 text-gray-400' },
};

export default function AdminCupons() {
    const { projectId, isProjectSelected } = useProject();
    const navigate = useNavigate();
    const { data: cupons, create, update, remove, isLoading, refetch } = useCoupons();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<Coupon['referralType'] | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        referralType: 'promotional' as Coupon['referralType'],
        referralName: '',
        discountPercentage: 100,
        usageLimit: '',
        description: '',
        expiresAt: '',
        isActive: true
    });

    // Redirecionar para projetos se nenhum estiver selecionado
    if (!isProjectSelected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="glass-card max-w-lg w-full p-8 text-center border-teal-500/20 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-6 border border-teal-500/20">
                        <Filter className="w-10 h-10 text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                        Selecione um Projeto
                    </h2>
                    <p className="text-gray-500 mb-8 font-medium">
                        Para gerenciar cupons e parcerias, você precisa selecionar um projeto específico primeiro.
                    </p>
                    <Button
                        onClick={() => navigate('/admin/projetos')}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold px-8"
                    >
                        Ir para Projetos
                    </Button>
                </div>
            </div>
        );
    }


    const filteredCupons = cupons.filter(c => {
        const code = c.code || '';
        const referralName = c.referralName || '';
        const matchesSearch = code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            referralName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || c.referralType === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await update(editingCoupon.id, {
                    code: (formData.code || '').toUpperCase().trim(),
                    referralType: formData.referralType,
                    referralName: formData.referralName,
                    discountPercentage: Number(formData.discountPercentage),
                    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                    description: formData.description,
                    expiresAt: formData.expiresAt ? `${formData.expiresAt}T23:59:59Z` : undefined,
                    isActive: formData.isActive,
                });
                toast.success('Cupom atualizado com sucesso!');
            } else {
                await create({
                    projectId: projectId || '',
                    code: (formData.code || '').toUpperCase().trim(),
                    referralType: formData.referralType,
                    referralName: formData.referralName,
                    discountPercentage: Number(formData.discountPercentage),
                    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                    currentUsage: 0,
                    description: formData.description,
                    expiresAt: formData.expiresAt ? `${formData.expiresAt}T23:59:59Z` : undefined,
                    isActive: formData.isActive,
                });
                toast.success('Novo cupom gerado com sucesso!');
            }

            setIsModalOpen(false);
            resetForm();
            await refetch(true); // Force refetch from Supabase
        } catch (err: any) {
            logger.error('Erro ao salvar cupom:', err);
            toast.error(err.message || 'Erro ao salvar cupom. Verifique se o código já existe.');
        }
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            referralType: 'promotional',
            referralName: '',
            discountPercentage: 100,
            usageLimit: '',
            description: '',
            expiresAt: '',
            isActive: true
        });
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);

        // Formatar data de expiresAt para o input type="date" (YYYY-MM-DD)
        let formattedExpiresAt = '';
        if (coupon.expiresAt) {
            try {
                const date = new Date(coupon.expiresAt);
                if (!isNaN(date.getTime())) {
                    formattedExpiresAt = date.toISOString().split('T')[0];
                }
            } catch (e) {
                logger.warn('Data de expiresAt inválida', { value: coupon.expiresAt });
            }
        }

        setFormData({
            code: coupon.code,
            referralType: coupon.referralType,
            referralName: coupon.referralName,
            discountPercentage: coupon.discountPercentage,
            usageLimit: coupon.usageLimit?.toString() || '',
            description: coupon.description || '',
            expiresAt: formattedExpiresAt,
            isActive: coupon.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            if (confirm('Tem certeza que deseja excluir este cupom?')) {
                await remove(id);
                toast.success('Cupom excluído com sucesso');
                await refetch(true); // Force refetch from Supabase
            }
        } catch (err: any) {
            toast.error('Erro ao excluir cupom');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Código ${text} copiado para a área de transferência!`);
    };

    const isExpired = (expiresAt?: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:min-w-[320px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Buscar por código ou parceiro..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 w-full bg-dark-100 border-dark-300 text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as Coupon['referralType'] | 'all')}
                            className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="all">Todos os Tipos</option>
                            {Object.entries(typeConfig).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-glow-teal"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cupom
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total de Vouchers',
                        value: cupons.length,
                        icon: Ticket,
                        color: 'blue',
                        detail: 'Cupons cadastrados'
                    },
                    {
                        label: 'Cupons Ativos',
                        value: cupons.filter(c => c.isActive && !isExpired(c.expiresAt)).length,
                        icon: CheckCircle,
                        color: 'emerald',
                        detail: 'Prontos para uso'
                    },
                    {
                        label: 'Total de Resgates',
                        value: cupons.reduce((sum, c) => sum + (c.currentUsage || 0), 0),
                        icon: Users,
                        color: 'teal',
                        detail: 'Utilizados no checkout'
                    },
                    {
                        label: 'Desconto Médio',
                        value: `${cupons.length > 0 ? (cupons.reduce((sum, c) => sum + (c.discountPercentage || 0), 0) / cupons.length).toFixed(0) : 0}%`,
                        icon: TrendingUp,
                        color: 'purple',
                        detail: 'Média de abatimento'
                    }
                ].map((stat, i) => (
                    <div key={i} className={`relative overflow-hidden glass-card p-6 border-l-4 border-${stat.color === 'emerald' ? 'emerald' : stat.color}-500 group hover:translate-y-[-4px] transition-all duration-300 shadow-lg shadow-black/20`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                                <p className="text-gray-600 text-[10px] mt-1 font-medium">{stat.detail}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-${stat.color === 'emerald' ? 'emerald' : stat.color}-500/10 text-${stat.color === 'emerald' ? 'emerald' : stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        {/* Decorative background glow */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color === 'emerald' ? 'emerald' : stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color === 'emerald' ? 'emerald' : stat.color}-500/10 transition-all`} />
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                <div className="overflow-x-auto responsive-table">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Código</th>
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Parceiro / Tipo</th>
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Desconto</th>
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Vencimento</th>
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-5 text-left text-gray-400 font-black text-[10px] uppercase tracking-widest">Uso / Limite</th>
                                <th className="px-6 py-5 text-right text-gray-400 font-black text-[10px] uppercase tracking-widest">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-white/[0.04] transition-all group">
                                    <td className="px-6 py-5" data-label="Código">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 px-4 py-2 rounded-xl border border-teal-500/20 shadow-inner">
                                                <code className="text-teal-400 font-black tracking-widest text-sm uppercase">
                                                    {coupon.code}
                                                </code>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(coupon.code)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all bg-white/5 p-2 rounded-xl border border-white/10"
                                                title="Copiar código"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Parceiro">
                                        <div>
                                            <p className="text-white font-black italic tracking-tight">{coupon.referralName}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 border-transparent ${typeConfig[coupon.referralType]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                                                    {typeConfig[coupon.referralType]?.label || coupon.referralType}
                                                </Badge>
                                                {coupon.description && (
                                                    <span className="text-gray-600 text-[10px] truncate max-w-[150px] font-medium" title={coupon.description}>
                                                        • {coupon.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Desc.">
                                        <div className="relative inline-block">
                                            <Badge className="bg-teal-500 text-dark-100 font-black px-3 py-1 text-xs rounded-lg shadow-lg shadow-teal-500/20">
                                                {coupon.discountPercentage}% OFF
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Venc.">
                                        {coupon.expiresAt ? (
                                            <div className={`flex items-center gap-2 text-xs font-bold ${isExpired(coupon.expiresAt) ? 'text-red-400/80 bg-red-400/5 px-2 py-1 rounded-lg' : 'text-gray-400'}`}>
                                                <Calendar className="h-3.5 w-3.5" />
                                                {(() => {
                                                    const d = new Date(coupon.expiresAt);
                                                    return isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                                                })()}
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg">Vitalício</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5" data-label="Status">
                                        <div className="flex items-center">
                                            {!coupon.isActive ? (
                                                <Badge className="bg-white/5 text-gray-500 border border-white/10 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Inativo</Badge>
                                            ) : isExpired(coupon.expiresAt) ? (
                                                <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Expirado</Badge>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    <span className="font-black text-[10px] uppercase tracking-wider">Ativo</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5" data-label="Uso">
                                        <div className="space-y-2 lg:max-w-[120px] w-full">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                <span>{coupon.currentUsage} USOS</span>
                                                <span>{coupon.usageLimit || '∞'}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${coupon.usageLimit && coupon.currentUsage >= coupon.usageLimit ? 'bg-red-500' : 'bg-gradient-to-r from-teal-500 to-teal-400'}`}
                                                    style={{ width: `${coupon.usageLimit ? Math.min((coupon.currentUsage / coupon.usageLimit) * 100, 100) : 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right" data-label="Ações">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl border border-transparent hover:border-white/10 transition-all"
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCupons.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Ticket className="h-12 w-12 text-gray-500" />
                                            <div className="space-y-1">
                                                <p className="text-white font-bold text-lg">Nenhum voucher encontrado</p>
                                                <p className="text-gray-500 text-sm">Tente ajustar seus filtros ou busca.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Novo/Editar */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="admin-modal-content p-0 border-none max-w-xl">
                    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
                        <div className="admin-modal-header">
                            <div>
                                <DialogTitle className="text-xl font-black italic uppercase leading-none">
                                    {editingCoupon ? 'Editar' : 'Novo'} <span className="text-brand-orange-coral">Cupom</span>
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                                    Configure as regras de desconto e vigência para parcerias
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="admin-modal-body">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Código do Voucher</label>
                                        <Input
                                            required
                                            placeholder="EX: GROWTH100"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            className="h-12 bg-dark-100 border-white/5 text-white uppercase font-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Desconto (%)</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                required
                                                value={formData.discountPercentage}
                                                onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                                                className="h-12 bg-dark-100 border-white/5 text-white pl-4 pr-10"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tipo de Convênio</label>
                                        <select
                                            value={formData.referralType}
                                            onChange={e => setFormData({ ...formData, referralType: e.target.value as Coupon['referralType'] })}
                                            className="w-full h-12 px-4 py-2 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                                        >
                                            {Object.entries(typeConfig).map(([key, config]) => (
                                                <option key={key} value={key}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Limite de Usos</label>
                                        <Input
                                            type="number"
                                            placeholder="Infinito"
                                            value={formData.usageLimit}
                                            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                            className="h-12 bg-dark-100 border-white/5 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome do Parceiro / Origem</label>
                                    <Input
                                        required
                                        placeholder="Ex: Secretaria de Desenvolvimento / Nome do Influencer"
                                        value={formData.referralName}
                                        onChange={e => setFormData({ ...formData, referralName: e.target.value })}
                                        className="h-12 bg-dark-100 border-white/5 text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Data de Vencimento</label>
                                        <div className="relative">
                                            <Input
                                                type="date"
                                                value={formData.expiresAt}
                                                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                                                className="h-12 bg-dark-100 border-white/5 text-white pl-10"
                                            />
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <div className="flex items-center gap-3 bg-dark-100 border border-white/5 rounded-xl h-12 px-4 w-full">
                                            <input
                                                type="checkbox"
                                                id="ativo_modal"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-dark-200 text-brand-orange-coral focus:ring-brand-orange-coral"
                                            />
                                            <label htmlFor="ativo_modal" className="text-[10px] font-black uppercase text-gray-500 tracking-widest cursor-pointer select-none mt-0.5">
                                                Habilitado
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Observações Internas</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-dark-100 border border-white/5 rounded-xl p-4 text-white text-sm min-h-[100px] focus:outline-none focus:border-brand-orange-coral/50 transition-all resize-none"
                                        placeholder="Detalhes sobre a parceria, contrato ou finalidade deste cupom..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processando...' : editingCoupon ? 'Salvar Alterações' : 'Gerar Cupom'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
