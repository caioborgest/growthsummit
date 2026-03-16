// Edge Function: whatsapp-auto-invite
// Automação de convites baseado em eventos (inscrição, check-in)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface AutoInviteRequest {
  registration_id?: string;
  user_id?: string;
  project_id: string;
  user_type?: 'standard' | 'vip' | 'speaker' | 'startup' | 'mentor';
  trigger: 'registration' | 'checkin';
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: AutoInviteRequest = await req.json();
    const { registration_id, user_id, project_id, user_type, trigger } = body;

    if (!project_id || !trigger) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar configuração de grupos com auto-invite habilitado
    let groupsQuery = supabaseClient
      .from('whatsapp_groups')
      .select('*')
      .eq('project_id', project_id)
      .eq('is_active', true)
      .eq('is_full', false);

    if (trigger === 'registration') {
      groupsQuery = groupsQuery.eq('auto_invite_on_registration', true);
    } else if (trigger === 'checkin') {
      groupsQuery = groupsQuery.eq('auto_invite_on_checkin', true);
    }

    const { data: groups, error: groupsError } = await groupsQuery;

    if (groupsError) {
      throw groupsError;
    }

    if (!groups || groups.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No groups configured for auto-invite',
          invited: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do usuário
    let userData: any = null;
    let registrationData: any = null;

    if (registration_id) {
      const { data: reg } = await supabaseClient
        .from('registrations')
        .select('*, users(*)')
        .eq('id', registration_id)
        .single();

      if (reg) {
        registrationData = reg;
        userData = reg.users;
      }
    } else if (user_id) {
      const { data: user } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user_id)
        .single();

      userData = user;
    }

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar grupos apropriados baseado no tipo de usuário
    const targetGroups = groups.filter(group => {
      // Mapeamento de tipo de usuário para tipo de grupo
      const typeMapping: Record<string, string[]> = {
        'vip': ['participants_vip', 'participants_geral'],
        'standard': ['participants_geral'],
        'speaker': ['speakers_palestrantes', 'organizacao'],
        'startup': ['startups_arena'],
        'mentor': ['mentores'],
      };

      const allowedTypes = user_type ? typeMapping[user_type] || ['participants_geral'] : ['participants_geral'];
      return allowedTypes.includes(group.group_type);
    });

    const invitedGroups: string[] = [];
    const failedGroups: string[] = [];

    // Adicionar usuário aos grupos e enviar convites
    for (const group of targetGroups) {
      try {
        // Verificar se já está no grupo
        const { data: existingMember } = await supabaseClient
          .from('whatsapp_group_members')
          .select('id, status')
          .eq('group_id', group.id)
          .eq('phone_number', userData.phone || userData.whatsapp)
          .maybeSingle();

        if (existingMember && existingMember.status === 'joined') {
          invitedGroups.push(group.id);
          continue;
        }

        // Adicionar ou atualizar membro
        const memberData = {
          group_id: group.id,
          user_id: userData.id,
          phone_number: userData.phone || userData.whatsapp,
          name: userData.name,
          email: userData.email,
          status: 'invite_sent',
          invited_at: new Date().toISOString(),
        };

        let memberId: string;

        if (existingMember) {
          const { error: updateError } = await supabaseClient
            .from('whatsapp_group_members')
            .update(memberData)
            .eq('id', existingMember.id);

          if (updateError) throw updateError;
          memberId = existingMember.id;
        } else {
          const { data: newMember, error: insertError } = await supabaseClient
            .from('whatsapp_group_members')
            .insert(memberData)
            .select()
            .single();

          if (insertError) throw insertError;
          memberId = newMember.id;
        }

        // Enviar convite via método configurado
        const inviteResult = await sendAutoInvite(
          memberData.phone_number,
          group,
          userData.name,
          trigger
        );

        if (inviteResult.success) {
          invitedGroups.push(group.id);

          // Log de sucesso
          await supabaseClient.from('whatsapp_invite_logs').insert({
            group_id: group.id,
            member_id: memberId,
            user_id: userData.id,
            action: 'invite_sent',
            method: 'auto',
            details: {
              trigger,
              user_type,
              timestamp: new Date().toISOString()
            },
          });
        } else {
          failedGroups.push(group.id);

          // Log de erro
          await supabaseClient.from('whatsapp_invite_logs').insert({
            group_id: group.id,
            member_id: memberId,
            user_id: userData.id,
            action: 'error',
            method: 'auto',
            error_message: inviteResult.message,
            details: { trigger, user_type },
          });
        }

      } catch (err: any) {
        console.error(`Erro ao processar grupo ${group.id}:`, err);
        failedGroups.push(group.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-invite completed: ${invitedGroups.length} sent, ${failedGroups.length} failed`,
        data: {
          invited_count: invitedGroups.length,
          failed_count: failedGroups.length,
          invited_groups: invitedGroups,
          failed_groups: failedGroups,
          user_id: userData.id,
          trigger,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge Function whatsapp-auto-invite:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função para enviar convite automático
async function sendAutoInvite(
  phoneNumber: string,
  group: any,
  userName: string,
  trigger: string
): Promise<{ success: boolean; message: string }> {
  // Template de mensagem baseado no trigger
  let message = group.welcome_message_template;

  if (!message) {
    if (trigger === 'registration') {
      message = `Olá {{nome}}! 🎉\n\nBem-vindo(a) ao {{evento}}!\n\nVocê está sendo convidado(a) para nosso grupo exclusivo no WhatsApp.\n\nClique aqui para entrar: {{link_grupo}}\n\nNos vemos lá! 🚀`;
    } else if (trigger === 'checkin') {
      message = `Olá {{nome}}! 👋\n\nSeja bem-vindo(a) ao evento! Estamos felizes em tê-lo(a) aqui.\n\nAcesse nosso grupo do WhatsApp para acompanhar atualizações em tempo real: {{link_grupo}}\n\nAproveite o evento! 🎊`;
    }
  }

  // Substituir variáveis
  message = message
    .replace(/\{\{nome\}\}/g, userName || 'Participante')
    .replace(/\{\{evento\}\}/g, group.group_name)
    .replace(/\{\{link_grupo\}\}/g, group.invite_link || '');

  // Simulação de envio
  console.log(`[AUTO-INVITE ${trigger.toUpperCase()}] Para: ${phoneNumber}`);
  console.log(`Mensagem: ${message}`);

  // Em produção, integrar com API de WhatsApp
  // Exemplo com Z-API:
  // const response = await fetch(`https://api.z-api.io/instances/INSTANCE/token/TOKEN/send-text`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone: phoneNumber, message })
  // });

  return { success: true, message: 'Auto-invite sent (simulated)' };
}
