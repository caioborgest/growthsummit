import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Ticket,
    Trash2,
    Edit3,
    CheckCircle,
    XCircle,
    Copy,
    Users,
    Calendar,
    Filter,
    FileText,
    TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCoupons } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { Coupon } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const typeConfig: Record<Coupon['indicacaoTipo'], { label: string; color: string }> = {
    promocional: { label: 'Promocional', color: 'bg-blue-500/20 text-blue-400' },
    empresa: { label: 'Empresa / Equipe', color: 'bg-teal-500/20 text-teal-400' },
    prefeitura: { label: 'Prefeitura', color: 'bg-orange-500/20 text-orange-400' },
    politico: { label: 'Liderança Política', color: 'bg-purple-500/20 text-purple-400' },
    influenciador: { label: 'Influenciador', color: 'bg-pink-500/20 text-pink-400' },
    associacao: { label: 'Associação', color: 'bg-yellow-500/20 text-yellow-500' },
    instituicao: { label: 'Instituição', color: 'bg-indigo-500/20 text-indigo-400' },
    outro: { label: 'Outro', color: 'bg-gray-500/20 text-gray-400' },
};

export function AdminCupons() {
    const { projectId, isProjectSelected } = useProject();
    const navigate = useNavigate();
    const { data: cupons, create, update, remove, isLoading } = useCoupons();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<Coupon['indicacaoTipo'] | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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

    const [formData, setFormData] = useState({
        codigo: '',
        indicacaoTipo: 'promocional' as Coupon['indicacaoTipo'],
        indicacaoNome: '',
        porcentagemDesconto: 100,
        usoLimite: '',
        descricao: '',
        vencimento: '',
        ativo: true
    });

    const filteredCupons = cupons.filter(c => {
        const codigo = c.codigo || '';
        const indicacaoNome = c.indicacaoNome || '';
        const matchesSearch = codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            indicacaoNome.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || c.indicacaoTipo === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await update(editingCoupon.id, {
                    codigo: formData.codigo.toUpperCase(),
                    indicacaoTipo: formData.indicacaoTipo,
                    indicacaoNome: formData.indicacaoNome,
                    porcentagemDesconto: Number(formData.porcentagemDesconto),
                    usoLimite: formData.usoLimite ? Number(formData.usoLimite) : null,
                    descricao: formData.descricao,
                    vencimento: formData.vencimento || undefined,
                    ativo: formData.ativo,
                });
                toast.success('Cupom atualizado com sucesso!');
            } else {
                await create({
                    projectId: projectId || '',
                    codigo: formData.codigo.toUpperCase(),
                    indicacaoTipo: formData.indicacaoTipo,
                    indicacaoNome: formData.indicacaoNome,
                    porcentagemDesconto: Number(formData.porcentagemDesconto),
                    usoLimite: formData.usoLimite ? Number(formData.usoLimite) : null,
                    usoAtual: 0,
                    descricao: formData.descricao,
                    vencimento: formData.vencimento || undefined,
                    ativo: formData.ativo,
                });
                toast.success('Novo cupom gerado com sucesso!');
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            logger.error('Erro ao salvar cupom:', err);
            toast.error(err.message || 'Erro ao salvar cupom. Verifique se o código já existe.');
        }
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            codigo: '',
            indicacaoTipo: 'promocional',
            indicacaoNome: '',
            porcentagemDesconto: 100,
            usoLimite: '',
            descricao: '',
            vencimento: '',
            ativo: true
        });
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);

        // Formatar data de vencimento para o input type="date" (YYYY-MM-DD)
        let vencimentoFormatado = '';
        if (coupon.vencimento) {
            try {
                const date = new Date(coupon.vencimento);
                if (!isNaN(date.getTime())) {
                    vencimentoFormatado = date.toISOString().split('T')[0];
                }
            } catch (e) {
                logger.warn('Data de vencimento inválida:', coupon.vencimento);
            }
        }

        setFormData({
            codigo: coupon.codigo,
            indicacaoTipo: coupon.indicacaoTipo,
            indicacaoNome: coupon.indicacaoNome,
            porcentagemDesconto: coupon.porcentagemDesconto,
            usoLimite: coupon.usoLimite?.toString() || '',
            descricao: coupon.descricao || '',
            vencimento: vencimentoFormatado,
            ativo: coupon.ativo
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            if (confirm('Tem certeza que deseja excluir este cupom?')) {
                await remove(id);
                toast.success('Cupom excluído com sucesso');
            }
        } catch (err: any) {
            toast.error('Erro ao excluir cupom');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Código ${text} copiado para a área de transferência!`);
    };

    const isExpired = (vencimento?: string) => {
        if (!vencimento) return false;
        return new Date(vencimento) < new Date();
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
                            onChange={(e) => setTypeFilter(e.target.value as Coupon['indicacaoTipo'] | 'all')}
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
                        value: cupons.filter(c => c.ativo && !isExpired(c.vencimento)).length,
                        icon: CheckCircle,
                        color: 'emerald',
                        detail: 'Prontos para uso'
                    },
                    {
                        label: 'Total de Resgates',
                        value: cupons.reduce((sum, c) => sum + (c.usoAtual || 0), 0),
                        icon: Users,
                        color: 'teal',
                        detail: 'Utilizados no checkout'
                    },
                    {
                        label: 'Desconto Médio',
                        value: `${cupons.length > 0 ? (cupons.reduce((sum, c) => sum + (c.porcentagemDesconto || 0), 0) / cupons.length).toFixed(0) : 0}%`,
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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Código</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Parceiro / Tipo</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Desconto</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Vencimento</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-5 text-left text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Uso / Limite</th>
                                <th className="px-6 py-5 text-right text-gray-500 font-extrabold text-[10px] uppercase tracking-[0.2em]">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-white/[0.03] transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 px-4 py-2 rounded-xl border border-teal-500/20 shadow-inner">
                                                <code className="text-teal-400 font-black tracking-widest text-sm uppercase">
                                                    {coupon.codigo}
                                                </code>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(coupon.codigo)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all bg-white/5 p-2 rounded-xl border border-white/10"
                                                title="Copiar código"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="text-white font-bold text-sm tracking-tight">{coupon.indicacaoNome}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 border-transparent ${typeConfig[coupon.indicacaoTipo]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                                                    {typeConfig[coupon.indicacaoTipo]?.label || coupon.indicacaoTipo}
                                                </Badge>
                                                {coupon.descricao && (
                                                    <span className="text-gray-600 text-[10px] truncate max-w-[150px] font-medium" title={coupon.descricao}>
                                                        • {coupon.descricao}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="relative inline-block">
                                            <Badge className="bg-teal-500 text-dark-100 font-black px-3 py-1 text-xs rounded-lg shadow-lg shadow-teal-500/20">
                                                {coupon.porcentagemDesconto}% OFF
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-400">
                                        {coupon.vencimento ? (
                                            <div className={`flex items-center gap-2 text-xs font-bold ${isExpired(coupon.vencimento) ? 'text-red-400/80 bg-red-400/5 px-2 py-1 rounded-lg' : 'text-gray-400'}`}>
                                                <Calendar className="h-3.5 w-3.5" />
                                                {(() => {
                                                    const d = new Date(coupon.vencimento);
                                                    return isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString('pt-BR');
                                                })()}
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-[10px] font-black uppercase tracking-wider bg-white/5 px-2 py-1 rounded-lg">Vitalício</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center">
                                            {!coupon.ativo ? (
                                                <Badge className="bg-white/5 text-gray-500 border border-white/10 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Inativo</Badge>
                                            ) : isExpired(coupon.vencimento) ? (
                                                <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-wider">Expirado</Badge>
                                            ) : (
                                                <div className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                    <span className="font-black text-[10px] uppercase tracking-wider">Ativo</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-2 max-w-[120px]">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-gray-500">
                                                <span>{coupon.usoAtual} USOS</span>
                                                <span>{coupon.usoLimite || '∞'}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${coupon.usoLimite && coupon.usoAtual >= coupon.usoLimite ? 'bg-red-500' : 'bg-gradient-to-r from-teal-500 to-teal-400'}`}
                                                    style={{ width: `${coupon.usoLimite ? Math.min((coupon.usoAtual / coupon.usoLimite) * 100, 100) : 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl border border-transparent hover:border-white/10 transition-all"
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <Edit3 className="h-4 w-4" />
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
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="glass-card max-w-xl w-full p-0 overflow-hidden shadow-2xl border-teal-500/20">
                        <div className="p-6 border-b border-dark-300 flex justify-between items-center bg-dark-300/30">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingCoupon ? 'Editar Parceria / Cupom' : 'Nova Parceria / Cupom'}
                                </h2>
                                <p className="text-gray-400 text-xs mt-1">Configure as regras de desconto e vigência.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="text-gray-500">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Código do Voucher</label>
                                    <Input
                                        required
                                        placeholder="EX: GROWTH100"
                                        value={formData.codigo}
                                        onChange={e => setFormData({ ...formData, codigo: e.target.value })}
                                        className="bg-dark-100 border-dark-300 text-white uppercase font-black"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">O código que o usuário digitará.</p>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Desconto (%)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            required
                                            value={formData.porcentagemDesconto}
                                            onChange={e => setFormData({ ...formData, porcentagemDesconto: Number(e.target.value) })}
                                            className="bg-dark-100 border-dark-300 text-white pl-4 pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Tipo de Convênio</label>
                                    <select
                                        value={formData.indicacaoTipo}
                                        onChange={e => setFormData({ ...formData, indicacaoTipo: e.target.value as Coupon['indicacaoTipo'] })}
                                        className="w-full h-11 px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {Object.entries(typeConfig).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Limite de Usos</label>
                                    <Input
                                        type="number"
                                        placeholder="Infinito"
                                        value={formData.usoLimite}
                                        onChange={e => setFormData({ ...formData, usoLimite: e.target.value })}
                                        className="bg-dark-100 border-dark-300 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Nome do Parceiro / Origem</label>
                                <Input
                                    required
                                    placeholder="Ex: Secretaria de Desenvolvimento / Nome do Influencer"
                                    value={formData.indicacaoNome}
                                    onChange={e => setFormData({ ...formData, indicacaoNome: e.target.value })}
                                    className="bg-dark-100 border-dark-300 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Data de Vencimento</label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.vencimento}
                                            onChange={e => setFormData({ ...formData, vencimento: e.target.value })}
                                            className="bg-dark-100 border-dark-300 text-white pl-10"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>
                                <div className="col-span-2 sm:col-span-1 flex items-end">
                                    <div className="flex items-center gap-3 bg-dark-100 border border-dark-300 rounded-lg h-11 px-4 w-full">
                                        <input
                                            type="checkbox"
                                            id="ativo_modal"
                                            checked={formData.ativo}
                                            onChange={e => setFormData({ ...formData, ativo: e.target.checked })}
                                            className="w-5 h-5 rounded border-dark-300 bg-dark-200 text-teal-500 focus:ring-teal-500"
                                        />
                                        <label htmlFor="ativo_modal" className="text-sm font-bold text-gray-300 cursor-pointer select-none">
                                            Cupom Habilitado
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Observações Internas</label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full bg-dark-100 border border-dark-300 rounded-lg p-4 text-white text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Detalhes sobre a parceria, contrato ou finalidade deste cupom..."
                                />
                                <div className="flex items-center gap-2 mt-2 text-gray-500">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="text-[10px]">As observações não são visíveis para o usuário final.</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 border-dark-300 text-gray-400 hover:bg-dark-300 hover:text-white"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processando...' : editingCoupon ? 'Salvar Alterações' : 'Gerar Cupom'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
