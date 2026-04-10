import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, CheckCircle, Clock, XCircle, MessageSquare,
  Phone, Mail, Plus,
  ShieldCheck, Building2, BarChart,
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
import { GuiaInterno } from '@/components/app/GuiaInterno';

export default function DashboardMentor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProject } = useProject();
  const { data: mentorsData, update: updateMentorProfile } = useMentors();
  const { data: sessions, create, update, remove, isLoading } = useMentoringSessions();

  // Find current mentor profile
  const mentorData = mentorsData?.find(m => m.userId === user?.id || (m as any).email === user?.email);

  const [activeTab, setActiveTab] = useState<'home' | 'sessions' | 'slots' | 'profile' | 'guia'>('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialties: '',
    bio: '',
    company: '',
    roleTitle: ''
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

  const pendingRequests = mentorSessions.filter(s => s.status === 'pending');
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
    // Unify to 'read' schema to match Notification interface
    const { error } = await (supabase.from('notifications') as any).update({ read: true, read_at: new Date().toISOString() }).eq('id', id);
    if (error) console.error('Erro ao marcar notificação como lida:', error);
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
          topicOfInterest: 'Disponível para Mentoria',
          notes: 'Slot de disponibilidade criado pelo mentor.',
          // Required fields for GE table to satisfy NOT NULL constraints
          menteeName: 'Slot Livre',
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
    <div className="min-h-screen bg-dark-400 text-gray-100 flex flex-col font-sans selection:bg-orange-500/30 overflow-x-hidden">
      <PremiumBackground />

      <PremiumHeader
        userName={mentorData?.name || user?.name}
        userAvatar={mentorData?.photo}
        projectName="GROWTH EXPERIENCE 2026"
        roleLabel="MENTOR OFICIAL"
        notifications={notificationsData || []}
        onLogout={handleLogout}
        onGuideClick={() => setActiveTab('guia')}
        onNotificationRead={handleMarkAsRead}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 relative z-10">
        <div className="hidden md:flex items-center gap-2 bg-dark-200/50 p-1.5 rounded-[2rem] border border-white/5 self-start shadow-xl shadow-black/20 mb-8">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <Home className="h-4 w-4" /> Início
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <Calendar className="h-4 w-4" /> Mentorias
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'slots' ? 'bg-teal-500 text-white' : 'text-gray-500 hover:text-white'}`}
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
                  roleTitle: mentorData.roleTitle || ''
                });
              }
            }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:text-white'}`}
          >
            <User className="h-4 w-4" /> Perfil
          </button>
        </div>

        {activeTab === 'guia' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GuiaInterno role="mentor" />
          </div>
        ) : activeTab === 'home' ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
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
                subtitle={upcomingSessions[0].topicOfInterest || "Sessão de Mentoria"}
                time={new Date(upcomingSessions[0].scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                duration="20 min"
                isConfirmed={true}
                onClick={() => setActiveTab('sessions')}
              />
            )}
            <QuickActions onB2BClick={() => navigate('/b2b')} onMentoriaClick={() => setActiveTab('slots')} />
          </div>
        ) : activeTab === 'sessions' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
             <p className="text-gray-500 font-bold text-center py-20 uppercase tracking-widest">Seção de Mentorias em breve ou recarregue a página.</p>
          </div>
        ) : activeTab === 'profile' ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
             <p className="text-gray-500 font-bold text-center py-20 uppercase tracking-widest">Painel de Perfil em breve ou recarregue a página.</p>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
             <p className="text-gray-500 font-bold text-center py-20 uppercase tracking-widest">Gestão de Horários em breve ou recarregue a página.</p>
          </div>
        )}
      </div>

      <BottomNavigation
        variant="orange"
        activeTab={activeTab === 'guia' ? 'home' : activeTab}
        setActiveTab={(id) => setActiveTab(id as any)}
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
