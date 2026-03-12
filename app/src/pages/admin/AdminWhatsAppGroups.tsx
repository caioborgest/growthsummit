import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Plus,
  Search,
  Users,
  Link as LinkIcon,
  Copy,
  Edit,
  Trash2,
  QrCode,
  Download,
  Upload,
  CheckCircle,
  Clock,
  MoreVertical,
  Filter,
  RefreshCw,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import {
  useWhatsAppGroups,
  useWhatsAppStats
} from '@/hooks/useWhatsAppGroups';
import type {
  WhatsAppGroup as GroupType,
  CreateGroupData
} from '@/hooks/useWhatsAppGroups';
import { supabase } from '@/lib/supabase';
import { GroupMembersDialog } from '@/components/admin/GroupMembersDialog';

const groupTypeLabels: Record<string, { label: string; color: string; description: string }> = {
  participants_geral: {
    label: 'Participantes Geral',
    color: 'bg-blue-500',
    description: 'Todos os inscritos no evento'
  },
  participants_vip: {
    label: 'Participantes VIP',
    color: 'bg-purple-500',
    description: 'Passes VIP e Pro'
  },
  speakers_palestrantes: {
    label: 'Palestrantes',
    color: 'bg-orange-500',
    description: 'Palestrantes confirmados'
  },
  startups_arena: {
    label: 'Startups Arena',
    color: 'bg-green-500',
    description: 'Startups participantes'
  },
  mentores: {
    label: 'Mentores',
    color: 'bg-teal-500',
    description: 'Mentores cadastrados'
  },
  organizacao: {
    label: 'Organização',
    color: 'bg-red-500',
    description: 'Equipe organizadora'
  },
  patrocinadores: {
    label: 'Patrocinadores',
    color: 'bg-yellow-500',
    description: 'Empresas patrocinadoras'
  },
  networking_b2b: {
    label: 'Networking B2B',
    color: 'bg-indigo-500',
    description: 'Participantes B2B'
  },
  ajuda_suporte: {
    label: 'Ajuda e Suporte',
    color: 'bg-pink-500',
    description: 'Suporte aos participantes'
  },
  custom: {
    label: 'Personalizado',
    color: 'bg-gray-500',
    description: 'Grupo personalizado'
  },
};

export function AdminWhatsAppGroups() {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;

  // Hooks para dados reais
  const {
    groups,
    loading: groupsLoading,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: refetchGroups
  } = useWhatsAppGroups(projectId);

  const { stats, loading: statsLoading, refetch: refetchStats } = useWhatsAppStats(projectId);

  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupType | null>(null);
  const [selectedGroupForQR, setSelectedGroupForQR] = useState<GroupType | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Form states
  const [newGroup, setNewGroup] = useState<CreateGroupData>({
    project_id: projectId || '',
    group_name: '',
    group_description: '',
    group_type: 'participants_geral',
    max_participants: 1024,
    welcome_message_template: '',
    auto_invite_on_registration: false,
    auto_invite_on_checkin: false,
  });

  // Update project_id when selectedProject changes
  useEffect(() => {
    if (projectId) {
      setNewGroup(prev => ({ ...prev, project_id: projectId }));
    }
  }, [projectId]);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.group_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.group_type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && group.is_active) ||
      (filterStatus === 'inactive' && !group.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenEdit = (group: GroupType) => {
    setEditingGroup(group);
    setNewGroup({
      project_id: group.project_id,
      group_name: group.group_name,
      group_description: group.group_description || '',
      group_type: group.group_type,
      max_participants: group.max_participants,
      welcome_message_template: group.welcome_message_template || '',
      auto_invite_on_registration: group.auto_invite_on_registration,
      auto_invite_on_checkin: group.auto_invite_on_checkin,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenQR = (group: GroupType) => {
    setSelectedGroupForQR(group);
    setIsQRDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    const success = await updateGroup(editingGroup.id, newGroup);
    if (success) {
      setIsEditDialogOpen(false);
      setEditingGroup(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.group_name || !projectId) {
      toast.error('Nome do grupo e projeto são obrigatórios');
      return;
    }

    const result = await createGroup({
      ...newGroup,
      project_id: projectId,
    });

    if (result) {
      setIsCreateDialogOpen(false);
      setNewGroup({
        project_id: projectId,
        group_name: '',
        group_description: '',
        group_type: 'participants_geral',
        max_participants: 1024,
        welcome_message_template: '',
        auto_invite_on_registration: false,
        auto_invite_on_checkin: false,
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    await deleteGroup(groupId);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const handleSendBulkInvites = async (group: GroupType) => {
    if (!confirm(`Enviar convites em massa para ${group.current_participants} membros pendentes?`)) return;

    setIsSendingBulk(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bulk-invite', {
        body: {
          group_id: group.id,
          filter_status: ['pending', 'invited'],
          method: 'link',
          batch_size: 10,
          delay_ms: 1000,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${data.result.sent} convites enviados com sucesso!`);
        refetchGroups();
      } else {
        toast.error(data.error || 'Erro ao enviar convites');
      }
    } catch (err: any) {
      toast.error('Erro ao enviar convites em massa: ' + err.message);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const openMembersDialog = (group: GroupType) => {
    setSelectedGroup(group);
    setIsMembersDialogOpen(true);
  };

  // Loading state
  if (groupsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A9D8F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Grupos WhatsApp</h1>
          <p className="text-[#94A3B8] mt-1">
            Gerencie grupos de WhatsApp para {selectedProject?.name || 'todos os eventos'}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Total de Grupos</p>
                <p className="text-2xl font-bold text-white">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#21808D]/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-[#2A9D8F]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Grupos Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.activeGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Total de Membros</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Convites Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pendingInvites}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1E293B] border-[#334155] text-white"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px] bg-[#1E293B] border-[#334155] text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo de grupo" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#334155]">
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(groupTypeLabels).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-[#1E293B] border-[#334155] text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#334155]">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => { refetchGroups(); refetchStats(); }}
          className="border-[#334155] text-white hover:bg-[#334155]"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGroups.length === 0 ? (
          <Card className="bg-[#1E293B] border-[#334155] p-8 text-center">
            <MessageCircle className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Nenhum grupo encontrado</p>
            <p className="text-sm text-[#94A3B8] mb-4">
              Crie seu primeiro grupo de WhatsApp para começar
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
          </Card>
        ) : (
          filteredGroups.map((group) => {
            const typeInfo = groupTypeLabels[group.group_type] || groupTypeLabels.custom;
            const progress = (group.current_participants / group.max_participants) * 100;

            return (
              <Card key={group.id} className="bg-[#1E293B] border-[#334155] hover:border-[#2A9D8F]/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{group.group_name}</h3>
                        <Badge className={`${typeInfo.color} text-white`}>
                          {typeInfo.label}
                        </Badge>
                        {group.is_active ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            Inativo
                          </Badge>
                        )}
                        {group.is_full && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            Cheio
                          </Badge>
                        )}
                      </div>

                      <p className="text-[#94A3B8] text-sm mb-4">{group.group_description}</p>

                      <div className="flex items-center gap-6 text-sm text-[#94A3B8] mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{group.current_participants} / {group.max_participants} membros</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Criado em {new Date(group.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {group.invite_link && (
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" />
                            <span className="text-[#2A9D8F]">Link disponível</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#334155] rounded-full h-2 mb-4">
                        <div
                          className={`h-2 rounded-full transition-all ${progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-yellow-500' : 'bg-[#2A9D8F]'
                            }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      {/* Auto-invite badges */}
                      <div className="flex gap-2">
                        {group.auto_invite_on_registration && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            Auto-convite na inscrição
                          </Badge>
                        )}
                        {group.auto_invite_on_checkin && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            Auto-convite no check-in
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMembersDialog(group)}
                        className="border-[#334155] text-white hover:bg-[#334155]"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Membros
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendBulkInvites(group)}
                        disabled={isSendingBulk || group.current_participants === 0}
                        className="border-[#334155] text-white hover:bg-[#334155]"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isSendingBulk ? 'Enviando...' : 'Convites em Massa'}
                      </Button>

                      {group.invite_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(group.invite_link!)}
                          className="border-[#334155] text-white hover:bg-[#334155]"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Link
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#334155] text-white hover:bg-[#334155]"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1E293B] border-[#334155]">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(group)}
                            className="text-white hover:bg-[#334155] cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openMembersDialog(group)}
                            className="text-white hover:bg-[#334155] cursor-pointer"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Gerenciar Membros
                          </DropdownMenuItem>
                          {group.qr_code_url && (
                            <DropdownMenuItem
                              onClick={() => handleOpenQR(group)}
                              className="text-white hover:bg-[#334155] cursor-pointer"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Ver QR Code
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Criar Novo Grupo WhatsApp</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Nome do Grupo *</label>
              <Input
                value={newGroup.group_name}
                onChange={(e) => setNewGroup({ ...newGroup, group_name: e.target.value })}
                placeholder="Ex: Growth Summit 2026 - Participantes VIP"
                className="bg-[#0F172A] border-[#334155] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Descrição</label>
              <textarea
                value={newGroup.group_description}
                onChange={(e) => setNewGroup({ ...newGroup, group_description: e.target.value })}
                placeholder="Descrição do grupo..."
                className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-white text-sm min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#94A3B8]">Tipo de Grupo *</label>
                <Select
                  value={newGroup.group_type}
                  onValueChange={(value) => setNewGroup({ ...newGroup, group_type: value })}
                >
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    {Object.entries(groupTypeLabels).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div>{label}</div>
                          <div className="text-xs text-gray-400">{description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#94A3B8]">Limite de Participantes</label>
                <Input
                  type="number"
                  value={newGroup.max_participants}
                  onChange={(e) => setNewGroup({ ...newGroup, max_participants: parseInt(e.target.value) })}
                  min={1}
                  max={1024}
                  className="bg-[#0F172A] border-[#334155] text-white"
                />
                <p className="text-xs text-[#94A3B8]">Máximo: 1024 (limite do WhatsApp)</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Mensagem de Boas-vindas</label>
              <textarea
                value={newGroup.welcome_message_template}
                onChange={(e) => setNewGroup({ ...newGroup, welcome_message_template: e.target.value })}
                placeholder="Olá {{nome}}! Bem-vindo ao grupo..."
                className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-white text-sm min-h-[100px]"
              />
              <p className="text-xs text-[#94A3B8]">
                Variáveis disponíveis: {`{nome}`}, {`{evento}`}, {`{data}`}, {`{link_grupo}`}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-[#94A3B8]">Automações</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auto_invite_registration"
                  checked={newGroup.auto_invite_on_registration}
                  onChange={(e) => setNewGroup({ ...newGroup, auto_invite_on_registration: e.target.checked })}
                  className="w-4 h-4 rounded border-[#334155] bg-[#0F172A]"
                />
                <label htmlFor="auto_invite_registration" className="text-sm text-white">
                  Enviar convite automaticamente quando inscrição for confirmada
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auto_invite_checkin"
                  checked={newGroup.auto_invite_on_checkin}
                  onChange={(e) => setNewGroup({ ...newGroup, auto_invite_on_checkin: e.target.checked })}
                  className="w-4 h-4 rounded border-[#334155] bg-[#0F172A]"
                />
                <label htmlFor="auto_invite_checkin" className="text-sm text-white">
                  Enviar convite automaticamente no check-in do evento
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-[#334155] text-white hover:bg-[#334155]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!newGroup.group_name}
              className="bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Editar Grupo WhatsApp</DialogTitle>
            <DialogDescription className="text-gray-400">
              Altere as configurações do grupo "{editingGroup?.group_name}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Nome do Grupo *</label>
              <Input
                value={newGroup.group_name}
                onChange={(e) => setNewGroup({ ...newGroup, group_name: e.target.value })}
                placeholder="Ex: Growth Summit 2026 - Participantes VIP"
                className="bg-[#0F172A] border-[#334155] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Descrição</label>
              <textarea
                value={newGroup.group_description}
                onChange={(e) => setNewGroup({ ...newGroup, group_description: e.target.value })}
                placeholder="Descrição do grupo..."
                className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-white text-sm min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-[#94A3B8]">Tipo de Grupo *</label>
                <Select
                  value={newGroup.group_type}
                  onValueChange={(value) => setNewGroup({ ...newGroup, group_type: value as any })}
                >
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    {Object.entries(groupTypeLabels).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div>{label}</div>
                          <div className="text-xs text-gray-400">{description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#94A3B8]">Limite de Participantes</label>
                <Input
                  type="number"
                  value={newGroup.max_participants}
                  onChange={(e) => setNewGroup({ ...newGroup, max_participants: parseInt(e.target.value) })}
                  min={1}
                  max={1024}
                  className="bg-[#0F172A] border-[#334155] text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Mensagem de Boas-vindas</label>
              <textarea
                value={newGroup.welcome_message_template}
                onChange={(e) => setNewGroup({ ...newGroup, welcome_message_template: e.target.value })}
                placeholder="Olá {{nome}}! Bem-vindo ao grupo..."
                className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-white text-sm min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm text-[#94A3B8]">Automações</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit_auto_invite_registration"
                  checked={newGroup.auto_invite_on_registration}
                  onChange={(e) => setNewGroup({ ...newGroup, auto_invite_on_registration: e.target.checked })}
                  className="w-4 h-4 rounded border-[#334155] bg-[#0F172A]"
                />
                <label htmlFor="edit_auto_invite_registration" className="text-sm text-white">
                  Enviar convite automaticamente na inscrição
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-[#334155] text-white hover:bg-[#334155]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateGroup}
              disabled={groupsLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">QR Code do Grupo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-xl">
              <img 
                src={selectedGroupForQR?.qr_code_url} 
                alt="QR Code do Grupo" 
                className="w-64 h-64"
              />
            </div>
            <p className="text-center text-[#94A3B8] text-sm">
              Aponte a câmera do celular para entrar no grupo<br/>
              <strong>{selectedGroupForQR?.group_name}</strong>
            </p>
            <Button 
              className="w-full bg-[#334155] hover:bg-[#475569] text-white"
              onClick={() => {
                if (selectedGroupForQR?.qr_code_url) {
                  const link = document.createElement('a');
                  link.href = selectedGroupForQR.qr_code_url;
                  link.download = `QR_${selectedGroupForQR.group_name}.png`;
                  link.click();
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      {selectedGroup && (
        <GroupMembersDialog
          group={selectedGroup}
          isOpen={isMembersDialogOpen}
          onClose={() => setIsMembersDialogOpen(false)}
        />
      )}
    </div>
  );
}
