-- ============================================================
-- DEFINITIVE STABILIZATION MIGRATION - GROWTH SUMMIT 2026
-- Date: 2026-04-03
-- Objective: Fix naming mismatches, add unique constraints, and harden RPC.
-- ============================================================

-- 1. STANDARDIZE PROJECTS TABLE
-- Rename public_content to settings to match application logic
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'public_content') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'settings') THEN
            ALTER TABLE public.projects RENAME COLUMN public_content TO settings;
        ELSE
            -- If both exist, merge data if necessary and drop old one
            UPDATE public.projects SET settings = settings || public_content;
            ALTER TABLE public.projects DROP COLUMN public_content;
        END IF;
    END IF;

    -- Ensure settings is JSONB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'settings') THEN
        ALTER TABLE public.projects ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. HARDEN COUPONS TABLE
-- Add unique constraint to prevent 42P10 errors during ON CONFLICT
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cupons_parceria_social_project_codigo_key') THEN
        ALTER TABLE public.cupons_parceria_social 
        ADD CONSTRAINT cupons_parceria_social_project_codigo_key UNIQUE (project_id, codigo);
    END IF;
END $$;

-- 3. FIX FOREIGN KEYS (Race Condition Prevention)
-- Ensure registration and partners point to auth.users directly
DO $$ 
BEGIN 
    -- Fix inscricoes_growth_experience
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'inscricoes_growth_experience_user_id_fkey') THEN
        ALTER TABLE public.inscricoes_growth_experience DROP CONSTRAINT inscricoes_growth_experience_user_id_fkey;
    END IF;
    ALTER TABLE public.inscricoes_growth_experience 
    ADD CONSTRAINT inscricoes_growth_experience_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

    -- Fix parceiros_equipe (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parceiros_equipe') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'parceiros_equipe_user_id_fkey') THEN
            ALTER TABLE public.parceiros_equipe DROP CONSTRAINT parceiros_equipe_user_id_fkey;
        END IF;
        ALTER TABLE public.parceiros_equipe 
        ADD CONSTRAINT parceiros_equipe_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. DEFINITIVE RPC: register_participant_with_slots
-- Drop all overloads first to avoid ambiguity
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
              FROM pg_proc p 
              JOIN pg_namespace n ON p.pronamespace = n.oid 
              WHERE n.nspname = 'public' AND p.proname = 'register_participant_with_slots') 
    LOOP
        EXECUTE 'DROP FUNCTION public.' || r.proname || '(' || r.args || ')';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT,
    p_cpf TEXT DEFAULT NULL,
    p_session_ids UUID [] DEFAULT '{}',
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
    p_extra_data JSONB DEFAULT '{}'::JSONB,
    p_lote_id UUID DEFAULT NULL,
    p_voucher_empresa TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE 
    v_inscricao_id UUID;
    v_session RECORD;
    v_session_id UUID;
    v_full_sessions TEXT [] := '{}';
BEGIN 
    -- 1. TYPE VALIDATION (Explicit Casting Protection)
    -- This inner block protects against bad inputs from the frontend
    IF p_project_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_PROJECT', 'message', 'Project ID is required.');
    END IF;

    -- 2. SESSION VALIDATION
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN 
        FOREACH v_session_id IN ARRAY p_session_ids LOOP
            SELECT id, title, max_vagas, registered_count INTO v_session
            FROM public.programacao_evento
            WHERE id = v_session_id FOR UPDATE;

            IF FOUND AND v_session.max_vagas IS NOT NULL AND v_session.max_vagas > 0 THEN 
                IF COALESCE(v_session.registered_count, 0) >= v_session.max_vagas THEN 
                    v_full_sessions := array_append(v_full_sessions, v_session.title);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sessions, 1) > 0 THEN 
        RETURN jsonb_build_object(
            'success', false,
            'error', 'SESSION_FULL',
            'full_sessions', to_jsonb(v_full_sessions),
            'message', format('Vagas esgotadas para: %s', array_to_string(v_full_sessions, ', '))
        );
    END IF;

    -- 3. INSERT REGISTRATION
    INSERT INTO public.inscricoes_growth_experience (
        project_id, user_id, nome, email, telefone, cpf, cursos_selecionados,
        tipo_inscricao, valor_pago, status_pagamento, status, evento, palestras_noturnas,
        tipo_atividade_selecionada, sala_atividade, horario_atividade, nivel_atividade,
        indicacao_tipo, indicacao_nome, codigo_social, codigo_palestra, cupom_palestra,
        app_instalado, extra_data, lote_id, voucher_empresa, created_at
    )
    VALUES (
        p_project_id, p_user_id, p_nome, p_email, p_telefone, p_cpf, p_session_ids,
        p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status, p_evento, p_palestras_noturnas,
        p_tipo_atividade, p_sala_atividade, p_horario_atividade, p_nivel_atividade,
        p_indicacao_tipo, p_indicacao_nome, p_codigo_social, p_codigo_palestra, p_codigo_palestra,
        false, p_extra_data, p_lote_id, p_voucher_empresa, NOW()
    )
    RETURNING id INTO v_inscricao_id;

    -- 4. UPDATE SESSION COUNTS
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN 
        UPDATE public.programacao_evento
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(p_session_ids);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'inscricao_id', v_inscricao_id,
        'message', 'Inscrição realizada com sucesso'
    );

EXCEPTION 
    WHEN unique_violation THEN
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_REGISTERED', 'message', 'E-mail ou CPF já inscrito.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLSTATE, 'message', SQLERRM);
END;
$$;

-- Grant permissions to definitively functional flow
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots TO anon, authenticated, service_role;

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
