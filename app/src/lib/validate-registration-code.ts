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
    .select('id, name, voucher_code, payment_status, total_slots, used_slots, is_active')
    .eq('project_id', projectId)
    .ilike('voucher_code', normalizedCode)
    .eq('is_active', true)
    .maybeSingle();

  if (batchError) {
    console.error('❌ [validateRegistrationCode] Erro ao buscar lote:', batchError);
  }

  if (batch) {
    // Lote inativo ou não pago
    if (batch.payment_status !== 'paid') {
      return {
        type: 'INVALID',
        message: 'Este lote ainda não foi confirmado pelo organizador. Entre em contato.',
      };
    }

    // Lote esgotado
    const slotsAvailable = (batch.total_slots || 0) - (batch.used_slots || 0);
    if (slotsAvailable <= 0) {
      return {
        type: 'INVALID',
        message: 'Todas as vagas deste lote já foram utilizadas.',
      };
    }

    return {
      type: 'BATCH',
      batchId: batch.id,
      batchName: batch.name,
      voucherCode: batch.voucher_code,
      paymentStatus: batch.payment_status as any,
      slotsAvailable,
      finalAmount: 0,           // empresa já pagou — participante não paga
      finalPaymentStatus: 'paid',
      finalStatus: 'active',    // já ativo, sem necessidade de confirmar
    };
  }

  // ── 1.1 Fallback Lote Global (Se não achou no projeto) ──────────────────
  if (!batch) {
    const { data: globalBatch, error: globalBatchError } = await supabase
      .from('company_registration_batches')
      .select('id, name, voucher_code, payment_status, total_slots, used_slots, is_active')
      .ilike('voucher_code', normalizedCode)
      .eq('is_active', true)
      .eq('payment_status', 'paid')
      .maybeSingle();

    if (globalBatchError) {
      console.error('❌ [validateRegistrationCode] Erro ao buscar lote global:', globalBatchError);
    }

    if (globalBatch) {
      console.warn('[validateRegistrationCode] Lote encontrado via Global Fallback (ID Projeto divergente).');
      const slotsAvailable = (globalBatch.total_slots || 0) - (globalBatch.used_slots || 0);
      if (slotsAvailable > 0) {
        return {
          type: 'BATCH',
          batchId: globalBatch.id,
          batchName: globalBatch.name,
          voucherCode: globalBatch.voucher_code,
          paymentStatus: 'paid',
          slotsAvailable,
          finalAmount: 0,
          finalPaymentStatus: 'paid',
          finalStatus: 'active',
        };
      }
    }
  }

  // ── 2. Verificar CUPOM de desconto (secundário) ──────────────────────────
  const { data: coupon, error: couponError } = await supabase
    .from('social_partnership_coupons')
    .select('id, code, discount_percentage, is_active, current_usage, usage_limit, end_date, referral_type')
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
      .select('id, code, discount_percentage, is_active, current_usage, usage_limit, end_date, referral_type')
      .ilike('code', normalizedCode)
      .eq('is_active', true)
      .maybeSingle();
    
    if (globalCouponError) {
      console.error('❌ [validateRegistrationCode] Erro ao buscar cupom global:', globalCouponError);
    }
    
    if (globalCoupon) {
      console.warn('[validateRegistrationCode] Cupom encontrado via Global Fallback (ID Projeto divergente).');
      finalCoupon = globalCoupon;
    }
  }

  if (finalCoupon) {
    // Cupom expirado (Atenção: mapeado para end_date na DB)
    if (finalCoupon.end_date && new Date(finalCoupon.end_date as string) < new Date()) {
      return { type: 'INVALID', message: 'Este cupom está expirado.' };
    }

    // Limite atingido
    if (finalCoupon.usage_limit && (finalCoupon.current_usage || 0) >= finalCoupon.usage_limit) {
      return { type: 'INVALID', message: 'Este cupom atingiu o limite de uso.' };
    }

    const discount = finalCoupon.discount_percentage ?? 0;
    const discountedAmount = baseAmount * (1 - discount / 100);

    return {
      type: 'COUPON',
      couponId: finalCoupon.id,
      code: finalCoupon.code,
      discountPercentage: discount,
      referralType: finalCoupon.referral_type || 'promocional',
      finalAmount: Math.max(0, discountedAmount),
      finalPaymentStatus: 'pending',  // ainda precisa passar pelo fluxo (mesmo que seja R$0 com 100%)
      finalStatus: 'pending',
    };
  }

  return {
    type: 'INVALID',
    message: 'Código não encontrado. Verifique e tente novamente.',
  };
}
