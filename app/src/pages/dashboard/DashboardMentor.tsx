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
import { motion } from 'framer-motion';

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
  const unreadNotifications = notificationsData?.filter(n => !n.isRead).length || 0;

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

      const slotsToCreate = [];
      let current = new Date(startDateTime);
      while (current < endDateTime) {
        slotsToCreate.push({
          mentorId: mentorData.id,
          mentorName: mentorData.name,
          menteeId: '',
          menteeName: '',
          status: 'scheduled',
          scheduledAt: current.toISOString(),
          duration: 30,
          topic: 'Disponibilidade de Mentoria',
          notes: ''
        });
        current = new Date(current.getTime() + 30 * 60000);
      }

      const loadingToast = toast.loading(`Abrindo ${slotsToCreate.length} horários...`);
      for (const slot of slotsToCreate) {
        await create(slot);
      }
      toast.dismiss(loadingToast);
      toast.success(`${slotsToCreate.length} horários abertos com sucesso!`);
      form.reset();
    } catch {
      toast.error('Erro ao abrir horários.');
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
                    {mentorData?.photo ? (
                      <img src={mentorData.photo} alt={mentorData?.name} className="w-full h-full object-cover" />
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
                <PopoverContent className="w-96 bg-[#1a1c1e] border-white/5 p-5 rounded-[2rem] shadow-3xl">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="text-white font-black text-lg tracking-tight">Notificações</h3>
                    <button className="text-[10px] text-brand-orange-coral hover:brightness-125 uppercase tracking-[0.2em] font-black transition-all">
                      LIMPAR
                    </button>
                  </div>
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    {notificationsData && notificationsData.length > 0 ? (
                      notificationsData.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                          className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer group ${n.isRead ? 'bg-white/[0.02] border-transparent opacity-50' : 'bg-[#251b18] border-brand-orange-coral/20 hover:border-brand-orange-coral/40'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white text-sm font-black group-hover:text-brand-orange-coral transition-colors">{n.title}</p>
                            <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider">{formatRelativeTime(n.createdAt)}</span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed font-medium">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <Bell className="h-8 w-8 text-gray-800 mx-auto mb-3 opacity-20" />
                        <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">Nenhuma notificação</p>
                      </div>
                    )}
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
                  <form onSubmit={handleOpenSlots} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                      <input
                        name="slotDate"
                        type="date"
                        required
                        className="w-full bg-dark-200 border border-dark-300 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Início</label>
                        <input
                          name="slotTime"
                          type="time"
                          required
                          className="w-full bg-dark-200 border border-dark-300 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Término</label>
                        <input
                          name="slotEndTime"
                          type="time"
                          required
                          className="w-full bg-dark-200 border border-dark-300 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold">
                      GERAR SPOTS 30min
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
                            <div className="flex flex-col gap-1">
                              {session.feedback.avaliacaoMentoria && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                                  <span className="text-white text-xs">Mentoria: {session.feedback.avaliacaoMentoria}/5</span>
                                </div>
                              )}
                              {session.feedback.indicacaoMentor && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-orange-400 fill-orange-400 mr-1" />
                                  <span className="text-white text-xs">Indicação: {session.feedback.indicacaoMentor}/5</span>
                                </div>
                              )}
                              {!session.feedback.avaliacaoMentoria && session.feedback.rating && (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                                  <span className="text-white text-xs">{session.feedback.rating}/5</span>
                                </div>
                              )}
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
            <MentorDataTab mentorData={mentorData} />
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
