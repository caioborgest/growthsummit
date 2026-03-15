import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import axios from 'npm:axios@1.6.8'
import https from 'node:https'
import { Buffer } from 'node:buffer'

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
        const body = await req.json().catch(() => ({}))

        // ─────────────────────────────────────────────────────────────────────────
        // ACTION: CREATE PIX (Aceita /create-pix ou corpo com action)
        // ─────────────────────────────────────────────────────────────────────────
        if (action === 'create-pix' || body.action === 'create-pix') {
            const registrationId = body.registrationId || body.id;

            if (!registrationId) {
                return new Response(JSON.stringify({ error: 'registrationId é obrigatório' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            // 1. Fetch registration details
            const { data: registration, error: fetchError } = await supabase
                .from('inscricoes_growth_experience')
                .select(`
                    id, 
                    user_id, 
                    nome, 
                    email, 
                    telefone,
                    valor_pago,
                    cpf,
                    profiles:user_id (
                        cpf,
                        cnpj,
                        city,
                        state
                    )
                `)
                .eq('id', registrationId)
                .single()

            if (fetchError || !registration) {
                console.error('[Cora Gateway] Fetch error:', fetchError);
                return new Response(JSON.stringify({ error: 'Inscrição não encontrada' }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }

            // Validar documento - Tentar de várias fontes
            const profile = registration.profiles;
            const rawDocument = profile?.cnpj || profile?.cpf || registration.cpf || '00000000000';
            const document = rawDocument.replace(/\D/g, ''); // apenas números
            const isCnpj = document.length === 14;

            if (!document || document === '00000000000') {
                return new Response(JSON.stringify({ error: 'Identificação (CPF/CNPJ) inválida ou não encontrada' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // Certificados
            const certStr = Deno.env.get('CORA_CERTIFICATE')?.replace(/\\n/g, '\n');
            const keyStr = Deno.env.get('CORA_PRIVATE_KEY')?.replace(/\\n/g, '\n');
            const clientId = Deno.env.get('CORA_CLIENT_ID');
            // Allow override via env variable, use stage as default if you are testing, or production
            const baseUrl = Deno.env.get('CORA_API_URL') || 'https://matls-clients.api.stage.cora.com.br';

            if (!certStr || !keyStr || !clientId) {
                throw new Error('Credenciais da Cora não configuradas no ambiente (CORA_CERTIFICATE, CORA_PRIVATE_KEY, CORA_CLIENT_ID).');
            }

            const httpsAgent = new https.Agent({
                cert: Buffer.from(certStr),
                key: Buffer.from(keyStr),
            });

            // 2. Gerar Token na Cora
            const tokenParams = new URLSearchParams();
            tokenParams.append('grant_type', 'client_credentials');
            tokenParams.append('client_id', clientId);

            const tokenRes = await axios.post(`${baseUrl}/token`, tokenParams.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                httpsAgent
            });

            const accessToken = tokenRes.data.access_token;

            // 3. Criar Invoice (Pix) na Cora
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias, ajustável
            const formattedDueDate = dueDate.toISOString().split('T')[0];
            const idempotencyKey = crypto.randomUUID();

            const invoicePayload = {
                code: registrationId,
                customer: {
                    name: registration.nome || 'Participante Growth Summit',
                    email: registration.email || 'contato@growthsummit.com.br',
                    document: {
                        identity: document, // Apenas números
                        type: isCnpj ? 'CNPJ' : 'CPF'
                    },
                    address: {
                        street: 'N/A',
                        number: 'S/N',
                        district: 'N/A',
                        city: profile?.city || 'Petrolina',
                        state: profile?.state || 'PE',
                        complement: '',
                        zip_code: '56300000'
                    }
                },
                services: [{
                    name: 'Inscrição Growth Experience',
                    description: `Inscrição para o evento Growth Experience (Ref: ${registrationId})`,
                    amount: Math.round(Number(registration.valor_pago) * 100) // Em centavos!
                }],
                payment_terms: {
                    due_date: formattedDueDate,
                },
                // Força a emissão do QR Code Pix na API v2 da Cora
                payment_forms: ['PIX']
            };

            const invoiceRes = await axios.post(`${baseUrl}/v2/invoices`, invoicePayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Idempotency-Key': idempotencyKey
                },
                httpsAgent
            });

            const invoiceData = invoiceRes.data;
            const coraInvoiceId = invoiceData.id;
            const pixCopyPaste = invoiceData.payment_options?.pix?.emv || 'Erro_ao_gerar_Copia_e_Cola';
            const pixQrCodeUrl = invoiceData.payment_options?.pix?.qr_code || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`;

            // 4. Atualizar registro local
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
                qrCodeUrl: pixQrCodeUrl,
                invoiceId: coraInvoiceId
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // ─────────────────────────────────────────────────────────────────────────
        // ACTION: WEBHOOK (Recuperado do body se não estiver na URL)
        // ─────────────────────────────────────────────────────────────────────────
        if (action === 'webhook' || body.event_type) {
            console.info('Cora Webhook received:', body)

            const eventType = body.event_type
            const invoiceId = body.data?.id
            const status = body.data?.status

            if (eventType === 'INVOICE.PAID' || eventType === 'invoice.paid' || status === 'PAID') {
                // Encontrar a inscrição pelo Cora ID
                const { data: registration } = await supabase
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

    } catch (err) {
        const error = err as any;
        const status = error.response?.status || 500;
        const message = error.response?.data?.error || error.message;
        
        console.error(`Cora Gateway Error (${status}):`, message);
        return new Response(JSON.stringify({ error: message, success: false }), {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
