import { useState } from 'react';
import { 
  Plus, 
  Settings2, 
  Trash2, 
  Layout, 
  Clock, 
  Target, 
  MessageSquare,
  Gift,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface ProjectPopup {
  id: string;
  project_id: string;
  title: string;
  description: string;
  type: 'newsletter' | 'offer' | 'info';
  status: 'active' | 'inactive';
  target_pages: string[];
  show_after_seconds: number;
  priority: number;
  image_url?: string;
  cta_text?: string;
  cta_link?: string;
}

export function AdminPopups() {
  const { projectId } = useProject();
  const { data: popups, refetch, isLoading } = useData<ProjectPopup>([], 'project_popups');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingPopup, setEditingPopup] = useState<Partial<ProjectPopup> | null>(null);

  const initialForm: Partial<ProjectPopup> = {
    title: '',
    description: '',
    type: 'newsletter',
    status: 'active',
    target_pages: ['*'],
    show_after_seconds: 5,
    priority: 1,
    cta_text: 'Cadastrar agora'
  };

  const handleSave = async () => {
    if (!editingPopup?.title || !projectId) {
      toast.error('Preencha ao menos o título do pop-up');
      return;
    }

    try {
      if (editingPopup.id) {
        const { error } = await supabase
          .from('project_popups')
          .update({ ...editingPopup, updated_at: new Date().toISOString() })
          .eq('id', editingPopup.id);
        if (error) throw error;
        toast.success('Pop-up atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('project_popups')
          .insert({ ...editingPopup, project_id: projectId });
        if (error) throw error;
        toast.success('Novo pop-up configurado e ativo!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error('Erro ao salvar pop-up: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este pop-up?')) return;
    setIsDeleting(id);
    try {
      const { error } = await supabase.from('project_popups').delete().eq('id', id);
      if (error) throw error;
      toast.success('Pop-up removido do ecossistema.');
      refetch();
    } catch (error: any) {
      toast.error('Erro ao excluir: ' + error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStatus = async (popup: ProjectPopup) => {
    const newStatus = popup.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('project_popups')
        .update({ status: newStatus })
        .eq('id', popup.id);
      if (error) throw error;
      refetch();
      toast.success(`Pop-up ${newStatus === 'active' ? 'ativado' : 'pausado'}`);
    } catch (error: any) {
      toast.error('Erro ao alterar status');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-up duration-500 pb-20">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-brand-orange-coral">
            <Zap className="h-6 w-6 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] pt-1">Marketing & Conversão</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Gestão de Pop-ups</h1>
          <p className="text-gray-500 font-medium max-w-xl">
            Configure banners de captura e ofertas estratégicas. Evite conflitos escolhendo <strong className="text-white">onde e quando</strong> cada pop-up deve aparecer.
          </p>
        </div>

        <Button 
          onClick={() => {
            setEditingPopup(initialForm);
            setIsModalOpen(true);
          }}
          className="bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black px-8 h-14 rounded-2xl shadow-xl shadow-brand-orange-coral/20 group"
        >
          <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform" />
          CRIAR NOVO POP-UP
        </Button>
      </div>

      {/* Grid de Pop-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {popups.map(popup => (
          <div 
            key={popup.id}
            className={`group relative bg-dark-200 border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-brand-orange-coral/30 hover:shadow-2xl hover:shadow-black/40 ${popup.status === 'inactive' ? 'opacity-60' : ''}`}
          >
            {/* Header do Card */}
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                    popup.type === 'newsletter' ? 'bg-teal-500/20 text-teal-400' : 
                    popup.type === 'offer' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {popup.type === 'newsletter' ? <MessageSquare className="h-6 w-6" /> : 
                     popup.type === 'offer' ? <Gift className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{popup.type}</p>
                    <h3 className="text-xl font-black text-white tracking-tight truncate max-w-[180px]">{popup.title}</h3>
                  </div>
                </div>
              </div>
              <Switch 
                checked={popup.status === 'active'}
                onCheckedChange={() => toggleStatus(popup)}
                className="data-[state=checked]:bg-teal-500"
              />
            </div>

            {/* Configurações Visíveis */}
            <div className="px-8 py-4 space-y-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                <Globe className="h-4 w-4 text-brand-orange-coral" />
                <div className="flex flex-wrap gap-1">
                  {popup.target_pages.map(page => (
                    <Badge key={page} variant="outline" className="bg-white/5 border-none text-[10px] text-gray-400">
                      {page === '*' ? 'Todas as páginas' : page}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider px-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Aparece após {popup.show_after_seconds}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5" />
                  <span>Prioridade {popup.priority}</span>
                </div>
              </div>
            </div>

            {/* Footer Ações */}
            <div className="mt-4 p-4 bg-white/5 border-t border-white/5 flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setEditingPopup(popup);
                  setIsModalOpen(true);
                }}
                className="flex-1 h-12 rounded-xl text-xs font-black text-gray-400 hover:text-white hover:bg-white/10"
              >
                <Settings2 className="h-4 w-4 mr-2" />
                EDITAR
              </Button>
              <Button 
                variant="ghost"
                onClick={() => handleDelete(popup.id)}
                disabled={isDeleting === popup.id}
                className="w-12 h-12 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
              >
                {isDeleting === popup.id ? <Plus className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}

        {popups.length === 0 && !isLoading && (
          <div className="col-span-full border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Layout className="h-10 w-10 text-gray-800" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-500 uppercase tracking-tighter">Nenhum Pop-up Ativo</h3>
              <p className="text-gray-700 font-medium">Inicie sua estratégia de captura criando o primeiro banner de oferta.</p>
            </div>
            <Button 
              onClick={() => {
                setEditingPopup(initialForm);
                setIsModalOpen(true);
              }}
              variant="ghost"
              className="text-brand-orange-coral font-black border border-brand-orange-coral/20 rounded-2xl h-12 px-8 hover:bg-brand-orange-coral/10"
            >
              CRIAR NOVO AGORA
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="admin-modal-content p-0 border-none max-w-2xl">
          <div className="admin-modal-header">
            <div>
              <DialogTitle className="text-xl font-black italic uppercase leading-none flex items-center gap-4">
                <Sparkles className="h-6 w-6 text-brand-orange-coral" />
                {editingPopup?.id ? 'Configurar Pop-up' : 'Novo Pop-up Estratégico'}
              </DialogTitle>
              <DialogDescription className="text-gray-500 uppercase text-[9px] font-bold tracking-widest mt-1">
                Defina as regras de exibição e o gatilho emocional para conversão
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="flex flex-col min-h-0 overflow-hidden custom-scrollbar">
            <div className="admin-modal-body overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {/* Bloco 1: Conteúdo */}
                <div className="space-y-6">
                  <h4 className="text-[10px] text-brand-orange-coral font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Layout className="h-4 w-4" /> Conteúdo Visual
                    <div className="h-px bg-white/5 flex-1" />
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Título do Banner</label>
                      <Input 
                        value={editingPopup?.title}
                        onChange={e => setEditingPopup(p => ({ ...p, title: e.target.value }))}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="Ex: 🚀 Convite Exclusivo!"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Tipo de Experiência</label>
                      <select 
                        value={editingPopup?.type}
                        onChange={e => setEditingPopup(p => ({ ...p, type: e.target.value as any }))}
                        className="w-full h-12 bg-dark-100 border border-white/5 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-brand-orange-coral/50 transition-all appearance-none"
                      >
                        <option value="newsletter">Captura (Newsletter/Lead)</option>
                        <option value="offer">Oferta (Venda/Inscrição)</option>
                        <option value="info">Informativo (Aviso/Urgência)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Descrição / Chamada para Ação</label>
                      <textarea 
                        rows={3}
                        value={editingPopup?.description}
                        onChange={e => setEditingPopup(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-dark-100 border border-white/5 rounded-2xl p-4 text-white font-medium resize-none focus:outline-none focus:border-brand-orange-coral/50 transition-all flex items-center min-h-[100px]"
                        placeholder="Explique o benefício de clicar..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 2: Regras de Exibição */}
                <div className="space-y-6 pt-4 mt-4 border-t border-white/5">
                  <h4 className="text-[10px] text-teal-500 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Target className="h-4 w-4" /> Regras de Targeting
                    <div className="h-px bg-white/5 flex-1" />
                  </h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Páginas Escolhidas (URLs separadas por vírgula)</label>
                    <Input 
                      value={editingPopup?.target_pages?.join(', ')}
                      onChange={e => setEditingPopup(p => ({ ...p, target_pages: e.target.value.split(',').map(s => s.trim()) }))}
                      className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                      placeholder="Ex: *, /precos, /sobre"
                    />
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider pl-1 font-mono">Dica: Use * para exibir em todas as páginas</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Delay (Segundos)</label>
                      <Input 
                        type="number"
                        value={editingPopup?.show_after_seconds}
                        onChange={e => setEditingPopup(p => ({ ...p, show_after_seconds: parseInt(e.target.value) }))}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Prioridade</label>
                      <Input 
                        type="number"
                        value={editingPopup?.priority}
                        onChange={e => setEditingPopup(p => ({ ...p, priority: parseInt(e.target.value) }))}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloco 3: Botão de Ação */}
                <div className="space-y-6 pt-4 mt-4 border-t border-white/5">
                  <h4 className="text-[10px] text-brand-orange-coral font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <ChevronRight className="h-4 w-4" /> Call to Action
                    <div className="h-px bg-white/5 flex-1" />
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Texto do Botão</label>
                      <Input 
                        value={editingPopup?.cta_text}
                        onChange={e => setEditingPopup(p => ({ ...p, cta_text: e.target.value }))}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="Ex: Saiba mais"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Link de Destino</label>
                      <Input 
                        value={editingPopup?.cta_link}
                        onChange={e => setEditingPopup(p => ({ ...p, cta_link: e.target.value }))}
                        className="h-12 bg-dark-100 border-white/5 text-white font-bold"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 font-bold uppercase text-[10px] tracking-widest"
              >
                Descartar
              </Button>
              <Button 
                type="submit"
                className="flex-[2] h-14 bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black rounded-2xl shadow-glow-orange transition-all uppercase tracking-widest text-[10px]"
              >
                SALVAR CONFIGURAÇÃO
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
