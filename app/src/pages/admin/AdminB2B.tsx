import { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Handshake,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Zap,
  Sparkles,
  Calendar,
  User,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useProject } from '@/contexts/ProjectContext';
import { useCompanies, useB2BMeetings, useB2BMatches, useB2BAppointmentsTriunfo } from '@/hooks/useData';
import type { B2BMeeting } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-gray-500/20 text-gray-400',
};


export function AdminB2B() {
  const { projectId } = useProject();
  const { data: companies, create: createCompany } = useCompanies();
  const { data: meetings, create: createMeeting, update, isLoading: isMeetingLoading, refetch: refetchMeetings } = useB2BMeetings();
  const { data: appointments } = useB2BAppointmentsTriunfo();
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
    // Representante
    representative_name: '',
    role_title: '',
    email: '',
    phone: '',
    senha: '',
    confirmarSenha: '',

    // Empresa
    company_name: '',
    cnpj: '',
    setor: '',
    porte: '',
    faturamento_anual: '',
    numero_funcionarios: '',

    // Sobre
    descricao_empresa: '',
    produtos_servicos: '',
    site_url: '',
    linkedin_url: '',

    // Objetivos
    interest_type: 'sell' as 'buy' | 'sell' | 'partnership' | 'all',
    interest_areas: '',
    objectives_description: '',
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

      // basic overlap detection (client‑side) to reduce round‑trips
      if (meetings) {
        const newStart = new Date(meetingFormData.scheduledAt).getTime();
        const newEnd = newStart + meetingFormData.duration * 60000;
        const hasConflict = meetings.some(m => {
          const mStart = new Date(m.scheduledAt).getTime();
          const mEnd = mStart + (m.duration || 20) * 60000;
          const sharesCompany = [m.companyAnchorId, m.companyVendorId].includes(meetingFormData.companyAnchorId)
            || [m.companyAnchorId, m.companyVendorId].includes(meetingFormData.companyVendorId);
          return sharesCompany && newStart < mEnd && mStart < newEnd;
        });
        if (hasConflict) {
          toast.error('Conflito de horário detectado para uma das empresas');
          return;
        }
      }

      await createMeeting({
        projectId: projectId || '',
        companyAnchorId: meetingFormData.companyAnchorId,
        companyVendorId: meetingFormData.companyVendorId,
        companyAnchorName: anchor?.companyName || '',
        companyVendorName: vendor?.companyName || '',
        scheduledAt: meetingFormData.scheduledAt,
        status: 'scheduled',
        duration: meetingFormData.duration,
      });

      toast.success('Reunião agendada com sucesso!');
      setIsMeetingModalOpen(false);
      await refetchMeetings(true);
      setMeetingFormData({
        companyAnchorId: '',
        companyVendorId: '',
        scheduledAt: '',
        duration: 20,
        tableNumber: ''
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Erro ao agendar reunião:', error);
      toast.error(`Erro ao agendar reunião: ${error.message}`);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!companyFormData.company_name || !companyFormData.representative_name || !companyFormData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      if (companyFormData.senha && companyFormData.senha !== companyFormData.confirmarSenha) {
        toast.error('As senhas não coincidem');
        return;
      }

      await createCompany({
        projectId: projectId || '',
        companyName: companyFormData.company_name,
        contactName: companyFormData.representative_name,
        contactEmail: companyFormData.email,
        contactPhone: companyFormData.phone,
        sector: companyFormData.setor,
        type: companyFormData.type,
        maxMeetings: companyFormData.maxMeetings,
        status: 'approved',
        companyDescription: companyFormData.descricao_empresa,
        productsServices: companyFormData.produtos_servicos,
        website: companyFormData.site_url,
        interestType: companyFormData.interest_type,
        interestAreas: companyFormData.interest_areas,
        objectives: companyFormData.objectives_description,
        position: companyFormData.role_title,
        cnpj: companyFormData.cnpj,
        companySize: companyFormData.porte,
        annualRevenue: companyFormData.faturamento_anual,
        employeeCount: companyFormData.numero_funcionarios,
        userId: '', // Admin-created companies might not have a direct user yet
        description: companyFormData.descricao_empresa || companyFormData.company_name
      });

      toast.success('Empresa cadastrada com sucesso!');
      setIsCompanyModalOpen(false);
      resetCompanyForm();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      logger.error('Erro ao cadastrar empresa:', error);
      toast.error(`Erro ao cadastrar empresa: ${error.message}`);
    }
  };

  const resetCompanyForm = () => {
    setCompanyFormData({
      representative_name: '',
      role_title: '',
      email: '',
      phone: '',
      senha: '',
      confirmarSenha: '',
      company_name: '',
      cnpj: '',
      setor: '',
      porte: '',
      faturamento_anual: '',
      numero_funcionarios: '',
      descricao_empresa: '',
      produtos_servicos: '',
      site_url: '',
      linkedin_url: '',
      interest_type: 'sell',
      interest_areas: '',
      objectives_description: '',
      type: 'vendor',
      maxMeetings: 10
    });
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
      logger.error('Erro ao gerar agenda:', { error: err });
      toast.error('Erro ao gerar agenda');
    } finally {
      setIsGenerating(false);
    }
  };

  const allMeetings = useMemo(() => {
    // Unify both table structures for display
    const standardizedAppointments = appointments.map(a => {
      const anchor = companies.find(c => c.id === a.companyAId);
      const vendor = companies.find(c => c.id === a.companyBId);
      return {
        ...a,
        companyAnchorName: anchor?.companyName || anchor?.name || '---',
        companyVendorName: vendor?.companyName || vendor?.name || '---',
        duration: a.durationMinutes || 20
      };
    });
    return [...meetings, ...standardizedAppointments];
  }, [meetings, appointments, companies]);

  const filteredMeetings = allMeetings.filter((meeting) => {
    return (
      meeting.companyAnchorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.companyVendorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredMatches = matches.filter(match => {
    const companyA = companies.find(c => c.id === match.companyAId);
    const companyB = companies.find(c => c.id === match.companyBId);
    return (
      (companyA?.companyName || companyA?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (companyB?.companyName || companyB?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredCompanies = companies.filter(company => {
    return (
      (company.companyName || company.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.sector || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    totalMeetings: allMeetings.length,
    scheduled: allMeetings.filter(m => m.status === 'scheduled').length,
    completed: allMeetings.filter(m => m.status === 'completed').length,
    highInterest: allMeetings.filter(m => (m as B2BMeeting).interestLevel === 'high').length,
    followUps: allMeetings.filter(m => (m as B2BMeeting).followUp).length,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
            <Handshake className="h-8 w-8 text-brand-orange-coral fill-brand-orange-coral" />
            RODADA DE <span className="text-brand-orange-coral">NEGÓCIOS B2B</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Matchmaking corporativo e gestão de conexões</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'matches' && (
            <Button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="h-12 px-8 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black rounded-2xl shadow-glow-orange transition-all"
            >
              <Zap className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
              {isGenerating ? 'GERANDO...' : 'GERAR AGENDA AUTOMÁTICA'}
            </Button>
          )}

          {activeTab === 'meetings' ? (
            <Dialog open={isMeetingModalOpen} onOpenChange={setIsMeetingModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all">
                  <Plus className="h-4 w-4 mr-2" /> NOVA REUNIÃO
                </Button>
              </DialogTrigger>
              <DialogContent className="admin-modal-content p-0 border-none max-w-xl">
                <div className="admin-modal-header">
                  <div>
                    <DialogTitle className="text-xl font-black italic uppercase leading-none">
                      Agendar <span className="text-teal-500">Reunião B2B</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                      Defina as empresas e o horário para a nova rodada de negócios
                    </DialogDescription>
                  </div>
                </div>

                <form onSubmit={handleCreateMeeting} className="flex flex-col min-h-0 overflow-hidden custom-scrollbar">
                  <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Empresa Âncora (Compradora) *</label>
                        <select
                          required
                          value={meetingFormData.companyAnchorId}
                          onChange={e => setMeetingFormData({ ...meetingFormData, companyAnchorId: e.target.value })}
                          className="w-full h-12 px-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-teal-500/50 transition-all appearance-none"
                        >
                          <option value="">Selecione a empresa âncora</option>
                          {companies.filter(c => c.type === 'anchor').map(c => (
                            <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Fornecedor (Vendedor) *</label>
                        <select
                          required
                          value={meetingFormData.companyVendorId}
                          onChange={e => setMeetingFormData({ ...meetingFormData, companyVendorId: e.target.value })}
                          className="w-full h-12 px-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                        >
                          <option value="">Selecione o fornecedor</option>
                          {companies.filter(c => c.type === 'vendor').map(c => (
                            <option key={c.id} value={c.id}>{c.companyName || c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Data e Hora *</label>
                          <Input
                            required
                            type="datetime-local"
                            value={meetingFormData.scheduledAt}
                            onChange={e => setMeetingFormData({ ...meetingFormData, scheduledAt: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Mesa / Local</label>
                          <Input
                            value={meetingFormData.tableNumber}
                            onChange={e => setMeetingFormData({ ...meetingFormData, tableNumber: e.target.value })}
                            placeholder="Ex: Mesa 05"
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal-footer">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsMeetingModalOpen(false)} 
                      className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isMeetingLoading} 
                      className="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all uppercase tracking-widest text-[10px]"
                    >
                      {isMeetingLoading ? 'Agendando...' : 'Confirmar Agendamento'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : activeTab === 'companies' ? (
            <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-8 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all">
                  <Plus className="h-4 w-4 mr-2" /> NOVA EMPRESA
                </Button>
              </DialogTrigger>
              <DialogContent className="admin-modal-content p-0 border-none max-w-4xl">
                <div className="admin-modal-header">
                  <div>
                    <DialogTitle className="text-xl font-black italic uppercase leading-none">
                      Cadastrar <span className="text-teal-500">Nova Empresa</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                      Preencha os dados do representante e da empresa para participação no B2B
                    </DialogDescription>
                  </div>
                </div>

                <form onSubmit={handleCreateCompany} className="flex flex-col min-h-0 overflow-hidden custom-scrollbar">
                  <div className="admin-modal-body overflow-y-auto custom-scrollbar">
                    {/* Seção: Representante */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                         <User className="h-4 w-4 text-teal-400" />
                         <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic leading-none">Representante</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome Completo *</label>
                          <Input
                            required
                            value={companyFormData.representative_name}
                            onChange={e => setCompanyFormData({ ...companyFormData, representative_name: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Cargo *</label>
                          <Input
                            required
                            value={companyFormData.role_title}
                            onChange={e => setCompanyFormData({ ...companyFormData, role_title: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                            placeholder="Ex: CEO, Diretor"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Email Corporativo *</label>
                          <Input
                            type="email"
                            required
                            value={companyFormData.email}
                            onChange={e => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seção: Empresa */}
                    <div className="space-y-6 pt-8 mt-8 border-t border-white/5">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                         <Building2 className="h-4 w-4 text-brand-orange-coral" />
                         <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic leading-none">Informações da Empresa</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome Fantasia da Empresa *</label>
                          <Input
                            required
                            value={companyFormData.company_name}
                            onChange={e => setCompanyFormData({ ...companyFormData, company_name: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">CNPJ</label>
                          <Input
                            value={companyFormData.cnpj}
                            onChange={e => setCompanyFormData({ ...companyFormData, cnpj: e.target.value })}
                            className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Setor de Atuação *</label>
                          <select
                            required
                            value={companyFormData.setor}
                            onChange={e => setCompanyFormData({ ...companyFormData, setor: e.target.value })}
                            className="w-full h-12 px-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                          >
                            <option value="">Selecione o setor</option>
                            {[
                              { v: 'technology', l: 'Tecnologia' },
                              { v: 'health', l: 'Saúde' },
                              { v: 'education', l: 'Educação' },
                              { v: 'retail', l: 'Varejo' },
                              { v: 'industry', l: 'Indústria' },
                              { v: 'services', l: 'Serviços' },
                              { v: 'construction', l: 'Construção' },
                              { v: 'agribusiness', l: 'Agronegócio' },
                              { v: 'food', l: 'Alimentação' },
                              { v: 'logistics', l: 'Logística' },
                              { v: 'consulting', l: 'Consultoria' },
                              { v: 'marketing', l: 'Marketing' },
                              { v: 'finance', l: 'Financeiro' },
                              { v: 'other', l: 'Outro' }
                            ].map(s => (
                              <option key={s.v} value={s.v}>{s.l}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Objetivo B2B *</label>
                          <select
                            required
                            value={companyFormData.interest_type}
                            onChange={e => setCompanyFormData({ ...companyFormData, interest_type: e.target.value as any })}
                            className="w-full h-12 px-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                          >
                            <option value="sell">Vender (Fornecer)</option>
                            <option value="buy">Comprar (Âncora)</option>
                            <option value="partnership">Parceria</option>
                            <option value="all">Todos</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tipo de Registro *</label>
                          <select
                            value={companyFormData.type}
                            onChange={e => setCompanyFormData({ ...companyFormData, type: e.target.value as 'anchor' | 'vendor' })}
                            className="w-full h-12 px-4 bg-dark-100 border border-white/5 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-teal-500/50 transition-all appearance-none"
                          >
                            <option value="vendor">Operador (Fornecedor)</option>
                            <option value="anchor">Comprador (Âncora)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal-footer">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsCompanyModalOpen(false)} 
                      className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-14 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-2xl shadow-glow-teal transition-all uppercase tracking-widest text-[10px]"
                    >
                      Finalizar Cadastro Corporativo
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Reuniões', val: stats.totalMeetings, color: 'text-white', icon: Zap },
          { label: 'Agendadas', val: stats.scheduled, color: 'text-blue-400', icon: Calendar },
          { label: 'Concluídas', val: stats.completed, color: 'text-emerald-400', icon: CheckCircle },
          { label: 'Alto Interesse', val: stats.highInterest, color: 'text-teal-400', icon: Star },
          { label: 'Follow-ups', val: stats.followUps, color: 'text-brand-orange-coral', icon: TrendingUp },
        ].map((item, i) => (
          <Card key={i} className="glass-card p-6 rounded-[2rem] relative overflow-hidden group border-white/5">
             <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <item.icon className={`h-16 w-16 ${item.color.replace('text-', 'text-')}`} />
             </div>
             <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
             <h3 className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.val}</h3>
          </Card>
        ))}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center p-1 bg-dark-200/50 rounded-2xl border border-white/5 h-14 backdrop-blur-xl">
            {[
              { id: 'meetings', label: 'Reuniões', icon: Calendar },
              { id: 'companies', label: 'Empresas', icon: Building2 },
              { id: 'matches', label: 'Matches', icon: Sparkles, count: matches.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'meetings' | 'companies' | 'matches')}
                className={`flex items-center px-6 h-full font-black text-[10px] uppercase tracking-widest rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-orange-coral text-white shadow-glow-orange/20' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:w-80 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Pesquisar registro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-dark-200/50 border-white/5 rounded-2xl text-xs font-bold"
            />
          </div>
      </div>

      {activeTab === 'meetings' ? (
        /* Meetings Table */
        <Card className="glass-card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto responsive-table">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Empresa Âncora</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Fornecedor</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Data/Hora</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Status</th>
                  <th className="p-6 text-left text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Interesse</th>
                  <th className="p-6 text-right text-gray-400 font-extrabold uppercase text-[10px] tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all group">
                    <td className="p-6" data-label="Âncora">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/5">
                          <Building2 className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase italic leading-none mb-1">{meeting.companyAnchorName}</p>
                           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">Comprador</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6" data-label="Fornecedor">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5">
                          <Handshake className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase italic leading-none mb-1">{meeting.companyVendorName}</p>
                           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">Vendedor</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6" data-label="Hora">
                      <div className="flex items-center gap-3">
                         <div className="bg-dark-300 px-3 py-1.5 rounded-lg border border-white/5">
                            <p className="text-white font-black text-xs">{new Date(meeting.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                         <p className="text-[10px] text-gray-500 font-bold">{new Date(meeting.scheduledAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="p-6" data-label="Status">
                      <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${statusColors[meeting.status] || 'bg-gray-500/20 text-gray-400'}`}>
                        {meeting.status}
                      </Badge>
                    </td>
                    <td className="p-6" data-label="Int.">
                      {(meeting as B2BMeeting).interestLevel ? (
                        <div className="flex items-center gap-1.5">
                           <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                           <p className="text-white font-black text-xs uppercase italic">{(meeting as B2BMeeting).interestLevel}</p>
                        </div>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </td>
                    <td className="p-6 text-right" data-label="Ações">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {meeting.status === 'scheduled' && (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 text-emerald-500 hover:text-white hover:bg-emerald-500/10 rounded-xl"
                              onClick={() => update(meeting.id, { status: 'completed' })}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-10 w-10 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral/10 rounded-xl"
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
        </Card>
      ) : activeTab === 'matches' ? (
        /* Matches Table */
        <Card className="glass-card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto responsive-table">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Empresa A</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Interação</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Empresa B</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Status</th>
                  <th className="p-6 text-right text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Audit</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => {
                  const companyA = companies.find(c => c.id === match.companyAId);
                  const companyB = companies.find(c => c.id === match.companyBId);
                  return (
                    <tr key={match.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all group">
                      <td className="p-6" data-label="Empresa A">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/5">
                            <Building2 className="h-5 w-5 text-teal-400" />
                          </div>
                          <span className="text-white font-black text-sm uppercase italic">{companyA?.companyName || '---'}</span>
                        </div>
                      </td>
                      <td className="p-6" data-label="Interação">
                        <div className="flex items-center gap-2 text-teal-500">
                          <Sparkles className="h-4 w-4 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Mutual Like</span>
                        </div>
                      </td>
                      <td className="p-6" data-label="Empresa B">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/5">
                            <Building2 className="h-5 w-5 text-teal-400" />
                          </div>
                          <span className="text-white font-black text-sm uppercase italic">{companyB?.companyName || '---'}</span>
                        </div>
                      </td>
                      <td className="p-6" data-label="Status">
                        <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${
                          match.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {match.status === 'scheduled' ? 'AGENDADO' : 'PENDENTE'}
                        </Badge>
                      </td>
                      <td className="p-6 text-right text-gray-600 text-[10px] font-bold uppercase tracking-widest" data-label="Data">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Companies Table */
        <Card className="glass-card overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto responsive-table">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Empresa</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Setor</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Porte</th>
                  <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Tipo</th>
                  <th className="p-6 text-right text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all group">
                    <td className="p-6" data-label="Empresa">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                           <p className="text-white font-black text-sm uppercase italic leading-none mb-1">{company.companyName || company.name}</p>
                           <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">{company.contactName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6" data-label="Setor">
                       <span className="text-gray-400 font-bold text-xs uppercase tracking-tight">{company.sector || '---'}</span>
                    </td>
                    <td className="p-6" data-label="Porte">
                       <Badge className="bg-white/5 text-gray-400 font-black text-[9px] uppercase tracking-widest border-none">
                          {company.companySize || 'Micro'}
                       </Badge>
                    </td>
                    <td className="p-6" data-label="Tipo">
                       <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${
                          company.type === 'anchor' ? 'bg-teal-500/10 text-teal-400' : 'bg-brand-orange-coral/10 text-brand-orange-coral'
                       }`}>
                          {company.type === 'anchor' ? 'ÂNCORA' : 'FORNECEDOR'}
                       </Badge>
                    </td>
                    <td className="p-6 text-right" data-label="Ações">
                       <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4" />
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
