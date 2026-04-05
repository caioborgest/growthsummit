import React, { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Mic,
  Wrench,
  Users2,
  Coffee,
  Zap,
  LayoutGrid,
  QrCode,
  Printer,
  Rocket,
  Briefcase,
  Database,
  Calendar,
  Clock
} from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateQRString } from '@/lib/qrUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSessions } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import type { Session } from '@/types';
import { toast } from 'sonner';
import { seedTriunfoSchedule } from '@/lib/triunfoSeeding';

const typeIcons: Record<string, React.ElementType> = {
  palestra: Mic,
  talk: Mic,
  panel: Users2,
  workshop: Wrench,
  curso: Wrench,
  oficina: Wrench,
  networking: Coffee,
  circuito: Zap,
  mentoria: Users2,
  startup: Rocket,
  b2b: Briefcase,
};

const typeLabels: Record<string, string> = {
  palestra: 'Palestra / Painel',
  workshop: 'Workshop',
  curso: 'Curso',
  oficina: 'Oficina Prática',
  networking: 'Networking',
  circuito: 'Circuito de Experiência',
  mentoria: 'Mentoria',
  startup: 'Startup / Pitch',
  b2b: 'Rodada B2B',
};

const typeColors: Record<string, string> = {
  palestra: 'bg-teal-500/20 text-teal-400',
  workshop: 'bg-purple-500/20 text-purple-400',
  curso: 'bg-blue-500/20 text-blue-400',
  oficina: 'bg-green-500/20 text-green-400',
  networking: 'bg-orange-500/20 text-orange-400',
  circuito: 'bg-brand-orange-coral/20 text-brand-orange-coral',
  mentoria: 'bg-yellow-500/20 text-yellow-500',
  startup: 'bg-red-500/20 text-red-400',
  b2b: 'bg-indigo-500/20 text-indigo-400',
};

const categories = [
  { id: 'manha_ancora', name: 'Manhã - Âncora (Check-in/Abertura)' },
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
  { id: 'circuito', name: 'Circuito de Experiência (Contínuo)' },
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

export function AdminProjectSchedule() {
  const FIXED_PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const { projectId } = useProject();
  // Ensure we use the requested project ID if not defined in context
  const targetProjectId = projectId || FIXED_PROJECT_ID;
  const { data: sessions, create, update, remove, refetch } = useSessions(targetProjectId);
  
  const [activeTab, setActiveTab] = useState<'diurna' | 'noturna' | 'circuito'>('diurna');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [qrSession, setQrSession] = useState<Session | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'palestra',
    category: 'manha_bloco_1',
    startTime: '',
    endTime: '',
    room: 'salao',
    speakers: '',
    partner: '',
    maxSlots: '', // user requested max_slots
    topics: '',
    color: 'orange',
    date: '',
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Filter by the project ID
      if (s.projectId !== targetProjectId) return false;
      
      const category = s.category || '';
      if (activeTab === 'diurna') return category.startsWith('manha_') || category.startsWith('tarde_');
      if (activeTab === 'noturna') return category === 'noturna';
      if (activeTab === 'circuito') return category === 'circuito';
      return true;
    }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [sessions, activeTab, targetProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type as Session['type'],
        category: formData.category,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : [],
        partner: formData.partner,
        maxSlots: parseInt(formData.maxSlots) || 0,
        topics: formData.topics ? formData.topics.split('\n').map(s => s.trim()) : [],
        projectId: targetProjectId,
        date: formData.date || new Date().toISOString().split('T')[0],
      };

      if (editingSession) {
        await update(editingSession.id, payload as any);
        toast.success('Sessão atualizada com sucesso!');
      } else {
        await create({
          ...payload,
          registeredCount: 0,
        } as any);
        toast.success('Sessão criada com sucesso!');
      }
      setShowForm(false);
      setEditingSession(null);
      resetForm();
      refetch(true); // Re-fetch list as requested
    } catch (err: any) {
      console.error('Erro ao salvar sessão:', err);
      toast.error(`Erro ao salvar: ${err.message || 'Erro inesperado'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'palestra',
      category: 'manha_bloco_1',
      startTime: '',
      endTime: '',
      room: 'salao',
      speakers: '',
      partner: '',
      maxSlots: '',
      topics: '',
      color: 'orange',
      date: '',
    });
  };

  const handleEdit = (session: Session) => {
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
      maxSlots: (session as any).maxSlots?.toString() || (session as any).maxCapacity?.toString() || '',
      topics: session.topics?.join('\n') || '',
      color: session.color || 'orange',
      date: session.date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await remove(id);
        toast.success('Atividade removida com sucesso!');
        refetch(true); // Re-fetch
      } catch (err: any) {
        console.error('Erro ao deletar:', err);
        toast.error('Erro ao excluir atividade.');
      }
    }
  };

  const handleSeedTriunfo = async () => {
    const confirmText = 'Isso irá limpar e recriar toda a programação do projeto Triunfo. Continuar?';
    if (!confirm(confirmText)) return;

    setIsSeeding(true);
    try {
      const res = await seedTriunfoSchedule();
      if (res.success) {
        toast.success(`Importado ${res.count} atividades!`);
        await refetch(true);
      } else {
        toast.error('Erro ao importar programação.');
      }
    } catch (err) {
      toast.error('Erro inesperado.');
    } finally {
      setIsSeeding(false);
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
      <div className="flex justify-between items-center bg-dark-200/50 p-6 rounded-[1.5rem] border border-white/5">
        <div>
          <h2 className="text-lg font-semibold text-white uppercase tracking-wider">
            Gestão de Programação - {activeTab.toUpperCase()}
          </h2>
          <p className="text-gray-400 text-sm">{filteredSessions.length} sessões cadastradas</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-brand-orange-coral/50 text-brand-orange-coral hover:bg-brand-orange-coral hover:text-white font-bold h-11 rounded-xl"
            onClick={handleSeedTriunfo}
            disabled={isSeeding}
          >
            <Database className="h-4 w-4 mr-2" />
            {isSeeding ? 'Importando...' : 'Importar Triunfo'}
          </Button>
          <Button
            className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-bold h-11 rounded-xl shadow-lg"
            onClick={() => {
              setEditingSession(null);
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Sessão
          </Button>
        </div>
      </div>

      {/* Activity Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="admin-modal-content p-0 border-none max-w-4xl">
          <div className="admin-modal-header">
            <div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                {editingSession ? 'Editar' : 'Nova'} <span className="text-brand-orange-coral">Sessão</span>
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Configure os detalhes da atividade na programação do evento.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 overflow-hidden">
            <div className="admin-modal-body">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Título da Atividade</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                      placeholder="Ex: Abertura Oficial"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Categoria</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-xl text-white text-sm font-bold h-12 outline-none appearance-none"
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Tipo</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-xl text-white text-sm font-bold h-12 outline-none appearance-none"
                        required
                      >
                        {Object.entries(typeLabels).map(([id, label]) => (
                          <option key={id} value={id}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Início</label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Fim</label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Local / Sala</label>
                    <Input
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                      placeholder="Nome da sala ou espaço"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Vagas Máximas</label>
                    <Input
                      type="number"
                      value={formData.maxSlots}
                      onChange={(e) => setFormData({ ...formData, maxSlots: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                      placeholder="0 = Ilimitado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Speakers (Nomes separados por vírgula)</label>
                    <Input
                      value={formData.speakers}
                      onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
                      className="bg-dark-100 border-dark-300 text-white h-12 rounded-xl"
                      placeholder="João Silva, Maria Souza..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Descrição / Objetivos da Sessão</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-100 border border-dark-300 rounded-xl p-4 text-white text-sm min-h-[100px] outline-none"
                  placeholder="Descreva o que será abordado nesta atividade..."
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-gray-500">
                Cancelar
              </Button>
              <Button type="submit" className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white px-10 py-6 h-auto font-black text-lg rounded-xl">
                {editingSession ? 'SALVAR ALTERAÇÕES' : 'CRIAR SESSÃO'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const Icon = typeIcons[session.type] || Mic;
          const categoryName = categories.find(c => c.id === session.category)?.name || session.category;

          return (
            <div key={session.id} className="glass-card p-6 border-white/5 group rounded-[1.5rem]">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex flex-col lg:w-48 shrink-0">
                  <div className="flex items-center gap-2 text-brand-orange-coral font-black text-2xl">
                    <Clock className="h-5 w-5" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{categoryName}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${typeColors[session.type]} px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
                      <Icon className="h-3 w-3 mr-1.5" />
                      {typeLabels[session.type]}
                    </Badge>
                    <Badge variant="outline" className="text-teal-400/70 border-teal-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                      {session.room}
                    </Badge>
                  </div>
                  <h3 className="text-white font-black text-xl italic">{session.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-10 px-4 rounded-xl" onClick={() => handleEdit(session)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-10 h-10 p-0 text-red-500" onClick={() => handleDelete(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSessions.length === 0 && (
          <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/5">
            <Calendar className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Nenhuma sessão cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
