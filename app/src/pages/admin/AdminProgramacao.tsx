import { useState } from 'react';
import { 
  Clock,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  Mic,
  Wrench,
  Users2,
  Coffee
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessions } from '@/hooks/useData';

const typeIcons: Record<string, React.ElementType> = {
  keynote: Mic,
  talk: Mic,
  panel: Users2,
  workshop: Wrench,
  networking: Coffee,
};

const typeLabels: Record<string, string> = {
  keynote: 'Palestra',
  talk: 'Talk',
  panel: 'Painel',
  workshop: 'Workshop',
  networking: 'Networking',
};

const typeColors: Record<string, string> = {
  keynote: 'bg-teal-500/20 text-teal-400',
  talk: 'bg-blue-500/20 text-blue-400',
  panel: 'bg-purple-500/20 text-purple-400',
  workshop: 'bg-orange-500/20 text-orange-400',
  networking: 'bg-green-500/20 text-green-400',
};

const tracks = [
  { id: 'growth', name: 'Growth Marketing', color: 'teal' },
  { id: 'marketing', name: 'Marketing Digital', color: 'blue' },
  { id: 'vendas', name: 'Vendas B2B', color: 'purple' },
  { id: 'ia', name: 'Inteligência Artificial', color: 'orange' },
  { id: 'gestao', name: 'Gestão & Liderança', color: 'green' },
];

export function AdminProgramacao() {
  const { data: sessions, create, update, remove } = useSessions();
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'talk',
    track: '',
    day: 1,
    startTime: '',
    endTime: '',
    room: '',
    speakers: '',
    maxCapacity: '',
  });

  const daySessions = sessions.filter(s => s.day === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      await update(editingSession.id, {
        ...formData,
        type: formData.type as 'keynote' | 'talk' | 'panel' | 'workshop' | 'networking',
        day: formData.day as 1 | 2,
        speakers: formData.speakers.split(',').map(s => s.trim()),
        maxCapacity: parseInt(formData.maxCapacity) || undefined,
      });
    } else {
      await create({
        ...formData,
        speakers: formData.speakers.split(',').map(s => s.trim()),
        maxCapacity: parseInt(formData.maxCapacity) || undefined,
        registeredCount: 0,
      } as any);
    }
    setShowForm(false);
    setEditingSession(null);
    setFormData({
      title: '',
      description: '',
      type: 'talk',
      track: '',
      day: 1,
      startTime: '',
      endTime: '',
      room: '',
      speakers: '',
      maxCapacity: '',
    });
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      type: session.type,
      track: session.track || '',
      day: session.day,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
      speakers: session.speakers.join(', '),
      maxCapacity: session.maxCapacity?.toString() || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      await remove(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        <button
          onClick={() => setActiveDay(1)}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeDay === 1 
              ? 'text-teal-400 border-b-2 border-teal-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Dia 1 - 21/05 (Quinta)
        </button>
        <button
          onClick={() => setActiveDay(2)}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeDay === 2 
              ? 'text-teal-400 border-b-2 border-teal-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Dia 2 - 22/05 (Sexta)
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Programação - Dia {activeDay}
          </h2>
          <p className="text-gray-400 text-sm">{daySessions.length} sessões</p>
        </div>
        <Button 
          className="bg-teal-500 hover:bg-teal-600 text-white"
          onClick={() => {
            setEditingSession(null);
            setFormData({ ...formData, day: activeDay });
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Sessão
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingSession ? 'Editar Sessão' : 'Nova Sessão'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                >
                  <option value="keynote">Palestra</option>
                  <option value="talk">Talk</option>
                  <option value="panel">Painel</option>
                  <option value="workshop">Workshop</option>
                  <option value="networking">Networking</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white min-h-[80px]"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Trilha</label>
                <select
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-100 border border-dark-300 rounded-lg text-white"
                >
                  <option value="">Sem trilha</option>
                  {tracks.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Início</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Fim</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Sala</label>
                <Input
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  placeholder="Ex: Auditório Principal"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Palestrantes (separados por vírgula)</label>
                <Input
                  value={formData.speakers}
                  onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  placeholder="João Silva, Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Capacidade Máxima</label>
                <Input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  className="bg-dark-100 border-dark-300 text-white"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white">
                {editingSession ? 'Salvar Alterações' : 'Criar Sessão'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="border-dark-300 text-gray-300"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions Timeline */}
      <div className="space-y-4">
        {daySessions.map((session) => {
          const Icon = typeIcons[session.type] || Mic;
          return (
            <div key={session.id} className="glass-card p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Time */}
                <div className="flex items-center lg:w-32">
                  <Clock className="h-4 w-4 text-teal-400 mr-2" />
                  <span className="text-white font-medium">
                    {session.startTime} - {session.endTime}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={typeColors[session.type]}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeLabels[session.type]}
                    </Badge>
                    {session.track && (
                      <Badge className="bg-dark-300 text-gray-300">
                        {session.track}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{session.title}</h3>
                  {session.description && (
                    <p className="text-gray-400 text-sm">{session.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {session.room}
                    </div>
                    {session.speakers.length > 0 && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {session.speakers.join(', ')}
                      </div>
                    )}
                    {session.maxCapacity && (
                      <div className="flex items-center">
                        <span className="text-teal-400">{session.registeredCount}</span>
                        <span className="mx-1">/</span>
                        <span>{session.maxCapacity}</span>
                        <span className="ml-1">inscritos</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-dark-300 text-gray-300"
                    onClick={() => handleEdit(session)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
