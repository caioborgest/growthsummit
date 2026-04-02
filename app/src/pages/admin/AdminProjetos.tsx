import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Calendar, MapPin, Settings as SettingsIcon, CheckCircle2, Clock, AlertCircle, Plus, Edit, Trash2, Eye, Diamond, Award, ShieldCheck, Ticket, Layers, Users, CircleDollarSign, Info } from 'lucide-react';
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
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const draftProjects = projects.filter(p => p.status === 'draft');
  const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'cancelled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projetos</h1>
          <p className="text-[#94A3B8] mt-1">Gerencie todos os eventos e edições</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="bg-[#0F172A] border-[#334155] mb-4 flex flex-wrap h-auto p-1">
                  <TabsTrigger value="geral">Geral</TabsTrigger>
                  <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                  <TabsTrigger value="modulos">Módulos</TabsTrigger>
                  <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                  <TabsTrigger value="integracao">Integração</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                          <Info className="w-3 h-3 text-brand-orange-coral" />
                          Nome Identificador do Evento
                        </Label>
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Growth Experience 2026"
                          className="bg-black/40 border-white/10 rounded-2xl h-12 text-white font-bold focus:border-brand-orange-coral/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                          <Layers className="w-3 h-3 text-brand-orange-coral" />
                          Segmento do Projeto
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value: ProjectType) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="bg-black/40 border-white/10 rounded-2xl h-12 text-white font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F172A] border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <SelectItem value="growth_experience" className="text-white font-bold uppercase text-[10px] tracking-widest hover:bg-brand-orange-coral/10">Growth Experience</SelectItem>
                            <SelectItem value="growth_conference" className="text-white font-bold uppercase text-[10px] tracking-widest hover:bg-brand-orange-coral/10">Growth Conference</SelectItem>
                            <SelectItem value="growth_festival" className="text-white font-bold uppercase text-[10px] tracking-widest hover:bg-brand-orange-coral/10">Growth Festival</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">
                        <Edit className="w-3 h-3 text-brand-orange-coral" />
                        Descrição Técnica (Meta-data)
                      </Label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Breve descrição interna do projeto..."
                        className="w-full bg-black/40 border-white/10 rounded-2xl p-4 text-white font-medium h-[116px] focus:border-brand-orange-coral/50 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                        <MapPin className="h-4 w-4 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Localização Estratégica</h4>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome do Local</Label>
                        <Input
                          value={formData.location || ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Ex: Polo Automotivo"
                          className="bg-black/40 border-white/10 rounded-2xl h-10 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cidade</Label>
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Cidade"
                          className="bg-black/40 border-white/10 rounded-2xl h-10 text-white font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">UF</Label>
                        <Input
                          value={formData.state || ''}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="PE"
                          maxLength={2}
                          className="bg-black/40 border-white/10 rounded-2xl h-10 text-white font-bold uppercase text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Cronograma do Evento</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Data de Início</Label>
                        <input
                          type="date"
                          value={formData.startDate || ''}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full bg-transparent border-none text-white font-black text-sm outline-none [color-scheme:dark]"
                        />
                      </div>
                      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Data de Encerramento</Label>
                        <input
                          type="date"
                          value={formData.endDate || ''}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full bg-transparent border-none text-white font-black text-sm outline-none [color-scheme:dark]"
                        />
                      </div>
                      <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Identidade Master (HEX)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={formData.primaryColor || '#21808D'}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="w-10 h-10 p-1 bg-black/60 border-white/10 rounded-lg cursor-pointer"
                          />
                          <Input
                            value={formData.primaryColor || '#21808D'}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            placeholder="#HEX"
                            className="flex-1 bg-transparent border-none text-white font-black text-sm uppercase"
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Visibilidade do Projeto</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="bg-transparent border-none text-white font-black p-0 h-10 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F172A] border-white/10 rounded-2xl">
                            <SelectItem value="draft" className="text-white font-bold uppercase text-[9px] tracking-widest">Rascunho</SelectItem>
                            <SelectItem value="active" className="text-white font-bold uppercase text-[9px] tracking-widest">Ativo (Publicado)</SelectItem>
                            <SelectItem value="paused" className="text-white font-bold uppercase text-[9px] tracking-widest">Pausado</SelectItem>
                            <SelectItem value="completed" className="text-white font-bold uppercase text-[9px] tracking-widest">Concluído</SelectItem>
                            <SelectItem value="cancelled" className="text-white font-bold uppercase text-[9px] tracking-widest">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                              <TabsContent value="financeiro" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-8 pt-6 border-t border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/10">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 rounded-xl bg-brand-orange-coral/10">
                                        <Layers className="h-6 w-6 text-brand-orange-coral animate-pulse" />
                                    </div>
                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Gestão de Lotes & Categorias</h4>
                                </div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-11">Configuração de Precificação Dinâmica</p>
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
                                className="btn-premium flex items-center justify-center gap-2 group"
                            >
                                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                <span className="uppercase text-[10px] tracking-widest font-black">Adicionar Categoria</span>
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

                                        <div className="grid grid-cols-1 gap-4">
                                            {tier.batches.map((batch, bIdx) => (
                                                <div key={batch.id} className="relative group/batch">
                                                    <div className={`flex flex-col lg:flex-row lg:items-center gap-6 p-6 rounded-[1.5rem] transition-all duration-300 border ${batch.active ? 'bg-white/[0.04] border-brand-orange-coral/20 shadow-lg shadow-brand-orange-coral/5' : 'bg-white/[0.02] border-white/5 opacity-80'}`}>
                                                        {/* Batch Info */}
                                                        <div className="flex-1 flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-xs ${batch.active ? 'bg-brand-orange-coral text-white shadow-glow-orange/20' : 'bg-white/10 text-gray-500'}`}>
                                                                #{bIdx + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-[9px] font-black text-gray-600 uppercase tracking-widest pl-1">Identificador</Label>
                                                                <Input
                                                                    value={batch.name}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                        newTiers[tIdx].batches[bIdx].name = e.target.value;
                                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                    }}
                                                                    className="bg-transparent border-none text-white font-bold h-8 w-full text-base focus:ring-0 p-0"
                                                                    placeholder="Ex: 1º Lote"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Batch Settings Grid */}
                                                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                                                            {/* Quantity */}
                                                            <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 flex-1 md:flex-none md:min-w-[100px]">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <Users className="h-3 w-3 text-gray-500" />
                                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Qtd Máxima</span>
                                                                </div>
                                                                <Input
                                                                    type="number"
                                                                    value={batch.maxCapacity || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                        newTiers[tIdx].batches[bIdx].maxCapacity = parseInt(e.target.value) || undefined;
                                                                        setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                    }}
                                                                    className="bg-transparent border-none text-white font-black h-6 w-full text-sm p-0 focus:ring-0"
                                                                    placeholder="∞"
                                                                />
                                                            </div>

                                                            {/* Dates */}
                                                            <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-1 flex-1 md:flex-none">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <Calendar className="h-3 w-3 text-gray-500" />
                                                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Período de Venda</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[7px] font-black text-emerald-500/50 uppercase leading-none mb-1">Início</span>
                                                                        <input
                                                                            type="date"
                                                                            value={batch.startDate || ''}
                                                                            onChange={(e) => {
                                                                                const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                                newTiers[tIdx].batches[bIdx].startDate = e.target.value;
                                                                                setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                            }}
                                                                            className="bg-transparent border-none text-white font-bold h-6 text-xs p-0 focus:ring-0 outline-none w-24 [color-scheme:dark]"
                                                                        />
                                                                    </div>
                                                                    <div className="w-[1px] h-6 bg-white/10" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[7px] font-black text-red-500/50 uppercase leading-none mb-1">Término</span>
                                                                        <input
                                                                            type="date"
                                                                            value={batch.endDate || ''}
                                                                            onChange={(e) => {
                                                                                const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                                newTiers[tIdx].batches[bIdx].endDate = e.target.value;
                                                                                setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                            }}
                                                                            className="bg-transparent border-none text-white font-bold h-6 text-xs p-0 focus:ring-0 outline-none w-24 [color-scheme:dark]"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Price */}
                                                            <div className={`p-3 rounded-2xl border transition-all flex flex-col justify-center min-w-[140px] ${batch.active ? 'bg-brand-orange-coral/10 border-brand-orange-coral/30' : 'bg-black/60 border-white/5'}`}>
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <CircleDollarSign className={`h-4 w-4 ${batch.active ? 'text-brand-orange-coral' : 'text-gray-600'}`} />
                                                                    <span className={`text-[8px] font-black tracking-widest uppercase ${batch.active ? 'text-brand-orange-coral' : 'text-gray-600'}`}>Investimento</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-black text-white/40">R$</span>
                                                                    <Input
                                                                        type="number"
                                                                        value={batch.price}
                                                                        onChange={(e) => {
                                                                            const newTiers = [...(formData.settings?.ticketTiers || [])];
                                                                            newTiers[tIdx].batches[bIdx].price = parseFloat(e.target.value) || 0;
                                                                            setFormData({ ...formData, settings: { ...formData.settings!, ticketTiers: newTiers } });
                                                                        }}
                                                                        className="bg-transparent border-none text-white font-black h-8 w-full text-xl focus:ring-0 p-0 text-left tabular-nums"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Actions (Vertical in mobile, side-by-side in desktop) */}
                                                            <div className="flex items-center justify-between md:justify-end gap-6 ml-0 md:ml-4 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                                                                <div className="flex flex-col items-center gap-1">
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
                                                                        className="data-[state=checked]:bg-brand-orange-coral"
                                                                    />
                                                                    <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">{batch.active ? 'PÚBLICO' : 'OFFLINE'}</span>
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
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
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
                        <div className="flex items-center gap-3 pt-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                <Diamond className="h-5 w-5 text-teal-400" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none">Metas & Planejamento</h4>
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Estimativas Técnicas do Projeto</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                            {[
                                { 
                                    label: 'Meta de Público', 
                                    value: formData.settings?.goalRegistrations, 
                                    key: 'goalRegistrations', 
                                    icon: Users, 
                                    suffix: 'pax' 
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
                                    suffix: 'lugares' 
                                },
                            ].map((field) => (
                                <div key={field.key} className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-teal-500/30 transition-all duration-300">
                                    <div className="flex items-center gap-2 opacity-50">
                                        <field.icon className="h-3 w-3 text-teal-400" />
                                        <Label className="text-[9px] font-black uppercase tracking-widest">{field.label}</Label>
                                    </div>
                                    <div className="relative flex items-center">
                                        {field.prefix && <span className="absolute left-0 text-xs font-black text-teal-500/50">{field.prefix}</span>}
                                        <Input
                                            type="number"
                                            value={field.value || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                settings: { ...formData.settings!, [field.key]: parseInt(e.target.value) || 0 }
                                            })}
                                            className={`bg-transparent border-none text-white font-black h-8 w-full text-lg focus:ring-0 p-0 ${field.prefix ? 'pl-7' : ''}`}
                                            placeholder="0"
                                        />
                                        {field.suffix && <span className="text-[8px] font-black text-gray-700 uppercase ml-1 shrink-0">{field.suffix}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="modulos" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                        <ShieldCheck className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Widget de Inscrição Oficial</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Incorpore em WordPress, Webflow ou Landing Pages</p>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                      <div className="relative bg-black/60 rounded-2xl border border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                          </div>
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">iframe-snippet.html</span>
                        </div>
                        <pre className="p-6 text-[10px] sm:text-xs font-mono text-teal-400/80 overflow-x-auto leading-relaxed">
                          {`<iframe\n  src="${window.location.origin}/evento/${formData.slug || 'SEU-EVENTO'}?embed=true"\n  width="100%"\n  height="800px"\n  frameborder="0"\n></iframe>`}
                        </pre>
                        <Button 
                          size="sm" 
                          className="absolute bottom-4 right-4 bg-teal-500/20 hover:bg-teal-500 hover:text-white text-teal-400 border border-teal-500/30 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                          onClick={() => {
                            const code = `<iframe src="${window.location.origin}/evento/${formData.slug || 'SEU-EVENTO'}?embed=true" width="100%" height="800px" frameborder="0"></iframe>`;
                            navigator.clipboard.writeText(code);
                            toast.success('Snippet copiado com sucesso!');
                          }}
                        >
                          <Plus className="w-3 h-3 mr-2 rotate-45" /> Copiar Código
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 flex gap-3 items-start">
                      <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide leading-relaxed">
                        IMPORTANTE: Garanta que o domínio onde o iframe será inserido esteja configurado corretamente para evitar bloqueios de CORS (Cross-Origin Resource Sharing).
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[#334155] text-[#94A3B8]">
                  Cancelar
                </Button>
                <Button
                  onClick={editingProject ? handleUpdate : handleCreate}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]"
                >
                  {isLoading ? 'Salvando...' : editingProject ? 'Atualizar' : 'Criar Projeto'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selectedProject && (
        <Card className="bg-gradient-to-r from-[#21808D]/20 to-[#2A9D8F]/20 border-[#21808D]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#21808D] to-[#2A9D8F] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Projeto Selecionado</h3>
                  <p className="text-[#94A3B8]">{selectedProject.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={projectStatusLabels[selectedProject.status].color}>
                  {projectStatusLabels[selectedProject.status].label}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setSelectedProject(null)} className="border-[#334155]">
                  Trocar Projeto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-[#1E293B] border border-[#334155]">
          <TabsTrigger value="active" className="data-[state=active]:bg-[#21808D]">
            Ativos ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="data-[state=active]:bg-[#21808D]">
            Rascunhos ({draftProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-[#21808D]">
            Concluídos ({completedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-[#21808D]">
            Todos ({projects.length})
          </TabsTrigger>
        </TabsList>

        {['active', 'draft', 'completed', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(tab === 'all' ? projects : tab === 'active' ? activeProjects : tab === 'draft' ? draftProjects : completedProjects).map((project) => {
                const StatusIcon = projectStatusLabels[project.status].icon;
                return (
                  <Card key={project.id} className={`bg-[#1E293B] border-[#334155] hover:border-[#21808D] transition-all ${selectedProject?.id === project.id ? 'ring-2 ring-[#21808D]' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2 border-[#21808D] text-[#21808D]">
                            {projectTypeLabels[project.type]}
                          </Badge>
                          <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                        </div>
                        <StatusIcon className={`w-5 h-5 ${projectStatusLabels[project.status].color.replace('bg-', 'text-')}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[#94A3B8] line-clamp-2">{project.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#94A3B8]">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94A3B8]">
                          <MapPin className="w-4 h-4" />
                          <span>{project.city}, {project.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94A3B8]">
                          <SettingsIcon className="w-4 h-4" />
                          <span>
                            {[
                              project.settings?.enableMentoring && 'Mentorias',
                              project.settings?.enableB2B && 'B2B',
                              project.settings?.enableStartups && 'Startups',
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 ${selectedProject?.id === project.id ? 'bg-[#21808D] text-white border-[#21808D]' : 'border-[#334155] text-[#94A3B8]'}`}
                          onClick={() => selectProject(project)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {selectedProject?.id === project.id ? 'Selecionado' : 'Selecionar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#334155] text-[#94A3B8]"
                          onClick={() => openEditDialog(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#334155] text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
