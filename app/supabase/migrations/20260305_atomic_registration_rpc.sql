-- ============================================================
-- FASE 2: ITEM 7 — Inscrição Atômica com Controle de Vagas
-- Data: 2026-03-05 | Auditoria 360°
-- Objetivo: Eliminar race condition no registro de vagas
-- A função faz INSERT + UPDATE do contador em uma única transação,
-- evitando overbooking quando duas inscrições simultâneas chegam
-- ============================================================
-- ============================================================
-- 1. FUNÇÃO: increment_session_count (corrigir/garantir existência)
--    Usada por Step3Confirmacao.tsx após o insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_session_count(session_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
UPDATE public.programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = session_id;
END;
$$;
ALTER FUNCTION public.increment_session_count(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.increment_session_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_session_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_session_count(UUID) TO service_role;
-- ============================================================
-- 2. FUNÇÃO ATÔMICA: register_participant_with_slots
--    Faz tudo em uma única transação:
--    a) Verifica se as sessões ainda têm vagas (com SELECT FOR UPDATE)
--    b) Insere a inscrição
--    c) Incrementa os contadores atomicamente
--    Retorna JSON com resultado
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
        p_project_id UUID,
        p_user_id UUID,
        p_nome TEXT,
        p_email TEXT,
        p_telefone TEXT,
        p_session_ids UUID [],
        p_tipo_inscricao TEXT DEFAULT 'standard',
        p_valor_pago NUMERIC DEFAULT 0,
        p_status_pagamento TEXT DEFAULT 'pago',
        p_status TEXT DEFAULT 'ativo',
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
        p_extra_data JSONB DEFAULT '{}'::JSONB
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_inscricao_id UUID;
v_session RECORD;
v_session_id UUID;
v_full_sessions TEXT [] := '{}';
BEGIN -- ── ETAPA 1: Verificar disponibilidade de vagas (com lock para evitar race condition)
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
SELECT id,
    title,
    max_vagas,
    registered_count INTO v_session
FROM public.programacao_evento
WHERE id = v_session_id FOR
UPDATE;
-- Lock pessimista: garante atomicidade
-- Só bloqueia se houver limite definido (max_vagas > 0)
IF FOUND
AND v_session.max_vagas IS NOT NULL
AND v_session.max_vagas > 0 THEN IF COALESCE(v_session.registered_count, 0) >= v_session.max_vagas THEN v_full_sessions := array_append(v_full_sessions, v_session.title);
END IF;
END IF;
END LOOP;
END IF;
-- Se alguma sessão lotou, retornar erro sem fazer o insert
IF array_length(v_full_sessions, 1) > 0 THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'SESSION_FULL',
    'full_sessions',
    to_jsonb(v_full_sessions),
    'message',
    format(
        'Vagas esgotadas para: %s',
        array_to_string(v_full_sessions, ', ')
    )
);
END IF;
-- ── ETAPA 2: Inserir a inscrição
INSERT INTO public.inscricoes_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        telefone,
        cursos_selecionados,
        tipo_inscricao,
        valor_pago,
        status_pagamento,
        status,
        evento,
        palestras_noturnas,
        tipo_atividade_selecionada,
        sala_atividade,
        horario_atividade,
        nivel_atividade,
        indicacao_tipo,
        indicacao_nome,
        codigo_social,
        codigo_palestra,
        cupom_palestra,
        app_instalado,
        created_at
    )
VALUES (
        p_project_id,
        p_user_id,
        p_nome,
        p_email,
        p_telefone,
        p_session_ids,
        p_tipo_inscricao,
        p_valor_pago,
        p_status_pagamento,
        p_status,
        p_evento,
        p_palestras_noturnas,
        p_tipo_atividade,
        p_sala_atividade,
        p_horario_atividade,
        p_nivel_atividade,
        p_indicacao_tipo,
        p_indicacao_nome,
        p_codigo_social,
        p_codigo_palestra,
        p_codigo_palestra,
        false,
        NOW()
    )
RETURNING id INTO v_inscricao_id;
-- ── ETAPA 3: Incrementar contadores das sessões (atomicamente)
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
UPDATE public.programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = v_session_id;
END LOOP;
END IF;
-- ── RETORNO: Sucesso
RETURN jsonb_build_object(
    'success',
    true,
    'inscricao_id',
    v_inscricao_id,
    'message',
    'Inscrição realizada com sucesso'
);
EXCEPTION
WHEN unique_violation THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'ALREADY_REGISTERED',
    'message',
    'Este e-mail já está inscrito neste evento.'
);
WHEN OTHERS THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'DB_ERROR',
    'message',
    SQLERRM
);
END;
$$;
ALTER FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) OWNER TO postgres;
-- Grants: authenticated e anon (formulário público)
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
-- ============================================================
-- 3. GARANTIR COLUNA max_vagas em programacao_evento
--    (pode ter sido nomeada max_capacity em algumas migrações)
-- ============================================================
DO $$ BEGIN -- Adicionar max_vagas se não existir
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'programacao_evento'
        AND column_name = 'max_vagas'
        AND table_schema = 'public'
) THEN -- Verificar se existe max_capacity e criar alias
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'programacao_evento'
        AND column_name = 'max_capacity'
        AND table_schema = 'public'
) THEN -- Criar coluna max_vagas como cópia de max_capacity
ALTER TABLE public.programacao_evento
ADD COLUMN max_vagas INTEGER;
UPDATE public.programacao_evento
SET max_vagas = max_capacity
WHERE max_capacity IS NOT NULL;
RAISE NOTICE 'Coluna max_vagas criada a partir de max_capacity';
ELSE
ALTER TABLE public.programacao_evento
ADD COLUMN max_vagas INTEGER;
RAISE NOTICE 'Coluna max_vagas criada (vazia)';
END IF;
ELSE RAISE NOTICE 'Coluna max_vagas ja existe em programacao_evento';
END IF;
-- Garantir coluna registered_count
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'programacao_evento'
        AND column_name = 'registered_count'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.programacao_evento
ADD COLUMN registered_count INTEGER DEFAULT 0;
RAISE NOTICE 'Coluna registered_count criada em programacao_evento';
END IF;
END $$;
-- ============================================================
-- 4. VERIFICAÇÃO
-- ============================================================
SELECT routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'register_participant_with_slots',
        'increment_session_count',
        'is_admin',
        'current_user_role'
    )
ORDER BY routine_name;