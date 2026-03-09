import { useState } from 'react';
import {
  Rocket,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  QrCode,
  Download,
  MessageSquare,
  FileText,
  ExternalLink,
  Edit3,
  HelpCircle,
  LogOut,
  CheckCircle,
  Bell,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStartups, useLeads } from '@/hooks/useData';
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
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [unreadNotifications] = useState(1);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      // O decodedText será o registration id (uuid) ou um JSON contendo o id
      let registrationId = decodedText;
      if (decodedText.startsWith('{')) {
        const data = JSON.parse(decodedText);
        registrationId = data.id || data.registrationId;
      }

      if (!registrationId) return;

      // Procura primeiro localmente se esse lead já existe
      const alreadyScanned = startupLeads.some(l => l.registrationId === registrationId);
      if (alreadyScanned) {
        toast.info('Este participante já está na sua lista de leads.');
        return;
      }

      await createLead({
        startupId: startupData?.id,
        registrationId: registrationId,
        interestLevel: 'high', // Padrão
        notes: 'Capturado via QR Code do Stand',
        visitorName: 'Participante ' + registrationId.substring(0, 4), // Placeholder genérico, será atualizado pelo hook do DB
      } as any);

      toast.success('Lead capturado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao ler QR Code ou salvar lead');
    }
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
          statusFinanceiro={{ label: 'Ativo' }}
          notifications={[]}
          onLogout={handleLogout}
          onGuideClick={() => navigate('/guia')}
          onNotificationRead={() => { }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <QuickActions
            onB2BClick={() => setIsB2BModalOpen(true)}
            onStartupClick={() => setIsStartupModalOpen(true)}
          />

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
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
                <TabsTrigger value="perfil" className="data-[state=active]:bg-orange-500 py-3 text-[10px] md:text-sm">
                  <UserIcon className="h-4 w-4 mr-1 md:mr-2" />
                  Perfil
                </TabsTrigger>
              </TabsList>

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
                                  <DollarSign className="h-4 w-4 text-green-400 mx-auto mb-1" />
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
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Pitch Deck
                      </Button>
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Material de Apoio
                      </Button>
                      <Button variant="outline" className="w-full border-dark-300 text-gray-300 justify-start">
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
                      <Button variant="outline" className="border-dark-300 text-gray-300">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {startupLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{lead.visitorName}</p>
                          <p className="text-gray-400 text-sm">{lead.visitorEmail || 'Email não disponível'}</p>
                          {lead.visitorCompany && (
                            <p className="text-gray-500 text-sm">{lead.visitorCompany}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={
                            lead.interestLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                              lead.interestLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                          }>
                            <Star className="h-3 w-3 mr-1" />
                            {lead.interestLevel}
                          </Badge>
                          <Button size="sm" variant="ghost" className="text-gray-400">
                            <MessageSquare className="h-4 w-4" />
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

              {/* Stand Tab */}
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
                      {/* Decorative corners */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-xl transition-all group-hover:w-12 group-hover:h-12"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500 rounded-br-xl transition-all group-hover:w-12 group-hover:h-12"></div>
                    </div>
                    <p className="text-gray-400 mb-2 font-medium">Capture leads automaticamente</p>
                    <p className="text-orange-400 font-black tracking-widest text-xs uppercase">Seu Stand Virtual Growth Experience</p>
                    <div className="flex justify-center space-x-3 mt-6">
                      <Button variant="outline" size="sm" className="border-dark-300 text-gray-300">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm" className="border-dark-300 text-gray-300">
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
                        { name: 'Programação do Evento', url: '#' },
                        { name: 'Lista de Investidores', url: '#' },
                        { name: 'Suporte para Startups', url: '#' },
                        { name: 'Grupo WhatsApp Startups', url: '#' },
                      ].map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          className="flex items-center justify-between p-3 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors"
                        >
                          <span className="text-orange-400 text-sm">{link.name}</span>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      ))}
                    </div>
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
    </div>
  );
}
