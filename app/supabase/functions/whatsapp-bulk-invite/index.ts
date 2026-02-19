// Edge Function: whatsapp-bulk-invite
// Processa convites em massa com fila e rate limiting

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface BulkInviteRequest {
  group_id: string;
  member_ids?: string[];
  filter_status?: string[];
  message?: string;
  method: 'link' | 'api' | 'qr';
  batch_size?: number;
  delay_ms?: number;
}

interface BulkInviteResult {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

interface WhatsAppGroupMember {
  id: string;
  group_id: string;
  phone_number: string;
  name?: string;
  email?: string;
  status: 'pending' | 'invited' | 'invite_sent' | 'joined' | 'left' | 'removed' | 'declined';
  invited_at?: string;
  joined_at?: string;
  user_id?: string;
}

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    const body: BulkInviteRequest = await req.json();
    const {
      group_id,
      member_ids,
      filter_status,
      message,
      method,
      batch_size = 10,
      delay_ms = 1000,
    } = body;

    if (!group_id) {
      return new Response(
        JSON.stringify({ error: 'Group ID is required', success: false }),
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

    // Construir query de membros
    let membersQuery = supabaseClient
      .from('whatsapp_group_members')
      .select('*')
      .eq('group_id', group_id);

    // Filtrar por IDs específicos se fornecidos
    if (member_ids && member_ids.length > 0) {
      membersQuery = membersQuery.in('id', member_ids);
    }

    // Filtrar por status
    if (filter_status && filter_status.length > 0) {
      membersQuery = membersQuery.in('status', filter_status);
    } else {
      // Por padrão, apenas membros pendentes
      membersQuery = membersQuery.in('status', ['pending', 'invited']);
    }

    const { data: members, error: membersError } = await membersQuery;

    if (membersError) {
      throw membersError;
    }

    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No members to invite',
          result: { total: 0, sent: 0, failed: 0, skipped: 0, errors: [] },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar rate limiting (máximo 100 convites por execução)
    const maxInvitesPerRun = 100;
    const membersToProcess = (members as WhatsAppGroupMember[]).slice(0, maxInvitesPerRun);

    const result: BulkInviteResult = {
      total: members.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    // Processar em batches
    const batches = chunkArray(membersToProcess, batch_size);

    for (const batch of batches) {
      // Processar batch em paralelo
      const batchPromises = batch.map(async (member: WhatsAppGroupMember) => {
        try {
          // Verificar se já está no grupo
          if (member.status === 'joined') {
            result.skipped++;
            return { success: true, skipped: true };
          }

          // Enviar convite
          const sendResult = await sendInvite(
            member.phone_number,
            group,
            message,
            method
          );

          if (sendResult.success) {
            // Atualizar status
            const { error: updateError } = await supabaseClient
              .from('whatsapp_group_members')
              .update({
                status: 'invite_sent',
                invited_at: new Date().toISOString(),
                invited_by: user.id,
              })
              .eq('id', member.id);

            if (updateError) {
              console.error('Erro ao atualizar status:', updateError);
            }

            // Registrar log
            await supabaseClient.from('whatsapp_invite_logs').insert({
              group_id,
              member_id: member.id,
              user_id: member.user_id,
              action: 'invite_sent',
              performed_by: user.id,
              method: `bulk_${method}`,
              details: { batch_size, delay_ms },
            });

            return { success: true };
          } else {
            result.errors.push(`Member ${member.id}: ${sendResult.message}`);
            
            // Registrar erro
            await supabaseClient.from('whatsapp_invite_logs').insert({
              group_id,
              member_id: member.id,
              user_id: member.user_id,
              action: 'error',
              performed_by: user.id,
              method: `bulk_${method}`,
              error_message: sendResult.message,
            });

            return { success: false, error: sendResult.message };
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          result.errors.push(`Member ${member.id}: ${errorMessage}`);
          return { success: false, error: errorMessage };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      // Contar resultados
      batchResults.forEach(r => {
        if (r.success && r.skipped) {
          result.skipped++;
        } else if (r.success) {
          result.sent++;
        } else {
          result.failed++;
        }
      });

      // Delay entre batches para não sobrecarregar
      if (delay_ms > 0) {
        await sleep(delay_ms);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Bulk invite completed: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`,
        result,
        group: {
          id: group.id,
          name: group.group_name,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge Function whatsapp-bulk-invite:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função auxiliar para enviar convite
async function sendInvite(
  phoneNumber: string,
  group: any,
  customMessage?: string,
  method: string = 'link'
): Promise<{ success: boolean; message: string }> {
  const message = customMessage || 
    `Olá! Você foi convidado(a) para o grupo "${group.group_name}".\n\n` +
    (group.invite_link ? `Clique aqui para entrar: ${group.invite_link}` : 'Entre em contato para receber o link.');

  console.log(`[BULK INVITE - ${method.toUpperCase()}] Para: ${phoneNumber}`);
  console.log(`Mensagem: ${message.substring(0, 100)}...`);

  // Em produção, integrar com API de WhatsApp
  // const response = await fetch('https://api.whatsapp-provider.com/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer TOKEN' },
  //   body: JSON.stringify({ phone: phoneNumber, message })
  // });

  return { success: true, message: 'Invite sent (simulated)' };
}

// Função auxiliar para dividir array em chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Função auxiliar para delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
