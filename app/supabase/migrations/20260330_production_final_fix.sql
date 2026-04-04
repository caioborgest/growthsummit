-- ============================================================
-- PRODUCTION FINAL FIX - GROWTH EXPERIENCE 2026
-- Date: 2026-03-29
-- Resolve: Missing columns, Missing Tables, Broken FKs, Cache Refresh
-- ============================================================

-- 1. IDENTIDADE - FUNÇÕES AUXILIARES (Failsafe)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
AS $$
  SELECT COALESCE(
    (auth.jwt()->'app_metadata'->>'role'), 
    (auth.jwt()->'user_metadata'->>'role'), 
    ''
  ) IN ('admin', 'staff', 'superadmin');
$$;

-- 2. FIX PROGRAMACAO_EVENTO (Missing Partner column)
ALTER TABLE IF EXISTS public.programacao_evento 
ADD COLUMN IF NOT EXISTS partner TEXT DEFAULT 'Growth Experience',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS topics TEXT[],
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2.1 FIX USERS (Rename avatar to avatar_url for Auth compatibility)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE public.users RENAME COLUMN avatar TO avatar_url;
    ELSE
        ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    END IF;
END $$;

-- 2. ENSURE MISSING TABLES EXIST (For Production Cache)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    logo TEXT,
    level TEXT,
    investment NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    contact_name TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_anchor_id UUID,
    company_vendor_id UUID,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stand_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
    registration_id UUID,
    user_id UUID REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pitch_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID,
    judge_id UUID REFERENCES public.users(id),
    score NUMERIC,
    criteria JSONB,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_ins_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.programacao_evento(id) ON DELETE CASCADE,
    registration_id UUID,
    user_id UUID REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure project_id exists in check_ins_atividades
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'check_ins_atividades' AND column_name = 'project_id') THEN
        ALTER TABLE public.check_ins_atividades ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2.2 FIX PROJECTS (Missing Target Columns for Analytics)
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS target_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS banner TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS max_startups INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_companies INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT TRUE;

-- 2.3 FIX INSCRICOES_GROWTH_EXPERIENCE (Missing Columns for Registration)
ALTER TABLE IF EXISTS public.inscricoes_growth_experience 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS tipo_atividade_selecionada TEXT,
ADD COLUMN IF NOT EXISTS sala_atividade TEXT,
ADD COLUMN IF NOT EXISTS horario_atividade TEXT,
ADD COLUMN IF NOT EXISTS nivel_atividade TEXT,
ADD COLUMN IF NOT EXISTS indicacao_tipo TEXT DEFAULT 'nenhum',
ADD COLUMN IF NOT EXISTS indicacao_nome TEXT,
ADD COLUMN IF NOT EXISTS codigo_social TEXT,
ADD COLUMN IF NOT EXISTS cupom_palestra TEXT,
ADD COLUMN IF NOT EXISTS valor_desconto_palestra NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS voucher_empresa TEXT;

-- 3. FIX CERTIFICATES RELATIONSHIP
-- Add columns if missing
ALTER TABLE IF EXISTS public.certificates
ADD COLUMN IF NOT EXISTS registration_id UUID,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS activity_name TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure Foreign Key to inscricoes_growth_experience
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_certificates_registration_ge'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT fk_certificates_registration_ge 
        FOREIGN KEY (registration_id) 
        REFERENCES public.inscricoes_growth_experience(id) 
        ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add FK to certificates. Maybe table does not exist or column mismatch.';
END $$;

-- 4. FIX LOTES_INSCRICAO_EMPRESA (Registration Batches)
ALTER TABLE IF EXISTS public.lotes_inscricao_empresa
ADD COLUMN IF NOT EXISTS nome_responsavel TEXT,
ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 5. REINFORCE RLS POLICIES (Admin CRUD)
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        IF t IN ('notifications', 'sponsors', 'b2b_meetings', 'stands', 'stand_checkins', 'pitch_scores', 'check_ins_atividades', 'certificates', 'lotes_inscricao_empresa') THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('DROP POLICY IF EXISTS "Admin CRUD %I" ON public.%I', t, t);
            EXECUTE format('CREATE POLICY "Admin CRUD %I" ON public.%I FOR ALL USING (public.is_admin())', t, t);
        END IF;
    END LOOP;
END $$;

-- 6. RELOAD SCHEMA CACHE & SET PERMISSIONS
NOTIFY pgrst, 'reload schema';

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.inscricoes_growth_experience TO anon;
GRANT INSERT ON public.lotes_inscricao_empresa TO anon;
GRANT INSERT ON public.support_tickets TO anon;

-- 7. SYNC REGISTRATION USAGE (Fix Premature Coupon/Lote Increment)
-- Objective: Only count usage when payment is confirmed or for free tickets (already pago).
-- This prevents "abandoned carts" from blocking other users.

-- 7.0 CLEANUP: Drop conflicting overloads of register_participant_with_slots
-- This resolves PGRST203 Ambiguous candidate
DROP FUNCTION IF EXISTS public.register_participant_with_slots(uuid,uuid,text,text,text,uuid[],text,numeric,text,text,text,boolean,text,text,text,text,text,text,text,text,jsonb,uuid,text,text);
DROP FUNCTION IF EXISTS public.register_participant_with_slots(uuid,uuid,text,text,text,text,uuid[],text,numeric,text,text,text,boolean,text,text,text,text,text,text,text,text,jsonb,uuid,text);

-- 7.0.1 ADD MISSING validate_inscricao_dados RPC (LGPD/Security)
CREATE OR REPLACE FUNCTION public.validate_inscricao_dados(
    p_nome TEXT,
    p_email TEXT,
    p_telefone TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF length(p_nome) < 3 THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'Nome completo é obrigatório.');
    END IF;
    IF p_email NOT LIKE '%@%' THEN
        RETURN jsonb_build_object('valid', false, 'error_message', 'E-mail inválido.');
    END IF;
    RETURN jsonb_build_object('valid', true);
END; $$;

-- 7.1 MODIFIED RPC: register_participant_with_slots (Aligned with Frontend Order)
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
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
    v_insc_id UUID; 
    v_sess RECORD; 
    v_full_sess TEXT [] := '{}';
    v_sess_id UUID;
BEGIN
    -- Validar Sessões (Reserva Antecipada)
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY p_session_ids LOOP
            SELECT id, title, max_vagas, registered_count INTO v_sess
            FROM public.event_schedule WHERE id = v_sess_id FOR UPDATE;
            IF FOUND AND v_sess.max_vagas IS NOT NULL AND v_sess.max_vagas > 0 THEN
                IF COALESCE(v_sess.registered_count, 0) >= v_sess.max_vagas THEN
                    v_full_sess := array_append(v_full_sess, v_sess.title);
                END IF;
            END IF;
        END LOOP;
    END IF;

    IF array_length(v_full_sess, 1) > 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_FULL', 'message', 'Vagas esgotadas: ' || array_to_string(v_full_sess, ', '));
    END IF;

    -- Inserir Inscrição
    INSERT INTO public.inscricoes_growth_experience (
        project_id, user_id, nome, email, telefone, cpf, cursos_selecionados, 
        tipo_inscricao, valor_pago, status_pagamento, status, evento, 
        palestras_noturnas, tipo_atividade_selecionada, sala_atividade, 
        horario_atividade, nivel_atividade, indicacao_tipo, indicacao_nome, 
        codigo_social, codigo_palestra, cupom_palestra, extra_data, lote_id, voucher_empresa, created_at
    ) VALUES (
        p_project_id, p_user_id, p_nome, p_email, p_telefone, p_cpf, p_session_ids,
        p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status, p_evento,
        p_palestras_noturnas, p_tipo_atividade, p_sala_atividade, p_horario_atividade,
        p_nivel_atividade, p_indicacao_tipo, p_indicacao_nome, p_codigo_social, 
        p_codigo_palestra, p_codigo_palestra, p_extra_data, p_lote_id, p_voucher_empresa, NOW()
    ) RETURNING id INTO v_insc_id;

    -- Incrementar Sessões (Reserva)
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN
        UPDATE public.programacao_evento SET registered_count = COALESCE(registered_count, 0) + 1 
        WHERE id = ANY(p_session_ids);
    END IF;

    -- REMOVIDO: Incremento de Lote/Cupom (Agora feito via trigger no status 'pago')

    RETURN jsonb_build_object('success', true, 'inscricao_id', v_insc_id);
END; $$;

-- 7.1.1 MODIFIED RPC: aplicar_voucher_empresa (Remove premature batch increment)
CREATE OR REPLACE FUNCTION public.aplicar_voucher_empresa(p_inscricao_id UUID, p_voucher_code TEXT) 
RETURNS BOOLEAN AS $$
DECLARE 
    v_lote_id UUID;
    v_vagas INTEGER;
    v_utilizadas INTEGER;
    v_status TEXT;
BEGIN 
    -- Obter os dados do lote relacionado ao voucher
    SELECT id, quantidade_vagas, vagas_utilizadas, status_pagamento INTO v_lote_id, v_vagas, v_utilizadas, v_status
    FROM public.lotes_inscricao_empresa
    WHERE voucher_code = p_voucher_code FOR UPDATE;

    -- Validar se o lote existe
    IF v_lote_id IS NULL THEN RAISE EXCEPTION 'Voucher Invalido ou Nao Encontrado.';
    END IF;

    -- Validar pagamento do lote
    IF v_status != 'pago' THEN RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com o responsavel da sua empresa.';
    END IF;

    -- Validar limite de vagas
    IF v_utilizadas >= v_vagas THEN RAISE EXCEPTION 'Este voucher ja atingiu o limite maximo de % vagas.', v_vagas;
    END IF;

    -- REMOVIDO: UPDATE public.lotes_inscricao_empresa SET vagas_utilizadas = vagas_utilizadas + 1...
    -- O Trigger handle_registration_usage() cuidará disso ao detectar a mudança de status para 'pago'.

    -- Vincular e concluir o acesso na inscricao
    UPDATE public.inscricoes_growth_experience
    SET lote_id = v_lote_id,
        voucher_empresa_usado = p_voucher_code,
        palestras_noturnas = true,
        status_pagamento = 'pago',
        status = 'ativo',
        valor_pago = 0,
        cupom_palestra = p_voucher_code,
        valor_desconto_palestra = 179.99,
        updated_at = NOW(),
        paid_at = NOW()
    WHERE id = p_inscricao_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.2 TRIGGER FUNCTION: handle_registration_usage()
CREATE OR REPLACE FUNCTION public.handle_registration_usage() 
RETURNS TRIGGER AS $$
BEGIN
    -- CASO 1: Inscrição marcada como PAGA (Nova ou Atualizada)
    -- Incrementar contadores
    IF (NEW.status_pagamento = 'pago') AND (OLD IS NULL OR OLD.status_pagamento != 'pago') THEN
        
        -- Atualizar Cupom Social
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.cupons_parceria_social 
            SET uso_atual = COALESCE(uso_atual, 0) + 1 
            WHERE codigo = NEW.codigo_social;
        END IF;

        -- Atualizar Lote de Empresa
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes_inscricao_empresa 
            SET vagas_utilizadas = COALESCE(vagas_utilizadas, 0) + 1 
            WHERE id = NEW.lote_id;
        END IF;

        -- Registrar data de pagamento se não houver
        NEW.paid_at = COALESCE(NEW.paid_at, NOW());
    
    -- CASO 2: Inscrição deixa de ser PAGA (Cancelamento/Estorno)
    -- Decrementar contadores
    ELSIF (OLD.status_pagamento = 'pago') AND (NEW.status_pagamento != 'pago') THEN

        -- Estornar Cupom Social
        IF NEW.codigo_social IS NOT NULL THEN
            UPDATE public.cupons_parceria_social 
            SET uso_atual = GREATEST(0, COALESCE(uso_atual, 0) - 1) 
            WHERE codigo = NEW.codigo_social;
        END IF;

        -- Estornar Lote de Empresa
        IF NEW.lote_id IS NOT NULL THEN
            UPDATE public.lotes_inscricao_empresa 
            SET vagas_utilizadas = GREATEST(0, COALESCE(vagas_utilizadas, 0) - 1) 
            WHERE id = NEW.lote_id;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7.3 ATTACH TRIGGER TO TABLE
DROP TRIGGER IF EXISTS trig_sync_registration_usage ON public.inscricoes_growth_experience;
CREATE TRIGGER trig_sync_registration_usage
AFTER INSERT OR UPDATE OF status_pagamento ON public.inscricoes_growth_experience
FOR EACH ROW EXECUTE FUNCTION public.handle_registration_usage();

-- 8. AUTH AUTO-CONFIRM (Bypass Email Validation)
-- Objective: Automatically confirm emails for new users to prevent blocking the registration flow.
-- Note: Requires superuser access (default in Supabase SQL Editor).

CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users 
    SET email_confirmed_at = NOW(), 
        last_sign_in_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_user_email();

-- Backup: Confirm all existing users that are pending (using only email_confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Validation Message
DO $$ BEGIN RAISE NOTICE 'Production Final Fix + Usage Sync + Auto-Confirm applied successfully.'; END $$;
