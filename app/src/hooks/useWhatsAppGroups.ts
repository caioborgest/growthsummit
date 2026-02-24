import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface WhatsAppGroup {
  id: string;
  project_id: string;
  group_name: string;
  group_description?: string;
  group_type: 'participants_geral' | 'participants_vip' | 'speakers_palestrantes' |
  'startups_arena' | 'mentores' | 'organizacao' | 'patrocinadores' |
  'networking_b2b' | 'ajuda_suporte' | 'custom';
  invite_link?: string;
  qr_code_url?: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  is_full: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  metadata?: Record<string, any>;
  welcome_message_template?: string;
  auto_invite_on_registration: boolean;
  auto_invite_on_checkin: boolean;
}

export interface WhatsAppGroupMember {
  id: string;
  group_id: string;
  user_id?: string;
  phone_number: string;
  name?: string;
  email?: string;
  status: 'pending' | 'invited' | 'invite_sent' | 'joined' | 'left' | 'removed' | 'declined';
  invited_at?: string;
  joined_at?: string;
  left_at?: string;
  removed_at?: string;
  invited_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageTemplate {
  id: string;
  project_id?: string;
  template_name: string;
  template_type: 'welcome' | 'reminder' | 'update' | 'goodbye' | 'invite' | 'custom';
  content: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupData {
  project_id: string;
  group_name: string;
  group_description?: string;
  group_type: WhatsAppGroup['group_type'];
  max_participants?: number;
  welcome_message_template?: string;
  auto_invite_on_registration?: boolean;
  auto_invite_on_checkin?: boolean;
  metadata?: Record<string, any>;
}

export interface AddMemberData {
  group_id: string;
  phone_number: string;
  name?: string;
  email?: string;
  user_id?: string;
}

export interface SendInviteData {
  group_id: string;
  member_id: string;
  message?: string;
  method: 'link' | 'api' | 'qr';
}

// Hook para gerenciar grupos
export function useWhatsAppGroups(projectId?: string) {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('whatsapp_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setGroups(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar grupos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (groupData: CreateGroupData): Promise<WhatsAppGroup | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('whatsapp_groups')
        .insert({
          ...groupData,
          created_by: user.user?.id,
          is_active: true,
          current_participants: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setGroups(prev => [data, ...prev]);
      toast.success('Grupo criado com sucesso!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao criar grupo: ' + err.message);
      return null;
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<WhatsAppGroup>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('whatsapp_groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...updates } : g));
      toast.success('Grupo atualizado com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar grupo: ' + err.message);
      return false;
    }
  };

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('whatsapp_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prev => prev.filter(g => g.id !== groupId));
      toast.success('Grupo excluído com sucesso!');
      return true;
    } catch (err: any) {
      toast.error('Erro ao excluir grupo: ' + err.message);
      return false;
    }
  };

  const closeGroup = async (groupId: string): Promise<boolean> => {
    return updateGroup(groupId, {
      is_active: false,
      closed_at: new Date().toISOString()
    });
  };

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    closeGroup,
  };
}

// Hook para gerenciar membros de um grupo
export function useWhatsAppGroupMembers(groupId: string) {
  const [members, setMembers] = useState<WhatsAppGroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('whatsapp_group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      setMembers(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar membros: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (memberData: AddMemberData): Promise<WhatsAppGroupMember | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('whatsapp_group_members')
        .insert({
          ...memberData,
          status: 'pending',
          invited_by: user.user?.id,
          invited_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setMembers(prev => [data, ...prev]);
      toast.success('Membro adicionado com sucesso!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao adicionar membro: ' + err.message);
      return null;
    }
  };

  const addMembersBulk = async (membersData: Omit<AddMemberData, 'group_id'>[]): Promise<number> => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const membersToInsert = membersData.map(m => ({
        ...m,
        group_id: groupId,
        status: 'pending',
        invited_by: user.user?.id,
        invited_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('whatsapp_group_members')
        .insert(membersToInsert)
        .select();

      if (error) throw error;

      setMembers(prev => [...data, ...prev]);
      toast.success(`${data.length} membros adicionados com sucesso!`);
      return data.length;
    } catch (err: any) {
      toast.error('Erro ao adicionar membros em massa: ' + err.message);
      return 0;
    }
  };

  const updateMemberStatus = async (memberId: string, status: WhatsAppGroupMember['status']): Promise<boolean> => {
    try {
      const updates: any = { status };

      if (status === 'joined') {
        updates.joined_at = new Date().toISOString();
      } else if (status === 'left') {
        updates.left_at = new Date().toISOString();
      } else if (status === 'removed') {
        updates.removed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('whatsapp_group_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
      return true;
    } catch (err: any) {
      toast.error('Erro ao atualizar status: ' + err.message);
      return false;
    }
  };

  const removeMember = async (memberId: string): Promise<boolean> => {
    return updateMemberStatus(memberId, 'removed');
  };

  const sendInvite = async (sendData: SendInviteData): Promise<boolean> => {
    try {
      // Chamar Edge Function para enviar convite
      const { data, error } = await supabase.functions.invoke('whatsapp-send-invite', {
        body: sendData,
      });

      if (error) throw error;

      if (data.success) {
        await updateMemberStatus(sendData.member_id, 'invite_sent');
        toast.success('Convite enviado com sucesso!');
        return true;
      } else {
        throw new Error(data.message || 'Erro ao enviar convite');
      }
    } catch (err: any) {
      toast.error('Erro ao enviar convite: ' + err.message);
      return false;
    }
  };

  const getMemberStats = () => {
    return {
      total: members.length,
      pending: members.filter(m => m.status === 'pending').length,
      invited: members.filter(m => m.status === 'invited' || m.status === 'invite_sent').length,
      joined: members.filter(m => m.status === 'joined').length,
      left: members.filter(m => m.status === 'left').length,
      removed: members.filter(m => m.status === 'removed').length,
      declined: members.filter(m => m.status === 'declined').length,
    };
  };

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    addMember,
    addMembersBulk,
    updateMemberStatus,
    removeMember,
    sendInvite,
    getMemberStats,
  };
}

// Hook para templates de mensagem
export function useWhatsAppTemplates(projectId?: string) {
  const [templates, setTemplates] = useState<WhatsAppMessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('whatsapp_message_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.or(`project_id.eq.${projectId},is_default.eq.true`);
      } else {
        query = query.eq('is_default', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTemplates(data || []);
    } catch (err: any) {
      toast.error('Erro ao carregar templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (templateData: Omit<WhatsAppMessageTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<WhatsAppMessageTemplate | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('whatsapp_message_templates')
        .insert({
          ...templateData,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast.success('Template criado com sucesso!');
      return data;
    } catch (err: any) {
      toast.error('Erro ao criar template: ' + err.message);
      return null;
    }
  };

  const renderTemplate = (template: WhatsAppMessageTemplate, variables: Record<string, string>): string => {
    let rendered = template.content;

    template.variables.forEach(varName => {
      const value = variables[varName] || '';
      rendered = rendered.replace(new RegExp(`{{${varName}}}`, 'g'), value);
    });

    return rendered;
  };

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    createTemplate,
    renderTemplate,
  };
}

// Hook para estatísticas gerais
export function useWhatsAppStats(projectId?: string) {
  const [stats, setStats] = useState({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    pendingInvites: 0,
    acceptedInvites: 0,
    fullGroups: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      // Buscar estatísticas de grupos
      let groupsQuery = supabase
        .from('whatsapp_groups')
        .select('id, is_active, is_full, current_participants');

      if (projectId) {
        groupsQuery = groupsQuery.eq('project_id', projectId);
      }

      const { data: groups, error: groupsError } = await groupsQuery;

      if (groupsError) throw groupsError;

      const groupIds = groups?.map(g => g.id) || [];

      // Buscar estatísticas de membros
      let membersQuery = supabase
        .from('whatsapp_group_members')
        .select('status');

      if (groupIds.length > 0) {
        membersQuery = membersQuery.in('group_id', groupIds);
      }

      const { data: members, error: membersError } = await membersQuery;

      if (membersError) throw membersError;

      setStats({
        totalGroups: groups?.length || 0,
        activeGroups: groups?.filter(g => g.is_active).length || 0,
        totalMembers: groups?.reduce((acc, g) => acc + g.current_participants, 0) || 0,
        fullGroups: groups?.filter(g => g.is_full).length || 0,
        pendingInvites: members?.filter(m => m.status === 'pending').length || 0,
        acceptedInvites: members?.filter(m => m.status === 'joined').length || 0,
      });
    } catch (err: any) {
      toast.error('Erro ao carregar estatísticas: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

// Função para auto-convite baseado em inscrição
export async function autoInviteOnRegistration(
  registrationId: string,
  projectId: string,
  userType: 'standard' | 'vip' | 'speaker' | 'startup' | 'mentor'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-auto-invite', {
      body: {
        registration_id: registrationId,
        project_id: projectId,
        user_type: userType,
        trigger: 'registration',
      },
    });

    if (error) throw error;

    return data.success || false;
  } catch (err: any) {
    logger.error('Erro no auto-convite:', err);
    return false;
  }
}

// Função para auto-convite baseado em check-in
export async function autoInviteOnCheckIn(
  userId: string,
  projectId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-auto-invite', {
      body: {
        user_id: userId,
        project_id: projectId,
        trigger: 'checkin',
      },
    });

    if (error) throw error;

    return data.success || false;
  } catch (err: any) {
    logger.error('Erro no auto-convite:', err);
    return false;
  }
}
