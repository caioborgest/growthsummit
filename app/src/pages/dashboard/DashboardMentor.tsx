import { useState } from 'react';
import {
  Calendar,
  Star,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  User,
  HelpCircle,
  FileText,
  LogOut,
  Briefcase,
  Bell,
  Sparkles
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMentoringSessions, useMentors } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from './components/ProfileForm';

export function DashboardMentor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: sessions } = useMentoringSessions();
  const { data: mentors } = useMentors();
  const [activeTab, setActiveTab] = useState('agenda');
  const [unreadNotifications, setUnreadNotifications] = useState(1);

  const notifications = [
    { id: 1, title: 'Nova Mentoria!', message: 'Um novo participante se inscreveu para sua mentoria.', time: '5 min atrás', read: false },
    { id: 2, title: 'Agenda Confirmada', message: 'Seu cronograma de mentorias para hoje está pronto.', time: '1 hora atrás', read: true },
  ];

  const mentorData = mentors.find(m => m.userId === user?.id);
  const mentorSessions = sessions.filter(s => s.mentorId === mentorData?.id);

  const stats = {
    total: mentorSessions.length,
    completed: mentorSessions.filter(s => s.status === 'completed').length,
    scheduled: mentorSessions.filter(s => s.status === 'scheduled').length,
    avgRating: mentorSessions
      .filter(s => s.feedback)
      .reduce((acc, s) => acc + (s.feedback?.rating || 0), 0) /
      mentorSessions.filter(s => s.feedback).length || 0,
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
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mr-4">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <p className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">Mentor Oficial 2026</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprovado
              </Badge>
              <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300" onClick={() => navigate('/guia')}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Acessar Manual
              </Button>
              <Button variant="outline" size="sm" className="border-dark-300 text-gray-300" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative bg-white/5 hover:bg-white/10 text-gray-400 p-2 rounded-full transition-colors border border-white/10">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-teal-500 rounded-full border border-dark-300"></span>
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
                      <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.read ? 'bg-white/5 border-transparent' : 'bg-teal-500/5 border-teal-500/20'}`}>
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
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-teal-500/10 hover:border-teal-500/30 transition-all">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Total Mentorias</p>
            <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>
          <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-green-500/10 hover:border-green-500/30 transition-all">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Concluídas</p>
            <p className="text-3xl font-black text-green-400">{stats.completed}</p>
          </div>
          <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-blue-500/10 hover:border-blue-500/30 transition-all">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Agendadas</p>
            <p className="text-3xl font-black text-blue-400">{stats.scheduled}</p>
          </div>
          <div className="glass-card p-5 bg-gradient-to-br from-dark-200 to-dark-300 border-yellow-500/10 hover:border-yellow-500/30 transition-all">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-2">Avaliação Média</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-black text-yellow-400">{stats.avgRating.toFixed(1)}</p>
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 bg-dark-200 mb-8 p-1 h-auto min-h-[44px]">
            <TabsTrigger value="agenda" className="data-[state=active]:bg-teal-500 py-3 text-xs md:text-sm">
              <Calendar className="h-4 w-4 mr-1 md:mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-teal-500 py-3 text-xs md:text-sm">
              <TrendingUp className="h-4 w-4 mr-1 md:mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="perfil" className="data-[state=active]:bg-teal-500">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="mentor_data" className="data-[state=active]:bg-teal-500">
              <Briefcase className="h-4 w-4 mr-2" />
              Currículo
            </TabsTrigger>
            <TabsTrigger value="recursos" className="data-[state=active]:bg-teal-500">
              <FileText className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="mt-0">
            <div className="space-y-4">
              {mentorSessions
                .filter(s => s.status === 'scheduled')
                .map((session) => (
                  <div key={session.id} className="glass-card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="lg:w-32">
                        <p className="text-teal-400 font-medium">
                          {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{session.menteeName}</p>
                        {session.topic && (
                          <p className="text-gray-400 text-sm">{session.topic}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-teal-500 text-teal-400">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              {mentorSessions.filter(s => s.status === 'scheduled').length === 0 && (
                <div className="glass-card p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma mentoria agendada</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Historico Tab */}
          <TabsContent value="historico" className="mt-0">
            <div className="space-y-4">
              {mentorSessions
                .filter(s => s.status === 'completed')
                .map((session) => (
                  <div key={session.id} className="glass-card p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-500/20 text-green-400">Concluída</Badge>
                          {session.feedback && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-white">{session.feedback.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-white font-semibold">{session.menteeName}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                        {session.topic && (
                          <p className="text-gray-400 text-sm mt-1">{session.topic}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="border-dark-300 text-gray-300">
                        Ver detalhes
                      </Button>
                    </div>
                    {session.threeSteps && session.threeSteps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-300">
                        <p className="text-gray-400 text-sm mb-2">3 Passos Acordados:</p>
                        <ul className="space-y-1">
                          {session.threeSteps.map((step, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-center">
                              <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center mr-2 text-xs text-teal-400">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="mt-0 text-left">
            <ProfileForm />
          </TabsContent>

          {/* Mentor Data Tab */}
          <TabsContent value="mentor_data" className="mt-0 text-left">
            <div className="glass-card p-10">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-300">
                <h2 className="text-xl font-bold text-white">Informações de Mentor</h2>
                <Button variant="outline" className="border-teal-500/30 text-teal-400">Solicitar Alteração</Button>
              </div>

              {mentorData && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nome</label>
                      <p className="text-white">{mentorData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <p className="text-white">{mentorData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Empresa</label>
                      <p className="text-white">{mentorData.company}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Cargo</label>
                      <p className="text-white">{mentorData.position}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                    <p className="text-gray-300">{mentorData.bio}</p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Especialidades</label>
                    <div className="flex flex-wrap gap-2">
                      {mentorData.specialties.map((spec, i) => (
                        <Badge key={i} className="bg-teal-500/20 text-teal-400">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Anos de Experiência</label>
                      <p className="text-white">{mentorData.yearsExperience} anos</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Máx. Mentorias</label>
                      <p className="text-white">{mentorData.maxMentories}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recursos Tab */}
          <TabsContent value="recursos" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Materiais do Mentor</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Guia do Mentor', type: 'PDF' },
                    { name: 'Template de Feedback', type: 'DOC' },
                    { name: 'Checklist de Mentoria', type: 'PDF' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-100 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-teal-400 mr-3" />
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
                    { name: 'Mapa do Venue', url: '#' },
                    { name: 'Contato Organização', url: '#' },
                  ].map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      className="flex items-center p-3 bg-dark-100 rounded-lg hover:bg-dark-300 transition-colors"
                    >
                      <span className="text-teal-400 text-sm">{link.name}</span>
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
