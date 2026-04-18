-- ============================================================================
-- GROWTH SUMMIT 2026 - REGISTRATION DATA ALIGNMENT (V3 - ROBUST)
-- ============================================================================

-- 1. ALIGN TABLE COLUMNS
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='growth_experience_registrations' AND column_name='empresa') THEN
        ALTER TABLE public.growth_experience_registrations ADD COLUMN empresa TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='growth_experience_registrations' AND column_name='coupon_code') THEN
        ALTER TABLE public.growth_experience_registrations ADD COLUMN coupon_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='growth_experience_registrations' AND column_name='payment_method') THEN
        ALTER TABLE public.growth_experience_registrations ADD COLUMN payment_method TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='growth_experience_registrations' AND column_name='payment_date') THEN
        ALTER TABLE public.growth_experience_registrations ADD COLUMN payment_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='growth_experience_registrations' AND column_name='paid_amount') THEN
        ALTER TABLE public.growth_experience_registrations ADD COLUMN paid_amount NUMERIC DEFAULT 0;
    END IF;
END $$;


-- 2. UPDATE RPC WITH ROBUST VARIABLE HANDLING
-- ----------------------------------------------------------------------------
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
    p_app_installed BOOLEAN DEFAULT FALSE,
    p_empresa TEXT DEFAULT NULL,
    p_coupon_code TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_insc_id UUID;
    v_sess_title TEXT;
    v_sess_max INT;
    v_sess_curr INT;
    v_full_sess TEXT[] := '{}';
    v_sess_id UUID;
    v_coupon_active BOOLEAN;
    v_coupon_end_date TIMESTAMPTZ;
    v_coupon_limit INT;
    v_coupon_usage INT;
    v_coupon_id UUID;
    v_session_ids UUID[];
    v_final_coupon TEXT;
BEGIN
    v_session_ids := COALESCE(p_session_ids, ARRAY[]::UUID[]);
    v_final_coupon := NULLIF(trim(COALESCE(p_coupon_code, p_social_code, p_lecture_code)), '');

    -- 1. VALIDATE COUPON
    IF v_final_coupon IS NOT NULL THEN
        SELECT id, is_active, end_date, usage_limit, current_usage 
        INTO v_coupon_id, v_coupon_active, v_coupon_end_date, v_coupon_limit, v_coupon_usage
        FROM public.social_partnership_coupons
        WHERE project_id = p_project_id
          AND upper(trim(code)) = upper(trim(v_final_coupon))
        LIMIT 1;

        IF v_coupon_id IS NOT NULL THEN
            IF NOT COALESCE(v_coupon_active, false) THEN
                RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom inativo.');
            END IF;
            IF v_coupon_end_date IS NOT NULL AND v_coupon_end_date < NOW() THEN
                RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom expirado.');
            END IF;
            IF v_coupon_limit IS NOT NULL AND COALESCE(v_coupon_usage, 0) >= v_coupon_limit THEN
                RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Limite de uso atingido.');
            END IF;
        END IF;
    END IF;

    -- 2. VALIDATE SESSIONS SLOTS
    IF array_length(v_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY v_session_ids LOOP
            SELECT title, max_slots, registered_count 
            INTO v_sess_title, v_sess_max, v_sess_curr
            FROM public.event_schedule
            WHERE id = v_sess_id;
            
            IF FOUND AND v_sess_max > 0 AND COALESCE(v_sess_curr, 0) >= v_sess_max THEN
                v_full_sess := array_append(v_full_sess, v_sess_title);
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_FULL', 'message', 'Esgotado: ' || array_to_string(v_full_sess, ', '));
    END IF;

    -- 3. PERFORM REGISTRATION
    INSERT INTO public.growth_experience_registrations (
        project_id, user_id, name, email, phone, cpf, selected_courses,
        registration_type, paid_amount, payment_status, status, event_name,
        palestras_noturnas, selected_activity_type, activity_room, 
        activity_schedule, activity_level, referral_type, referral_name,
        social_code, lecture_code, extra_data, batch_id, voucher_code, app_instalado,
        empresa, coupon_code, created_at
    ) VALUES (
        p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, v_session_ids,
        p_registration_type, p_paid_amount, p_payment_status, p_status, p_event_name,
        p_night_lectures, p_activity_type, p_activity_room, p_activity_schedule,
        p_activity_level, p_referral_type, p_referral_name,
        p_social_code, p_lecture_code, p_extra_data, p_batch_id, p_company_voucher, p_app_installed,
        p_empresa, p_coupon_code, NOW()
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

GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT, BOOLEAN, TEXT, TEXT) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
