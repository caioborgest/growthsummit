import { useState } from 'react';
import {
  Search,
  Gem,
  CheckCircle,
  ExternalLink,
  Plus,
  TrendingUp,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useSponsors } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';


const statusColors: Record<string, string> = {
  closed: 'bg-green-500/20 text-green-400',
  negotiation: 'bg-yellow-500/20 text-yellow-400',
  prospect: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const levelColors: Record<string, string> = {
  diamond: 'from-blue-400 to-blue-600',
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-600',
};

const levelLabels: Record<string, string> = {
  diamond: 'Diamante',
  gold: 'Ouro',
  silver: 'Prata',
  bronze: 'Bronze',
};

export default function AdminPatrocinadores() {
  const { projectId } = useProject();
  const { data: sponsors, create, update, isLoading } = useSponsors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    status: 'prospect' as 'prospect' | 'negotiation' | 'closed' | 'cancelled'
  });
  const [editingSponsor, setEditingSponsor] = useState<any>(null);

  const handleOpenModal = (sponsor?: any) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        companyName: sponsor.companyName || '',
        level: sponsor.level || 'silver',
        investment: sponsor.investment || 0,
        contactName: sponsor.contactName || '',
        contactEmail: sponsor.contactEmail || '',
        contactPhone: sponsor.contactPhone || '',
        status: sponsor.status || 'prospect'
      });
    } else {
      setEditingSponsor(null);
      setFormData({
        companyName: '',
        level: 'silver',
        investment: 0,
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        status: 'prospect'
      });
    }
    setIsModalOpen(true);
  };

  // const [_selectedSponsor, _setSelectedSponsor] = useState<string | null>(null);

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch =
      sponsor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sponsor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.companyName || !formData.contactName) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      if (editingSponsor) {
        await update(editingSponsor.id, {
          ...formData
        } as any);
        toast.success('Patrocinador atualizado!');
      } else {
        await create({
          projectId: projectId || '',
          ...formData,
          deliverables: []
        } as any);
        toast.success('Patrocinador adicionado com sucesso!');
      }
      setEditingSponsor(null);
      setIsModalOpen(false);
      await refetch();
    } catch (err: any) {
      logger.error('Erro ao adicionar patrocinador:', err);
      toast.error('Erro ao adicionar patrocinador: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const totalInvestment = sponsors
    .filter(s => s.status === 'closed')
    .reduce((sum, s) => sum + s.investment, 0);

  const closedCount = sponsors.filter(s => s.status === 'closed').length;
  const negotiationCount = sponsors.filter(s => s.status === 'negotiation').length;

  const handleStatusChange = async (id: string, status: 'prospect' | 'negotiation' | 'closed' | 'cancelled') => {
    await update(id, { status });
    await refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar patrocinador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="closed">Fechado</option>
            <option value="negotiation">Negociação</option>
            <option value="prospect">Prospect</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Patrocinador
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-200 border-dark-300 text-white">
            <DialogHeader>
            <DialogTitle>{editingSponsor ? 'Editar Patrocinador' : 'Adicionar Novo Patrocinador'}</DialogTitle>
              <DialogDescription>
                Informe os detalhes da empresa e contato para o novo patrocínio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa *</Label>
                  <Input
                    required
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível</Label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value as 'bronze' | 'silver' | 'gold' | 'diamond' })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Prata</option>
                    <option value="gold">Ouro</option>
                    <option value="diamond">Diamante</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor do Investimento</Label>
                  <Input
                    type="number"
                    value={formData.investment}
                    onChange={e => setFormData({ ...formData, investment: Number(e.target.value) })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'prospect' | 'negotiation' | 'closed' | 'cancelled' })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="prospect">Prospect</option>
                    <option value="negotiation">Negociação</option>
                    <option value="closed">Fechado</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome do Contato *</Label>
                <Input
                  required
                  value={formData.contactName}
                  onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                  className="bg-dark-100 border-dark-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-dark-300 text-gray-400">
                  Cancelar
                </Button>
                  <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8">
                    {isLoading ? 'Salvando...' : editingSponsor ? 'Salvar Alterações' : 'Adicionar Patrocinador'}
                  </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{sponsors.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Fechados</p>
          <p className="text-2xl font-bold text-green-400">{closedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Em Negociação</p>
          <p className="text-2xl font-bold text-yellow-400">{negotiationCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Investimento Total</p>
          <p className="text-2xl font-bold text-teal-400">R$ {(totalInvestment / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Pipeline de Patrocínio</h2>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Meta: R$ 200k</span>
            <span className="text-teal-400 text-sm">{Math.round((totalInvestment / 200000) * 100)}%</span>
          </div>
          <div className="w-full bg-dark-300 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-teal-500 to-teal-400 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((totalInvestment / 200000) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-4">
            {['Prospect', 'Negociação', 'Fechado'].map((stage, i) => (
              <div key={stage} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${i === 0 ? 'bg-blue-500/20' : i === 1 ? 'bg-yellow-500/20' : 'bg-green-500/20'
                  }`}>
                  <Target className={`h-5 w-5 ${i === 0 ? 'text-blue-400' : i === 1 ? 'text-yellow-400' : 'text-green-400'
                    }`} />
                </div>
                <p className="text-gray-400 text-xs">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSponsors.map((sponsor) => (
          <div key={sponsor.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${levelColors[sponsor.level]} flex items-center justify-center`}>
                <Gem className="h-7 w-7 text-white" />
              </div>
              <Badge className={statusColors[sponsor.status]}>
                {sponsor.status}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{sponsor.companyName}</h3>
            <p className="text-teal-400 text-sm mb-1">{levelLabels[sponsor.level]}</p>
            <p className="text-gray-400 text-sm mb-4">{sponsor.contactName}</p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Investimento:</span>
                <span className="text-white font-medium">R$ {sponsor.investment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email:</span>
                <span className="text-gray-300">{sponsor.contactEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Telefone:</span>
                <span className="text-gray-300">{sponsor.contactPhone}</span>
              </div>
            </div>

            {/* Deliverables */}
            {sponsor.deliverables.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Entregáveis:</p>
                <div className="space-y-1">
                  {sponsor.deliverables.slice(0, 3).map((del) => (
                    <div key={del.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{del.item}</span>
                      <Badge className={
                        del.status === 'completed' ? 'bg-green-500/20 text-green-400 text-xs' :
                          del.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 text-xs' :
                            'bg-gray-500/20 text-gray-400 text-xs'
                      }>
                        {del.status}
                      </Badge>
                    </div>
                  ))}
                  {sponsor.deliverables.length > 3 && (
                    <p className="text-gray-500 text-xs">+{sponsor.deliverables.length - 3} mais</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              {sponsor.status === 'prospect' && (
                <Button
                  size="sm"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => handleStatusChange(sponsor.id, 'negotiation')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Negociar
                </Button>
              )}
              {sponsor.status === 'negotiation' && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleStatusChange(sponsor.id, 'closed')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Fechar
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-dark-300 text-gray-300" onClick={() => handleOpenModal(sponsor)}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
