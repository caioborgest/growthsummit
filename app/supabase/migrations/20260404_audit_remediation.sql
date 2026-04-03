-- ============================================================
-- AUDIT REMEDIATION — Growth Experience 2026
-- Date: 2026-04-04
-- Idempotent where possible; aligns with audit plan.
-- ============================================================

-- ── 1) validate_inscricao_dados — search_path + telefone
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.validate_inscricao_dados(
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF length(trim(COALESCE(p_nome, ''))) < 3 THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Nome completo é obrigatório.');
    END IF;
    IF p_email IS NULL OR trim(p_email) NOT LIKE '%@%' THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'E-mail inválido.');
    END IF;
    IF length(regexp_replace(trim(COALESCE(p_telefone, '')), '\D', '', 'g')) < 10 THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Telefone inválido.');
    END IF;
    RETURN jsonb_build_object('valid', true);
END;
$$;

ALTER FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- ── 2) aplicar_voucher_empresa — search_path, row check, columns sync
--    Lote increment: handled by trig_sync_registration_usage when status -> pago + lote_id set
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(p_inscricao_id UUID, p_voucher_code TEXT)
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
    SELECT id, quantidade_vagas, vagas_utilizadas, status_pagamento
    INTO v_lote_id, v_vagas, v_utilizadas, v_status
    FROM public.lotes_inscricao_empresa
    WHERE voucher_code = p_voucher_code
    FOR UPDATE;

    IF v_lote_id IS NULL THEN
        RAISE EXCEPTION 'Voucher corporativo não encontrado.';
    END IF;

    IF v_status != 'pago' THEN
        RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com a empresa.';
    END IF;

    IF v_utilizadas >= v_vagas THEN
        RAISE EXCEPTION 'Este voucher já atingiu o limite máximo de vagas do lote.';
    END IF;

    UPDATE public.inscricoes_growth_experience
    SET lote_id = v_lote_id,
        voucher_empresa = p_voucher_code,
        voucher_empresa_usado = p_voucher_code,
        palestras_noturnas = true,
        status_pagamento = 'pago',
        status = 'ativo',
        valor_pago = 0,
        cupom_palestra = p_voucher_code,
        valor_desconto_palestra = 179.99,
        updated_at = NOW(),
        paid_at = COALESCE(paid_at, NOW())
    WHERE id = p_inscricao_id;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
        RAISE EXCEPTION 'Inscrição não encontrada para aplicar o voucher.';
    END IF;

    RETURN TRUE;
END;
$$;

ALTER FUNCTION public.aplicar_voucher_empresa(UUID, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.aplicar_voucher_empresa(UUID, TEXT) TO anon, authenticated, service_role;

-- ── 3) register_participant_with_slots — coupon validation + qr_code + search_path
-- Remover TODAS as sobrecargas antes de recriar: CREATE OR REPLACE não pode alterar
-- defaults de parâmetros em relação a uma assinatura existente (erro 42P13).
-- ───────────────────────────────────────────────────────────
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS fn
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'register_participant_with_slots'
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn::text || ' CASCADE';
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT,
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
    -- Normaliza IDs de sessão: evita erro 42883 (uuid = text) com ANY/unnest e colunas legadas
    v_session_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    SELECT COALESCE(array_agg(z::uuid), ARRAY[]::uuid[])
    INTO v_session_ids
    FROM unnest(COALESCE(p_session_ids, ARRAY[]::uuid[])::text[]) AS z
    WHERE NULLIF(trim(z), '') IS NOT NULL;
    v_cupom_code := NULLIF(trim(COALESCE(p_codigo_palestra, '')), '');
    IF v_cupom_code IS NULL THEN
        v_cupom_code := NULLIF(trim(COALESCE(p_codigo_social, '')), '');
    END IF;

    IF v_cupom_code IS NOT NULL THEN
        SELECT *
        INTO v_cupom
        FROM public.cupons_parceria_social
        WHERE project_id::text = p_project_id::text
          AND upper(trim(codigo)) = upper(trim(v_cupom_code))
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'INVALID_COUPON',
                'message', 'Cupom inválido ou não pertence a este evento.'
            );
        END IF;

        IF COALESCE(v_cupom.ativo, false) = false THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom inativo.');
        END IF;

        IF v_cupom.vencimento IS NOT NULL AND v_cupom.vencimento < NOW() THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom expirado.');
        END IF;

        IF v_cupom.uso_limite IS NOT NULL AND COALESCE(v_cupom.uso_atual, 0) >= v_cupom.uso_limite THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom esgotado.');
        END IF;

        SELECT COALESCE(ticket_price_pro, ticket_price_standard, 0)::NUMERIC
        INTO v_base_price
        FROM public.projects
        WHERE id::text = p_project_id::text;

        v_expected_max := v_base_price * (1 - COALESCE(v_cupom.porcentagem_desconto, 0) / 100.0);
        IF p_valor_pago > v_expected_max + 0.02 THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'PRICE_MISMATCH',
                'message', 'Valor inconsistente com o cupom informado.'
            );
        END IF;
    END IF;

    IF array_length(v_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY v_session_ids LOOP
            SELECT id, title, max_vagas, registered_count INTO v_sess
            FROM public.programacao_evento
            WHERE id::text = v_sess_id::text
            FOR UPDATE;
            IF FOUND AND v_sess.max_vagas IS NOT NULL AND v_sess.max_vagas > 0 THEN
                IF COALESCE(v_sess.registered_count, 0) >= v_sess.max_vagas THEN
                    v_full_sess := array_append(v_full_sess, v_sess.title);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'SESSION_FULL',
            'message', 'Vagas esgotadas: ' || array_to_string(v_full_sess, ', ')
        );
    END IF;

    INSERT INTO public.inscricoes_growth_experience (
        project_id, user_id, nome, email, telefone, cpf, cursos_selecionados,
        tipo_inscricao, valor_pago, status_pagamento, status, evento,
        palestras_noturnas, tipo_atividade_selecionada, sala_atividade,
        horario_atividade, nivel_atividade, indicacao_tipo, indicacao_nome,
        codigo_social, codigo_palestra, cupom_palestra, extra_data, lote_id, voucher_empresa, created_at
    ) VALUES (
        p_project_id, p_user_id, p_nome, p_email, p_telefone, p_cpf, v_session_ids,
        p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status, p_evento,
        p_palestras_noturnas, p_tipo_atividade, p_sala_atividade, p_horario_atividade,
        p_nivel_atividade, p_indicacao_tipo, p_indicacao_nome,
        p_codigo_social, p_codigo_palestra, COALESCE(p_codigo_palestra, p_codigo_social),
        p_extra_data, p_lote_id, p_voucher_empresa, NOW()
    )
    RETURNING id INTO v_insc_id;

    UPDATE public.inscricoes_growth_experience
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

    IF array_length(v_session_ids, 1) > 0 THEN
        UPDATE public.programacao_evento
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(v_session_ids);
    END IF;

    RETURN jsonb_build_object('success', true, 'inscricao_id', v_insc_id);
END;
$$;

ALTER FUNCTION public.register_participant_with_slots(
    UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN,
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT
) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(
    UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN,
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT
) TO anon, authenticated, service_role;

-- ── 4) handle_registration_usage — search_path (AFTER trigger: no NEW row mutation)
-- ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_registration_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (NEW.status_pagamento = 'pago') AND (OLD IS NULL OR OLD.status_pagamento IS DISTINCT FROM 'pago') THEN
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.cupons_parceria_social
            SET uso_atual = COALESCE(uso_atual, 0) + 1
            WHERE codigo = NEW.codigo_social;
        END IF;

        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes_inscricao_empresa
            SET vagas_utilizadas = COALESCE(vagas_utilizadas, 0) + 1
            WHERE id = NEW.lote_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status_pagamento = 'pago' AND NEW.status_pagamento IS DISTINCT FROM 'pago') THEN
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.cupons_parceria_social
            SET uso_atual = GREATEST(0, COALESCE(uso_atual, 0) - 1)
            WHERE codigo = NEW.codigo_social;
        END IF;

        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes_inscricao_empresa
            SET vagas_utilizadas = GREATEST(0, COALESCE(vagas_utilizadas, 0) - 1)
            WHERE id = NEW.lote_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- ── 5) RPC: registro seguro de equipe de parceiro
-- ───────────────────────────────────────────────────────────
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
    FROM public.parceiros
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
    FROM public.parceiros_equipe
    WHERE partner_id = p_partner_id AND project_id = p_project_id;

    v_max := COALESCE(v_partner.max_team_members, 10);
    IF v_count >= v_max THEN
        RETURN jsonb_build_object('success', false, 'error', 'TEAM_FULL');
    END IF;

    INSERT INTO public.parceiros_equipe (
        partner_id, project_id, user_id, name, email, phone, cpf, role, qr_code
    ) VALUES (
        p_partner_id, p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, 'Integrante', p_qr_code
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

ALTER FUNCTION public.register_parceiro_equipe_member(UUID, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.register_parceiro_equipe_member(UUID, TEXT, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

-- ── 6) RPC: check-in atômico (credenciamento geral)
-- ───────────────────────────────────────────────────────────
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
    FROM public.inscricoes_growth_experience
    WHERE id = p_registration_id AND project_id = p_project_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND');
    END IF;

    IF COALESCE(v_checked, false) THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_CHECKED_IN');
    END IF;

    UPDATE public.inscricoes_growth_experience
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

ALTER FUNCTION public.check_in_registration_atomic(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.check_in_registration_atomic(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated, service_role;

-- ── 7) RLS parceiros_equipe — remover políticas permissivas
-- ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "permitir_select_equipe_publico" ON public.parceiros_equipe;
DROP POLICY IF EXISTS "permitir_insert_equipe_publico" ON public.parceiros_equipe;
DROP POLICY IF EXISTS "parceiros_equipe_select_self_or_admin" ON public.parceiros_equipe;
DROP POLICY IF EXISTS "parceiros_equipe_admin_all" ON public.parceiros_equipe;

CREATE POLICY "parceiros_equipe_select_self_or_admin"
ON public.parceiros_equipe FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR public.is_admin()
);

CREATE POLICY "parceiros_equipe_admin_all"
ON public.parceiros_equipe FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Anon não insere diretamente (usa RPC SECURITY DEFINER)
REVOKE INSERT ON public.parceiros_equipe FROM anon;

-- RPC para o formulário público contar equipe sem SELECT amplo na tabela
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
    FROM public.parceiros_equipe
    WHERE partner_id = p_partner_id;

    SELECT COALESCE(max_team_members, 10) INTO v_max
    FROM public.parceiros
    WHERE id = p_partner_id;

    RETURN jsonb_build_object(
        'member_count', COALESCE(v_count, 0),
        'max_members', COALESCE(v_max, 10)
    );
END;
$$;

ALTER FUNCTION public.get_parceiro_equipe_usage(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_parceiro_equipe_usage(UUID) TO anon, authenticated, service_role;

REVOKE SELECT ON public.parceiros_equipe FROM anon;

-- ── 8) Inscrições: INSERT direto apenas via função (RPC bypass RLS com definer)
-- ───────────────────────────────────────────────────────────
REVOKE INSERT ON public.inscricoes_growth_experience FROM anon;

NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Audit remediation migration 20260404 applied.'; END $$;
