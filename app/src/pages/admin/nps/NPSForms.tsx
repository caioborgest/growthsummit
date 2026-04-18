import { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { npsModuleService } from '@/services/npsModuleService';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function NPSForms() {
  const { projectId } = useProject();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ internalName: '', description: '' });

  useEffect(() => {
    if (projectId) loadForms();
  }, [projectId]);

  const loadForms = async () => {
    setLoading(true);
    const data = await npsModuleService.getForms(projectId!);
    setForms(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const newForm = await npsModuleService.saveForm({
      projectId,
      internalName: formData.internalName,
      description: formData.description,
      status: 'draft',
      language: 'pt-BR',
      defaultChannel: 'email',
    });

    if (newForm) {
      toast.success('Pesquisa criada!');
      setIsModalOpen(false);
      setFormData({ internalName: '', description: '' });
      loadForms();
    } else {
      toast.error('Erro ao criar pesquisa.');
    }
  };

  if (loading) {
     return <div className="text-center py-20 text-gray-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">Carregando formulários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Pesquisas Cadastradas</h2>
          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Gerencie os formulários de NPS do evento</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-orange-coral hover:bg-orange-600 text-white font-black rounded-2xl h-10 px-6 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4 mr-2" /> NOVA PESQUISA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.length === 0 && (
          <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Nenhum formulário encontrado</p>
          </div>
        )}
        
        {forms.map(form => (
          <motion.div
            key={form.id}
            whileHover={{ y: -4 }}
            className="p-6 rounded-[1.5rem] bg-dark-200 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <Badge className={`uppercase text-[8px] font-black tracking-widest ${form.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                  {form.status}
                </Badge>
              </div>
              <h3 className="font-black text-white text-lg italic tracking-tight">{form.internalName}</h3>
              <p className="text-gray-400 text-xs mt-2 line-clamp-2">{form.description || 'Sem descrição'}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {new Date(form.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-brand-orange-coral bg-brand-orange-coral/10 hover:bg-brand-orange-coral/20 rounded-xl" onClick={() => toast.info('Em breve: Editor Avançado')}>
                <Edit className="h-3 w-3 mr-1.5" /> Editar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-dark-200 border-white/10 text-white rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic uppercase">Nova Pesquisa</DialogTitle>
            <DialogDescription className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Defina o nome base para começar.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Nome Interno</Label>
              <Input 
                required 
                placeholder="Ex: NPS Pós-Evento VIP" 
                value={formData.internalName}
                onChange={e => setFormData({ ...formData, internalName: e.target.value })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:border-brand-orange-coral focus:ring-0" 
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-[10px] font-black text-gray-500 tracking-widest ml-1">Descrição</Label>
              <Input 
                placeholder="Ex: Enviado apenas para lote VIP..." 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/10 h-12 rounded-2xl focus:border-brand-orange-coral focus:ring-0" 
              />
            </div>
            <Button type="submit" className="w-full bg-brand-orange-coral hover:bg-brand-orange-intense text-white font-black h-12 rounded-2xl">
              SALVAR RASCUNHO
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
