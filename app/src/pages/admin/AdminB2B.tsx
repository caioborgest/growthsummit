import { useState } from 'react';
import {
  Search,
  Building2,
  Handshake,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Sparkles,
  Zap,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useCompanies, useB2BMeetings, useB2BMatches } from '@/hooks/useData';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-gray-500/20 text-gray-400',
};

const interestColors: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-green-500/20 text-green-400',
};

export function AdminB2B() {
  const { data: companies, create: createCompany } = useCompanies();
  const { data: meetings, create: createMeeting, update, isLoading: isMeetingLoading } = useB2BMeetings();
  const { data: matches, refetch: refetchMatches } = useB2BMatches();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'meetings' | 'companies' | 'matches'>('meetings');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  const [meetingFormData, setMeetingFormData] = useState({
    companyAnchorId: '',
    companyVendorId: '',
    scheduledAt: '',
    duration: 20,
    tableNumber: ''
  });

  const [companyFormData, setCompanyFormData] = useState({
    name: '',
    cnpj: '',
    sector: '',
    contactName: '',
    contactEmail: '',
    type: 'vendor' as 'anchor' | 'vendor',
    maxMeetings: 10
  });

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!meetingFormData.companyAnchorId || !meetingFormData.companyVendorId || !meetingFormData.scheduledAt) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      const anchor = companies.find(c => c.id === meetingFormData.companyAnchorId);
      const vendor = companies.find(c => c.id === meetingFormData.companyVendorId);

      await createMeeting({
        companyAnchorId: meetingFormData.companyAnchorId,
        companyVendorId: meetingFormData.companyVendorId,
        companyAnchorName: anchor?.name || '',
        companyVendorName: vendor?.name || '',
        scheduledAt: meetingFormData.scheduledAt,
        status: 'scheduled',
        duration: meetingFormData.duration,
        tableNumber: meetingFormData.tableNumber
      } as any);

      toast.success('Reunião agendada com sucesso!');
      setIsMeetingModalOpen(false);
      setMeetingFormData({
        companyAnchorId: '',
        companyVendorId: '',
        scheduledAt: '',
        duration: 20,
        tableNumber: ''
      });
    } catch (err) {
      toast.error('Erro ao agendar reunião');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!companyFormData.name || !companyFormData.cnpj) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      await createCompany(companyFormData as any);
      toast.success('Empresa cadastrada com sucesso!');
      setIsCompanyModalOpen(false);
      setCompanyFormData({
        name: '',
        cnpj: '',
        sector: '',
        contactName: '',
        contactEmail: '',
        type: 'vendor',
        maxMeetings: 10
      });
    } catch (err) {
      toast.error('Erro ao cadastrar empresa');
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.rpc('rpc_generate_b2b_schedule');
      if (error) throw error;
      toast.success('Agenda gerada com sucesso!', {
        description: 'Os agendamentos foram criados para todos os matches pendentes.'
      });
      refetchMatches();
    } catch (err) {
      console.error('Erro ao gerar agenda:', err);
      toast.error('Erro ao gerar agenda');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    return (
      meeting.companyAnchorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.companyVendorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredMatches = matches.filter(match => {
    const companyA = companies.find(c => c.id === match.companyAId);
    const companyB = companies.find(c => c.id === match.companyBId);
    return (
      companyA?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyB?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredCompanies = companies.filter(company => {
    return (
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    totalMeetings: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    highInterest: meetings.filter(m => m.interestLevel === 'high').length,
    followUps: meetings.filter(m => m.followUp).length,
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        <button
          onClick={() => setActiveTab('meetings')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'meetings'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Reuniões
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'companies'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Empresas
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-4 text-sm font-medium transition-colors ${activeTab === 'matches'
            ? 'text-teal-400 border-b-2 border-teal-400'
            : 'text-gray-400 hover:text-white'
            }`}
        >
          Matches ({matches.length})
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            type="text"
            placeholder={activeTab === 'meetings' ? "Buscar reunião..." : "Buscar empresa..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
          />
        </div>
        <div className="flex gap-2">
          {activeTab === 'matches' && (
            <Button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              <Zap className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
              {isGenerating ? 'Gerando...' : 'Gerar Agenda Automática'}
            </Button>
          )}

          {activeTab === 'meetings' ? (
            <Dialog open={isMeetingModalOpen} onOpenChange={setIsMeetingModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Reunião
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-200 border-dark-300 text-white">
                <DialogHeader>
                  <DialogTitle>Agendar Reunião B2B</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateMeeting} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Empresa Âncora (Compradora) *</Label>
                    <select
                      required
                      value={meetingFormData.companyAnchorId}
                      onChange={e => setMeetingFormData({ ...meetingFormData, companyAnchorId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                    >
                      <option value="">Selecione a empresa âncora</option>
                      {companies.filter(c => c.type === 'anchor').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fornecedor (Vendedor) *</Label>
                    <select
                      required
                      value={meetingFormData.companyVendorId}
                      onChange={e => setMeetingFormData({ ...meetingFormData, companyVendorId: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                    >
                      <option value="">Selecione o fornecedor</option>
                      {companies.filter(c => c.type === 'vendor').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data e Hora *</Label>
                      <Input
                        required
                        type="datetime-local"
                        value={meetingFormData.scheduledAt}
                        onChange={e => setMeetingFormData({ ...meetingFormData, scheduledAt: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mesa / Local</Label>
                      <Input
                        value={meetingFormData.tableNumber}
                        onChange={e => setMeetingFormData({ ...meetingFormData, tableNumber: e.target.value })}
                        placeholder="Ex: Mesa 05"
                        className="bg-dark-100 border-dark-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                    <Button type="button" variant="outline" onClick={() => setIsMeetingModalOpen(false)} className="border-dark-300 text-gray-400">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isMeetingLoading} className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                      {isMeetingLoading ? 'Agendando...' : 'Agendar Reunião'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : activeTab === 'companies' ? (
            <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-200 border-dark-300 text-white">
                <DialogHeader>
                  <DialogTitle>Cadastrar Nova Empresa B2B</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCompany} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Empresa *</Label>
                      <Input
                        required
                        value={companyFormData.name}
                        onChange={e => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ *</Label>
                      <Input
                        required
                        value={companyFormData.cnpj}
                        onChange={e => setCompanyFormData({ ...companyFormData, cnpj: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Setor / Ramo</Label>
                      <Input
                        value={companyFormData.sector}
                        onChange={e => setCompanyFormData({ ...companyFormData, sector: e.target.value })}
                        className="bg-dark-100 border-dark-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Empresa</Label>
                      <select
                        value={companyFormData.type}
                        onChange={e => setCompanyFormData({ ...companyFormData, type: e.target.value as any })}
                        className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                      >
                        <option value="vendor">Fornecedor</option>
                        <option value="anchor">Âncora</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                    <Button type="button" variant="outline" onClick={() => setIsCompanyModalOpen(false)} className="border-dark-300 text-gray-400">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white font-bold">
                      Cadastrar Empresa
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total Reuniões</p>
          <p className="text-2xl font-bold text-white">{stats.totalMeetings}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Agendadas</p>
          <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Concluídas</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Alto Interesse</p>
          <p className="text-2xl font-bold text-teal-400">{stats.highInterest}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Follow-ups</p>
          <p className="text-2xl font-bold text-orange-400">{stats.followUps}</p>
        </div>
      </div>

      {activeTab === 'meetings' ? (
        /* Meetings Table */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300">
                  <th className="p-4 text-left text-gray-400 font-medium">Empresa Âncora</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Fornecedor</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Data/Hora</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Interesse</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Follow-up</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center mr-3">
                          <Building2 className="h-4 w-4 text-teal-400" />
                        </div>
                        <span className="text-white">{meeting.companyAnchorName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mr-3">
                          <Handshake className="h-4 w-4 text-orange-400" />
                        </div>
                        <span className="text-white">{meeting.companyVendorName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white text-sm">
                          {new Date(meeting.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {new Date(meeting.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[meeting.status]}>
                        {meeting.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {meeting.interestLevel ? (
                        <Badge className={interestColors[meeting.interestLevel]}>
                          <Star className="h-3 w-3 mr-1" />
                          {meeting.interestLevel}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {meeting.followUp ? (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          Necessário
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {meeting.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-400"
                              onClick={() => update(meeting.id, { status: 'completed' })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400"
                              onClick={() => update(meeting.id, { status: 'cancelled' })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'matches' ? (
        /* Matches Table */
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300">
                  <th className="p-4 text-left text-gray-400 font-medium">Empresa A</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Interação</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Empresa B</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                  <th className="p-4 text-left text-gray-400 font-medium">Data do Match</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => {
                  const companyA = companies.find(c => c.id === match.companyAId);
                  const companyB = companies.find(c => c.id === match.companyBId);
                  return (
                    <tr key={match.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center mr-3">
                            <Building2 className="h-4 w-4 text-teal-400" />
                          </div>
                          <span className="text-white">{companyA?.name || '---'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-teal-500">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase">Mutual Like</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center mr-3">
                            <Building2 className="h-4 w-4 text-teal-400" />
                          </div>
                          <span className="text-white">{companyB?.name || '---'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          match.status === 'scheduled' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }>
                          {match.status === 'scheduled' ? 'Agendado' : 'Pendente Agendamento'}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(match.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* Companies Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-teal-400" />
                </div>
                <Badge className={
                  company.type === 'anchor' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                }>
                  {company.type === 'anchor' ? 'Âncora' : 'Fornecedor'}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{company.name}</h3>
              <p className="text-teal-400 text-sm mb-1">{company.sector}</p>
              <p className="text-gray-400 text-sm mb-4">{company.contactName}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">CNPJ:</span>
                  <span className="text-gray-300">{company.cnpj}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Máx. reuniões:</span>
                  <span className="text-gray-300">{company.maxMeetings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pacote:</span>
                  <span className="text-gray-300">{company.packageType || '-'}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1 border-dark-300 text-gray-300">
                  Ver perfil
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-teal-500 text-teal-400">
                  Agendar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
