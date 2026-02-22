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
  Coffee,
  Zap,
  LayoutGrid
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
  circuito: Zap,
};

const typeLabels: Record<string, string> = {
  keynote: 'Palestra',
  talk: 'Talk',
  panel: 'Painel',
  workshop: 'Workshop',
  networking: 'Networking',
  circuito: 'Circuito/Estação',
};

const typeColors: Record<string, string> = {
  keynote: 'bg-teal-500/20 text-teal-400',
  talk: 'bg-blue-500/20 text-blue-400',
  panel: 'bg-purple-500/20 text-purple-400',
  workshop: 'bg-orange-500/20 text-orange-400',
  networking: 'bg-green-500/20 text-green-400',
  circuito: 'bg-brand-orange-coral/20 text-brand-orange-coral',
};

const categories = [
  { id: 'manha_ancora', name: 'Manhã - Âncora (Credenciamento/Aberturas)' },
  { id: 'manha_bloco_1', name: 'Manhã - Bloco 1 (08:30 - 10:00)' },
  { id: 'manha_circulacao', name: 'Manhã - Coffee/Networking' },
  { id: 'manha_bloco_2', name: 'Manhã - Bloco 2 (10:15 - 11:45)' },
  { id: 'manha_encerramento', name: 'Manhã - Encerramento' },
  { id: 'tarde_ancora', name: 'Tarde - Retorno/Almoço' },
  { id: 'tarde_bloco_3', name: 'Tarde - Bloco 3 (14:00 - 15:30)' },
  { id: 'tarde_circulacao', name: 'Tarde - Coffee/Networking' },
  { id: 'tarde_bloco_4', name: 'Tarde - Bloco 4 (15:45 - 17:15)' },
  { id: 'tarde_encerramento', name: 'Tarde - Encerramento' },
  { id: 'noturna', name: 'Night Experience (Noite)' },
  { id: 'circuito', name: 'Circuito de Experiências (Contínuo)' },
];

const rooms = [
  { id: 'salao', name: 'Salão Principal' },
  { id: 'sala1', name: 'Sala 01' },
  { id: 'sala2', name: 'Sala 02' },
  { id: 'sala3', name: 'Sala 03' },
  { id: 'arena', name: 'Arena Pitches' },
  { id: 'circuito', name: 'Espaço Circuito' },
  { id: 'convivencia', name: 'Área de Convivência' },
];

export function AdminProgramacao() {
  const { data: sessions, create, update, remove } = useSessions();
  const [activeTab, setActiveTab] = useState<'diurna' | 'noturna' | 'circuito'>('diurna');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'talk',
    category: 'manha_bloco_1',
    startTime: '',
    endTime: '',
    room: 'salao',
    speakers: '',
    partner: '',
    maxCapacity: '',
    topics: '',
    color: 'orange',
  });

  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'diurna') return s.category.startsWith('manha_') || s.category.startsWith('tarde_');
    if (activeTab === 'noturna') return s.category === 'noturna';
    if (activeTab === 'circuito') return s.category === 'circuito';
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : [],
      topics: formData.topics ? formData.topics.split('\n').map(s => s.trim()) : [],
      maxCapacity: parseInt(formData.maxCapacity) || 0,
    };

    if (editingSession) {
      await update(editingSession.id, payload);
    } else {
      await create({
        ...payload,
        registeredCount: 0,
      } as any);
    }
    setShowForm(false);
    setEditingSession(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'talk',
      category: 'manha_bloco_1',
      startTime: '',
      endTime: '',
      room: 'salao',
      speakers: '',
      partner: '',
      maxCapacity: '',
      topics: '',
      color: 'orange',
    });
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description || '',
      type: session.type,
      category: session.category,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room || '',
      speakers: session.speakers?.join(', ') || '',
      partner: session.partner || '',
      maxCapacity: session.maxCapacity?.toString() || '',
      topics: session.topics?.join('\n') || '',
      color: session.color || 'orange',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      await remove(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        {[
          { id: 'diurna', label: 'Diurna', icon: Clock },
          { id: 'noturna', label: 'Noturna', icon: Mic },
          { id: 'circuito', label: 'Circuito', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                ? 'text-brand-orange-coral border-b-2 border-brand-orange-coral'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
            Gestão da Programação - {activeTab.toUpperCase()}
          </h2>
          <p className="text-gray-400 text-sm">{filteredSessions.length} atividades cadastradas neste grupo</p>
        </div>
        <Button
          className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold"
          onClick={() => {
            setEditingSession(null);
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Atividade
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-6 border-brand-orange-coral/30">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            {editingSession ? <Edit2 className="h-5 w-5 text-brand-orange-coral" /> : <Plus className="h-5 w-5 text-brand-orange-coral" />}
            {editingSession ? 'Editar Atividade' : 'Nova Atividade'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Título</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white h-12"
                    placeholder="Ex: Do Improviso ao Plano"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Categoria/Bloco</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white"
                      required
                    >
                      {Object.keys(typeLabels).map(key => (
                        <option key={key} value={key}>{typeLabels[key]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Horário Início</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Horário Fim</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Local/Sala</label>
                  <select
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white"
                  >
                    <option value="">Outro/Manual</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Palestrantes / Responsáveis</label>
                  <Input
                    value={formData.speakers}
                    onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
                    className="bg-dark-100 border-dark-300 text-white h-12"
                    placeholder="Nome 1, Nome 2 (opcional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Parceiro</label>
                    <Input
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12"
                      placeholder="Ex: SEBRAE (opcional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Capacidade</label>
                    <Input
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12"
                      placeholder="0 = Ilimitado"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Tópicos / Pontos Chave (um por linha)</label>
              <textarea
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white min-h-[100px]"
                placeholder="Tópico 1&#10;Tópico 2&#10;Tópico 3"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-tighter">Descrição Curta</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white min-h-[80px]"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-8 py-6 h-auto font-black text-lg">
                {editingSession ? 'SALVAR ALTERAÇÕES' : 'CRIAR ATIVIDADE'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-dark-300 text-gray-300 px-8 py-6 h-auto font-black text-lg"
                onClick={() => {
                  setShowForm(false);
                  setEditingSession(null);
                }}
              >
                CANCELAR
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const Icon = typeIcons[session.type] || Mic;
          const categoryName = categories.find(c => c.id === session.category)?.name || session.category;

          return (
            <div key={session.id} className="glass-card p-5 hover:bg-white/[0.02] transition-colors border-white/5 group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Time & Cat */}
                <div className="flex flex-col lg:w-48 shrink-0">
                  <div className="flex items-center gap-2 text-brand-orange-coral font-black text-xl mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{categoryName}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={typeColors[session.type]}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeLabels[session.type]}
                    </Badge>
                    {session.partner && (
                      <Badge className="bg-dark-300 text-gray-300 border-white/10">
                        {session.partner}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-gray-500 border-white/10">
                      {session.room}
                    </Badge>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{session.title}</h3>
                  {session.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{session.description}</p>
                  )}

                  {session.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {session.topics.slice(0, 3).map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                          <LayoutGrid className="h-2 w-2" />
                          {t}
                        </div>
                      ))}
                      {session.topics.length > 3 && <span className="text-[10px] text-gray-600">+{session.topics.length - 3} mais</span>}
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col lg:items-end gap-3 shrink-0">
                  {session.maxCapacity > 0 && (
                    <div className="text-xs bg-dark-300 px-3 py-1.5 rounded-lg border border-white/5">
                      <span className="text-brand-orange-coral font-bold">{session.registeredCount}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-400">{session.maxCapacity} inscritos</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                      onClick={() => handleEdit(session)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-500/70 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
            <LayoutGrid className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhuma atividade encontrada neste grupo</p>
            <Button
              variant="link"
              className="text-brand-orange-coral mt-2"
              onClick={() => setShowForm(true)}
            >
              Começar a cadastrar agora
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
