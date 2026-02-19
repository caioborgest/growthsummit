import { useState } from 'react';
import { Users, Search, Download, Upload, Send, Trash2, MoreVertical, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useWhatsAppGroupMembers } from '@/hooks/useWhatsAppGroups';
import type { AddMemberData, WhatsAppGroup as GroupType } from '@/hooks/useWhatsAppGroups';
import { toast } from 'sonner';

interface GroupMembersDialogProps {
  group: GroupType;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  invited: { label: 'Convidado', color: 'bg-blue-500', icon: Send },
  invite_sent: { label: 'Convite Enviado', color: 'bg-blue-500', icon: Send },
  joined: { label: 'Entrou', color: 'bg-green-500', icon: CheckCircle },
  left: { label: 'Saiu', color: 'bg-gray-500', icon: AlertCircle },
  removed: { label: 'Removido', color: 'bg-red-500', icon: AlertCircle },
  declined: { label: 'Recusou', color: 'bg-orange-500', icon: AlertCircle },
};

export function GroupMembersDialog({ group, isOpen, onClose }: GroupMembersDialogProps) {
  const {
    members,
    loading,
    addMember,
    updateMemberStatus,
    sendInvite,
    getMemberStats,
    refetch
  } = useWhatsAppGroupMembers(group.id);

  const [newMember, setNewMember] = useState<AddMemberData>({
    group_id: group.id,
    phone_number: '',
    name: '',
    email: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('members');

  const stats = getMemberStats();

  const handleAddMember = async () => {
    if (!newMember.phone_number) {
      toast.error('Telefone é obrigatório');
      return;
    }

    await addMember(newMember);
    setNewMember({ group_id: group.id, phone_number: '', name: '', email: '' });
  };

  const handleSendInvite = async (memberId: string) => {
    setIsSending(true);
    await sendInvite({
      group_id: group.id,
      member_id: memberId,
      method: 'link',
    });
    setIsSending(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    await updateMemberStatus(memberId, 'removed');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E293B] border-[#334155] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Membros: {group.group_name}
          </DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            {stats.total} membros • {stats.joined} ativos • {stats.pending} pendentes
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A9D8F]"></div>
              </div>
            ) : (
              <>
                {/* Search and export */}
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
                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
                      <p className="text-[#94A3B8]">Nenhum membro ainda</p>
                    </div>
                  ) : (
                    members.map((member) => {
                      const status = statusLabels[member.status] || statusLabels.pending;
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

                            <div className="flex gap-2">
                              {member.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSendInvite(member.id)}
                                  disabled={isSending}
                                  className="bg-[#21808D] hover:bg-[#1a6a73]"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
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
                <Users className="w-4 h-4 mr-2" />
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
                nome,telefone,email<br />
                João Silva,+5588999999999,joao@email.com<br />
                Maria Santos,+5588888888888,maria@email.com
              </code>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#334155] text-white hover:bg-[#334155]"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
