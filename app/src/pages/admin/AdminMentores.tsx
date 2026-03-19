import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Briefcase,
  Calendar,
  Phone,
  UserPlus,
  MoreHorizontal,
  Loader2,
  Pencil,
  Save,
  User,
  Camera,
  Linkedin,
  Target,
  GraduationCap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMentors } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';
import { areasMentoria } from '@/data/mentores';
import { createAuthUserWithoutSession } from '@/lib/auth-helpers';


const ESPECIALIDADES = areasMentoria;


const statusColors: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400',
  aprovado: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  pendente: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
  rejeitado: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  approved: 'Aprovado',
  aprovado: 'Aprovado',
  pending: 'Pendente',
  pendente: 'Pendente',
  rejected: 'Rejeitado',
  rejeitado: 'Rejeitado',
};

// ── Modal de Detalhes do Mentor ─────────────────────────────────
function MentorDetailsModal({ mentor, onClose, onApprove, onReject, onDelete }: {
  mentor: any;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-3xl space-y-6 relative border-brand-orange-coral/20">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <XCircle className="h-6 w-6" />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-orange-coral to-brand-orange-intense flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-orange-coral/20">
            {mentor.photo ? (
              <img src={mentor.photo} alt={mentor.name} className="w-full h-full object-cover rounded-3xl" />
            ) : (
              mentor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black text-white mb-1">{mentor.name}</h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
              <p className="text-brand-orange-coral font-bold">{mentor.position}</p>
              <span className="text-gray-600">•</span>
              <p className="text-gray-400">{mentor.company}</p>
            </div>
            <div className="mt-3 flex gap-2">
              <Badge className={statusColors[mentor.status] || 'bg-gray-500/20 text-gray-400'}>
                {statusLabels[mentor.status] || mentor.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Informações de Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-3 text-brand-orange-coral" />
                <span className="text-sm">{mentor.email}</span>
              </div>
              {mentor.phone && (
                <div className="flex items-center text-gray-300">
                  <Phone className="h-4 w-4 mr-3 text-brand-orange-coral" />
                  <span className="text-sm">{mentor.phone}</span>
                </div>
              )}
              {mentor.linkedin && (
                <a
                  href={mentor.linkedin.startsWith('http') ? mentor.linkedin : `https://${mentor.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Briefcase className="h-4 w-4 mr-3" />
                  <span className="text-sm font-bold">LinkedIn Profile</span>
                </a >
              )}
            </div >
          </div >

          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Estatísticas do Evento</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Experiência</p>
                <p className="text-white font-bold">{mentor.yearsExperience || 0} anos</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Capacidade</p>
                <p className="text-white font-bold">{mentor.maxMentories || 0} slots</p>
              </div>
            </div>
          </div>
        </div >

        <div className="space-y-4">
          <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Biografia & Trajetória</h4>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {mentor.bio || 'Nenhuma biografia fornecida.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-black text-gray-500 uppercase tracking-widest">Especialidades</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.specialties?.length > 0 ? mentor.specialties.map((spec: string, i: number) => (
              <Badge key={i} className="bg-brand-orange-coral/10 text-brand-orange-coral border border-brand-orange-coral/20 px-3 py-1 font-bold">
                {spec}
              </Badge>
            )) : <span className="text-gray-600 text-sm italic">Nenhuma especialidade listada.</span>}
          </div>
        </div>

        {['approved', 'aprovado'].includes(mentor.status) && (
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">Acesso do Mentor</p>
              <p className="text-gray-400 text-[10px] uppercase font-black">Enviar link de acesso direto via e-mail</p>
            </div>
            <Button
              size="sm"
              className="bg-teal-500 hover:bg-teal-600 text-white font-black text-xs h-10 px-6 rounded-xl shadow-lg shadow-teal-500/20"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOtp({
                    email: mentor.email,
                    options: { emailRedirectTo: `${window.location.origin}/login` }
                  });
                  if (error) throw error;
                  toast.success('Link mágico enviado com sucesso para o e-mail do mentor!');
                } catch (err: any) {
                  logger.error('Erro ao enviar link mágico:', err);
                  toast.error('Erro ao enviar link mágico: ' + err.message);
                }
              }}
            >
              <Mail className="h-4 w-4 mr-2" /> ENVIAR LINK MÁGICO
            </Button>
          </div>
        )}

        <div className="flex gap-3 pt-6 border-t border-white/5">
          {['pending', 'pendente'].includes(mentor.status) ? (
            <>
              <Button
                onClick={() => { onApprove(mentor.id); onClose(); }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-2xl"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Aprovar Mentor
              </Button>
              <Button
                onClick={() => { onReject(mentor.id); onClose(); }}
                variant="outline"
                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 font-bold h-12 rounded-2xl"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Rejeitar Candidatura
              </Button>
            </>
          ) : (
            <div className="flex w-full gap-2 font-black">
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/login?email=${encodeURIComponent(mentor.email)}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Link de login copiado (o mentor precisará do OTP/Email)');
                }}
                className="flex-1 border-white/10 text-gray-400 hover:text-white font-bold h-12 rounded-2xl"
              >
                Copiado Link de Login
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-2xl border border-white/10"
              >
                Fechar Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={() => { if (confirm('Excluir permanentemente este mentor?')) { onDelete(mentor.id); onClose(); } }}
                className="text-red-500 hover:bg-red-500/10 h-12 w-12 rounded-2xl p-0 flex items-center justify-center"
                title="Excluir Mentor"
              >
                <XCircle className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>
      </div >
    </div >
  );
}

// ── Modal de Edição do Mentor ─────────────────────────────────────────────────
function MentorEditModal({ mentor, onClose, onSave }: {
  mentor: any;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: mentor.name || '',
    email: mentor.email || '',
    phone: mentor.phone || '',
    company: mentor.company || '',
    position: mentor.position || '',
    bio: mentor.bio || '',
    linkedin: mentor.linkedin || '',
    yearsExperience: mentor.yearsExperience || 0,
    maxMentories: mentor.maxMentories || 5,
    specialties: (mentor.specialties || []) as string[],
    photoPreview: mentor.photo || '',
    photoFile: null as File | null,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      let photoUrl = mentor.photo || '';

      // Upload nova foto se selecionada
      if (form.photoFile) {
        setIsUploading(true);
        const ext = form.photoFile.name.split('.').pop();
        const path = `mentores/${mentor.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(path, form.photoFile, { upsert: true });
        if (uploadError) throw new Error('Erro no upload da foto: ' + uploadError.message);
        const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
        setIsUploading(false);
      }

      await onSave(mentor.id, {
        name: form.name,
        phone: form.phone,
        company: form.company,
        position: form.position,
        bio: form.bio,
        linkedin: form.linkedin,
        yearsExperience: Number(form.yearsExperience),
        maxMentories: Number(form.maxMentories),
        specialties: form.specialties,
        photo: photoUrl,
      });

      toast.success('Mentor atualizado com sucesso!');
      onClose();
    } catch (err: any) {
      logger.error('Erro ao editar mentor:', err);
      toast.error('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="glass-card max-w-2xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border-teal-500/20 relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-dark-200/95 backdrop-blur-xl px-8 py-6 border-b border-white/5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Pencil className="h-5 w-5 text-teal-400" />
              Editar Mentor
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">{mentor.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2.5 rounded-xl">
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Foto */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-teal-500/20 to-teal-700/20 border-2 border-dashed border-teal-500/30 overflow-hidden flex items-center justify-center group-hover:border-teal-500/60 transition-all">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-500" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 bg-teal-500 hover:bg-teal-600 p-2.5 rounded-2xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                title="Alterar foto"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
            </div>
            <p className="text-xs text-gray-500">Clique no ícone para alterar a foto • JPEG, PNG, WebP • Máx. 3MB</p>
          </div>

          {/* Dados pessoais */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4 w-4 text-teal-400" /> Dados Pessoais
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nome Completo *</label>
                <Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-dark-100 border-dark-300 h-11" placeholder="Nome do mentor" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">E-mail (não editável)</label>
                <Input value={form.email} disabled className="bg-dark-100 border-dark-300 h-11 opacity-50 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">WhatsApp</label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-dark-100 border-dark-300 h-11" placeholder="(88) 99999-9999" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">LinkedIn</label>
                <Input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} className="bg-dark-100 border-dark-300 h-11" placeholder="linkedin.com/in/..." />
              </div>
            </div>
          </div>

          {/* Carreira */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal-400" /> Carreira
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Empresa</label>
                <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="bg-dark-100 border-dark-300 h-11" placeholder="Nome da empresa" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cargo</label>
                <Input value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className="bg-dark-100 border-dark-300 h-11" placeholder="Ex: CEO, Diretor..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Anos de Experiência</label>
                <Input type="number" min={0} max={60} value={form.yearsExperience} onChange={e => setForm(p => ({ ...p, yearsExperience: parseInt(e.target.value) || 0 }))} className="bg-dark-100 border-dark-300 h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Capacidade de Mentorias</label>
                <Input type="number" min={1} max={50} value={form.maxMentories} onChange={e => setForm(p => ({ ...p, maxMentories: parseInt(e.target.value) || 1 }))} className="bg-dark-100 border-dark-300 h-11" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bio / Trajetória Profissional</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                rows={4}
                placeholder="Conte um pouco sobre a trajetória deste mentor..."
                className="w-full bg-dark-100 border border-dark-300 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Especialidades */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-teal-400" /> Especialidades
              <span className="text-gray-600 font-normal normal-case tracking-normal">({form.specialties.length}/5 selecionadas)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${form.specialties.includes(spec)
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="h-4 w-4" /> Salvar Alterações</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminMentores() {
  const { projectId } = useProject();
  const { data: mentors, create, update, remove, isLoading } = useMentors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [editingMentor, setEditingMentor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    bio: '',
    specialties: [] as string[],
    linkedin: '',
    password: '',
    confirmPassword: '',
    photo: null as File | null,
    photoPreview: '',
    yearsExperience: 5,
    maxMentories: 10
  });


  // console.log('[AdminMentores] Render', { mentorsCount: mentors.length, projectId });

  const filteredMentors = useMemo(() => {
    return mentors.filter(mentor => {
      const matchesSearch =
        (mentor.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (mentor.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (mentor.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mentors, searchQuery, statusFilter]);

  // Auto-scroll to top when step changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      // ── STEP 1: Garantir conta no Supabase Auth
      let authUserId: string | undefined;
      try {
        const authUser = await createAuthUserWithoutSession({
          email: formData.email,
          password: formData.password || 'Growth@2026', // Senha padrão se não informada
          name: formData.name,
          phone: formData.phone,
          role: 'mentor'
        });
        authUserId = authUser?.id;
        logger.info('[AdminMentores] Conta Auth criada/verificada para mentor:', { email: formData.email, authUserId });
      } catch (authErr: any) {
        // Se o erro for "usuário já existe", apenas ignoramos e prosseguimos para criar o perfil
        const msg = authErr.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('email matching')) {
          logger.info('[AdminMentores] Usuário já existe no Auth, prosseguindo com criação de perfil.');
        } else {
          throw authErr;
        }
      }

      // ── STEP 2: Upload da Foto
      let photoUrl = '';
      if (formData.photo) {
        const file = formData.photo;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `mentores/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        photoUrl = urlData.publicUrl;
      }

      // ── STEP 3: Criar perfil de Mentor
      await create({
        userId: authUserId, // Vincula ao ID do Auth
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        position: formData.position,
        bio: formData.bio,
        yearsExperience: formData.yearsExperience,
        maxMentories: formData.maxMentories,
        specialties: formData.specialties,
        linkedin: formData.linkedin,
        photo: photoUrl,
        status: 'approved',
        projectId: projectId || 'manual',
      } as any);

      toast.success('Mentor adicionado com sucesso e conta criada!');
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      logger.error('Erro ao adicionar mentor:', err);
      toast.error('Erro ao adicionar mentor: ' + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      bio: '',
      specialties: [],
      linkedin: '',
      password: '',
      confirmPassword: '',
      photo: null,
      photoPreview: '',
      yearsExperience: 5,
      maxMentories: 10
    });
  };

  const toggleSpecialty = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : prev.specialties.length < 3
          ? [...prev.specialties, spec]
          : prev.specialties
    }));
  };

  const handleApprove = useCallback(async (id: string) => {
    const mentor = mentors.find(m => m.id === id);
    if (!mentor) return;

    try {
      // Se o mentor não tem vínculo com Auth, tentamos criar a conta agora
      if (!mentor.userId) {
        logger.info('[AdminMentores] Mentor sem userId detectado ao aprovar. Criando conta Auth...', { email: mentor.email });

        try {
          const authUser = await createAuthUserWithoutSession({
            email: mentor.email,
            password: 'Growth@2026', // Senha padrão (usuário deve mudar no primeiro acesso)
            name: mentor.name,
            role: 'mentor'
          });

          if (authUser?.id) {
            await update(id, { userId: authUser.id, status: 'approved' } as any);
            toast.success('Mentor aprovado e conta de acesso criada!');
            return;
          }
        } catch (authErr: any) {
          const msg = authErr.message?.toLowerCase() || '';
          if (msg.includes('already registered') || msg.includes('email matching')) {
            logger.warn('[AdminMentores] Usuário já existe no Auth mas não estava vinculado ao perfil de mentor.');

            // Buscar o ID desse usuário existente pelo email
            const { data: existingUser } = await supabase.from('users').select('id').eq('email', mentor.email).maybeSingle();
            if (existingUser) {
              await supabase.from('users').update({ role: 'mentor' }).eq('id', existingUser.id);
              await update(id, { userId: existingUser.id, status: 'approved' } as any);
              toast.success('Mentor aprovado e permissões de acesso atualizadas!');
              return;
            }
          } else {
            throw authErr;
          }
        }
      }

      await update(id, { status: 'approved' });
      toast.success('Mentor aprovado com sucesso!');
    } catch (err: any) {
      logger.error('Erro ao aprovar mentor:', err);
      toast.error(`Erro ao aprovar mentor: ${err.message || 'Erro desconhecido'}`);
    }
  }, [update, mentors]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      if (confirm('Tem certeza que deseja excluir permanentemente este mentor?')) {
        await remove(id);
        toast.success('Mentor excluído com sucesso');
      }
    } catch (err: any) {
      logger.error('Erro ao excluir mentor:', err);
      toast.error(`Erro ao excluir mentor: ${err.message || 'Erro desconhecido'}`);
    }
  }, [remove]);

  const handleReject = useCallback(async (id: string) => {
    try {
      if (confirm('Tem certeza que deseja rejeitar este mentor?')) {
        await update(id, { status: 'rejected' });
        toast.success('Mentor rejeitado com sucesso');
      }
    } catch (err: any) {
      logger.error('Erro ao rejeitar mentor:', err);
      toast.error(`Erro ao rejeitar mentor: ${err.message || 'Erro desconhecido'}`);
    }
  }, [update]);

  const pendingCount = useMemo(() => mentors.filter(m => m.status === 'pending' || m.status === 'pendente').length, [mentors]);
  const approvedCount = useMemo(() => mentors.filter(m => m.status === 'approved' || m.status === 'aprovado').length, [mentors]);

  return (
    <div className="space-y-6">
      {selectedMentor && (
        <MentorDetailsModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
      {editingMentor && (
        <MentorEditModal
          mentor={editingMentor}
          onClose={() => setEditingMentor(null)}
          onSave={async (id, data) => {
            await update(id, data);
          }}
        />
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar mentor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 w-full sm:w-80 bg-dark-100 border-dark-300 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-teal-500 hover:bg-teal-600 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Mentor
            </Button>
          </DialogTrigger>
          <DialogContent
            ref={scrollContainerRef}
            className="bg-dark-200 border-dark-300 text-white max-w-xl p-0 overflow-y-auto max-h-[90vh] rounded-[2rem]"
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 z-20">
              <div
                className="h-full bg-teal-500 transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>

            <DialogHeader className="p-8 pb-0">
              <DialogTitle className="text-2xl font-black">Adicionar Novo Mentor</DialogTitle>
              <DialogDescription className="text-gray-400 text-sm">Sincronizado com o formulário do site</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="p-8 space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col items-center justify-center space-y-2 py-4 border-b border-white/5">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-dark-100 border-2 border-dashed border-dark-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-500/50">
                        {formData.photoPreview ? (
                          <img src={formData.photoPreview} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <User className="h-10 w-10 text-gray-500" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2 bg-teal-500 rounded-full cursor-pointer shadow-lg hover:bg-teal-600 transition-colors">
                        <Camera className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({
                                ...formData,
                                photo: file,
                                photoPreview: URL.createObjectURL(file)
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">Foto de Identificação *</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do mentor"
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail Corporativo *</Label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@empresa.com"
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>WhatsApp (Telefone)</Label>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Empresa</Label>
                      <Input
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Nome da empresa"
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargo / Posição</Label>
                      <Input
                        value={formData.position}
                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                        placeholder="Ex: Diretor de Inovação"
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Crie uma Senha *</Label>
                      <Input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="bg-dark-100 border-dark-300 h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirme a Senha *</Label>
                    <Input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="bg-dark-100 border-dark-300 h-12"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <Label className="text-gray-300">Especialidades (Selecione até 3)</Label>
                    <div className="flex flex-wrap gap-2">
                      {ESPECIALIDADES.map(esp => (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => toggleSpecialty(esp)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.specialties.includes(esp)
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                            }`}
                        >
                          {esp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Anos de Experiência</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.yearsExperience}
                        onChange={e => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                        className="bg-dark-100 border-dark-300 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Capacidade (Slots)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.maxMentories}
                        onChange={e => setFormData({ ...formData, maxMentories: parseInt(e.target.value) || 0 })}
                        className="bg-dark-100 border-dark-300 h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Label>Bio / Experiência</Label>
                      <span className={`text-[10px] ${formData.bio.trim().split(/\s+/).filter(Boolean).length > 100 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                        {formData.bio.trim().split(/\s+/).filter(Boolean).length}/100 palavras
                      </span>
                    </div>
                    <Textarea
                      required
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Conte um pouco sobre a trajetória do mentor..."
                      className="bg-dark-100 border-dark-300 min-h-[150px] resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-400" /> URL do LinkedIn
                    </Label>
                    <Input
                      value={formData.linkedin}
                      onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/perfil"
                      className="bg-dark-100 border-dark-300 h-12"
                    />
                  </div>

                  <div className="bg-teal-500/10 p-6 rounded-2xl border border-teal-500/20">
                    <h4 className="text-teal-400 font-bold mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" /> Compromisso
                    </h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Ao adicionar este mentor, ele terá acesso à plataforma e será listado oficialmente.
                      Certifique-se de que os dados estão corretos para sincronia com a agenda de mentorias.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-dark-300">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 border-dark-300 text-gray-400">
                    Voltar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-black h-12 rounded-xl"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : currentStep === 3 ? (
                    'Finalizar Cadastro'
                  ) : (
                    'Próximo Passo'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{mentors.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Aprovados</p>
          <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Mentorias/mentor</p>
          <p className="text-2xl font-bold text-teal-400">4.2</p>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center">
          <Clock className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <p className="text-white font-medium">{pendingCount} mentores aguardando aprovação</p>
            <p className="text-gray-400 text-sm">Revise os candidatos pendentes</p>
          </div>
          <Button
            variant="outline"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => setStatusFilter('pending')}
          >
            Ver pendentes
          </Button>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden border-2 border-white/10">
                {mentor.photo ? (
                  <img src={mentor.photo} alt={mentor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <Badge className={statusColors[mentor.status] || 'bg-gray-500/20 text-gray-400'}>
                {['approved', 'aprovado'].includes(mentor.status) ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : ['pending', 'pendente'].includes(mentor.status) ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {statusLabels[mentor.status] || mentor.status}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-white mb-1">{mentor.name}</h3>
            <p className="text-teal-400 text-sm mb-1">{mentor.position}</p>
            <p className="text-gray-400 text-sm mb-4">{mentor.company}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                {mentor.email}
              </div>
              {mentor.phone && (
                <div className="flex items-center text-sm text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  {mentor.phone}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-400">
                <Briefcase className="h-4 w-4 mr-2" />
                {mentor.yearsExperience} anos de experiência
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {mentor.maxMentories} mentorias disponíveis
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Especialidades:</p>
              <div className="flex flex-wrap gap-2">
                {mentor.specialties?.map((spec, i) => (
                  <Badge key={i} className="bg-dark-300 text-gray-300">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-dark-300 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                onClick={() => setSelectedMentor(mentor)}
              >
                Ver perfil
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-dark-200 border-dark-300 text-white p-2 rounded-xl">
                  {['pending', 'pendente'].includes(mentor.status) ? (
                    <>
                      <DropdownMenuItem onClick={() => handleApprove(mentor.id)} className="flex items-center gap-2 cursor-pointer text-green-400 hover:bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-4 w-4" /> Aprovar Mentor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReject(mentor.id)} className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-500/10 rounded-lg">
                        <XCircle className="h-4 w-4" /> Rejeitar Mentor
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        const link = mentor.linkedin?.startsWith('http') ? mentor.linkedin : `https://${mentor.linkedin}`;
                        if (mentor.linkedin) window.open(link, '_blank');
                        else toast.error('LinkedIn não cadastrado');
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg"
                    >
                      <Briefcase className="h-4 w-4" /> Abrir LinkedIn
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setSelectedMentor(mentor)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg text-gray-400">
                    <User className="h-4 w-4" /> Ver Detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEditingMentor(mentor)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-teal-500/10 rounded-lg text-teal-400"
                  >
                    <Pencil className="h-4 w-4" /> Editar Mentor
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(mentor.id)} className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-red-500/10 rounded-lg border-t border-white/5 mt-2">
                    <XCircle className="h-4 w-4" /> Excluir Mentor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
