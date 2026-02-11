import { useState } from 'react';
import { 
  Search, 
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Star,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMentoringSessions } from '@/hooks/useData';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-gray-500/20 text-gray-400',
};

export function AdminMentorias() {
  const { data: sessions, update } = useMentoringSessions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.menteeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    completed: sessions.filter(s => s.status === 'completed').length,
    cancelled: sessions.filter(s => s.status === 'cancelled').length,
    avgRating: sessions
      .filter(s => s.feedback)
      .reduce((acc, s) => acc + (s.feedback?.rating || 0), 0) / 
      sessions.filter(s => s.feedback).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar mentoria..."
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
            <option value="scheduled">Agendada</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No-show</option>
          </select>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <Calendar className="h-4 w-4 mr-2" />
          Nova Mentoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{sessions.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Agendadas</p>
          <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Concluídas</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm">Avaliação Média</p>
          <div className="flex items-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.avgRating.toFixed(1)}</p>
            <Star className="h-5 w-5 text-yellow-400 ml-1 fill-yellow-400" />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="p-4 text-left text-gray-400 font-medium">Mentor</th>
                <th className="p-4 text-left text-gray-400 font-medium">Mentorado</th>
                <th className="p-4 text-left text-gray-400 font-medium">Data/Hora</th>
                <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                <th className="p-4 text-left text-gray-400 font-medium">Tópico</th>
                <th className="p-4 text-left text-gray-400 font-medium">Avaliação</th>
                <th className="p-4 text-left text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id} className="border-b border-dark-300 hover:bg-dark-100/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-teal-400" />
                      </div>
                      <span className="text-white">{session.mentorName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-orange-400" />
                      </div>
                      <span className="text-white">{session.menteeName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">
                        {new Date(session.scheduledAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(session.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={statusColors[session.status]}>
                      {session.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-300">
                    {session.topic || '-'}
                  </td>
                  <td className="p-4">
                    {session.feedback ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-white">{session.feedback.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      {session.status === 'scheduled' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-400 hover:text-green-300"
                            onClick={() => update(session.id, { status: 'completed' })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => update(session.id, { status: 'cancelled' })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Steps Implementation */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Implementação dos 3 Passos</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {filteredSessions
            .filter(s => s.threeSteps && s.threeSteps.length > 0)
            .slice(0, 3)
            .map((session) => (
              <div key={session.id} className="p-4 bg-dark-100 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{session.menteeName}</p>
                    <p className="text-gray-500 text-xs">com {session.mentorName}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {session.threeSteps?.map((step, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center mr-2 flex-shrink-0 text-xs text-teal-400">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
