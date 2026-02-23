import { useState } from 'react';
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
import type { Coupon } from '@/types';
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
    const { data: cupons, create, update, remove, isLoading } = useCoupons();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<Coupon['indicacaoTipo'] | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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
        const matchesSearch = c.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.indicacaoNome.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || c.indicacaoTipo === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Partial<Coupon> = {
                codigo: formData.codigo.toUpperCase(),
                indicacaoTipo: formData.indicacaoTipo,
                indicacaoNome: formData.indicacaoNome,
                porcentagemDesconto: Number(formData.porcentagemDesconto),
                usoLimite: formData.usoLimite ? Number(formData.usoLimite) : undefined,
                descricao: formData.descricao,
                vencimento: formData.vencimento || undefined,
                ativo: formData.ativo,
                usoAtual: editingCoupon ? editingCoupon.usoAtual : 0
            };

            if (editingCoupon) {
                await update(editingCoupon.id, payload);
            } else {
                await create(payload as any);
            }

            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            logger.error('Erro ao salvar cupom:', err);
            alert('Erro ao salvar cupom. Verifique se o código já existe.');
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
        setFormData({
            codigo: coupon.codigo,
            indicacaoTipo: coupon.indicacaoTipo,
            indicacaoNome: coupon.indicacaoNome,
            porcentagemDesconto: coupon.porcentagemDesconto,
            usoLimite: coupon.usoLimite?.toString() || '',
            descricao: coupon.descricao || '',
            vencimento: coupon.vencimento ? new Date(coupon.vencimento).toISOString().split('T')[0] : '',
            ativo: coupon.ativo
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cupom?')) {
            await remove(id);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Código copiado: ' + text);
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
                            onChange={(e) => setTypeFilter(e.target.value as any)}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 border-l-4 border-blue-500">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total de Cupons</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-bold text-white">{cupons.length}</p>
                        <Ticket className="h-4 w-4 text-blue-500 mb-1" />
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-green-500">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Cupons Ativos</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-bold text-green-400">
                            {cupons.filter(c => c.ativo && !isExpired(c.vencimento)).length}
                        </p>
                        <CheckCircle className="h-4 w-4 text-green-500 mb-1" />
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-teal-500">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Total de Usos</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-bold text-teal-400">
                            {cupons.reduce((sum, c) => sum + c.usoAtual, 0)}
                        </p>
                        <Users className="h-4 w-4 text-teal-500 mb-1" />
                    </div>
                </div>
                <div className="glass-card p-4 border-l-4 border-purple-500">
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Ticket Médio Cupom</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-2xl font-bold text-purple-400">
                            {cupons.length > 0 ? (cupons.reduce((sum, c) => sum + c.porcentagemDesconto, 0) / cupons.length).toFixed(0) : 0}%
                        </p>
                        <TrendingUp className="h-4 w-4 text-purple-500 mb-1" />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="glass-card overflow-hidden border-dark-300">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-dark-300/50 border-b border-dark-300">
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Código</th>
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Parceiro / Tipo</th>
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Desconto</th>
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Vencimento</th>
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                                <th className="p-4 text-left text-gray-400 font-medium text-xs uppercase tracking-wider">Uso</th>
                                <th className="p-4 text-right text-gray-400 font-medium text-xs uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-300">
                            {filteredCupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-dark-100/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <code className="bg-dark-300 px-3 py-1.5 rounded text-teal-400 font-black tracking-tighter text-sm">
                                                {coupon.codigo}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(coupon.codigo)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all bg-dark-400 p-1.5 rounded-md"
                                                title="Copiar código"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-white font-semibold text-sm">{coupon.indicacaoNome}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className={`text-[9px] font-black uppercase px-1.5 py-0 border-transparent ${typeConfig[coupon.indicacaoTipo].color}`}>
                                                    {typeConfig[coupon.indicacaoTipo].label}
                                                </Badge>
                                                {coupon.descricao && (
                                                    <span className="text-gray-500 text-[10px] truncate max-w-[150px]" title={coupon.descricao}>
                                                        • {coupon.descricao}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge className="bg-teal-500 text-dark-100 font-black px-2 py-0.5">
                                            {coupon.porcentagemDesconto}% OFF
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        {coupon.vencimento ? (
                                            <div className={`flex items-center gap-1.5 text-xs ${isExpired(coupon.vencimento) ? 'text-red-400' : 'text-gray-400'}`}>
                                                <Calendar className="h-3 w-3" />
                                                {new Date(coupon.vencimento).toLocaleDateString('pt-BR')}
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">Sem expiração</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {!coupon.ativo ? (
                                                <Badge className="bg-red-500/10 text-red-500 border border-red-500/20">Inativo</Badge>
                                            ) : isExpired(coupon.vencimento) ? (
                                                <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/20">Expirado</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/10 text-green-500 border border-green-500/20">Ativo</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] text-gray-500">
                                                <span>{coupon.usoAtual} usados</span>
                                                <span>{coupon.usoLimite || '∞'}</span>
                                            </div>
                                            <div className="w-24 h-1 bg-dark-300 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${coupon.usoLimite && coupon.usoAtual >= coupon.usoLimite ? 'bg-red-500' : 'bg-teal-500'}`}
                                                    style={{ width: `${coupon.usoLimite ? Math.min((coupon.usoAtual / coupon.usoLimite) * 100, 100) : 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-dark-300"
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Ticket className="h-8 w-8 text-gray-600" />
                                            <p className="text-gray-500">Nenhum cupom encontrado para os filtros selecionados.</p>
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
                                        onChange={e => setFormData({ ...formData, indicacaoTipo: e.target.value as any })}
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
