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
import { useMentors } from '@/hooks/useData';

const statusColors: Record<string, string> = {
  approved: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export function AdminMentores() {
  const { data: mentors, update } = useMentors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id: string) => {
    await update(id, { status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await update(id, { status: 'rejected' });
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
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Mentor
        </Button>
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
