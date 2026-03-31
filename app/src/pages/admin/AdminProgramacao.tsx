import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
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
  Briefcase
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
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ElementType> = {
  palestra: Mic,
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
  oficina: 'Oficina',
  networking: 'Networking',
  circuito: 'Circuito / Estação',
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
  const { projectId } = useProject();
  const { data: sessions, create, update, remove } = useSessions();
  const [activeTab, setActiveTab] = useState<'diurna' | 'noturna' | 'circuito'>('diurna');
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [qrSession, setQrSession] = useState<Session | null>(null);
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
    maxCapacity: '',
    topics: '',
    color: 'orange',
  });

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Garantir que a atividade pertence ao projeto selecionado
      if (projectId && s.projectId !== projectId) return false;
      
      const category = s.category || '';
      if (activeTab === 'diurna') return category.startsWith('manha_') || category.startsWith('tarde_');
      if (activeTab === 'noturna') return category === 'noturna';
      if (activeTab === 'circuito') return category === 'circuito';
      return true;
    }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [sessions, activeTab, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      toast.error('Por favor, selecione um projeto no menu lateral antes de criar atividades.');
      return;
    }

    try {
      const payload = {
        ...formData,
        speakers: formData.speakers ? formData.speakers.split(',').map(s => s.trim()) : [],
        topics: formData.topics ? formData.topics.split('\n').map(s => s.trim()) : [],
        maxCapacity: parseInt(formData.maxCapacity) || 0,
      };

      if (editingSession) {
        await update(editingSession.id, {
          ...payload,
          type: payload.type as Session['type'],
        });
        toast.success('Atividade atualizada com sucesso!');
      } else {
        await create({
          ...payload,
          projectId: projectId, // Usar o ID do contexto, sem fallback para slug se possível
          registeredCount: 0,
          type: payload.type as Session['type'],
        });
        toast.success('Atividade criada com sucesso!');
      }
      setShowForm(false);
      setEditingSession(null);
      resetForm();
    } catch (err: any) {
      console.error('Erro ao salvar atividade:', err);
      toast.error(`Erro ao salvar: ${err.message || 'Ocorreu um erro inesperado'}`);
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
      maxCapacity: '',
      topics: '',
      color: 'orange',
    });
  };

  const handlePrintQR = () => {
    const printContent = document.getElementById('printable-qr');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR Code - ${qrSession?.title}</title>
          <style>
            body { 
              font-family: sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              text-align: center;
              background-color: white;
              color: black;
            }
            .container { border: 2px solid #000; padding: 40px; border-radius: 20px; }
            h1 { margin-bottom: 5px; font-size: 24px; }
            h2 { margin-top: 0; color: #666; font-size: 18px; margin-bottom: 30px; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; }
            svg { display: block; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${qrSession?.title}</h1>
            <h2>${qrSession?.room}</h2>
            ${printContent.innerHTML}
            <div class="footer">Escaneie para confirmar presença - Growth Experience</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      maxCapacity: session.maxCapacity?.toString() || '',
      topics: session.topics?.join('\n') || '',
      color: session.color || 'orange',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await remove(id);
        toast.success('Atividade excluída com sucesso!');
      } catch (err: any) {
        console.error('Erro ao excluir atividade:', err);
        toast.error(`Erro ao excluir: ${err.message || 'Ocorreu um erro inesperado'}`);
      }
    }
  };

  return (
    <div className="space-y-6" >
      {/* View Tabs */}
      <div className="flex space-x-4 border-b border-dark-300">
        {[
          { id: 'diurna', label: 'Diurna', icon: Clock },
          { id: 'noturna', label: 'Noturna', icon: Mic },
          { id: 'circuito', label: 'Circuito', icon: Zap },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'diurna' | 'noturna' | 'circuito')}
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

      {/* Activity Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingSession(null);
        }
      }}>
        <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              {editingSession ? <Edit2 className="h-6 w-6 text-brand-orange-coral" /> : <Plus className="h-6 w-6 text-brand-orange-coral" />}
              {editingSession ? 'Editar Atividade' : 'Nova Atividade'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingSession ? 'Altere os detalhes da atividade selecionada.' : 'Preencha os dados para criar uma nova atividade na programação.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
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
                      className="w-full px-4 py-3 bg-dark-100 border border-dark-300 rounded-lg text-white font-bold"
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
              <Button type="submit" className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white px-8 py-6 h-auto font-black text-lg">
                {editingSession ? 'SALVAR ALTERAÇÕES' : 'CRIAR ATIVIDADE'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-dark-300 text-gray-300 px-8 py-6 h-auto font-black text-lg"
                onClick={() => {
                  setShowForm(false);
                  setEditingSession(null);
                }}
              >
                CANCELAR
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
            <div key={session.id} className="glass-card p-6 hover:bg-white/[0.04] transition-all border-white/5 group rounded-[1.5rem] shadow-xl hover:shadow-brand-orange-coral/5 hover:-translate-y-1">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Time & Cat */}
                <div className="flex flex-col lg:w-48 shrink-0">
                  <div className="flex items-center gap-2 text-brand-orange-coral font-black text-2xl mb-1 italic tracking-tighter">
                    <Clock className="h-5 w-5" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{categoryName}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={`${typeColors[session.type]} px-3 py-1 font-black text-[10px] uppercase tracking-widest`}>
                      <Icon className="h-3 w-3 mr-1.5" />
                      {typeLabels[session.type]}
                    </Badge>
                    {session.partner && (
                      <Badge className="bg-white/5 text-gray-400 border-white/10 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                        {session.partner}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-teal-400/70 border-teal-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                      <LayoutGrid className="h-3 w-3 mr-1.5" />
                      {session.room}
                    </Badge>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2 italic tracking-tight">{session.title}</h3>
                  {session.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{session.description}</p>
                  )}

                  {session.topics && session.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {session.topics.slice(0, 3).map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-[9px] text-gray-500 bg-white/5 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          <Zap className="h-2.5 w-2.5 text-brand-orange-coral" />
                          {t}
                        </div>
                      ))}
                      {session.topics.length > 3 && <span className="text-[9px] text-gray-600 font-black self-center uppercase tracking-widest">+{session.topics.length - 3} mais</span>}
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="flex flex-col lg:items-end gap-4 shrink-0">
                  {session.maxCapacity !== undefined && session.maxCapacity > 0 && (
                    <div className="text-[10px] bg-dark-300 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange-coral animate-pulse" />
                      <span className="text-brand-orange-coral font-black">{session.registeredCount}</span>
                      <span className="text-gray-500 font-bold">/</span>
                      <span className="text-gray-400 font-black uppercase tracking-widest">{session.maxCapacity} inscritos</span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 rounded-xl border-brand-orange-coral/30 text-brand-orange-coral hover:text-white hover:bg-brand-orange-coral shadow-lg transition-all active:scale-90"
                      onClick={() => setQrSession(session)}
                      title="Gerar QR Code para Check-in"
                    >
                      <QrCode className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 px-4 rounded-xl border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-90"
                      onClick={() => handleEdit(session)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-10 h-10 p-0 rounded-xl border-red-500/30 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 shadow-lg transition-all active:scale-90"
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

      {/* QR Code Dialog */}
      <Dialog open={!!qrSession} onOpenChange={(open) => !open && setQrSession(null)}>
        <DialogContent className="bg-dark-200 border-dark-300 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <QrCode className="text-brand-orange-coral" />
              QR Code de Check-in
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Imprima este QR Code e coloque-o na entrada da sala para que os participantes confirmem presença.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl my-4" id="printable-qr">
            {qrSession && (
              <QRCode
                value={`GE-ACTIVITY|${qrSession.id}|${qrSession.title}`}
                size={256}
                level="H"
              />
            )}
          </div>

          <div className="text-center mb-6">
            <h3 className="font-bold text-lg text-white">{qrSession?.title}</h3>
            <p className="text-brand-orange-coral font-bold">{qrSession?.room}</p>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-brand-orange-coral hover:bg-brand-orange-intense text-white"
              onClick={handlePrintQR}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir QR Code
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-dark-300 text-gray-400"
              onClick={() => setQrSession(null)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
