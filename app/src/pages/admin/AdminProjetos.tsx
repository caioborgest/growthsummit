import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  X, Calendar, MapPin, Settings as SettingsIcon, CheckCircle2, Clock, AlertCircle, Plus, Edit, 
  Trash2, Eye, Diamond, Award, ShieldCheck, Ticket, Layers, Users, CircleDollarSign, Info,
  Check, Rocket, Target, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Switch } from '@/components/ui/switch';
import type { Project, ProjectType, ProjectStatus } from '@/types';

const projectTypeLabels: Record<ProjectType, string> = {
  growth_experience: 'Growth Experience',
  growth_conference: 'Growth Conference',
  growth_festival: 'Growth Festival',
};

const projectStatusLabels: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  active: { label: 'Ativo', color: 'bg-green-500', icon: CheckCircle2 },
  paused: { label: 'Pausado', color: 'bg-yellow-500', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-blue-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: AlertCircle },
};

const defaultSettings = {
  enableB2B: true,
  enableMentoring: true,
  enableStartups: true,
  enableCheckIn: true,
  ticketPrices: { standard: 197, pro: 347, vip: 1500 },
  ticketTiers: [],
  publicContent: {
    heroTitle: 'Growth Experience 2026',
    heroSubtitle: 'O MAIOR EVENTO DE CRECHIMENTO DO NORDESTE',
  }
};

export default function AdminProjetos() {
  const { data: projects, create, update, remove, isLoading } = useProjects();
  const { selectedProject, setSelectedProject } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    type: 'growth_experience',
    status: 'draft',
    location: '',
    city: '',
    state: '',
    settings: defaultSettings,
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.location || !formData.city || !formData.state || !formData.startDate || !formData.endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const nameSlug = (formData.name || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // remove acentos
        .replace(/growth\s+experience/g, 'ge')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-2026$/g, '');

      await create({
        ...formData,
        slug: `${nameSlug}-2026`,
        description: formData.description || '',
        settings: formData.settings || defaultSettings,
      } as any);

      toast.success('Projeto criado com sucesso!');
      setIsDialogOpen(false);
      setFormData({
        type: 'growth_experience',
        status: 'draft',
        location: '',
        city: '',
        state: '',
        settings: defaultSettings,
      });
    } catch (err: any) {
      logger.error('Erro ao criar projeto:', err);
      toast.error(`Erro ao criar projeto: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleUpdate = async () => {
    if (!editingProject) return;

    try {
      const updateData = {
        ...formData,
        settings: {
          ...defaultSettings,
          ...formData.settings,
        }
      };

      await update(editingProject.id, updateData);

      // Sincronizar contexto se o projeto editado for o selecionado no momento
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject({
          ...selectedProject,
          ...updateData
        });
      }

      toast.success('Projeto atualizado com sucesso!');
      setIsDialogOpen(false);
      setEditingProject(null);
      setFormData({
        type: 'growth_experience',
        status: 'draft',
        location: '',
        city: '',
        state: '',
        settings: defaultSettings,
      });
    } catch (err: any) {
      logger.error('Erro ao atualizar projeto:', err);
      toast.error(`Erro ao atualizar projeto: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        await remove(id);
        toast.success('Projeto excluído com sucesso!');
      } catch (err: any) {
        logger.error('Erro ao remover projeto:', err);
        const message = err.message || 'Erro desconhecido. Verifique se existem registros vinculados a este projeto.';
        toast.error(`Erro ao remover projeto: ${message}`);
      }
    }
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData(project);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (editId && projects.length > 0 && !isDialogOpen) {
      const projectToEdit = projects.find(p => p.id === editId);
      if (projectToEdit) {
        openEditDialog(projectToEdit);
        setSearchParams({}, { replace: true });
      }
    }
  }, [editId, projects, isDialogOpen, setSearchParams]);

  const addPalestrante = () => {
    const currentPalestrantes = formData.settings?.publicContent?.palestrantes || [];
    setFormData({
      ...formData,
      settings: {
        ...defaultSettings,
        ...formData.settings,
        publicContent: {
          ...formData.settings?.publicContent,
          palestrantes: [
            ...currentPalestrantes,
            { nome: '', cargo: '', descricao: '', tema: '', horario: '' }
          ]
        }
      }
    });
  };

  const addVaga = () => {
    const currentVagas = formData.settings?.publicContent?.vagas || [];
    setFormData({
      ...formData,
      settings: {
        ...defaultSettings,
        ...formData.settings,
        publicContent: {
          ...formData.settings?.publicContent,
          vagas: [
            ...currentVagas,
            { nome: '', espaco: '', ingressos: 0, beneficios: [], vagas: 0 }
          ]
        }
      }
    });
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    setFormData({
      type: 'growth_experience',
      status: 'draft',
      location: '',
      city: '',
      state: '',
      settings: defaultSettings,
    });
    setIsDialogOpen(true);
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    toast.success(`Projeto "${project.name}" selecionado`);
  };

  const formatDate = (date: string) => {
    if (!date) return '---';
    // Se a data for apenas YYYY-MM-DD, adicionamos o meio do dia para evitar reversão de data por fuso horário
    const d = date.includes('T') ? new Date(date) : new Date(date + 'T12:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const draftProjects = projects.filter(p => p.status === 'draft');
  const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'cancelled');
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black text-brand-orange-coral uppercase tracking-[0.3em]">Ambiente de Gestão</span>
            <div className="h-[1px] w-12 bg-brand-orange-coral/30"></div>
          </div>

          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500 cursor-default">
            Gestão de <span className="text-teal-400 group-hover:text-white transition-colors">Projetos</span>
          </h1>
          <div className="flex items-center gap-4 pt-2">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Growth Experience V3.0
            </div>
            <p className="text-[11px] text-[#475569] font-bold uppercase tracking-widest">Controle estratégico de eventos e edições</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
                onClick={openCreateDialog} 
                className="h-16 px-10 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white shadow-glow-teal transition-all font-black uppercase text-[11px] tracking-widest border-none group"
            >
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-500" />
              Lançar Novo Projeto
            </Button>
          </DialogTrigger>


          <DialogContent className="bg-[#0F172A] border-white/5 text-white sm:max-w-[1440px] h-fit max-h-[98vh] rounded-[3rem] p-10 overflow-x-hidden scrollbar-hide">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
              <DialogDescription className="sr-only">
                Formulário para configuração técnica e visual do projeto/evento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs defaultValue="geral" className="w-full">

                <TabsList className="bg-[#0F172A] border border-white/5 mb-8 flex flex-wrap h-auto p-1.5 rounded-[1.5rem] gap-1">
                  <TabsTrigger value="geral" className="flex-1 rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white data-[state=active]:shadow-glow-orange transition-all duration-500">Geral</TabsTrigger>
                  <TabsTrigger value="financeiro" className="flex-1 rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white data-[state=active]:shadow-glow-orange transition-all duration-500">Financeiro</TabsTrigger>
                  <TabsTrigger value="modulos" className="flex-1 rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white data-[state=active]:shadow-glow-orange transition-all duration-500">Módulos</TabsTrigger>
                  <TabsTrigger value="conteudo" className="flex-1 rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white data-[state=active]:shadow-glow-orange transition-all duration-500">Conteúdo</TabsTrigger>
                  <TabsTrigger value="integracao" className="flex-1 rounded-[1.2rem] py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-brand-orange-coral data-[state=active]:text-white data-[state=active]:shadow-glow-orange transition-all duration-500">Integração</TabsTrigger>
                </TabsList>


                <TabsContent value="geral" className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-500 pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 bg-black/40 border border-white/5 rounded-[3rem]">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
                        <Info className="w-3 h-3 text-brand-orange-coral" />
                        Identificador do Evento
                      </Label>
                      <Input
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="EX: GROWTH EXPERIENCE 2026"
                        className="bg-black/60 border-white/5 rounded-[1.5rem] h-16 text-white font-black italic text-lg px-6 focus:border-brand-orange-coral/50 transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
                        <Layers className="w-3 h-3 text-brand-orange-coral" />
                        Segmento do Projeto
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: ProjectType) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="bg-black/60 border-white/5 rounded-[1.5rem] h-16 text-white font-black italic text-lg px-6 focus:border-brand-orange-coral/50 transition-all uppercase">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F172A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                          <SelectItem value="growth_experience" className="text-white font-bold uppercase text-[10px] tracking-widest">Growth Experience</SelectItem>
                          <SelectItem value="growth_conference" className="text-white font-bold uppercase text-[10px] tracking-widest">Growth Conference</SelectItem>
                          <SelectItem value="growth_festival" className="text-white font-bold uppercase text-[10px] tracking-widest">Growth Festival</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#475569] ml-1">
                        <Edit className="w-3 h-3 text-brand-orange-coral" />
                        Descrição Técnica
                      </Label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="BREVE DESCRIÇÃO INTERNA..."
                        className="w-full bg-black/60 border-white/5 rounded-[1.5rem] p-6 text-white font-bold italic h-16 text-xs focus:border-brand-orange-coral/50 outline-none transition-all resize-none uppercase"
                      />
                    </div>
                  </div>



                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Location Card */}
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                          <MapPin className="h-5 w-5 text-brand-orange-coral" />
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Localização</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[8px] font-black uppercase text-[#475569] ml-1">Local do Evento</Label>
                          <Input
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="bg-black/40 border-none h-10 text-white font-black italic rounded-xl px-4 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-[#475569] ml-1">Cidade</Label>
                          <Input
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="bg-black/40 border-none h-10 text-white font-black italic rounded-xl px-4 text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-[#475569] ml-1">UF</Label>
                          <Input
                            value={formData.state || ''}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="bg-black/40 border-none h-10 text-white font-black italic rounded-xl px-2 text-center text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Calendar className="h-5 w-5 text-emerald-400" />
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Cronograma</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-emerald-500/50 ml-1">Data Início</Label>
                          <input
                            type="date"
                            value={formData.startDate || ''}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full bg-black/40 border-none text-white font-black h-10 px-4 rounded-xl outline-none [color-scheme:dark] text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-emerald-500/50 ml-1">Hora Início</Label>
                          <input
                            type="time"
                            value={formData.startTime || ''}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full bg-black/40 border-none text-white font-black h-10 px-4 rounded-xl outline-none [color-scheme:dark] text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-red-500/50 ml-1">Data Término</Label>
                          <input
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full bg-black/40 border-none text-white font-black h-10 px-4 rounded-xl outline-none [color-scheme:dark] text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-red-500/50 ml-1">Hora Término</Label>
                          <input
                            type="time"
                            value={formData.endTime || ''}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full bg-black/40 border-none text-white font-black h-10 px-4 rounded-xl outline-none [color-scheme:dark] text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Config Card */}
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <SettingsIcon className="h-5 w-5 text-purple-400" />
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Estética & Status</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-[#475569] ml-1">Cor Master</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.primaryColor || '#21808D'}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                              className="w-10 h-10 p-1 bg-black/60 border border-white/10 rounded-lg cursor-pointer"
                            />
                            <Input
                                value={formData.primaryColor || '#21808D'}
                                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                className="flex-1 bg-black/40 border-none h-10 text-white font-black text-[10px] rounded-xl px-3 uppercase italic"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[8px] font-black uppercase text-[#475569] ml-1">Status Global</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                          >
                            <SelectTrigger className="bg-black/40 border-none h-10 text-white font-black rounded-xl px-4 text-[9px] uppercase tracking-widest italic">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0F172A] border-white/10 rounded-2xl">
                              <SelectItem value="draft" className="text-white font-bold uppercase text-[9px] tracking-widest">Rascunho</SelectItem>
                              <SelectItem value="active" className="text-white font-bold uppercase text-[9px] tracking-widest">Ativo</SelectItem>
                              <SelectItem value="paused" className="text-white font-bold uppercase text-[9px] tracking-widest">Pausado</SelectItem>
                              <SelectItem value="completed" className="text-white font-bold uppercase text-[9px] tracking-widest">Concluído</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                              <TabsContent value="financeiro" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-8 pt-6 border-t border-white/5">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-10 rounded-[2.5rem] border border-white/10">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-2xl bg-brand-orange-coral/10 border border-brand-orange-coral/20">
                                        <Layers className="h-8 w-8 text-brand-orange-coral animate-pulse" />
                                    </div>
                                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">Gestão de <span className="text-brand-orange-coral">Lotes & Categorias</span></h4>
                                </div>
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.25em] ml-16">Configuração de Precificação Dinâmica</p>
                            </div>
                            <Button
                                onClick={() => {
                                    const currentTiers = formData.settings?.ticketTiers || [];
                                    const newTier = {
                                        id: `tier_${Date.now()}`,
                                        name: 'Nova Categoria',
                                        active: true,
                                        batches: [{ id: `batch_${Date.now()}`, name: 'Lote 1', price: 0, active: true }]
                                    };
                                    setFormData({
                                        ...formData,
                                        settings: { ...formData.settings!, ticketTiers: [...currentTiers, newTier] }
                                    });
                                }}
                                className="bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white shadow-glow-orange h-14 px-8 rounded-2xl flex items-center justify-center gap-2 group transition-all"
                            >
                                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="uppercase text-[11px] tracking-widest font-black">Adicionar Categoria</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {(formData.settings?.ticketTiers || []).map((tier, tIdx) => (
                                <div key={tier.id} className="glass-card overflow-hidden border-white/10 group/tier relative">
                                    {/* Tier Header */}
                                    <div className="p-6 bg-white/[0.03] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all group-hover/tier:bg-white/[0.05]">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20 shadow-glow-orange/10 group-hover/tier:scale-110 transition-all">
                                                <Ticket className="h-6 w-6 text-brand-orange-coral" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identificação da Categoria</Label>
                                                <Input
                                                    value={tier.name}
                                                    onChange={(e) => {
                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                        newTiers[tIdx].name = e.target.value;
                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                    }}
                                                    className="bg-transparent border-none text-white font-black italic uppercase h-10 w-full lg:w-64 text-lg focus:ring-0 p-0 focus:border-b focus:border-brand-orange-coral/50 rounded-none transition-all"
                                                    placeholder="NOME DA CATEGORIA (EX: VIP)"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 bg-black/20 p-2 pl-4 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${tier.active ? 'text-emerald-400' : 'text-gray-600'}`}>
                                                    {tier.active ? 'CATEGORIA ATIVA' : 'CATEGORIA INATIVA'}
                                                </span>
                                                <Switch
                                                    checked={tier.active}
                                                    onCheckedChange={(val) => {
                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                        newTiers[tIdx].active = val;
                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                    }}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                            <div className="w-[1px] h-8 bg-white/10" />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newTiers = (formData.settings?.ticketTiers || []).filter((_, i) => i !== tIdx);
                                                    setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                }}
                                                className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 h-10 w-10 transition-all rounded-xl"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Batches Container */}
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-4 bg-brand-orange-coral rounded-full" />
                                            <p className="text-[11px] font-black text-white uppercase tracking-[0.25em] italic">Vigência de Lotes</p>
                                        </div>


                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {tier.batches.map((batch, bIdx) => (

                                                <div key={batch.id} className="relative group/batch">
                                                    <div className={`p-8 rounded-[2.5rem] transition-all duration-300 border space-y-8 relative overflow-hidden group ${batch.active ? 'bg-[#1E293B]/40 border-brand-orange-coral/20 shadow-2xl' : 'bg-black/40 border-white/5 opacity-60 hover:opacity-100 transition-opacity'}`}>
                                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                                                            <Ticket className="h-24 w-24 text-white" />
                                                        </div>
                                                        
                                                        {/* Batch Info */}
                                                        <div className="flex items-center gap-6 relative z-10">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-xl ${batch.active ? 'bg-brand-orange-coral text-white shadow-glow-orange animate-pulse' : 'bg-white/10 text-gray-500'}`}>
                                                                #{bIdx + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Identificador</Label>
                                                                <Input
                                                                    value={batch.name}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                        newTiers[tIdx].batches[bIdx].name = e.target.value;
                                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                    }}
                                                                    className="bg-transparent border-none text-white font-black italic text-2xl h-auto w-full focus:ring-0 p-0 uppercase"
                                                                    placeholder="NOME DO LOTE"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Batch Settings Grid */}
                                                        <div className="grid grid-cols-1 gap-6 relative z-10">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Quantity */}
                                                                <div className="bg-black/40 p-6 rounded-[1.5rem] border border-white/5 space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <Users className="h-4 w-4 text-[#475569]" />
                                                                        <span className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Qtd Máxima</span>
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        value={batch.maxCapacity || ''}
                                                                        onChange={(e) => {
                                                                            const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                            newTiers[tIdx].batches[bIdx].maxCapacity = parseInt(e.target.value) || undefined;
                                                                            setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                        }}
                                                                        className="bg-transparent border-none text-white font-black text-2xl h-auto w-full p-0 focus:ring-0 italic"
                                                                        placeholder="∞"
                                                                    />
                                                                </div>

                                                                {/* Price */}
                                                                <div className={`p-6 rounded-[1.5rem] border transition-all space-y-3 ${batch.active ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30' : 'bg-black/60 border-white/5'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <CircleDollarSign className={`h-4 w-4 ${batch.active ? 'text-brand-orange-coral' : 'text-[#475569]'}`} />
                                                                        <span className={`text-[10px] font-black tracking-widest uppercase ${batch.active ? 'text-brand-orange-coral' : 'text-[#475569]'}`}>Investimento</span>
                                                                    </div>
                                                                    <div className="flex items-end gap-2">
                                                                        <span className="text-sm font-black text-brand-orange-coral italic leading-none mb-1">R$</span>
                                                                        <Input
                                                                            type="number"
                                                                            value={batch.price}
                                                                            onChange={(e) => {
                                                                                const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                                newTiers[tIdx].batches[bIdx].price = parseFloat(e.target.value) || 0;
                                                                                setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                            }}
                                                                            className="bg-transparent border-none text-white font-black text-2xl h-auto w-full p-0 focus:ring-0 italic tabular-nums"
                                                                            placeholder="0,00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Dates */}
                                                            <div className="bg-black/40 p-6 rounded-[1.5rem] border border-white/5 space-y-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Calendar className="h-4 w-4 text-[#475569]" />
                                                                    <span className="text-[10px] font-black text-[#475569] uppercase tracking-widest">Período de Venda</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-6 pb-2">
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic opacity-50">Data Início</span>
                                                                        <input
                                                                            type="date"
                                                                            value={batch.startDate || ''}
                                                                            onChange={(e) => {
                                                                                const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                                newTiers[tIdx].batches[bIdx].startDate = e.target.value;
                                                                                setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                            }}
                                                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 outline-none w-full [color-scheme:dark] italic"
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest italic opacity-50">Data Término</span>
                                                                        <input
                                                                            type="date"
                                                                            value={batch.endDate || ''}
                                                                            onChange={(e) => {
                                                                                const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                                newTiers[tIdx].batches[bIdx].endDate = e.target.value;
                                                                                setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                            }}
                                                                            className="bg-transparent border-none text-white font-black text-lg p-0 focus:ring-0 outline-none w-full [color-scheme:dark] italic"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Batch Actions */}
                                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-3">
                                                                <Switch
                                                                    checked={batch.active}
                                                                    onCheckedChange={(val) => {
                                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                        if (val) {
                                                                            newTiers[tIdx].batches.forEach((b, i) => b.active = i === bIdx);
                                                                        } else {
                                                                            newTiers[tIdx].batches[bIdx].active = false;
                                                                        }
                                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                    }}
                                                                    className="data-[state=checked]:bg-emerald-500"
                                                                />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#475569]">
                                                                    {batch.active ? 'Status: Público' : 'Status: Pausado'}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                    newTiers[tIdx].batches = newTiers[tIdx].batches.filter((_, i) => i !== bIdx);
                                                                    setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                }}
                                                                className="text-gray-700 hover:text-red-500 hover:bg-red-500/10 h-10 w-10 transition-all rounded-xl"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                    newTiers[tIdx].batches.push({
                                                        id: `batch_${Date.now()}`,
                                                        name: `Lote ${newTiers[tIdx].batches.length + 1}`,
                                                        price: 0,
                                                        active: false
                                                    });
                                                    setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                }}
                                                className="w-full border-2 border-dashed border-white/5 hover:border-brand-orange-coral/50 bg-white/[0.02] hover:bg-brand-orange-coral/5 text-gray-500 hover:text-white transition-all h-16 rounded-[1.5rem] flex items-center justify-center gap-3 group/add"
                                            >
                                                <div className="p-2 rounded-xl bg-white/5 group-hover/add:bg-brand-orange-coral group-hover/add:text-white transition-all">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-[0.25em] italic">Nova Vigência para {tier.name}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!formData.settings?.ticketTiers || formData.settings?.ticketTiers.length === 0) && (
                                <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center bg-white/[0.01]">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <Ticket className="h-10 w-10 text-gray-700 opacity-20" />
                                    </div>
                                    <h5 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Sem precificação estratégica</h5>
                                    <p className="text-[#94A3B8] text-xs max-w-xs mx-auto mb-8 font-medium">Nenhuma categoria ou lote foi definido para este projeto ainda.</p>
                                    <Button
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                settings: {
                                                    ...formData.settings!,
                                                    ticketTiers: [
                                                        { id: 'standard', name: 'Standard', active: true, batches: [{ id: 'std_l1', name: 'Lote 1', price: 197, active: true }] },
                                                        { id: 'pro', name: 'Pro', active: true, batches: [{ id: 'pro_l1', name: 'Lote 1', price: 347, active: true }] },
                                                        { id: 'vip', name: 'VIP', active: true, batches: [{ id: 'vip_l1', name: 'Lote 1', price: 1500, active: true }] }
                                                    ]
                                                }
                                            });
                                        }}
                                        className="btn-premium px-10"
                                    >
                                        INICIALIZAR ESTRUTURA PADRÃO
                                    </Button>
                                </div>
                            )}
                        </div>


                        {/* Metas e Limites Header */}
                        <div className="flex items-center gap-4 pt-8">
                            <div className="w-12 h-12 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                                <Diamond className="h-6 w-6 text-brand-orange-coral" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Metas & <span className="text-brand-orange-coral">Planejamento</span></h4>
                                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1">Estimativas Técnicas do Projeto</p>
                            </div>
                        </div>
 
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-black/40 border border-white/5 rounded-[3rem]">
                            {[
                                { 
                                    label: 'Meta de Público', 
                                    value: formData.settings?.goalRegistrations, 
                                    key: 'goalRegistrations', 
                                    icon: Users, 
                                    suffix: 'PAX' 
                                },
                                { 
                                    label: 'Meta Financeira', 
                                    value: formData.settings?.goalRevenue, 
                                    key: 'goalRevenue', 
                                    icon: CircleDollarSign, 
                                    prefix: 'R$' 
                                },
                                { 
                                    label: 'Meta Patrocínio', 
                                    value: formData.settings?.goalSponsorship, 
                                    key: 'goalSponsorship', 
                                    icon: Award, 
                                    prefix: 'R$' 
                                },
                                { 
                                    label: 'Capacidade Local', 
                                    value: formData.settings?.maxRegistrations, 
                                    key: 'maxRegistrations', 
                                    icon: ShieldCheck, 
                                    suffix: 'LUGARES' 
                                },
                            ].map((field) => (
                                <div key={field.key} className="space-y-6 p-8 rounded-[2rem] bg-black/60 border border-white/5 hover:border-brand-orange-coral/30 transition-all duration-500 group">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#475569]">{field.label}</Label>
                                    </div>
                                    <div className="relative flex items-end gap-2">
                                        {field.prefix && <span className="text-lg font-black text-brand-orange-coral italic leading-none mb-1">{field.prefix}</span>}
                                        <Input
                                            type="number"
                                            value={field.value || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                settings: { ...formData.settings!, [field.key]: parseInt(e.target.value) || 0 }
                                            })}
                                            className="bg-transparent border-none text-white font-black h-auto w-full text-4xl p-0 focus:ring-0 italic tabular-nums"
                                            placeholder="0"
                                        />
                                        {field.suffix && <span className="text-[10px] font-black text-gray-800 uppercase mb-2 ml-1">{field.suffix}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>


                <TabsContent value="modulos" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      {
                        id: 'mentoring',
                        label: 'Mentorias VIP',
                        description: 'Habilitar agendamento de mentorias',
                        icon: Users,
                        checked: formData.settings?.enableMentoring ?? true,
                        key: 'enableMentoring'
                      },
                      {
                        id: 'b2b',
                        label: 'Rodada de Negócios (B2B)',
                        description: 'Matchmaking inteligente entre empresas',
                        icon: Layers,
                        checked: formData.settings?.enableB2B ?? true,
                        key: 'enableB2B'
                      },
                      {
                        id: 'startups',
                        label: 'Arena StartUp',
                        description: 'Plataforma de inscrições para startups',
                        icon: Diamond,
                        checked: formData.settings?.enableStartups ?? true,
                        key: 'enableStartups'
                      },
                      {
                        id: 'checkin',
                        label: 'Check-in Digital',
                        description: 'Controle de acesso premium via App',
                        icon: CheckCircle2,
                        checked: formData.settings?.enableCheckIn ?? true,
                        key: 'enableCheckIn'
                      }
                    ].map((mod) => (
                      <div key={mod.id} className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 group ${mod.checked ? 'bg-white/[0.05] border-brand-orange-coral/30' : 'bg-black/40 border-white/5 opacity-60'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${mod.checked ? 'bg-brand-orange-coral/20 text-brand-orange-coral shadow-glow-orange/10 scale-110' : 'bg-white/5 text-gray-500'}`}>
                            <mod.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <Label className="text-sm font-black uppercase tracking-tight text-white mb-0.5">{mod.label}</Label>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{mod.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={mod.checked}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            settings: { ...defaultSettings, ...formData.settings, [mod.key]: checked }
                          })}
                          className="data-[state=checked]:bg-brand-orange-coral"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="conteudo" className="space-y-8 pt-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  {/* Hero Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                        <Diamond className="h-4 w-4 text-brand-orange-coral" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Landing Page Hero</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                       <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Título Principal</Label>
                         <Input
                           value={formData.settings?.publicContent?.heroTitle || ''}
                           onChange={(e) => setFormData({
                             ...formData,
                             settings: {
                               ...defaultSettings,
                               ...formData.settings,
                               publicContent: { ...formData.settings?.publicContent, heroTitle: e.target.value }
                             }
                           })}
                           placeholder="Ex: O Maior Evento de Inovação"
                           className="bg-black/40 border-white/10 rounded-2xl h-12 text-white font-bold"
                         />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Subtítulo de Apoio</Label>
                         <Input
                           value={formData.settings?.publicContent?.heroSubtitle || ''}
                           onChange={(e) => setFormData({
                             ...formData,
                             settings: {
                               ...defaultSettings,
                               ...formData.settings,
                               publicContent: { ...formData.settings?.publicContent, heroSubtitle: e.target.value }
                             }
                           })}
                           placeholder="Ex: 16 de Abril em Triunfo"
                           className="bg-black/40 border-white/10 rounded-2xl h-12 text-white font-bold"
                         />
                       </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-2">Manifesto do Evento (Sobre)</Label>
                    <textarea
                      value={formData.settings?.publicContent?.aboutText || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          publicContent: { ...formData.settings?.publicContent, aboutText: e.target.value }
                        }
                      })}
                      className="w-full min-h-[120px] bg-black/40 border-white/10 rounded-[2rem] p-6 text-sm text-white font-medium focus:border-brand-orange-coral/50 outline-none transition-all resize-none"
                      placeholder="Descreva o propósito e a experiência do evento..."
                    />
                  </div>

                  {/* Palestrantes */}
                  <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                          <Users className="h-4 w-4 text-teal-400" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Line-up de Palestrantes</h4>
                      </div>
                      <Button size="sm" onClick={addPalestrante} className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl px-4 py-0 h-8 uppercase text-[9px] font-black tracking-widest">
                        <Plus className="w-3 h-3 mr-2" /> Add Palestrante
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.settings?.publicContent?.palestrantes?.map((p, i) => (
                        <div key={i} className="group relative p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-[2rem] border border-white/5 transition-all">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center shrink-0 border border-white/10">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1 space-y-3">
                              <Input 
                                placeholder="Nome Completo" 
                                value={p.nome} 
                                onChange={(e) => {
                                   const list = [...(formData.settings?.publicContent?.palestrantes || [])];
                                   list[i].nome = e.target.value;
                                   setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, palestrantes: list}}});
                                }} 
                                className="bg-transparent border-none text-white font-black p-0 h-6 text-sm placeholder:text-gray-700 focus:ring-0"
                              />
                              <Input 
                                placeholder="Bio/Cargo" 
                                value={p.cargo} 
                                onChange={(e) => {
                                   const list = [...(formData.settings?.publicContent?.palestrantes || [])];
                                   list[i].cargo = e.target.value;
                                   setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, palestrantes: list}}});
                                }} 
                                className="bg-transparent border-none text-gray-500 font-bold p-0 h-4 text-[10px] uppercase tracking-widest placeholder:text-gray-800 focus:ring-0 uppercase"
                              />
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
                            onClick={() => {
                              const list = [...(formData.settings?.publicContent?.palestrantes || [])];
                              list.splice(i, 1);
                              setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, palestrantes: list}}});
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cotas */}
                  <div className="space-y-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <Award className="h-4 w-4 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Cotas de Patrocínio</h4>
                      </div>
                      <Button size="sm" onClick={addVaga} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl px-4 py-0 h-8 uppercase text-[9px] font-black tracking-widest">
                        <Plus className="w-3 h-3 mr-2" /> Add Cota
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.settings?.publicContent?.vagas?.map((v, i) => (
                        <div key={i} className="group relative p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-[2rem] border border-white/5 transition-all">
                          <div className="space-y-3">
                            <Input 
                              placeholder="Título da Cota (ex: Platinum)" 
                              value={v.nome} 
                              onChange={(e) => {
                                 const list = [...(formData.settings?.publicContent?.vagas || [])];
                                 list[i].nome = e.target.value;
                                 setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, vagas: list}}});
                              }} 
                              className="bg-transparent border-none text-white font-black p-0 h-6 text-sm placeholder:text-gray-700"
                            />
                            <Input 
                              placeholder="Especificações (ex: Stand 12m²)" 
                              value={v.espaco} 
                              onChange={(e) => {
                                 const list = [...(formData.settings?.publicContent?.vagas || [])];
                                 list[i].espaco = e.target.value;
                                 setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, vagas: list}}});
                              }} 
                              className="bg-transparent border-none text-gray-500 font-bold p-0 h-4 text-[10px] uppercase tracking-widest placeholder:text-gray-800 uppercase"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
                            onClick={() => {
                              const list = [...(formData.settings?.publicContent?.vagas || [])];
                              list.splice(i, 1);
                              setFormData({...formData, settings: {...formData.settings!, publicContent: {...formData.settings?.publicContent, vagas: list}}});
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>



                <TabsContent value="integracao" className="space-y-8 pt-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-10 bg-black/40 border border-white/5 rounded-[3rem] space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-orange-coral/10 flex items-center justify-center border border-brand-orange-coral/20">
                        <ShieldCheck className="h-8 w-8 text-brand-orange-coral" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Widget de <span className="text-brand-orange-coral">Inscrição Oficial</span></h4>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-1">Incorpore em WordPress, Webflow ou Landing Pages</p>
                      </div>
                    </div>
 
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange-coral to-orange-600 rounded-[2rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                      <div className="relative bg-black/60 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-lg shadow-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-lg shadow-yellow-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-lg shadow-green-500/20"></div>
                          </div>
                          <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest italic opacity-50">IFRAME-SNIPPET.HTML</span>
                        </div>
                        <div className="p-8">
                            <pre className="text-[11px] sm:text-xs font-mono text-brand-orange-coral/70 overflow-x-auto leading-relaxed">
                                {`<iframe\n  src="${window.location.origin}/evento/${formData.slug || 'SEU-EVENTO'}?embed=true"\n  width="100%"\n  height="800px"\n  frameborder="0"\n></iframe>`}
                            </pre>
                        </div>
                        <Button 
                          className="absolute bottom-6 right-6 bg-brand-orange-coral hover:bg-brand-orange-coral/90 text-white shadow-glow-orange h-14 px-8 rounded-2xl transition-all font-black uppercase text-[11px] tracking-widest border-none"
                          onClick={() => {
                            const code = `<iframe src="${window.location.origin}/evento/${formData.slug || 'SEU-EVENTO'}?embed=true" width="100%" height="800px" frameborder="0"></iframe>`;
                            navigator.clipboard.writeText(code);
                            toast.success('Snippet copiado com sucesso!');
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2 rotate-45" /> COPIAR CÓDIGO
                        </Button>
                      </div>
                    </div>
 
                    <div className="bg-[#1E293B]/40 p-6 rounded-[1.5rem] border border-white/5 flex gap-4 items-start">
                      <div className="p-2 rounded-lg bg-gray-500/10">
                        <Info className="h-4 w-4 text-gray-500" />
                      </div>
                      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide leading-relaxed">
                        IMPORTANTE: Garanta que o domínio onde o iframe será inserido esteja configurado corretamente para evitar bloqueios de CORS (Cross-Origin Resource Sharing).
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>


              <div className="flex justify-end gap-3 pt-8 mt-6 border-t border-white/5">
                <Button 
                    variant="ghost" 
                    onClick={() => setIsDialogOpen(false)} 
                    className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#475569] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingProject ? handleUpdate : handleCreate}
                  disabled={isLoading}
                  className="h-14 px-10 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white shadow-glow-teal transition-all font-black uppercase text-[11px] tracking-widest border-none"
                >
                  {isLoading ? 'SALVANDO...' : editingProject ? 'Atualizar' : 'Criar Projeto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {selectedProject && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-teal-800 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <Card className="relative bg-[#0F172A]/80 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <Layers className="h-32 w-32 text-teal-500" />
                </div>
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-glow-teal/10">
                                <CheckCircle2 className="w-8 h-8 text-teal-400" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Projeto <span className="text-teal-400">Selecionado</span></h3>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ATIVO
                                    </Badge>
                                </div>
                                <p className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.2em]">{selectedProject.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={() => setSelectedProject(null)} 
                                className="h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest text-[#475569] hover:text-white hover:bg-white/5 transition-all border border-white/5"
                            >
                                <X className="w-4 h-4 mr-2" /> Trocar Projeto
                            </Button>
                            <Button 
                                onClick={() => openEditDialog(selectedProject)}
                                className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all font-black uppercase text-[11px] tracking-widest"
                            >
                                <Edit className="w-4 h-4 mr-2" /> Editar Setup
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      )}


      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-[#0F172A] border border-white/5 p-1.5 h-auto rounded-[1.5rem] mb-10 w-fit">
          <TabsTrigger value="active" className="rounded-[1.2rem] py-3 px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-500">
            Ativos ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="rounded-[1.2rem] py-3 px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-500">
            Rascunhos ({draftProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-[1.2rem] py-3 px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-500">
            Concluídos ({completedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-[1.2rem] py-3 px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all duration-500">
            Todos ({projects.length})
          </TabsTrigger>
        </TabsList>

        {['active', 'draft', 'completed', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(tab === 'all' ? projects : tab === 'active' ? activeProjects : tab === 'draft' ? draftProjects : completedProjects).map((project) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className="group relative"
                    >
                      {selectedProject?.id === project.id && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-[#2A9D8F] rounded-[2.5rem] blur opacity-60 animate-pulse"></div>
                      )}
                      
                      <Card className={`relative bg-[#0F172A]/60 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 h-full flex flex-col ${selectedProject?.id === project.id ? 'border-teal-500/50 shadow-2xl shadow-teal-500/10' : 'hover:border-white/10'}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                          <Ticket className="h-24 w-24 text-white" />
                        </div>

                        <CardHeader className="p-8 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/5 font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-full">
                                {projectTypeLabels[project.type]}
                              </Badge>
                              <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-teal-400 transition-colors">
                                {project.name}
                              </CardTitle>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${selectedProject?.id === project.id ? 'bg-teal-500 border-teal-400 text-white shadow-glow-teal' : 'bg-white/5 border-white/10 text-gray-500 group-hover:border-white/20'}`}>
                              {selectedProject?.id === project.id ? <Check className="w-6 h-6 font-black" /> : <Layers className="w-5 h-5" />}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="px-8 pb-8 flex-1 flex flex-col space-y-6">
                          <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                            {project.description || 'Nenhuma descrição técnica informada para este projeto estratégico.'}
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Período</span>
                                <span className="text-[10px] text-white font-bold">
                                  {formatDate(project.startDate)} 
                                  {project.endDate && project.endDate !== project.startDate ? ` - ${formatDate(project.endDate)}` : ''}
                                  {project.startTime ? ` às ${project.startTime}` : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <div className="flex flex-col">
                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Cidade</span>
                                <span className="text-[10px] text-white font-bold">{project.city || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.settings?.enableMentoring && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <Zap className="w-3 h-3 text-purple-400" />
                                <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">MENTORIA</span>
                              </div>
                            )}
                            {project.settings?.enableB2B && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <Rocket className="w-3 h-3 text-blue-400" />
                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">B2B</span>
                              </div>
                            )}
                            {project.settings?.enableStartups && (
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                <Target className="w-3 h-3 text-orange-400" />
                                <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">STARTUPS</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 pt-4 mt-auto">
                            <Button
                              onClick={() => selectProject(project)}
                              className={`flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${selectedProject?.id === project.id ? 'bg-teal-500 text-white shadow-glow-teal border-none' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
                            >
                              {selectedProject?.id === project.id ? 'SELECIONADO' : 'SELECIONAR'}
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-2xl border-white/5 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                onClick={() => openEditDialog(project)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-2xl border-white/5 bg-white/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                onClick={() => handleDelete(project.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
