import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { NPSForm } from '@/types';
import { Plus, Trash2, Edit, Save, ArrowRight, X, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NPSFormBuilder } from './NPSFormBuilder';

export default function NPSForms() {
  const { projectId } = useProject();
  const [forms, setForms] = useState<NPSForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'builder'>('info');
  const [editingForm, setEditingForm] = useState<Partial<NPSForm>>({});

  useEffect(() => {
    if (projectId) loadForms();
  }, [projectId]);

  const loadForms = async () => {
    setLoading(true);
    const data = await npsModuleService.getForms(projectId!);
    setForms(data);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingForm({
      internalName: '',
      description: '',
      objective: ''
    });
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const openEditModal = (form: NPSForm) => {
    setEditingForm(form);
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const payload = {
      ...editingForm,
      projectId,
      status: editingForm.status || 'draft',
      language: editingForm.language || 'pt-BR',
      defaultChannel: editingForm.defaultChannel || 'in_app',
    };

    const savedForm = await npsModuleService.saveForm(payload);

    if (savedForm) {
      toast.success(editingForm.id ? 'Pesquisa atualizada com sucesso!' : 'Pesquisa criada!');
      setIsModalOpen(false);
      loadForms();
    } else {
      toast.error('Erro ao salvar pesquisa.');
    }
  };

  const handleGenerateLink = async (form: NPSForm) => {
    if (!projectId) return;
    const token = await npsModuleService.generatePublicToken(form.id, projectId);
    if (token) {
       const url = `${window.location.origin}/survey/${form.id}?token=${token}`;
       navigator.clipboard.writeText(url);
       toast.success('Link de pesquisa copiado para a área de transferência!');
    } else {
       toast.error('Erro ao gerar link da pesquisa.');
    }
  };

  if (loading) {
     return <div className="text-center py-20 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando formulários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-dark-200 border border-white/5 p-6 rounded-[2rem]">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight">Pesquisas & Formulários</h2>
          <p className="text-[12px] font-bold text-gray-400 tracking-widest uppercase mt-1">Configure o banco de NPS do evento</p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-12 px-8 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-5 w-5 mr-2" /> CRIAR NOVA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.length === 0 && (
          <div className="col-span-full py-16 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-dark-200/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/5 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-6 h-6" />
              </div>
              <p className="text-[12px] font-black uppercase tracking-widest text-white mb-2">Nenhum formulário encontrado</p>
              <p className="text-[11px] font-bold text-gray-500 max-w-xs mx-auto">Você ainda não criou a base para coleta do seu NPS.</p>
            </div>
          </div>
        )}
        
        {forms.map(form => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-[1.5rem] bg-dark-200 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <Badge className={`uppercase text-[8px] font-black tracking-widest ${
                  form.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                  form.status === 'archived' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-white/5 text-gray-400 border border-white/10'
                }`}>
                  {form.status === 'active' ? 'Ativo' : form.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                </Badge>
                {form.status === 'active' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </div>
              <h3 className="font-black text-white text-lg italic tracking-tight">{form.internalName}</h3>
              <p className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">{form.description || 'Sem descrição'}</p>
              
              <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5 border-l-2 border-l-brand-orange-coral">
                 <p className="text-[10px] text-gray-500 italic line-clamp-1">"{form.objective || 'Nenhum objetivo definido'}"</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex-1">
                Mod: {new Date(form.updatedAt || form.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-white hover:text-white bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold" onClick={() => handleGenerateLink(form)}>
                <Link className="h-3 w-3 mr-1.5" /> Link Único
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-white hover:text-white bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold" onClick={() => openEditModal(form)}>
                <Edit className="h-3 w-3 mr-1.5 text-brand-orange-coral" /> Editar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-dark-200 border-white/10 text-white rounded-[2.5rem] p-0 max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
           <div className="p-8 pb-0 border-b border-white/5 bg-gradient-to-r from-dark-200 to-black">
              <DialogTitle className="text-2xl font-black italic uppercase text-brand-orange-coral flex items-center">
                {editingForm.id ? 'Modificar Pesquisa' : 'Nova Pesquisa Base'}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2 mb-6">
                Personalize os textos apresentados ao usuário no Front-end.
              </DialogDescription>

              {/* TABS */}
              {editingForm.id && (
                <div className="flex gap-6 mt-4">
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`pb-4 uppercase text-[10px] font-black tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-brand-orange-coral text-brand-orange-coral' : 'border-transparent text-gray-500'}`}
                  >
                    1. Configuração Pai
                  </button>
                  <button 
                    onClick={() => setActiveTab('builder')}
                    className={`pb-4 uppercase text-[10px] font-black tracking-widest border-b-2 transition-all ${activeTab === 'builder' ? 'border-brand-orange-coral text-brand-orange-coral' : 'border-transparent text-gray-500'}`}
                  >
                    2. Construtor de Blocos (UI)
                  </button>
                </div>
              )}
           </div>
          
          {activeTab === 'info' && (
            <form onSubmit={handleSave} className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-black tracking-widest text-[#14B8A6] flex items-center mb-4">
                  IDENTIFICAÇÃO INTERNA <div className="h-px bg-white/5 flex-1 ml-4" />
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Nome Interno</Label>
                    <Input 
                      required 
                      placeholder="Ex: NPS Pós-Evento VIP" 
                      value={editingForm.internalName || ''}
                      onChange={e => setEditingForm({ ...editingForm, internalName: e.target.value })}
                      className="bg-white/5 border-white/10 h-12 rounded-2xl focus:border-brand-orange-coral focus:ring-0 text-white font-bold" 
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Descrição</Label>
                    <Input 
                      placeholder="Ex: Enviado apenas para lote VIP..." 
                      value={editingForm.description || ''}
                      onChange={e => setEditingForm({ ...editingForm, description: e.target.value })}
                      className="bg-white/5 border-white/10 h-10 rounded-2xl focus:border-brand-orange-coral focus:ring-0" 
                    />
                  </div>
                  {editingForm.id && (
                     <div className="space-y-2 col-span-2 mt-2">
                       <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Status da Pesquisa</Label>
                       <select 
                          value={editingForm.status} 
                          onChange={(e) => setEditingForm({...editingForm, status: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 h-12 rounded-2xl px-4 text-white font-bold focus:border-brand-orange-coral focus:ring-0"
                       >
                          <option value="draft">Rascunho (Não Dispara)</option>
                          <option value="active">Ativo (Permite Receber Repostas)</option>
                          <option value="archived">Arquivado (Inativo/Histórico)</option>
                       </select>
                     </div>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-4 flex gap-4 sticky bottom-0 bg-dark-200 pb-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-white/10 hover:bg-white/5 text-gray-400 h-12 rounded-2xl text-xs font-bold uppercase tracking-widest">
                  CANCELAR
                </Button>
                <Button type="submit" className="flex-[2] bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-12 rounded-2xl text-sm uppercase tracking-widest">
                  <Save className="w-4 h-4 mr-2" />
                  {editingForm.id ? 'SALVAR ALTERAÇÕES' : 'CRIAR PARA LIBERAR BUILDER'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'builder' && editingForm.id && (
             <div className="flex-1 overflow-hidden">
                <NPSFormBuilder formId={editingForm.id} />
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

