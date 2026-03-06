-- ============================================================
-- FIX: Sync inscricoes_growth_experience schema and RPC
-- Data: 2026-03-06
-- Objetivo: Garantir que a tabela tenha todas as colunas esperadas pela RPC
-- ============================================================
DO $$ BEGIN -- 1. Garantir que a coluna 'evento' existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'evento'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN evento TEXT;
RAISE NOTICE 'Coluna evento adicionada em inscricoes_growth_experience';
END IF;
-- 2. Garantir que a coluna 'tipo_atividade_selecionada' existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'tipo_atividade_selecionada'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN tipo_atividade_selecionada TEXT;
END IF;
-- 3. Garantir que a coluna 'sala_atividade' existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'sala_atividade'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN sala_atividade TEXT;
END IF;
-- 4. Garantir que a coluna 'horario_atividade' existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'horario_atividade'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN horario_atividade TEXT;
END IF;
-- 5. Garantir que a coluna 'nivel_atividade' existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'nivel_atividade'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN nivel_atividade TEXT;
END IF;
END $$;
-- 6. Atualizar a função RPC (Corrigindo o conflito de colunas e nomes)
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
BEGIN -- ── ETAPA 1: Verificar disponibilidade de vagas
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
SELECT id,
    title,
    max_vagas,
    registered_count INTO v_session
FROM public.programacao_evento
WHERE id = v_session_id FOR
UPDATE;
IF FOUND
AND v_session.max_vagas IS NOT NULL
AND v_session.max_vagas > 0 THEN IF COALESCE(v_session.registered_count, 0) >= v_session.max_vagas THEN v_full_sessions := array_append(v_full_sessions, v_session.title);
END IF;
END IF;
END LOOP;
END IF;
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
-- ── ETAPA 3: Incrementar contadores
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
UPDATE public.programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = v_session_id;
END LOOP;
END IF;
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