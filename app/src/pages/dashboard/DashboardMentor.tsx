import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, CheckCircle, Clock, XCircle, MessageSquare,
  Phone, Mail, Plus,
  ShieldCheck, Building2, BarChart, Settings,
  User, Sun, Moon, Target, Home
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMentoringSessions, useMentors, useNotifications } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { PwaDashboardHero } from './components/shared/DashboardHero';
import { NextActivityCard } from './components/shared/NextActivityCard';
import { QuickActions } from './components/shared/QuickActions';
import { BottomNavigation } from './components/shared/BottomNavigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { useProject } from '@/contexts/ProjectContext';
import { MENTORSHIP_TIME_SLOTS } from '@/components/forms/mentoria-steps/mentoriaTypes';

export default function DashboardMentor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { data: mentorsData, update: updateMentorProfile } = useMentors();
  const { data: sessions, create, update, remove, isLoading } = useMentoringSessions();

  // Find current mentor profile
  const mentorData = mentorsData?.find(m => m.userId === user?.id || (m as any).email === user?.email);

  const [activeTab, setActiveTab] = useState<'home' | 'sessions' | 'slots' | 'profile'>('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialties: '',
    bio: '',
    company: '',
    position: ''
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (selectedProject?.startDate) {
      return new Date(selectedProject.startDate).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const { data: notificationsData } = useNotifications();

  // Filter sessions for this mentor
  const mentorSessions = sessions?.filter(s => s.mentorId === mentorData?.id) || [];

  const pendingRequests = mentorSessions.filter(s => s.status === 'pending' || (s.status as string) === 'pendente');
  const upcomingSessions = mentorSessions.filter(s => (s.status === 'scheduled' || (s.status as string) === 'agendado') && s.menteeId);
  const availableSlots = mentorSessions.filter(s => (s.status === 'scheduled' || (s.status as string) === 'agendado') && !s.menteeId);
  
  const completedSessions = mentorSessions.filter(s => s.status === 'completed' || (s.status as string) === 'concluído');
  const ratedSessions = completedSessions.filter(s => s.feedback?.rating || s.feedback?.avaliacaoMentoria);
  
  const avgRating = useMemo(() => {
    if (ratedSessions.length === 0) return "5.0";
    const sum = ratedSessions.reduce((acc, s) => acc + (s.feedback?.avaliacaoMentoria || s.feedback?.rating || 0), 0);
    return (sum / ratedSessions.length).toFixed(1);
  }, [ratedSessions]);

  const recommendationRate = useMemo(() => {
    if (ratedSessions.length === 0) return "100";
    const recommended = ratedSessions.filter(s => (s.feedback?.indicacaoMentor || s.feedback?.rating || 0) >= 4).length;
    return Math.round((recommended / ratedSessions.length) * 100);
  }, [ratedSessions]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) logger.error('Erro logout:', error);
    navigate('/login');
  };

  const handleMarkAsRead = async (id: string) => {
    // Only proceed if id is valid
    if (!id) return;
    const { error } = await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', id);
    if (error) logger.error('Erro mark notific:', error);
  };

  const toggleSlotAvailability = async (slotId: string) => {
    // Check if slot already exists for this date and time
    const existingSlot = mentorSessions.find(s => {
      const sDate = new Date(s.scheduledAt).toISOString().split('T')[0];
      const sTime = new Date(s.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const isAvailable = !s.menteeId;
      return sDate === selectedDate && sTime === slotId && (s.status === 'scheduled' || s.status === 'agendado') && isAvailable;
    });

    if (existingSlot) {
      // Remove it (Disable)
      try {
        await remove(existingSlot.id);
        toast.success('Horário removido com sucesso!');
      } catch (err) {
        toast.error('Erro ao remover horário.');
      }
    } else {
      // Create it (Enable)
      try {
        const [hours, minutes] = slotId.split(':');
        const [y, m, d] = selectedDate.split('-').map(Number);
        const scheduledDate = new Date(y, m - 1, d, Number(hours), Number(minutes));

        await create({
          mentorId: mentorData?.id,
          status: 'scheduled',
          scheduledAt: scheduledDate.toISOString(),
          duration: 20,
          topic: 'Disponível para Mentoria',
          notes: 'Slot de disponibilidade criado pelo mentor.',
          // Required fields for GE table to satisfy NOT NULL constraints
          menteeName: 'Disponível',
          menteeEmail: '',
          menteePhone: '',
          menteeId: null
        } as any);
        toast.success('Horário habilitado com sucesso!');
      } catch (err) {
        logger.error('Erro toggleSlot:', err);
        toast.error('Erro ao habilitar horário.');
      }
    }
  };

  const getSlotStatus = (slotId: string) => {
    const session = mentorSessions.find(s => {
      const sDate = new Date(s.scheduledAt).toISOString().split('T')[0];
      const sTime = new Date(s.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return sDate === selectedDate && sTime === slotId && s.status !== 'cancelled' && (s.status as string) !== 'cancelado';
    });

    if (!session) return 'empty';
    const isAvailable = !session.menteeId;
    if (isAvailable) return 'available';
    return 'booked';
  };

  if (isLoading || !mentorData) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-orange-500/10 border-t-orange-500 animate-spin" />
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400 text-gray-100 flex flex-col font-sans selection:bg-orange-500/30">
      <PremiumBackground />

      <PremiumHeader
        userName={mentorData?.name || user?.name}
        userAvatar={mentorData?.photo}
        projectName="GROWTH SUMMIT 2026"
        roleLabel="MENTOR OFICIAL"
        notifications={notificationsData || []}
        onLogout={handleLogout}
        onGuideClick={() => navigate('/guia')}
        onNotificationRead={handleMarkAsRead}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 relative z-10">
        
        {/* NEW DASHBOARD HOME VIEW (PREMIUM STYLE) - Only if in sessions tab or initial view */}
        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PwaDashboardHero 
              eventName="Growth Mentorship"
              location="Arena de Mentorias"
              date="16 ABR 2026"
              stats={{
                people: upcomingSessions.length.toString() + " Agendadas",
                content: avgRating + " ⭐",
                activities: availableSlots.length.toString() + " Slots"
              }}
            />

            {upcomingSessions[0] && (
              <NextActivityCard 
                title={`Mentoria com ${upcomingSessions[0].menteeName}`}
                subtitle={upcomingSessions[0].topic || "Sessão de Mentoria"}
                time={new Date(upcomingSessions[0].scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                duration="20 min"
                isConfirmed={true}
                onClick={() => setActiveTab('sessions')}
              />
            )}

            <div className="grid grid-cols-2 gap-4 px-2">
              <Button 
                onClick={() => setActiveTab('sessions')}
                className="h-32 bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:bg-indigo-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-sm uppercase italic">Agenda</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{upcomingSessions.length} sessões</p>
                </div>
              </Button>

              <Button 
                onClick={() => setActiveTab('slots')}
                className="h-32 bg-teal-500/10 border border-teal-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 hover:bg-teal-500/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-white font-black text-sm uppercase italic">Meus Slots</p>
                  <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">{availableSlots.length} livres</p>
                </div>
              </Button>
            </div>

            <QuickActions 
              onB2BClick={() => navigate('/b2b')}
              onMentoriaClick={() => setActiveTab('slots')}
            />
          </div>
        )}

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2 bg-dark-200/50 p-1.5 rounded-[2rem] border border-white/5 self-start shadow-xl shadow-black/20">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
          >
            <Home className={`h-4 w-4 ${activeTab === 'home' ? 'animate-bounce' : ''}`} /> Início
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-gray-500 hover:text-white'}`}
          >
            <Calendar className={`h-4 w-4 ${activeTab === 'sessions' ? 'animate-bounce' : ''}`} /> Mentorias
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-[1.8rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'slots' ? 'bg-teal-500 text-white shadow-glow-teal' : 'text-gray-500 hover:text-white'}`}
          >
            <Clock className="h-4 w-4" /> Disponibilidade
          </button>
          <button
            onClick={() => {
              setActiveTab('profile');
              if (mentorData) {
                setProfileForm({
                  name: mentorData.name || '',
                  specialties: Array.isArray(mentorData.specialties) ? mentorData.specialties.join(', ') : mentorData.specialties || '',
                  bio: mentorData.bio || '',
                  company: mentorData.company || '',
                  position: mentorData.position || ''
                });
              }
            }}
            className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-3 sm:py-4 rounded-[1.8rem] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-glow-indigo' : 'text-gray-500 hover:text-white'}`}
          >
            <User className="h-4 w-4" /> Perfil
          </button>
        </div>

        {activeTab === 'sessions' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* NOVIDADES / PENDENTES */}
            {pendingRequests.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <Users className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight italic">Novas <span className="text-orange-500">Solicitações</span></h2>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Avalie e aprove agora os novos mentorados</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500 text-white font-black px-4 py-1.5 rounded-full border-none shadow-glow-orange animate-pulse">
                    {pendingRequests.length} NOVOS
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map(session => (
                    <Card key={session.id} className="bg-dark-200/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-orange-500/30 transition-all duration-500 flex flex-col shadow-2xl">
                      <div className="p-8 flex-1 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                              <User className="h-8 w-8 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-white font-black text-lg tracking-tight leading-none mb-1 uppercase truncate w-32">{session.menteeName}</p>
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black">{session.topic}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Horário</p>
                            <p className="text-white font-black text-lg tracking-tighter leading-none">
                              {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                          {(session.startupName || session.sector) && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest opacity-60">Negócio / Startup</p>
                              <div className="bg-dark-300/50 p-3 rounded-xl border border-white/5">
                                <p className="text-white font-bold text-xs flex items-center gap-2">
                                  <Building2 className="h-3 w-3 text-orange-500" /> {session.startupName || 'Não informado'}
                                </p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 mt-1 px-5">
                                  <BarChart className="h-2.5 w-2.5" /> ESTÁGIO: {session.sector || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest opacity-60">Desafio / Problema</p>
                            <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 relative">
                              <MessageSquare className="absolute top-3 right-3 h-4 w-4 text-orange-500/20" />
                              <p className="text-gray-300 text-[11px] leading-relaxed italic line-clamp-3">"{session.notes}"</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 pt-2">
                            {session.menteePhone && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="h-3 w-3 text-teal-500" /> {session.menteePhone}
                              </div>
                            )}
                            {session.menteeEmail && (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Mail className="h-3 w-3 text-teal-500" /> Email vinculado
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 flex gap-3">
                        <Button
                          onClick={() => update(session.id, { status: 'scheduled' })}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black text-xs py-5 rounded-2xl shadow-lg shadow-green-500/20"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> ACEITAR
                        </Button>
                        <Button
                          onClick={async () => {
                            if (!window.confirm('Recusar esta solicitação? O horário voltará a ficar disponível.')) return;
                            await update(session.id, { 
                              status: 'scheduled',
                              menteeId: null as any,
                              menteeName: 'Disponível' as any,
                              menteeEmail: '' as any,
                              menteePhone: '' as any,
                              topic: 'Disponível para Mentoria' as any,
                              notes: 'Slot de disponibilidade criado pelo mentor.' as any,
                              startupName: '' as any,
                              sector: '' as any
                            });
                            toast.success('Solicitação recusada. O horário está disponível novamente.');
                          }}
                          variant="ghost"
                          className="flex-1 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black text-xs py-5 rounded-2xl"
                        >
                          <XCircle className="h-4 w-4 mr-2" /> REJEITAR
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CONFIRMADAS */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <ShieldCheck className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight italic">Agenda <span className="text-teal-400">Confirmada</span></h2>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Suas próximas sessões de mentoria agendadas</p>
                </div>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingSessions.map(session => (
                    <Card key={session.id} className="bg-dark-200/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between group hover:bg-dark-100/50 transition-all border-l-4 border-l-teal-500">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center justify-center bg-teal-500/10 rounded-2xl px-5 py-3 border border-teal-500/20">
                          <p className="text-[9px] text-teal-400 font-black uppercase tracking-widest leading-none mb-1">Início</p>
                          <p className="text-white font-black text-2xl tracking-tighter leading-none">
                            {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-white font-black text-lg tracking-tight uppercase italic truncate w-32 md:w-full">{session.menteeName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 bg-dark-300 px-2 py-0.5 rounded-md border border-white/5">
                              <Building2 className="h-3 w-3 text-orange-500" />
                              <span className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[80px]">{session.startupName || 'Growth Business'}</span>
                            </div>
                            <Badge variant="outline" className="border-teal-500/20 text-teal-400 text-[8px] font-black truncate max-w-[100px]">{session.topic}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={async () => {
                            if (!window.confirm('Deseja realmente CANCELAR esta mentoria confirmada?')) return;
                            await update(session.id, { 
                              status: 'scheduled',
                              menteeId: null as any,
                              menteeName: 'Disponível' as any,
                              menteeEmail: '' as any,
                              menteePhone: '' as any,
                              topic: 'Disponível para Mentoria' as any,
                              notes: 'Slot de disponibilidade criado pelo mentor.' as any,
                              startupName: '' as any,
                              sector: '' as any
                            });
                            toast.success('Mentoria cancelada e horário liberado.');
                          }}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-12 h-12 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => window.open(`https://wa.me/55${session.menteePhone?.replace(/\D/g, '')}`, '_blank')}
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => update(session.id, { status: 'completed' })}
                          className="bg-teal-500 hover:bg-teal-600 text-white font-black px-6 h-12 rounded-2xl shadow-glow-teal hidden sm:flex"
                        >
                          FINALIZAR
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-dark-200/30 rounded-[3rem] border border-dashed border-white/5">
                  <Calendar className="h-12 w-12 text-gray-700 mx-auto mb-4 opacity-20" />
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Nenhuma mentoria confirmada para hoje</p>
                </div>
              )}
            </div>

            {/* HISTÓRICO / FINALIZADAS */}
            <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex items-center gap-4 px-2 opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-white/5">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight italic">Histórico de <span className="text-gray-500">Mentorias</span></h2>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Sessões concluídas com sucesso</p>
                </div>
              </div>

              {mentorSessions.filter(s => s.status === 'completed' || (s.status as string) === 'concluido').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mentorSessions.filter(s => s.status === 'completed' || (s.status as string) === 'concluido').map(session => (
                    <div key={session.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-dark-400 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xs uppercase truncate w-24">{session.menteeName}</p>
                          <p className="text-gray-500 text-[9px] font-bold">{new Date(session.scheduledAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">CONCLUÍDO</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-700 text-[9px] font-black uppercase tracking-[0.2em]">Nenhum histórico disponível</p>
              )}
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          /* PROFILE TABS */
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column: Quick Actions & Profile Summary */}
              <div className="space-y-6">
                <Card className="bg-dark-200/50 border border-white/5 rounded-[2.5rem] p-8 text-center">
                  <div className="w-24 h-24 rounded-3xl mx-auto mb-6 bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-1 border border-white/10 overflow-hidden">
                    <img src={mentorData?.photo} alt={mentorData?.name} className="w-full h-full object-cover rounded-[1.4rem]" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{mentorData?.name}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{mentorData?.position} @ {mentorData?.company}</p>
                  
                  <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                    <Button 
                      className="w-full bg-white/5 hover:bg-white/10 text-white font-black text-xs h-12 rounded-2xl"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      {isEditingProfile ? 'CANCELAR EDIÇÃO' : 'EDITAR PERFIL'}
                    </Button>
                    <Button 
                      variant="ghost"
                      className="w-full text-red-500 hover:bg-red-500/10 font-black text-[10px] tracking-widest"
                      onClick={handleLogout}
                    >
                      SAIR DA CONTA
                    </Button>
                  </div>
                </Card>

                <div className="bg-teal-500/5 border border-teal-500/10 rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                      <BarChart className="h-4 w-4" />
                    </div>
                    <span className="text-white font-black text-[10px] uppercase tracking-widest">Impacto Mental</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Média Avaliação</p>
                      <p className="text-white font-black text-xl">{avgRating}/5</p>
                    </div>
                    <div className="bg-dark-300/50 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Recomendação</p>
                      <p className="text-white font-black text-xl">{recommendationRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Form or Profile Detail */}
              <div className="lg:col-span-2">
                <Card className="bg-dark-200/50 border border-white/5 rounded-[2.5rem] p-8 md:p-10 h-full">
                  {!isEditingProfile ? (
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                          <Plus className="h-3 w-3" /> Especialidades & Track
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(mentorData?.specialties)
                            ? mentorData.specialties
                            : typeof mentorData?.specialties === 'string' && mentorData.specialties
                              ? mentorData.specialties.split(',')
                              : ['Marketing', 'Growth', 'Vendas']
                          ).map((s: any, i: number) => (
                            <Badge key={i} className="bg-white/5 text-gray-300 border border-white/10 px-4 py-2 rounded-xl font-bold text-xs">
                              {String(s).trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                          <Plus className="h-3 w-3" /> Biografia Profissional
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap italic">
                          "{mentorData?.bio || 'Nenhuma biografia informada ainda. Clique em Editar Perfil para adicionar.'}"
                        </p>
                      </div>

                      <div className="bg-dark-300/30 p-6 rounded-3xl border border-dashed border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Essas informações são exibidas para todos os participantes que buscam mentoria.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-black text-white italic tracking-tight mb-8">Editar <span className="text-orange-500">Dados Mentoria</span></h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nome de Exibição</label>
                          <input 
                            type="text" 
                            className="w-full bg-dark-400 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Especialidades (Sempre separadas por vírgula)</label>
                          <input 
                            type="text" 
                            className="w-full bg-dark-400 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            placeholder="Growth, SaaS, Vendas..."
                            value={profileForm.specialties}
                            onChange={(e) => setProfileForm({...profileForm, specialties: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Empresa</label>
                          <input 
                            type="text" 
                            className="w-full bg-dark-400 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={profileForm.company}
                            onChange={(e) => setProfileForm({...profileForm, company: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cargo</label>
                          <input 
                            type="text" 
                            className="w-full bg-dark-400 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all"
                            value={profileForm.position}
                            onChange={(e) => setProfileForm({...profileForm, position: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Mini Bio (Curta e Impactante)</label>
                        <textarea 
                          className="w-full bg-dark-400 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-orange-500/50 transition-all min-h-[120px] resize-none"
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        />
                      </div>

                      <div className="flex justify-end gap-4 pt-6">
                        <Button 
                          variant="ghost" 
                          className="px-8 h-14 rounded-2xl font-black text-gray-500 hover:text-white"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          DESCARTAR
                        </Button>
                        <Button 
                          className="px-10 h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-glow-orange"
                          onClick={async () => {
                            try {
                              if (!mentorData?.id) return;
                              await updateMentorProfile(mentorData.id, profileForm as any);
                              toast.success('Perfil atualizado com sucesso!');
                              setIsEditingProfile(false);
                            } catch (err) {
                              toast.error('Erro ao salvar perfil.');
                            }
                          }}
                        >
                          SALVAR ALTERAÇÕES
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* SLOTS / MANAGEMENT TAB */
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Slot Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-200/50 border border-white/5 rounded-3xl p-6">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Slots Totais</p>
                <p className="text-white font-black text-2xl">{MENTORSHIP_TIME_SLOTS.length}</p>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-3xl p-6">
                <p className="text-teal-500 text-[10px] font-bold uppercase tracking-widest mb-1">Disponíveis</p>
                <p className="text-white font-black text-2xl">{availableSlots.length}</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6">
                <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-1">Reservados</p>
                <p className="text-white font-black text-2xl">{upcomingSessions.length}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6">
                <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-1">Pendentes</p>
                <p className="text-white font-black text-2xl">{pendingRequests.length}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-xl shadow-teal-500/5">
                  <Settings className="h-7 w-7 text-teal-500" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight italic">Configurar <span className="text-teal-400">Slots 20min</span></h2>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Habilite ou desabilite os horários para mentorados selecionarem</p>
                </div>
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-3 bg-dark-200/50 p-2 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-2">Dia do Evento:</p>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-dark-300 border-none rounded-xl px-4 py-2 text-white font-bold text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  <option value={new Date().toISOString().split('T')[0]}>Hoje ({new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})</option>
                  {selectedProject?.startDate && (
                    Array.from({ length: 3 }).map((_, i) => {
                      const d = new Date(selectedProject.startDate!);
                      d.setDate(d.getDate() + i);
                      const val = d.toISOString().split('T')[0];
                      return <option key={val} value={val}>{d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</option>
                    })
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Morning Shift */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Sun className="h-4 w-4" />
                  </div>
                  <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Manhã <span className="text-orange-500">08:00 - 12:00</span></h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MENTORSHIP_TIME_SLOTS.filter(s => parseInt(s.startTime.split(':')[0]) < 13).map(slot => {
                    const status = getSlotStatus(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => status !== 'booked' && status !== 'pending' && toggleSlotAvailability(slot.id)}
                        disabled={status === 'booked' || status === 'pending'}
                        className={`group p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${status === 'available' ? 'bg-teal-500 text-white border-teal-400 shadow-glow-teal scale-105 z-10' :
                            status === 'booked' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 cursor-not-allowed' :
                              status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 cursor-not-allowed' :
                                'bg-dark-200 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                          }`}
                      >
                        <p className="text-xs font-black tracking-tighter">{slot.label}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                          {status === 'available' ? 'HABILITADO' : status === 'booked' ? 'RESERVADO' : status === 'pending' ? 'AGUARDANDO' : 'DESATIVADO'}
                        </p>
                        {status === 'available' && <CheckCircle className="absolute -bottom-1 -right-1 h-8 w-8 opacity-10" />}
                        {status === 'empty' && <Plus className="h-3 w-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Afternoon Shift */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                    <Moon className="h-4 w-4" />
                  </div>
                  <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Tarde <span className="text-teal-400">14:00 - 17:00</span></h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MENTORSHIP_TIME_SLOTS.filter(s => parseInt(s.startTime.split(':')[0]) >= 14).map(slot => {
                    const status = getSlotStatus(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => status !== 'booked' && status !== 'pending' && toggleSlotAvailability(slot.id)}
                        disabled={status === 'booked' || status === 'pending'}
                        className={`group p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ${status === 'available' ? 'bg-teal-500 text-white border-teal-400 shadow-glow-teal scale-105 z-10' :
                            status === 'booked' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 cursor-not-allowed' :
                              status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 cursor-not-allowed' :
                                'bg-dark-200 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                          }`}
                      >
                        <p className="text-xs font-black tracking-tighter">{slot.label}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">
                          {status === 'available' ? 'HABILITADO' : status === 'booked' ? 'RESERVADO' : status === 'pending' ? 'AGUARDANDO' : 'DESATIVADO'}
                        </p>
                        {status === 'available' && <CheckCircle className="absolute -bottom-1 -right-1 h-8 w-8 opacity-10" />}
                        {status === 'empty' && <Plus className="h-3 w-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-8 flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-lg">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">Como Funciona a Disponibilidade</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Clique sobre o horário para habilitá-lo ou desabilitá-lo.
                  </li>
                  <li className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Horários habilitados aparecem instantaneamente para os participantes.
                  </li>
                  <li className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    Spots de 20 minutos são fixos e otimizados para rotatividade.
                  </li>
                  <li className="flex items-center gap-3 text-gray-400 text-[11px] font-bold font-italic">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-orange-500">IMPORTANTE:</span> Você receberá uma notificação quando alguém solicitar um spot. Lembre-se de Aceitar ou Rejeitar na aba "Mentorias".
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern High-End Bottom Navigation (Mobile Only) */}
      <BottomNavigation
        variant="orange"
        activeTab={activeTab}
        setActiveTab={(id) => {
          setActiveTab(id as any);
          if (id === 'profile' && mentorData) {
            setProfileForm({
              name: mentorData.name || '',
              specialties: Array.isArray(mentorData.specialties) ? mentorData.specialties.join(', ') : mentorData.specialties || '',
              bio: mentorData.bio || '',
              company: mentorData.company || '',
              position: mentorData.position || ''
            });
          }
        }}
        tabs={[
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'sessions', icon: Calendar, label: 'Agenda' },
          { id: 'slots', icon: Clock, label: 'Horários' },
          { id: 'profile', icon: User, label: 'Perfil' },
        ]}
      />
    </div>
  );
}
