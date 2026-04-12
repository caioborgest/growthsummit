-- ============================================================================
-- GROWTH SUMMIT 2026 - FINAL TRIUNFO & STANDARDIZATION INTEGRATION
-- Objective: Standardize all RPCs and Triggers to use English table/column names
-- Ensures strict project isolation for batches and coupons.
-- ============================================================================

-- 1. ENSURE SCHEMA CONSISTENCY (COLUMNS)
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    -- Standardize social_partnership_coupons (ensure end_date vs vencimento)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_partnership_coupons' AND column_name = 'vencimento') THEN
        ALTER TABLE public.social_partnership_coupons RENAME COLUMN vencimento TO end_date;
    END IF;

    -- Ensure project_id exists in batches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'project_id') THEN
        ALTER TABLE public.company_registration_batches ADD COLUMN project_id UUID REFERENCES public.projects(id);
    END IF;

    -- Ensure project_id exists in coupons
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_partnership_coupons' AND column_name = 'project_id') THEN
        ALTER TABLE public.social_partnership_coupons ADD COLUMN project_id UUID REFERENCES public.projects(id);
    END IF;

    -- Fix typo from previous migrations if any
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'quantidade_vagas') THEN
        ALTER TABLE public.company_registration_batches RENAME COLUMN quantidade_vagas TO total_slots;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'vagas_utilizadas') THEN
        ALTER TABLE public.company_registration_batches RENAME COLUMN vagas_utilizadas TO used_slots;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'total_amount' AND data_type = 'integer') THEN
        ALTER TABLE public.company_registration_batches ALTER COLUMN total_amount TYPE NUMERIC;
    END IF;
END $$;


-- 2. RECREATE TRIGGER FUNCTION: handle_registration_usage (ENGLISH)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_registration_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- CASE 1: Registration marked as PAID (New or Updated)
    IF (NEW.payment_status = 'paid' OR NEW.status = 'active') AND (OLD IS NULL OR (OLD.payment_status IS DISTINCT FROM 'paid' AND OLD.status IS DISTINCT FROM 'active')) THEN
        
        -- Update Social Coupon
        IF NEW.social_code IS NOT NULL THEN
            UPDATE public.social_partnership_coupons
            SET current_usage = COALESCE(current_usage, 0) + 1
            WHERE code = NEW.social_code AND project_id = NEW.project_id;
        END IF;

        -- Update Corporate Batch
        IF NEW.batch_id IS NOT NULL THEN
            UPDATE public.company_registration_batches
            SET used_slots = COALESCE(used_slots, 0) + 1
            WHERE id = NEW.batch_id;
        END IF;
        
    -- CASE 2: Registration leaves PAID status (Cancellation/Refund)
    ELSIF (TG_OP = 'UPDATE' AND (OLD.payment_status = 'paid' OR OLD.status = 'active') AND (NEW.payment_status IS DISTINCT FROM 'paid' AND NEW.status IS DISTINCT FROM 'active')) THEN
        
        -- Decrement Social Coupon
        IF NEW.social_code IS NOT NULL THEN
            UPDATE public.social_partnership_coupons
            SET current_usage = GREATEST(0, COALESCE(current_usage, 0) - 1)
            WHERE code = NEW.social_code AND project_id = NEW.project_id;
        END IF;

        -- Decrement Corporate Batch
        IF NEW.batch_id IS NOT NULL THEN
            UPDATE public.company_registration_batches
            SET used_slots = GREATEST(0, COALESCE(used_slots, 0) - 1)
            WHERE id = NEW.batch_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


-- 3. RECREATE RPC: register_participant_with_slots (ENGLISH + PROJECT ISOLATION)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS fn
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'register_participant_with_slots' AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn::text || ' CASCADE';
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_cpf TEXT DEFAULT NULL,
    p_session_ids UUID[] DEFAULT '{}',
    p_registration_type TEXT DEFAULT 'standard',
    p_paid_amount NUMERIC DEFAULT 0,
    p_payment_status TEXT DEFAULT 'pending',
    p_status TEXT DEFAULT 'pending',
    p_event_name TEXT DEFAULT NULL,
    p_night_lectures BOOLEAN DEFAULT FALSE,
    p_activity_type TEXT DEFAULT NULL,
    p_activity_room TEXT DEFAULT NULL,
    p_activity_schedule TEXT DEFAULT NULL,
    p_activity_level TEXT DEFAULT NULL,
    p_referral_type TEXT DEFAULT 'nenhum',
    p_referral_name TEXT DEFAULT NULL,
    p_social_code TEXT DEFAULT NULL,
    p_lecture_code TEXT DEFAULT NULL,
    p_extra_data JSONB DEFAULT '{}'::JSONB,
    p_batch_id UUID DEFAULT NULL,
    p_company_voucher TEXT DEFAULT NULL,
    p_app_installed BOOLEAN DEFAULT FALSE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_insc_id UUID;
    v_sess RECORD;
    v_full_sess TEXT[] := '{}';
    v_sess_id UUID;
    v_coupon RECORD;
    v_base_price NUMERIC;
    v_expected_max NUMERIC;
    v_session_ids UUID[];
BEGIN
    -- Cleanup IDs
    v_session_ids := COALESCE(p_session_ids, ARRAY[]::UUID[]);

    -- 1. VALIDATE COUPON (If provided)
    IF p_social_code IS NOT NULL THEN
        SELECT * INTO v_coupon
        FROM public.social_partnership_coupons
        WHERE project_id = p_project_id
          AND upper(trim(code)) = upper(trim(p_social_code))
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom inválido para este evento.');
        END IF;

        IF NOT COALESCE(v_coupon.is_active, false) THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom inativo.');
        END IF;

        IF v_coupon.end_date IS NOT NULL AND v_coupon.end_date < NOW() THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom expirado.');
        END IF;

        IF v_coupon.usage_limit IS NOT NULL AND COALESCE(v_coupon.current_usage, 0) >= v_coupon.usage_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Limite de uso do cupom atingido.');
        END IF;
    END IF;

    -- 2. VALIDATE SESSIONS SLOTS
    IF array_length(v_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY v_session_ids LOOP
            SELECT id, title, max_slots, registered_count INTO v_sess
            FROM public.event_schedule
            WHERE id = v_sess_id
            FOR UPDATE;
            
            IF FOUND AND v_sess.max_slots > 0 AND COALESCE(v_sess.registered_count, 0) >= v_sess.max_slots THEN
                v_full_sess := array_append(v_full_sess, v_sess.title);
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_FULL', 'message', 'Vagas esgotadas: ' || array_to_string(v_full_sess, ', '));
    END IF;

    -- 3. PERFORM REGISTRATION
    INSERT INTO public.growth_experience_registrations (
        project_id, user_id, name, email, phone, cpf, selected_courses,
        registration_type, paid_amount, payment_status, status, event_name,
        palestras_noturnas, selected_activity_type, activity_room, 
        activity_schedule, activity_level, referral_type, referral_name,
        social_code, lecture_code, extra_data, batch_id, voucher_code, app_instalado, created_at
    ) VALUES (
        p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, v_session_ids,
        p_registration_type, p_paid_amount, p_payment_status, p_status, p_event_name,
        p_night_lectures, p_activity_type, p_activity_room, p_activity_schedule,
        p_activity_level, p_referral_type, p_referral_name,
        p_social_code, p_lecture_code, p_extra_data, p_batch_id, p_company_voucher, p_app_installed, NOW()
    ) RETURNING id INTO v_insc_id;

    -- 4. UPDATE SESSION COUNTS
    IF array_length(v_session_ids, 1) > 0 THEN
        UPDATE public.event_schedule
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(v_session_ids);
    END IF;

    RETURN jsonb_build_object('success', true, 'registration_id', v_insc_id);
END;
$$;

-- 4. RECREATE RPC: aplicar_voucher_empresa (ENGLISH)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(p_registration_id UUID, p_voucher_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_batch_id UUID;
    v_slots INTEGER;
    v_used INTEGER;
    v_status TEXT;
BEGIN
    SELECT id, total_slots, used_slots, payment_status
    INTO v_batch_id, v_slots, v_used, v_status
    FROM public.company_registration_batches
    WHERE upper(trim(voucher_code)) = upper(trim(p_voucher_code))
    FOR UPDATE;

    IF v_batch_id IS NULL THEN
        RAISE EXCEPTION 'Voucher corporativo não encontrado.';
    END IF;

    IF v_status != 'paid' AND v_status != 'pago' THEN
        RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com a empresa.';
    END IF;

    IF v_used >= v_slots THEN
        RAISE EXCEPTION 'Este voucher já atingiu o limite máximo de vagas do lote.';
    END IF;

    UPDATE public.growth_experience_registrations
    SET batch_id = v_batch_id,
        voucher_code = p_voucher_code,
        palestras_noturnas = true,
        payment_status = 'paid',
        status = 'active',
        paid_amount = 0,
        updated_at = NOW()
    WHERE id = p_registration_id;

    RETURN TRUE;
END;
$$;

-- 5. REINITIALIZE TRIGGERS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trig_sync_registration_usage ON public.growth_experience_registrations;
CREATE TRIGGER trig_sync_registration_usage
AFTER INSERT OR UPDATE OF payment_status, status ON public.growth_experience_registrations
FOR EACH ROW EXECUTE FUNCTION public.handle_registration_usage();

-- 6. PERMISSIONS
-- ----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT, BOOLEAN) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aplicar_voucher_empresa(UUID, TEXT) TO anon, authenticated, service_role;

-- 7. REFRESH CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Final Triunfo Integration & English Standardization applied successfully.'; END $$;
