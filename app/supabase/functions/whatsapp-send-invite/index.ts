// Edge Function: whatsapp-send-invite
// Envia convite para participante entrar no grupo WhatsApp

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface SendInviteRequest {
  group_id: string;
  member_id: string;
  message?: string;
  method: 'link' | 'api' | 'qr';
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { group_id, member_id, message, method }: SendInviteRequest = await req.json();

    if (!group_id || !member_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabaseClient
      .from('whatsapp_groups')
      .select('*')
      .eq('id', group_id)
      .single();

    if (groupError || !group) {
      return new Response(
        JSON.stringify({ error: 'Group not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se grupo está ativo
    if (!group.is_active) {
      return new Response(
        JSON.stringify({ error: 'Group is not active', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se grupo está cheio
    if (group.is_full) {
      return new Response(
        JSON.stringify({ error: 'Group is full', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do membro
    const { data: member, error: memberError } = await supabaseClient
      .from('whatsapp_group_members')
      .select('*')
      .eq('id', member_id)
      .single();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'Member not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se já está no grupo
    if (member.status === 'joined') {
      return new Response(
        JSON.stringify({ error: 'Member already joined', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar convite baseado no método
    let sendResult: { success: boolean; message: string; details?: any } = {
      success: false,
      message: '',
    };

    switch (method) {
      case 'link':
        // Enviar link de convite via SMS/WhatsApp (implementação simulada)
        sendResult = await sendLinkInvite(member.phone_number, group.invite_link, message);
        break;

      case 'api':
        // Enviar via API oficial do WhatsApp (requer integração com provedor)
        sendResult = await sendAPIInvite(member.phone_number, group, message);
        break;

      case 'qr':
        // Gerar e enviar QR code
        sendResult = await sendQRInvite(member.phone_number, group.qr_code_url, message);
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid method', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!sendResult.success) {
      // Registrar falha no log
      await supabaseClient.from('whatsapp_invite_logs').insert({
        group_id,
        member_id,
        user_id: member.user_id,
        action: 'error',
        performed_by: user.id,
        method,
        details: { error: sendResult.message },
        error_message: sendResult.message,
      });

      return new Response(
        JSON.stringify({ error: sendResult.message, success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar status do membro
    const { error: updateError } = await supabaseClient
      .from('whatsapp_group_members')
      .update({
        status: 'invite_sent',
        invited_at: new Date().toISOString(),
        invited_by: user.id,
      })
      .eq('id', member_id);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
    }

    // Registrar sucesso no log
    await supabaseClient.from('whatsapp_invite_logs').insert({
      group_id,
      member_id,
      user_id: member.user_id,
      action: 'invite_sent',
      performed_by: user.id,
      method,
      details: { method, timestamp: new Date().toISOString() },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invite sent successfully',
        data: {
          group_id,
          member_id,
          phone: member.phone_number,
          method,
          sent_at: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função simulada para envio via link
async function sendLinkInvite(
  phoneNumber: string,
  inviteLink: string | null,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  if (!inviteLink) {
    return { success: false, message: 'Invite link not available' };
  }

  // Aqui você integraria com um serviço de SMS/WhatsApp
  // Como Z-API, Evolution API, Twilio, etc.

  const message = customMessage ||
    `Olá! Você foi convidado(a) para participar do nosso grupo no WhatsApp.\n\nClique no link para entrar: ${inviteLink}\n\nAtenciosamente, Equipe Growth Summit`;

  // Simulação de envio bem-sucedido
  console.log(`[SIMULAÇÃO] Enviando para ${phoneNumber}: ${message}`);

  // Em produção, descomente e configure:
  // const response = await fetch('https://api.z-api.io/...', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer TOKEN' },
  //   body: JSON.stringify({ phone: phoneNumber, message })
  // });
  // return { success: response.ok, message: response.ok ? 'Sent' : 'Failed' };

  return { success: true, message: 'Invite link sent (simulated)' };
}

// Função simulada para envio via API oficial
async function sendAPIInvite(
  phoneNumber: string,
  group: any,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  // Integração com WhatsApp Business API Cloud
  const message = customMessage ||
    `Olá! Você foi convidado(a) para o grupo "${group.group_name}" do Growth Summit.\n\nLink: ${group.invite_link}`;

  console.log(`[SIMULAÇÃO API] Enviando template para ${phoneNumber}`);

  return { success: true, message: 'API invite sent (simulated)' };
}

// Função simulada para envio via QR code
async function sendQRInvite(
  phoneNumber: string,
  qrCodeUrl: string | null,
  customMessage?: string
): Promise<{ success: boolean; message: string }> {
  if (!qrCodeUrl) {
    return { success: false, message: 'QR code not available' };
  }

  const message = customMessage ||
    `Olá! Escaneie este QR code para entrar no grupo do WhatsApp: ${qrCodeUrl}`;

  console.log(`[SIMULAÇÃO QR] Enviando QR para ${phoneNumber}`);

  return { success: true, message: 'QR invite sent (simulated)' };
}
