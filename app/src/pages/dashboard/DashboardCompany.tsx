import { useState, useMemo } from 'react';
import {
  Building2,
  Handshake,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  FileText,
  LogOut,
  Sparkles,
  Heart,
  X as CloseIcon,
  Info,
  Calendar,
  HelpCircle,
  MapPin,
  User,
  Bell
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies, useB2BMeetings, useB2BSwipes, useB2BAppointmentsTriunfo, useB2BMatches, useSessions } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';
import { logger } from '@/lib/logger';
import type { B2BMeeting, B2BAppointmentTriunfo, B2BMatch } from '@/types';

export function DashboardCompany() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: companies, refetch: refetchCompanies } = useCompanies();
  const { data: meetings } = useB2BMeetings();
  const { data: swipes, create: createSwipe } = useB2BSwipes();
  const { data: appointments } = useB2BAppointmentsTriunfo();
  const { data: matches } = useB2BMatches();
  const { data: sessions } = useSessions();
  const [activeTab, setActiveTab] = useState('discovery');
  const [unreadNotifications, setUnreadNotifications] = useState(1);

  const notifications = [
    { id: 1, title: 'Combinação Localizada!', message: 'Uma nova empresa demonstrou interesse em seu perfil.', time: '10 min atrás', read: false },
    { id: 2, title: 'Rodada de Negócios', message: 'Sua agenda de reuniões para amanhã já está disponível.', time: '2 horas atrás', read: true },
  ];

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const companyData = useMemo(() =>
    companies.find(c => c.userId === user?.id),
    [companies, user?.id]
  );

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

  // Filter companies for discovery (only approved, not self, and not already swiped)
  const discoveryCompanies = useMemo(() => {
    if (!companyData) return [];
    const swipedCompanyIds = swipes
      .filter(s => s.fromCompanyId === companyData.id)
      .map(s => s.toCompanyId);

    return companies.filter(c =>
      c.id !== companyData.id &&
      c.status === 'approved' &&
      !swipedCompanyIds.includes(c.id)
    );
  }, [companies, swipes, companyData]);

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
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mr-5 shadow-lg shadow-teal-500/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">{companyData?.name || user?.name}</h1>
                <p className="text-teal-400 font-medium text-sm">
                  {companyData?.type === 'anchor' ? 'Empresa Âncora' : 'Fornecedor Qualificado'}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Empresa Validada
              </Badge>
              <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300" onClick={() => navigate('/guia')}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Acessar Manual
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative bg-white/5 hover:bg-white/10 text-gray-400 p-2 rounded-full transition-colors border border-white/10">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-brand-orange-coral rounded-full border border-dark-300"></span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-dark-200 border-white/10 p-4 rounded-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Notificações</h3>
                    <button
                      onClick={() => setUnreadNotifications(0)}
                      className="text-[10px] text-teal-400 font-bold uppercase tracking-wider"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.read ? 'bg-white/5 border-transparent' : 'bg-brand-orange-coral/5 border-brand-orange-coral/20'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-white text-xs font-bold">{n.title}</p>
                          <span className="text-[9px] text-gray-500 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-gray-400 text-[11px] mt-1 leading-tight">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-dark-200 mb-6 md:mb-10 p-1 h-auto min-h-[44px]">
            <TabsTrigger value="discovery" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
              <Sparkles className="h-4 w-4 mr-1 md:mr-2" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="reunioes" className="data-[state=active]:bg-teal-500 py-3 text-[10px] md:text-sm">
              <Handshake className="h-4 w-4 mr-1 md:mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-teal-500">
              <Heart className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="perfil" className="data-[state=active]:bg-teal-500">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="empresa" className="data-[state=active]:bg-teal-500">
              <Building2 className="h-4 w-4 mr-2" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="programacao" className="data-[state=active]:bg-teal-500">
              <Calendar className="h-4 w-4 mr-2" />
              Palestras
            </TabsTrigger>
            <TabsTrigger value="recursos" className="data-[state=active]:bg-teal-500">
              <FileText className="h-4 w-4 mr-2" />
              Materiais
            </TabsTrigger>
          </TabsList>

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

                            <Button size="sm" variant="ghost" className="text-gray-600 hover:text-white uppercase text-[10px] font-black tracking-widest">
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
                      <Button variant="outline" className="border-teal-500/30 text-teal-400 rounded-xl" onClick={() => setActiveTab('reunioes')}>
                        Ver Minha Agenda
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Agenda B2B Tab */}
          <TabsContent value="reunioes">
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
                          <Button className="bg-dark-300 hover:bg-dark-400 text-white rounded-xl">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl px-10">
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
                    <Button variant="outline" className="border-dark-300 rounded-xl text-gray-400 group-hover:text-teal-400 group-hover:border-teal-400/30">
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
                          <Button size="sm" variant="outline" className="flex-1 border-dark-300 rounded-xl">Detalhes</Button>
                          <Button size="sm" className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl">Enviar Chat</Button>
                        </div>
                      </div>
                    );
                  })}

                {matches.length === 0 && (
                  <div className="col-span-full py-16 text-center">
                    <Heart className="h-10 w-10 text-dark-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Continue swiping para encontrar conexões!</p>
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
                <Button className="bg-teal-500 hover:bg-teal-400 text-white font-black px-10 py-6 rounded-2xl">
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
                  <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white font-black py-4 rounded-xl">
                    WHATSAPP B2B
                  </Button>
                  <Button variant="outline" className="w-full border-dark-300 text-gray-400 hover:text-white rounded-xl">
                    MAPA DA ARENA
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
