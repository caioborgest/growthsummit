import { useState, useMemo } from 'react';
import {
  Building2,
  Handshake,
  TrendingUp,
  MessageSquare,
  FileText,
  Sparkles,
  Heart,
  X as CloseIcon,
  Info,
  Calendar,
  MapPin,
  User,
  Users,
  QrCode,
  Download,
  Star,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { exportToCSV } from '@/utils/csv';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies, useB2BDiscoveryCompanies, useB2BMeetings, useB2BSwipes, useB2BAppointmentsTriunfo, useB2BMatches, useSessions, useNotifications, useCheckInsAtividades, useMyRegistration, useLeads } from '@/hooks/useData';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { ProfileForm } from './components/ProfileForm';
import { QuickActions } from './components/shared/QuickActions';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { B2BScheduleModal } from './components/B2BScheduleModal';
import { B2BChatModal } from './components/B2BChatModal';
import { LeadScanner } from './components/shared/LeadScanner';
import type { B2BMatch, Company, B2BMeeting, B2BAppointmentTriunfo } from '@/types';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export function DashboardCompany() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: companies, refetch: refetchCompanies } = useCompanies();
  const { data: discoveryCompaniesRaw, refetch: refetchDiscovery } = useB2BDiscoveryCompanies();
  const { data: meetings } = useB2BMeetings();
  const { data: notificationsData } = useNotifications();

  const notifications = useMemo(() =>
    (notificationsData || []).filter((n: { userId?: string }) => n.userId === user?.id),
    [notificationsData, user?.id]
  );

  const handleMarkAsRead = async (id: string) => {
    if (!id) return;
    await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', id);
  };
  const { data: swipes, create: createSwipe } = useB2BSwipes();
  const { data: appointments } = useB2BAppointmentsTriunfo();
  const { data: matches } = useB2BMatches();
  const { data: sessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { registration } = useMyRegistration();
  const { data: leads, create: createLead } = useLeads();
  const [activeTab, setActiveTab] = useState('home');

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{ match: B2BMatch, otherCompany: Company } | null>(null);

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const companyData = useMemo(() =>
    companies.find(c => c.userId === user?.id),
    [companies, user?.id]
  );

  const handleScanSuccess = async (decodedText: string) => {
    try {
      let registrationId = decodedText;
      
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

      const alreadyScanned = companyLeads.some(l => l.registrationId === registrationId);
      if (alreadyScanned) {
        toast.info('Este participante já está na sua lista de leads.');
        return;
      }

      await createLead({
        projectId: companyData?.projectId,
        companyId: companyData?.id,
        registrationId: registrationId,
        interestLevel: 'high',
        notes: 'Capturado via QR Code na Rodada B2B',
        visitorName: 'Participante ' + registrationId.substring(0, 4),
      });

      toast.success('Lead capturado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao ler QR Code ou salvar lead');
    }
  };

  const companyMeetings = useMemo(() =>
    companyData
      ? ([...meetings, ...appointments] as (B2BMeeting | B2BAppointmentTriunfo)[]).filter(m => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const am = m as any;
        return (am.companyAnchorId === companyData.id || am.companyVendorId === companyData.id) ||
          (am.companyAId === companyData.id || am.companyBId === companyData.id);
      })
      : [],
    [meetings, appointments, companyData]
  );
  
  const companyLeads = useMemo(() => 
    companyData 
      ? leads.filter(l => l.companyId === companyData.id) 
      : [],
    [leads, companyData]
  );

  const nextActivity = useMemo(() => {
    if (!sessions || !activityCheckIns) return null;
    const sorted = [...sessions].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return sorted.find(s => {
      const isAlreadyCheckedIn = activityCheckIns?.some(c => c.session_id === s.id && c.registration_id === registration?.id);
      return !isAlreadyCheckedIn && (s.startTime || '00:00') >= currentTimeStr;
    }) || sorted[0];
  }, [sessions, activityCheckIns, registration?.id]);

  // Discovery: RPC retorna empresas sem dados sensíveis. Filtra self e já swiped.
  const discoveryCompanies = useMemo(() => {
    if (!companyData) return [];
    const swipedCompanyIds = swipes
      .filter(s => s.fromCompanyId === companyData.id)
      .map(s => s.toCompanyId);

    return (discoveryCompaniesRaw || []).filter(c =>
      c.id !== companyData.id && !swipedCompanyIds.includes(c.id)
    );
  }, [discoveryCompaniesRaw, swipes, companyData]);

  const stats = {
    total: companyMeetings.length,
    scheduled: companyMeetings.filter(m => m.status === 'scheduled').length,
    matches: matches.filter(m => m.companyAId === companyData?.id || m.companyBId === companyData?.id).length,
    highInterest: companyMeetings.filter(m => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const am = m as any;
      return am.interestLevel === 'high' || am.matchId;
    }).length,
  };

  const handleSwipe = async (targetCompanyId: string, direction: 'like' | 'dislike') => {
    if (!companyData) return;

    setSwipeDirection(direction === 'like' ? 'right' : 'left');

    try {
      await createSwipe({
        fromCompanyId: companyData.id,
        toCompanyId: targetCompanyId,
        status: direction,
        projectId: companyData.projectId
      });

      setTimeout(() => {
        setSwipeDirection(null);
        refetchCompanies();
        refetchDiscovery();
      }, 300);
    } catch (err) {
      logger.error('Erro ao registrar swipe:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] relative overflow-hidden">
      <PremiumBackground />

      <div className="relative z-10 pb-24">
        <PremiumHeader
          userName={user?.name}
          projectName="GROWTH SUMMIT 2026"
          roleLabel="REPRESENTANTE B2B"
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

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="glass-card p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-all group">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Empresas no Radar</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white group-hover:text-teal-400 transition-colors">{discoveryCompanies.length}</p>
                  <Sparkles className="h-6 w-6 text-teal-500/40 animate-pulse" />
                </div>
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20 hover:border-pink-500/40 transition-all group">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Seus Matches</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white group-hover:text-pink-400 transition-colors">{stats.matches}</p>
                  <Heart className="h-6 w-6 text-pink-500/40 fill-pink-500/10" />
                </div>
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Reuniões Agendadas</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{stats.scheduled}</p>
                  <Calendar className="h-6 w-6 text-blue-500/40" />
                </div>
              </div>
              <div className="glass-card p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Oportunidades</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black text-white group-hover:text-orange-400 transition-colors">{stats.highInterest}</p>
                  <TrendingUp className="h-6 w-6 text-orange-500/40" />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-9 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
                  <TabsTrigger value="home" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    Início
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="discovery" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <Sparkles className="h-4 w-4 mr-1 md:mr-2" />
                    Explorar
                  </TabsTrigger>
                  <TabsTrigger value="matches" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <Heart className="h-4 w-4 mr-1 md:mr-2" />
                    Conexões
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                    <Users className="h-4 w-4 mr-1 md:mr-2" />
                    Leads
                  </TabsTrigger>
                  <TabsTrigger value="agenda" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <Handshake className="h-4 w-4 mr-1 md:mr-2" />
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger value="programacao" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <Calendar className="h-4 w-4 mr-1 md:mr-2" />
                    Programação
                  </TabsTrigger>
                  <TabsTrigger value="empresa" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <Building2 className="h-4 w-4 mr-1 md:mr-2" />
                    Empresa
                  </TabsTrigger>
                  <TabsTrigger value="perfil" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
                    <User className="h-4 w-4 mr-1 md:mr-2" />
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
                          people: discoveryCompanies.length.toString() + "+",
                          content: stats.matches.toString() + " Matches",
                          activities: stats.scheduled.toString() + " Reuniões"
                      }}
                  />
                  
                  {nextActivity && (
                      <NextActivityCard 
                          title={nextActivity.title}
                          subtitle={nextActivity.type || "B2B Session"}
                          time={nextActivity.startTime || "00:00"}
                          duration="15 min"
                          isConfirmed={activityCheckIns?.some(c => c.session_id === nextActivity.id && c.registration_id === registration?.id)}
                          onClick={() => setActiveTab('programacao')}
                      />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                       <div className="glass-card p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Status B2B</p>
                          <p className="text-xl font-bold text-white">Ativo</p>
                       </div>
                       <div className="glass-card p-6 bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Próxima Reunião</p>
                          <p className="text-xl font-bold text-white">
                              {companyMeetings[0] ? new Date(companyMeetings[0].scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'}
                          </p>
                       </div>
                  </div>
                </TabsContent>

                {/* Discovery Tab */}
                <TabsContent value="discovery">
                  <div className="flex flex-col items-center justify-center py-4 md:py-6">
                    <div className="max-w-md w-full relative h-[480px] md:h-[520px]">
                      <AnimatePresence mode="popLayout">
                        {discoveryCompanies.length > 0 ? (
                          discoveryCompanies.slice(0, 1).map((company) => (
                            <motion.div
                              key={company.id}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                                rotate: swipeDirection === 'right' ? 25 : swipeDirection === 'left' ? -25 : 0
                              }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.4, type: 'spring', damping: 20 }}
                              className="absolute inset-0 bg-dark-200 rounded-[2rem] border border-dark-300 shadow-2xl overflow-hidden flex flex-col group"
                            >
                              <div className="h-72 bg-gradient-to-b from-teal-500/20 to-transparent flex items-center justify-center p-12 relative">
                                {company.logoUrl ? (
                                  <img src={company.logoUrl} alt={company.name} className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-2xl" />
                                ) : (
                                  <div className="w-32 h-32 rounded-3xl bg-dark-300 flex items-center justify-center border-2 border-dashed border-teal-500/20">
                                    <Building2 className="h-16 w-16 text-teal-400 opacity-20" />
                                  </div>
                                )}
                                <div className="absolute top-6 right-6">
                                  <Badge className="bg-teal-500 text-white border-none font-black px-4 py-1 rounded-full shadow-lg">
                                    {company.sector}
                                  </Badge>
                                </div>
                              </div>

                              <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-3xl font-black text-white mb-2">{company.name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                  <Badge variant="outline" className="text-teal-400 border-teal-500/30 bg-teal-500/5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                                    {company.tipoInteresse === 'comprar' ? 'Busca Fornecedores' :
                                      company.tipoInteresse === 'vender' ? 'Oferece Soluções' : 'Parcerias'}
                                  </Badge>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 italic mb-8 border-l-2 border-teal-500/30 pl-4">
                                  "{company.description}"
                                </p>

                                <div className="mt-auto flex justify-between items-center px-2">
                                  <button
                                    onClick={() => handleSwipe(company.id, 'dislike')}
                                    className="h-16 w-16 rounded-full bg-dark-300 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all border border-dark-400 flex items-center justify-center hover:scale-110 active:scale-95 shadow-xl"
                                  >
                                    <CloseIcon className="h-8 w-8" />
                                  </button>

                                  <Button size="sm" variant="ghost" className="text-gray-600 hover:text-white uppercase text-[10px] font-black tracking-widest" onClick={() => navigate('/em-breve/perfil-empresa')}>
                                    <Info className="h-4 w-4 mr-2" />
                                    Ver Perfil
                                  </Button>

                                  <button
                                    onClick={() => handleSwipe(company.id, 'like')}
                                    className="h-20 w-20 rounded-full bg-teal-500 hover:bg-teal-400 text-white shadow-2xl shadow-teal-500/40 transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                                  >
                                    <Heart className="h-10 w-10 fill-current" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-dark-200/50 rounded-[2rem] border-2 border-dashed border-dark-300">
                            <div className="w-20 h-20 rounded-full bg-dark-200 flex items-center justify-center mb-6">
                              <Sparkles className="h-10 w-10 text-teal-500/20" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">Discovery Concluído</h3>
                            <p className="text-gray-500 mb-8 max-w-[240px]">Você já visualizou todas as empresas disponíveis para este evento.</p>
                            <Button variant="outline" className="border-teal-500/30 text-teal-400 rounded-xl" onClick={() => setActiveTab('agenda')}>
                              Ver Minha Agenda
                            </Button>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TabsContent>

                {/* Agenda B2B Tab */}
                <TabsContent value="agenda">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <Handshake className="h-6 w-6 mr-3 text-teal-400" />
                        Sessões de Negócios Agendadas
                      </h2>
                      <Badge className="bg-dark-300 text-gray-400 border-none font-bold">Slot: 15min</Badge>
                    </div>

                    <div className="grid gap-4">
                      {companyMeetings.length > 0 ? companyMeetings.map((meeting: B2BMeeting | B2BAppointmentTriunfo) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const m = meeting as any;
                        const otherId = m.companyAId === companyData?.id ? m.companyBId : (m.companyBId || m.companyVendorId || m.companyAnchorId);
                        const other = companies.find(c => c.id === otherId);

                        return (
                          <div key={meeting.id} className="glass-card p-6 border-l-4 border-teal-500 bg-dark-100 hover:bg-dark-200 transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                              <div className="lg:w-32 border-r border-dark-300 lg:pr-6">
                                <p className="text-teal-400 font-black text-2xl">
                                  {new Date(meeting.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-tighter">
                                  {new Date(meeting.scheduledAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="flex-1 flex items-center">
                                <div className="w-14 h-14 rounded-xl bg-dark-300 p-2 mr-6 border border-dark-400">
                                  {other?.logoUrl ? <img src={other.logoUrl} className="w-full h-full object-contain" /> : <Building2 className="text-gray-600 w-full h-full" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="text-white font-black text-xl">{other?.name || 'Parceiro Estratégico'}</p>
                                    <Badge variant="outline" className="text-[10px] border-dark-300 text-gray-500 font-bold">Mesa {m.tableNumber || '00'}</Badge>
                                  </div>
                                  <p className="text-gray-500 text-sm font-medium">{other?.sector || 'Setor Industrial'}</p>
                                </div>
                              </div>
                              <div className="flex gap-3">
                                <Button className="bg-dark-300 hover:bg-dark-400 text-white rounded-xl" onClick={() => navigate('/em-breve/chat-b2b')}>
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-10" onClick={() => toast.success('Presença Confirmada!')}>
                                  Confirmar
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="glass-card p-20 text-center border-dashed border-2 border-dark-300 rounded-[2rem]">
                          <Handshake className="h-16 w-16 text-dark-300 mx-auto mb-6" />
                          <h3 className="text-xl font-bold text-white mb-2">Agenda em Processamento</h3>
                          <p className="text-gray-500 max-w-sm mx-auto">Sua agenda será gerada 24h antes do evento baseada nos seus matches confirmados.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Programação Geral Tab */}
                <TabsContent value="programacao">
                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-xl font-bold text-white flex items-center">
                        <Calendar className="h-6 w-6 mr-3 text-teal-400" />
                        Palestras e Workshops
                      </h2>
                      <p className="text-gray-500 text-sm font-medium">Acesso full incluso no seu pacote B2B</p>
                    </div>

                    <div className="space-y-4">
                      {sessions.length > 0 ? sessions.filter(s => (s.type as string) !== 'mentoring').map((session, i) => (
                        <div key={i} className="flex items-center p-5 bg-dark-100/50 rounded-2xl border border-dark-300 group hover:border-teal-500/20 transition-all">
                          <div className="w-24 text-center">
                            <p className="text-teal-400 font-black text-xl">{session.startTime}</p>
                            <Badge className="bg-dark-200 text-gray-500 text-[9px] border-none font-black uppercase">Palco {session.room || 'A'}</Badge>
                          </div>
                          <div className="flex-1 ml-6 border-l border-dark-200 pl-8">
                            <p className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-teal-400 transition-colors">{session.title}</p>
                            <div className="flex items-center gap-4">
                              <Badge className="bg-teal-500/10 text-teal-400 border-none px-2 py-0 text-[10px] font-black uppercase tracking-widest">{session.type}</Badge>
                              <span className="text-gray-600 text-xs flex items-center font-bold">
                                <MapPin className="h-3 w-3 mr-1" />
                                Arena Triunfo
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" className="border-dark-300 rounded-xl text-gray-400 group-hover:text-teal-400 group-hover:border-teal-400/30" onClick={() => navigate('/em-breve/reserva-lugar')}>
                            Reservar Lugar
                          </Button>
                        </div>
                      )) : (
                        <div className="text-center py-20 bg-dark-100 rounded-3xl border border-dark-300">
                          <p className="text-gray-600 italic">Programação diária em breve...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Matches Tab (Review) */}
                <TabsContent value="matches">
                  <div className="glass-card p-8">
                    <h2 className="text-xl font-bold text-white mb-8">Empresas Conectadas</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {matches
                        .filter(m => m.companyAId === companyData?.id || m.companyBId === companyData?.id)
                        .map((match: B2BMatch) => {
                          const otherId = match.companyAId === companyData?.id ? match.companyBId : match.companyAId;
                          const other = companies.find(c => c.id === otherId);
                          if (!other) return null;
                          return (
                            <div key={match.id} className="p-6 bg-dark-100 rounded-2xl border border-teal-500/10 flex flex-col">
                              <div className="flex items-center mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-dark-300 p-2 mr-4 border border-dark-400/50">
                                  {other.logoUrl ? <img src={other.logoUrl} className="w-full h-full object-contain" /> : <Building2 className="text-teal-400/20 w-8 h-8 m-auto" />}
                                </div>
                                <div>
                                  <p className="text-white font-black text-lg leading-tight">{other.name}</p>
                                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{other.sector}</p>
                                </div>
                              </div>
                              <div className="mt-auto pt-6 border-t border-dark-300/50 flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1 border-dark-300 rounded-xl whitespace-nowrap px-1" onClick={() => navigate('/em-breve/detalhes-match')}>Detalhes</Button>
                                {match.status === 'scheduled' ? (
                                  <Button size="sm" className="flex-1 bg-dark-300 text-gray-400 font-bold rounded-xl cursor-not-allowed whitespace-nowrap px-1" disabled>
                                    Agendado
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl whitespace-nowrap px-1"
                                    onClick={() => {
                                      setSelectedMatch({ match, otherCompany: other });
                                      setScheduleModalOpen(true);
                                    }}
                                  >
                                    Agendar
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl"
                                  onClick={() => {
                                    setSelectedMatch({ match, otherCompany: other });
                                    setChatModalOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                      {matches.filter((m: B2BMatch) => m.companyAId === companyData?.id || m.companyBId === companyData?.id).length === 0 && (
                        <div className="col-span-full py-16 text-center">
                          <Heart className="h-10 w-10 text-dark-300 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">Continue swiping para encontrar conexões!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Leads Tab */}
                <TabsContent value="leads">
                  <div className="glass-card p-6 border-orange-500/20 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Leads do Stand</h3>
                        <p className="text-gray-500 text-xs font-medium">Participantes que realizaram check-in no seu stand ou foram capturados via QR Code.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="bg-teal-500 hover:bg-teal-400 text-white font-black px-6 h-12 rounded-2xl shadow-glow-teal"
                          onClick={() => setIsScannerOpen(true)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          ESCANEAR LEAD
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full md:w-auto border-white/10 text-gray-300 hover:text-white hover:bg-white/5 h-12 rounded-2xl" 
                          onClick={() => exportToCSV(companyLeads as any, `leads_expositor_${companyData?.name.replace(/\s+/g, '_')}`)}
                          disabled={companyLeads.length === 0}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar Planilha
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {companyLeads.map((lead) => (
                        <div key={lead.id} className="glass-card p-5 bg-white/5 border-white/10 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
                          
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                              <User className="h-6 w-6" />
                            </div>
                            <Badge className="bg-green-500/20 text-green-400 border-none font-black text-[10px]">
                              CHECK-IN REALIZADO
                            </Badge>
                          </div>
                          
                          <div className="relative z-10 mb-4">
                            <h4 className="text-white font-black text-lg leading-tight mb-0.5 truncate">{lead.visitorName}</h4>
                            <p className="text-gray-400 text-[10px] font-medium truncate mb-1">{lead.visitorEmail || 'Email não disponível'}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {lead.visitorPhone && (
                                <Badge variant="outline" className="border-white/5 text-[9px] text-gray-500 font-bold px-2 py-0">
                                  {lead.visitorPhone}
                                </Badge>
                              )}
                              {lead.visitorCpf && (
                                <Badge variant="outline" className="border-white/5 text-[9px] text-gray-500 font-bold px-2 py-0">
                                  CPF: {lead.visitorCpf}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                             <div className="flex flex-col gap-0.5">
                               <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest leading-none">Data do Check-in</p>
                               <p className="text-[10px] text-white font-black italic">
                                 {new Date(lead.createdAt).toLocaleDateString('pt-BR')} • {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                               </p>
                             </div>
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 h-8 w-8 p-0 rounded-full"
                               onClick={() => {
                                 if (lead.visitorPhone) {
                                   window.open(`https://wa.me/55${lead.visitorPhone.replace(/\D/g, '')}`, '_blank');
                                 } else {
                                   window.open(`mailto:${lead.visitorEmail}`, '_blank');
                                 }
                               }}
                             >
                               {lead.visitorPhone ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                             </Button>
                          </div>
                        </div>
                      ))}

                      {companyLeads.length === 0 && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Users className="h-10 w-10 text-gray-600" />
                          </div>
                          <h3 className="text-white font-black text-xl italic uppercase tracking-tighter">Nenhum lead capturado</h3>
                          <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2 font-medium leading-relaxed">
                            Os dados dos visitantes aparecerão aqui em tempo real assim que eles escanearem o QR Code no seu stand.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Perfil Tab */}
                <TabsContent value="perfil">
                  <ProfileForm />
                </TabsContent>

                {/* Empresa Tab */}
                <TabsContent value="empresa">
                  <div className="glass-card p-10 max-w-4xl text-left">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-2xl font-black text-white">Configurações da Empresa</h2>
                      <Button className="bg-teal-500 hover:bg-teal-400 text-white font-black px-10 py-6 rounded-2xl" onClick={() => navigate('/em-breve/atualizar-dados-empresa')}>
                        ATUALIZAR DADOS
                      </Button>
                    </div>

                    {companyData ? (
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nome Fantasia</label>
                            <div className="bg-dark-100 rounded-2xl p-4 text-white font-bold border border-dark-300">{companyData.name}</div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Setor de Atuação</label>
                            <div className="bg-dark-100 rounded-2xl p-4 text-white font-bold border border-dark-300">{companyData.sector}</div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Representante Legal</label>
                            <div className="bg-dark-100 rounded-2xl p-4 text-white font-bold border border-dark-300">{companyData.contactName || user?.name}</div>
                          </div>
                        </div>
                        <div className="space-y-6 text-center">
                          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 mb-2 block">Branding (Logo Público)</label>
                          <div className="w-48 h-48 rounded-[2rem] bg-dark-100 border-2 border-dashed border-teal-500/20 flex items-center justify-center mx-auto overflow-hidden">
                            {companyData.logoUrl ? (
                              <img src={companyData.logoUrl} className="w-full h-full object-contain p-6" />
                            ) : (
                              <Building2 className="h-12 w-12 text-teal-400/20" />
                            )}
                          </div>
                          <p className="text-gray-500 text-[10px] px-8">Este logo é exibido para outras empresas na seção Discovery.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center">
                        <p className="text-gray-500 italic">Carregando dados estruturais...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Recursos Tab */}
                <TabsContent value="recursos">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="glass-card p-10">
                      <h3 className="text-xl font-black text-white mb-8 border-b border-dark-300 pb-4">Central de Downloads</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Guia de Pitch B2B', type: 'PDF' },
                          { name: 'Manual de Governança', type: 'DOCX' },
                          { name: 'Logística do Evento', type: 'PDF' }
                        ].map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-5 bg-dark-100 rounded-2xl group cursor-pointer hover:bg-teal-500/5 transition-all">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-teal-400 mr-4" />
                              <span className="text-white font-bold">{doc.name}</span>
                            </div>
                            <Badge className="bg-dark-200 text-gray-500 border-none group-hover:bg-teal-500 group-hover:text-white transition-colors">{doc.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-10 bg-teal-500/5 border-teal-500/20">
                      <h3 className="text-xl font-black text-white mb-6">Suporte Estratégico</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-10">Tire suas dúvidas diretamente com os organizadores da Rodada de Negócios via canal exclusivo.</p>
                      <div className="space-y-4">
                        <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-xl" onClick={() => navigate('/em-breve/suporte-whatsapp')}>
                          WHATSAPP B2B
                        </Button>
                        <Button variant="outline" className="w-full border-dark-300 text-gray-400 hover:text-white rounded-xl" onClick={() => navigate('/em-breve/mapa-interativo')}>
                          MAPA DA ARENA
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isScannerOpen && (
            <LeadScanner
              isOpen={isScannerOpen}
              onClose={() => setIsScannerOpen(false)}
              onScanSuccess={handleScanSuccess}
            />
          )}
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
          {scheduleModalOpen && selectedMatch && (
            <B2BScheduleModal
              isOpen={scheduleModalOpen}
              onClose={() => {
                setScheduleModalOpen(false);
                setSelectedMatch(null);
                refetchCompanies();
              }}
              match={selectedMatch.match}
              otherCompany={selectedMatch.otherCompany}
              currentCompanyId={companyData?.id || ''}
            />
          )}
        </AnimatePresence>
        {selectedMatch && (
          <B2BChatModal
            isOpen={chatModalOpen}
            onClose={() => setChatModalOpen(false)}
            matchId={selectedMatch.match.id}
            otherCompany={selectedMatch.otherCompany}
          />
        )}
      </div>
          )}
        </AnimatePresence>
        <BottomNavigation
          variant="teal"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={[
            { id: 'home', icon: Home, label: 'Início' },
            { id: 'discovery', icon: Sparkles, label: 'B2B' },
            { id: 'agenda', icon: Handshake, label: 'Agenda' },
            { id: 'leads', icon: Users, label: 'Leads' },
            { id: 'programacao', icon: Calendar, label: 'Tracks' },
            { id: 'perfil', icon: User, label: 'Perfil' },
          ]}
        />
    </div>
  );
}
