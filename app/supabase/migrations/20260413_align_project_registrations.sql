-- ============================================================================
-- MIGRATION: 20260413_fix_rpc_schema_final.sql
-- Growth Experience 2026 — Triunfo Pocket Edition (Noturno)
-- Project ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- Date: 2026-04-13
-- Fixes:
--   1. RPCs aligned to English schema (growth_experience_registrations)
--   2. handle_new_user inserts role into profiles (not only users)
--   3. status/payment_status values normalized to English
--   4. used_slots column (not used_vacancies) for company_registration_batches
--   5. Admin policy uses profiles table (not users)
--   6. Data remediation for existing registrations
-- ============================================================================
-- ============================================================================
-- STEP 1: DROP EXISTING FUNCTIONS (avoid overload conflicts)
-- ============================================================================
DO $$
DECLARE r RECORD;
BEGIN FOR r IN
SELECT p.oid::regprocedure AS fn
FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN (
        'register_participant_with_slots',
        'aplicar_voucher_empresa',
        'check_in_registration_atomic',
        'get_parceiro_equipe_usage',
        'register_parceiro_equipe_member',
        'handle_registration_usage',
        'validate_registration_data',
        'handle_new_user'
    )
    AND n.nspname = 'public' LOOP EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn::text || ' CASCADE';
END LOOP;
END;
$$;
-- ============================================================================
-- STEP 2: validate_registration_data
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_registration_data(p_name TEXT, p_email TEXT, p_phone TEXT) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN IF length(trim(COALESCE(p_name, ''))) < 3 THEN RETURN jsonb_build_object(
        'valid',
        false,
        'error_message',
        'Nome completo obrigatório (mín. 3 caracteres).'
    );
END IF;
IF p_email IS NULL
OR trim(p_email) NOT LIKE '%@%' THEN RETURN jsonb_build_object(
    'valid',
    false,
    'error_message',
    'E-mail inválido.'
);
END IF;
IF length(
    regexp_replace(trim(COALESCE(p_phone, '')), '\D', '', 'g')
) < 10 THEN RETURN jsonb_build_object(
    'valid',
    false,
    'error_message',
    'Telefone inválido (mín. 10 dígitos).'
);
END IF;
RETURN jsonb_build_object('valid', true);
END;
$$;
-- ============================================================================
-- STEP 3: register_participant_with_slots
-- ============================================================================
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
        p_project_id UUID,
        p_user_id UUID,
        p_name TEXT,
        p_email TEXT,
        p_phone TEXT,
        p_cpf TEXT DEFAULT NULL,
        p_session_ids UUID [] DEFAULT '{}',
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
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_insc_id UUID;
v_sess RECORD;
v_full_sess TEXT [] := '{}';
v_sess_id UUID;
v_coupon RECORD;
v_batch RECORD;
v_coupon_code TEXT;
v_session_ids UUID [] := ARRAY []::UUID [];
BEGIN -- Normalize session IDs
SELECT COALESCE(array_agg(z::uuid), ARRAY []::uuid []) INTO v_session_ids
FROM unnest(COALESCE(p_session_ids, ARRAY []::uuid [])) AS z
WHERE z IS NOT NULL;
-- Resolve coupon code (lecture_code takes priority over social_code)
v_coupon_code := NULLIF(trim(COALESCE(p_lecture_code, '')), '');
IF v_coupon_code IS NULL THEN v_coupon_code := NULLIF(trim(COALESCE(p_social_code, '')), '');
END IF;
-- ── VALIDATE CORPORATE BATCH ────────────────────────────────────────────
IF p_batch_id IS NOT NULL THEN
SELECT * INTO v_batch
FROM public.company_registration_batches
WHERE id = p_batch_id FOR
UPDATE;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_FOUND',
    'message',
    'Lote corporativo não encontrado.'
);
END IF;
IF NOT COALESCE(v_batch.is_active, false) THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_INACTIVE',
    'message',
    'Lote corporativo inativo.'
);
END IF;
IF v_batch.payment_status <> 'paid' THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_PAID',
    'message',
    'Pagamento do lote ainda não confirmado.'
);
END IF;
IF COALESCE(v_batch.used_slots, 0) >= v_batch.total_slots THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_FULL',
    'message',
    'Todas as vagas deste lote já foram utilizadas.'
);
END IF;
END IF;
-- ── VALIDATE SOCIAL/PARTNERSHIP COUPON ──────────────────────────────────
IF v_coupon_code IS NOT NULL THEN
SELECT * INTO v_coupon
FROM public.social_partnership_coupons
WHERE project_id = p_project_id
    AND upper(trim(code)) = upper(trim(v_coupon_code)) FOR
UPDATE;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INVALID_COUPON',
    'message',
    'Cupom inválido para este evento.'
);
END IF;
IF NOT COALESCE(v_coupon.is_active, false) THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INVALID_COUPON',
    'message',
    'Cupom inativo.'
);
END IF;
IF v_coupon.end_date IS NOT NULL
AND v_coupon.end_date < NOW() THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INVALID_COUPON',
    'message',
    'Cupom expirado.'
);
END IF;
IF v_coupon.usage_limit IS NOT NULL
AND COALESCE(v_coupon.current_usage, 0) >= v_coupon.usage_limit THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INVALID_COUPON',
    'message',
    'Limite de uso do cupom atingido.'
);
END IF;
END IF;
-- ── VALIDATE SESSION SLOTS ───────────────────────────────────────────────
IF array_length(v_session_ids, 1) > 0 THEN FOREACH v_sess_id IN ARRAY v_session_ids LOOP
SELECT id,
    title,
    max_slots,
    registered_count INTO v_sess
FROM public.event_schedule
WHERE id = v_sess_id FOR
UPDATE;
IF FOUND
AND COALESCE(v_sess.max_slots, 0) > 0
AND COALESCE(v_sess.registered_count, 0) >= v_sess.max_slots THEN v_full_sess := array_append(v_full_sess, v_sess.title);
END IF;
END LOOP;
END IF;
IF array_length(v_full_sess, 1) > 0 THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'SESSION_FULL',
    'message',
    'Sessões sem vagas: ' || array_to_string(v_full_sess, ', ')
);
END IF;
-- ── INSERT REGISTRATION ──────────────────────────────────────────────────
INSERT INTO public.growth_experience_registrations (
        project_id,
        user_id,
        name,
        email,
        phone,
        cpf,
        cursos_selecionados,
        registration_type,
        paid_amount,
        payment_status,
        status,
        evento,
        palestras_noturnas,
        indicacao_tipo,
        indicacao_nome,
        codigo_social,
        codigo_palestra,
        extra_data,
        lote_id,
        voucher_empresa,
        app_instalado,
        created_at
    )
VALUES (
        p_project_id,
        p_user_id,
        p_name,
        p_email,
        p_phone,
        p_cpf,
        v_session_ids,
        p_registration_type,
        p_paid_amount,
        p_payment_status,
        p_status,
        p_event_name,
        p_night_lectures,
        p_referral_type,
        p_referral_name,
        p_social_code,
        p_lecture_code,
        p_extra_data,
        p_batch_id,
        p_company_voucher,
        p_app_installed,
        NOW()
    )
RETURNING id INTO v_insc_id;
-- ── GENERATE QR CODE ─────────────────────────────────────────────────────
UPDATE public.growth_experience_registrations
SET qr_code = 'GS_EVENT:' || encode(
        convert_to(
            json_build_object(
                'type',
                'registration',
                'projectId',
                p_project_id::text,
                'id',
                v_insc_id::text,
                'timestamp',
                to_char(
                    NOW() AT TIME ZONE 'UTC',
                    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                )
            )::text,
            'UTF8'
        ),
        'base64'
    )
WHERE id = v_insc_id;
-- ── INCREMENT SESSION COUNTS ─────────────────────────────────────────────
IF array_length(v_session_ids, 1) > 0 THEN
UPDATE public.event_schedule
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = ANY(v_session_ids);
END IF;
-- ── INCREMENT BATCH used_slots ───────────────────────────────────────────
IF p_batch_id IS NOT NULL THEN
UPDATE public.company_registration_batches
SET used_slots = COALESCE(used_slots, 0) + 1
WHERE id = p_batch_id;
END IF;
-- ── INCREMENT COUPON current_usage ───────────────────────────────────────
IF v_coupon_code IS NOT NULL THEN
UPDATE public.social_partnership_coupons
SET current_usage = COALESCE(current_usage, 0) + 1
WHERE project_id = p_project_id
    AND upper(trim(code)) = upper(trim(v_coupon_code));
END IF;
RETURN jsonb_build_object('success', true, 'registration_id', v_insc_id);
END;
$$;
-- ============================================================================
-- STEP 4: aplicar_voucher_empresa
-- ============================================================================
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(
        p_registration_id UUID,
        p_voucher_code TEXT
    ) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_batch RECORD;
v_rows INTEGER;
BEGIN
SELECT * INTO v_batch
FROM public.company_registration_batches
WHERE upper(trim(voucher_code)) = upper(trim(p_voucher_code)) FOR
UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Voucher corporativo não encontrado.';
END IF;
IF v_batch.payment_status <> 'paid' THEN RAISE EXCEPTION 'Pagamento do lote pendente.';
END IF;
IF COALESCE(v_batch.used_slots, 0) >= v_batch.total_slots THEN RAISE EXCEPTION 'Limite de vagas do voucher atingido.';
END IF;
UPDATE public.growth_experience_registrations
SET lote_id = v_batch.id,
    voucher_empresa = p_voucher_code,
    palestras_noturnas = true,
    payment_status = 'paid',
    status = 'active',
    paid_amount = 0,
    updated_at = NOW()
WHERE id = p_registration_id;
GET DIAGNOSTICS v_rows = ROW_COUNT;
IF v_rows = 0 THEN RAISE EXCEPTION 'Inscrição não encontrada.';
END IF;
UPDATE public.company_registration_batches
SET used_slots = COALESCE(used_slots, 0) + 1
WHERE id = v_batch.id;
RETURN TRUE;
END;
$$;
-- ============================================================================
-- STEP 5: handle_registration_usage (trigger — uses used_slots)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_registration_usage() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN -- On payment confirmed
    IF (NEW.payment_status = 'paid')
    AND (
        OLD IS NULL
        OR OLD.payment_status IS DISTINCT
        FROM 'paid'
    ) THEN IF NEW.codigo_social IS NOT NULL THEN
UPDATE public.social_partnership_coupons
SET current_usage = COALESCE(current_usage, 0) + 1
WHERE code = NEW.codigo_social;
END IF;
IF NEW.lote_id IS NOT NULL THEN
UPDATE public.company_registration_batches
SET used_slots = COALESCE(used_slots, 0) + 1 -- ← used_slots (not used_vacancies)
WHERE id = NEW.lote_id;
END IF;
-- On payment reversed
ELSIF TG_OP = 'UPDATE'
AND OLD.payment_status = 'paid'
AND NEW.payment_status IS DISTINCT
FROM 'paid' THEN IF NEW.codigo_social IS NOT NULL THEN
UPDATE public.social_partnership_coupons
SET current_usage = GREATEST(0, COALESCE(current_usage, 0) - 1)
WHERE code = NEW.codigo_social;
END IF;
IF NEW.lote_id IS NOT NULL THEN
UPDATE public.company_registration_batches
SET used_slots = GREATEST(0, COALESCE(used_slots, 0) - 1)
WHERE id = NEW.lote_id;
END IF;
END IF;
RETURN NEW;
END;
$$;
-- ============================================================================
-- STEP 6: check_in_registration_atomic
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_in_registration_atomic(
        p_registration_id UUID,
        p_project_id UUID,
        p_user_id UUID,
        p_ticket_number TEXT,
        p_operator_id UUID,
        p_location TEXT DEFAULT 'Entrada Principal',
        p_method TEXT DEFAULT 'qr_code'
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_reg RECORD;
v_updated INTEGER;
BEGIN
SELECT * INTO v_reg
FROM public.growth_experience_registrations
WHERE id = p_registration_id
    AND project_id = p_project_id;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'NOT_FOUND',
    'message',
    'Inscrição não encontrada.'
);
END IF;
IF COALESCE(v_reg.checked_in, false) THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'ALREADY_CHECKED_IN',
    'message',
    'Check-in já realizado.',
    'name',
    v_reg.name,
    'email',
    v_reg.email
);
END IF;
IF v_reg.status NOT IN ('active', 'paid') THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'INVALID_STATUS',
    'message',
    'Inscrição não está ativa.'
);
END IF;
UPDATE public.growth_experience_registrations
SET checked_in = TRUE,
    check_in_at = NOW(),
    checked_in_by = p_operator_id
WHERE id = p_registration_id
    AND project_id = p_project_id
    AND COALESCE(checked_in, false) = FALSE;
GET DIAGNOSTICS v_updated = ROW_COUNT;
IF v_updated = 0 THEN RETURN jsonb_build_object('success', false, 'error', 'ALREADY_CHECKED_IN');
END IF;
INSERT INTO public.check_ins (
        project_id,
        registration_id,
        user_id,
        ticket_number,
        timestamp,
        location,
        method,
        operator_id
    )
VALUES (
        p_project_id,
        p_registration_id,
        p_user_id,
        p_ticket_number,
        NOW(),
        COALESCE(p_location, 'Entrada Principal'),
        COALESCE(p_method, 'qr_code'),
        p_operator_id
    );
RETURN jsonb_build_object(
    'success',
    true,
    'registration_id',
    p_registration_id,
    'name',
    v_reg.name,
    'email',
    v_reg.email
);
END;
$$;
-- ============================================================================
-- STEP 7: register_parceiro_equipe_member
-- ============================================================================
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
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_partner RECORD;
v_count INTEGER;
BEGIN
SELECT * INTO v_partner
FROM public.partners
WHERE id = p_partner_id
    AND project_id = p_project_id FOR
UPDATE;
IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'PARTNER_NOT_FOUND');
END IF;
IF v_partner.access_code IS NOT NULL
AND (
    p_partner_access_code IS NULL
    OR trim(p_partner_access_code) <> trim(v_partner.access_code)
) THEN RETURN jsonb_build_object('success', false, 'error', 'INVALID_ACCESS_CODE');
END IF;
SELECT COUNT(*)::INTEGER INTO v_count
FROM public.partner_team
WHERE partner_id = p_partner_id
    AND project_id = p_project_id;
IF v_count >= COALESCE(v_partner.max_team_members, 10) THEN RETURN jsonb_build_object('success', false, 'error', 'TEAM_FULL');
END IF;
INSERT INTO public.partner_team (
        partner_id,
        project_id,
        user_id,
        name,
        email,
        phone,
        cpf,
        role,
        qr_code
    )
VALUES (
        p_partner_id,
        p_project_id,
        p_user_id,
        p_name,
        p_email,
        p_phone,
        p_cpf,
        'Integrante',
        p_qr_code
    );
RETURN jsonb_build_object('success', true);
END;
$$;
-- ============================================================================
-- STEP 8: get_parceiro_equipe_usage
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_parceiro_equipe_usage(p_partner_id UUID) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_count INTEGER;
v_max INTEGER;
BEGIN
SELECT COUNT(*)::INTEGER INTO v_count
FROM public.partner_team
WHERE partner_id = p_partner_id;
SELECT COALESCE(max_team_members, 10) INTO v_max
FROM public.partners
WHERE id = p_partner_id;
RETURN jsonb_build_object(
    'member_count',
    COALESCE(v_count, 0),
    'max_members',
    COALESCE(v_max, 10)
);
END;
$$;
-- ============================================================================
-- STEP 9: handle_new_user — inserts role into PROFILES (not only users)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN -- Upsert profiles (primary auth table for RLS checks)
INSERT INTO public.profiles (
        id,
        user_id,
        email,
        name,
        role,
        created_at,
        updated_at
    )
VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            'Usuário'
        ),
        COALESCE(NEW.raw_user_meta_data->>'role', 'participant'),
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();
RETURN NEW;
END;
$$;
-- ============================================================================
-- STEP 10: RECREATE RLS POLICY — admin uses profiles (not users table)
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.growth_experience_registrations;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.growth_experience_registrations;
DROP POLICY IF EXISTS "admin_all" ON public.growth_experience_registrations;
DROP POLICY IF EXISTS "anon_insert" ON public.growth_experience_registrations;
DROP POLICY IF EXISTS "anon_select" ON public.growth_experience_registrations;
-- Admin: full access (reads profiles.role)
CREATE POLICY "admin_full_access" ON public.growth_experience_registrations FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
    )
);
-- Authenticated user: view own registration
CREATE POLICY "user_view_own" ON public.growth_experience_registrations FOR
SELECT USING (auth.uid() = user_id);
-- Anon: can insert (registration form)
CREATE POLICY "anon_can_insert" ON public.growth_experience_registrations FOR
INSERT WITH CHECK (true);
-- Anon: can read (needed for RPC validation)
CREATE POLICY "anon_can_select" ON public.growth_experience_registrations FOR
SELECT USING (true);
-- ============================================================================
-- STEP 11: GRANTS
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.validate_registration_data(TEXT, TEXT, TEXT) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(
        UUID,
        UUID,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        UUID [],
        TEXT,
        NUMERIC,
        TEXT,
        TEXT,
        TEXT,
        BOOLEAN,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        JSONB,
        UUID,
        TEXT,
        BOOLEAN
    ) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.aplicar_voucher_empresa(UUID, TEXT) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.check_in_registration_atomic(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.register_parceiro_equipe_member(
        UUID,
        TEXT,
        UUID,
        UUID,
        TEXT,
        TEXT,
        TEXT,
        TEXT,
        TEXT
    ) TO anon,
    authenticated,
    service_role;
GRANT EXECUTE ON FUNCTION public.get_parceiro_equipe_usage(UUID) TO anon,
    authenticated,
    service_role;
-- ============================================================================
-- STEP 12: TRIGGERS
-- ============================================================================
DROP TRIGGER IF EXISTS trig_handle_registration_usage ON public.growth_experience_registrations;
CREATE TRIGGER trig_handle_registration_usage
AFTER
INSERT
    OR
UPDATE OF payment_status ON public.growth_experience_registrations FOR EACH ROW EXECUTE FUNCTION public.handle_registration_usage();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- ============================================================================
-- STEP 13: DATA REMEDIATION
-- ============================================================================
-- 13a. Align all registrations to the single active project
UPDATE public.growth_experience_registrations
SET project_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
WHERE project_id IS NULL
    OR project_id != 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- 13b. Normalize status values to English
UPDATE public.growth_experience_registrations
SET status = CASE
        WHEN status = 'pendente' THEN 'pending'
        WHEN status = 'ativo' THEN 'active'
        ELSE status
    END,
    payment_status = CASE
        WHEN payment_status = 'pendente' THEN 'pending'
        WHEN payment_status = 'pago' THEN 'paid'
        ELSE payment_status
    END
WHERE project_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- 13c. Confirm admin role for main admin user
UPDATE public.profiles
SET role = 'admin'
WHERE user_id = (
        SELECT id
        FROM auth.users
        WHERE email = 'caioborgest@gmail.com'
    );
-- 13d. Confirm emails for all registered participants
UPDATE auth.users
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE id IN (
        SELECT user_id
        FROM public.growth_experience_registrations
        WHERE user_id IS NOT NULL
    )
    AND email_confirmed_at IS NULL;
-- 13e. Sync used_slots with actual registrations
UPDATE public.company_registration_batches b
SET used_slots = (
        SELECT COUNT(*)
        FROM public.growth_experience_registrations r
        WHERE r.lote_id = b.id
    );
-- ============================================================================
-- STEP 14: RELOAD POSTGREST SCHEMA
-- ============================================================================
NOTIFY pgrst,
'reload schema';
DO $$ BEGIN RAISE NOTICE '✅ Migration 20260413_fix_rpc_schema_final applied successfully.';
RAISE NOTICE '   Project: Growth Experience Triunfo – Pocket Edition (Noturno)';
RAISE NOTICE '   Project ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890';
RAISE NOTICE '   Event date: 2026-04-16 at 17:00';
END $$;