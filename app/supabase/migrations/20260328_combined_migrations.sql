-- ============================================================
-- Migração Combinada - Growth Experience Triunfo
-- Data: 2026-03-28
-- Inclui: Funções auxiliares, Tabela Empresas Incentivadoras, Atualização B2B, Atualização Startups, RPC de Inscrições
-- ============================================================

-- ------------------------------------------------------------
-- 0. Funções Auxiliares (RLS Helpers)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;

CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        'visitor'
    );
$$;

-- ------------------------------------------------------------
-- 1. Criação da Tabela de Empresas Incentivadoras
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inscricoes_empresas_incentivadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    nome_responsavel TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    quantidade_noite INTEGER NOT NULL DEFAULT 0,
    objetivo TEXT,
    valor_investido NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'pago')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir inserção pública em inscricoes_empresas_incentivadoras" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Permitir inserção pública em inscricoes_empresas_incentivadoras"
ON public.inscricoes_empresas_incentivadoras
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins podem gerenciar inscricoes_empresas_incentivadoras" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Admins podem gerenciar inscricoes_empresas_incentivadoras"
ON public.inscricoes_empresas_incentivadoras
FOR ALL
TO authenticated
USING (public.is_admin() OR public.current_user_role() = 'admin')
WITH CHECK (public.is_admin() OR public.current_user_role() = 'admin');

DROP TRIGGER IF EXISTS set_updated_at_empresas_incentivadoras ON public.inscricoes_empresas_incentivadoras;
CREATE TRIGGER set_updated_at_empresas_incentivadoras
    BEFORE UPDATE ON public.inscricoes_empresas_incentivadoras
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- 2. Atualização: Tabela B2B (Rodada de Negócios)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'nome_representante') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN nome_representante TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'telefone') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN telefone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'faturamento_anual') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN faturamento_anual NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'numero_funcionarios') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN numero_funcionarios INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'site_url') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN site_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'linkedin_url') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN linkedin_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'logo_url') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN logo_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'tipo_interesse') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN tipo_interesse TEXT;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rodada_negocios_b2b' 
        AND column_name = 'areas_interesse' 
        AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE public.rodada_negocios_b2b RENAME COLUMN areas_interesse TO areas_interesse_old;
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN areas_interesse TEXT;
    ELSEIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'areas_interesse') THEN
        ALTER TABLE public.rodada_negocios_b2b ADD COLUMN areas_interesse TEXT;
    END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Atualização: Tabela Startups Arena Pitch
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome_startup TEXT,
    descricao_startup TEXT,
    setor TEXT,
    estagio TEXT,
    problema TEXT,
    solucao TEXT,
    diferencial TEXT,
    status TEXT DEFAULT 'pendente',
    pontuacao NUMERIC,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'nome_fundador') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN nome_fundador TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'faturamento_mensal') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN faturamento_mensal NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'investimento_buscado') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN investimento_buscado NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'video_pitch_url') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN video_pitch_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'pitch_deck_url') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN pitch_deck_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'avaliado_at') THEN
        ALTER TABLE public.startups_arena_pitch ADD COLUMN avaliado_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ------------------------------------------------------------
-- 4. Atualização: Tabela Growth Experience e RPC
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    cursos_selecionados UUID[],
    tipo_inscricao TEXT,
    tipo_atividade_selecionada TEXT,
    sala_atividade TEXT,
    horario_atividade TEXT,
    nivel_atividade TEXT,
    indicacao_tipo TEXT,
    indicacao_nome TEXT,
    codigo_social TEXT,
    codigo_palestra TEXT,
    cupom_palestra TEXT,
    app_instalado BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'evento') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN evento TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'palestras_noturnas') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN palestras_noturnas BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'valor_pago') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN valor_pago NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'status_pagamento') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN status_pagamento TEXT DEFAULT 'pendente';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'lote_id') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN lote_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'voucher_empresa') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN voucher_empresa TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'extra_data') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN extra_data JSONB DEFAULT '{}'::JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inscricoes_growth_experience' AND column_name = 'cpf') THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN cpf TEXT;
    END IF;
END $$;

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
DECLARE v_inscricao_id UUID;
v_session RECORD;
v_session_id UUID;
v_full_sessions TEXT [] := '{}';
BEGIN 
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

IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN 
    FOREACH v_session_id IN ARRAY p_session_ids LOOP
        UPDATE public.programacao_evento
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = v_session_id;
    END LOOP;
END IF;

RETURN jsonb_build_object(
    'success', true,
    'inscricao_id', v_inscricao_id,
    'message', 'Inscrição realizada com sucesso'
);

EXCEPTION
WHEN unique_violation THEN 
    RETURN jsonb_build_object(
        'success', false,
        'error', 'ALREADY_REGISTERED',
        'message', 'Este e-mail já está inscrito neste evento.'
    );
WHEN OTHERS THEN 
    RETURN jsonb_build_object(
        'success', false,
        'error', 'DB_ERROR',
        'message', SQLERRM
    );
END;
$$;

ALTER FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.register_participant_with_slots(UUID, UUID, TEXT, TEXT, TEXT, UUID[], TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT) TO service_role;

-- ------------------------------------------------------------
-- 5. Tabela: Lotes de Inscrição Corporativa (Registration Batches)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lotes_inscricao_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT,
    nome_responsavel TEXT,
    email_responsavel TEXT,
    email_contato TEXT NOT NULL,
    voucher_code TEXT UNIQUE NOT NULL,
    quantidade_vagas INTEGER NOT NULL DEFAULT 5,
    vagas_utilizadas INTEGER NOT NULL DEFAULT 0,
    tipo_ingresso TEXT NOT NULL DEFAULT 'pro',
    valor_total NUMERIC NOT NULL DEFAULT 0,
    status_pagamento TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir que a tabela tenha os campos novos (idempotência)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lotes_inscricao_empresa' AND column_name = 'nome_responsavel') THEN
        ALTER TABLE public.lotes_inscricao_empresa ADD COLUMN nome_responsavel TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lotes_inscricao_empresa' AND column_name = 'email_responsavel') THEN
        ALTER TABLE public.lotes_inscricao_empresa ADD COLUMN email_responsavel TEXT;
    END IF;
END $$;

ALTER TABLE public.lotes_inscricao_empresa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lotes_admin_all" ON public.lotes_inscricao_empresa;
CREATE POLICY "lotes_admin_all" ON public.lotes_inscricao_empresa FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "lotes_public_verify" ON public.lotes_inscricao_empresa;
CREATE POLICY "lotes_public_verify" ON public.lotes_inscricao_empresa FOR SELECT USING (true);

DROP TRIGGER IF EXISTS update_lotes_empresa_updated_at ON public.lotes_inscricao_empresa;
CREATE TRIGGER update_lotes_empresa_updated_at BEFORE UPDATE ON public.lotes_inscricao_empresa 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
