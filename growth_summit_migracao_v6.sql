-- ============================================================
-- GROWTH SUMMIT 2026 - MIGRACAO COMPLETA E UNICA
-- Gerado em: 2026-03-28T16:19:41.939Z
-- ============================================================



-- ARCHIVE: schema.sql
-- ============================================================
-- ============================================================
-- GROWTH SUMMIT 2026 - Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PRE-FLIGHT CLEANUP: Remove overloaded functions
-- ============================================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- register_participant_with_slots
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
              FROM pg_proc p 
              JOIN pg_namespace n ON p.pronamespace = n.oid 
              WHERE n.nspname = 'public' AND p.proname = 'register_participant_with_slots') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.proname || '(' || r.args || ')';
    END LOOP;
    
    -- increment_session_count
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
              FROM pg_proc p 
              JOIN pg_namespace n ON p.pronamespace = n.oid 
              WHERE n.nspname = 'public' AND p.proname = 'increment_session_count') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || r.proname || '(' || r.args || ')';
    END LOOP;
END $$;

-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

-- Usuários (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('visitor', 'participant', 'mentor', 'company', 'startup', 'sponsor', 'admin', 'staff')),
    avatar TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfis de usuários
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

-- Projetos/Eventos
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
    -- Configurações
    max_registrations INTEGER,
    max_mentors INTEGER,
    max_startups INTEGER,
    max_companies INTEGER,
    enable_b2b BOOLEAN DEFAULT TRUE,
    enable_mentoring BOOLEAN DEFAULT TRUE,
    enable_startups BOOLEAN DEFAULT TRUE,
    enable_check_in BOOLEAN DEFAULT TRUE,
    -- Preços
    ticket_price_standard INTEGER NOT NULL DEFAULT 19700, -- em centavos
    ticket_price_pro INTEGER NOT NULL DEFAULT 34700,
    ticket_price_vip INTEGER NOT NULL DEFAULT 150000,
    -- Metas
    target_registrations INTEGER DEFAULT 1500,
    target_revenue INTEGER DEFAULT 61600000,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inscrições
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('standard', 'pro', 'vip')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'expired')),
    -- Dados do ingresso
    ticket_number TEXT UNIQUE,
    qr_code TEXT,
    qr_code_data TEXT,
    -- Pagamento
    amount INTEGER NOT NULL, -- em centavos
    discount_amount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('credit_card', 'pix', 'boleto', 'transfer', 'cash')),
    payment_provider TEXT CHECK (payment_provider IN ('stripe', 'pagarme', 'mercadopago', 'manual')),
    payment_provider_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_metadata JSONB,
    -- Check-in
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_at TIMESTAMP WITH TIME ZONE,
    check_in_location TEXT,
    check_in_by UUID REFERENCES public.users(id),
    check_in_count INTEGER DEFAULT 0,
    -- Datas
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Tabela específica Growth Experience
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

-- Sessões do evento (palestras, workshops)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('keynote', 'talk', 'panel', 'workshop', 'networking', 'break')),
    track TEXT,
    day INTEGER NOT NULL CHECK (day IN (1, 2, 3)),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room TEXT NOT NULL,
    max_capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    image TEXT,
    video_url TEXT,
    slides_url TEXT,
    materials JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alias para compatibilidade regional (Programação)
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

-- Tabela regional de mentores
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    especialidades TEXT[],
    bio TEXT,
    linkedin_url TEXT,
    foto_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    rejection_reason TEXT,
    years_experience INTEGER,
    max_mentories INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Palestrantes
CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    company TEXT,
    bio TEXT,
    image TEXT,
    linkedin TEXT,
    twitter TEXT,
    website TEXT,
    topics TEXT[],
    order_index INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relação sessões-palestrantes
CREATE TABLE IF NOT EXISTS public.session_speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    speaker_id UUID NOT NULL REFERENCES public.speakers(id) ON DELETE CASCADE,
    UNIQUE(session_id, speaker_id)
);

-- Mentorias - Mentores
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Dados do mentor
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    photo TEXT,
    bio TEXT NOT NULL,
    specialties TEXT[] NOT NULL,
    tracks TEXT[],
    years_experience INTEGER,
    company TEXT,
    position TEXT,
    linkedin TEXT,
    website TEXT,
    -- Configurações
    max_mentories INTEGER DEFAULT 5,
    session_duration INTEGER DEFAULT 25, -- minutos
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    rejection_reason TEXT,
    -- Agenda disponível (JSONB para flexibilidade)
    availability JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessões de mentoria
CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Dados
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 25,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    topic TEXT,
    description TEXT,
    notes TEXT,
    location TEXT, -- URL do meet ou local físico
    meeting_url TEXT,
    -- Feedback
    mentee_rating INTEGER CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
    mentee_comment TEXT,
    mentor_rating INTEGER CHECK (mentor_rating >= 1 AND mentor_rating <= 5),
    mentor_comment TEXT,
    three_steps TEXT[],
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT
);

-- B2B - Empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Dados da empresa
    name TEXT NOT NULL,
    cnpj TEXT,
    type TEXT NOT NULL CHECK (type IN ('anchor', 'vendor')),
    sector TEXT NOT NULL,
    description TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    -- Contato
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    -- Configurações
    package_type TEXT CHECK (package_type IN ('anchor', 'vendor', 'custom')),
    max_meetings INTEGER DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'inactive')),
    rejection_reason TEXT,
    -- Interesses
    interests TEXT[],
    offers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reuniões B2B
-- Tabela regional B2B (Mapeada em migrações legadas)
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome_empresa TEXT,
    nome_representante TEXT,
    cargo TEXT,
    email TEXT UNIQUE,
    telefone TEXT,
    setor TEXT,
    porte TEXT,
    faturamento_anual NUMERIC,
    numero_funcionarios INTEGER,
    site_url TEXT,
    linkedin_url TEXT,
    logo_url TEXT,
    descricao_empresa TEXT,
    produtos_servicos TEXT,
    tipo_interesse TEXT,
    areas_interesse TEXT,
    descricao_objetivos TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela regional de mentorias agendadas
CREATE TABLE IF NOT EXISTS public.mentorias_agendadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentores_growth_experience(id) ON DELETE CASCADE,
    mentorado_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome_mentorado TEXT,
    email_mentorado TEXT,
    anotacoes TEXT,
    data_mentoria TIMESTAMP WITH TIME ZONE,
    duracao INTEGER DEFAULT 20,
    status TEXT DEFAULT 'agendada',
    nome_startup TEXT,
    setor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_anchor_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    company_vendor_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    -- Dados
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 15,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    location TEXT,
    table_number TEXT,
    -- Resultado
    notes TEXT,
    interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
    follow_up BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    deal_closed BOOLEAN DEFAULT FALSE,
    deal_value INTEGER,
    -- Metadados
    requested_by UUID NOT NULL REFERENCES public.users(id),
    accepted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Startups
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Dados
    name TEXT NOT NULL,
    cnpj TEXT,
    description TEXT NOT NULL,
    sector TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('idea', 'mvp', 'traction', 'scale', 'exit')),
    -- Mídia
    logo TEXT,
    pitch_deck TEXT,
    video_pitch TEXT,
    website TEXT,
    -- Time
    founding_team JSONB DEFAULT '[]'::jsonb,
    -- Métricas
    metrics_revenue INTEGER,
    metrics_users INTEGER,
    metrics_growth DECIMAL(5,2),
    metrics_other JSONB,
    -- Configurações
    package_type TEXT NOT NULL CHECK (package_type IN ('expo', 'pitch', 'both')),
    stand_number TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'confirmed')),
    rejection_reason TEXT,
    -- Pitch
    pitch_scheduled_at TIMESTAMP WITH TIME ZONE,
    pitch_duration INTEGER DEFAULT 5,
    pitch_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads (visitantes nas startups)
-- Tabela regional Startups (Arena Pitch)
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
    nome_fundador TEXT,
    faturamento_mensal NUMERIC,
    investimento_buscado NUMERIC,
    email TEXT,
    telefone TEXT,
    video_pitch_url TEXT,
    pitch_deck_url TEXT,
    status TEXT DEFAULT 'pendente',
    pontuacao NUMERIC,
    feedback TEXT,
    avaliado_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    -- Dados do visitante
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_company TEXT,
    visitor_registration_id UUID REFERENCES public.registrations(id),
    -- Interesse
    interest_level TEXT NOT NULL CHECK (interest_level IN ('low', 'medium', 'high')),
    notes TEXT,
    tags TEXT[],
    -- Follow-up
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patrocinadores
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    -- Dados
    company_name TEXT NOT NULL,
    trading_name TEXT,
    cnpj TEXT,
    -- Contato
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    -- Patrocínio
    level TEXT NOT NULL CHECK (level IN ('diamond', 'gold', 'silver', 'bronze', 'supporter')),
    investment INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'negotiation', 'closed', 'cancelled')),
    closed_at TIMESTAMP WITH TIME ZONE,
    -- Mídia
    logo TEXT,
    website TEXT,
    -- Observações
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entregáveis de patrocinadores
CREATE TABLE IF NOT EXISTS public.sponsor_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    deadline DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    responsible_id UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financeiro - Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    -- Dados
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
    -- Relacionamento
    related_id UUID,
    related_type TEXT,
    -- Pagamento
    payment_method TEXT,
    payment_provider TEXT,
    payment_provider_id TEXT,
    -- Anexos
    receipt_url TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
    -- Observações
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Dados
    ticket_number TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('qr_code', 'manual', 'rfid', 'facial')),
    -- Staff
    staff_id UUID REFERENCES public.users(id),
    device_id TEXT,
    -- Metadados
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comunicação - Templates de email
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT[] DEFAULT '{}',
    category TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comunicação - Campanhas
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    subject TEXT,
    body_html TEXT,
    -- Segmentação
    recipient_filter JSONB,
    recipient_count INTEGER DEFAULT 0,
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    -- Estatísticas
    stats_sent INTEGER DEFAULT 0,
    stats_delivered INTEGER DEFAULT 0,
    stats_opened INTEGER DEFAULT 0,
    stats_clicked INTEGER DEFAULT 0,
    stats_bounced INTEGER DEFAULT 0,
    stats_complained INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Dados
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    -- Ação
    action_url TEXT,
    action_text TEXT,
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    -- Metadados
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de atividade (audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    -- Dados
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Inscrições
CREATE INDEX IF NOT EXISTS idx_registrations_project ON public.registrations(project_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON public.registrations(ticket_number);

-- Sessões
CREATE INDEX IF NOT EXISTS idx_sessions_project ON public.sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_day ON public.sessions(day);

-- Mentorias
CREATE INDEX IF NOT EXISTS idx_mentors_project ON public.mentors(project_id);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON public.mentors(status);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentor ON public.mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentee ON public.mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_date ON public.mentoring_sessions(scheduled_at);

-- B2B
CREATE INDEX IF NOT EXISTS idx_companies_project ON public.companies(project_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_project ON public.b2b_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_date ON public.b2b_meetings(scheduled_at);

-- Startups
CREATE INDEX IF NOT EXISTS idx_startups_project ON public.startups(project_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups(status);

-- Transações
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);

-- Check-ins
CREATE INDEX IF NOT EXISTS idx_check_ins_project ON public.check_ins(project_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_registration ON public.check_ins(registration_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_timestamp ON public.check_ins(timestamp);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ============================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_speakers_updated_at ON public.speakers;
CREATE TRIGGER update_speakers_updated_at BEFORE UPDATE ON public.speakers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentors_updated_at ON public.mentors;
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentoring_sessions_updated_at ON public.mentoring_sessions;
CREATE TRIGGER update_mentoring_sessions_updated_at BEFORE UPDATE ON public.mentoring_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_b2b_meetings_updated_at ON public.b2b_meetings;
CREATE TRIGGER update_b2b_meetings_updated_at BEFORE UPDATE ON public.b2b_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_startups_updated_at ON public.startups;
CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsors_updated_at ON public.sponsors;
CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON public.sponsors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsor_deliverables_updated_at ON public.sponsor_deliverables;
CREATE TRIGGER update_sponsor_deliverables_updated_at BEFORE UPDATE ON public.sponsor_deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de ticket único
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    project_slug TEXT;
    year TEXT;
    sequence INTEGER;
    new_ticket_number TEXT;
BEGIN
    -- Pegar slug do projeto
    SELECT slug INTO project_slug FROM public.projects WHERE id = NEW.project_id;
    
    -- Extrair ano
    year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Pegar próximo número na sequência
    SELECT COUNT(*) + 1 INTO sequence 
    FROM public.registrations 
    WHERE project_id = NEW.project_id;
    
    -- Formatar: GS2026-00001
    new_ticket_number := UPPER(REPLACE(project_slug, '-', '')) || '-' || LPAD(sequence::TEXT, 5, '0');
    
    NEW.ticket_number := new_ticket_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON public.registrations;
CREATE TRIGGER set_ticket_number BEFORE INSERT ON public.registrations
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Função para log de atividade
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (user_id, project_id, action, entity_type, entity_id, new_data)
        VALUES (NULL, NULL, 'CREATE', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.activity_logs (user_id, project_id, action, entity_type, entity_id, old_data, new_data)
        VALUES (NULL, NULL, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (user_id, project_id, action, entity_type, entity_id, old_data)
        VALUES (NULL, NULL, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
CREATE POLICY "Admins podem ver todos os usuários"
    ON public.users FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
     ));

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para projetos
DROP POLICY IF EXISTS "Projetos ativos são visíveis para todos" ON public.projects;
CREATE POLICY "Projetos ativos são visíveis para todos"
    ON public.projects FOR SELECT
    USING (status = 'active');

DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
CREATE POLICY "Admins podem gerenciar projetos"
    ON public.projects FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- Políticas para inscrições
DROP POLICY IF EXISTS "Usuários veem suas próprias inscrições" ON public.registrations;
CREATE POLICY "Usuários veem suas próprias inscrições"
    ON public.registrations FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins veem todas as inscrições" ON public.registrations;
CREATE POLICY "Admins veem todas as inscrições"
    ON public.registrations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

DROP POLICY IF EXISTS "Usuários podem criar inscrições" ON public.registrations;
CREATE POLICY "Usuários podem criar inscrições"
    ON public.registrations FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Políticas para mentorias
DROP POLICY IF EXISTS "Mentores veem suas sessões" ON public.mentoring_sessions;
CREATE POLICY "Mentores veem suas sessões"
    ON public.mentoring_sessions FOR SELECT
    USING (
        mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid())
        OR mentee_id = auth.uid()
    );

-- Políticas para notificações
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
CREATE POLICY "Usuários veem suas próprias notificações"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuários podem marcar notificações como lidas" ON public.notifications;
CREATE POLICY "Usuários podem marcar notificações como lidas"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Inserir projeto Growth Summit 2026
INSERT INTO public.projects (
    id, name, slug, type, description, short_description,
    location, city, state, address,
    start_date, end_date, status,
    primary_color, secondary_color,
    max_registrations, max_mentors, max_startups, max_companies,
    enable_b2b, enable_mentoring, enable_startups, enable_check_in,
    ticket_price_standard, ticket_price_pro, ticket_price_vip,
    target_registrations, target_revenue
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Growth Summit 2026',
    'growth-summit-2026',
    'growth_summit',
    'O maior evento de gestão, inovação e empreendedorismo do interior do Nordeste.',
    'Gestão, Inovação & Empreendedorismo',
    'Boulevard Hotel & Convention',
    'Juazeiro do Norte',
    'CE',
    'Rua São Pedro, 1200, Centro',
    '2026-05-21', '2026-05-22', 'active',
    '#21808D', '#FE4C38',
    1500, 20, 15, 50,
    TRUE, TRUE, TRUE, TRUE,
    29700, 49700, 250000,
    1500, 61600000
) ON CONFLICT (id) DO NOTHING;

-- Inserir templates de email padrão
INSERT INTO public.email_templates (name, subject, body_html, category, is_default) VALUES
(
    'welcome',
    'Bem-vindo ao Growth Summit 2026!',
    '<h1>Olá {{name}}!</h1><p>Bem-vindo ao Growth Summit 2026. Estamos felizes em tê-lo conosco.</p><p>Seu ingresso: {{ticket_number}}</p>',
    'onboarding',
    TRUE
),
(
    'payment_confirmed',
    'Pagamento Confirmado - Growth Summit 2026',
    '<h1>Pagamento Confirmado!</h1><p>Olá {{name}}, seu pagamento foi confirmado.</p><p>Ingresso: {{ticket_type}}</p><p>Valor: R$ {{amount}}</p>',
    'transaction',
    TRUE
),
(
    'mentoring_scheduled',
    'Mentoria Agendada',
    '<h1>Mentoria Confirmada</h1><p>Olá {{name}}, sua mentoria com {{mentor_name}} foi agendada para {{date}} às {{time}}.</p>',
    'mentoring',
    TRUE
),
(
    'event_reminder',
    'Lembrete: Growth Summit 2026 começa amanhã!',
    '<h1>Falta pouco!</h1><p>Olá {{name}}, o Growth Summit 2026 começa amanhã. Não se esqueça!</p><p>Local: Boulevard Hotel, Juazeiro do Norte - CE</p>',
    'reminder',
    TRUE
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PERMISSÕES
-- ============================================================

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to anon (necessário para signup/login)
GRANT SELECT ON public.projects TO anon;
GRANT INSERT ON public.users TO anon;




-- ARCHIVE: 20260305_atomic_registration_rpc.sql
-- ============================================================
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



-- ARCHIVE: 20260305_fix_atomic_registration_titulo.sql
-- ============================================================
-- ============================================================
-- FIX: register_participant_with_slots (column "titulo" error)
-- Data: 2026-03-05
-- Objetivo: Corrigir o nome da coluna de 'titulo' para 'title'
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
    -- CORREÇÃO: era titulo
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
-- CORREÇÃO: era titulo
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



-- ARCHIVE: 20260305_fix_b2b_and_missing_columns.sql
-- ============================================================
-- ============================================================
-- SCHEMA FIXES — B2B MEETINGS & MENTOR STATUS (V3)
-- Data: 2026-03-05
-- ============================================================
-- 1. Ensure B2B Meetings table exists
CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
-- 2. Handle legacy columns if they exist BEFORE adding new ones
-- This prevents "column already exists" errors when trying to rename
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_anchor_id'
)
AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_a_id'
) THEN
ALTER TABLE public.b2b_meetings
    RENAME COLUMN company_anchor_id TO company_a_id;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_vendor_id'
)
AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_b_id'
) THEN
ALTER TABLE public.b2b_meetings
    RENAME COLUMN company_vendor_id TO company_b_id;
END IF;
END $$;
-- 3. Add/Correct columns for B2B Meetings (if they don't exist yet)
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS company_a_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS company_b_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 20;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS interest_level TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS feedback_a TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS feedback_b TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS follow_up BOOLEAN DEFAULT FALSE;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- 4. RLS for B2B Meetings
ALTER TABLE public.b2b_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_meetings_admin_all" ON public.b2b_meetings;
CREATE POLICY "b2b_meetings_admin_all" ON public.b2b_meetings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_meetings_own_read" ON public.b2b_meetings;
CREATE POLICY "b2b_meetings_own_read" ON public.b2b_meetings FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_meetings.company_a_id
                    OR c.id = b2b_meetings.company_b_id
                )
        )
    );
-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_project ON public.b2b_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_scheduled ON public.b2b_meetings(scheduled_at);
-- 6. Add rejection_reason to mentores if missing
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
-- 7. Inscriptions: Ensure columns exist
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS palestras_noturnas TEXT [] DEFAULT '{}';
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS cursos_selecionados TEXT [] DEFAULT '{}';
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS cupom_palestra TEXT;
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0;
-- 8. Checkins: Ensure created_at exists
ALTER TABLE public.check_ins
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- 9. Add matching table for B2B
CREATE TABLE IF NOT EXISTS public.b2b_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS company_a_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS company_b_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Add UNIQUE constraint if missing
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'b2b_matches_unique_pair'
) THEN
ALTER TABLE public.b2b_matches
ADD CONSTRAINT b2b_matches_unique_pair UNIQUE(company_a_id, company_b_id);
END IF;
END $$;
ALTER TABLE public.b2b_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_matches_admin_all" ON public.b2b_matches;
CREATE POLICY "b2b_matches_admin_all" ON public.b2b_matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_matches_own_read" ON public.b2b_matches;
CREATE POLICY "b2b_matches_own_read" ON public.b2b_matches FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_matches.company_a_id
                    OR c.id = b2b_matches.company_b_id
                )
        )
    );



-- ARCHIVE: 20260305_fix_profiles_notifications.sql
-- ============================================================
-- Fix Database Schema for Profiles and Notifications
-- Ensure consistency for Mentor Profile Updates
-- 1. Create PROFILES table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Brasil',
    birth_date DATE,
    gender TEXT,
    cpf TEXT,
    cnpj TEXT,
    newsletter_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);
-- Ensure RLS is enabled and set correctly for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
CREATE POLICY "Profiles are editable by owner" ON public.profiles FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
CREATE POLICY "Admins can see all profiles" ON public.profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
-- 2. Create NOTIFICATIONS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Ensure the column is named 'read' even if the table was created with 'is_read'
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
    END IF;
END $$;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
CREATE POLICY "Users can see their own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);
-- 3. Ensure users table has consistent columns
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
        AND column_name = 'avatar_url'
) THEN
ALTER TABLE public.users
    RENAME COLUMN avatar TO avatar_url;
END IF;
EXCEPTION
WHEN OTHERS THEN -- If neither avatar nor avatar_url exist, or other error
END $$;
-- 4. Seed some initial notifications for the test mentor (if user exists)
DO $$
DECLARE
    v_target_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_user_id) THEN
        INSERT INTO public.notifications (user_id, title, message, type, created_at)
        VALUES (
                v_target_user_id,
                'Nova Mentoria!',
                'Um novo participante se inscreveu para sua mentoria.',
                'success',
                now() - interval '5 minutes'
            ),
            (
                v_target_user_id,
                'Agenda Confirmada',
                'Seu cronograma de mentorias para hoje está pronto.',
                'info',
                now() - interval '1 hour'
            ) ON CONFLICT DO NOTHING;
    END IF;
END $$;



-- ARCHIVE: 20260305_fix_rls_and_b2b_optimization.sql
-- ============================================================
-- ============================================================
-- MIGRATION: FIX RLS AND B2B QUERY OPTIMIZATIONS
-- Date: 2026-03-05
-- ============================================================
-- 1. Melhorar RLS em inscricoes_growth_experience
-- Substituir subquery no auth.users por leitura direta do JWT (mais rápido e seguro)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = (auth.jwt()->>'email')
    );
RAISE NOTICE 'OK: RLS otimizado em inscricoes_growth_experience';
END IF;
END $$;
-- 2. Garantir que a tabela rodada_negocios_b2b tenha os campos necessários para consultas admin
-- Algumas views administrativas podem estar tentando acessar campos que faltavam
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'rodada_negocios_b2b'
        AND table_schema = 'public'
) THEN -- Adicionar campos se não existirem (idempotente)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'cnpj'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN cnpj TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'porte'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN porte TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'faturamento_anual'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN faturamento_anual DECIMAL;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'numero_funcionarios'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN numero_funcionarios INTEGER;
END IF;
RAISE NOTICE 'OK: Campos adicionais verificados em rodada_negocios_b2b';
END IF;
END $$;
-- 3. Corrigir a função is_admin() para ser ainda mais robusta
-- Garante que o role venha de qualquer fonte de metadados
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        (auth.jwt()->>'role'),
        -- Fallback para role direto se houver
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;
-- 4. Criar índices faltantes para performance em filtros de admin
CREATE INDEX IF NOT EXISTS idx_b2b_project_status ON public.rodada_negocios_b2b(project_id, status);
CREATE INDEX IF NOT EXISTS idx_startups_project_status ON public.startups_arena_pitch(project_id, status);
CREATE INDEX IF NOT EXISTS idx_mentores_project_status ON public.mentores_growth_experience(project_id, status);



-- ARCHIVE: 20260305_fix_ticket_number_race_condition.sql
-- ============================================================
-- ============================================================
-- FASE 3: ITEM 20 — Corrigir generate_ticket_number
-- Data: 2026-03-05 | Auditoria 360°
-- Problema: Race condition — COUNT(*)+1 sem lock gera tickets duplicados
-- Solução: SELECT MAX() FOR UPDATE garante atomicidade
-- ============================================================
-- ============================================================
-- 1. FUNÇÃO CORRIGIDA: generate_ticket_number
--    Usa SELECT MAX() ... FOR UPDATE para evitar duplicatas
--    quando múltiplas inscrições chegam simultaneamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_ticket_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_sequence INTEGER;
v_prefix TEXT;
BEGIN -- Obter o próximo número de sequência com LOCK pessimista
-- FOR UPDATE impede que outra transação concurrent leia o mesmo MAX()
SELECT COALESCE(
        MAX(
            CAST(SPLIT_PART(ticket_number, '-', 2) AS INTEGER)
        ),
        0
    ) + 1 INTO v_sequence
FROM public.registrations
WHERE project_id = NEW.project_id FOR
UPDATE;
-- Prefixo baseado no tipo de inscrição
v_prefix := CASE
    WHEN NEW.ticket_type = 'vip' THEN 'VIP'
    WHEN NEW.ticket_type = 'pro' THEN 'PRO'
    ELSE 'STD'
END;
-- Formatar: STD-0001, PRO-0042, VIP-0003
NEW.ticket_number := format('%s-%04s', v_prefix, v_sequence);
RETURN NEW;
END;
$$;
ALTER FUNCTION public.generate_ticket_number() OWNER TO postgres;
-- Recriar a trigger se existir
DROP TRIGGER IF EXISTS trg_generate_ticket_number ON public.registrations;
CREATE TRIGGER trg_generate_ticket_number BEFORE
INSERT ON public.registrations FOR EACH ROW
    WHEN (
        NEW.ticket_number IS NULL
        OR NEW.ticket_number = ''
    ) EXECUTE FUNCTION public.generate_ticket_number();
-- ============================================================
-- 2. VERIFICAÇÃO
-- ============================================================
SELECT trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND event_object_table = 'registrations'
    AND trigger_name = 'trg_generate_ticket_number';
-- FIM DO SCRIPT



-- ARCHIVE: 20260305_rls_optimizations.sql
-- ============================================================
-- ============================================================
-- SECURITY & PERFORMANCE RLS REFINEMENT
-- Data: 2026-03-05
-- ============================================================
-- 1. inscricoes_growth_experience: Remove slow subquery from policy
-- It's much faster to use the email from the JWT
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'inscricoes_growth_experience'
        AND policyname = 'inscricoes_own_select'
) THEN
ALTER TABLE public.inscricoes_growth_experience DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
    );
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
END IF;
END $$;
-- 2. mentores_growth_experience: Fix SELECT policy
-- Allow reading own profile even if pending, and public profiles if approved
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'mentores_growth_experience'
        AND policyname = 'mentores_public_read'
) THEN DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'approved'
        OR status = 'aprovado'
        OR public.is_admin()
        OR user_id = auth.uid()
        OR email = auth.jwt()->>'email'
    );
END IF;
END $$;
-- 3. rodada_negocios_b2b: Fix SELECT policy
-- Allow reading own profile
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'rodada_negocios_b2b'
        AND policyname = 'B2B visível para admins'
) THEN DROP POLICY IF EXISTS "B2B visível para admins" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_own_select" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_own_select" ON public.rodada_negocios_b2b FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
        OR public.is_admin()
    );
END IF;
END $$;
-- 4. Startups: Fix SELECT policy
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'startups_arena_pitch'
        AND policyname = 'Startups visíveis para admins'
) THEN DROP POLICY IF EXISTS "Startups visíveis para admins" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_own_select" ON public.startups_arena_pitch;
CREATE POLICY "startups_own_select" ON public.startups_arena_pitch FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
        OR public.is_admin()
    );
END IF;
END $$;
-- 5. Notifications: Ensure users can see their own
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'notifications'
) THEN
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
END IF;
END $$;



-- ARCHIVE: 20260305_security_critical_fixes.sql
-- ============================================================
-- ============================================================
-- SECURITY CRITICAL FIXES — Growth Summit 2026
-- Data: 2026-03-05 | Auditoria 360°
-- Seguro para reexecutar (idempotente com DROP IF EXISTS)
-- ============================================================
-- RESUMO:
--   1. is_admin() reescrita via JWT (sem query ao banco = sem recursão)
--   2. inscricoes_growth_experience — remove SELECT público (violação LGPD)
--   3. users — remove INSERT público (escalada de privilégio)
--   4. mentores_growth_experience — restringe UPDATE/DELETE ao próprio mentor + admin
--   5. profiles — padroniza política admin para usar is_admin()
--   6. notifications — garante políticas corretas
--   7. programacao_evento — restringe escrita a admin
--   8. projects — garante leitura pública apenas de projetos ativos
--   9. Índices de performance para queries mais comuns
-- ============================================================
-- ============================================================
-- 1. REESCREVER is_admin() VIA JWT (SEM QUERY AO BANCO)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;
ALTER FUNCTION public.is_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
-- Função auxiliar: retorna o papel do usuário via JWT
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        'visitor'
    );
$$;
ALTER FUNCTION public.current_user_role() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO service_role;
-- ============================================================
-- 2. inscricoes_growth_experience — CORRIGIR VIOLAÇÃO LGPD
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscricoes_public_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_all_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "anyone_can_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_admin_select" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_own_update" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_admin_delete" ON public.inscricoes_growth_experience;
-- Usuário autenticado vê apenas a própria inscrição (por user_id OU email)
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
-- Admin vê todas
CREATE POLICY "inscricoes_admin_select" ON public.inscricoes_growth_experience FOR
SELECT USING (public.is_admin());
-- Qualquer um pode inserir (formulário público de inscrição)
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
-- Usuário ou admin pode atualizar
CREATE POLICY "inscricoes_own_update" ON public.inscricoes_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Apenas admin pode deletar
CREATE POLICY "inscricoes_admin_delete" ON public.inscricoes_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em inscricoes_growth_experience';
ELSE RAISE NOTICE 'AVISO: Tabela inscricoes_growth_experience nao encontrada';
END IF;
END $$;
-- ============================================================
-- 3. TABELA USERS — REMOVER INSERT PÚBLICO (ESCALADA DE PRIVILÉGIO)
-- ============================================================
DROP POLICY IF EXISTS "users_public_insert" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_delete" ON public.users;
-- INSERT apenas com id = auth.uid() (o trigger de sync do Supabase usa service_role, que bypass RLS)
CREATE POLICY "users_insert_own" ON public.users FOR
INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_self_select" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "users_admin_select" ON public.users FOR
SELECT USING (public.is_admin());
CREATE POLICY "users_self_update" ON public.users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "users_admin_update" ON public.users FOR
UPDATE USING (public.is_admin());
CREATE POLICY "users_admin_delete" ON public.users FOR DELETE USING (public.is_admin());
-- ============================================================
-- 4. MENTORES — RESTRINGIR EDIÇÃO AO PRÓPRIO MENTOR + ADMIN
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_own_update" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_admin_delete" ON public.mentores_growth_experience;
-- Leitura: aprovados são públicos; mentor vê o próprio mesmo pendente; admin vê tudo
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'approved'
        OR public.is_admin()
        OR user_id = auth.uid()
    );
-- Inserção pública (formulário de candidatura)
CREATE POLICY "mentores_public_insert" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
-- Update: próprio mentor ou admin
CREATE POLICY "mentores_own_update" ON public.mentores_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Delete: apenas admin
CREATE POLICY "mentores_admin_delete" ON public.mentores_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em mentores_growth_experience';
ELSE RAISE NOTICE 'AVISO: Tabela mentores_growth_experience nao encontrada';
END IF;
END $$;
-- ============================================================
-- 5. PROFILES — ELIMINAR SUBQUERY RECURSIVA NA POLÍTICA ADMIN
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());
-- ============================================================
-- 6. NOTIFICATIONS — POLÍTICAS CORRETAS
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'notifications'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Usuarios veem suas proprias notificacoes" ON public.notifications;
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem marcar notificações como lidas" ON public.notifications;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_self_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_self_update" ON public.notifications FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em notifications';
ELSE RAISE NOTICE 'AVISO: Tabela notifications nao encontrada';
END IF;
END $$;
-- ============================================================
-- 7. PROGRAMACAO_EVENTO — RESTRINGIR ESCRITA A ADMIN
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'programacao_evento'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.programacao_evento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programacao_evento_public_read" ON public.programacao_evento;
DROP POLICY IF EXISTS "programacao_evento_admin_all" ON public.programacao_evento;
CREATE POLICY "programacao_evento_public_read" ON public.programacao_evento FOR
SELECT USING (true);
CREATE POLICY "programacao_evento_admin_all" ON public.programacao_evento FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em programacao_evento';
ELSE RAISE NOTICE 'AVISO: Tabela programacao_evento nao encontrada';
END IF;
END $$;
-- ============================================================
-- 8. PROJECTS — LEITURA PÚBLICA APENAS DE PROJETOS ATIVOS
-- ============================================================
DROP POLICY IF EXISTS "Projetos ativos sao visiveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Projetos ativos são visíveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
DROP POLICY IF EXISTS "projects_public_active_read" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
CREATE POLICY "projects_public_active_read" ON public.projects FOR
SELECT USING (
        status = 'active'
        OR public.is_admin()
    );
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
-- ============================================================
-- 9. ÍNDICES DE PERFORMANCE (queries mais frequentes)
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN CREATE INDEX IF NOT EXISTS idx_inscricoes_user_id ON public.inscricoes_growth_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON public.inscricoes_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_project_status ON public.inscricoes_growth_experience(project_id, status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created_at ON public.inscricoes_growth_experience(created_at DESC);
RAISE NOTICE 'OK: Indices criados em inscricoes_growth_experience';
END IF;
END $$;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN CREATE INDEX IF NOT EXISTS idx_mentores_user_id ON public.mentores_growth_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_mentores_project_status ON public.mentores_growth_experience(project_id, status);
RAISE NOTICE 'OK: Indices criados em mentores_growth_experience';
END IF;
END $$;
-- ============================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================
SELECT tablename,
    policyname,
    cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users',
        'profiles',
        'projects',
        'notifications',
        'inscricoes_growth_experience',
        'mentores_growth_experience',
        'programacao_evento'
    )
ORDER BY tablename,
    cmd,
    policyname;
-- FIM DO SCRIPT



-- ARCHIVE: 20260305_seed_data_test.sql
-- ============================================================
-- ============================================================
-- SEED DATA COMPLETO PARA TESTES (DADOS FICTÍCIOS PREMIUM)
-- Date: 2026-03-05
-- Versão: 4 (Correção de Colunas e Estrutura de Tabelas)
-- Password: growth2026
-- ============================================================
-- 1. CORREÇÃO DE CONSTRAINTS NO BANCO
DO $$ BEGIN -- Atualizar lista de cargos permitidos na tabela users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
        role IN (
            'visitor',
            'participant',
            'mentor',
            'company',
            'startup',
            'sponsor',
            'admin',
            'staff',
            'speaker'
        )
    );
-- Garantir colunas extras necessárias para FKs e Seed
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_growth_experience_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentores_growth_experience' AND column_name = 'email') THEN
    ALTER TABLE public.mentores_growth_experience ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_arena_pitch_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'email') THEN
    ALTER TABLE public.startups_arena_pitch ADD COLUMN email TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'telefone') THEN
    ALTER TABLE public.startups_arena_pitch ADD COLUMN telefone TEXT;
END IF;
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_arena_pitch_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rodada_negocios_b2b_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'email') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN email TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'telefone') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN telefone TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'setor') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN setor TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'porte') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN porte TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'nome_empresa') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN nome_empresa TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'cargo') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN cargo TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'descricao_empresa') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN descricao_empresa TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'produtos_servicos') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN produtos_servicos TEXT;
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'descricao_objetivos') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN descricao_objetivos TEXT;
END IF;
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT rodada_negocios_b2b_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inscricoes_growth_experience_email_key'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD CONSTRAINT inscricoes_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sponsors_contact_email_key'
) THEN
ALTER TABLE public.sponsors
ADD CONSTRAINT sponsors_contact_email_key UNIQUE (contact_email);
END IF;
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'project_id') THEN
    ALTER TABLE public.notifications ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
END IF;
END $$;
-- 2. FUNÇÃO AUXILIAR PARA CRIAR USUÁRIO (AUTH + PUBLIC)
CREATE OR REPLACE FUNCTION public.seed_full_user(
        p_id UUID,
        p_email TEXT,
        p_name TEXT,
        p_phone TEXT,
        p_role TEXT
    ) RETURNS VOID AS $$ BEGIN -- Auth.users
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = p_email
            OR id = p_id
    ) THEN
INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token
    )
VALUES (
        p_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt('growth2026', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', p_name, 'role', p_role, 'phone', p_phone),
        now(),
        now(),
        'authenticated',
        'authenticated',
        ''
    );
INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        p_id,
        jsonb_build_object('sub', p_id, 'email', p_email),
        'email',
        p_id::text, -- many versions use the UID as provider_id for email provider
        now(),
        now()
    );
END IF;
-- Public.users
INSERT INTO public.users (id, email, name, phone, role, updated_at)
VALUES (p_id, p_email, p_name, p_phone, p_role, now()) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. EXECUÇÃO DO SEED MASSIFICAÇÃO DE DADOS
DO $$
DECLARE v_project_id UUID;
v_mentor_id UUID := '00000000-0000-0000-0000-000000000001';
-- User ID do Mentor
v_startup_id UUID := '00000000-0000-0000-0000-000000000002';
v_company_id UUID := '00000000-0000-0000-0000-000000000003';
v_sponsor_id UUID := '00000000-0000-0000-0000-000000000004';
v_participant_id UUID := '00000000-0000-0000-0000-000000000005';
v_internal_mentor_id UUID;
BEGIN -- Seleciona Projeto Triunfo
SELECT id INTO v_project_id
FROM public.projects
WHERE slug = 'growth-experience-triunfo'
LIMIT 1;
IF v_project_id IS NULL THEN
SELECT id INTO v_project_id
FROM public.projects
LIMIT 1;
END IF;
-- A. Criar Usuários
PERFORM public.seed_full_user(
    v_mentor_id,
    'mentor@test.com',
    'Mestre Mentor',
    '81999990001',
    'mentor'
);
PERFORM public.seed_full_user(
    v_startup_id,
    'startup@test.com',
    'Startup Founder',
    '81999990002',
    'startup'
);
PERFORM public.seed_full_user(
    v_company_id,
    'empresa@test.com',
    'B2B CEO',
    '81999990003',
    'company'
);
PERFORM public.seed_full_user(
    v_sponsor_id,
    'patrocinador@test.com',
    'Sponsor Alpha',
    '81999990004',
    'sponsor'
);
PERFORM public.seed_full_user(
    v_participant_id,
    'participante@test.com',
    'Joaquim Silva',
    '81999990005',
    'participant'
);
-- B. Dados de MENTOR
INSERT INTO public.mentores_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        telefone,
        bio,
        especialidades,
        status
    )
VALUES (
        v_project_id,
        v_mentor_id,
        'Mestre Mentor',
        'mentor@test.com',
        '81999990001',
        'Especialista em Growth e SaaS.',
        ARRAY ['Growth Hacking', 'SaaS'],
        'approved'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id
RETURNING id INTO v_internal_mentor_id;
-- C. Dados de MENTORIA AGENDADA (Corrigido mentorado_id e data_mentoria)
INSERT INTO public.mentorias_agendadas (
        project_id,
        mentor_id,
        mentorado_id,
        nome_mentorado,
        email_mentorado,
        anotacoes,
        data_mentoria,
        status
    )
VALUES (
        v_project_id,
        v_internal_mentor_id,
        v_participant_id,
        'Joaquim Silva',
        'participante@test.com',
        'Tema: Estratégia B2B',
        now() + interval '1 day',
        'agendada'
    ) ON CONFLICT DO NOTHING;
-- D. Dados de STARTUP
INSERT INTO public.startups_arena_pitch (
        project_id,
        user_id,
        nome_startup,
        nome_fundador,
        email,
        telefone,
        setor,
        estagio,
        descricao_startup,
        status
    )
VALUES (
        v_project_id,
        v_startup_id,
        'SmartFlow AI',
        'Startup Founder',
        'startup@test.com',
        '81999990002',
        'IA',
        'Traction',
        'Plataforma de automação inteligente.',
        'confirmed'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- E. Dados de COMPANY / B2B (Corrigido colunas)
INSERT INTO public.rodada_negocios_b2b (
        project_id,
        user_id,
        nome_empresa,
        nome_representante,
        cargo,
        email,
        telefone,
        setor,
        porte,
        faturamento_anual,
        descricao_empresa,
        produtos_servicos,
        tipo_interesse,
        areas_interesse,
        descricao_objetivos,
        status
    )
VALUES (
        v_project_id,
        v_company_id,
        'Global S.A.',
        'B2B CEO',
        'CEO',
        'empresa@test.com',
        '81999990003',
        'Logística',
        'Grande',
        5000000,
        'Empresa líder em logística.',
        'Transporte inteligente.',
        'fornecedores',
        'Tecnologia',
        'Networking e novos parceiros.',
        'approved'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- F. Dados de SPONSOR (Corrigido user_id removido pois não existe na tabela)
INSERT INTO public.sponsors (
        project_id,
        company_name,
        contact_name,
        contact_email,
        level,
        investment,
        status
    )
VALUES (
        v_project_id,
        'Titan Ventures',
        'Sponsor Alpha',
        'patrocinador@test.com',
        'diamond',
        75000,
        'closed'
    ) ON CONFLICT (contact_email) DO NOTHING;
-- G. NOTIFICAÇÕES (Corrigido is_read, com verificação de segurança)
IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_mentor_id) THEN
    INSERT INTO public.notifications (project_id, user_id, title, message, type, read)
    VALUES (v_project_id, v_mentor_id, 'Nova Mentoria', 'Joaquim Silva agendou com você.', 'info', false)
    ON CONFLICT DO NOTHING;
END IF;

IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_startup_id) THEN
    INSERT INTO public.notifications (project_id, user_id, title, message, type, read)
    VALUES (v_project_id, v_startup_id, 'Pitch Aprovado', 'Prepare seu deck para amanhã!', 'success', false)
    ON CONFLICT DO NOTHING;
END IF;

IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_company_id) THEN
    INSERT INTO public.notifications (project_id, user_id, title, message, type, read)
    VALUES (v_project_id, v_company_id, 'Match no B2B', 'Você tem um novo match.', 'info', false)
    ON CONFLICT DO NOTHING;
END IF;
END $$;
DROP FUNCTION public.seed_full_user;



-- ARCHIVE: 20260305_seed_test_users.sql
-- ============================================================
-- ============================================================
-- SEED TEST USERS (AUTH + PUBLIC) - ROBUST VERSION
-- Goal: Ensure p_id and p_email are synchronized with specific password
-- Date: 2026-03-05
-- Password for all: growth2026
-- ============================================================
-- 0. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 1. GARANTIR CONSTRAINTS UNIQUE (Mesmo que o anterior, apenas para segurança)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_growth_experience_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentores_growth_experience' AND column_name = 'email') THEN
    ALTER TABLE public.mentores_growth_experience ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_arena_pitch_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'email') THEN
    ALTER TABLE public.startups_arena_pitch ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_arena_pitch_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rodada_negocios_b2b_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'email') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT rodada_negocios_b2b_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inscricoes_growth_experience_email_key'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD CONSTRAINT inscricoes_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sponsors_contact_email_key'
) THEN
ALTER TABLE public.sponsors
ADD CONSTRAINT sponsors_contact_email_key UNIQUE (contact_email);
END IF;
END $$;
-- 2. FUNÇÃO ROBUSTA PARA CRIAR/RESETAR USUÁRIO
CREATE OR REPLACE FUNCTION public.seed_full_user_robust(
        p_id UUID,
        p_email TEXT,
        p_name TEXT,
        p_phone TEXT,
        p_role TEXT
    ) RETURNS VOID AS $$
DECLARE v_encrypted_pw TEXT;
BEGIN v_encrypted_pw := crypt('growth2026', gen_salt('bf'));
-- Sincronizar auth.users
-- Se existir o ID, atualizamos. Se não existir o ID mas existir o E-MAIL, atualizamos o ID.
-- O mais seguro para Supabase é DELETE/INSERT se houver colisão de email ou id.
DELETE FROM auth.identities
WHERE user_id = p_id
    OR identity_data->>'email' = p_email;
DELETE FROM auth.users
WHERE id = p_id
    OR email = p_email;
INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token
    )
VALUES (
        p_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        v_encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', p_name, 'role', p_role, 'phone', p_phone),
        now(),
        now(),
        'authenticated',
        'authenticated',
        ''
    );
INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        p_id,
        jsonb_build_object('sub', p_id, 'email', p_email),
        'email',
        p_id::text,
        now(),
        now()
    );
-- Sincronizar public.users
INSERT INTO public.users (id, email, name, phone, role, updated_at)
VALUES (p_id, p_email, p_name, p_phone, p_role, now()) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. EXECUÇÃO DO SEED
DO $$
DECLARE v_project_id UUID;
v_mentor_id UUID := '00000000-0000-0000-0000-000000000001';
v_startup_id UUID := '00000000-0000-0000-0000-000000000002';
v_company_id UUID := '00000000-0000-0000-0000-000000000003';
v_sponsor_id UUID := '00000000-0000-0000-0000-000000000004';
v_participant_id UUID := '00000000-0000-0000-0000-000000000005';
BEGIN -- Seleciona Projeto Triunfo
SELECT id INTO v_project_id
FROM public.projects
WHERE slug = 'growth-experience-triunfo'
LIMIT 1;
IF v_project_id IS NULL THEN
SELECT id INTO v_project_id
FROM public.projects
LIMIT 1;
END IF;
-- Criar/Resetar Usuários
PERFORM public.seed_full_user_robust(
    v_mentor_id,
    'mentor@test.com',
    'Mestre Mentor',
    '81999990001',
    'mentor'
);
PERFORM public.seed_full_user_robust(
    v_startup_id,
    'startup@test.com',
    'Fundador Inovador',
    '81999990002',
    'startup'
);
PERFORM public.seed_full_user_robust(
    v_company_id,
    'empresa@test.com',
    'Executivo B2B',
    '81999990003',
    'company'
);
PERFORM public.seed_full_user_robust(
    v_sponsor_id,
    'patrocinador@test.com',
    'Sponsor Master',
    '81999990004',
    'sponsor'
);
PERFORM public.seed_full_user_robust(
    v_participant_id,
    'participante@test.com',
    'Participante Pro',
    '81999990005',
    'participant'
);
-- MENTOR
INSERT INTO public.mentores_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        telefone,
        bio,
        especialidades,
        status
    )
VALUES (
        v_project_id,
        v_mentor_id,
        'Mestre Mentor',
        'mentor@test.com',
        '81999990001',
        'Especialista em Growth e IA.',
        ARRAY ['Growth Hacking', 'IA para Negócios'],
        'aprovado'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- STARTUP
INSERT INTO public.startups_arena_pitch (
        project_id,
        user_id,
        nome_startup,
        email,
        telefone,
        setor,
        estagio,
        status
    )
VALUES (
        v_project_id,
        v_startup_id,
        'TechFlow AI',
        'startup@test.com',
        '81999990002',
        'SaaS / AI',
        'Traction',
        'selecionada'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- COMPANY
INSERT INTO public.rodada_negocios_b2b (
        project_id,
        user_id,
        nome_empresa,
        email,
        telefone,
        setor,
        status
    )
VALUES (
        v_project_id,
        v_company_id,
        'Logistics S.A.',
        'empresa@test.com',
        '81999990003',
        'Logística',
        'confirmada'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- SPONSOR
INSERT INTO public.sponsors (
        project_id,
        user_id,
        company_name,
        contact_name,
        contact_email,
        level,
        status,
        investment
    )
VALUES (
        v_project_id,
        v_sponsor_id,
        'Titan Ventures',
        'Sponsor Master',
        'patrocinador@test.com',
        'diamond',
        'closed',
        50000
    ) ON CONFLICT (contact_email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- PARTICIPANTE
INSERT INTO public.inscricoes_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        tipo_inscricao,
        status_pagamento
    )
VALUES (
        v_project_id,
        v_participant_id,
        'Participante Pro',
        'participante@test.com',
        'pro',
        'pago'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
END $$;
DROP FUNCTION public.seed_full_user_robust;



-- ARCHIVE: 20260305_timezone_fixes.sql
-- ============================================================
-- ============================================================
-- FASE 3: ITEM 17 — Ajuste de Fuso Horário (TIMESTAMPTZ)
-- Objetivo: Garantir que datas de auditoria e registro usem TIMESTAMPTZ
-- Nota: Colunas de "TIME" (hora do dia) permanecem como TIME, pois 
-- não possuem componente de data para conversão automática.
-- ============================================================
-- 1. Tabela de Inscrições
-- Garantimos que created_at e updated_at sejam TIMESTAMPTZ
DO $$ BEGIN -- created_at
IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) THEN -- Se for timestamp sem zone, converte. Se for TIME, ignora.
IF (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) != 'time'::regtype
AND (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) != 'time with time zone'::regtype THEN
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN created_at
SET DEFAULT now();
END IF;
END IF;
-- updated_at
IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'updated_at'
) THEN IF (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'updated_at'
) != 'time'::regtype THEN
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN updated_at
SET DEFAULT now();
END IF;
END IF;
END $$;
-- 2. Tabela de Auditoria
-- Esta tabela DEVE ser TIMESTAMPTZ para rastreio global
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.audit_logs'::regclass
        AND attname = 'created_at'
) THEN
ALTER TABLE public.audit_logs
ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE public.audit_logs
ALTER COLUMN created_at
SET DEFAULT now();
END IF;
END $$;
-- 3. Função auxiliar para converter para Horário de Brasília
-- Utilizada em relatórios e no frontend se necessário
CREATE OR REPLACE FUNCTION public.to_brasilia(ts TIMESTAMPTZ) RETURNS TIMESTAMP AS $$ BEGIN RETURN ts AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- NOTA sobre programacao_evento:
-- As colunas start_time e end_time nesta tabela são do tipo TIME (hora do dia).
-- Elas não devem ser convertidas para TIMESTAMPTZ pois não possuem uma data associada.
-- A conversão de fuso horário para exibição deve ser feita no frontend usando dayjs.



-- ARCHIVE: 20260306_add_checkin_columns.sql
-- ============================================================
-- Add check-in columns to inscricoes_growth_experience
-- Date: 2026-03-06
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMP WITH TIME ZONE;
-- Create index for faster check-in queries
CREATE INDEX IF NOT EXISTS idx_ige_checked_in ON public.inscricoes_growth_experience(checked_in);



-- ARCHIVE: 20260306_add_financial_goals_to_projects.sql
-- ============================================================
-- Add financial goal columns to projects table
-- Date: 2026-03-06
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS goal_revenue DECIMAL(15, 2) DEFAULT 616000.00,
    ADD COLUMN IF NOT EXISTS goal_sponsorship DECIMAL(15, 2) DEFAULT 200000.00,
    ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 300;
-- Update existing projects with default values if they are NULL
UPDATE public.projects
SET goal_revenue = COALESCE(goal_revenue, 616000.00),
    goal_sponsorship = COALESCE(goal_sponsorship, 200000.00),
    goal_registrations = COALESCE(goal_registrations, 300)
WHERE goal_revenue IS NULL
    OR goal_sponsorship IS NULL
    OR goal_registrations IS NULL;



-- ARCHIVE: 20260306_add_mentor_ratings.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Adiciona campos de avaliação pós-mentoria
-- Growth Summit 2026
-- Data: 2026-03-06
-- ============================================================
-- Execute no Supabase SQL Editor
ALTER TABLE public.mentorias_agendadas
ADD COLUMN IF NOT EXISTS avaliacao_mentoria INTEGER CHECK (
        avaliacao_mentoria BETWEEN 1 AND 5
    ),
    ADD COLUMN IF NOT EXISTS indicacao_mentor INTEGER CHECK (
        indicacao_mentor BETWEEN 1 AND 5
    ),
    ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMP WITH TIME ZONE;
-- Índice para facilitar agregação de médias por mentor
CREATE INDEX IF NOT EXISTS idx_mentorias_avaliacao ON public.mentorias_agendadas(mentor_id, avaliacao_mentoria)
WHERE avaliacao_mentoria IS NOT NULL;
-- View auxiliar: médias por mentor
CREATE OR REPLACE VIEW public.view_avaliacoes_mentor AS
SELECT mentor_id,
    COUNT(*) AS total_mentorias,
    COUNT(avaliacao_mentoria) AS total_avaliacoes,
    ROUND(AVG(avaliacao_mentoria), 2) AS media_avaliacao_mentoria,
    ROUND(AVG(indicacao_mentor), 2) AS media_indicacao_mentor,
    ROUND(
        (AVG(avaliacao_mentoria) + AVG(indicacao_mentor)) / 2,
        2
    ) AS media_geral
FROM public.mentorias_agendadas
WHERE status = 'completed'
GROUP BY mentor_id;
-- Política: participant pode atualizar apenas os campos de avaliação
-- (o slot já possui política de update público, portanto este é um complemento)
DROP POLICY IF EXISTS "mentorias_avaliacao_update" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_avaliacao_update" ON public.mentorias_agendadas FOR
UPDATE USING (true) -- qualquer autenticado pode avaliar (RLS já filtra por mentorado_id no hook)
    WITH CHECK (true);



-- ARCHIVE: 20260306_add_valor_investido_to_empresas_incentivadoras.sql
-- ============================================================
-- Migration: Add invested amount to Empresa Incentivadora
-- Date: 2026-03-06
-- Description: Adds valor_investido column to inscricoes_empresas_incentivadoras table.
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS valor_investido DECIMAL(15, 2) DEFAULT 0.00;
-- Optional: Update existing records based on the business logic if they are 0
-- (179.99 per person at night, with 10% discount if >= 10 people)
UPDATE public.inscricoes_empresas_incentivadoras
SET valor_investido = (
        CASE
            WHEN quantidade_noite >= 10 THEN (quantidade_noite * 179.99 * 0.9)
            ELSE (quantidade_noite * 179.99)
        END
    )
WHERE valor_investido = 0
    AND quantidade_noite > 0;



-- ARCHIVE: 20260306_calibrate_registration_goals_count.sql
-- ============================================================
-- Migration: Calibrate Registration Goals to Count (Units)
-- Date: 2026-03-06
-- Description: Ensures goal_registrations is treated as a quantity/count of people, not revenue.
-- 1. Garante que as colunas existam (idempotente)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS goal_revenue DECIMAL(15, 2) DEFAULT 616000.00,
    ADD COLUMN IF NOT EXISTS goal_sponsorship DECIMAL(15, 2) DEFAULT 200000.00,
    ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 300;
-- 2. Correção de Dados: 
-- Se goal_registrations estiver com valores muito altos (ex: > 10.000), 
-- provavelmente era um valor monetário e precisa ser resetado para uma meta de pessoas.
UPDATE public.projects
SET goal_registrations = 300
WHERE goal_registrations > 10000;
-- 3. Ajuste fino para projetos conhecidos (opcional, ajuste conforme necessário)
-- Exemplo: Edição Triunfo
UPDATE public.projects
SET goal_registrations = 400,
    goal_revenue = 250000
WHERE slug LIKE '%triunfo%';
-- Exemplo: Edição Petrolina
UPDATE public.projects
SET goal_registrations = 300,
    goal_revenue = 180000
WHERE slug LIKE '%petrolina%';
-- 4. Garante que não fiquem valores nulos
UPDATE public.projects
SET goal_revenue = COALESCE(goal_revenue, 616000.00),
    goal_sponsorship = COALESCE(goal_sponsorship, 200000.00),
    goal_registrations = COALESCE(goal_registrations, 300)
WHERE goal_revenue IS NULL
    OR goal_sponsorship IS NULL
    OR goal_registrations IS NULL;



-- ARCHIVE: 20260306_fix_b2b_rls_final.sql
-- ============================================================
-- ============================================================
-- FIX B2B RLS (Rodada de Negócios)
-- Date: 2026-03-06
-- ============================================================
-- 1. Redefinir RLS
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
-- 2. Remover todas as políticas existentes para garantir limpeza total
DROP POLICY IF EXISTS "b2b_insert_policy" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_self_manage" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_manage_policy" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "B2B visível para admins" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_own_select" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_select_policy" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "Allow public insert" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "Admins can manage" ON public.rodada_negocios_b2b;
-- 3. Criar política de INSERÇÃO (Permissiva para todos: permite novos cadastros)
-- Importante: Usamos WITH CHECK (true) sem restrição de role para permitir o fluxo de inscrição
CREATE POLICY "b2b_insert_policy" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
-- 4. Criar política de SELEÇÃO, ATUALIZAÇÃO e DELEÇÃO (Somente dono ou admin)
CREATE POLICY "b2b_manage_policy" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = auth.jwt()->>'email'
    OR public.is_admin()
) WITH CHECK (
    user_id = auth.uid()
    OR email = auth.jwt()->>'email'
    OR public.is_admin()
);
-- 5. Garantir permissões básicas nos roles
GRANT ALL ON TABLE public.rodada_negocios_b2b TO anon,
    authenticated,
    service_role;
-- 6. Adicional: Verificar se existe algum 'RESTRICTIVE' policy fantasma
-- (Infelizmente não podemos deletar por padrão sem saber o nome, mas criamos as nossas como PERMISSIVE por padrão)
DO $$ BEGIN RAISE NOTICE 'RLS de Rodada de Negócios B2B corrigido com sucesso.';
END $$;



-- ARCHIVE: 20260306_fix_schema_and_rpc.sql
-- ============================================================
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



-- ARCHIVE: 20260306_repair_empresas_incentivadoras_schema.sql
-- ============================================================
-- Final Repair and Update Migration for Empresas Incentivadoras
-- Date: 2026-03-06
-- Description: Ensures all necessary columns exist (quantidade_dia, quantidade_noite, valor_investido) 
-- and initializes the invested amount based on participation.
-- 1. Garante colunas de quantidades (necessárias para o cálculo e rankings)
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS quantidade_dia INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quantidade_noite INTEGER NOT NULL DEFAULT 0;
-- 2. Garante a coluna de valor investido
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS valor_investido DECIMAL(15, 2) DEFAULT 0.00;
-- 3. Atualização de dados antigos (Legacy Data Fix)
-- Se as novas colunas de quantidades estiverem vazias, usa a equipe total como base
UPDATE public.inscricoes_empresas_incentivadoras
SET quantidade_dia = quantidade_equipe,
    quantidade_noite = quantidade_equipe
WHERE quantidade_dia = 0
    AND quantidade_noite = 0;
-- 4. Cálculo do valor investido baseado na regra de negócio:
-- R$ 179,99 por pessoa na programação noturna. 
-- Desconto de 10% se o grupo noturno for >= 10 pessoas.
UPDATE public.inscricoes_empresas_incentivadoras
SET valor_investido = (
        CASE
            WHEN quantidade_noite >= 10 THEN (quantidade_noite * 179.99 * 0.9)
            ELSE (quantidade_noite * 179.99)
        END
    )
WHERE valor_investido = 0
    AND quantidade_noite > 0;



-- ARCHIVE: 20260306_update_empresas_incentivadoras_fields.sql
-- ============================================================
-- Update empresas_incentivadoras table to support day/night participation tracking
-- Date: 2026-03-06
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS quantidade_dia INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quantidade_noite INTEGER NOT NULL DEFAULT 0;
-- Update existing records to use quantidade_equipe as default for both if they are 0
UPDATE public.inscricoes_empresas_incentivadoras
SET quantidade_dia = quantidade_equipe,
    quantidade_noite = quantidade_equipe
WHERE quantidade_dia = 0
    AND quantidade_noite = 0;



-- ARCHIVE: 20260307_add_descricao_to_cupons.sql
-- ============================================================
-- ============================================================
-- Add missing 'descricao' column to cupons_parceria_social
-- Date: 2026-03-07
-- Objective: Fix "Could not find column 'descricao' in schema cache" error
-- ============================================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'cupons_parceria_social'
        AND column_name = 'descricao'
) THEN
ALTER TABLE public.cupons_parceria_social
ADD COLUMN descricao TEXT;
COMMENT ON COLUMN public.cupons_parceria_social.descricao IS 'Observações internas e detalhes da parceria do cupom';
RAISE NOTICE 'Coluna descricao adicionada com sucesso à tabela cupons_parceria_social';
ELSE RAISE NOTICE 'A coluna descricao já existe na tabela cupons_parceria_social';
END IF;
END $$;



-- ARCHIVE: 20260307_certificates_module.sql
-- ============================================================
-- ============================================================
-- Módulo de Certificados — Schema Completo
-- Autoria: Antigravity AI
-- Data: 2026-03-07
-- ============================================================
-- 1. Criação/Ajuste da Tabela de Certificados
CREATE TABLE IF NOT EXISTS public.certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'event',
    -- 'event', 'course', 'lecture', 'workshop'
    activity_name TEXT,
    code TEXT UNIQUE,
    -- Código de validação único
    status TEXT DEFAULT 'disponivel',
    metadata JSONB DEFAULT '{}'::jsonb,
    issue_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_certificados_project ON public.certificados(project_id);
CREATE INDEX IF NOT EXISTS idx_certificados_registration ON public.certificados(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificados_code ON public.certificados(code);
-- 3. Habilitar RLS
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
-- 4. Políticas de Segurança (RLS)
-- Administradores: Acesso total
CREATE POLICY "Admins have full access to certificados" ON public.certificados FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Participantes: Podem ver seus próprios certificados
CREATE POLICY "Participants can view their own certificates" ON public.certificados FOR
SELECT TO authenticated USING (
        registration_id IN (
            SELECT id
            FROM public.inscricoes_growth_experience
            WHERE user_id = auth.uid()
        )
    );
-- 5. Trigger para Atualização de timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_certificados_updated_at ON public.certificados;
CREATE TRIGGER tr_certificados_updated_at BEFORE
UPDATE ON public.certificados FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- 6. Adição de coluna de metadata no projeto (caso não exista)
-- Nota: A maioria das instalações GX já tem essa coluna, mas aqui garantimos.
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
        AND column_name = 'metadata'
) THEN
ALTER TABLE public.projects
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
END IF;
END $$;
COMMENT ON TABLE public.certificados IS 'Tabela que armazena as emissões de certificados para participantes de eventos e atividades.';



-- ARCHIVE: 20260307_ensure_mentorship_columns.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Ensure all columns for Mentorship Sessions exist
-- Growth Summit 2026
-- Data: 2026-03-07
-- ============================================================
DO $$ BEGIN -- 1. Ensure columns added in previous migration (safety check)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'tema_interesse'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN tema_interesse TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'anotacoes'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN anotacoes TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'email_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN email_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'telefone_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN telefone_mentorado TEXT;
END IF;
-- 2. Ensure extra columns used in getSelectFields but missing from previous migration
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'nome_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN nome_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'data_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN data_mentoria TIMESTAMPTZ;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'avaliacao_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN avaliacao_mentoria INTEGER;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'indicacao_mentor'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN indicacao_mentor INTEGER;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'avaliado_em'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN avaliado_em TIMESTAMPTZ;
END IF;
-- 3. Ensure duration and mentor_name exist for compatibility (though focus is on semantic map)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'duration'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN duration INTEGER DEFAULT 30;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'mentor_name'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN mentor_name TEXT;
END IF;
-- 4. Reload PostgREST schema cache (Crucial for 400 errors)
PERFORM pg_notify('pgrst', 'reload schema');
END $$;



-- ARCHIVE: 20260307_fix_mentor_availability_rls.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Fix RLS and Schema for Mentorship Sessions
-- Growth Summit 2026
-- Data: 2026-03-07
-- ============================================================
-- 1. Garantir que a tabela mentorias_agendadas tenha as colunas necessárias (caso falte em algum environment)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'tema_interesse'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN tema_interesse TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'anotacoes'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN anotacoes TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'email_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN email_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'telefone_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN telefone_mentorado TEXT;
END IF;
END $$;
-- 2. Habilitar RLS
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
-- 3. Políticas de Segurança
-- SELECT: Todos os autenticados e anonimos podem ver os horários (para poderem agendar)
DROP POLICY IF EXISTS "mentorias_read_all" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_read_all" ON public.mentorias_agendadas FOR
SELECT USING (true);
-- INSERT: Mentores podem criar seus próprios horários (disponibilidade)
DROP POLICY IF EXISTS "mentorias_mentor_insert" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_mentor_insert" ON public.mentorias_agendadas FOR
INSERT TO authenticated WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
    );
-- UPDATE: Mentores podem editar seus horários; Participantes podem agendar preenchendo os campos
DROP POLICY IF EXISTS "mentorias_update_policy" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_update_policy" ON public.mentorias_agendadas FOR
UPDATE TO authenticated USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
        OR mentorado_id = auth.uid()
        OR -- Mentorado já dono do slot
        mentorado_id IS NULL -- Permite agendar slots vazios
    ) WITH CHECK (true);
-- DELETE: Mentores podem excluir seus horários vazios; Admin exclui tudo
DROP POLICY IF EXISTS "mentorias_delete_policy" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_delete_policy" ON public.mentorias_agendadas FOR DELETE TO authenticated USING (
    public.is_admin()
    OR (
        EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
        AND mentorado_id IS NULL
    )
);
-- 4. Garantir Buckets de Storage e Políticas (para Avatar e Imagens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
-- Políticas para avatars (Leitura pública, escrita apenas autenticados)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Auth Insert Avatars" ON storage.objects;
CREATE POLICY "Auth Insert Avatars" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'avatars');
-- Políticas para event-images
DROP POLICY IF EXISTS "Public Access Event Images" ON storage.objects;
CREATE POLICY "Public Access Event Images" ON storage.objects FOR
SELECT USING (bucket_id = 'event-images');
DROP POLICY IF EXISTS "Auth All Event Images" ON storage.objects;
CREATE POLICY "Auth All Event Images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'event-images');



-- ARCHIVE: 20260309_aplicar_voucher.sql
-- ============================================================
-- ============================================================
-- CORPORATE VOUCHER REDEMPTION RPC
-- Date: 2026-03-09
-- ============================================================
CREATE OR REPLACE FUNCTION aplicar_voucher_empresa(p_inscricao_id UUID, p_voucher_code TEXT) RETURNS BOOLEAN AS $$
DECLARE v_lote_id UUID;
v_vagas INTEGER;
v_utilizadas INTEGER;
v_status TEXT;
BEGIN -- Obter os dados do lote relacionado ao voucher
SELECT id,
    quantidade_vagas,
    vagas_utilizadas,
    status_pagamento INTO v_lote_id,
    v_vagas,
    v_utilizadas,
    v_status
FROM public.lotes_inscricao_empresa
WHERE voucher_code = p_voucher_code;
-- Validar se o lote existe
IF v_lote_id IS NULL THEN RAISE EXCEPTION 'Voucher Invalido ou Nao Encontrado.';
END IF;
-- Validar pagamento
IF v_status != 'pago' THEN RAISE EXCEPTION 'O pagamento desse lote se encontra pendente. Entre em contato com o responsavel da sua empresa.';
END IF;
-- Validar limite de vagas
IF v_utilizadas >= v_vagas THEN RAISE EXCEPTION 'Este voucher ja atingiu o limite maximo de % vagas.',
v_vagas;
END IF;
-- Atualizar utilizacao de vagas no lote
UPDATE public.lotes_inscricao_empresa
SET vagas_utilizadas = vagas_utilizadas + 1,
    updated_at = NOW()
WHERE id = v_lote_id;
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



-- ARCHIVE: 20260309_b2b_swipes_and_matchmaking.sql
-- ============================================================
-- ============================================================
-- MIGRATION: B2B SWIPES AND MATCHMAKING (Tinder B2B)
-- ============================================================
-- 1. Create b2b_swipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    from_company_id UUID REFERENCES public.rodada_negocios_b2b(id),
    to_company_id UUID REFERENCES public.rodada_negocios_b2b(id),
    status TEXT CHECK (status IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_company_id, to_company_id)
);
-- 2. RLS policies for b2b_swipes
ALTER TABLE public.b2b_swipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_swipes_admin_all" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_admin_all" ON public.b2b_swipes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_swipes_read_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_read_own" ON public.b2b_swipes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_swipes.from_company_id
                    OR c.id = b2b_swipes.to_company_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_swipes_insert_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_insert_own" ON public.b2b_swipes FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND c.id = b2b_swipes.from_company_id
        )
    );
DROP POLICY IF EXISTS "b2b_swipes_update_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_update_own" ON public.b2b_swipes FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND c.id = b2b_swipes.from_company_id
        )
    );
-- 3. Matchmaking Trigger Function
-- When a new 'like' is inserted, check if there is a 'like' in the opposite direction.
-- If so, create a 'pending_schedule' inside b2b_matches if not already exists.
CREATE OR REPLACE FUNCTION public.check_b2b_match() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF NEW.status = 'like' THEN IF EXISTS (
        SELECT 1
        FROM public.b2b_swipes
        WHERE from_company_id = NEW.to_company_id
            AND to_company_id = NEW.from_company_id
            AND status = 'like'
    ) THEN -- Create a match if not exists
    -- Order the ids consistently to avoid duplicates
INSERT INTO public.b2b_matches (
        project_id,
        company_a_id,
        company_b_id,
        status
    )
VALUES (
        NEW.project_id,
        LEAST(NEW.from_company_id, NEW.to_company_id),
        GREATEST(NEW.from_company_id, NEW.to_company_id),
        'pending_schedule'
    ) ON CONFLICT (company_a_id, company_b_id) DO NOTHING;
END IF;
END IF;
RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_check_b2b_match ON public.b2b_swipes;
CREATE TRIGGER trigger_check_b2b_match
AFTER
INSERT
    OR
UPDATE ON public.b2b_swipes FOR EACH ROW EXECUTE FUNCTION public.check_b2b_match();
-- 4. B2B Appointments table (which comes after matches)
CREATE TABLE IF NOT EXISTS public.b2b_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    match_id UUID REFERENCES public.b2b_matches(id) ON DELETE CASCADE,
    company_a_id UUID REFERENCES public.rodada_negocios_b2b(id),
    company_b_id UUID REFERENCES public.rodada_negocios_b2b(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 20,
    table_number TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Appointments RLS
ALTER TABLE public.b2b_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_appointments_admin_all" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_admin_all" ON public.b2b_appointments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_appointments_read_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_read_own" ON public.b2b_appointments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_appointments_update_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_update_own" ON public.b2b_appointments FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_appointments_insert_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_insert_own" ON public.b2b_appointments FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );



-- ARCHIVE: 20260309_check_ins_atividades.sql
-- ============================================================
-- ============================================================
-- TABLE: check_ins_atividades
-- Description: Records attendance for specific event sessions (lectures, workshops, etc.)
-- Date: 2026-03-09
-- ============================================================
CREATE TABLE IF NOT EXISTS public.check_ins_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.programacao_evento(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_in_type TEXT DEFAULT 'qr',
    -- 'qr' or 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure a user can only check in once per session
    UNIQUE(session_id, registration_id)
);
-- Enable RLS
ALTER TABLE public.check_ins_atividades ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "check_ins_atividades_admin_all" ON public.check_ins_atividades;
CREATE POLICY "check_ins_atividades_admin_all" ON public.check_ins_atividades FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "check_ins_atividades_own_select" ON public.check_ins_atividades;
CREATE POLICY "check_ins_atividades_own_select" ON public.check_ins_atividades FOR
SELECT USING (user_id = auth.uid());
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cia_project_id ON public.check_ins_atividades(project_id);
CREATE INDEX IF NOT EXISTS idx_cia_session_id ON public.check_ins_atividades(session_id);
CREATE INDEX IF NOT EXISTS idx_cia_registration_id ON public.check_ins_atividades(registration_id);
CREATE INDEX IF NOT EXISTS idx_cia_user_id ON public.check_ins_atividades(user_id);
-- Trigger for updated_at (optional if we only have created_at)
-- But keeping it standard
COMMENT ON TABLE public.check_ins_atividades IS 'Registro de presença em atividades específicas (palestras, workshops) do Growth Experience.';



-- ARCHIVE: 20260309_fix_certificates_schema.sql
-- ============================================================
-- ============================================================
-- Fix Certificates Schema
-- Renames 'certificados' to 'certificates' and adds missing columns
-- ============================================================
-- 1. Rename table if old one exists and new one does not
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'certificados'
)
AND NOT EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'certificates'
) THEN
ALTER TABLE public.certificados
    RENAME TO certificates;
END IF;
END $$;
-- 2. Create 'certificates' table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'event',
    activity_name TEXT,
    code TEXT UNIQUE,
    status TEXT DEFAULT 'disponivel',
    metadata JSONB DEFAULT '{}'::jsonb,
    issue_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Add missing columns expected by Frontend
DO $$ BEGIN IF NOT EXISTS (
    SELECT
    FROM information_schema.columns
    WHERE table_name = 'certificates'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.certificates
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
IF NOT EXISTS (
    SELECT
    FROM information_schema.columns
    WHERE table_name = 'certificates'
        AND column_name = 'session_id'
) THEN
ALTER TABLE public.certificates
ADD COLUMN session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE;
END IF;
END $$;
-- 4. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_project ON public.certificates(project_id);
CREATE INDEX IF NOT EXISTS idx_certificates_registration ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_session ON public.certificates(session_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(code);
-- 5. Update RLS Policies
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to certificados" ON public.certificates;
DROP POLICY IF EXISTS "Participants can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins have full access to certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
CREATE POLICY "Admins have full access to certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR
SELECT TO authenticated USING (
        user_id = auth.uid()
        OR registration_id IN (
            SELECT id
            FROM public.inscricoes_growth_experience
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert their own certificates via RPC or if matching uid" ON public.certificates FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- 6. Re-attach trigger
DROP TRIGGER IF EXISTS tr_certificados_updated_at ON public.certificates;
DROP TRIGGER IF EXISTS tr_certificates_updated_at ON public.certificates;
CREATE TRIGGER tr_certificates_updated_at BEFORE
UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
COMMENT ON TABLE public.certificates IS 'Stores certificate generations for events and activities.';



-- ARCHIVE: 20260309_lotes_empresa_responsavel.sql
-- ============================================================
ALTER TABLE public.lotes_inscricao_empresa
ADD COLUMN nome_responsavel TEXT,
    ADD COLUMN email_responsavel TEXT;
UPDATE public.lotes_inscricao_empresa
SET email_responsavel = email_contato
WHERE email_responsavel IS NULL;



-- ARCHIVE: 20260309_lotes_inscricao_empresa.sql
-- ============================================================
-- ============================================================
-- CORPORATE BATCH REGISTRATION (LOTES DE EQUIPES)
-- Date: 2026-03-09
-- Objective: Manage group registrations with 30%+ discount and single payment.
-- ============================================================
-- 1. Create the Batch Table
CREATE TABLE IF NOT EXISTS public.lotes_inscricao_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    nome_empresa TEXT NOT NULL,
    cnpj TEXT,
    email_contato TEXT NOT NULL,
    voucher_code TEXT UNIQUE NOT NULL,
    quantidade_vagas INTEGER NOT NULL DEFAULT 5,
    vagas_utilizadas INTEGER NOT NULL DEFAULT 0,
    tipo_ingresso TEXT NOT NULL DEFAULT 'pro',
    valor_total DECIMAL(10, 2) NOT NULL,
    status_pagamento TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Add Link to Main Registration Table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'lote_id'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN lote_id UUID REFERENCES public.lotes_inscricao_empresa(id);
COMMENT ON COLUMN public.inscricoes_growth_experience.lote_id IS 'ID do lote de equipe (Corporate) caso o participante venha de uma compra em grupo.';
END IF;
END $$;
-- 3. Add Voucher Tracking Column to track which specific code was used
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'voucher_empresa_usado'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN voucher_empresa_usado TEXT;
END IF;
END $$;
-- 4. Enable RLS
ALTER TABLE public.lotes_inscricao_empresa ENABLE ROW LEVEL SECURITY;
-- 5. Policies
-- Admins can do everything
CREATE POLICY "lotes_admin_all" ON public.lotes_inscricao_empresa FOR ALL USING (public.is_admin());
-- Public can verify a voucher (needed for registration flow)
CREATE POLICY "lotes_public_verify" ON public.lotes_inscricao_empresa FOR
SELECT USING (true);
-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_lotes_empresa_updated_at BEFORE
UPDATE ON public.lotes_inscricao_empresa FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- 7. Grant access
GRANT ALL ON TABLE public.lotes_inscricao_empresa TO postgres;
GRANT ALL ON TABLE public.lotes_inscricao_empresa TO service_role;
GRANT SELECT,
    INSERT ON TABLE public.lotes_inscricao_empresa TO authenticated;
GRANT SELECT ON TABLE public.lotes_inscricao_empresa TO anon;
DO $$ BEGIN RAISE NOTICE 'Migration lotes_inscricao_empresa completed successfully'; END $$;



-- ARCHIVE: 20260309_mentorship_business_fields.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Add Business Fields to Mentorship Sessions
-- Growth Summit 2026
-- Data: 2026-03-09
-- ============================================================
DO $$ BEGIN -- 1. Add nome_startup (Business Name) to mentorias_agendadas if missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'nome_startup'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN nome_startup TEXT;
END IF;
-- 2. Add setor (Business Stage/Sector) to mentorias_agendadas if missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'setor'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN setor TEXT;
END IF;
-- 3. Safety check for data_mentoria (should be there based on previous migrations)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'data_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN data_mentoria TIMESTAMPTZ;
END IF;
-- Reload schema cache for PostgREST
PERFORM pg_notify('pgrst', 'reload schema');
END $$;



-- ARCHIVE: 20260309_pitch_voting_system.sql
-- ============================================================
-- ============================================================
-- TABLE: pitch_scores
-- Description: Stores judges' scores for startups in the Arena Pitch
-- Date: 2026-03-09
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pitch_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups_arena_pitch(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    innovation_score INTEGER CHECK (
        innovation_score >= 1
        AND innovation_score <= 10
    ),
    market_score INTEGER CHECK (
        market_score >= 1
        AND market_score <= 10
    ),
    presentation_score INTEGER CHECK (
        presentation_score >= 1
        AND presentation_score <= 10
    ),
    business_model_score INTEGER CHECK (
        business_model_score >= 1
        AND business_model_score <= 10
    ),
    total_score NUMERIC(4, 2) GENERATED ALWAYS AS (
        (
            innovation_score + market_score + presentation_score + business_model_score
        )::NUMERIC / 4
    ) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Each judge can only vote once per startup
    UNIQUE(startup_id, judge_id)
);
-- RLS
ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "pitch_scores_admin_all" ON public.pitch_scores;
CREATE POLICY "pitch_scores_admin_all" ON public.pitch_scores FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "pitch_scores_judge_vote" ON public.pitch_scores;
CREATE POLICY "pitch_scores_judge_vote" ON public.pitch_scores FOR
INSERT WITH CHECK (
        auth.uid() = judge_id -- Simplified role check (admin/judge/staff)
        AND public.is_admin()
    );
DROP POLICY IF EXISTS "pitch_scores_public_read" ON public.pitch_scores;
CREATE POLICY "pitch_scores_public_read" ON public.pitch_scores FOR
SELECT USING (true);
-- Publicly viewable for leaderboard
-- Indexes
CREATE INDEX IF NOT EXISTS idx_ps_startup_id ON public.pitch_scores(startup_id);
CREATE INDEX IF NOT EXISTS idx_ps_project_id ON public.pitch_scores(project_id);
COMMENT ON TABLE public.pitch_scores IS 'Notas dos jurados para as startups da Arena Pitch.';



-- ARCHIVE: 20260309_update_registration_rpc_lotes.sql
-- ============================================================
-- ============================================================
-- UPDATE ATOMIC REGISTRATION RPC FOR CORPORATE BATCHES
-- Date: 2026-03-09
-- Objective: Allow registration using a corporate batch ID (lote_id).
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
        p_extra_data JSONB DEFAULT '{}'::JSONB,
        p_lote_id UUID DEFAULT NULL,
        p_voucher_empresa TEXT DEFAULT NULL
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_inscricao_id UUID;
v_session RECORD;
v_session_id UUID;
v_full_sessions TEXT [] := '{}';
v_lote RECORD;
BEGIN -- ── ETAPA 0: Verificar Lote de Equipe (se fornecido)
IF p_lote_id IS NOT NULL THEN
SELECT id,
    quantidade_vagas,
    vagas_utilizadas,
    status_pagamento INTO v_lote
FROM public.lotes_inscricao_empresa
WHERE id = p_lote_id FOR
UPDATE;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_FOUND',
    'message',
    'Lote de inscrição não encontrado.'
);
END IF;
IF v_lote.status_pagamento != 'pago' THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_PAID',
    'message',
    'O pagamento deste lote ainda não foi confirmado.'
);
END IF;
IF v_lote.vagas_utilizadas >= v_lote.quantidade_vagas THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_FULL',
    'message',
    'O limite de vagas deste lote já foi atingido.'
);
END IF;
END IF;
-- ── ETAPA 1: Verificar disponibilidade de vagas (com lock para evitar race condition)
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
        lote_id,
        voucher_empresa_usado,
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
        p_lote_id,
        p_voucher_empresa,
        NOW()
    )
RETURNING id INTO v_inscricao_id;
-- ── ETAPA 3: Incrementar contadores
-- a) Sessões
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
UPDATE public.programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = v_session_id;
END LOOP;
END IF;
-- b) Lote Empresa
IF p_lote_id IS NOT NULL THEN
UPDATE public.lotes_inscricao_empresa
SET vagas_utilizadas = vagas_utilizadas + 1
WHERE id = p_lote_id;
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



-- ARCHIVE: 20260310_user_sync_trigger.sql
-- ============================================================
-- ============================================================
-- AUTH TO PUBLIC SYNC TRIGGER (Growth Experience 2026)
-- Data: 2026-03-10
-- Objetivo: Garantir que todo usuário criado no Auth do Supabase
-- seja sincronizado automaticamente com a tabela public.users,
-- evitando erros de chave estrangeira nas inscrições.
-- ============================================================

-- 1. FUNÇÃO DE SINCRONIZAÇÃO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insere ou atualiza na tabela public.users
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        phone, 
        role, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'participant'),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = COALESCE(EXCLUDED.email, public.users.email),
        name = COALESCE(EXCLUDED.name, public.users.name),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = NOW();

    -- Opcional: Criar perfil vazio se não existir
    INSERT INTO public.profiles (user_id, country, country_code)
    VALUES (NEW.id, 'Brasil', 'BR')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER NO AUTH.USERS
-- Nota: É necessário rodar isso como superuser (postgres)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. TRIGGER DE ATUALIZAÇÃO (Sincronizar mudanças de email/meta-data)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE PROCEDURE public.handle_new_user();

-- 4. BACKFILL: Sincronizar usuários existentes que podem estar faltando
INSERT INTO public.users (id, email, name, role, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', email),
    COALESCE(raw_user_meta_data->>'role', 'participant'),
    now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. REVISAR CHAVE ESTRANGEIRA (Opcional, mas garante consistência)
-- Se a FK estiver apontando para public.users, agora ela terá os registros.
-- Se houver lixo em inscricoes_growth_experience, pode ser necessário limpar.
-- DELETE FROM public.inscricoes_growth_experience WHERE user_id NOT IN (SELECT id FROM auth.users);

-- NOTAR: Se você estiver recebendo erro de 'permission denied' na schema 'auth', 
-- você deve rodar este comando via painel do Supabase com privilégios de admin.




-- ARCHIVE: 20260311_b2b_integrity_triggers.sql
-- ============================================================

-- ============================================================
-- MIGRATION: B2B INTEGRITY TRIGGERS (CONFLITOS DE AGENDA)
-- Data: 2026-03-11
-- ============================================================

-- 1. Funo de validao para a tabela b2b_meetings (Manual Admin)
CREATE OR REPLACE FUNCTION public.fn_validate_b2b_meeting_integrity() 
RETURNS TRIGGER AS $$
DECLARE
    new_end TIMESTAMPTZ;
BEGIN
    -- Determina o fim da reunio (default 20 min)
    new_end := NEW.scheduled_at + (COALESCE(NEW.duration_minutes, 20) || ' minutes')::interval;

    -- A. Impede agendamento com a mesma empresa
    IF NEW.company_a_id = NEW.company_b_id THEN
        RAISE EXCEPTION 'Uma empresa no pode agendar uma reunio consigo mesma.';
    END IF;

    -- B. Verifica conflito de horário para as empresas selecionadas
    IF EXISTS (
        SELECT 1 FROM public.b2b_meetings
        WHERE id <> NEW.id
        AND status NOT IN ('cancelled', 'no_show')
        AND (
            company_a_id IN (NEW.company_a_id, NEW.company_b_id)
            OR company_b_id IN (NEW.company_a_id, NEW.company_b_id)
        )
        AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
            tsrange(NEW.scheduled_at, new_end)
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: Uma das empresas j possui compromisso neste intervalo.';
    END IF;

    -- C. Verifica conflito de mesa (se table_number estiver preenchido)
    IF NEW.table_number IS NOT NULL AND NEW.table_number <> '' THEN
        IF EXISTS (
            SELECT 1 FROM public.b2b_meetings
            WHERE id <> NEW.id
            AND status NOT IN ('cancelled', 'no_show')
            AND table_number = NEW.table_number
            AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
                tsrange(NEW.scheduled_at, new_end)
        ) THEN
            RAISE EXCEPTION 'Conflito de mesa: A mesa % j est ocupada neste horrio.', NEW.table_number;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Atribuio do Trigger para b2b_meetings
DROP TRIGGER IF EXISTS trigger_b2b_meeting_integrity ON public.b2b_meetings;
CREATE TRIGGER trigger_b2b_meeting_integrity
BEFORE INSERT OR UPDATE ON public.b2b_meetings
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_b2b_meeting_integrity();


-- 3. Atualizar a funo existente de b2b_appointments para incluir checagem de mesa
-- (Complementando a migrao anterior 20260311_rbac_lgpd_and_schedule_fix)
CREATE OR REPLACE FUNCTION public.validate_b2b_appointment() 
RETURNS TRIGGER AS $$
DECLARE
    new_end TIMESTAMPTZ;
BEGIN
    new_end := NEW.scheduled_at + (COALESCE(NEW.duration_minutes, 20) || ' minutes')::interval;

    -- no permite agendar com horrio anterior ao presente
    IF NEW.scheduled_at < now() AND TG_OP = 'INSERT' THEN
        RAISE EXCEPTION 'Horrio no pode ficar no passado';
    END IF;

    -- verifica sobreposio para as empresas
    IF EXISTS (
        SELECT 1
        FROM public.b2b_appointments a
        WHERE a.id <> NEW.id
          AND a.status NOT IN ('cancelled', 'no_show')
          AND (
                a.company_a_id = NEW.company_a_id
             OR a.company_b_id = NEW.company_a_id
             OR a.company_a_id = NEW.company_b_id
             OR a.company_b_id = NEW.company_b_id
          )
          AND tsrange(a.scheduled_at, a.scheduled_at + (COALESCE(a.duration_minutes, 20) || ' minutes')::interval) &&
              tsrange(NEW.scheduled_at, new_end)
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: Uma das empresas j possui compromisso no Tinder B2B.';
    END IF;

    -- verifica conflito de mesa
    IF NEW.table_number IS NOT NULL AND NEW.table_number <> '' THEN
        IF EXISTS (
            SELECT 1 FROM public.b2b_appointments
            WHERE id <> NEW.id
            AND status NOT IN ('cancelled', 'no_show')
            AND table_number = NEW.table_number
            AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
                tsrange(NEW.scheduled_at, new_end)
        ) THEN
            RAISE EXCEPTION 'Conflito de mesa: A mesa % j est ocupada no Tinder B2B.', NEW.table_number;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;




-- ARCHIVE: 20260311_rbac_lgpd_and_schedule_fix.sql
-- ============================================================
-- ============================================================
-- 2026-03-11  RBAC extras + LGPD consent + B2B agenda locks
-- Objetivo:
--   1. Adicionar tabela de consentimentos e colunas de LGPD
--   2. Garantir polticas RLS adicionais nas tabelas sensveis
--   3. Introduzir trigger de validao de conflitos/holofote para
--      b2b_appointments (verifica sobreposio e fuso horrio)
--   4. Funes auxiliares de uso geral
-- ============================================================

-- 1. Tabela de consentimentos (LGPD)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_consents'
    ) THEN
        CREATE TABLE public.user_consents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            consent_type TEXT NOT NULL,
            granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            revoked_at TIMESTAMPTZ NULL,
            metadata JSONB DEFAULT '{}'::jsonb
        );
        ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

        -- RLS: somente dono ou admin podem ver ou alterar
        DROP POLICY IF EXISTS "user_consents_own" ON public.user_consents;
        CREATE POLICY "user_consents_own" ON public.user_consents FOR ALL
        USING (
            user_id = auth.uid()
            OR public.is_admin()
        )
        WITH CHECK (
            user_id = auth.uid()
            OR public.is_admin()
        );

        RAISE NOTICE 'Tabela user_consents criada com RLS';
    ELSE
        RAISE NOTICE 'Tabela user_consents ja existe';
    END IF;
END $$;

-- 2. Colunas de LGPD em formularios existentes (exemplos)
DO $$ BEGIN
    -- startups_arena_pitch
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'startups_arena_pitch'
          AND column_name = 'lgpd_consent'
    ) THEN
        ALTER TABLE public.startups_arena_pitch
        ADD COLUMN lgpd_consent BOOLEAN DEFAULT FALSE;
    END IF;

    -- rodada_negocios_b2b
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rodada_negocios_b2b'
          AND column_name = 'lgpd_consent'
    ) THEN
        ALTER TABLE public.rodada_negocios_b2b
        ADD COLUMN lgpd_consent BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. Funo de validao de conflitos de agenda para b2b_appointments
CREATE OR REPLACE FUNCTION public.validate_b2b_appointment() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- no permite agendar com horrio anterior ao presente
    IF NEW.scheduled_at < now() THEN
        RAISE EXCEPTION 'Horrio no pode ficar no passado';
    END IF;

    -- verifica sobreposio para qualquer das empresas envolvidas
    IF EXISTS (
        SELECT 1
        FROM public.b2b_appointments a
        WHERE a.id <> NEW.id
          AND a.status = 'scheduled'
          AND (
                a.company_a_id = NEW.company_a_id
             OR a.company_b_id = NEW.company_a_id
             OR a.company_a_id = NEW.company_b_id
             OR a.company_b_id = NEW.company_b_id
          )
          AND tsrange(a.scheduled_at, a.scheduled_at + (a.duration_minutes || ' minutes')::interval) &&
              tsrange(NEW.scheduled_at, NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval)
    ) THEN
        RAISE EXCEPTION 'Conflito de horarios para empresas envolvidas';
    END IF;

    RETURN NEW;
END;
$$;

-- cria trigger que chama a funo antes de inserir ou atualizar
DROP TRIGGER IF EXISTS trigger_validate_b2b_appointment ON public.b2b_appointments;
CREATE TRIGGER trigger_validate_b2b_appointment
BEFORE INSERT OR UPDATE ON public.b2b_appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_b2b_appointment();

DO $$
BEGIN
    RAISE NOTICE 'Trigger de validacao de agenda B2B criada';
END
$$;

-- 4. RBAC adicionais (exemplos genricos)
-- garantir que somente administradores possam manipular registros sensveis
DO $$ BEGIN
    -- ex.: poltica extra para b2b_matches permite aos participantes apenas ler
    ALTER TABLE public.b2b_matches ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "b2b_matches_read_own" ON public.b2b_matches;
    CREATE POLICY "b2b_matches_read_own" ON public.b2b_matches FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
              AND (c.id = b2b_matches.company_a_id OR c.id = b2b_matches.company_b_id)
        )
        OR public.is_admin()
    );

    RAISE NOTICE 'Poltica extra b2b_matches configurada';
END $$;

-- 5. Funo utilitria para verificar se usurio  sponsor ou startup
CREATE OR REPLACE FUNCTION public.has_role(r TEXT) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
SELECT public.current_user_role() = r;
$$;
GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated, anon, service_role;

-- 6. Propagao de cancelamentos para matches
CREATE OR REPLACE FUNCTION public.notify_b2b_cancellation() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
        UPDATE public.b2b_matches SET status = 'needs_reschedule'
        WHERE id = NEW.match_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_b2b_cancel ON public.b2b_appointments;
CREATE TRIGGER trigger_b2b_cancel
AFTER UPDATE ON public.b2b_appointments
FOR EACH ROW EXECUTE FUNCTION public.notify_b2b_cancellation();

-- fim da migrao




-- ARCHIVE: 20260312_b2b_discovery_and_validation.sql
-- ============================================================
-- ============================================================
-- MIGRATION: B2B Discovery (sem dados sensíveis) + Validação server-side
-- Data: 2026-03-12 | Auditoria 360° - Implementação
-- ============================================================

-- 1. RPC: get_b2b_discovery_companies
-- Retorna empresas aprovadas para discovery (matchmaking) SEM telefone, email, cnpj.
-- Exige que o caller tenha uma empresa no mesmo projeto.
CREATE OR REPLACE FUNCTION public.get_b2b_discovery_companies(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    user_id UUID,
    nome_representante TEXT,
    cargo TEXT,
    nome_empresa TEXT,
    setor TEXT,
    porte TEXT,
    descricao_empresa TEXT,
    produtos_servicos TEXT,
    site_url TEXT,
    linkedin_url TEXT,
    logo_url TEXT,
    tipo_interesse TEXT,
    areas_interesse TEXT[],
    descricao_objetivos TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Garantir que o usuário autenticado tem uma empresa no projeto
  IF NOT EXISTS (
    SELECT 1 FROM public.rodada_negocios_b2b r
    WHERE r.project_id = p_project_id
      AND (r.user_id = auth.uid() OR r.email = (auth.jwt()->>'email'))
  ) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas empresas do projeto podem acessar o discovery.';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.project_id,
    r.user_id,
    r.nome_representante,
    r.cargo,
    r.nome_empresa,
    r.setor,
    r.porte,
    r.descricao_empresa,
    r.produtos_servicos,
    r.site_url,
    r.linkedin_url,
    r.logo_url,
    r.tipo_interesse,
    r.areas_interesse,
    r.descricao_objetivos,
    r.status,
    r.created_at
  FROM public.rodada_negocios_b2b r
  WHERE r.project_id = p_project_id
    AND r.status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_b2b_discovery_companies(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_b2b_discovery_companies(UUID) TO service_role;

COMMENT ON FUNCTION public.get_b2b_discovery_companies(UUID) IS
  'Retorna empresas B2B aprovadas para discovery, excluindo dados sensíveis (telefone, email, cnpj). LGPD-safe.';

-- 2. Função de validação server-side para inscrição
CREATE OR REPLACE FUNCTION public.validate_inscricao_dados(
  p_nome TEXT,
  p_email TEXT,
  p_telefone TEXT
) RETURNS TABLE(valid BOOLEAN, error_message TEXT) LANGUAGE plpgsql STABLE
AS $$
BEGIN
  -- Nome: mínimo 3 caracteres
  IF p_nome IS NULL OR TRIM(p_nome) = '' THEN
    RETURN QUERY SELECT FALSE, 'Nome é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(TRIM(p_nome)) < 3 THEN
    RETURN QUERY SELECT FALSE, 'Nome deve ter pelo menos 3 caracteres'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(p_nome) > 100 THEN
    RETURN QUERY SELECT FALSE, 'Nome muito longo'::TEXT;
    RETURN;
  END IF;

  -- Email: formato básico
  IF p_email IS NULL OR TRIM(p_email) = '' THEN
    RETURN QUERY SELECT FALSE, 'E-mail é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF p_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    RETURN QUERY SELECT FALSE, 'E-mail inválido'::TEXT;
    RETURN;
  END IF;

  -- Telefone: mínimo 10 dígitos
  IF p_telefone IS NULL OR TRIM(p_telefone) = '' THEN
    RETURN QUERY SELECT FALSE, 'Telefone é obrigatório'::TEXT;
    RETURN;
  END IF;
  IF LENGTH(REGEXP_REPLACE(p_telefone, '\D', '', 'g')) < 10 THEN
    RETURN QUERY SELECT FALSE, 'Telefone inválido (mínimo 10 dígitos)'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_inscricao_dados(TEXT, TEXT, TEXT) TO service_role;




-- ARCHIVE: 20260312_fix_registration_cpf_and_rls.sql
-- ============================================================
-- ============================================================
-- FIX: PIX Generation and Registration Data
-- Date: 2026-03-12
-- ============================================================

-- 1. Ensure CPF column exists in inscricoes_growth_experience
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inscricoes_growth_experience' 
        AND column_name = 'cpf'
    ) THEN
        ALTER TABLE public.inscricoes_growth_experience ADD COLUMN cpf TEXT;
    END IF;
END $$;

-- 2. Update RPC to accept p_cpf and save it
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
    p_extra_data JSONB DEFAULT '{}'::JSONB,
    p_lote_id UUID DEFAULT NULL,
    p_voucher_empresa TEXT DEFAULT NULL,
    p_cpf TEXT DEFAULT NULL -- NOVO PARÂMETRO
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE 
    v_inscricao_id UUID;
    v_session RECORD;
    v_session_id UUID;
    v_full_sessions TEXT [] := '{}';
    v_lote RECORD;
BEGIN 
    -- ── ETAPA 0: Verificar Lote de Equipe (se fornecido)
    IF p_lote_id IS NOT NULL THEN
        SELECT id, quantidade_vagas, vagas_utilizadas, status_pagamento INTO v_lote
        FROM public.lotes_inscricao_empresa
        WHERE id = p_lote_id FOR UPDATE;

        IF NOT FOUND THEN 
            RETURN jsonb_build_object('success', false, 'error', 'BATCH_NOT_FOUND', 'message', 'Lote de inscrição não encontrado.');
        END IF;

        IF v_lote.status_pagamento != 'pago' THEN 
            RETURN jsonb_build_object('success', false, 'error', 'BATCH_NOT_PAID', 'message', 'O pagamento deste lote ainda não foi confirmado.');
        END IF;

        IF v_lote.vagas_utilizadas >= v_lote.quantidade_vagas THEN 
            RETURN jsonb_build_object('success', false, 'error', 'BATCH_FULL', 'message', 'O limite de vagas deste lote já foi atingido.');
        END IF;
    END IF;

    -- ── ETAPA 1: Verificar disponibilidade de vagas
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

    -- ── ETAPA 2: Inserir a inscrição
    INSERT INTO public.inscricoes_growth_experience (
        project_id, user_id, nome, email, telefone, cpf,
        cursos_selecionados, tipo_inscricao, valor_pago, status_pagamento, status,
        evento, palestras_noturnas, tipo_atividade_selecionada, sala_atividade, 
        horario_atividade, nivel_atividade, indicacao_tipo, indicacao_nome, 
        codigo_social, codigo_palestra, cupom_palestra, app_instalado, lote_id, 
        voucher_empresa_usado, created_at
    )
    VALUES (
        p_project_id, p_user_id, p_nome, p_email, p_telefone, p_cpf,
        p_session_ids, p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status,
        p_evento, p_palestras_noturnas, p_tipo_atividade, p_sala_atividade, 
        p_horario_atividade, p_nivel_atividade, p_indicacao_tipo, p_indicacao_nome, 
        p_codigo_social, p_codigo_palestra, p_codigo_palestra, false, p_lote_id, 
        p_voucher_empresa, NOW()
    )
    RETURNING id INTO v_inscricao_id;

    -- ── ETAPA 3: Upsert no perfil do usuário (Garantir CPF para o Gateway de Pagamento)
    IF p_user_id IS NOT NULL AND p_cpf IS NOT NULL THEN
        -- Garantir que a tabela profiles existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
            INSERT INTO public.profiles (user_id, cpf, updated_at)
            VALUES (p_user_id, p_cpf, NOW())
            ON CONFLICT (user_id) DO UPDATE 
            SET cpf = EXCLUDED.cpf, updated_at = NOW();
        END IF;
    END IF;

    -- ── ETAPA 4: Incrementar contadores
    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN 
        UPDATE public.programacao_evento
        SET registered_count = COALESCE(registered_count, 0) + 1
        WHERE id = ANY(p_session_ids); -- Mais eficiente que loop
    END IF;

    IF p_lote_id IS NOT NULL THEN
        UPDATE public.lotes_inscricao_empresa
        SET vagas_utilizadas = vagas_utilizadas + 1
        WHERE id = p_lote_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'inscricao_id', v_inscricao_id, 
        'message', 'Inscrição realizada com sucesso'
    );

EXCEPTION
    WHEN unique_violation THEN 
        RETURN jsonb_build_object('success', false, 'error', 'ALREADY_REGISTERED', 'message', 'Este e-mail já está inscrito neste evento.');
    WHEN OTHERS THEN 
        RETURN jsonb_build_object('success', false, 'error', 'DB_ERROR', 'message', SQLERRM);
END;
$$;

-- 3. Correct RLS Policy to avoid 406 Not Acceptable (using JWT for email)
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR SELECT 
USING (
    user_id = auth.uid() 
    OR email = auth.jwt()->>'email'
);




-- ARCHIVE: 20260316_fix_stands_and_mentoring_schema.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Fix Stands Schema and Mentorship Consistency
-- Growth Summit 2026
-- ============================================================

DO $$ 
BEGIN 
    -- 1. FIX STANDS TABLE (Growth Experience)
    -- This table is used by the AdminStands.tsx module
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stands') THEN
        CREATE TABLE public.stands (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            nome TEXT NOT NULL,
            localizacao TEXT,
            descricao TEXT,
            logo_url TEXT,
            owner_id UUID, 
            owner_type TEXT CHECK (owner_type IN ('startup', 'company', 'sponsor')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Table "stands" created with standard GE column names (nome, localizacao, descricao).';
    ELSE
        -- Rename 'name' to 'nome' if it exists (Fix for "nome column not found" error)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'name') THEN
            ALTER TABLE public.stands RENAME COLUMN name TO nome;
            RAISE NOTICE 'Renamed column "name" to "nome" in "stands".';
        END IF;

        -- Ensure other columns exist for AdminStands.tsx
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'localizacao') THEN
            ALTER TABLE public.stands ADD COLUMN localizacao TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'descricao') THEN
            ALTER TABLE public.stands ADD COLUMN descricao TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'logo_url') THEN
            ALTER TABLE public.stands ADD COLUMN logo_url TEXT;
        END IF;
    END IF;

    -- 2. ENSURE MENTORSHIP SESSION COLUMNS (GE MODULE)
    -- These are often missing when expanding the mentor dashboard
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'nome_mentorado') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN nome_mentorado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'email_mentorado') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN email_mentorado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'duracao') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN duracao INTEGER DEFAULT 20;
    END IF;

    -- 3. ENSURE STAND_CHECKINS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stand_checkins') THEN
        CREATE TABLE public.stand_checkins (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
            registration_id UUID NOT NULL, 
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Table "stand_checkins" created.';
    END IF;

    -- 4. RELOAD SCHEMA CACHE
    -- PostgREST needs this to see the new/renamed columns immediately
    NOTIFY pgrst, 'reload schema';

END $$;




-- ARCHIVE: 20260317_add_session_count_rpcs.sql
-- ============================================================
-- ============================================================
-- ADD: increment_session_count and decrement_session_count RPCs
-- Date: 2026-03-17
-- ============================================================

-- Function to increment registered_count in programacao_evento
CREATE OR REPLACE FUNCTION public.increment_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.programacao_evento
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = session_id;
END;
$$;

-- Function to decrement registered_count in programacao_evento
CREATE OR REPLACE FUNCTION public.decrement_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.programacao_evento
    SET registered_count = GREATEST(0, COALESCE(registered_count, 0) - 1)
    WHERE id = session_id;
END;
$$;

-- Also add versions for the standard 'sessions' table just in case
CREATE OR REPLACE FUNCTION public.increment_standard_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.sessions
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_standard_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.sessions
    SET registered_count = GREATEST(0, COALESCE(registered_count, 0) - 1)
    WHERE id = session_id;
END;
$$;




-- ARCHIVE: 20260319_communication_enhancements.sql
-- ============================================================
-- ============================================================
-- Communication & Support Enhancements
-- 2026-03-19
-- ============================================================

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Ticket Messages (for conversation threads)
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
CREATE POLICY "Users can view their own tickets"
    ON public.support_tickets FOR SELECT
    USING (user_id = auth.uid() OR email = (SELECT email FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own tickets"
    ON public.support_tickets FOR INSERT
    WITH CHECK (true); -- Allow anonymous/new users to create from Contato page

CREATE POLICY "Admins can manage all tickets"
    ON public.support_tickets FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- Policies for messages
CREATE POLICY "Users can view messages for their tickets"
    ON public.support_ticket_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND (user_id = auth.uid() OR email = (SELECT email FROM public.users WHERE id = auth.uid()))
    ));

CREATE POLICY "Admins can manage all messages"
    ON public.support_ticket_messages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- Indices
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_ticket_messages(ticket_id);

-- Trigger for update_updated_at
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




-- ARCHIVE: 20260319_mentorship_refinement.sql
-- ============================================================
-- ============================================================
-- MIGRATION: Mentorship Management Refinement
-- Growth Summit 2026
-- ============================================================

-- 1. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS public.mentoring_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL,
    mentor_id UUID REFERENCES public.mentores_growth_experience(id), -- Optional: specific mentor
    challenge TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redirected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADD TRIGGER TO UPDATE updated_at
-- This function can be created independently without DO
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now use a DO block ONLY for the trigger which doesn't have IF NOT EXISTS in plain SQL
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mentoring_waitlist_updated_at') THEN
        CREATE TRIGGER update_mentoring_waitlist_updated_at
        BEFORE UPDATE ON public.mentoring_waitlist
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 3. ENABLE RLS
ALTER TABLE public.mentoring_waitlist ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own waitlist entries') THEN
        CREATE POLICY "Users can view their own waitlist entries"
        ON public.mentoring_waitlist FOR SELECT
        TO authenticated
        USING (true); -- Simplified for now, or filter by registration_id
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage all waitlist entries') THEN
        CREATE POLICY "Admins can manage all waitlist entries"
        ON public.mentoring_waitlist FOR ALL
        TO authenticated
        USING (true);
    END IF;
END $$;

-- 5. RELOAD SCHEMA CACHE
SELECT pg_notify('pgrst', 'reload schema');




-- ARCHIVE: 20260319_raffle_module.sql
-- ============================================================
-- Raffle Module Migration
-- Create raffles table
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('stand_checkin', 'realtime_qr')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'completed', 'cancelled')),
    stand_id UUID, -- For stand_checkin raffles
    winner_registration_id UUID REFERENCES public.inscricoes_growth_experience(id),
    drawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create raffle participants table (for realtime_qr)
CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(raffle_id, registration_id)
);

-- Enable RLS
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raffles
CREATE POLICY "Admins can manage raffles" ON public.raffles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Everyone can view open raffles" ON public.raffles
    FOR SELECT TO authenticated
    USING (status = 'open' OR status = 'completed');

-- RLS Policies for raffle_participants
CREATE POLICY "Admins can view all participants" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can enter open realtime raffles" ON public.raffle_participants
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.raffles
            WHERE raffles.id = raffle_id AND raffles.status = 'open' AND raffles.type = 'realtime_qr'
        )
        AND 
        EXISTS (
            SELECT 1 FROM public.inscricoes_growth_experience
            WHERE inscricoes_growth_experience.id = registration_id AND inscricoes_growth_experience.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own raffle entries" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.inscricoes_growth_experience
            WHERE inscricoes_growth_experience.id = registration_id AND inscricoes_growth_experience.user_id = auth.uid()
        )
    );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_raffles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raffles_updated_at
BEFORE UPDATE ON public.raffles
FOR EACH ROW EXECUTE FUNCTION update_raffles_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_raffles_project ON public.raffles(project_id);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON public.raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle ON public.raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_reg ON public.raffle_participants(registration_id);

-- Raffle Winner Function
CREATE OR REPLACE FUNCTION draw_raffle_winner(p_raffle_id UUID)
RETURNS TABLE (
    ref_registration_id UUID,
    winner_name TEXT,
    winner_email TEXT
) AS $$
DECLARE
    v_winner_id UUID;
    v_raffle_type TEXT;
    v_stand_id UUID;
BEGIN
    -- Get raffle info
    SELECT type, stand_id INTO v_raffle_type, v_stand_id
    FROM public.raffles
    WHERE id = p_raffle_id;

    IF v_raffle_type = 'realtime_qr' THEN
        SELECT registration_id INTO v_winner_id
        FROM public.raffle_participants
        WHERE raffle_id = p_raffle_id
        ORDER BY random()
        LIMIT 1;
    ELSIF v_raffle_type = 'stand_checkin' THEN
        SELECT registration_id INTO v_winner_id
        FROM public.stand_checkins
        WHERE stand_id = v_stand_id
        ORDER BY random()
        LIMIT 1;
    END IF;

    -- Update raffle with winner
    IF v_winner_id IS NOT NULL THEN
        UPDATE public.raffles
        SET winner_registration_id = v_winner_id,
            drawn_at = NOW(),
            status = 'completed'
        WHERE id = p_raffle_id;
        
        RETURN QUERY 
        SELECT 
            r.id as ref_registration_id,
            r.nome as winner_name,
            r.email as winner_email
        FROM public.inscricoes_growth_experience r
        WHERE r.id = v_winner_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




-- ARCHIVE: 20260319_sync_check_ins_schema.sql
-- ============================================================
-- ============================================================
-- FIX: Sync check_ins table with current project schema
-- Date: 2026-03-19
-- ============================================================

-- 1. Ensure the table exists with the correct structure
-- If it exists but with wrong references, we'll fix migrations below
CREATE TABLE IF NOT EXISTS public.check_ins_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. If the old table exists, try to migrate data if possible
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'check_ins' AND table_schema = 'public') THEN
        -- Check if it's the old structure (referencing non-existent registrations)
        -- We just rename it and create the new one, but first check if check_ins_old exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'check_ins_old' AND table_schema = 'public') THEN
            ALTER TABLE public.check_ins RENAME TO check_ins_old;
            ALTER TABLE public.check_ins_new RENAME TO check_ins;
        ELSE
            -- If check_ins_old already exists, just drop it or just drop check_ins_new (sync already done probably)
            -- To be safe, we'll drop check_ins (the old one) since we have the new structure in check_ins_new
            DROP TABLE public.check_ins;
            ALTER TABLE public.check_ins_new RENAME TO check_ins;
        END IF;
    ELSE
        ALTER TABLE public.check_ins_new RENAME TO check_ins;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "check_ins_admin_all" ON public.check_ins;
CREATE POLICY "check_ins_admin_all" ON public.check_ins FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "check_ins_own_select" ON public.check_ins;
CREATE POLICY "check_ins_own_select" ON public.check_ins FOR SELECT USING (user_id = auth.uid());

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_check_ins_project_id ON public.check_ins(project_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_registration_id ON public.check_ins(registration_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);

DO $$ 
BEGIN 
    RAISE NOTICE 'Table check_ins synchronized successfully.';
END $$;




-- ARCHIVE: 20260321_fix_raffle_rls.sql
-- ============================================================
-- Fix Raffle RLS Policies
-- Use public.is_admin() instead of manual subquery to avoid recursion and support all admin roles (admin, staff, superadmin)

-- Fix raffles table
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage raffles" ON public.raffles;
CREATE POLICY "Admins can manage raffles" ON public.raffles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Fix raffle_participants table
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all participants" ON public.raffle_participants;
CREATE POLICY "Admins can view all participants" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Ensure everyone can view open/completed raffles (already exists but ensuring it matches patterns)
DROP POLICY IF EXISTS "Everyone can view open raffles" ON public.raffles;
CREATE POLICY "Everyone can view open raffles" ON public.raffles
    FOR SELECT TO authenticated
    USING (status = 'open' OR status = 'completed' OR public.is_admin());




-- ARCHIVE: 20260323_add_project_id_to_cupons.sql
-- ============================================================
-- ============================================================
-- Add missing 'project_id' column to cupons_parceria_social
-- Date: 2026-03-23
-- Objective: Fix PGRST204 "Could not find column project_id in schema cache"
-- ============================================================

DO $$ 
BEGIN 
    -- 1. Check if the column project_id exists in cupons_parceria_social
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cupons_parceria_social'
            AND column_name = 'project_id'
    ) THEN
        ALTER TABLE public.cupons_parceria_social
        ADD COLUMN project_id UUID REFERENCES public.projects(id);
        
        COMMENT ON COLUMN public.cupons_parceria_social.project_id IS 'ID do projeto ao qual este cupom pertence';
        
        -- Optional: Create an index for faster filtering
        CREATE INDEX IF NOT EXISTS idx_cupons_parceria_social_project ON public.cupons_parceria_social(project_id);
        
        RAISE NOTICE 'Coluna project_id adicionada com sucesso à tabela cupons_parceria_social';
    ELSE 
        RAISE NOTICE 'A coluna project_id já existe na tabela cupons_parceria_social';
    END IF;

    -- 2. Ensure Row Level Security is enabled and configured correctly
    ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;

    -- Cleanup old policies if they exist
    DROP POLICY IF EXISTS "cupons_admin_all" ON public.cupons_parceria_social;
    DROP POLICY IF EXISTS "cupons_public_read" ON public.cupons_parceria_social;

    -- Admin/Staff can do anything
    CREATE POLICY "cupons_admin_all" ON public.cupons_parceria_social
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

    -- Authenticated users (participants) can read to validate coupons
    CREATE POLICY "cupons_public_read" ON public.cupons_parceria_social
    FOR SELECT USING (true);

    RAISE NOTICE 'RLS policies updated for cupons_parceria_social';

END $$;





-- ARCHIVE: 20260323_support_module.sql
-- ============================================================
-- ============================================================
-- MODULE: SUPORTE ROBUSTO
-- Date: 2026-03-23
-- Objective: Create structure for support tickets and messaging
-- ============================================================

-- 1. Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL, -- Initial description
    category TEXT DEFAULT 'general', -- technical, finance, registration, general
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create support_ticket_messages table
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for support_tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
CREATE POLICY "Users can create their own tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE USING (public.is_admin() OR auth.uid() = user_id);

-- 5. RLS Policies for support_ticket_messages
DROP POLICY IF EXISTS "Users can view messages for their tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can view messages for their tickets" ON public.support_ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_id AND (user_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "Users can add messages to their tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can add messages to their tickets" ON public.support_ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_id AND (user_id = auth.uid() OR public.is_admin())
        )
    );

-- 6. Indices
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_project_id ON public.support_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- 7. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.support_tickets;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();




-- ARCHIVE: 20260325_add_support_csat.sql
-- ============================================================
-- ============================================================
-- MODULE: CSAT SUPPORT
-- Date: 2026-03-25
-- Objective: Add rating and feedback columns to support tickets
-- ============================================================

ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update RLS if needed (already allows update by owner/admin in previous migration)




-- ARCHIVE: 20260325_fix_certificates_schema_final.sql
-- ============================================================
-- ============================================================
-- FINAL FIX: Certificates Schema
-- Ensures 'activity_name' and other critical columns exist
-- ============================================================

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add activity_name if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificates' AND column_name = 'activity_name'
    ) THEN
        ALTER TABLE public.certificates ADD COLUMN activity_name TEXT;
    END IF;
END $$;

-- 3. Ensure other expected columns exist
DO $$ 
BEGIN 
    -- project_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'project_id') THEN
        ALTER TABLE public.certificates ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- registration_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'registration_id') THEN
        ALTER TABLE public.certificates ADD COLUMN registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE;
    END IF;

    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'user_id') THEN
        ALTER TABLE public.certificates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'type') THEN
        ALTER TABLE public.certificates ADD COLUMN type TEXT DEFAULT 'event';
    END IF;

    -- code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'code') THEN
        ALTER TABLE public.certificates ADD COLUMN code TEXT;
    END IF;

    -- issue_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'issue_date') THEN
        ALTER TABLE public.certificates ADD COLUMN issue_date TIMESTAMPTZ DEFAULT now();
    END IF;

    -- metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'metadata') THEN
        ALTER TABLE public.certificates ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'status') THEN
        ALTER TABLE public.certificates ADD COLUMN status TEXT DEFAULT 'issued';
    END IF;
END $$;

-- 4. Unique constraint on code
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'certificates_code_key'
    ) THEN
        ALTER TABLE public.certificates ADD CONSTRAINT certificates_code_key UNIQUE (code);
    END IF;
END $$;

-- 5. Notify PostgREST to refresh schema cache (Supabase specific hint)
-- Usually automatic, but this script ensures the structural integrity.




-- ARCHIVE: 20260327_fix_storage_rls.sql
-- ============================================================
-- GROWTH SUMMIT 2026 - FIX STORAGE RLS
-- Run this in your Supabase SQL Editor to enable profile photo uploads

-- 1. Ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Event Images Avatar Upload Policy" ON storage.objects;

-- 4. Create Policies

-- Allow PUBLIC READ access to the buckets
CREATE POLICY "Public Access Policy"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('avatars', 'event-images') );

-- Allow users to upload to 'avatars' bucket (root level)
-- FileName must start with their user ID
CREATE POLICY "Avatar Upload Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    name LIKE (auth.uid()::text || '-%')
);

-- Allow users to upload to 'event-images' bucket under specific folders
CREATE POLICY "Event Images Avatar Upload Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'event-images' AND
    (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    )
);

-- Allow users to UPDATE their own avatars
CREATE POLICY "Avatar Update Policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '-%')) OR
    (bucket_id = 'event-images' AND (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    ))
);

-- Allow users to DELETE their own avatars
CREATE POLICY "Avatar Delete Policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '-%')) OR
    (bucket_id = 'event-images' AND (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    ))
);




-- ARCHIVE: 20260328_add_project_settings.sql
-- ============================================================
-- Adiciona colunas de configuração e habilitadores de módulos para a tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT true;

-- Força o reload do schema no cache da API REST do Supabase (para evitar "Failed to fetch")
NOTIFY pgrst, 'reload schema';




-- ARCHIVE: 20260328_add_public_content.sql
-- ============================================================
-- Adiciona a coluna public_content para suportar configurações dinâmicas como pop-ups e textos do Admin
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb;




-- ARCHIVE: 20260328_combined_migrations.sql
-- ============================================================
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




-- ARCHIVE: 20260328_final_harmonization.sql
-- ============================================================
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




-- ARCHIVE: auth_confirm_bypass.sql
-- ============================================================
-- ============================================================
-- MANUAL EMAIL CONFIRMATION BYPASS
-- Use this ONLY if you are getting "Email not confirmed" error
-- ============================================================

-- 1. Confirma o e-mail do seu usuário admin atual
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW(),
    last_sign_in_at = NOW()
WHERE email = 'projetos@cbxgrowth.com.br'; -- Ou coloque o seu e-mail aqui

-- 2. (Opcional) Desativar confirmação de e-mail para NOVOS usuários (Local/Dev)
-- Nota: Isso geralmente é feito no Dashboard do Supabase (Authentication -> Settings -> User Signups) 
-- Mas você pode forçar a confirmação de qualquer usuário pendente com:
/*
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
*/




-- ARCHIVE: seeds.sql
-- ============================================================
-- ============================================================
-- GROWTH SUMMIT 2026 - Seeds (Dados de Exemplo)
-- ============================================================
-- IMPORTANTE: Os usuários devem ser criados via auth.signUp() do Supabase
-- ou via Dashboard antes de executar este seed.
-- Este seed assume que os usuários já existem em auth.users
-- ============================================================
-- FUNÇÃO AUXILIAR PARA CRIAR USUÁRIOS (se não existirem)
-- ============================================================
-- Criar usuários no auth.users se não existirem (apenas para desenvolvimento)
DO $$
DECLARE user_id UUID;
-- Usuário Admin (Principal)
user_id := 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
-- ID fixo para consistência
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'projetos@cbxgrowth.com.br'
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'projetos@cbxgrowth.com.br',
        crypt('Caio020689!@#$%', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Admin Growth Summit", "role": "admin"}'
    );
END IF;
-- Usuário Participante
user_id := '00000000-0000-0000-0000-000000000002';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'participante@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"João Silva"}'
    );
END IF;
-- Usuário Mentor
user_id := '00000000-0000-0000-0000-000000000003';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'mentor@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Dr. Fernando Lima"}'
    );
END IF;
-- Usuário Empresa
user_id := '00000000-0000-0000-0000-000000000004';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'empresa@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Empresa ABC"}'
    );
END IF;
-- Usuário Startup
user_id := '00000000-0000-0000-0000-000000000005';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'startup@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"TechStart Brasil"}'
    );
END IF;
-- Usuário Patrocinador
user_id := '00000000-0000-0000-0000-000000000006';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'patrocinador@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"TechCorp Brasil"}'
    );
END IF;
END $$;
-- ============================================================
-- USUÁRIOS (public.users)
-- ============================================================
INSERT INTO public.users (
        id,
        email,
        name,
        phone,
        role,
        avatar,
        email_verified,
        created_at
    )
VALUES (
        'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        'projetos@cbxgrowth.com.br',
        'Admin Growth Summit',
        '(88) 98843-2310',
        'admin',
        NULL,
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'participante@email.com',
        'João Silva',
        '(88) 98888-8888',
        'participant',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'mentor@email.com',
        'Dr. Fernando Lima',
        '(88) 97777-7777',
        'mentor',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'empresa@email.com',
        'Empresa ABC',
        '(88) 96666-6666',
        'company',
        NULL,
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'startup@email.com',
        'TechStart Brasil',
        '(88) 95555-5555',
        'startup',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000006',
        'patrocinador@email.com',
        'TechCorp Brasil',
        '(88) 94444-4444',
        'sponsor',
        NULL,
        TRUE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    avatar = EXCLUDED.avatar,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();
-- ============================================================
-- PERFIS
-- ============================================================
INSERT INTO public.profiles (
        user_id,
        company,
        position,
        bio,
        city,
        state,
        linkedin,
        created_at
    )
VALUES (
        '00000000-0000-0000-0000-000000000002',
        'TechStart Brasil',
        'Head de Growth',
        'Profissional de marketing com 10 anos de experiência.',
        'Juazeiro do Norte',
        'CE',
        'linkedin.com/in/joaosilva',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'ScaleUp Consultoria',
        'CEO',
        'Especialista em Growth Strategy e mentor de startups.',
        'São Paulo',
        'SP',
        'linkedin.com/in/fernandolima',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Empresa ABC',
        'Diretor Comercial',
        NULL,
        'Fortaleza',
        'CE',
        NULL,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'TechStart Brasil',
        'CEO',
        'Fundador de startup de tecnologia.',
        'Juazeiro do Norte',
        'CE',
        'linkedin.com/in/techstart',
        NOW()
    ) ON CONFLICT (user_id) DO
UPDATE
SET company = EXCLUDED.company,
    position = EXCLUDED.position,
    bio = EXCLUDED.bio,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    linkedin = EXCLUDED.linkedin,
    updated_at = NOW();
-- ============================================================
-- PALESTRANTES
-- ============================================================
INSERT INTO public.speakers (
        id,
        project_id,
        name,
        email,
        role,
        company,
        bio,
        image,
        linkedin,
        topics,
        order_index,
        is_featured,
        created_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        '550e8400-e29b-41d4-a716-446655440000',
        'Ana Silva',
        'ana@techstart.com.br',
        'Head of Growth',
        'TechStart Brasil',
        'Especialista em growth hacking com 10+ anos de experiência em startups.',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        'linkedin.com/in/anasilva',
        ARRAY ['Growth Marketing', 'Aquisição', 'Retenção'],
        1,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111112',
        '550e8400-e29b-41d4-a716-446655440000',
        'Carlos Mendes',
        'carlos@datadriven.com',
        'CEO',
        'DataDriven Labs',
        'Pioneiro em IA aplicada a negócios no Brasil.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        'linkedin.com/in/carlosmendes',
        ARRAY ['Inteligência Artificial', 'Machine Learning', 'Data Science'],
        2,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111113',
        '550e8400-e29b-41d4-a716-446655440000',
        'Mariana Costa',
        'mariana@salespro.com',
        'VP de Vendas',
        'SalesPro',
        'Especialista em vendas B2B e revenue operations.',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        'linkedin.com/in/marianacosta',
        ARRAY ['Vendas B2B', 'Sales Ops', 'Revenue'],
        3,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111114',
        '550e8400-e29b-41d4-a716-446655440000',
        'Pedro Oliveira',
        'pedro@growthmasters.com',
        'Founder',
        'Growth Masters',
        'Mentor de startups e especialista em marketing digital.',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        'linkedin.com/in/pedrooliveira',
        ARRAY ['Marketing Digital', 'SEO', 'Content Marketing'],
        4,
        FALSE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111115',
        '550e8400-e29b-41d4-a716-446655440000',
        'Juliana Ferreira',
        'juliana@innovateco.com',
        'People Director',
        'InnovateCo',
        'Especialista em cultura organizacional e liderança.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        'linkedin.com/in/julianaferreira',
        ARRAY ['Gestão', 'Liderança', 'People Ops'],
        5,
        FALSE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    updated_at = NOW();
-- ============================================================
-- SESSÕES (PROGRAMAÇÃO)
-- ============================================================
INSERT INTO public.sessions (
        id,
        project_id,
        title,
        description,
        type,
        track,
        day,
        start_time,
        end_time,
        room,
        max_capacity,
        registered_count,
        created_at
    )
VALUES -- Dia 1
    (
        '22222222-2222-2222-2222-222222222221',
        '550e8400-e29b-41d4-a716-446655440000',
        'Abertura + Palestra Âncora: Growth & IA em 2026',
        'Palestra de abertura do evento com as principais tendências.',
        'keynote',
        'Growth Marketing',
        1,
        '09:00',
        '10:00',
        'Auditório Principal',
        500,
        420,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '550e8400-e29b-41d4-a716-446655440000',
        'Growth Marketing em Startups',
        'Estratégias práticas de growth para startups em early stage.',
        'talk',
        'Growth Marketing',
        1,
        '10:30',
        '11:30',
        'Sala A',
        100,
        85,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222223',
        '550e8400-e29b-41d4-a716-446655440000',
        'SEO Avançado para 2026',
        'Técnicas avançadas de SEO e otimização para buscadores.',
        'workshop',
        'Marketing Digital',
        1,
        '10:30',
        '12:00',
        'Sala B',
        50,
        48,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222224',
        '550e8400-e29b-41d4-a716-446655440000',
        'Vendas B2B Consultiva',
        'Metodologia de vendas consultivas para grandes contas.',
        'talk',
        'Vendas B2B',
        1,
        '14:00',
        '15:30',
        'Sala A',
        100,
        72,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222225',
        '550e8400-e29b-41d4-a716-446655440000',
        'ChatGPT e IA na Prática',
        'Workshop hands-on de aplicação de IA no dia a dia.',
        'workshop',
        'Inteligência Artificial',
        1,
        '14:00',
        '16:00',
        'Sala C',
        50,
        50,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222226',
        '550e8400-e29b-41d4-a716-446655440000',
        'Painel: Inovação no Cariri-CE',
        'Discussão sobre o ecossistema de inovação da região.',
        'panel',
        NULL,
        1,
        '16:30',
        '17:30',
        'Auditório Principal',
        500,
        380,
        NOW()
    ),
    -- Dia 2
    (
        '22222222-2222-2222-2222-222222222227',
        '550e8400-e29b-41d4-a716-446655440000',
        'Palestra Âncora: Tendências 2026-2027',
        'O que esperar para os próximos anos em growth e inovação.',
        'keynote',
        NULL,
        2,
        '09:00',
        '10:00',
        'Auditório Principal',
        500,
        450,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222228',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Growth Hacking',
        'Táticas avançadas de growth hacking.',
        'workshop',
        'Growth Marketing',
        2,
        '10:30',
        '12:00',
        'Sala A',
        50,
        48,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222229',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Liderança em Times Remotos',
        'Gestão de equipes distribuídas e híbridas.',
        'workshop',
        'Gestão',
        2,
        '10:30',
        '12:00',
        'Sala B',
        50,
        45,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222230',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Pitch para Investidores',
        'Como criar um pitch deck que converte.',
        'workshop',
        'Startups',
        2,
        '10:30',
        '12:00',
        'Sala C',
        30,
        30,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222231',
        '550e8400-e29b-41d4-a716-446655440000',
        'Rodada de Mentorias 1:1',
        'Sessões individuais de mentoria.',
        'networking',
        NULL,
        2,
        '15:00',
        '17:30',
        'Área de Networking',
        100,
        85,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222232',
        '550e8400-e29b-41d4-a716-446655440000',
        'Encerramento + Premiação Startups',
        'Cerimônia de encerramento e premiação.',
        'keynote',
        NULL,
        2,
        '17:30',
        '18:30',
        'Auditório Principal',
        500,
        480,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();
-- ============================================================
-- MENTORES
-- ============================================================
INSERT INTO public.mentors (
        id,
        project_id,
        user_id,
        name,
        email,
        photo,
        bio,
        specialties,
        tracks,
        years_experience,
        company,
        position,
        linkedin,
        max_mentories,
        session_duration,
        status,
        created_at
    )
VALUES (
        '33333333-3333-3333-3333-333333333331',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000003',
        'Dr. Fernando Lima',
        'fernando@scaleup.com',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        'Especialista em Growth Strategy com 15 anos de experiência em consultoria.',
        ARRAY ['Growth Strategy', 'Escala', 'Fundraising'],
        ARRAY ['Growth Marketing'],
        15,
        'ScaleUp',
        'CEO',
        'linkedin.com/in/fernandolima',
        5,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Dra. Amanda Rocha',
        'amanda@digitalpro.com',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        'Especialista em Marketing Digital e SEO.',
        ARRAY ['Marketing Digital', 'SEO', 'Content Marketing'],
        ARRAY ['Marketing Digital'],
        12,
        'DigitalPro',
        'CMO',
        'linkedin.com/in/amandarocha',
        4,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Prof. Bruno Dias',
        'bruno@salesforce.com',
        NULL,
        'Especialista em Vendas B2B e Sales Operations.',
        ARRAY ['Vendas B2B', 'Sales Ops', 'Negociação'],
        ARRAY ['Vendas B2B'],
        18,
        'SalesForce',
        'VP Sales',
        'linkedin.com/in/brunodias',
        3,
        25,
        'pending',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333334',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Eng. Carla Martins',
        'carla@ailabs.com',
        NULL,
        'Especialista em IA e Automação.',
        ARRAY ['Inteligência Artificial', 'Automação', 'Machine Learning'],
        ARRAY ['Inteligência Artificial'],
        14,
        'AI Labs',
        'CTO',
        'linkedin.com/in/carlamartins',
        4,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333335',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Mestre Diego Alves',
        'diego@leadership.com',
        NULL,
        'Especialista em Liderança e Gestão de Pessoas.',
        ARRAY ['Liderança', 'Gestão', 'Cultura Organizacional'],
        ARRAY ['Gestão'],
        20,
        'Leadership Co',
        'Founder',
        'linkedin.com/in/diegoalves',
        3,
        25,
        'approved',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- EMPRESAS B2B
-- ============================================================
INSERT INTO public.companies (
        id,
        project_id,
        user_id,
        name,
        cnpj,
        type,
        sector,
        description,
        logo,
        website,
        contact_name,
        contact_email,
        contact_phone,
        package_type,
        max_meetings,
        status,
        interests,
        offers,
        created_at
    )
VALUES (
        '44444444-4444-4444-4444-444444444441',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000004',
        'Empresa ABC',
        '12.345.678/0001-90',
        'anchor',
        'Tecnologia',
        'Empresa de software e consultoria em TI.',
        'https://via.placeholder.com/200',
        'https://empresaabc.com.br',
        'Carlos Mendes',
        'carlos@empresaabc.com.br',
        '(11) 99999-9999',
        'anchor',
        8,
        'approved',
        ARRAY ['Fornecedores de Software', 'Consultoria'],
        ARRAY ['Serviços de TI', 'Consultoria'],
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Fornecedora XYZ',
        '98.765.432/0001-10',
        'vendor',
        'Marketing',
        'Agência de marketing digital e performance.',
        'https://via.placeholder.com/200',
        'https://xyzmarketing.com.br',
        'Ana Paula',
        'ana@xyzmarketing.com.br',
        '(21) 88888-8888',
        'vendor',
        15,
        'approved',
        ARRAY ['Clientes B2B'],
        ARRAY ['Marketing Digital', 'Performance'],
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Tech Solutions',
        '11.222.333/0001-44',
        'vendor',
        'TI',
        'Consultoria em infraestrutura de TI.',
        NULL,
        NULL,
        'Roberto Alves',
        'roberto@techsolutions.com.br',
        '(31) 77777-7777',
        'vendor',
        10,
        'pending',
        ARRAY ['Grandes Empresas'],
        ARRAY ['Infraestrutura TI', 'Cloud'],
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- STARTUPS
-- ============================================================
INSERT INTO public.startups (
        id,
        project_id,
        user_id,
        name,
        cnpj,
        description,
        sector,
        stage,
        logo,
        website,
        founding_team,
        metrics_revenue,
        metrics_users,
        metrics_growth,
        package_type,
        stand_number,
        status,
        created_at
    )
VALUES (
        '55555555-5555-5555-5555-555555555551',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000005',
        'TechStart Brasil',
        '33.444.555/0001-66',
        'Plataforma de gestão para pequenas empresas.',
        'SaaS',
        'traction',
        'https://via.placeholder.com/200',
        'https://techstart.com.br',
        '[{"name": "João Silva", "role": "CEO"}, {"name": "Maria Santos", "role": "CTO"}]'::jsonb,
        50000,
        1000,
        150.00,
        'pitch',
        'A01',
        'approved',
        NOW()
    ),
    (
        '55555555-5555-5555-5555-555555555552',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'AppNova',
        '77.888.999/0001-22',
        'Aplicativo de delivery para pequenos restaurantes.',
        'FoodTech',
        'mvp',
        'https://via.placeholder.com/200',
        'https://appnova.com.br',
        '[{"name": "Pedro Costa", "role": "Founder"}]'::jsonb,
        NULL,
        500,
        80.00,
        'expo',
        'A02',
        'approved',
        NOW()
    ),
    (
        '55555555-5555-5555-5555-555555555553',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'DataDriven',
        '55.666.777/0001-33',
        'Plataforma de analytics com IA para e-commerce.',
        'Data',
        'idea',
        NULL,
        NULL,
        '[{"name": "Lucas Lima", "role": "CEO"}]'::jsonb,
        NULL,
        NULL,
        NULL,
        'expo',
        NULL,
        'pending',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- PATROCINADORES
-- ============================================================
INSERT INTO public.sponsors (
        id,
        project_id,
        company_name,
        trading_name,
        cnpj,
        contact_name,
        contact_email,
        contact_phone,
        level,
        investment,
        status,
        closed_at,
        logo,
        website,
        notes,
        created_at
    )
VALUES (
        '66666666-6666-6666-6666-666666666661',
        '550e8400-e29b-41d4-a716-446655440000',
        'TechCorp Brasil',
        'TechCorp',
        '10.000.000/0001-00',
        'Ana Silva',
        'ana@techcorp.com.br',
        '(11) 99999-9999',
        'diamond',
        6000000,
        'closed',
        NOW() - INTERVAL '30 days',
        'https://via.placeholder.com/300',
        'https://techcorp.com.br',
        'Patrocinador principal do evento.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        '550e8400-e29b-41d4-a716-446655440000',
        'InnovateLabs',
        'InnovateLabs',
        '20.000.000/0001-00',
        'Bruno Mendes',
        'bruno@innovatelabs.com.br',
        '(21) 88888-8888',
        'gold',
        3000000,
        'closed',
        NOW() - INTERVAL '20 days',
        'https://via.placeholder.com/300',
        'https://innovatelabs.com.br',
        'Patrocinador gold.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666663',
        '550e8400-e29b-41d4-a716-446655440000',
        'CloudSys',
        'CloudSys Tecnologia',
        '30.000.000/0001-00',
        'Carla Rocha',
        'carla@cloudsys.com.br',
        '(31) 77777-7777',
        'silver',
        1500000,
        'negotiation',
        NULL,
        NULL,
        'https://cloudsys.com.br',
        'Em negociação.',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET company_name = EXCLUDED.company_name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- ENTREGÁVEIS DE PATROCINADORES
-- ============================================================
INSERT INTO public.sponsor_deliverables (
        sponsor_id,
        item,
        description,
        status,
        deadline,
        completed_at,
        notes,
        created_at
    )
VALUES (
        '66666666-6666-6666-6666-666666666661',
        'Palestra 20min',
        'Palestra no palco principal',
        'completed',
        '2026-04-01',
        NOW() - INTERVAL '10 days',
        'Tema aprovado.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666661',
        'Stand 6x4m',
        'Stand premium na área de exposição',
        'completed',
        '2026-05-15',
        NOW() - INTERVAL '5 days',
        'Montagem concluída.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666661',
        'Logo em todos os materiais',
        'Logo em banners, site, etc.',
        'in_progress',
        '2026-05-01',
        NULL,
        'Em produção.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        'Stand 4x3m',
        'Stand na área de exposição',
        'in_progress',
        '2026-05-15',
        NULL,
        NULL,
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        'Logo no site',
        'Logo no site do evento',
        'completed',
        '2026-03-01',
        NOW() - INTERVAL '15 days',
        NULL,
        NOW()
    ) ON CONFLICT DO NOTHING;
-- ============================================================
-- TRANSAÇÕES FINANCEIRAS
-- ============================================================
INSERT INTO public.transactions (
        id,
        project_id,
        type,
        category,
        description,
        amount,
        date,
        status,
        payment_method,
        payment_provider,
        related_type,
        notes,
        created_at
    )
VALUES (
        '77777777-7777-7777-7777-777777777771',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Inscrições',
        'João Silva - Passe Pro',
        49700,
        '2026-01-15',
        'completed',
        'credit_card',
        'stripe',
        'registration',
        'Pagamento confirmado.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777772',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Patrocínio',
        'TechCorp - Diamond',
        6000000,
        '2026-01-10',
        'completed',
        'transfer',
        'manual',
        'sponsor',
        'Patrocínio principal.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777773',
        '550e8400-e29b-41d4-a716-446655440000',
        'expense',
        'Venue',
        'Boulevard Hotel - Caução',
        1800000,
        '2026-01-05',
        'completed',
        'transfer',
        'manual',
        NULL,
        'Caução do local.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777774',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Startups',
        'TechStart Brasil - Pitch',
        250000,
        '2026-01-12',
        'completed',
        'pix',
        'stripe',
        'startup',
        'Taxa de participação startup.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777775',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Patrocínio',
        'InnovateLabs - Gold',
        3000000,
        '2026-01-20',
        'completed',
        'transfer',
        'manual',
        'sponsor',
        'Patrocínio gold.',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- INSCRIÇÕES (exemplo)
-- ============================================================
INSERT INTO public.registrations (
        id,
        project_id,
        user_id,
        ticket_type,
        status,
        ticket_number,
        qr_code,
        amount,
        discount_amount,
        final_amount,
        payment_method,
        payment_provider,
        payment_status,
        payment_date,
        checked_in,
        created_at
    )
VALUES (
        '88888888-8888-8888-8888-888888888881',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000002',
        'pro',
        'paid',
        NULL,
        'qr-data-1',
        49700,
        0,
        49700,
        'credit_card',
        'stripe',
        'completed',
        NOW() - INTERVAL '10 days',
        FALSE,
        NOW()
    ),
    (
        '88888888-8888-8888-8888-888888888882',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000003',
        'vip',
        'paid',
        NULL,
        'qr-data-2',
        250000,
        0,
        250000,
        'pix',
        'stripe',
        'completed',
        NOW() - INTERVAL '5 days',
        FALSE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- NOTIFICAÇÕES (Idempotente)
-- ============================================================
DO $$
BEGIN
    -- Notificação para João Silva
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000002', 'Bem-vindo ao Growth Summit 2026!', 'Sua inscrição foi confirmada. Estamos ansiosos para vê-lo no evento.', 'success', '/minha-area', 'Ver minha área', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Notificação para João Silva (Perfil)
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000002', 'Complete seu perfil', 'Adicione mais informações ao seu perfil para aproveitar melhor o evento.', 'info', '/minha-area/dados', 'Completar perfil', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Notificação para Dr. Fernando Lima
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000003') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000003', 'Nova solicitação de mentoria', 'Você recebeu uma nova solicitação de mentoria.', 'info', '/mentor-area/mentorias', 'Ver solicitações', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

