import { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  Pencil,
  Save,
  X,
  Loader2,
  Camera,
  Linkedin
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMentoringSessions, useMentors, useNotifications } from '@/hooks/useData';
import type { MentoringSession } from '@/types';
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

import { PremiumHeader } from './components/shared/PremiumHeader';
import { PremiumBackground } from './components/shared/PremiumBackground';
import { QuickActions } from './components/shared/QuickActions';
import { B2BFormModal } from '@/components/forms/B2BFormModal';
import { StartupFormModal } from '@/components/forms/StartupFormModal';

import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { logger } from '@/lib/logger';
import { areasMentoria } from '@/data/mentores';

const ESPECIALIDADES_MENTOR = areasMentoria;

// ── MentorDataTab: Edição inline de dados do mentor ──────────────────────────
function MentorDataTab({ mentorData }: { mentorData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: mentorData?.name || '',
    company: mentorData?.company || '',
    position: mentorData?.position || '',
    bio: mentorData?.bio || '',
    linkedin: mentorData?.linkedin || '',
    yearsExperience: mentorData?.yearsExperience || 0,
    maxMentories: mentorData?.maxMentories || 5,
    specialties: (mentorData?.specialties || []) as string[],
    photoPreview: mentorData?.photo || '',
    photoFile: null as File | null,
  });

  // Sincroniza form quando mentorData chegar (dados assíncronos)
  useEffect(() => {
    if (!mentorData) return;
    setForm(prev => ({
      ...prev,
      name: mentorData.name || '',
      company: mentorData.company || '',
      position: mentorData.position || '',
      bio: mentorData.bio || '',
      linkedin: mentorData.linkedin || '',
      yearsExperience: mentorData.yearsExperience || 0,
      maxMentories: mentorData.maxMentories || 5,
      specialties: mentorData.specialties || [],
      photoPreview: mentorData.photo || '',
    }));
  }, [mentorData?.id]); // só resincroniza se mudar de mentor

  // Early return APÓS todos os hooks (regra dos hooks do React)
  if (!mentorData) {
    return (
      <div className="glass-card p-12 text-center border-white/5">
        <Briefcase className="h-10 w-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Carregando dados do mentor...</p>
      </div>
    );
  }


  const toggleSpec = (spec: string) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : prev.specialties.length < 5
          ? [...prev.specialties, spec]
          : prev.specialties
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida.'); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 3MB.'); return; }
    setForm(prev => ({ ...prev, photoFile: file, photoPreview: URL.createObjectURL(file) }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      let photoUrl = mentorData?.photo || '';
      if (form.photoFile) {
        setIsUploading(true);
        const ext = form.photoFile.name.split('.').pop();
        const path = `mentores/${mentorData.id}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from('event-images').upload(path, form.photoFile, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from('event-images').getPublicUrl(path);
        photoUrl = data.publicUrl;
        setIsUploading(false);
      }

      const { error: updateError } = await (supabase.from('mentores_growth_experience' as any) as any)
        .update({
          nome: form.name,
          empresa: form.company,
          cargo: form.position,
          bio: form.bio,
          linkedin_url: form.linkedin,
          years_experience: Number(form.yearsExperience),
          max_mentories: Number(form.maxMentories),
          especialidades: form.specialties,
          foto_url: photoUrl,
        })
        .eq('id', mentorData.id);

      if (updateError) throw updateError;

      toast.success('Perfil de mentor atualizado com sucesso!');
      setIsEditing(false);
    } catch (err: any) {
      logger.error('Erro ao salvar perfil mentor:', err);
      toast.error('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-300">
        <div>
          <h2 className="text-xl font-bold text-white">Informações de Mentor</h2>
          <p className="text-gray-500 text-xs mt-1">Dados visíveis para os participantes na plataforma</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-bold transition-all"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-black transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-black transition-all border border-teal-500/20 hover:border-teal-500/40"
          >
            <Pencil className="h-4 w-4" /> Editar Perfil
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-8">
          {/* Foto */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500/20 to-teal-700/20 border-2 border-dashed border-teal-500/30 overflow-hidden flex items-center justify-center">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 bg-teal-500 hover:bg-teal-600 p-2 rounded-xl text-white shadow-lg transition-all"
              >
                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
            </div>
            <p className="text-xs text-gray-500">Clique no ícone para alterar • Máx. 3MB</p>
          </div>

          {/* Dados */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-dark-100 border-dark-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</label>
              <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="bg-dark-100 border-dark-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cargo</label>
              <Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className="bg-dark-100 border-dark-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn</label>
              <Input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} className="bg-dark-100 border-dark-300" placeholder="linkedin.com/in/..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anos de Experiência</label>
              <Input type="number" min={0} max={60} value={form.yearsExperience} onChange={e => setForm(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))} className="bg-dark-100 border-dark-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vagas de Mentoria</label>
              <Input type="number" min={1} max={50} value={form.maxMentories} onChange={e => setForm(p => ({ ...p, maxMentories: parseInt(e.target.value) || 1 }))} className="bg-dark-100 border-dark-300" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={4}
              className="w-full bg-dark-100 border border-dark-300 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
              placeholder="Sua trajetória profissional..."
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Especialidades ({form.specialties.length}/5)</label>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_MENTOR.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${form.specialties.includes(spec)
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* View mode */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 p-0.5 shadow-lg shadow-orange-500/20 flex-shrink-0">
              <div className="w-full h-full bg-dark-300 rounded-[calc(1.5rem-2px)] flex items-center justify-center overflow-hidden">
                {mentorData?.photo ? (
                  <img src={mentorData.photo} alt={mentorData.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-orange-400" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{mentorData.name}</h3>
              <p className="text-orange-400 font-bold">{mentorData.position}</p>
              <p className="text-gray-400 text-sm">{mentorData.company}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: 'Email', value: mentorData.email },
              { label: 'LinkedIn', value: mentorData.linkedin || 'Não informado' },
              { label: 'Anos de Experiência', value: `${mentorData.yearsExperience || 0} anos` },
              { label: 'Vagas de Mentoria', value: `${mentorData.maxMentories || 0} slots` },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Bio</p>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{mentorData.bio || 'Não informado.'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-3">Especialidades</p>
            <div className="flex flex-wrap gap-2">
              {(mentorData.specialties || []).map((spec: string, i: number) => (
                <Badge key={i} className="bg-teal-500/20 text-teal-400 border border-teal-500/20 px-3 py-1">
                  {spec}
                </Badge>
              ))}
              {(!mentorData.specialties?.length) && <p className="text-gray-600 text-sm italic">Nenhuma especialidade cadastrada.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export function DashboardMentor() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: sessions } = useMentoringSessions();
  const { data: mentors } = useMentors();
  const { data: notificationsData, update: updateNotification } = useNotifications();
  const unreadNotifications = notificationsData?.filter(n => !n.read).length || 0;

  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [isMentoriaModalOpen, setIsMentoriaModalOpen] = useState(false);

  const mentorData = mentors.find(m => m.userId === user?.id);
  const mentorSessions = sessions.filter(s => s.mentorId === mentorData?.id);

  const stats = {
    total: mentorSessions.length,
    completed: mentorSessions.filter(s => s.status === 'completed').length,
    scheduled: mentorSessions.filter(s => s.status === 'scheduled').length,
    avgRating: mentorSessions
      .filter(s => s.feedback)
      .reduce((acc, s) => acc + (s.feedback?.avaliacaoMentoria || s.feedback?.rating || 0), 0) /
      mentorSessions.filter(s => s.feedback).length || 0,
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState<string>('agenda');

  const handleMarkAsRead = async (notifId: string) => {
    if (!notifId) return;
    try { await updateNotification(notifId, { read: true } as any); } catch { /* silent */ }
  };


  const { create, remove, update } = useMentoringSessions();


  const handleOpenSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorData) return;

    const form = e.target as HTMLFormElement;
    const date = form.slotDate.value;
    const startTime = form.slotTime.value;
    const endTime = form.slotEndTime.value;

    if (!date || !startTime || !endTime) {
      toast.error('Preencha os horários corretamente.');
      return;
    }

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      if (endDateTime <= startDateTime) {
        toast.error('O horário de encerramento deve ser após o de início.');
        return;
      }

      const slotsToCreate: Omit<MentoringSession, 'id' | 'createdAt'>[] = [];
      let current = new Date(startDateTime);
      while (current < endDateTime) {
        slotsToCreate.push({
          projectId: mentorData.projectId,
          mentorId: mentorData.id,
          mentorName: mentorData.name,
          menteeId: '',
          menteeName: '',
          status: 'scheduled' as const,
          scheduledAt: current.toISOString(),
          duration: 20,
          topic: 'Disponibilidade de Mentoria',
          notes: ''
        });
        current = new Date(current.getTime() + 20 * 60000);
      }

      const total = slotsToCreate.length;
      const loadingToast = toast.loading(`Abrindo ${total} horários de 20min...`);

      try {
        for (const slot of slotsToCreate) {
          await create(slot);
        }
        toast.dismiss(loadingToast);
        toast.success(`${total} horários abertos com sucesso!`);
        form.reset();
      } catch (err: any) {
        toast.dismiss(loadingToast);
        throw err;
      }
    } catch (err: any) {
      console.error('Erro ao abrir horários:', err);
      toast.error('Erro ao abrir horários. ' + (err.message || ''));
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

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMin = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMin < 1) return 'Agora';
    if (diffInMin < 60) return `${diffInMin} min atrás`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark-400 mesh-gradient pb-32"
    >
      <PremiumBackground />

      <PremiumHeader
        userName={mentorData?.name || user?.name}
        userAvatar={mentorData?.photo}
        projectName="GROWTH SUMMIT 2026"
        roleLabel="MENTOR OFICIAL"
        isPro={true}
        statusFinanceiro={{ label: 'Ativo' }}
        notifications={notificationsData || []}
        onLogout={handleLogout}
        onGuideClick={() => navigate('/guia')}
        onNotificationRead={handleMarkAsRead}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex-1">
            <QuickActions
              onB2BClick={() => setIsB2BModalOpen(true)}
              onStartupClick={() => setIsStartupModalOpen(true)}
              showMentoria={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section with Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Mentorias', value: stats.total, color: 'teal' },
            { label: 'Concluídas', value: stats.completed, color: 'green' },
            { label: 'Agendadas', value: stats.scheduled, color: 'blue' },
            { label: 'Avaliação Média', value: stats.avgRating.toFixed(1), color: 'yellow', icon: Star }
          ].map((stat, i) => (
            <div key={i} className={`p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group`}>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">{stat.label}</p>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-black text-white group-hover:scale-110 transition-transform ${stat.color === 'green' ? 'text-green-400' : ''} ${stat.color === 'blue' ? 'text-blue-400' : ''} ${stat.color === 'yellow' ? 'text-yellow-400' : ''}`}>
                  {stat.value}
                </span>
                {stat.icon && <stat.icon className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse" />}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'agenda' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white italic uppercase tracking-tight">Agenda Personalizada</h2>
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">Sessões agendadas com participantes confirmados</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {mentorSessions
                    .filter(s => s.status === 'scheduled' && s.menteeId)
                    .map((session) => (
                      <div key={session.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all border-l-4 border-l-teal-500">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="lg:w-32 bg-teal-500/10 p-4 rounded-2xl border border-teal-500/10 text-center">
                            <p className="text-teal-400 font-black text-xs">
                              {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-white font-black text-lg mt-1">
                              {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-black text-xl italic uppercase font-black">{session.menteeName}</p>
                            {session.topic && (
                              <p className="text-teal-400 font-bold text-sm tracking-tight mt-1">{session.topic}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button className="bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl border border-white/10">
                                  <CalendarDays className="h-4 w-4 mr-2" />
                                  Sincronizar
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-[#1a1c1e] border-white/5 p-2 rounded-2xl shadow-2xl">
                                <DropdownMenuItem className="text-white hover:bg-teal-500/20 rounded-xl cursor-pointer p-3" asChild>
                                  <a href={generateGoogleCalendarLink(session)} target="_blank" rel="noopener noreferrer">
                                    Google Calendar
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-white hover:bg-teal-500/20 rounded-xl cursor-pointer p-3" asChild>
                                  <a href={generateICalLink(session)} download="mentoria.ics">
                                    iCal / Outlook
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-black rounded-xl border border-teal-500/20">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                            <Button
                              className="bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-500/20"
                              onClick={() => update(session.id, { status: 'completed' })}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Concluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {mentorSessions.filter(s => s.status === 'scheduled' && s.menteeId).length === 0 && (
                    <div className="p-20 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                      <Calendar className="h-16 w-16 text-gray-800 mx-auto mb-6 opacity-30" />
                      <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Sem mentorias agendadas</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'slots' && (
              <div className="grid lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4">
                  <div className="p-8 bg-white/5 border border-teal-500/20 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Plus className="h-24 w-24 text-teal-500" />
                    </div>
                    <h3 className="text-white font-black text-xl uppercase italic tracking-tight mb-8 flex items-center gap-3">
                      <Plus className="h-6 w-6 text-teal-400" />
                      Novo Horário
                    </h3>
                    <form onSubmit={handleOpenSlots} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Data da Sessão</label>
                        <input
                          name="slotDate"
                          type="date"
                          required
                          className="w-full bg-dark-200 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Início</label>
                          <input
                            name="slotTime"
                            type="time"
                            required
                            className="w-full bg-dark-200 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Término</label>
                          <input
                            name="slotEndTime"
                            type="time"
                            required
                            className="w-full bg-dark-200 border border-white/5 rounded-2xl px-4 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 h-16 text-white font-black rounded-2xl shadow-xl shadow-teal-500/20 uppercase tracking-widest text-xs">
                        GERAR SPOTS 20min
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <h3 className="text-white font-black text-xl uppercase italic tracking-tight flex items-center gap-3">
                    <Clock className="h-6 w-6 text-teal-400" />
                    Horários em Aberto
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {mentorSessions
                      .filter(s => s.status === 'scheduled' && !s.menteeId)
                      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                      .map(slot => (
                        <div key={slot.id} className="p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/10">
                              <Calendar className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                              <p className="text-white font-black text-sm">{new Date(slot.scheduledAt).toLocaleDateString('pt-BR')}</p>
                              <p className="text-teal-400 font-bold text-xs">{new Date(slot.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            onClick={() => remove(slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>

                  {mentorSessions.filter(s => s.status === 'scheduled' && !s.menteeId).length === 0 && (
                    <div className="p-16 text-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
                      <Clock className="h-12 w-12 text-gray-800 mx-auto mb-4 opacity-30" />
                      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Nenhum horário aberto</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'historico' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white italic uppercase tracking-tight mb-8">Histórico de Sessões</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {mentorSessions
                    .filter(s => s.status === 'completed')
                    .map((session) => (
                      <div key={session.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/10 rounded-lg px-3 py-1 font-black text-[10px] tracking-widest">CONCLUÍDA</Badge>
                              {session.feedback && (
                                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/10 rounded-lg px-3 py-1 font-black text-[10px] tracking-widest flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400" />
                                  {(session.feedback.avaliacaoMentoria || session.feedback.rating || 0).toFixed(1)}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-white font-black text-2xl italic uppercase">{session.menteeName}</h4>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
                              {new Date(session.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        {session.topic && (
                          <div className="mb-6 p-4 bg-dark-200 rounded-2xl border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Tópico</p>
                            <p className="text-gray-300 font-bold text-sm tracking-tight">{session.topic}</p>
                          </div>
                        )}
                        <Button className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-black rounded-xl border border-white/10">
                          Ver Detalhes do Feedback
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'perfil' && (
              <div className="max-w-4xl mx-auto">
                <ProfileForm />
              </div>
            )}

            {activeTab === 'mentor_data' && (
              <div className="max-w-4xl mx-auto">
                <MentorDataTab mentorData={mentorData} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pb-8 md:pb-10 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-dark-200/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex items-center justify-around p-2 relative">
            {[
              { id: 'agenda', icon: Calendar, label: 'Agenda' },
              { id: 'slots', icon: Clock, label: 'Spots' },
              { id: 'historico', icon: TrendingUp, label: 'Histórico' },
              { id: 'mentor_data', icon: Briefcase, label: 'CV' },
              { id: 'perfil', icon: User, label: 'Perfil' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex flex-col items-center justify-center py-2 px-1 min-w-[50px] transition-all duration-500 ${isActive ? 'text-teal-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-teal-500/10 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'scale-100'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals integrated into QuickActions */}
      <B2BFormModal isOpen={isB2BModalOpen} onClose={() => setIsB2BModalOpen(false)} />
      <StartupFormModal isOpen={isStartupModalOpen} onClose={() => setIsStartupModalOpen(false)} />
    </motion.div>
  );
}
