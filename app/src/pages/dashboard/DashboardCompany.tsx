import { useState } from 'react';
import { 
  Building2,
  Handshake,
  TrendingUp,
  Star,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanies, useB2BMeetings } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function DashboardCompany() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: companies } = useCompanies();
  const { data: meetings } = useB2BMeetings();
  const [activeTab, setActiveTab] = useState('reunioes');

  const companyData = companies.find(c => c.userId === user?.id);
  
  const companyMeetings = companyData 
    ? meetings.filter(m => 
        m.companyAnchorId === companyData.id || 
        m.companyVendorId === companyData.id
      )
    : [];

  const stats = {
    total: companyMeetings.length,
    scheduled: companyMeetings.filter(m => m.status === 'scheduled').length,
    completed: companyMeetings.filter(m => m.status === 'completed').length,
    highInterest: companyMeetings.filter(m => m.interestLevel === 'high').length,
    followUps: companyMeetings.filter(m => m.followUp).length,
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
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-4">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{companyData?.name || user?.name}</h1>
                <p className="text-blue-400">{companyData?.type === 'anchor' ? 'Empresa Âncora' : 'Fornecedor'}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprovado
              </Badge>
              <Button variant="outline" size="sm" className="border-dark-300 text-gray-300" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="glass-card p-4">
            <p className="text-gray-400 text-sm">Total Reuniões</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-dark-200 mb-8">
            <TabsTrigger 
              value="reunioes" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Handshake className="h-4 w-4 mr-2" />
              Reuniões
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger 
              value="perfil" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="recursos" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
          </TabsList>

          {/* Reunioes Tab */}
          <TabsContent value="reunioes" className="mt-0">
            <div className="space-y-4">
              {companyMeetings.map((meeting) => {
                const isAnchor = companyData?.id === meeting.companyAnchorId;
                const otherCompany = isAnchor ? meeting.companyVendorName : meeting.companyAnchorName;
                
                return (
                  <div key={meeting.id} className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="lg:w-32">
                        <p className="text-blue-400 font-medium">
                          {new Date(meeting.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(meeting.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            meeting.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            meeting.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {meeting.status}
                          </Badge>
                          {meeting.interestLevel && (
                            <Badge className={
                              meeting.interestLevel === 'high' ? 'bg-green-500/20 text-green-400' :
                              meeting.interestLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              <Star className="h-3 w-3 mr-1" />
                              {meeting.interestLevel}
                            </Badge>
                          )}
                          {meeting.followUp && (
                            <Badge className="bg-orange-500/20 text-orange-400">
                              Follow-up
                            </Badge>
                          )}
                        </div>
                        <p className="text-white font-semibold">{otherCompany}</p>
                        <p className="text-gray-400 text-sm">
                          {isAnchor ? 'Fornecedor' : 'Empresa Âncora'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-400">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        {meeting.status === 'scheduled' && (
                          <>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Concluir
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-400">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {companyMeetings.length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Handshake className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma reunião agendada</p>
                  <p className="text-gray-500 text-sm mt-2">Aguarde o matching com outras empresas</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="mt-0">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Matches Sugeridos</h3>
              <p className="text-gray-400 mb-6">
                Baseado no seu perfil, identificamos estas empresas como potenciais parceiras:
              </p>
              
              <div className="space-y-4">
                {companies
                  .filter(c => c.id !== companyData?.id && c.status === 'approved')
                  .slice(0, 5)
                  .map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 bg-dark-100 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-4">
                          <Building2 className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{company.name}</p>
                          <p className="text-gray-400 text-sm">{company.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-teal-400 mr-1" />
                            <span className="text-teal-400 text-sm">92% match</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                          <Handshake className="h-4 w-4 mr-1" />
                          Conectar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="mt-0">
            <div className="glass-card p-6 max-w-2xl">
              <h2 className="text-lg font-semibold text-white mb-6">Perfil da Empresa</h2>
              
              {companyData && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nome</label>
                      <p className="text-white">{companyData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">CNPJ</label>
                      <p className="text-white">{companyData.cnpj}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Setor</label>
                      <p className="text-white">{companyData.sector}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                      <p className="text-white">
                        {companyData.type === 'anchor' ? 'Empresa Âncora' : 'Fornecedor'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                    <p className="text-gray-300">{companyData.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Contato</label>
                      <p className="text-white">{companyData.contactName}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <p className="text-white">{companyData.contactEmail}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Máximo de Reuniões</label>
                    <p className="text-white">{companyData.maxMeetings}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recursos Tab */}
          <TabsContent value="recursos" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Documentos</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Guia da Rodada B2B', type: 'PDF' },
                    { name: 'Template de Proposta', type: 'DOC' },
                    { name: 'Mapa do Evento', type: 'PDF' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-400 mr-3" />
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
                    { name: 'Lista de Empresas', url: '#' },
                    { name: 'Suporte B2B', url: '#' },
                  ].map((link, i) => (
                    <a 
                      key={i} 
                      href={link.url}
                      className="flex items-center justify-between p-3 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors"
                    >
                      <span className="text-blue-400 text-sm">{link.name}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
