import { useState, useMemo } from 'react';
import {
  Search,
  User,
  MessageSquare,
  Star,
  Calendar,
  Clock,
  Activity,
  Users,
  TrendingUp,
  ChevronRight,
  Filter,
  BarChart3,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useMentoringSessions, useMentors, useRegistrations, useMentoringWaitlist, useNotifications } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000000';

export function AdminMentorias() {
  const { data: sessions, create, update } = useMentoringSessions();
  const { data: mentors } = useMentors();
  const { data: registrations } = useRegistrations();
  const { data: waitlist, update: updateWaitlist } = useMentoringWaitlist();
  const { create: createNotification } = useNotifications();
  const { selectedProject } = useProject();

  const [, setActiveTab] = useState('monitor');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mentorId: '',
    menteeId: '',
    slotId: '',
    scheduledAt: '',
    topicOfInterest: '',
    duration: 20
  });

  const stats = useMemo(() => {
    const now = new Date();
    const active = sessions.filter(s => {
      const start = new Date(s.scheduledAt);
      const end = new Date(start.getTime() + (s.duration || 20) * 60000);
      return now >= start && now <= end && s.status === 'scheduled' && s.menteeId;
    }).length;

    return {
      total: sessions.length,
      scheduled: sessions.filter(s => s.status === 'scheduled' && s.menteeId && s.menteeId !== PLACEHOLDER_ID).length,
      available: sessions.filter(s => s.status === 'scheduled' && (!s.menteeId || s.menteeId === PLACEHOLDER_ID)).length,
      pending: sessions.filter(s => s.status === 'pending').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      active,
      waitlist: waitlist.filter(w => w.status === 'pending').length,
      avgRating: sessions
        .filter(s => s.menteeRating || s.feedback?.mentoringRating)
        .reduce((acc, s) => acc + (s.menteeRating || s.feedback?.mentoringRating || 0), 0) /
        (sessions.filter(s => s.menteeRating || s.feedback?.mentoringRating).length || 1),
    };
  }, [sessions, waitlist]);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      (session.mentorName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (session.menteeName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (session.topicOfInterest?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const liveSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter(s => {
      const start = new Date(s.scheduledAt);
      const end = new Date(start.getTime() + (s.duration || 20) * 60000);
      // Show sessions happening now or starting in the next 30 minutes
      return (now >= start && now <= end) || (start > now && start.getTime() - now.getTime() < 30 * 60000);
    }).filter(s => s.menteeId && s.menteeId !== PLACEHOLDER_ID && s.status !== 'cancelled' && s.status !== 'completed');
  }, [sessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.mentorId || !formData.menteeId || !formData.scheduledAt) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      const mentor = mentors.find(m => m.id === formData.mentorId);
      const registration = registrations.find(r => r.id === formData.menteeId);

      const payload: any = {
        mentorId: formData.mentorId,
        scheduledAt: formData.scheduledAt,
        status: 'scheduled',
        topicOfInterest: formData.topicOfInterest,
        duration: Number(formData.duration) || 20,
        mentorName: mentor?.name || '',
        menteeName: registration?.name || 'Participante'
      };

      if (registration?.userId) {
        payload.menteeId = registration.userId;
      }

      if (formData.slotId) {
        await update(formData.slotId, {
          status: 'scheduled',
          menteeId: payload.menteeId,
          menteeName: payload.menteeName,
          topicOfInterest: payload.topicOfInterest,
          duration: payload.duration
        });
      } else {
        await create(payload);
      }

      toast.success('Mentoria agendada com sucesso!');
      setIsModalOpen(false);
      setFormData({
        mentorId: '',
        menteeId: '',
        slotId: '',
        scheduledAt: '',
        topicOfInterest: '',
        duration: 20
      });
    } catch (err: any) {
      logger.error('Erro ao agendar mentoria:', err);
      toast.error('Erro ao agendar mentoria');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 italic">
            <Zap className="h-8 w-8 text-brand-orange-coral fill-brand-orange-coral" />
            GESTÃO DE <span className="text-brand-orange-coral">MENTORIAS</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Monitoramento em tempo real e controle de demanda</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-8 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black rounded-2xl shadow-glow-orange transition-all">
                <Calendar className="h-4 w-4 mr-2" /> AGENDAR SESSÃO
              </Button>
            </DialogTrigger>
            <DialogContent className="admin-modal-content p-0 border-none max-w-xl bg-[#0F172A] overflow-hidden shadow-2xl">
              <div className="admin-modal-header p-8 pb-4">
                <div>
                  <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                    Nova <span className="text-brand-orange-coral">Mentoria</span>
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Agendamento manual de sessão
                  </DialogDescription>
                </div>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col min-h-0 overflow-hidden custom-scrollbar">
                <div className="admin-modal-body p-8 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Mentor Responsável</label>
                      <select
                        required
                        value={formData.mentorId}
                        onChange={e => setFormData({ ...formData, mentorId: e.target.value })}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50"
                      >
                        <option value="">Selecione...</option>
                        {mentors.filter(m => m.status === 'approved').map(mentor => (
                          <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Participante</label>
                      <select
                        required
                        value={formData.menteeId}
                        onChange={e => setFormData({ ...formData, menteeId: e.target.value })}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl text-white font-bold outline-none focus:border-brand-orange-coral/50"
                      >
                        <option value="">Selecione...</option>
                        {registrations.map(reg => (
                          <option key={reg.id} value={reg.id}>{reg.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Data e Hora</label>
                      <Input
                        required
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })}
                        className="h-11 bg-dark-100 border-white/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Duração (Min)</label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                        className="h-11 bg-dark-100 border-white/5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tópico de Discussão</label>
                    <Input
                      value={formData.topicOfInterest}
                      onChange={e => setFormData({ ...formData, topicOfInterest: e.target.value })}
                      placeholder="Ex: Estratégia de Go-to-Market"
                      className="h-11 bg-dark-100 border-white/5"
                    />
                  </div>
                </div>

                <div className="admin-modal-footer p-8 pt-0 flex gap-4">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white font-bold h-12 px-8 rounded-xl border border-white/5">
                    CANCELAR
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white font-black px-8 h-12 rounded-xl shadow-glow-orange border-none transition-all">
                    CONFIRMAR AGENDAMENTO
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-200/50 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-12 w-12 text-teal-500" />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Mentorias Ativas</p>
          <div className="flex items-end gap-3 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tighter">{stats.active}</h3>
            <Badge className="bg-teal-500/20 text-teal-400 mb-1 font-bold animate-pulse text-[10px]">LIVE NOW</Badge>
          </div>
        </Card>

        <Card className="bg-dark-200/50 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-12 w-12 text-brand-orange-coral" />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Fila de Espera</p>
          <div className="flex items-end gap-3 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tighter">{stats.waitlist}</h3>
            <p className="text-brand-orange-coral text-[10px] font-bold mb-1 uppercase">Pessoas</p>
          </div>
        </Card>

        <Card className="bg-dark-200/50 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-12 w-12 text-indigo-500" />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Taxa de Ocupação</p>
          <div className="flex items-end gap-3 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tighter">{Math.round((stats.scheduled / (stats.total || 1)) * 100)}%</h3>
            <p className="text-indigo-400 text-[10px] font-bold mb-1 uppercase">Eficiência</p>
          </div>
        </Card>

        <Card className="bg-dark-200/50 border-white/5 p-6 rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Star className="h-12 w-12 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Satisfação Média</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tighter">{stats.avgRating.toFixed(1)}</h3>
            <div className="flex mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.round(stats.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs System */}
      <Tabs defaultValue="monitor" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <TabsList className="bg-dark-200/50 p-1 rounded-2xl border border-white/5 h-14 w-full sm:w-auto backdrop-blur-xl">
            <TabsTrigger value="monitor" className="rounded-xl px-6 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white transition-all shadow-glow-orange/20">
              <Activity className="h-4 w-4 mr-2" /> Monitor Vivo
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="rounded-xl px-6 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white transition-all shadow-glow-orange/20">
              <Users className="h-4 w-4 mr-2" /> Fila (Demanda)
            </TabsTrigger>
            <TabsTrigger value="list" className="rounded-xl px-6 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white transition-all shadow-glow-orange/20">
              <BarChart3 className="h-4 w-4 mr-2" /> Todas Sessões
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-14 bg-dark-200/50 border-white/5 rounded-2xl text-xs font-bold"
              />
            </div>
            <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-dark-200/50 text-gray-400">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* MONITOR VIVO TAB */}
        <TabsContent value="monitor" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {liveSessions.length > 0 ? (
                liveSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="bg-dark-200/80 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-teal-500/30 transition-all shadow-2xl group">
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shadow-lg shadow-teal-500/10">
                              <User className="h-8 w-8 text-teal-400" />
                            </div>
                            <div>
                              <p className="text-white font-black text-lg tracking-tight leading-none mb-1 uppercase italic">{session.menteeName}</p>
                              <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest">EM ANDAMENTO</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <Clock className="h-4 w-4 text-teal-500 ml-auto mb-1 animate-pulse" />
                            <p className="text-white font-black text-xl tracking-tighter leading-none">
                              {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center">
                                <Activity className="h-4 w-4 text-brand-orange-coral" />
                              </div>
                              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Mentor:</p>
                              <p className="text-white font-black text-xs uppercase italic">{session.mentorName}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                             <div className="flex items-center gap-2">
                                <MessageSquare className="h-3 w-3 text-teal-500" />
                                <p className="text-[10px] text-teal-500 font-extrabold uppercase tracking-[0.2em]">Desafio Central</p>
                             </div>
                             <div className="bg-dark-300/50 p-5 rounded-3xl border border-teal-500/10 relative">
                                <p className="text-gray-300 text-[11px] leading-relaxed italic line-clamp-3">"{session.notes || session.topicOfInterest || 'Sessão de mentoria técnica e estratégica'}"</p>
                             </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                            onClick={() => window.open(`https://wa.me/55${session.menteePhone?.replace(/\D/g, '')}`, '_blank')}
                          >
                            NOTIFICAR
                          </Button>
                          <Button 
                            className="flex-1 h-12 border border-teal-500/20 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                            onClick={() => update(session.id, { status: 'completed' })}
                          >
                            FINALIZAR
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 bg-dark-200/30 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center mb-6 opacity-40">
                    <Activity className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-gray-400 font-black text-lg uppercase italic tracking-tight">Nenhuma mentoria ativa agora</h3>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mt-2">Acompanhe as próximas sessões programadas na agenda</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* WAITLIST TAB */}
        <TabsContent value="waitlist" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {waitlist.filter(w => w.status === 'pending').length > 0 ? (
               waitlist.filter(w => w.status === 'pending').map((item) => (
                 <Card key={item.id} className="bg-dark-200/80 border border-white/5 rounded-[2.5rem] p-8 space-y-6 flex flex-col border-l-4 border-l-brand-orange-coral">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                             <User className="h-6 w-6 text-brand-orange-coral" />
                          </div>
                          <div>
                             <p className="text-white font-black text-sm uppercase italic">{registrations.find(r => r.userId === item.registrationId || r.id === item.registrationId)?.name || 'Anônimo'}</p>
                             <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Desde {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 flex-1">
                       <div className="bg-brand-orange-coral/5 p-5 rounded-3xl border border-brand-orange-coral/10 h-full">
                          <p className="text-[9px] text-brand-orange-coral font-black uppercase tracking-[0.2em] mb-2">Desafio Exposto</p>
                          <p className="text-gray-300 text-[11px] italic leading-relaxed">"{item.challenge}"</p>
                       </div>
                    </div>

                    <div className="flex flex-col gap-3">
                       <Dialog>
                          <DialogTrigger asChild>
                             <Button className="w-full h-12 bg-white/5 hover:bg-brand-orange-coral text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                                DIRECIONAR PARA MENTOR
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="admin-modal-content p-0 border-none max-w-xl bg-[#0F172A] overflow-hidden shadow-2xl">
                            <div className="admin-modal-header p-8 pb-4">
                               <div>
                                  <DialogTitle className="text-xl font-black italic uppercase leading-none text-white">
                                     Vincular <span className="text-brand-orange-coral">Mentor</span>
                                  </DialogTitle>
                                  <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                                     Selecione um mentor disponível para este participante
                                  </DialogDescription>
                               </div>
                            </div>

                            <div className="admin-modal-body p-8 pt-4 flex-1 overflow-y-auto custom-scrollbar">
                               <div className="space-y-6">
                                  <div className="bg-dark-300/50 p-5 rounded-3xl border border-white/5 relative">
                                     <p className="text-[10px] text-brand-orange-coral font-black uppercase tracking-[0.2em] mb-2">Desafio do Participante</p>
                                     <p className="text-gray-300 text-[11px] italic leading-relaxed">"{item.challenge}"</p>
                                  </div>

                                  <div className="space-y-2">
                                     <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Mentor Disponível</label>
                                     <select className="w-full h-14 bg-dark-100 border border-white/5 rounded-2xl text-white font-bold px-4 outline-none focus:border-brand-orange-coral/50 transition-all">
                                        <option value="">Selecione um mentor...</option>
                                        {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.specialties})</option>)}
                                     </select>
                                  </div>
                               </div>
                            </div>

                            <div className="admin-modal-footer p-8 pt-0">
                               <Button
                                  className="w-full h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange border-none transition-all uppercase tracking-widest text-[10px]"
                                  onClick={async () => {
                                     await updateWaitlist(item.id, { status: 'redirected' });
                                     
                                     // Encontrar o userId do participante
                                     const participant = registrations.find(r => r.id === item.registrationId || r.userId === item.registrationId);

                                     // Notificar o participante
                                     await createNotification({
                                        projectId: selectedProject?.id,
                                        title: '🚀 Oportunidade de Mentoria!',
                                        message: `Um mentor está disponível para te ajudar com: "${item.challenge.substring(0, 30)}...". Vá ao Lounge de Mentorias!`,
                                        type: 'info',
                                        userId: participant?.userId || item.registrationId, // Preferência pelo User ID
                                        read: false
                                     } as any);

                                     toast.success('Direcionado com sucesso! Participante notificado via App.');
                                  }}
                               >
                                  NOTIFICAR E VINCULAR
                               </Button>
                            </div>
                         </DialogContent>
                       </Dialog>
                    </div>
                 </Card>
               ))
             ) : (
               <div className="col-span-full py-20 bg-dark-200/30 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-dark-300 flex items-center justify-center mb-6 opacity-40">
                    <Users className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-gray-400 font-black text-lg uppercase italic tracking-tight">Ninguém na espera</h3>
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mt-2">A demanda está sendo atendida em tempo real!</p>
                </div>
             )}
          </div>
        </TabsContent>

        {/* LIST TAB */}
        <TabsContent value="list" className="mt-0 outline-none">
          <Card className="glass-card overflow-hidden border-white/5 shadow-2xl">
            <div className="overflow-x-auto responsive-table">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Participante</th>
                    <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Mentor</th>
                    <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Horário</th>
                    <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Status</th>
                    <th className="p-6 text-left text-gray-500 font-extrabold uppercase text-[10px] tracking-widest text-center">Avaliação</th>
                    <th className="p-6 text-right text-gray-500 font-extrabold uppercase text-[10px] tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-all group">
                      <td className="p-6" data-label="Participante">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-white/5">
                            <User className="h-5 w-5 text-brand-orange-coral" />
                          </div>
                          <div>
                            <p className="text-white font-black text-sm uppercase italic">{session.menteeName || 'Livre'}</p>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight">{session.startupName || 'Growth Experience'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6" data-label="Mentor">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-white/5">
                            <User className="h-5 w-5 text-teal-400" />
                          </div>
                          <p className="text-gray-300 font-bold text-sm uppercase">{session.mentorName}</p>
                        </div>
                      </td>
                      <td className="p-6" data-label="Hora">
                        <div className="flex items-center gap-3">
                          <div className="bg-dark-300 px-3 py-1.5 rounded-lg border border-white/5">
                            <p className="text-white font-black text-xs">{new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <p className="text-[10px] text-gray-500 font-bold">{new Date(session.scheduledAt).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="p-6" data-label="Status">
                        <Badge className={`border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 ${statusColors[session.status || 'scheduled']}`}>
                          {session.status === 'completed' ? 'Concluída' : session.status === 'cancelled' ? 'Cancelada' : 'Agendada'}
                        </Badge>
                      </td>
                      <td className="p-6" data-label="Avalia.">
                        <div className="flex lg:justify-center">
                           {(session.menteeRating || session.feedback?.mentoringRating) ? (
                             <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg border border-yellow-500/20">
                               <span className="font-black text-xs">{session.menteeRating || session.feedback?.mentoringRating}</span>
                               <Star className="h-3 w-3 fill-yellow-500" />
                             </div>
                           ) : <span className="text-gray-700">-</span>}
                        </div>
                      </td>
                      <td className="p-6 text-right" data-label="Ações">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
