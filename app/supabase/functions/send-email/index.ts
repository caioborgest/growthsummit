// Edge Function: send-email
// Envia emails usando Resend API

// @ts-expect-error: Deno is available in Edge Functions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// @ts-expect-error: Deno is available in Edge Functions
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
}

serve(async (req: Request) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not set');
        }

        const { to, subject, html, text, from }: EmailRequest = await req.json();

        if (!to || !subject || (!html && !text)) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields', success: false }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: from || 'Growth Experience <no-reply@growthsummit.site>',
                to: Array.isArray(to) ? to : [to],
                subject,
                html: html || text,
                text: text || html,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('Resend API Error:', data);
            return new Response(
                JSON.stringify({ error: data.message || 'Error sending email', success: false }),
                { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Edge Function Error:', err);
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error', success: false }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
