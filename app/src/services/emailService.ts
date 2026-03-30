import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface EmailParams {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string; // Optional: Override sender
}

export const emailService = {
    /**
     * Envia um email através da Edge Function do Supabase que integra com Resend.
     * Use para notificações transacionais (confirmação, lembretes, suporte).
     */
    async send(params: EmailParams) {
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: params
            });

            if (error) {
                console.error('Error invoking send-email function:', error);
                throw error;
            }

            return { success: true, data };
        } catch (err) {
            logger.error('Email service failure:', err);
            return { success: false, error: err };
        }
    },

    /**
     * Envia email de boas-vindas com template básico.
     */
    async sendWelcome(to: string, name: string) {
        return this.send({
            to,
            subject: 'Boas-vindas ao Growth Experience 2026! 🚀',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #ff7043;">Olá, ${name}!</h1>
                    <p>Sua conta na plataforma Growth Experience foi criada com sucesso.</p>
                    <p>A partir de agora, você pode acessar seu painel para:</p>
                    <ul>
                        <li>Ver seu ingresso e QR Code</li>
                        <li>Participar de mentorias exclusivas</li>
                        <li>Ver a programação completa do evento</li>
                    </ul>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience - Petrolina/PE & Triunfo/PE</p>
                </div>
            `
        });
    }
};
