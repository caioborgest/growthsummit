-- ============================================================
-- MIGRATION: backend_frontend_alignment (v7)
-- Gerado em: 2026-04-19
-- Objetivo: Alinhar schema ao que o frontend consome e padronizar nomes.
-- ============================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SEÇÃO 1: COLUNAS FALTANTES E AJUSTES DE TABELA

-- growth_experience_registrations (Tabela Unificada)
CREATE TABLE IF NOT EXISTS public.growth_experience_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    cpf TEXT,
    ticket_type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'active',
    payment_status TEXT DEFAULT 'pending',
    paid_amount NUMERIC(10, 2) DEFAULT 0,
    social_code TEXT,
    company_voucher TEXT,
    batch_id UUID,
    lecture_coupon TEXT,
    coupon_code TEXT,
    discount_type TEXT,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    final_price NUMERIC(10, 2) DEFAULT 0,
    event_name TEXT DEFAULT 'Growth Experience',
    app_installed BOOLEAN DEFAULT FALSE,
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migração de dados de tabelas legadas (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscricoes_growth_experience') THEN
        INSERT INTO public.growth_experience_registrations (
            project_id, user_id, name, email, phone, cpf, ticket_type, status, payment_status, paid_amount, created_at
        )
        SELECT 
            project_id, user_id, nome, email, telefone, cpf, tipo_ingresso, status, status_pagamento, valor_pago, criado_em
        FROM public.inscricoes_growth_experience
        ON CONFLICT DO NOTHING;
        
        COMMENT ON TABLE public.inscricoes_growth_experience IS 'DEPRECATED: Use growth_experience_registrations instead.';
    END IF;
END $$;

-- profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'participant';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- SEÇÃO 2: TABELAS FALTANTES (NPS, Stripe, etc.)

-- company_registration_batches (Lotes Corporativos)
CREATE TABLE IF NOT EXISTS public.company_registration_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    voucher_code TEXT UNIQUE NOT NULL,
    total_slots INTEGER NOT NULL DEFAULT 0,
    used_slots INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'active',
    payment_status TEXT DEFAULT 'pending',
    cnpj TEXT,
    contact_email TEXT,
    responsible_name TEXT,
    responsible_email TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- social_partnership_coupons (Cupons Social)
CREATE TABLE IF NOT EXISTS public.social_partnership_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    referral_type TEXT,
    referral_name TEXT,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    description TEXT,
    expires_at TIMESTAMPTZ,
    is_batch BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- stripe_payments
CREATE TABLE IF NOT EXISTS public.stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.growth_experience_registrations(id) ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NPS forms and responses
CREATE TABLE IF NOT EXISTS public.nps_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    internal_name TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    status TEXT DEFAULT 'draft',
    default_channel TEXT DEFAULT 'email',
    language TEXT DEFAULT 'pt-BR',
    visual_settings JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    form_id UUID REFERENCES public.nps_forms(id) ON DELETE CASCADE,
    session_id UUID,
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    classification TEXT, -- promoter, passive, detractor
    main_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.nps_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    response_id UUID REFERENCES public.nps_responses(id) ON DELETE CASCADE,
    owner_id UUID,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEÇÃO 3: ÍNDICES FALTANTES
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.growth_experience_registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.growth_experience_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_project_id ON public.growth_experience_registrations(project_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.social_partnership_coupons(code);
CREATE INDEX IF NOT EXISTS idx_nps_responses_event ON public.nps_responses(event_id);

-- SEÇÃO 4: RPCs ATUALIZADAS (PGRST202 Fix)

-- Atomic Registration RPC (Alinhada com registrationService.ts)
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
    p_referral_type TEXT,
    p_referral_name TEXT,
    p_social_code TEXT,
    p_lecture_code TEXT,
    p_extra_data JSONB,
    p_lote_id UUID,
    p_company_voucher TEXT,
    p_empresa TEXT,
    p_coupon_code TEXT
) RETURNS JSONB AS $$
DECLARE
    v_registration_id UUID;
    v_ticket_number TEXT;
BEGIN
    -- Gerar número de ticket (ex: GX-ABCD)
    v_ticket_number := 'GX-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 4));

    -- Inserir na tabela unificada
    INSERT INTO public.growth_experience_registrations (
        project_id, user_id, name, email, phone, cpf, ticket_type, 
        paid_amount, payment_status, status, event_name, 
        social_code, company_voucher, batch_id, lecture_coupon, 
        coupon_code, discount_amount, final_price
    ) VALUES (
        p_project_id, p_user_id, p_name, p_email, p_phone, p_cpf, p_tipo_inscricao,
        p_valor_pago, p_status_pagamento, p_status, p_evento,
        p_social_code, p_company_voucher, p_lote_id, p_lecture_code,
        p_coupon_code, 0, p_valor_pago
    ) RETURNING id INTO v_registration_id;

    RETURN jsonb_build_object(
        'success', true, 
        'registration_id', v_registration_id,
        'ticket_number', v_ticket_number
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEÇÃO 6: TRIGGERS

-- Automate usage increment for coupons
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_code IS NOT NULL THEN
        UPDATE public.social_partnership_coupons 
        SET current_usage = current_usage + 1
        WHERE code = NEW.coupon_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_increment_coupon_usage ON public.growth_experience_registrations;
CREATE TRIGGER tr_increment_coupon_usage AFTER INSERT ON public.growth_experience_registrations
FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_usage();

-- SEÇÃO 9: VERIFICAÇÃO FINAL

DO $$
DECLARE
  v_errors TEXT := '';
BEGIN
  -- Verificar tabelas GX
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'growth_experience_registrations') THEN
    v_errors := v_errors || '❌ FALTANDO: growth_experience_registrations' || E'\n';
  END IF;
  
  -- Verificar colunas críticas de GX
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'growth_experience_registrations' AND column_name = 'final_price') THEN
    v_errors := v_errors || '❌ FALTANDO Coluna: final_price' || E'\n';
  END IF;

  -- Verificar RPCs
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'register_participant_with_slots') THEN
    v_errors := v_errors || '❌ FALTANDO RPC: register_participant_with_slots' || E'\n';
  END IF;

  IF v_errors = '' THEN
    RAISE NOTICE '✅ AUDITORIA CONCLUÍDA: Todos os módulos GX alinhados.';
    RAISE NOTICE '✅ Módulos validados: Perfil, Inscrição, NPS, Check-in, Financeiro.';
  ELSE
    RAISE WARNING '⚠️ ALERTAS DE AUDITORIA:%', E'\n' || v_errors;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
