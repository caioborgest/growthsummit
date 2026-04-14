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
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSponsors, useLeads, useNotifications, useSessions, useCheckInsAtividades, useSponsorDeliverables } from '@/hooks/useData';
import { useMyRegistration } from '@/hooks/useMyRegistration';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { useAuth } from '@/contexts/AuthContext';
import { EVENT_CONFIG } from '@/config/eventConfig';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileForm } from './components/ProfileForm';
import { User as UserIcon } from 'lucide-react';
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { Home } from 'lucide-react';
import { QuickActions } from './components/shared/QuickActions';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { LeadScanner } from './components/shared/LeadScanner';
import { exportToCSV } from '@/utils/csv';
import { supabase } from '@/lib/supabase';
import { PageLoader } from '@/components/ui/PageLoader';
import { logger } from '@/lib/logger';

/**
 * Gatekeeper component for Sponsor Dashboard.
 */
export function DashboardSponsor() {
  const { user, logout } = useAuth();
  const { data: sponsors, isLoading: isLoadingSponsors } = useSponsors();
  const { registration, isLoading: isLoadingReg } = useMyRegistration();
  const navigate = useNavigate();

  const isLoading = isLoadingSponsors || isLoadingReg;

  // 1. Loading Guard
  if (isLoading) {
    return <PageLoader />;
  }

  // 2. Data/Role Guard
  const sponsorData = sponsors.find(s => s.userId === user?.id);
  if (!user || !registration || !sponsorData) {
    return (
      <div className="min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center p-6 text-center">
        <PremiumBackground />
        <div className="relative z-10 glass-card p-8 max-w-md border-yellow-500/20">
          <Gem className="h-16 w-16 text-yellow-500 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-black text-white mb-4 italic uppercase tracking-tight">Acesso Não Localizado</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Não identificamos um Patrocinador vinculado à sua conta de participante para este projeto.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold h-12 rounded-xl"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-white"
              onClick={() => { logout(); navigate('/login'); }}
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SponsorView 
      user={user} 
      registration={registration} 
      sponsorData={sponsorData} 
      logout={logout} 
    />
  );
}

/**
 * Presentation component for Sponsor Dashboard.
 */
function SponsorView({ user, registration, sponsorData, logout }: any) {
  const navigate = useNavigate();
  const { data: notificationsData } = useNotifications();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
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
      const isAlreadyCheckedIn = activityCheckIns?.some(c => c.sessionId === s.id && c.registrationId === registration?.id);
      return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0];
  }, [allSessions, activityCheckIns, registration?.id]);

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    await (supabase.from('notifications') as any)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);
  };

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);

  const { data: deliverablesData } = useSponsorDeliverables(sponsorData?.id);
  const deliverables = useMemo(() => deliverablesData || [], [deliverablesData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: leads, create: createLead } = useLeads();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const sponsorLeads = useMemo(() => {
    return leads.filter(l => l.sponsorId === sponsorData.id);
  }, [leads, sponsorData.id]);

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
      if (!decodedText) return;
      let registrationId = decodedText;

      if (decodedText.startsWith('GE - CHECKIN') || decodedText.startsWith('GE-CHECKIN')) {
        const parts = decodedText.split('|');
        if (parts.length > 1) {
          registrationId = parts[1].trim();
        }
      } else if (decodedText.startsWith('{')) {
        try {
          const data = JSON.parse(decodedText);
          registrationId = data.id || data.registrationId;
        } catch (e) {
          logger.error('Erro ao parsear JSON do Scanner (Sponsor):', e);
        }
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
        notes: 'Capturado via QR Code do Stand (Patrocinador)',
        visitorName: 'Participante ' + registrationId.substring(0, 4),
      });

      toast.success('Lead capturado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao ler QR Code ou salvar lead');
    }
  };

  const stats = useMemo(() => ({
    totalDeliverables: deliverables.length,
    completed: deliverables.filter((d: any) => d.status === 'completed').length,
    inProgress: deliverables.filter((d: any) => d.status === 'in_progress').length,
    pending: deliverables.filter((d: any) => d.status === 'pending').length,
  }), [deliverables]);

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
          projectName="GROWTH EXPERIENCE 2026"
          roleLabel="PATROCINADOR"
          isPro={true}
          notifications={notifications}
          onLogout={handleLogout}
          onGuideClick={() => navigate('/guia')}
          onSupportClick={() => setActiveTab('contato')}
          onNotificationRead={handleMarkAsRead}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 md:pb-8">
          <QuickActions
            onB2BClick={() => setIsB2BModalOpen(true)}
            onStartupClick={() => setIsStartupModalOpen(true)}
          />

          <div className="py-8">
            {(activeTab === 'home' || activeTab === 'overview') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
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
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden md:grid w-full grid-cols-2 md:grid-cols-8 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
                <TabsTrigger value="home" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm">Início</TabsTrigger>
                <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><Gem className="h-4 w-4 mr-1 md:mr-2" />Visão Geral</TabsTrigger>
                <TabsTrigger value="deliverables" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><FileCheck className="h-4 w-4 mr-1 md:mr-2" />Entregáveis</TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><Users className="h-4 w-4 mr-1 md:mr-2" />Leads</TabsTrigger>
                <TabsTrigger value="programacao" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><Calendar className="h-4 w-4 mr-1 md:mr-2" />Agenda</TabsTrigger>
                <TabsTrigger value="materiais" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><Download className="h-4 w-4 mr-1 md:mr-2" />Materiais</TabsTrigger>
                <TabsTrigger value="contato" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><MessageSquare className="h-4 w-4 mr-1 md:mr-2" />Contato</TabsTrigger>
                <TabsTrigger value="perfil" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white py-3 text-xs md:text-sm"><UserIcon className="h-4 w-4 mr-1 md:mr-2" />Perfil</TabsTrigger>
              </TabsList>
              <TabsContent value="home" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PwaDashboardHero 
                    eventName="Área do Patrocinador"
                    location="Exposição VIP"
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
                        isConfirmed={activityCheckIns?.some(c => c.sessionId === nextActivity.id && c.registrationId === registration?.id)}
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

              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
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
                                <p className="text-gray-400 text-sm">
                                  Prazo: {deliverable.deadline ? new Date(deliverable.deadline).toLocaleDateString('pt-BR') : 'A definir'}
                                </p>
                                {deliverable.notes && (
                                  <p className="text-gray-500 text-xs mt-1">{deliverable.notes}</p>
                                )}
                              </div>
                              {getStatusBadge(deliverable.status)}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

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
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Prazo: {deliverable.deadline ? new Date(deliverable.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                              </span>
                              {deliverable.completedAt && (
                                <span className="flex items-center text-green-400">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Concluído: {new Date(deliverable.completedAt).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {deliverable.status !== 'completed' && (
                              <Button size="sm" variant="outline" className="border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10">
                                <Upload className="h-3 w-3 mr-1" />
                                Enviar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
                              Capturado em: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          lead.interestLevel === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                          lead.interestLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                          'bg-gray-500/20 text-gray-400 border-white/5'
                        }>
                          {(lead.interestLevel || 'low').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 text-gray-400">
                          <Mail className="h-4 w-4 text-yellow-500/50" />
                          <span className="text-sm truncate">{lead.visitorEmail || 'Sem email'}</span>
                        </div>
                        {lead.visitorPhone && (
                          <div className="flex items-center gap-3 text-gray-400">
                            <Phone className="h-4 w-4 text-yellow-500/50" />
                            <span className="text-sm">{lead.visitorPhone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                        <Button 
                          variant="outline" 
                          className="flex-1 h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest"
                          onClick={() => lead.visitorPhone && window.open(`https://wa.me/55${lead.visitorPhone.replace(/\D/g, '')}`)}
                          disabled={!lead.visitorPhone}
                        >
                          WhatsApp
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 h-10 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest"
                          onClick={() => window.open(`mailto:${lead.visitorEmail}`)}
                          disabled={!lead.visitorEmail}
                        >
                          E-mail
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="programacao" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-teal-400" />
                        Programação do Evento
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="materiais" className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <FileText className="h-5 w-5 mr-2 text-blue-400" />
                        Documentos
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <FileText className="h-5 w-5 mr-2 text-teal-400" />
                        Templates
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center text-base">
                        <ExternalLink className="h-5 w-5 mr-2 text-orange-400" />
                        Links Úteis
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contato" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white">Contato do Evento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">E-mail de Suporte</p>
                            <p className="text-white font-bold">{EVENT_CONFIG.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">WhatsApp</p>
                            <button 
                              onClick={() => window.open(`https://wa.me/${EVENT_CONFIG.whatsapp.number}`, '_blank')}
                              className="text-white font-bold hover:text-yellow-400 transition-colors"
                            >
                              {EVENT_CONFIG.whatsapp.display}
                            </button>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Responsável Interno</p>
                          <p className="text-white font-bold">Caio Borges</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-dark-200 border-dark-300">
                    <CardHeader>
                      <CardTitle className="text-white">Enviar Sugestão</CardTitle>
                    </CardHeader>
                      <form className="space-y-4 custom-scrollbar">
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
           onClose={() => setIsScannerOpen(false)} 
           onScanSuccess={handleScanSuccess} 
         />
       )}
        </AnimatePresence>
      </div>
      <BottomNavigation
        variant="orange"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'deliverables', icon: FileCheck, label: 'Entregáveis' },
          { id: 'leads', icon: Users, label: 'Leads' },
          { id: 'feedback', icon: MessageSquare, label: 'Suporte' },
          { id: 'perfil', icon: UserIcon, label: 'Perfil' },
        ]}
      />
    </div>
  );
}

export default DashboardSponsor;
