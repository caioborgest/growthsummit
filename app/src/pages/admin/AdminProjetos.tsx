import { useState } from 'react';
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
import { Calendar, MapPin, Settings, CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Project, ProjectType, ProjectStatus } from '@/types';

const projectTypeLabels: Record<ProjectType, string> = {
  growth_summit: 'Growth Summit',
  growth_experience: 'Growth Experience',
  growth_conference: 'Growth Conference',
  growth_festival: 'Growth Festival',
};

const projectStatusLabels: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  active: { label: 'Ativo', color: 'bg-green-500', icon: CheckCircle },
  paused: { label: 'Pausado', color: 'bg-yellow-500', icon: AlertCircle },
  completed: { label: 'Concluído', color: 'bg-blue-500', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: AlertCircle },
};

const defaultSettings = {
  enableB2B: true,
  enableMentoring: true,
  enableStartups: true,
  enableCheckIn: true,
  ticketPrices: { standard: 197, pro: 347, vip: 1500 },
};

export default function AdminProjetos() {
  const { data: projects, create, update, remove, isLoading } = useProjects();
  const { selectedProject, setSelectedProject } = useProject();
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
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      await create({
        ...formData,
        slug: `${slug}-2026`,
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Evento *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Growth Experience - Edição..."
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProjectType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="growth_summit">Growth Summit</SelectItem>
                      <SelectItem value="growth_experience">Growth Experience</SelectItem>
                      <SelectItem value="growth_conference">Growth Conference</SelectItem>
                      <SelectItem value="growth_festival">Growth Festival</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição completa do evento"
                  className="bg-[#0F172A] border-[#334155]"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Curta</Label>
                <Input
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Ex: Edição Triunfo"
                  className="bg-[#0F172A] border-[#334155]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Local *</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Nome do local"
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="UF"
                    maxLength={2}
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início *</Label>
                  <Input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Fim *</Label>
                  <Input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primaryColor || '#21808D'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 p-1 bg-[#0F172A] border-[#334155]"
                    />
                    <Input
                      value={formData.primaryColor || '#21808D'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1 bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondaryColor || '#FE4C38'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-12 p-1 bg-[#0F172A] border-[#334155]"
                    />
                    <Input
                      value={formData.secondaryColor || '#FE4C38'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1 bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-[#334155] pt-4">
                <h4 className="text-sm font-medium text-[#94A3B8] mb-3">Configurações de Preços</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Standard (R$)</Label>
                    <Input
                      type="number"
                      value={formData.settings?.ticketPrices?.standard || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          ticketPrices: {
                            ...defaultSettings.ticketPrices,
                            ...formData.settings?.ticketPrices,
                            standard: parseFloat(e.target.value) || 0
                          }
                        }
                      })}
                      className="bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pro (R$)</Label>
                    <Input
                      type="number"
                      value={formData.settings?.ticketPrices?.pro || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          ticketPrices: {
                            ...defaultSettings.ticketPrices,
                            ...formData.settings?.ticketPrices,
                            pro: parseFloat(e.target.value) || 0
                          }
                        }
                      })}
                      className="bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VIP (R$)</Label>
                    <Input
                      type="number"
                      value={formData.settings?.ticketPrices?.vip || 0}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          ticketPrices: {
                            ...defaultSettings.ticketPrices,
                            ...formData.settings?.ticketPrices,
                            vip: parseFloat(e.target.value) || 0
                          }
                        }
                      })}
                      className="bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#334155] pt-4">
                <h4 className="text-sm font-medium text-[#94A3B8] mb-3">Limites e Vagas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Inscrições</Label>
                    <Input
                      type="number"
                      value={formData.settings?.maxRegistrations || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          maxRegistrations: parseInt(e.target.value) || undefined
                        }
                      })}
                      className="bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Mentores</Label>
                    <Input
                      type="number"
                      value={formData.settings?.maxMentors || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...defaultSettings,
                          ...formData.settings,
                          maxMentors: parseInt(e.target.value) || undefined
                        }
                      })}
                      className="bg-[#0F172A] border-[#334155]"
                    />
                  </div>
                </div>
              </div>

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
                  <CheckCircle className="w-6 h-6 text-white" />
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
                          <Settings className="w-4 h-4" />
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
