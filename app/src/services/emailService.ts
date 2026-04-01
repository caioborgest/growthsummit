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
     * Envia email de boas-vindas com indicação do Instagram.
     */
    async sendWelcome(to: string, name: string) {
        return this.send({
            to,
            subject: 'Bem-vindo(a) ao Growth Experience! Vamos compartilhar no Instagram? 🚀',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #f1f5f9;">
                    <h1 style="color: #ff7043; font-size: 24px; text-align: center;">Olá, ${name}!</h1>
                    <p style="font-size: 16px; line-height: 1.6; text-align: center;">Sua jornada no <strong>Growth Experience 2026</strong> começa agora!</p>
                    <div style="background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); padding: 25px; border-radius: 16px; color: white; margin: 30px 0; text-align: center;">
                        <h2 style="margin-top: 0;">Poste e nos marque! 📸</h2>
                        <p>Mostre que você confirmou sua presença no maior evento de gestão da região!</p>
                        <p>Use a hashtag <strong>#GrowthExperience2026</strong> e mencione <strong>@gxexperience</strong> para ganhar pontos na gamificação!</p>
                        <a href="https://instagram.com/gxexperience" style="display: inline-block; background: white; color: #d62976; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Seguir no Instagram</a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Growth Experience</p>
                </div>
            `
        });
    },

    /**
     * Notificação de Pagamento Confirmado.
     */
    async sendPaymentConfirmation(to: string, name: string, ticketType: string) {
        return this.send({
            to,
            subject: 'Pagamento Confirmado! Seu lugar está garantido 🎟️',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 40px; border: 1px solid #eee; border-radius: 16px;">
                    <h1 style="color: #10b981; text-align: center;">Pagamento Confirmado ✅</h1>
                    <p>Olá, <strong>${name}</strong>!</p>
                    <p>Confirmamos a recepção do seu pagamento para o <strong>Growth Experience 2026</strong>.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>Tipo de Ingresso:</strong> ${ticketType}</p>
                        <p><strong>Status:</strong> Liberado</p>
                    </div>
                    <p>Acesse seu painel para visualizar seu QR Code de acesso.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://gxexperience.site/minha-area" style="background: #ff7043; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">Ver Meu Ingresso</a>
                    </div>
                </div>
            `
        });
    },

    /**
     * Alerta de Vencedor de Sorteio.
     */
    async sendRaffleWinner(to: string, name: string, prize: string) {
        return this.send({
            to,
            subject: 'Parabéns! Você ganhou um prêmio no Growth Experience! 🎁',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 40px; text-align: center; border: 2px solid #ff7043; border-radius: 20px;">
                    <h1 style="color: #ff7043;">VOCÊ GANHOU! 🏆</h1>
                    <p>Olá, <strong>${name}</strong>! Temos o prazer de anunciar que você foi sorteado.</p>
                    <div style="background: #fff7ed; padding: 30px; border-radius: 15px; margin: 20px 0;">
                        <h2 style="margin: 0; color: #c2410c;">${prize}</h2>
                    </div>
                    <p>Apresente seu QR Code no balcão de prêmios para retirar sua recompensa.</p>
                </div>
            `
        });
    },

    /**
     * Envia múltiplos emails de uma vez.
     * Atualmente faz chamadas paralelas para a Edge Function.
     */
    async sendBulk(to: string[], subject: string, html: string, from?: string) {
        const results = await Promise.all(
            to.map(email => this.send({ to: email, subject, html, from }))
        );
        const success = results.every(r => r.success);
        return { success, results };
    },

    /**
     * Envia o certificado oficial com design premium.
     */
    async sendCertificate(to: string, name: string, activityName: string, certCode: string, validateUrl: string) {
        return this.send({
            to,
            subject: `Seu Certificado: ${activityName} - Growth Experience 🏆`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; background-color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                         <img src="https://www.gxexperience.site/logo-gx.png" alt="Growth Experience" style="height: 60px;" />
                    </div>
                    
                    <h1 style="color: #fe4c38; font-size: 24px; text-align: center; margin-bottom: 20px;">Parabéns, ${name}! 🎓</h1>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: center;">
                        Sua participação na atividade <strong>"${activityName}"</strong> foi validada com sucesso. 
                        Este certificado é o reconhecimento do seu compromisso com a excelência e o aprendizado contínuo.
                    </p>
                    
                    <div style="background: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0; margin: 30px 0; text-align: center;">
                        <p style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">Certificado Disponível</p>
                        <a href="${validateUrl}" 
                           style="display: inline-block; background-color: #fe4c38; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(254, 76, 56, 0.3);">
                           Acessar Certificado Digital
                        </a>
                        <p style="margin-top: 20px; font-family: monospace; font-size: 12px; color: #94a3b8;">Código: ${certCode}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #64748b; text-align: center;">
                        Você também pode compartilhar esta conquista diretamente no seu <strong>LinkedIn</strong> através do seu painel de participante.
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
                    
                    <div style="text-align: center; color: #94a3b8; font-size: 12px;">
                        <p><strong>Growth Experience 2026</strong></p>
                        <p>Ecossistema de Inovação e Gestão</p>
                    </div>
                </div>
            `
        });
    }
};
