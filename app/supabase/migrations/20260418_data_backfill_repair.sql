-- ============================================================================
-- GROWTH SUMMIT 2026 - DATA REPAIR & BACKFILL
-- ============================================================================

-- 1. BACKFILL EMPRESA & VOUCHER_CODE FROM BATCHES
-- ----------------------------------------------------------------------------
UPDATE public.growth_experience_registrations reg
SET 
  empresa = COALESCE(reg.empresa, batch.company_name, batch.name),
  voucher_code = COALESCE(reg.voucher_code, batch.voucher_code)
FROM public.company_registration_batches batch
WHERE reg.batch_id = batch.id
  AND (reg.empresa IS NULL OR reg.voucher_code IS NULL);

-- 2. BACKFILL COUPON_CODE FROM SOCIAL_CODE / LECTURE_CODE
-- ----------------------------------------------------------------------------
UPDATE public.growth_experience_registrations
SET coupon_code = COALESCE(social_code, lecture_code)
WHERE coupon_code IS NULL 
  AND (social_code IS NOT NULL OR lecture_code IS NOT NULL);

-- 3. BACKFILL EMPRESA FROM PROFILES (LAST RESORT)
-- ----------------------------------------------------------------------------
UPDATE public.growth_experience_registrations reg
SET empresa = prof.company
FROM public.profiles prof
WHERE reg.user_id = prof.user_id
  AND reg.empresa IS NULL
  AND prof.company IS NOT NULL 
  AND prof.company <> '';

-- 4. NORMALIZE STATUS (Case sensitivity resilience)
-- ----------------------------------------------------------------------------
UPDATE public.growth_experience_registrations
SET status = 'paid'
WHERE status IN ('PAID', 'pago', 'Pago', 'Confirmado', 'confirmado');

UPDATE public.growth_experience_registrations
SET status = 'active'
WHERE status IN ('ACTIVE', 'Ativo', 'ativo');

-- 5. RELOAD SCHEMA FOR POSTGREST
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
