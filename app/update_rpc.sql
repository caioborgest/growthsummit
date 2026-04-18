-- Drop the function first to avoid parameter defaults conflict (ERROR: 42P13)
DROP FUNCTION IF EXISTS public.register_participant_with_slots(uuid,uuid,text,text,text,text,uuid[],text,numeric,text,text,text,boolean,text,text,text,text,jsonb,uuid,text);

CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_cpf TEXT,
    p_session_ids UUID[],
    p_tipo_inscricao TEXT,
    p_valor_pago NUMERIC,
    p_status_pagamento TEXT,
    p_status TEXT,
    p_evento TEXT,
    p_palestras_noturnas BOOLEAN,
    p_indicacao_tipo TEXT,
    p_indicacao_nome TEXT,
    p_codigo_social TEXT,
    p_codigo_palestra TEXT,
    p_extra_data JSONB,
    p_lote_id UUID,
    p_voucher_empresa TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_insc_id UUID;
    v_sess_id UUID;
    v_sess RECORD;
    v_cupom RECORD;
    v_full_sess TEXT[] := ARRAY[]::TEXT[];
    v_cupom_code TEXT;
    v_session_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    SELECT COALESCE(array_agg(z::uuid), ARRAY[]::uuid[])
    INTO v_session_ids
    FROM unnest(COALESCE(p_session_ids, ARRAY[]::uuid[])) AS z
    WHERE z IS NOT NULL;

    v_cupom_code := NULLIF(trim(COALESCE(p_codigo_palestra, '')), '');
    IF v_cupom_code IS NULL THEN
        v_cupom_code := NULLIF(trim(COALESCE(p_codigo_social, '')), '');
    END IF;

    IF v_cupom_code IS NOT NULL THEN
        SELECT * INTO v_cupom
        FROM public.social_partnership_coupons
        WHERE project_id = p_project_id
          AND upper(trim(code)) = upper(trim(v_cupom_code))
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'Cupom inválido ou não encontrado.');
        END IF;

        IF COALESCE(v_cupom.is_active, false) = false THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'O cupom selecionado está inativo.');
        END IF;

        IF v_cupom.end_date IS NOT NULL AND v_cupom.end_date < NOW() THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'O cupom já expirou.');
        END IF;

        IF v_cupom.usage_limit IS NOT NULL AND COALESCE(v_cupom.current_usage, 0) >= v_cupom.usage_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_COUPON', 'message', 'O limite de uso deste cupom já foi atingido.');
        END IF;
    END IF;

    IF array_length(v_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY v_session_ids LOOP
            SELECT id, title, max_capacity, registered_count INTO v_sess
            FROM public.event_schedule
            WHERE id = v_sess_id
            FOR UPDATE;
            
            IF FOUND AND v_sess.max_capacity IS NOT NULL AND v_sess.max_capacity > 0 THEN
                IF COALESCE(v_sess.registered_count, 0) >= v_sess.max_capacity THEN
                    v_full_sess := array_append(v_full_sess, v_sess.title);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_FULL', 'message', 'As seguintes sessões estão lotadas: ' || array_to_string(v_full_sess, ', '));
    END IF;

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

    IF array_length(v_session_ids, 1) > 0 THEN
        UPDATE public.event_schedule
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(v_session_ids);
    END IF;

    RETURN jsonb_build_object('success', true, 'registration_id', v_insc_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT
) TO anon, authenticated, service_role;
