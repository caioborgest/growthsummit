import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const url = new URL(req.url)
        const action = url.pathname.split('/').pop()

        // ─────────────────────────────────────────────────────────────────────────
        // ACTION: CREATE PIX
        // ─────────────────────────────────────────────────────────────────────────
        if (action === 'create-pix') {
            const { registrationId } = await req.json()

            // 1. Fetch registration details
            const { data: registration, error: fetchError } = await supabase
                .from('inscricoes_growth_experience')
                .select('*')
                .eq('id', registrationId)
                .single()

            if (fetchError || !registration) {
                return new Response(JSON.stringify({ error: 'Inscrição não encontrada' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            // 2. Call Cora API to create Invoice
            // NOTE: Here we would use CORA_CLIENT_ID / CORA_SECRET from Deno.env
            // For now, let's pretend we're calling Cora.
            const coraInvoiceId = `cora_${Math.random().toString(36).substr(2, 9)}`
            const pixCopyPaste = `00020101021226840014BR.GOV.BCB.PIX0114${registrationId.replace(/-/g, '')}5204000053039865406${registration.valor_pago.toFixed(2)}5802BR5913GROWTHSUMMIT6007TRIUNFO62070503***6304`

            // 3. Update registration with Cora ID
            await supabase
                .from('inscricoes_growth_experience')
                .update({
                    external_payment_id: coraInvoiceId,
                    payment_method: 'pix'
                })
                .eq('id', registrationId)

            return new Response(JSON.stringify({
                success: true,
                pixCopyPaste,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`,
                invoiceId: coraInvoiceId
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ─────────────────────────────────────────────────────────────────────────
        // ACTION: WEBHOOK
        // ─────────────────────────────────────────────────────────────────────────
        if (action === 'webhook') {
            const body = await req.json()
            console.log('Cora Webhook received:', body)

            const eventType = body.event_type
            const invoiceId = body.data?.id
            const status = body.data?.status

            if (eventType === 'invoice.paid' || status === 'PAID') {
                // Encontrar a inscrição pelo Cora ID
                const { data: registration, error: findError } = await supabase
                    .from('inscricoes_growth_experience')
                    .select('id, user_id, project_id, valor_pago')
                    .eq('external_payment_id', invoiceId)
                    .single()

                if (registration) {
                    // 1. Atualizar status da inscrição
                    await supabase
                        .from('inscricoes_growth_experience')
                        .update({
                            status: 'ativo',
                            status_pagamento: 'pago',
                            payment_date: new Date().toISOString()
                        })
                        .eq('id', registration.id)

                    // 2. Criar registro no financeiro (opcional, dependendo da estrutura)
                    // Exemplo: inserir em 'transactions'
                    await supabase
                        .from('transactions')
                        .insert({
                            project_id: registration.project_id,
                            type: 'income',
                            category: 'Inscrição',
                            description: `Pagamento PIX Cora - Inscrição ${registration.id}`,
                            amount: registration.valor_pago,
                            date: new Date().toISOString(),
                            status: 'completed',
                            related_id: registration.id,
                            related_type: 'registration'
                        })
                }
            }

            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify({ error: 'Invalid action' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
