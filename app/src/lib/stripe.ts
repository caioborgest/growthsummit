/**
 * Serviço de integração com Stripe para pagamentos
 * Growth Experience Triunfo-PE 2026
 */

import { supabase } from './supabase';
import { logger } from './logger';

// Configuração do Stripe
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface CreateCheckoutSessionParams {
    inscricaoId: string;
    email: string;
    nome: string;
    valor: number;
    eventoNome: string;
    tipoInscricao: string;
}

interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createStripeCheckoutSession(
    params: CreateCheckoutSessionParams
): Promise<CheckoutSessionResponse> {
    try {
        const response = await fetch(`${API_URL}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inscricao_id: params.inscricaoId,
                email: params.email,
                nome: params.nome,
                valor: params.valor,
                evento_nome: params.eventoNome,
                tipo_inscricao: params.tipoInscricao,
                success_url: `${window.location.origin}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${window.location.origin}/?canceled=true`,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar sessão de pagamento');
        }

        const data = await response.json();
        return {
            sessionId: data.sessionId,
            url: data.url,
        };
    } catch (error: any) {
        logger.error('Erro ao criar checkout session:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
    }
}

/**
 * Redireciona para o checkout do Stripe
 */
export async function redirectToStripeCheckout(sessionId: string): Promise<void> {
    try {
        // Carregar Stripe.js dinamicamente
        const stripe = await loadStripe();

        if (!stripe) {
            throw new Error('Erro ao carregar Stripe');
        }

        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            throw error;
        }
    } catch (error: any) {
        logger.error('Erro ao redirecionar para checkout:', error);
        throw new Error(error.message || 'Erro ao redirecionar para pagamento');
    }
}

/**
 * Carrega o Stripe.js
 */
async function loadStripe() {
    if (!STRIPE_PUBLIC_KEY) {
        logger.warn('Stripe Public Key não configurada');
        return null;
    }

    // Carregar script do Stripe
    if (!(window as any).Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
            script.onload = resolve;
        });
    }

    return (window as any).Stripe(STRIPE_PUBLIC_KEY);
}

/**
 * Verifica o status de um pagamento
 */
export async function checkPaymentStatus(sessionId: string): Promise<{
    status: string;
    inscricaoId?: string;
}> {
    try {
        const response = await fetch(`${API_URL}/stripe/check-payment-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
            throw new Error('Erro ao verificar status do pagamento');
        }

        return await response.json();
    } catch (error: any) {
        logger.error('Erro ao verificar status:', error);
        throw error;
    }
}

/**
 * Atualiza o status da inscrição no Supabase após pagamento
 */
export async function updateInscricaoStatus(
    inscricaoId: string,
    status: string,
    stripeData?: {
        paymentIntentId?: string;
        sessionId?: string;
        paymentStatus?: string;
    }
): Promise<void> {
    try {
        const updateData: any = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === 'pago') {
            updateData.paid_at = new Date().toISOString();
        }

        if (stripeData) {
            if (stripeData.paymentIntentId) {
                updateData.stripe_payment_intent_id = stripeData.paymentIntentId;
            }
            if (stripeData.sessionId) {
                updateData.stripe_session_id = stripeData.sessionId;
            }
            if (stripeData.paymentStatus) {
                updateData.stripe_payment_status = stripeData.paymentStatus;
            }
        }

        const { error } = await (supabase
            .from('inscricoes_growth_experience') as any)
            .update(updateData)
            .eq('id', inscricaoId);

        if (error) throw error;
    } catch (error: any) {
        logger.error('Erro ao atualizar status da inscrição:', error);
        throw error;
    }
}

/**
 * Registra um log de pagamento no Supabase
 */
export async function logPayment(data: {
    inscricaoId: string;
    email: string;
    valor: number;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    stripeCustomerId?: string;
    status: string;
    metadata?: any;
}): Promise<void> {
    try {
        const { error } = await (supabase
            .from('pagamentos_stripe') as any)
            .insert({
                inscricao_id: data.inscricaoId,
                email: data.email,
                valor: data.valor,
                moeda: 'BRL',
                stripe_payment_intent_id: data.stripePaymentIntentId,
                stripe_session_id: data.stripeSessionId,
                stripe_customer_id: data.stripeCustomerId,
                status: data.status,
                metadata: data.metadata,
                created_at: new Date().toISOString(),
            });

        if (error) throw error;
    } catch (error: any) {
        logger.error('Erro ao registrar log de pagamento:', error);
        // Não lançar erro para não interromper o fluxo
    }
}

/**
 * Fluxo completo de pagamento
 */
export async function processPayment(params: CreateCheckoutSessionParams): Promise<void> {
    try {
        // 1. Criar sessão de checkout
        const { sessionId, url } = await createStripeCheckoutSession(params);

        // 2. Atualizar inscrição com session_id
        await updateInscricaoStatus(params.inscricaoId, 'pendente', {
            sessionId,
        });

        // 3. Registrar log
        await logPayment({
            inscricaoId: params.inscricaoId,
            email: params.email,
            valor: params.valor,
            stripeSessionId: sessionId,
            status: 'pending',
            metadata: {
                evento: params.eventoNome,
                tipo_inscricao: params.tipoInscricao,
            },
        });

        // 4. Redirecionar para checkout
        window.location.href = url;
    } catch (error: any) {
        logger.error('Erro no processo de pagamento:', error);
        throw error;
    }
}

/**
 * Formata valor para exibição
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Verifica se o Stripe está configurado
 */
export function isStripeConfigured(): boolean {
    return !!STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY !== '';
}
