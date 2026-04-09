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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
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
  validation: 'Validação',
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
    founderName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Startup
    startupName: '',
    startupDescription: '',
    sector: '',
    stage: 'mvp' as 'idea' | 'mvp' | 'validation' | 'traction' | 'scale',

    // Pitch
    problem: '',
    solution: '',
    differential: '',
    monthlyRevenue: '',
    soughtInvestment: '',

    // URLs
    pitchDeckUrl: '',
    videoPitchUrl: '',
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
      (startup.startupName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (startup.sector?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (startup.foundingTeam?.[0]?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.startupName || !formData.founderName || !formData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      await create({
        projectId: projectId || '',
        startupName: formData.startupName,
        sector: formData.sector,
        startupDescription: formData.startupDescription,
        stage: formData.stage,
        status: 'approved',
        foundingTeam: [{ name: formData.founderName, role: 'Founder', email: formData.email, phone: formData.phone }],
        packageType: formData.packageType,
        // Informações completas do Pitch
        metadata: {
          problem: formData.problem,
          solution: formData.solution,
          differential: formData.differential,
          monthlyRevenue: formData.monthlyRevenue,
          soughtInvestment: formData.soughtInvestment,
          pitchDeckUrl: formData.pitchDeckUrl,
          videoPitchUrl: formData.videoPitchUrl,
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
      founderName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      startupName: '',
      startupDescription: '',
      sector: '',
      stage: 'mvp',
      problem: '',
      solution: '',
      differential: '',
      monthlyRevenue: '',
      soughtInvestment: '',
      pitchDeckUrl: '',
      videoPitchUrl: '',
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
          <DialogContent className="admin-modal-content p-0 border-none max-w-2xl bg-[#0F172A] overflow-hidden shadow-2xl">
            <div className="admin-modal-header p-8 pb-4">
              <div>
                <DialogTitle className="text-xl font-black italic uppercase leading-none text-white">
                  Adicionar Nova <span className="text-brand-orange-coral">Startup</span>
                </DialogTitle>
                <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                  Cadastre os dados da startup, fundadores e informações para o evento
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-10 w-10 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col min-h-0 overflow-hidden">
              <div className="admin-modal-body p-8 pt-4">
                {/* Seção: Informações do Fundador */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase text-brand-orange-coral tracking-widest border-b border-white/5 pb-2">Informações do Fundador</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome Completo *</label>
                      <Input
                        required
                        value={formData.founderName}
                        onChange={e => setFormData({ ...formData, founderName: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="Nome do fundador"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Email *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="email@startup.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Telefone/WhatsApp *</label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Senha para Conta</label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="Crie uma senha"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Confirmar Senha</label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="Confirme a senha"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Informações da Startup */}
                <div className="space-y-6 pt-8 mt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-brand-orange-coral tracking-widest border-b border-white/5 pb-2">Informações da Startup</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome da Startup *</label>
                      <Input
                        required
                        value={formData.startupName}
                        onChange={e => setFormData({ ...formData, startupName: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Setor *</label>
                      <select
                        value={formData.sector}
                        onChange={e => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full h-12 px-4 py-2 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                        required
                      >
                        <option value="">Selecione o setor</option>
                        {[
                          { v: 'technology', l: 'Tecnologia' },
                          { v: 'health', l: 'Saúde' },
                          { v: 'education', l: 'Educação' },
                          { v: 'fintech', l: 'Fintech' },
                          { v: 'ecommerce', l: 'E-commerce' },
                          { v: 'agribusiness', l: 'Agronegócio' },
                          { v: 'logistics', l: 'Logística' },
                          { v: 'marketing', l: 'Marketing' },
                          { v: 'food', l: 'Alimentação' },
                          { v: 'services', l: 'Serviços' },
                          { v: 'other', l: 'Outro' }
                        ].map(s => (
                          <option key={s.v} value={s.v}>{s.l}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Estágio *</label>
                      <select
                        value={formData.stage}
                        onChange={e => setFormData({ ...formData, stage: e.target.value as any })}
                        className="w-full h-12 px-4 py-2 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                        required
                      >
                        <option value="idea">Ideia (ainda não validada)</option>
                        <option value="mvp">MVP (produto mínimo viável)</option>
                        <option value="validation">Validação (primeiros clientes)</option>
                        <option value="traction">Tração (crescimento consistente)</option>
                        <option value="scale">Escala (expansão acelerada)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Pacote Expo</label>
                      <select
                        value={formData.packageType}
                        onChange={e => setFormData({ ...formData, packageType: e.target.value as 'expo' | 'pitch' })}
                        className="w-full h-12 px-4 py-2 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                      >
                        <option value="expo">Apenas Exposição</option>
                        <option value="pitch">Exposição + Arena Pitch</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Descrição (máx. 500 caracteres) *</label>
                      <Textarea
                        required
                        maxLength={500}
                        value={formData.startupDescription}
                        onChange={e => setFormData({ ...formData, startupDescription: e.target.value })}
                        className="bg-dark-100 border-white/5 text-white font-medium min-h-[100px] resize-none"
                        placeholder="Descreva sua startup..."
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Pitch */}
                <div className="space-y-6 pt-8 mt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-brand-orange-coral tracking-widest border-b border-white/5 pb-2">Pitch Details</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Qual problema você resolve? *</label>
                      <Textarea
                        required
                        value={formData.problem}
                        onChange={e => setFormData({ ...formData, problem: e.target.value })}
                        className="bg-dark-100 border-white/5 text-white font-medium resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Qual é a sua solução? *</label>
                      <Textarea
                        required
                        value={formData.solution}
                        onChange={e => setFormData({ ...formData, solution: e.target.value })}
                        className="bg-dark-100 border-white/5 text-white font-medium resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Qual seu diferencial? *</label>
                      <Textarea
                        required
                        value={formData.differential}
                        onChange={e => setFormData({ ...formData, differential: e.target.value })}
                        className="bg-dark-100 border-white/5 text-white font-medium resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Faturamento Mensal (R$)</label>
                        <Input
                          type="number"
                          value={formData.monthlyRevenue}
                          onChange={e => setFormData({ ...formData, monthlyRevenue: e.target.value })}
                          className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Investimento Buscado (R$)</label>
                        <Input
                          type="number"
                          value={formData.soughtInvestment}
                          onChange={e => setFormData({ ...formData, soughtInvestment: e.target.value })}
                          className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção: Documentos */}
                <div className="space-y-6 pt-8 mt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-brand-orange-coral tracking-widest border-b border-white/5 pb-2">Documentos & Links</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Link do Pitch Deck</label>
                      <Input
                        type="url"
                        value={formData.pitchDeckUrl}
                        onChange={e => setFormData({ ...formData, pitchDeckUrl: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Link do Vídeo Pitch</label>
                      <Input
                        type="url"
                        value={formData.videoPitchUrl}
                        onChange={e => setFormData({ ...formData, videoPitchUrl: e.target.value })}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              </div>

              <div className="admin-modal-footer p-8 pt-0 flex gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-500 font-bold uppercase text-[10px] tracking-widest h-14"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px] border-none"
                >
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

              <h3 className="text-lg font-semibold text-white mb-1">{startup.startupName}</h3>
              <p className="text-teal-400 text-sm mb-1">{startup.sector}</p>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{startup.startupDescription}</p>

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
