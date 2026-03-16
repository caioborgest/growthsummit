import { useState, useMemo } from 'react';
import {
  Gem,
  FileCheck,
  Calendar,
  TrendingUp,
  Star,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  ExternalLink,
  Upload,
  MessageSquare,
  ClipboardList,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSponsors, useLeads, useNotifications, useSessions, useCheckInsAtividades, useMyRegistration } from '@/hooks/useData';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileForm } from './components/ProfileForm';
import { User as UserIcon, Users, QrCode } from 'lucide-react';

import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { QuickActions } from './components/shared/QuickActions';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { LeadScanner } from './components/shared/LeadScanner';
import { exportToCSV } from '@/utils/csv';
import { supabase } from '@/lib/supabase';

export function DashboardSponsor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: sponsors } = useSponsors();
  const { data: notificationsData } = useNotifications();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { registration } = useMyRegistration();
  const [activeTab, setActiveTab] = useState('home');

  const notifications = useMemo(() =>
    (notificationsData || []).filter((n: { userId?: string }) => n.userId === user?.id),
    [notificationsData, user?.id]
  );

  const nextActivity = useMemo(() => {
    if (!allSessions || !activityCheckIns) return null;
    const sorted = [...allSessions].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return sorted.find(s => {
      const isAlreadyCheckedIn = activityCheckIns?.some(c => c.session_id === s.id && c.registration_id === registration?.id);
      return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0];
  }, [allSessions, activityCheckIns, registration?.id]);

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', id);
  };

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);

  // Encontrar patrocinador vinculado ao usuário logado
  const sponsorData = sponsors.find(s => s.userId === user?.id) || sponsors[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Dados mockados dos entregáveis
  const deliverables = [
    { id: 1, item: 'Logo em alta resolução', deadline: '2026-04-01', status: 'completed', completedAt: '2026-03-15', notes: 'Enviado via email' },
    { id: 2, item: 'Palestra 20min - Tema', deadline: '2026-04-15', status: 'completed', completedAt: '2026-04-10', notes: 'Tema: Growth na prática' },
    { id: 3, item: 'Material do Stand', deadline: '2026-05-01', status: 'in_progress', completedAt: null, notes: 'Aguardando aprovação' },
    { id: 4, item: 'Release para imprensa', deadline: '2026-04-20', status: 'pending', completedAt: null, notes: '' },
    { id: 5, item: 'Lista de representantes', deadline: '2026-05-10', status: 'pending', completedAt: null, notes: '' },
  ];

  // Estatísticas e Leads
  const { data: leads, create: createLead } = useLeads();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const sponsorLeads = useMemo(() => {
    if (!sponsorData) return [];
    return leads.filter(l => l.sponsorId === sponsorData.id);
  }, [leads, sponsorData]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = useMemo(() => {
    return sponsorLeads.filter(l => 
      l.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.visitorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.visitorCpf?.includes(searchTerm)
    );
  }, [sponsorLeads, searchTerm]);

  const handleScanSuccess = async (decodedText: string) => {
    try {
      let registrationId = decodedText;

      // Suporte ao formato padrão: GE - CHECKIN | UUID | EMAIL | TOKEN
      if (decodedText.startsWith('GE - CHECKIN') || decodedText.startsWith('GE-CHECKIN')) {
        const parts = decodedText.split('|');
        if (parts.length > 1) {
          registrationId = parts[1].trim();
        }
      } else if (decodedText.startsWith('{')) {
        const data = JSON.parse(decodedText);
        registrationId = data.id || data.registrationId;
      }

      if (!registrationId || registrationId.length < 10) return;

      const alreadyScanned = sponsorLeads.some(l => l.registrationId === registrationId);
      if (alreadyScanned) {
        toast.info('Este participante já está na sua lista de leads.');
        return;
      }

      await createLead({
        projectId: sponsorData?.projectId,
        sponsorId: sponsorData?.id,
        registrationId: registrationId,
        interestLevel: 'high',
        notes: 'Capturado via QR Code do Stand',
        visitorName: 'Participante ' + registrationId.substring(0, 4),
      });

      toast.success('Lead capturado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao ler QR Code ou salvar lead');
    }
  };

  const stats = {
    totalDeliverables: deliverables.length,
    completed: deliverables.filter(d => d.status === 'completed').length,
    inProgress: deliverables.filter(d => d.status === 'in_progress').length,
    pending: deliverables.filter(d => d.status === 'pending').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'pending':
        return <Badge className="bg-gray-500/20 text-gray-400"><AlertCircle className="h-3 w-3 mr-1" />Pendente</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] relative overflow-hidden">
      <PremiumBackground />

      <div className="relative z-10 pb-24">
        <PremiumHeader
          userName={user?.name}
          projectName="GROWTH SUMMIT 2026"
          roleLabel="PATROCINADOR"
          isPro={true}
          notifications={notifications}
          onLogout={handleLogout}
          onGuideClick={() => navigate('/guia')}
          onNotificationRead={handleMarkAsRead}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <QuickActions
            onB2BClick={() => setIsB2BModalOpen(true)}
            onStartupClick={() => setIsStartupModalOpen(true)}
          />

          {/* Stats Overview */}
          <div className="py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-yellow-500/10 hover:border-yellow-500/30 transition-all group">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Total Entregáveis</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white group-hover:text-yellow-400 transition-colors">{stats.totalDeliverables}</p>
                  <FileCheck className="h-6 w-6 text-yellow-500/40" />
                </div>
              </div>
              <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-green-500/10 hover:border-green-500/30 transition-all group">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Concluídos</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-green-400">{stats.completed}</p>
                  <CheckCircle className="h-6 w-6 text-green-500/40" />
                </div>
              </div>
              <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-blue-500/10 hover:border-blue-500/30 transition-all group">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Em Andamento</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-blue-400">{stats.inProgress}</p>
                  <Clock className="h-6 w-6 text-blue-500/40" />
                </div>
              </div>
              <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-red-500/10 hover:border-red-500/30 transition-all group">
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Pendentes</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-red-400">{stats.pending}</p>
                  <AlertCircle className="h-6 w-6 text-red-500/40" />
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
                <TabsTrigger
                  value="home"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  Início
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <Gem className="h-4 w-4 mr-1 md:mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="deliverables"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <FileCheck className="h-4 w-4 mr-1 md:mr-2" />
                  Entregáveis
                </TabsTrigger>
                <TabsTrigger
                  value="leads"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <Users className="h-4 w-4 mr-1 md:mr-2" />
                  Leads
                </TabsTrigger>
                <TabsTrigger
                  value="programacao"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <Calendar className="h-4 w-4 mr-1 md:mr-2" />
                  Agenda
                </TabsTrigger>
                <TabsTrigger
                  value="materiais"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <Download className="h-4 w-4 mr-1 md:mr-2" />
                  Materiais
                </TabsTrigger>
                <TabsTrigger
                  value="contato"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <MessageSquare className="h-4 w-4 mr-1 md:mr-2" />
                  Contato
                </TabsTrigger>
                <TabsTrigger
                  value="perfil"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"
                >
                  <UserIcon className="h-4 w-4 mr-1 md:mr-2" />
                  Perfil
                </TabsTrigger>
              </TabsList>

              {/* Home Tab */}
              <TabsContent value="home" className="mt-0 space-y-10">
                <PwaDashboardHero 
                    eventName="Growth Experience"
                    location="Triunfo-PE"
                    date="16 ABR 2026"
                    stats={{
                        people: sponsorLeads.length.toString() + "+",
                        content: `${stats.completed}/${stats.totalDeliverables}`,
                        activities: "Premium"
                    }}
                />
                
                {nextActivity && (
                    <NextActivityCard 
                        title={nextActivity.title}
                        subtitle={nextActivity.type || "Patrocinador Geral"}
                        time={nextActivity.startTime || "00:00"}
                        duration="20 min"
                        isConfirmed={activityCheckIns?.some(c => c.session_id === nextActivity.id && c.registration_id === registration?.id)}
                        onClick={() => setActiveTab('programacao')}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                     <div className="glass-card p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Status Marca</p>
                        <p className="text-xl font-bold text-white font-black group-hover:text-yellow-400 transition-colors">Aprovado</p>
                     </div>
                     <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Impacto Estimado</p>
                        <p className="text-xl font-bold text-green-400 font-black">2.5k+</p>
                     </div>
                </div>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Benefícios do Patrocínio */}
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-400" />
                        Seus Benefícios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {[
                          'Logo em todos os materiais oficiais do evento',
                          'Stand 6x4m premium na área de exposição',
                          'Palestra de 20 min no palco principal',
                          'Acesso VIP ao lounge de networking',
                          '10 ingressos cortesia para clientes',
                          'Mencionado em todas as redes sociais',
                          'Banco de dados de participantes (opt-in)',
                          'Exposição na newsletter do evento',
                        ].map((benefit, i) => (
                          <li key={i} className="flex items-start text-gray-300">
                            <CheckCircle className="h-5 w-5 mr-3 text-green-400 flex-shrink-0 mt-0.5" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Próximos Passos */}
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2 text-teal-400" />
                        Próximos Passos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {deliverables
                          .filter(d => d.status !== 'completed')
                          .map((deliverable) => (
                            <div key={deliverable.id} className="flex items-start p-3 bg-dark-100 rounded-lg">
                              <div className="flex-1">
                                <p className="text-white font-medium">{deliverable.item}</p>
                                <p className="text-gray-400 text-sm">Prazo: {new Date(deliverable.deadline).toLocaleDateString('pt-BR')}</p>
                                {deliverable.notes && (
                                  <p className="text-gray-500 text-sm mt-1">{deliverable.notes}</p>
                                )}
                              </div>
                              {getStatusBadge(deliverable.status)}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resumo do Investimento */}
                <Card className="bg-dark-200 border-dark-300">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-teal-400" />
                      Resumo do Patrocínio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Investimento Total</p>
                        <p className="text-2xl font-bold text-white">
                          R$ {(sponsorData?.investment || 60000).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Data de Fechamento</p>
                        <p className="text-lg text-white">
                          {sponsorData?.createdAt
                            ? new Date(sponsorData.createdAt).toLocaleDateString('pt-BR')
                            : '10/01/2026'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Status do Contrato</p>
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Assinado
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Deliverables Tab */}
              <TabsContent value="deliverables" className="mt-0">
                <Card className="bg-dark-200 border-dark-300">
                  <CardHeader>
                    <CardTitle className="text-white">Entregáveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deliverables.map((deliverable) => (
                        <div key={deliverable.id} className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="text-white font-medium">{deliverable.item}</p>
                              {getStatusBadge(deliverable.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Prazo: {new Date(deliverable.deadline).toLocaleDateString('pt-BR')}
                              </span>
                              {deliverable.completedAt && (
                                <span className="flex items-center text-green-400">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Concluído em: {new Date(deliverable.completedAt).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            {deliverable.notes && (
                              <p className="text-gray-500 text-sm mt-2">{deliverable.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {deliverable.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => toast.success('Upload iniciado')}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Enviar
                              </Button>
                            )}
                            {deliverable.status === 'completed' && (
                              <Button size="sm" variant="outline" className="border-dark-300 text-gray-300" onClick={() => navigate('/em-breve/download-entregavel')}>
                                <Download className="h-4 w-4 mr-1" />
                                Baixar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Leads Tab */}
              <TabsContent value="leads" className="mt-0 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, email ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-dark-200 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsScannerOpen(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl px-6 h-12 font-bold shadow-lg shadow-yellow-500/20"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Capturar Lead
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportToCSV(sponsorLeads as any, 'leads_patrocinador')}
                      className="border-white/5 bg-dark-200 text-gray-300 rounded-2xl px-6 h-12 font-bold hover:bg-dark-300"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 bg-gradient-to-br from-dark-200 to-dark-300 border-white/5 flex flex-col gap-6 group hover:border-yellow-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6 text-yellow-500" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg leading-tight">{lead.visitorName}</h4>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
                              {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} • {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          lead.interestLevel === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                          lead.interestLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                          'bg-gray-500/20 text-gray-400 border-white/5'
                        }>
                          {lead.interestLevel.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {lead.visitorEmail && (
                          <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                            <Mail className="h-4 w-4 text-yellow-500/50" />
                            <span className="text-sm truncate">{lead.visitorEmail}</span>
                          </div>
                        )}
                        {lead.visitorPhone && (
                          <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                            <Phone className="h-4 w-4 text-yellow-500/50" />
                            <span className="text-sm">{lead.visitorPhone}</span>
                          </div>
                        )}
                        {lead.visitorCpf && (
                          <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                            <FileCheck className="h-4 w-4 text-yellow-500/50" />
                            <span className="text-sm">CPF: {lead.visitorCpf}</span>
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                          <p className="text-xs text-gray-500 leading-relaxed italic">
                            "{lead.notes}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-auto">
                        <Button
                          variant="outline"
                          className="flex-1 border-white/5 bg-dark-200 text-xs font-bold uppercase tracking-widest h-10 rounded-xl hover:bg-yellow-500/10 hover:text-yellow-500 transition-all"
                          onClick={() => window.open(`https://wa.me/55${lead.visitorPhone?.replace(/\D/g, '')}`, '_blank')}
                          disabled={!lead.visitorPhone}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-white/5 bg-dark-200 text-xs font-bold uppercase tracking-widest h-10 rounded-xl hover:bg-yellow-500/10 hover:text-yellow-500 transition-all"
                          onClick={() => window.location.href = `mailto:${lead.visitorEmail}`}
                          disabled={!lead.visitorEmail}
                        >
                          E-mail
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {filteredLeads.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-20 h-20 rounded-full bg-dark-200 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-gray-500" />
                      </div>
                      <h4 className="text-white font-bold text-xl mb-2">Nenhum lead encontrado</h4>
                      <p className="text-gray-500 max-w-sm">
                        {searchTerm ? 'Nenhum participante corresponde aos filtros de busca.' : 'Você ainda não capturou nenhum lead. Comece escaneando os crachás dos participantes.'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Programação Tab */}
              <TabsContent value="programacao" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-teal-400" />
                        Programação do Evento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-dark-100 rounded-lg border-l-4 border-yellow-500">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-yellow-500/20 text-yellow-400">Seu Horário</Badge>
                            <span className="text-gray-400 text-sm">21/05 - 09:00</span>
                          </div>
                          <p className="text-white font-semibold">Palestra: Growth na Prática</p>
                          <p className="text-gray-400 text-sm">Palco Principal - 20 minutos</p>
                        </div>

                        <div className="p-4 bg-dark-100 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-blue-500/20 text-blue-400">Montagem</Badge>
                            <span className="text-gray-400 text-sm">20/05 - 14:00</span>
                          </div>
                          <p className="text-white font-semibold">Montagem do Stand</p>
                          <p className="text-gray-400 text-sm">Área de Exposição</p>
                        </div>

                        <div className="p-4 bg-dark-100 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-teal-500/20 text-teal-400">Networking</Badge>
                            <span className="text-gray-400 text-sm">21/05 - 18:00</span>
                          </div>
                          <p className="text-white font-semibold">Coquetel de Abertura</p>
                          <p className="text-gray-400 text-sm">Lounge VIP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-red-400" />
                        Informações do Local
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm">Local</p>
                          <p className="text-white font-medium">Boulevard Hotel & Convention</p>
                          <p className="text-gray-400 text-sm">Rua São Pedro, 1200, Centro</p>
                          <p className="text-gray-400 text-sm">Juazeiro do Norte - CE</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Seu Stand</p>
                          <p className="text-white font-medium text-lg">Stand 01 (6x4m)</p>
                          <p className="text-gray-400 text-sm">Área Premium - Entrada principal</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Credenciamento</p>
                          <p className="text-white">A partir das 07:30 nos dias 21 e 22/05</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Materiais Tab */}
              <TabsContent value="materiais" className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Documentos */}
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <FileText className="h-5 w-5 mr-2 text-blue-400" />
                        Documentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Contrato de Patrocínio', type: 'PDF' },
                          { name: 'Manual do Patrocinador', type: 'PDF' },
                          { name: 'Guia de Montagem do Stand', type: 'PDF' },
                          { name: 'Regras de Branding', type: 'PDF' },
                        ].map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-yellow-400 mr-3" />
                              <span className="text-white text-sm">{doc.name}</span>
                            </div>
                            <Button size="sm" variant="outline" className="border-dark-300 text-gray-300" onClick={() => navigate(`/em-breve/download-${doc.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Templates */}
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <FileText className="h-5 w-5 mr-2 text-teal-400" />
                        Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Template Apresentação', type: 'PPT' },
                          { name: 'Logo do Evento (vetor)', type: 'AI' },
                          { name: 'Release para Imprensa', type: 'DOC' },
                          { name: 'Lista de Participantes', type: 'XLS' },
                        ].map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-teal-400 mr-3" />
                              <span className="text-white text-sm">{doc.name}</span>
                            </div>
                            <Button size="sm" variant="outline" className="border-dark-300 text-gray-300" onClick={() => navigate(`/em-breve/download-${doc.name.toLowerCase().replace(/\s+/g, '-')}`)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Links Úteis */}
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <ExternalLink className="h-5 w-5 mr-2 text-orange-400" />
                        Links Úteis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Site do Evento', url: '#' },
                          { name: 'Área de Imprensa', url: '#' },
                          { name: 'Resultados Anteriores', url: '#' },
                          { name: 'Fotos do Evento', url: '#' },
                        ].map((link, i) => (
                          <a
                            key={i}
                            href={link.url === '#' ? undefined : link.url}
                            onClick={(e) => { if(link.url === '#') { e.preventDefault(); navigate(`/em-breve/${link.name.toLowerCase().replace(/\s+/g, '-')}`); } }}
                            className="flex items-center justify-between p-3 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                          >
                            <span className="text-yellow-400 text-sm">{link.name}</span>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Contato Tab */}
              <TabsContent value="contato" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white">Contato do Evento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-400 text-sm">Responsável pelo Patrocínio</p>
                          <p className="text-white font-medium">Caio Borges</p>
                          <p className="text-gray-400 text-sm">contato@growthsummit.site</p>
                          <p className="text-gray-400 text-sm">(88) 98843-2310</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Suporte Técnico</p>
                          <p className="text-white font-medium">contato@growthsummit.site</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">WhatsApp</p>
                          <p className="text-white font-medium">(88) 98843-2310</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white">Enviar Sugestão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Assunto</label>
                          <input
                            type="text"
                            className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            placeholder="Sobre o que é sua sugestão?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Mensagem</label>
                          <textarea
                            rows={4}
                            className="w-full bg-dark-100 border border-dark-300 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                            placeholder="Descreva sua sugestão ou dúvida..."
                          />
                        </div>
                        <Button
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => toast.success('Mensagem enviada com sucesso!')}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Perfil Tab */}
              <TabsContent value="perfil" className="mt-0">
                <ProfileForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <AnimatePresence>
          {isB2BModalOpen && (
            <B2BFormModal
              isOpen={isB2BModalOpen}
              onClose={() => setIsB2BModalOpen(false)}
            />
          )}
          {isStartupModalOpen && (
            <StartupFormModal
              isOpen={isStartupModalOpen}
              onClose={() => setIsStartupModalOpen(false)}
            />
          )}
          {isScannerOpen && (
            <LeadScanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setIsScannerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
