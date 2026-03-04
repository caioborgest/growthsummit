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
  Plus,
  Trash2,
  Clock,
  CalendarDays,
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
import { MentoringSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfileForm } from './components/ProfileForm';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

  const { create, remove, update } = useMentoringSessions();

  const handleOpenSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorData) return;

    const form = e.target as HTMLFormElement;
    const date = form.slotDate.value;
    const time = form.slotTime.value;
    const dateTime = `${date}T${time}:00`;

    try {
      await create({
        mentorId: mentorData.id,
        mentorName: mentorData.name,
        menteeId: '',
        menteeName: '',
        status: 'scheduled',
        scheduledAt: dateTime,
        duration: 30,
        topic: 'Disponibilidade de Mentoria',
        notes: ''
      });
      toast.success('Horário aberto com sucesso!');
      form.reset();
    } catch {
      toast.error('Erro ao abrir horário.');
    }
  };

  const generateGoogleCalendarLink = (session: MentoringSession) => {
    const start = new Date(session.scheduledAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(session.scheduledAt).getTime() + 30 * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(`Mentoria Growth Experience: ${session.menteeName}`);
    const details = encodeURIComponent(`Tópico: ${session.topic}`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&sf=true&output=xml`;
  };

  const generateICalLink = (session: MentoringSession) => {
    const start = new Date(session.scheduledAt).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(new Date(session.scheduledAt).getTime() + 30 * 60000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const icsMsg = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:Mentoria Growth Experience: ${session.menteeName}`,
      `DESCRIPTION:Tópico: ${session.topic}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsMsg)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark-400 mesh-gradient pb-10"
    >
      {/* Header Premium */}
      <div className="bg-dark-300 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 blur-[120px] rounded-full -ml-32 -mb-32"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-orange-700 p-0.5 shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-dark-300 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                    {(mentorData as any)?.avatarUrl ? (
                      <img src={(mentorData as any).avatarUrl} alt={mentorData?.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-orange-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-dark-300 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {mentorData?.name || user?.name}
                </h1>
                <p className="text-orange-400 font-bold tracking-widest uppercase text-[10px] md:text-xs">Mentor Oficial 2026</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 font-bold px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-1.5" /> Mentor Verificado
                  </Badge>
                  <button onClick={() => navigate('/guia')} className="bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1 rounded-full text-xs font-bold transition-colors">
                    Guia do Mentor
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative bg-white/5 hover:bg-white/10 text-gray-400 p-3 rounded-2xl transition-all border border-white/5">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-orange-coral rounded-full border border-dark-300"></span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-dark-200 border-white/10 p-4 rounded-2xl shadow-2xl">
                  <h3 className="text-white font-bold mb-4">Notificações</h3>
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl border transition-all ${n.read ? 'bg-white/5 border-transparent' : 'bg-brand-orange-coral/5 border-brand-orange-coral/20'}`}>
                        <p className="text-white text-xs font-bold">{n.title}</p>
                        <p className="text-gray-400 text-[10px] mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={handleLogout} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl px-6">
                Sair
              </Button>
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
            <TabsTrigger value="slots" className="data-[state=active]:bg-teal-500 py-3 text-xs md:text-sm">
              <Clock className="h-4 w-4 mr-1 md:mr-2" />
              Disponibilidade
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
          </TabsList>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="mt-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">Minha Agenda Personalizada</h2>
                <p className="text-gray-400 text-sm mt-1">Sessões de mentoria agendadas com participantes confirmados.</p>
              </div>
            </div>
            <div className="space-y-4">
              {mentorSessions
                .filter(s => s.status === 'scheduled' && s.menteeId)
                .map((session) => (
                  <div key={session.id} className="glass-card p-6 border-teal-500/20">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="lg:w-32">
                        <p className="text-teal-400 font-bold">
                          {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-black text-lg">{session.menteeName}</p>
                        {session.topic && (
                          <p className="text-teal-400/80 text-sm font-medium">{session.topic}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="border-teal-500 text-teal-400">
                              <CalendarDays className="h-4 w-4 mr-1" />
                              Sincronizar
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-dark-200 border-white/10">
                            <DropdownMenuItem className="text-white hover:bg-teal-500/20 cursor-pointer" asChild>
                              <a href={generateGoogleCalendarLink(session)} target="_blank" rel="noopener noreferrer">
                                Google Calendar
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-teal-500/20 cursor-pointer" asChild>
                              <a href={generateICalLink(session)} download="mentoria.ics">
                                iCal / Outlook
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="outline" className="border-teal-500 text-teal-400">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white font-bold"
                          onClick={() => update(session.id, { status: 'completed' })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              {mentorSessions.filter(s => s.status === 'scheduled' && s.menteeId).length === 0 && (
                <div className="glass-card p-12 text-center border-white/5">
                  <Calendar className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Você não tem mentorias agendadas com participantes no momento.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Slots Tab */}
          <TabsContent value="slots" className="mt-0">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="glass-card p-6 border-teal-500/30 bg-teal-500/5">
                  <h3 className="text-white font-black mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-400" />
                    Abrir Novo Horário
                  </h3>
                  <form onSubmit={handleOpenSlot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                      <input
                        name="slotDate"
                        type="date"
                        required
                        className="w-full bg-dark-200 border border-dark-300 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início</label>
                      <input
                        name="slotTime"
                        type="time"
                        required
                        className="w-full bg-dark-200 border border-dark-300 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold">
                      DISPONIBILIZAR
                    </Button>
                  </form>
                  <p className="text-[10px] text-gray-500 mt-4 leading-tight italic">
                    * O horário ficará visível para inscritos "Experience Pro" na área do participante.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="text-white font-black flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-400" />
                  Meus Horários em Aberto
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {mentorSessions
                    .filter(s => s.status === 'scheduled' && !s.menteeId)
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map(slot => (
                      <div key={slot.id} className="glass-card p-4 border-white/5 bg-dark-200 flex items-center justify-between group">
                        <div>
                          <p className="text-white font-bold">{new Date(slot.scheduledAt).toLocaleDateString('pt-BR')}</p>
                          <p className="text-teal-400 font-medium">{new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-600 hover:text-red-400 transition-colors"
                          onClick={() => remove(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>

                {mentorSessions.filter(s => s.status === 'scheduled' && !s.menteeId).length === 0 && (
                  <div className="glass-card p-12 text-center border-dashed border-dark-300">
                    <Clock className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Nenhum horário em aberto.</p>
                  </div>
                )}
              </div>
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
    </motion.div>
  );
}
