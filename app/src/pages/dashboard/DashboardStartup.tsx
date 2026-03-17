import { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Star,
  QrCode,
  Download,
  MessageSquare,
  FileText,
  ExternalLink,
  Edit3,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStartups, useLeads, useNotifications } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';
import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { QuickActions } from './components/shared/QuickActions';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { LeadScanner } from './components/shared/LeadScanner';
import { useSessions, useCheckInsAtividades, useMyRegistration } from '@/hooks/useData';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';

import { exportToCSV } from '@/utils/csv';
import { supabase } from '@/lib/supabase';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { Home } from 'lucide-react';

const stageLabels: Record<string, string> = {
  idea: 'Ideia',
  mvp: 'MVP',
  traction: 'Tração',
  scale: 'Scale',
};

export function DashboardStartup() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: startups } = useStartups();
  const { data: leads, create: createLead } = useLeads();
  const { data: notificationsData } = useNotifications();
  const { data: allSessions } = useSessions();
  const { data: activityCheckIns } = useCheckInsAtividades();
  const { registration } = useMyRegistration();
  const [activeTab, setActiveTab] = useState('home');

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const startupData = startups.find(s => s.userId === user?.id);
  const startupLeads = startupData
    ? leads.filter(l => l.startupId === startupData.id)
    : [];

  const stats = {
    totalLeads: startupLeads.length,
    highInterest: startupLeads.filter(l => l.interestLevel === 'high').length,
    mediumInterest: startupLeads.filter(l => l.interestLevel === 'medium').length,
    lowInterest: startupLeads.filter(l => l.interestLevel === 'low').length,
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // O decodedText será o registration id (uuid) ou um JSON contendo o id
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

      // Procura primeiro localmente se esse lead já existe
      const alreadyScanned = startupLeads.some(l => l.registrationId === registrationId);
      if (alreadyScanned) {
        toast.info('Este participante já está na sua lista de leads.');
        return;
      }

      await createLead({
        projectId: startupData?.projectId,
        startupId: startupData?.id,
        registrationId: registrationId,
        interestLevel: 'high', // Padrão
        notes: 'Capturado via QR Code do Stand',
        visitorName: 'Participante ' + registrationId.substring(0, 4), // Placeholder genérico, será atualizado pelo hook do DB
      });

      toast.success('Lead capturado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao ler QR Code ou salvar lead');
    }
  };

  const handleDownloadQRCode = async () => {
    if (!startupData) return;
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFillColor(12, 14, 18);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('GROWTH EXPERIENCE 2026', 105, 40, { align: 'center' });
      
      doc.setFontSize(30);
      doc.setTextColor(20, 184, 166); // Teal
      doc.text(startupData.name.toUpperCase(), 105, 60, { align: 'center' });
      
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(55, 80, 100, 100, 5, 5, 'F');
      
      doc.setTextColor(12, 14, 18);
      doc.setFontSize(12);
      doc.text('ESCANEIE PARA CONHECER', 105, 195, { align: 'center' });
      
      doc.setTextColor(255, 112, 67); // Orange
      doc.setFontSize(16);
      doc.text(`STAND NO: ${startupData.standNumber || 'EXPO'}`, 105, 215, { align: 'center' });
      
      doc.save(`Stand_${startupData.name.replace(/\s+/g, '_')}_QRCode.pdf`);
      toast.success('QR Code pronto para impressão!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  const handleQuickMessage = (email: string) => {
    window.open(`mailto:${email}?subject=Conexão Growth Experience - Stand ${startupData?.name}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] relative overflow-hidden">
      <PremiumBackground />

      <div className="relative z-10 pb-24">
        <PremiumHeader
          userName={user?.name}
          projectName="GROWTH SUMMIT 2026"
          roleLabel="EXPOSITOR STARTUP"
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
            {/* Stats Grid */}
            {(activeTab === 'home' || activeTab === 'visao-geral') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="glass-card p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40 transition-all group">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Total Leads</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-white group-hover:text-orange-400 transition-colors">{stats.totalLeads}</p>
                    <Users className="h-6 w-6 text-orange-500/40" />
                  </div>
                </div>
                <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 hover:border-green-500/40 transition-all group">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Alto Interesse</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-green-400">{stats.highInterest}</p>
                    <Star className="h-6 w-6 text-green-500/40 fill-green-500/10" />
                  </div>
                </div>
                <div className="glass-card p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Interesse Médio</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-yellow-500">{stats.mediumInterest}</p>
                    <Star className="h-6 w-6 text-yellow-500/40" />
                  </div>
                </div>
                <div className="glass-card p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20 hover:border-teal-500/40 transition-all group">
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">Conversão</p>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black text-teal-400">
                      {stats.totalLeads > 0 ? Math.round((stats.highInterest / stats.totalLeads) * 100) : 0}%
                    </p>
                    <TrendingUp className="h-6 w-6 text-teal-500/40" />
                  </div>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="hidden md:grid w-full grid-cols-3 md:grid-cols-7 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
                <TabsTrigger value="home" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                   Início
                </TabsTrigger>
                <TabsTrigger value="visao-geral" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <Users className="h-4 w-4 mr-1 md:mr-2" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="stand" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <QrCode className="h-4 w-4 mr-1 md:mr-2" />
                  Stand
                </TabsTrigger>
                <TabsTrigger value="recursos" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <FileText className="h-4 w-4 mr-1 md:mr-2" />
                  Recursos
                </TabsTrigger>
                <TabsTrigger value="investidores" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <Handshake className="h-4 w-4 mr-1 md:mr-2" />
                  Investidores
                </TabsTrigger>
                <TabsTrigger value="perfil" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <UserIcon className="h-4 w-4 mr-1 md:mr-2" />
                  Perfil
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="mt-0 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PwaDashboardHero 
                    eventName="Startup Arena"
                    location="Palco Pitch"
                    date="16 ABR 2026"
                    stats={{
                        people: stats.totalLeads.toString() + "+",
                        content: startupData?.sector || "Startup",
                        activities: startupData?.standNumber || "EXPO"
                    }}
                />
                
                {nextActivity && (
                    <NextActivityCard 
                        title={nextActivity.title}
                        subtitle={nextActivity.type || "Atividade Gerada"}
                        time={nextActivity.startTime || "00:00"}
                        duration="45 min"
                        isConfirmed={activityCheckIns?.some(c => c.session_id === nextActivity.id && c.registration_id === registration?.id)}
                        onClick={() => setActiveTab('agenda')}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                     <div className="glass-card p-6 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Status Stand</p>
                        <p className="text-xl font-bold text-white">Pronto</p>
                     </div>
                     <div className="glass-card p-6 bg-gradient-to-br from-teal-500/10 to-transparent border-teal-500/20">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pitching</p>
                        <p className="text-xl font-bold text-white">Agendado</p>
                     </div>
                </div>
              </TabsContent>

              {/* Visao Geral Tab */}
              <TabsContent value="visao-geral" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Company Info */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Informações da Startup</h3>
                    {startupData && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                          <p className="text-gray-300">{startupData.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Setor</label>
                            <p className="text-white">{startupData.sector}</p>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Estágio</label>
                            <Badge className="bg-orange-500/20 text-orange-400">
                              {stageLabels[startupData.stage]}
                            </Badge>
                          </div>
                        </div>

                        {startupData.metrics && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-2">Métricas</label>
                            <div className="grid grid-cols-3 gap-2">
                              {startupData.metrics.revenue !== undefined && (
                                <div className="bg-dark-100 rounded p-2 text-center">
                                  <TrendingUp className="h-4 w-4 text-green-400 mx-auto mb-1" />
                                  <p className="text-white text-sm">R${(startupData.metrics.revenue / 1000).toFixed(0)}k</p>
                                  <p className="text-gray-500 text-xs">Receita</p>
                                </div>
                              )}
                              {startupData.metrics.users !== undefined && (
                                <div className="bg-dark-100 rounded p-2 text-center">
                                  <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                                  <p className="text-white text-sm">{startupData.metrics.users}</p>
                                  <p className="text-gray-500 text-xs">Usuários</p>
                                </div>
                              )}
                              {startupData.metrics.growth !== undefined && (
                                <div className="bg-dark-100 rounded p-2 text-center">
                                  <TrendingUp className="h-4 w-4 text-teal-400 mx-auto mb-1" />
                                  <p className="text-white text-sm">{startupData.metrics.growth}%</p>
                                  <p className="text-gray-500 text-xs">Crescimento</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Equipe</label>
                          <div className="flex flex-wrap gap-2">
                            {startupData.foundingTeam.map((member, i) => (
                              <Badge key={i} className="bg-dark-300 text-gray-300">
                                {member.name} - {member.role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white justify-start">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start" onClick={() => navigate('/guia')}>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Pitch Deck
                      </Button>
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start" onClick={() => navigate('/guia')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Material de Apoio
                      </Button>
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start" onClick={() => window.open('https://wa.me/5581999999999', '_blank')}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contatar Organização
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Leads Tab */}
              <TabsContent value="leads" className="mt-0">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Leads Capturados</h3>
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-dark-300 text-gray-300" onClick={() => setIsScannerOpen(true)}>
                        <QrCode className="h-4 w-4 mr-2" />
                        Escanear Crachá
                      </Button>
                      <Button variant="outline" className="border-dark-300 text-gray-300" onClick={() => exportToCSV(startupLeads as any, 'leads_startup')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {startupLeads.map((lead) => (
                        <div key={lead.id} className="glass-card p-5 bg-white/5 border-white/10 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
                          
                          <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                              <UserIcon className="h-5 w-5" />
                            </div>
                            <Badge className={`${
                              lead.interestLevel === 'high' ? 'bg-green-500/20 text-green-400' : 
                              'bg-yellow-500/20 text-yellow-400'
                            } border-none font-black text-[9px] uppercase`}>
                              {lead.interestLevel === 'high' ? 'Alto Interesse' : 'Médio Interesse'}
                            </Badge>
                          </div>
                          
                          <div className="relative z-10 mb-4">
                            <h4 className="text-white font-black text-base leading-tight mb-0.5 truncate">{lead.visitorName}</h4>
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
                               <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none">Data Captura</p>
                               <p className="text-[9px] text-white font-bold italic">
                                 {lead.createdAt ? `${new Date(lead.createdAt).toLocaleDateString('pt-BR')} • ${new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Recent'}
                               </p>
                             </div>
                             <Button 
                               size="sm" 
                               variant="ghost" 
                               className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 h-7 w-7 p-0 rounded-full"
                               onClick={() => {
                                 if (lead.visitorPhone) {
                                   window.open(`https://wa.me/55${lead.visitorPhone.replace(/\D/g, '')}`, '_blank');
                                 } else {
                                   handleQuickMessage(lead.visitorEmail || '');
                                 }
                               }}
                             >
                               {lead.visitorPhone ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                             </Button>
                          </div>
                        </div>
                      ))}

                    {startupLeads.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhum lead capturado ainda</p>
                        <p className="text-gray-500 text-sm mt-2">Clique em "Escanear Crachá" para capturar o primeiro lead ou peça para visitarem seu stand virtual</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stand" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6 text-center">
                    <h3 className="text-lg font-semibold text-white mb-6">QR Code do Stand</h3>
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-teal-500/20 inline-block mb-6 group">
                      <div className="bg-white p-6 rounded-xl shadow-2xl">
                        <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                          <QrCode className="h-32 w-32 text-dark" />
                        </div>
                      </div>
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-xl transition-all group-hover:w-12 group-hover:h-12"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500 rounded-br-xl transition-all group-hover:w-12 group-hover:h-12"></div>
                    </div>
                    <p className="text-gray-400 mb-2 font-medium">Capture leads automaticamente</p>
                    <p className="text-orange-400 font-black tracking-widest text-xs uppercase">Seu Stand Virtual Growth Experience</p>
                    <div className="flex justify-center space-x-3 mt-6">
                      <Button variant="outline" size="sm" className="border-dark-300 text-gray-300 hover:text-white hover:border-teal-500/50" onClick={handleDownloadQRCode}>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm" className="border-dark-300 text-gray-300 hover:text-white" onClick={() => window.print()}>
                        Imprimir
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Informações do Stand</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Número:</span>
                          <span className="text-white font-medium">{startupData?.standNumber || 'A ser definido'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Local:</span>
                          <span className="text-white">Corredor de Exposição</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Horário:</span>
                          <span className="text-white">08:00 - 21:00</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Dicas para o Stand</h3>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-teal-400 mr-2 mt-0.5" />
                          Tenha um pitch de 30 segundos pronto
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-teal-400 mr-2 mt-0.5" />
                          Prepare material impresso para distribuir
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-teal-400 mr-2 mt-0.5" />
                          Demonstre seu produto/serviço ao vivo
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-teal-400 mr-2 mt-0.5" />
                          Colete contatos usando o leitor de crachás
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Recursos Tab */}
              <TabsContent value="recursos" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Materiais da Startup</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Guia da Startup Expo', type: 'PDF' },
                        { name: 'Template de Pitch', type: 'PPT' },
                        { name: 'Checklist de Preparação', type: 'PDF' },
                        { name: 'Dicas de Networking', type: 'PDF' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-400 mr-3" />
                            <span className="text-white text-sm">{doc.name}</span>
                          </div>
                          <Badge className="bg-dark-300 text-gray-300">{doc.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Links Úteis</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Programação do Evento', url: '/agenda' },
                        { name: 'Lista de Investidores', action: () => setActiveTab('investidores') },
                        { name: 'Suporte para Startups', url: 'https://wa.me/5581999999999' },
                        { name: 'Grupo WhatsApp Startups', url: 'https://chat.whatsapp.com/ExemploGrowth' },
                      ].map((link, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (link.action) {
                              link.action();
                            } else if (link.url) {
                              if (link.url.startsWith('http')) {
                                window.open(link.url, '_blank');
                              } else {
                                navigate(link.url);
                              }
                            }
                          }}
                          className="flex items-center justify-between p-3 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors cursor-pointer"
                        >
                          <span className="text-orange-400 text-sm font-bold">{link.name}</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Investidores Tab */}
              <TabsContent value="investidores" className="mt-0">
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-black text-white italic tracking-tighter">Investidores <span className="text-orange-500">Confirmados</span></h2>
                     <Badge className="bg-orange-500/10 text-orange-500 border-none font-black text-[10px] tracking-widest px-4 py-2 uppercase">Match Making</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[
                       { name: 'Venture Capital Nordeste', stage: 'Seed / Series A', sector: 'Generalista', logo: 'VC' },
                       { name: 'Angel Investor Group', stage: 'Pre-seed', sector: 'SaaS / Fintech', logo: 'AI' },
                       { name: 'Inova Capital', stage: 'Series A', sector: 'Agrotech / Health', logo: 'IC' },
                       { name: 'Growth Ventures', stage: 'Seed', sector: 'Martech / Retail', logo: 'GV' },
                     ].map((inv, i) => (
                       <div key={i} className="group p-6 bg-dark-100 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center font-black text-orange-500 text-lg">
                              {inv.logo}
                            </div>
                            <div>
                              <p className="text-white font-black uppercase text-sm">{inv.name}</p>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{inv.stage}</p>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <div className="bg-dark-200 p-4 rounded-2xl border border-white/5">
                              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Foco Principal</p>
                              <p className="text-white text-xs font-bold">{inv.sector}</p>
                            </div>
                            <Button className="w-full bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 font-black text-[10px] tracking-widest py-3 rounded-xl transition-all">
                              SOLICITAR REUNIÃO
                            </Button>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              </TabsContent>

              {/* Perfil Tab */}
              <TabsContent value="perfil" className="mt-0">
                <ProfileForm />
              </TabsContent>
            </Tabs>
          </div>
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
      <BottomNavigation
        variant="orange"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'visao-geral', icon: TrendingUp, label: 'Visão' },
          { id: 'leads', icon: Users, label: 'Leads' },
          { id: 'stand', icon: QrCode, label: 'Stand' },
          { id: 'recursos', icon: FileText, label: 'Docs' },
          { id: 'perfil', icon: UserIcon, label: 'Perfil' },
        ]}
      />
    </div>
  );
}
