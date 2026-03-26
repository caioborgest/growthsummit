-- ============================================================
-- GROWTH SUMMIT 2026 - MIGRACAO COMPLETA E UNICA
-- Consolida schema.sql + migrations/* + seeds.sql
-- ============================================================

-- 1. SETUP INICIAL E EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. TABELAS PRINCIPAIS (USUÁRIOS E PERFIS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('visitor', 'participant', 'mentor', 'company', 'startup', 'sponsor', 'admin', 'staff', 'superadmin')),
    avatar TEXT,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'BR',
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    cpf TEXT,
    cnpj TEXT,
    newsletter_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================
-- 3. PROJETOS (EVENTOS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('growth_summit', 'growth_experience', 'growth_conference', 'growth_festival')),
    description TEXT NOT NULL,
    short_description TEXT,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'BR',
    address TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    banner TEXT,
    logo TEXT,
    primary_color TEXT DEFAULT '#21808D',
    secondary_color TEXT DEFAULT '#FE4C38',
    max_registrations INTEGER,
    max_mentors INTEGER,
    max_startups INTEGER,
    max_companies INTEGER,
    enable_b2b BOOLEAN DEFAULT TRUE,
    enable_mentoring BOOLEAN DEFAULT TRUE,
    enable_startups BOOLEAN DEFAULT TRUE,
    enable_check_in BOOLEAN DEFAULT TRUE,
    ticket_price_standard INTEGER NOT NULL DEFAULT 19700,
    ticket_price_pro INTEGER NOT NULL DEFAULT 34700,
    ticket_price_vip INTEGER NOT NULL DEFAULT 150000,
    target_registrations INTEGER DEFAULT 1500,
    target_revenue INTEGER DEFAULT 61600000,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. INSCRIÇÕES (CORE + GROWTH EXPERIENCE)
-- ============================================================

-- Tabela genérica de inscrições
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('standard', 'pro', 'vip')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'expired')),
    ticket_number TEXT UNIQUE,
    qr_code TEXT,
    qr_code_data TEXT,
    amount INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('credit_card', 'pix', 'boleto', 'transfer', 'cash')),
    payment_provider TEXT CHECK (payment_provider IN ('stripe', 'pagarme', 'mercadopago', 'manual', 'cora')),
    payment_provider_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_metadata JSONB,
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Tabela específica Growth Experience (referenciada em várias migrações)
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    cpf TEXT,
    tipo_inscricao TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'ativo',
    valor_pago DECIMAL(10, 2) DEFAULT 0,
    status_pagamento TEXT DEFAULT 'pendente',
    ticket_number TEXT UNIQUE,
    qr_code TEXT,
    palestras_noturnas BOOLEAN DEFAULT FALSE,
    cursos_selecionados TEXT[] DEFAULT '{}',
    cupom_palestra TEXT,
    valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0,
    app_instalado BOOLEAN DEFAULT FALSE,
    indicacao_tipo TEXT DEFAULT 'nenhum',
    indicacao_nome TEXT,
    codigo_social TEXT,
    codigo_palestra TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. PROGRAMAÇÃO E SESSÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('keynote', 'talk', 'panel', 'workshop', 'networking', 'break')),
    track TEXT,
    day INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT NOT NULL,
    max_capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alias para compatibilidade regional
CREATE TABLE IF NOT EXISTS public.programacao_evento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    day INTEGER,
    start_time TIME,
    end_time TIME,
    room TEXT,
    max_vagas INTEGER,
    registered_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. MENTORIAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    photo TEXT,
    bio TEXT,
    specialties TEXT[],
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela regional de mentores
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    especialidades TEXT[],
    bio TEXT,
    linkedin_url TEXT,
    foto_url TEXT,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    years_experience INTEGER,
    max_mentories INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. SORTEIOS (RAFFLE MODULE)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('stand_checkin', 'realtime_qr')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'completed', 'cancelled')),
    stand_id UUID,
    winner_registration_id UUID REFERENCES public.inscricoes_growth_experience(id),
    drawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(raffle_id, registration_id)
);

-- ============================================================
-- 8. SUPORTE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. FUNÇÕES E SEGURANÇA (RBAC)
-- ============================================================

-- Função Admin Check via JWT
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT COALESCE(
    (auth.jwt()->'app_metadata'->>'role'),
    (auth.jwt()->'user_metadata'->>'role'),
    ''
) IN ('admin', 'staff', 'superadmin');
$$;

-- Função Atômica de Inscrição
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID, p_user_id UUID, p_nome TEXT, p_email TEXT, p_telefone TEXT, p_session_ids UUID[]
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_inscricao_id UUID;
BEGIN
    INSERT INTO public.inscricoes_growth_experience (project_id, user_id, nome, email, telefone, cursos_selecionados)
    VALUES (p_project_id, p_user_id, p_nome, p_email, p_telefone, p_session_ids)
    RETURNING id INTO v_inscricao_id;
    
    RETURN jsonb_build_object('success', true, 'inscricao_id', v_inscricao_id);
END;
$$;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own record" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see active projects" ON public.projects FOR SELECT USING (status = 'active' OR public.is_admin());

-- ============================================================
-- 11. DADOS INICIAIS (SEEDS)
-- ============================================================

INSERT INTO public.projects (id, name, slug, type, description, location, city, state, start_date, end_date, status)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Growth Summit 2026', 'growth-summit-2026', 'growth_summit', 'O maior evento de gestão do interior do Nordeste.', 'Boulevard Hotel', 'Juazeiro do Norte', 'CE', '2026-05-21', '2026-05-22', 'active')
ON CONFLICT (id) DO NOTHING;

-- FIM DO SCRIPT
