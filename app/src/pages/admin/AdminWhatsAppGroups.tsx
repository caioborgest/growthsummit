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
  AlertCircle,
  Clock,
  MoreVertical,
  ChevronDown,
  Filter,
  RefreshCw,
  Send,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects } from '@/hooks/useData';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

interface WhatsAppGroup {
  id: string;
  project_id: string;
  group_name: string;
  group_description?: string;
  group_type: string;
  invite_link?: string;
  qr_code_url?: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  is_full: boolean;
  created_at: string;
  welcome_message_template?: string;
  auto_invite_on_registration: boolean;
  auto_invite_on_checkin: boolean;
}

interface GroupMember {
  id: string;
  group_id: string;
  phone_number: string;
  name?: string;
  email?: string;
  status: 'pending' | 'invited' | 'invite_sent' | 'joined' | 'left' | 'removed' | 'declined';
  invited_at?: string;
  joined_at?: string;
}

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

const statusLabels: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  invited: { label: 'Convidado', color: 'bg-blue-500', icon: Send },
  invite_sent: { label: 'Convite Enviado', color: 'bg-blue-500', icon: Send },
  joined: { label: 'Entrou', color: 'bg-green-500', icon: CheckCircle },
  left: { label: 'Saiu', color: 'bg-gray-500', icon: AlertCircle },
  removed: { label: 'Removido', color: 'bg-red-500', icon: AlertCircle },
  declined: { label: 'Recusou', color: 'bg-orange-500', icon: AlertCircle },
};

export function AdminWhatsAppGroups() {
  const { data: projects } = useProjects();
  const { selectedProject } = useProject();
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<WhatsAppGroup | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [newGroup, setNewGroup] = useState({
    group_name: '',
    group_description: '',
    group_type: 'participants_geral',
    max_participants: 1024,
    welcome_message_template: '',
    auto_invite_on_registration: false,
    auto_invite_on_checkin: false,
  });

  const [newMember, setNewMember] = useState({
    name: '',
    phone_number: '',
    email: '',
  });

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, [selectedProject]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      // Simulated data for MVP - in production, this would fetch from Supabase
      const mockGroups: WhatsAppGroup[] = [
        {
          id: '1',
          project_id: selectedProject?.id || '',
          group_name: 'Growth Summit 2026 - Participantes',
          group_description: 'Grupo oficial para todos os participantes do evento',
          group_type: 'participants_geral',
          invite_link: 'https://chat.whatsapp.com/XXXXXXXXXX',
          max_participants: 1024,
          current_participants: 456,
          is_active: true,
          is_full: false,
          created_at: new Date().toISOString(),
          auto_invite_on_registration: true,
          auto_invite_on_checkin: false,
        },
        {
          id: '2',
          project_id: selectedProject?.id || '',
          group_name: 'Growth Summit 2026 - VIP',
          group_description: 'Grupo exclusivo para participantes VIP',
          group_type: 'participants_vip',
          invite_link: 'https://chat.whatsapp.com/YYYYYYYYYY',
          max_participants: 256,
          current_participants: 89,
          is_active: true,
          is_full: false,
          created_at: new Date().toISOString(),
          auto_invite_on_registration: true,
          auto_invite_on_checkin: true,
        },
      ];
      setGroups(mockGroups);
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async (groupId: string) => {
    setIsLoading(true);
    try {
      // Simulated data for MVP
      const mockMembers: GroupMember[] = [
        {
          id: '1',
          group_id: groupId,
          phone_number: '+5588999999999',
          name: 'João Silva',
          email: 'joao@example.com',
          status: 'joined',
          invited_at: new Date().toISOString(),
          joined_at: new Date().toISOString(),
        },
        {
          id: '2',
          group_id: groupId,
          phone_number: '+5588888888888',
          name: 'Maria Santos',
          email: 'maria@example.com',
          status: 'pending',
          invited_at: new Date().toISOString(),
        },
      ];
      setMembers(mockMembers);
    } catch (error) {
      toast.error('Erro ao carregar membros');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      // In production, this would call Supabase
      const group: WhatsAppGroup = {
        id: Date.now().toString(),
        project_id: selectedProject?.id || '',
        ...newGroup,
        current_participants: 0,
        is_active: true,
        is_full: false,
        created_at: new Date().toISOString(),
      };
      
      setGroups([...groups, group]);
      setIsCreateDialogOpen(false);
      setNewGroup({
        group_name: '',
        group_description: '',
        group_type: 'participants_geral',
        max_participants: 1024,
        welcome_message_template: '',
        auto_invite_on_registration: false,
        auto_invite_on_checkin: false,
      });
      toast.success('Grupo criado com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar grupo');
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup) return;
    
    try {
      const member: GroupMember = {
        id: Date.now().toString(),
        group_id: selectedGroup.id,
        ...newMember,
        status: 'pending',
        invited_at: new Date().toISOString(),
      };
      
      setMembers([...members, member]);
      setNewMember({ name: '', phone_number: '', email: '' });
      toast.success('Membro adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar membro');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    
    try {
      setGroups(groups.filter(g => g.id !== groupId));
      toast.success('Grupo excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir grupo');
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  const openMembersDialog = (group: WhatsAppGroup) => {
    setSelectedGroup(group);
    loadMembers(group.id);
    setIsMembersDialogOpen(true);
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.group_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.group_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && group.is_active) ||
                         (filterStatus === 'inactive' && !group.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const groupStats = {
    total: groups.length,
    active: groups.filter(g => g.is_active).length,
    totalMembers: groups.reduce((acc, g) => acc + g.current_participants, 0),
    fullGroups: groups.filter(g => g.is_full).length,
  };

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
                <p className="text-2xl font-bold text-white">{groupStats.total}</p>
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
                <p className="text-2xl font-bold text-white">{groupStats.active}</p>
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
                <p className="text-2xl font-bold text-white">{groupStats.totalMembers}</p>
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
                <p className="text-sm text-[#94A3B8]">Grupos Cheios</p>
                <p className="text-2xl font-bold text-white">{groupStats.fullGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
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
          onClick={loadGroups}
          className="border-[#334155] text-white hover:bg-[#334155]"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGroups.map((group) => {
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
                        className={`h-2 rounded-full transition-all ${
                          progress > 90 ? 'bg-red-500' : progress > 70 ? 'bg-yellow-500' : 'bg-[#2A9D8F]'
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
                          onClick={() => {/* TODO: Edit */}}
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
                            onClick={() => {/* TODO: View QR */}}
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
        })}
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
                Variáveis disponíveis: {'{'}'{'}nome{'}'}'{'}', {'{'}'{'}evento{'}'}'{'}', {'{'}'{'}data{'}'}'{'}', {'{'}'{'}link_grupo{'}'}'{'}'
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

      {/* Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Membros: {selectedGroup?.group_name}
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              {selectedGroup?.current_participants} / {selectedGroup?.max_participants} membros
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="bg-[#0F172A] border-[#334155]">
              <TabsTrigger value="members" className="data-[state=active]:bg-[#21808D]">
                Membros
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-[#21808D]">
                Adicionar
              </TabsTrigger>
              <TabsTrigger value="import" className="data-[state=active]:bg-[#21808D]">
                Importar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              {/* Search members */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                  <Input
                    placeholder="Buscar membros..."
                    className="pl-10 bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                <Button 
                  variant="outline"
                  className="border-[#334155] text-white hover:bg-[#334155]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Members list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {members.map((member) => {
                  const status = statusLabels[member.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-4 bg-[#0F172A] rounded-lg border border-[#334155]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name || 'Sem nome'}</p>
                          <p className="text-sm text-[#94A3B8]">{member.phone_number}</p>
                          {member.email && (
                            <p className="text-sm text-[#94A3B8]">{member.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={`${status.color} text-white flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-[#94A3B8]">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#1E293B] border-[#334155]">
                            <DropdownMenuItem className="text-white hover:bg-[#334155] cursor-pointer">
                              Reenviar convite
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-[#334155] cursor-pointer">
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-500/20 cursor-pointer">
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Nome</label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Nome do participante"
                    className="bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Telefone (WhatsApp) *</label>
                  <Input
                    value={newMember.phone_number}
                    onChange={(e) => setNewMember({ ...newMember, phone_number: e.target.value })}
                    placeholder="+5588999999999"
                    className="bg-[#0F172A] border-[#334155] text-white"
                  />
                  <p className="text-xs text-[#94A3B8]">Formato: +DDI DDD Número (ex: +5588999999999)</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Email</label>
                  <Input
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="bg-[#0F172A] border-[#334155] text-white"
                  />
                </div>

                <Button 
                  onClick={handleAddMember}
                  disabled={!newMember.phone_number}
                  className="w-full bg-gradient-to-r from-[#21808D] to-[#2A9D8F] hover:from-[#1a6a73] hover:to-[#21808D]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Membro
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div className="border-2 border-dashed border-[#334155] rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Importar arquivo CSV</p>
                <p className="text-sm text-[#94A3B8] mb-4">
                  Arraste e solte ou clique para selecionar um arquivo CSV com colunas: nome, telefone, email
                </p>
                <Button 
                  variant="outline"
                  className="border-[#334155] text-white hover:bg-[#334155]"
                >
                  Selecionar Arquivo
                </Button>
              </div>
              
              <div className="bg-[#0F172A] p-4 rounded-lg">
                <p className="text-sm text-white font-medium mb-2">Formato esperado:</p>
                <code className="text-xs text-[#94A3B8] block">
                  nome,telefone,email<br/>
                  João Silva,+5588999999999,joao@email.com<br/>
                  Maria Santos,+5588888888888,maria@email.com
                </code>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsMembersDialogOpen(false)}
              className="border-[#334155] text-white hover:bg-[#334155]"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
