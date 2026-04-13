import { supabase } from './supabase';

export type CodeValidationResult =
  | {
      type: 'BATCH';           // inscrição em lote — empresa já pagou
      batchId: string;
      batchName: string;
      voucherCode: string;
      paymentStatus: 'paid' | 'pending';
      slotsAvailable: number;
      // Para o participante: 100% pago, status = active
      finalAmount: number;     // sempre 0
      finalPaymentStatus: 'paid';
      finalStatus: 'active';
    }
  | {
      type: 'COUPON';          // cupom de desconto social
      couponId: string;
      code: string;
      discountPercentage: number;
      referralType: string;
      // Para o participante: desconto aplicado, pagamento ainda pendente
      finalAmount: number;
      finalPaymentStatus: 'pending';
      finalStatus: 'pending';
    }
  | {
      type: 'INVALID';
      message: string;
    };

/**
 * Centrally validates registration codes (Batches and Coupons) with clear priority.
 * Priority: 1. Batches (Company/Corporate) -> 2. Coupons (Social/Partnership)
 */
export async function validateRegistrationCode(
  code: string,
  projectId: string,
  baseAmount: number
): Promise<CodeValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  // ── 1. Verificar LOTE corporativo (vaga garantida) ──────────────────────
  const { data: batch, error: batchError } = await supabase
    .from('company_registration_batches')
    .select('*')
    .eq('project_id', projectId)
    .ilike('voucher_code', normalizedCode)
    .eq('is_active', true)
    .maybeSingle();

  if (batchError) {
    console.error('❌ [validateRegistrationCode] Erro ao buscar lote:', batchError);
  }

  // ── 1.1 Fallback Lote Global (Se não achou no projeto) ──────────────────
  let finalBatch = batch;
  if (!finalBatch) {
    const { data: globalBatch, error: globalBatchError } = await supabase
      .from('company_registration_batches')
      .select('*')
      .ilike('voucher_code', normalizedCode)
      .eq('is_active', true)
      .eq('payment_status', 'paid')
      .maybeSingle();

    if (globalBatchError) {
      console.error('❌ [validateRegistrationCode] Erro ao buscar lote global:', globalBatchError);
    }
    if (globalBatch) {
      console.warn('[validateRegistrationCode] Lote encontrado via Global Fallback.');
      finalBatch = globalBatch;
    }
  }

  if (finalBatch) {
    // Lote inativo ou não pago (Fallback seguro para nomes de coluna)
    const paymentStatus = finalBatch.payment_status || finalBatch.status_pagamento || 'pending';
    if (paymentStatus !== 'paid' && paymentStatus !== 'pago') {
      return {
        type: 'INVALID',
        message: 'Este lote ainda não foi confirmado pelo organizador.',
      };
    }

    // Lote esgotado (Defensivo)
    const totalSlots = finalBatch.total_slots ?? finalBatch.quantidade_vagas ?? 0;
    const usedSlots = finalBatch.used_slots ?? finalBatch.vagas_utilizadas ?? 0;
    const slotsAvailable = totalSlots - usedSlots;

    if (slotsAvailable <= 0) {
      return {
        type: 'INVALID',
        message: 'Todas as vagas deste lote já foram utilizadas.',
      };
    }

    return {
      type: 'BATCH',
      batchId: finalBatch.id,
      batchName: finalBatch.name,
      voucherCode: finalBatch.voucher_code || finalBatch.codigo_voucher,
      paymentStatus: 'paid',
      slotsAvailable,
      finalAmount: 0,
      finalPaymentStatus: 'paid',
      finalStatus: 'active',
    };
  }

  // ── 2. Verificar CUPOM de desconto (secundário) ──────────────────────────
  const { data: coupon, error: couponError } = await supabase
    .from('social_partnership_coupons')
    .select('*')
    .eq('project_id', projectId)
    .ilike('code', normalizedCode)
    .eq('is_active', true)
    .maybeSingle();

  if (couponError) {
    console.error('❌ [validateRegistrationCode] Erro ao buscar cupom:', couponError);
  }

  // ── 2.1 Fallback Cupom Global (Se não achou no projeto) ──────────────────
  let finalCoupon = coupon;
  if (!finalCoupon) {
    const { data: globalCoupon, error: globalCouponError } = await supabase
      .from('social_partnership_coupons')
      .select('*')
      .ilike('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();
    
    if (globalCouponError) {
      console.error('❌ [validateRegistrationCode] Erro ao buscar cupom global:', globalCouponError);
    }
    if (globalCoupon) {
      console.warn('[validateRegistrationCode] Cupom encontrado via Global Fallback.');
      finalCoupon = globalCoupon;
    }
  }

  if (finalCoupon) {
    // Cupom expirado (Defensivo: end_date ou vencimento ou expires_at)
    const expirationDate = finalCoupon.end_date || finalCoupon.vencimento || finalCoupon.expires_at;
    if (expirationDate && new Date(expirationDate as string) < new Date()) {
      return { type: 'INVALID', message: 'Este cupom está expirado.' };
    }

    // Limite atingido (Defensivo)
    const usageLimit = finalCoupon.usage_limit ?? finalCoupon.limite_uso ?? null;
    const currentUsage = finalCoupon.current_usage ?? finalCoupon.uso_atual ?? 0;
    if (usageLimit !== null && currentUsage >= usageLimit) {
      return { type: 'INVALID', message: 'Este cupom atingiu o limite de uso.' };
    }

    const discount = finalCoupon.discount_percentage ?? finalCoupon.porcentagem_desconto ?? 0;
    const discountedAmount = baseAmount * (1 - discount / 100);

    return {
      type: 'COUPON',
      couponId: finalCoupon.id,
      code: finalCoupon.code,
      discountPercentage: discount,
      referralType: finalCoupon.referral_type || 'promocional',
      finalAmount: Math.max(0, discountedAmount),
      finalPaymentStatus: 'pending',
      finalStatus: 'pending',
    };
  }

  return {
    type: 'INVALID',
    message: 'Código não encontrado. Verifique e tente novamente.',
  };
}
