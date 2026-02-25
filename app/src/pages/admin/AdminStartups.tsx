import { useState } from 'react';
import {
  Search,
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  ExternalLink,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useStartups, useLeads } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const stageLabels: Record<string, string> = {
  idea: 'Ideia',
  mvp: 'MVP',
  traction: 'Tração',
  scale: 'Scale',
};

export function AdminStartups() {
  const { projectId } = useProject();
  const { data: startups, create, update } = useStartups();
  const { data: leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    description: '',
    stage: 'mvp' as 'idea' | 'mvp' | 'traction' | 'scale',
    website: '',
    packageType: 'expo' as 'expo' | 'pitch'
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStartup, _setSelectedStartup] = useState<string | null>(null);

  const filteredStartups = startups.filter(startup => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.sector) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      await create({
        projectId: projectId || '',
        name: formData.name,
        sector: formData.sector,
        description: formData.description,
        stage: formData.stage as 'idea' | 'mvp' | 'traction' | 'scale',
        website: formData.website,
        packageType: formData.packageType as 'expo' | 'pitch',
        status: 'approved', // Auto-approved when added by admin
        foundingTeam: [],
        metrics: {
          revenue: 0,
          users: 0,
          growth: 0
        }
      } as unknown as Parameters<typeof create>[0]);

      toast.success('Startup adicionada com sucesso!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        sector: '',
        description: '',
        stage: 'mvp',
        website: '',
        packageType: 'expo'
      });
    } catch {
      toast.error('Erro ao adicionar startup');
    }
  };

  const pendingCount = startups.filter(s => s.status === 'pending').length;
  const approvedCount = startups.filter(s => s.status === 'approved').length;
  const totalLeads = leads.length;

  const handleApprove = async (id: string) => {
    await update(id, { status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await update(id, { status: 'rejected' });
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
              placeholder="Buscar startup..."
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
            <option value="approved">Aprovada</option>
            <option value="pending">Pendente</option>
            <option value="rejected">Rejeitada</option>
          </select>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
              <Rocket className="h-4 w-4 mr-2" />
              Adicionar Startup
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-200 border-dark-300 text-white">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Startup</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Startup *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Setor *</Label>
                  <Input
                    required
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição Curta</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="bg-dark-100 border-dark-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estágio</Label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value as 'idea' | 'mvp' | 'traction' | 'scale' })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="idea">Ideia</option>
                    <option value="mvp">MVP</option>
                    <option value="traction">Tração</option>
                    <option value="scale">Scale</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Pacote</Label>
                  <select
                    value={formData.packageType}
                    onChange={e => setFormData({ ...formData, packageType: e.target.value as 'expo' | 'pitch' })}
                    className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="expo">Apenas Expo</option>
                    <option value="pitch">Expo + Pitch Arena</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-dark-300 text-gray-400">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8">
                  {isLoading ? 'Adicionando...' : 'Adicionar Startup'}
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
          <p className="text-2xl font-bold text-white">{startups.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Aprovadas</p>
          <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Leads Capturados</p>
          <p className="text-2xl font-bold text-teal-400">{totalLeads}</p>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center">
          <Clock className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <p className="text-white font-medium">{pendingCount} startups aguardando aprovação</p>
            <p className="text-gray-400 text-sm">Revise as candidaturas pendentes</p>
          </div>
          <Button
            variant="outline"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => setStatusFilter('pending')}
          >
            Ver pendentes
          </Button>
        </div>
      )}

      {/* Startups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <div key={startup.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <div className="flex flex-col items-end">
                <Badge className={statusColors[startup.status]}>
                  {startup.status}
                </Badge>
                <Badge className="mt-1 bg-dark-300 text-gray-300">
                  {stageLabels[startup.stage]}
                </Badge>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{startup.name}</h3>
            <p className="text-teal-400 text-sm mb-1">{startup.sector}</p>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{startup.description}</p>

            {/* Metrics */}
            {startup.metrics && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {startup.metrics.revenue !== undefined && (
                  <div className="bg-dark-100 rounded p-2 text-center">
                    <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">R${(startup.metrics.revenue / 1000).toFixed(0)}k</p>
                    <p className="text-gray-500 text-xs">Receita</p>
                  </div>
                )}
                {startup.metrics.users !== undefined && (
                  <div className="bg-dark-100 rounded p-2 text-center">
                    <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">{startup.metrics.users}</p>
                    <p className="text-gray-500 text-xs">Usuários</p>
                  </div>
                )}
                {startup.metrics.growth !== undefined && (
                  <div className="bg-dark-100 rounded p-2 text-center">
                    <TrendingUp className="h-4 w-4 text-teal-400 mx-auto mb-1" />
                    <p className="text-white text-sm font-medium">{startup.metrics.growth}%</p>
                    <p className="text-gray-500 text-xs">Crescimento</p>
                  </div>
                )}
              </div>
            )}

            {/* Team */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Fundadores:</p>
              <div className="flex flex-wrap gap-2">
                {startup.foundingTeam.map((member, i) => (
                  <Badge key={i} className="bg-dark-300 text-gray-300">
                    {member.name} - {member.role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Package & Stand */}
            <div className="flex items-center justify-between mb-4">
              <Badge className={
                startup.packageType === 'pitch' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
              }>
                {startup.packageType === 'pitch' ? 'Pitch + Expo' : 'Expo'}
              </Badge>
              {startup.standNumber && (
                <span className="text-gray-400 text-sm">Stand {startup.standNumber}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {startup.status === 'pending' ? (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleApprove(startup.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleReject(startup.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="flex-1 border-dark-300 text-gray-300">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver perfil
                  </Button>
                  <Button size="sm" variant="outline" className="border-teal-500 text-teal-400">
                    <Star className="h-4 w-4 mr-1" />
                    Leads
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Leads Section */}
      {selectedStartup && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Leads Capturados</h2>
          <div className="space-y-3">
            {leads
              .filter(l => l.startupId === selectedStartup)
              .map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{lead.visitorName}</p>
                    <p className="text-gray-400 text-sm">{lead.visitorEmail}</p>
                    {lead.visitorCompany && (
                      <p className="text-gray-500 text-xs">{lead.visitorCompany}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge className={
                      lead.interestLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                        lead.interestLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                    }>
                      {lead.interestLevel}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
