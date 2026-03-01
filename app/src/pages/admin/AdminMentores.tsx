import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Briefcase,
  Calendar,
  UserPlus,
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { Camera, User } from 'lucide-react';


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
function MentorDetailsModal({ mentor, onClose, onApprove, onReject }: {
  mentor: any;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
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
              {mentor.linkedin && (
                <a
                  href={mentor.linkedin.startsWith('http') ? mentor.linkedin : `https://${mentor.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Briefcase className="h-4 w-4 mr-3" />
                  <span className="text-sm font-bold">LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>

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
        </div>

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

        <div className="flex gap-3 pt-6 border-t border-white/5">
          {(mentor.status === 'pending' || mentor.status === 'pendente') ? (
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
            <Button
              onClick={onClose}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold h-12 rounded-2xl border border-white/10"
            >
              Fechar Perfil
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminMentores() {
  const { projectId } = useProject();
  const { data: mentors, create, update, isLoading } = useMentors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    bio: '',
    yearsExperience: 5,
    maxMentories: 10,
    specialties: '',
    linkedin: '',
    photo: null as File | null,
    photoPreview: ''
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      (mentor.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (mentor.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (mentor.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

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

      await create({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        position: formData.position,
        bio: formData.bio,
        yearsExperience: Number(formData.yearsExperience),
        maxMentories: Number(formData.maxMentories),
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        tracks: ['Geral'],
        linkedin: formData.linkedin,
        photo: photoUrl, // Mapping expected by application type
        status: 'approved',
        projectId: projectId || 'manual',
      } as any);

      toast.success('Mentor adicionado com sucesso!');
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
    setFormData({
      name: '',
      email: '',
      company: '',
      position: '',
      bio: '',
      yearsExperience: 5,
      maxMentories: 10,
      specialties: '',
      linkedin: '',
      photo: null,
      photoPreview: ''
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await update(id, { status: 'aprovado' });
      toast.success('Mentor aprovado com sucesso!');
    } catch (err: any) {
      logger.error('Erro ao aprovar mentor:', err);
      toast.error(`Erro ao aprovar mentor: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (confirm('Tem certeza que deseja rejeitar este mentor?')) {
        await update(id, { status: 'rejeitado' });
        toast.success('Mentor rejeitado com sucesso');
      }
    } catch (err: any) {
      logger.error('Erro ao rejeitar mentor:', err);
      toast.error(`Erro ao rejeitar mentor: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const pendingCount = mentors.filter(m => m.status === 'pending' || m.status === 'pendente').length;
  const approvedCount = mentors.filter(m => m.status === 'approved' || m.status === 'aprovado').length;

  return (
    <div className="space-y-6">
      {selectedMentor && (
        <MentorDetailsModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
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
          <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Mentor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center space-y-2 py-4 border-b border-dark-300 mb-4">
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
                <p className="text-xs text-gray-500">Foto de Perfil</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do mentor"
                    className="bg-dark-100 border-dark-300"
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
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nome da empresa"
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo / Posição</Label>
                  <Input
                    value={formData.position}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Ex: Diretor de Inovação"
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio / Experiência</Label>
                <Textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre a trajetória do mentor..."
                  className="bg-dark-100 border-dark-300 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Especialidades (separadas por vírgula)</Label>
                <Input
                  value={formData.specialties}
                  onChange={e => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Vendas, Marketing, Gestão, Tecnologia..."
                  className="bg-dark-100 border-dark-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Anos de Experiência</Label>
                  <Input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={e => setFormData({ ...formData, yearsExperience: Number(e.target.value) })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite de Mentorias</Label>
                  <Input
                    type="number"
                    value={formData.maxMentories}
                    onChange={e => setFormData({ ...formData, maxMentories: Number(e.target.value) })}
                    className="bg-dark-100 border-dark-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link do LinkedIn</Label>
                <Input
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/perfil"
                  className="bg-dark-100 border-dark-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-dark-300">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-dark-300 text-gray-400">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8"
                >
                  {isLoading ? 'Salvando...' : 'Adicionar Mentor'}
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
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <Badge className={statusColors[mentor.status] || 'bg-gray-500/20 text-gray-400'}>
                {mentor.status === 'approved' || mentor.status === 'aprovado' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : mentor.status === 'pending' || mentor.status === 'pendente' ? (
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
                  {(mentor.status === 'pending' || mentor.status === 'pendente') ? (
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
                  <DropdownMenuItem onClick={() => setSelectedMentor(mentor)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg">
                    <User className="h-4 w-4" /> Ver Detalhes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
        }
      </div>
    </div>
  );
}
