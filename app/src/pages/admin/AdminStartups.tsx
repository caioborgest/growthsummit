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
  Star,
  Trophy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useStartups, useLeads } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { ScoreStartupModal } from '@/components/admin/ScoreStartupModal';
import { PitchLeaderboard } from '@/components/admin/PitchLeaderboard';
import type { Startup } from '@/types';

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
  const { data: startups, create, update, isLoading } = useStartups();
  const { data: leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    // Fundador
    founder_name: '',
    email: '',
    phone: '',
    senha: '',
    confirmarSenha: '',

    // Startup
    startup_name: '',
    startup_description: '',
    setor: '',
    estagio: 'mvp' as 'ideia' | 'mvp' | 'validacao' | 'tracao' | 'escala',

    // Pitch
    problema: '',
    solucao: '',
    diferencial: '',
    faturamento_mensal: '',
    investimento_buscado: '',

    // URLs
    pitch_deck_url: '',
    video_pitch_url: '',
    packageType: 'expo' as 'expo' | 'pitch'
  });

  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [startupToScore, setStartupToScore] = useState<Startup | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleOpenScoreModal = (startup: Startup) => {
    setStartupToScore(startup);
    setIsScoreModalOpen(true);
  };

  const filteredStartups = startups.filter(startup => {
    // Exclude super admin from startup founding teams for display
    const isSuperAdminFounder = startup.foundingTeam?.some(f => f.email?.toLowerCase() === 'projetos@cbxgrowth.com.br');
    if (isSuperAdminFounder) return false;

    const matchesSearch =
      (startup.startup_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (startup.sector?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (startup.foundingTeam?.[0]?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.startup_name || !formData.founder_name || !formData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      if (formData.senha && formData.senha !== formData.confirmarSenha) {
        toast.error('As senhas não coincidem');
        return;
      }

      await create({
        projectId: projectId || '',
        startupName: formData.startup_name,
        sector: formData.setor,
        startupDescription: formData.startup_description,
        stage: formData.estagio,
        status: 'approved',
        foundingTeam: [{ name: formData.founder_name, role: 'Founder', email: formData.email, phone: formData.phone }],
        packageType: formData.packageType,
        // Informações completas do Pitch
        metadata: {
          problem: formData.problema,
          solution: formData.solucao,
          differential: formData.diferencial,
          monthlyRevenue: formData.faturamento_mensal,
          soughtInvestment: formData.investimento_buscado,
          pitchDeckUrl: formData.pitch_deck_url,
          videoPitchUrl: formData.video_pitch_url,
          founderEmail: formData.email,
          founderPhone: formData.phone
        }
      } as any);

      toast.success('Startup adicionada com sucesso!');
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Erro ao adicionar startup: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const resetForm = () => {
    setFormData({
      founder_name: '',
      email: '',
      phone: '',
      senha: '',
      confirmarSenha: '',
      startup_name: '',
      startup_description: '',
      setor: '',
      estagio: 'mvp',
      problema: '',
      solucao: '',
      diferencial: '',
      faturamento_mensal: '',
      investimento_buscado: '',
      pitch_deck_url: '',
      video_pitch_url: '',
      packageType: 'expo'
    });
  };

  const pendingCount = startups.filter(s => s.status === 'pending').length;
  const approvedCount = startups.filter(s => s.status === 'approved').length;
  const totalLeads = leads.length;

  const handleApprove = async (id: string) => {
    try {
      await update(id, { status: 'approved' });
      toast.success('Startup aprovada com sucesso!');
    } catch (err: any) {
      toast.error(`Erro ao aprovar startup: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (confirm('Tem certeza que deseja rejeitar esta startup?')) {
        await update(id, { status: 'rejected' });
        toast.success('Startup rejeitada');
      }
    } catch (err: any) {
      toast.error(`Erro ao rejeitar startup: ${err.message || 'Erro desconhecido'}`);
    }
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
            <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold" onClick={() => toast.info('Exportação contábil em desenvolvimento')}>
              <Rocket className="h-4 w-4 mr-2" />
              Adicionar Startup
            </Button>
          </DialogTrigger>
          <Button
            variant="outline"
            className={`border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 ${showLeaderboard ? 'bg-yellow-500/20' : ''}`}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            {showLeaderboard ? 'Ver Lista' : 'Ver Leaderboard'}
          </Button>
          <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Startup</DialogTitle>
              <DialogDescription>
                Cadastre os dados da startup, fundadores e informações de pitch para o evento.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              {/* Seção: Informações do Fundador */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-300 pb-2">Informações do Fundador</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      required
                      value={formData.founder_name}
                      onChange={e => setFormData({ ...formData, founder_name: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="Nome do fundador"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="email@startup.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone/WhatsApp *</Label>
                    <Input
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha para Conta</Label>
                    <Input
                      type="password"
                      value={formData.senha}
                      onChange={e => setFormData({ ...formData, senha: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="Crie uma senha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Senha</Label>
                    <Input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={e => setFormData({ ...formData, confirmarSenha: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="Confirme a senha"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Informações da Startup */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-300 pb-2">Informações da Startup</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome da Startup *</Label>
                    <Input
                      required
                      value={formData.startup_name}
                      onChange={e => setFormData({ ...formData, startup_name: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Setor *</Label>
                    <select
                      value={formData.setor}
                      onChange={e => setFormData({ ...formData, setor: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                      required
                    >
                      <option value="">Selecione o setor</option>
                      {['Tecnologia', 'Saúde', 'Educação', 'Fintech', 'E-commerce', 'Agronegócio', 'Logística', 'Marketing', 'Alimentação', 'Serviços', 'Outro'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estágio *</Label>
                    <select
                      value={formData.estagio}
                      onChange={e => setFormData({ ...formData, estagio: e.target.value as any })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                      required
                    >
                      <option value="ideia">Ideia (ainda não validada)</option>
                      <option value="mvp">MVP (produto mínimo viável)</option>
                      <option value="validacao">Validação (primeiros clientes)</option>
                      <option value="tracao">Tração (crescimento consistente)</option>
                      <option value="escala">Escala (expansão acelerada)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Pacote Expo</Label>
                    <select
                      value={formData.packageType}
                      onChange={e => setFormData({ ...formData, packageType: e.target.value as 'expo' | 'pitch' })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                    >
                      <option value="expo">Apenas Exposição</option>
                      <option value="pitch">Exposição + Arena Pitch</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Descrição da Startup * (máx. 500 caracteres)</Label>
                    <Textarea
                      required
                      maxLength={500}
                      value={formData.startup_description}
                      onChange={e => setFormData({ ...formData, startup_description: e.target.value })}
                      className="bg-dark-100 border-dark-300 min-h-[100px]"
                      placeholder="Descreva sua startup..."
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Pitch */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-300 pb-2">Pitch Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Qual problema você resolve? *</Label>
                    <Textarea
                      required
                      value={formData.problema}
                      onChange={e => setFormData({ ...formData, problema: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qual é a sua solução? *</Label>
                    <Textarea
                      required
                      value={formData.solucao}
                      onChange={e => setFormData({ ...formData, solucao: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qual seu diferencial? *</Label>
                    <Textarea
                      required
                      value={formData.diferencial}
                      onChange={e => setFormData({ ...formData, diferencial: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Faturamento Mensal (R$)</Label>
                      <Input
                        type="number"
                        value={formData.faturamento_mensal}
                        onChange={e => setFormData({ ...formData, faturamento_mensal: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Investimento Buscado (R$)</Label>
                      <Input
                        type="number"
                        value={formData.investimento_buscado}
                        onChange={e => setFormData({ ...formData, investimento_buscado: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Documentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-300 pb-2">Documentos & Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Link do Pitch Deck</Label>
                    <Input
                      type="url"
                      value={formData.pitch_deck_url}
                      onChange={e => setFormData({ ...formData, pitch_deck_url: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Link do Vídeo Pitch</Label>
                    <Input
                      type="url"
                      value={formData.video_pitch_url}
                      onChange={e => setFormData({ ...formData, video_pitch_url: e.target.value })}
                      className="bg-dark-100 border-dark-300"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-dark-300">
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

      {/* Leaderboard Section */}
      {showLeaderboard && (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">Ranking Arena Pitch</h2>
          </div>
          <PitchLeaderboard />
        </div>
      )}

      {/* Startups Grid */}
      {!showLeaderboard && (
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

              <h3 className="text-lg font-semibold text-white mb-1">{startup.startup_name || (startup as any).startupName}</h3>
              <p className="text-teal-400 text-sm mb-1">{startup.sector}</p>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{startup.startup_description || (startup as any).startupDescription}</p>

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
                    <Button
                      size="sm"
                      variant="outline"
                      className={`border-teal-500 text-teal-400 ${selectedStartup === startup.id ? 'bg-teal-500/10' : ''}`}
                      onClick={() => setSelectedStartup(selectedStartup === startup.id ? null : startup.id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Leads
                    </Button>
                    {startup.packageType === 'pitch' && (
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                        onClick={() => handleOpenScoreModal(startup as any)}
                      >
                        <Star className="h-4 w-4 mr-1 text-white" />
                        Votar
                      </Button>
                    )}
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

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

      {/* Score Modal */}
      <ScoreStartupModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        startup={startupToScore}
        projectId={projectId || ''}
      />
    </div>
  );
}
