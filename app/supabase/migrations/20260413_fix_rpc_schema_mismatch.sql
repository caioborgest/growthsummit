-- ============================================================================
-- FIX RPC SCHEMA MISMATCH - Growth Experience 2026
-- Date: 2026-04-13
-- Objective: Update RPCs to match the English schema (renamed tables/columns)
-- ============================================================================

-- 1. DROP FUNCTIONS TO AVOID OVERLOADING ISSUES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS fn
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname IN ('register_participant_with_slots', 'aplicar_voucher_empresa', 'check_in_registration_atomic', 'get_parceiro_equipe_usage', 'register_parceiro_equipe_member', 'handle_registration_usage', 'validate_registration_data', 'handle_new_user')
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn::text || ' CASCADE';
    END LOOP;
END;
$$;

-- 2. RECREATE validate_registration_data
CREATE OR REPLACE FUNCTION public.validate_registration_data(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(trim(COALESCE(p_name, ''))) < 3 THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Full name is required (min 3 chars).');
    END IF;
    IF p_email IS NULL OR trim(p_email) NOT LIKE '%@%' THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Invalid email address.');
    END IF;
    IF length(regexp_replace(trim(COALESCE(p_phone, '')), '\D', '', 'g')) < 10 THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Invalid phone number (min 10 digits).');
    END IF;
    RETURN jsonb_build_object('valid', true);
END;
$$;

-- 3. RECREATE register_participant_with_slots
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_cpf TEXT DEFAULT NULL,
    p_session_ids UUID[] DEFAULT '{}',
    p_tipo_inscricao TEXT DEFAULT 'standard',
    p_valor_pago NUMERIC DEFAULT 0,
    p_status_pagamento TEXT DEFAULT 'pendente',
    p_status TEXT DEFAULT 'pendente',
    p_evento TEXT DEFAULT NULL,
    p_palestras_noturnas BOOLEAN DEFAULT FALSE,
    p_tipo_atividade TEXT DEFAULT NULL,
    p_sala_atividade TEXT DEFAULT NULL,
    p_horario_atividade TEXT DEFAULT NULL,
    p_nivel_atividade TEXT DEFAULT NULL,
    p_indicacao_tipo TEXT DEFAULT 'nenhum',
    p_indicacao_nome TEXT DEFAULT NULL,
    p_codigo_social TEXT DEFAULT NULL,
    p_codigo_palestra TEXT DEFAULT NULL,
    p_extra_data JSONB DEFAULT '{}'::JSONB,
    p_lote_id UUID DEFAULT NULL,
    p_voucher_empresa TEXT DEFAULT NULL
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
    v_cupom_code TEXT;
    v_cupom RECORD;
    v_base_price NUMERIC;
    v_expected_max NUMERIC;
    v_session_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    -- Normalize session IDs
    SELECT COALESCE(array_agg(z::uuid), ARRAY[]::uuid[])
    INTO v_session_ids
    FROM unnest(COALESCE(p_session_ids, ARRAY[]::uuid[])) AS z
    WHERE z IS NOT NULL;

    v_cupom_code := NULLIF(trim(COALESCE(p_codigo_palestra, '')), '');
    IF v_cupom_code IS NULL THEN
        v_cupom_code := NULLIF(trim(COALESCE(p_codigo_social, '')), '');
    END IF;

    -- Validate Coupon (Social/Partnership)
    IF v_cupom_code IS NOT NULL THEN
        SELECT *
        INTO v_cupom
        FROM public.social_partnership_coupons
        WHERE project_id = p_project_id
          AND upper(trim(code)) = upper(trim(v_cupom_code))
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Coupon not found or invalid for this event.');
        END IF;

        IF COALESCE(v_cupom.is_active, false) = false THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Coupon is inactive.');
        END IF;

        IF v_cupom.end_date IS NOT NULL AND v_cupom.end_date < NOW() THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Coupon expired.');
        END IF;

        IF v_cupom.usage_limit IS NOT NULL AND COALESCE(v_cupom.current_usage, 0) >= v_cupom.usage_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Coupon limit reached.');
        END IF;
    END IF;

    -- Check Session Availability
    IF array_length(v_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY v_session_ids LOOP
            SELECT id, title, max_vagas, registered_count INTO v_sess
            FROM public.event_schedule
            WHERE id = v_sess_id
            FOR UPDATE;
            
            IF FOUND AND v_sess.max_vagas IS NOT NULL AND v_sess.max_vagas > 0 THEN
                IF COALESCE(v_sess.registered_count, 0) >= v_sess.max_vagas THEN
                    v_full_sess := array_append(v_full_sess, v_sess.title);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_FULL', 'message', 'Sessions full: ' || array_to_string(v_full_sess, ', '));
    END IF;

    -- Insert Registration
    INSERT INTO public.growth_experience_registrations (
        project_id, user_id, name, email, phone, cpf, cursos_selecionados,
        registration_type, paid_amount, payment_status, status, evento,
        palestras_noturnas, indicacao_tipo, indicacao_nome,
        codigo_social, codigo_palestra, cupom_palestra, extra_data, lote_id, voucher_empresa, created_at
    ) VALUES (
        p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, v_session_ids,
        p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status, p_evento,
        p_palestras_noturnas, p_indicacao_tipo, p_indicacao_nome,
        p_codigo_social, p_codigo_palestra, COALESCE(p_codigo_palestra, p_codigo_social),
        p_extra_data, p_lote_id, p_voucher_empresa, NOW()
    )
    RETURNING id INTO v_insc_id;

    -- Generate QR Code
    UPDATE public.growth_experience_registrations
    SET qr_code = 'GS_EVENT:' || encode(
        convert_to(
            json_build_object(
                'type', 'registration',
                'projectId', p_project_id::text,
                'id', v_insc_id::text,
                'timestamp', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
            )::text,
            'UTF8'
        ),
        'base64'
    )
    WHERE id = v_insc_id;

    -- Increment Session Counts
    IF array_length(v_session_ids, 1) > 0 THEN
        UPDATE public.event_schedule
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(v_session_ids);
    END IF;

    RETURN jsonb_build_object('success', true, 'registration_id', v_insc_id);
END;
$$;

-- 4. RECREATE aplicar_voucher_empresa
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(p_registration_id UUID, p_voucher_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lote_id UUID;
    v_vagas INTEGER;
    v_utilizadas INTEGER;
    v_status TEXT;
    v_rows INTEGER;
BEGIN
    SELECT id, vacancy_count, used_vacancies, payment_status
    INTO v_lote_id, v_vagas, v_utilizadas, v_status
    FROM public.company_registration_batches
    WHERE upper(trim(voucher_code)) = upper(trim(p_voucher_code))
    FOR UPDATE;

    IF v_lote_id IS NULL THEN
        RAISE EXCEPTION 'Corporate voucher not found.';
    END IF;

    IF v_status != 'paid' THEN
        RAISE EXCEPTION 'Batch payment pending. Please contact your company.';
    END IF;

    IF v_utilizadas >= v_vagas THEN
        RAISE EXCEPTION 'This voucher has reached its usage limit.';
    END IF;

    UPDATE public.growth_experience_registrations
    SET lote_id = v_lote_id,
        voucher_empresa = p_voucher_code,
        palestras_noturnas = true,
        payment_status = 'paid',
        status = 'active',
        paid_amount = 0,
        cupom_palestra = p_voucher_code,
        valor_desconto_palestra = 179.99,
        updated_at = NOW()
    WHERE id = p_registration_id;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
        RAISE EXCEPTION 'Registration not found.';
    END IF;

    RETURN TRUE;
END;
$$;

-- 5. RECREATE handle_registration_usage
CREATE OR REPLACE FUNCTION public.handle_registration_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (NEW.payment_status = 'paid') AND (OLD IS NULL OR OLD.payment_status IS DISTINCT FROM 'paid') THEN
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.social_partnership_coupons
            SET current_usage = COALESCE(current_usage, 0) + 1
            WHERE code = NEW.codigo_social;
        END IF;
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.company_registration_batches
            SET used_vacancies = COALESCE(used_vacancies, 0) + 1
            WHERE id = NEW.lote_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' AND NEW.payment_status IS DISTINCT FROM 'paid') THEN
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.social_partnership_coupons
            SET current_usage = GREATEST(0, COALESCE(current_usage, 0) - 1)
            WHERE code = NEW.codigo_social;
        END IF;
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.company_registration_batches
            SET used_vacancies = GREATEST(0, COALESCE(used_vacancies, 0) - 1)
            WHERE id = NEW.lote_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- 6. RECREATE check_in_registration_atomic
CREATE OR REPLACE FUNCTION public.check_in_registration_atomic(
    p_registration_id UUID,
    p_project_id UUID,
    p_user_id UUID,
    p_ticket_number TEXT,
    p_operator_id UUID,
    p_location TEXT DEFAULT 'Entrada Principal',
    p_method TEXT DEFAULT 'qr_code'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INTEGER;
    v_checked BOOLEAN;
BEGIN
    SELECT checked_in INTO v_checked
    FROM public.growth_experience_registrations
    WHERE id = p_registration_id AND project_id = p_project_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
    END IF;

    IF COALESCE(v_checked, false) THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_CHECKED_IN');
    END IF;

    UPDATE public.growth_experience_registrations
    SET checked_in = TRUE,
        check_in_at = NOW()
    WHERE id = p_registration_id
      AND project_id = p_project_id
      AND COALESCE(checked_in, false) = false;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_CHECKED_IN');
    END IF;

    INSERT INTO public.check_ins (
        project_id, registration_id, user_id, ticket_number, timestamp, location, method, operator_id
    ) VALUES (
        p_project_id, p_registration_id, p_user_id, p_ticket_number, NOW(), COALESCE(p_location, 'Entrada Principal'), COALESCE(p_method, 'qr_code'), p_operator_id
    );

    RETURN jsonb_build_object('success', true, 'registration_id', p_registration_id);
END;
$$;

-- 7. RECREATE register_parceiro_equipe_member
CREATE OR REPLACE FUNCTION public.register_parceiro_equipe_member(
    p_partner_id UUID,
    p_partner_access_code TEXT,
    p_project_id UUID,
    p_user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_cpf TEXT,
    p_qr_code TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_partner RECORD;
    v_count INTEGER;
    v_max INTEGER;
BEGIN
    SELECT * INTO v_partner
    FROM public.partners
    WHERE id = p_partner_id AND project_id = p_project_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'PARTNER_NOT_FOUND');
    END IF;

    IF v_partner.access_code IS NOT NULL THEN
        IF p_partner_access_code IS NULL OR trim(p_partner_access_code) <> trim(v_partner.access_code) THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_ACCESS_CODE');
        END IF;
    END IF;

    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.partner_team
    WHERE partner_id = p_partner_id AND project_id = p_project_id;

    v_max := COALESCE(v_partner.max_team_members, 10);
    IF v_count >= v_max THEN
        RETURN jsonb_build_object('success', false, 'error', 'TEAM_FULL');
    END IF;

    INSERT INTO public.partner_team (
        partner_id, project_id, user_id, name, email, phone, cpf, role, qr_code
    ) VALUES (
        p_partner_id, p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, 'Integrante', p_qr_code
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 8. RECREATE get_parceiro_equipe_usage
CREATE OR REPLACE FUNCTION public.get_parceiro_equipe_usage(p_partner_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
    v_max INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO v_count
    FROM public.partner_team
    WHERE partner_id = p_partner_id;

    SELECT COALESCE(max_team_members, 10) INTO v_max
    FROM public.partners
    WHERE id = p_partner_id;

    RETURN jsonb_build_object(
        'member_count', COALESCE(v_count, 0),
        'max_members', COALESCE(v_max, 10)
    );
END;
$$;

-- 9. RECREATE handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'name', 'User'), 
        COALESCE(new.raw_user_meta_data->>'role', 'participant')
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email, 
        name = COALESCE(EXCLUDED.name, public.users.name);

    INSERT INTO public.profiles (user_id) 
    VALUES (new.id) 
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$;

-- 10. PERMISSIONS AND GRANTS
GRANT EXECUTE ON FUNCTION public.validate_registration_data(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aplicar_voucher_empresa(UUID, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_in_registration_atomic(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_parceiro_equipe_member(UUID, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_parceiro_equipe_usage(UUID) TO anon, authenticated, service_role;

-- 11. RE-ENABLE TRIGGERS
DROP TRIGGER IF EXISTS trig_handle_registration_usage ON public.growth_experience_registrations;
CREATE TRIGGER trig_handle_registration_usage
    AFTER INSERT OR UPDATE OF payment_status ON public.growth_experience_registrations
    FOR EACH ROW EXECUTE FUNCTION public.handle_registration_usage();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
    AFTER INSERT ON auth.users 
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. DATA REMEDIATION
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE id IN (
    SELECT user_id 
    FROM public.growth_experience_registrations 
    WHERE user_id IS NOT NULL
) AND email_confirmed_at IS NULL;

-- 13. RELOAD POSTGREST
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Registration RPCs and User Sync updated to English schema.'; END $$;
