-- ============================================================
-- FINAL HARMONIZATION MIGRATION - FIXED SYNTAX VERSION
-- Project: Growth Summit 2026 / Growth Experience Triunfo
-- Date: 2026-03-28 (v5)
-- Goal: Fix nested DO block syntax error and ensure function uniqueness.
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABELAS E VIEWS (Estrutura Base)
-- ------------------------------------------------------------
DO $$ 
BEGIN 
    -- mentores_growth_experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mentores_growth_experience') THEN
        CREATE TABLE public.mentores_growth_experience (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            telefone TEXT,
            empresa TEXT,
            cargo TEXT,
            bio TEXT,
            especialidades TEXT[],
            linkedin_url TEXT,
            foto_url TEXT,
            status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'approved', 'rejected', 'inactive')),
            years_experience INTEGER DEFAULT 0,
            max_mentories INTEGER DEFAULT 5,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Migrate data from 'mentors' if it exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mentors') THEN
            INSERT INTO public.mentores_growth_experience (
                id, project_id, user_id, nome, email, bio, especialidades, 
                years_experience, empresa, cargo, linkedin_url, foto_url, status, created_at
            )
            SELECT 
                id, project_id, user_id, name, email, bio, specialties, 
                years_experience, company, position, linkedin, photo, status, created_at
            FROM public.mentors
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;

    -- inscricoes_growth_experience (Garantir colunas para novo formulário)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscricoes_growth_experience') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN IF NOT EXISTS cpf TEXT;
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN IF NOT EXISTS cupom_palestra TEXT;
    END IF;

    -- audit_logs
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        CREATE TABLE public.audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            event TEXT NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            ip_address TEXT,
            browser_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- login_attempts
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'login_attempts') THEN
        CREATE TABLE public.login_attempts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT NOT NULL,
            success BOOLEAN NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2. VIEWS DE SEGURANÇA
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.security_user_activity AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.updated_at as last_login_at,
    NULL::text as last_login_ip,
    COALESCE(p.two_factor_enabled, false) as two_factor_enabled,
    0 as active_sessions,
    0 as recent_events
FROM public.users u
LEFT JOIN (SELECT user_id, true as two_factor_enabled FROM public.profiles WHERE newsletter_opt_in = true) p ON u.id = p.user_id;

CREATE OR REPLACE VIEW public.security_suspicious_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(attempted_at) as last_attempt,
    COUNT(*) FILTER (WHERE success = false) as failed_attempts
FROM public.login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) FILTER (WHERE success = false) > 5;

-- ------------------------------------------------------------
-- 3. RESET: Faxina de Funções (Fix overloads)
-- ------------------------------------------------------------
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

-- ------------------------------------------------------------
-- 4. FUNÇÃO DEFINITIVA: register_participant_with_slots
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID,
    p_user_id UUID,
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT,
    p_cpf TEXT,
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
    -- Verificar disponibilidade das vagas (se houver sessões selecionadas)
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

    -- Se houver sessões lotadas, abortar e retornar erro
    IF array_length(v_full_sessions, 1) > 0 THEN 
        RETURN jsonb_build_object(
            'success', false,
            'error', 'SESSION_FULL',
            'full_sessions', to_jsonb(v_full_sessions),
            'message', format('Vagas esgotadas para: %s', array_to_string(v_full_sessions, ', '))
        );
    END IF;

    -- Inserir a inscrição
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

    -- Incrementar contador de inscritos nas sessões
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN 
        UPDATE public.programacao_evento
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(p_session_ids);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'inscricao_id', v_inscricao_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLSTATE,
        'message', SQLERRM
    );
END;
$$;

-- ------------------------------------------------------------
-- 5. SEGURANÇA: RLS & Permissões
-- ------------------------------------------------------------
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentores_read_public" ON public.mentores_growth_experience;
CREATE POLICY "mentores_read_public" ON public.mentores_growth_experience FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "mentores_admin_all" ON public.mentores_growth_experience;
CREATE POLICY "mentores_admin_all" ON public.mentores_growth_experience FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_admin_all" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_all" ON public.audit_logs FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "login_attempts_admin_all" ON public.login_attempts;
CREATE POLICY "login_attempts_admin_all" ON public.login_attempts FOR ALL TO authenticated USING (public.is_admin());

-- ------------------------------------------------------------
-- 6. ATUALIZAÇÃO DO CACHE
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
