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
  MoreHorizontal,
  Plus,
  User
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
import { useMentors } from '@/hooks/useData';
import { toast } from 'sonner';
import type { Mentor } from '@/types';

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export function AdminMentores() {
  const { data: mentors, create, update, isLoading } = useMentors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    bio: '',
    yearsExperience: 5,
    maxMentories: 10,
    specialties: '',
    linkedin: ''
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email) {
        toast.error('Preencha os campos obrigatórios');
        return;
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
        tracks: ['Geral'], // Default track
        linkedin: formData.linkedin,
        status: 'approved', // Auto-approved when added by admin
        userId: 'admin-manual', // Flag for manual creation
      } as any);

      toast.success('Mentor adicionado com sucesso!');
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Erro ao adicionar mentor:', err);
      toast.error('Erro ao adicionar mentor: ' + err.message);
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
      linkedin: ''
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await update(id, { status: 'approved' });
      toast.success('Mentor aprovado!');
    } catch (err) {
      toast.error('Erro ao aprovar mentor');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await update(id, { status: 'rejected' });
      toast.success('Mentor rejeitado');
    } catch (err) {
      toast.error('Erro ao rejeitar mentor');
    }
  };

  const pendingCount = mentors.filter(m => m.status === 'pending').length;
  const approvedCount = mentors.filter(m => m.status === 'approved').length;

  return (
    <div className="space-y-6">
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
            <option value="approved">Aprovado</option>
            <option value="pending">Pendente</option>
            <option value="rejected">Rejeitado</option>
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
              <Badge className={statusColors[mentor.status]}>
                {mentor.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                {mentor.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {mentor.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                {mentor.status}
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
                {mentor.specialties.map((spec, i) => (
                  <Badge key={i} className="bg-dark-300 text-gray-300">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              {mentor.status === 'pending' ? (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleApprove(mentor.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleReject(mentor.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="flex-1 border-dark-300 text-gray-300">
                    Ver perfil
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
