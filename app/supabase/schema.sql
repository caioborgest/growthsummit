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
-- Alias para compatibilidade regional (Programação)
CREATE TABLE IF NOT EXISTS public.event_schedule (
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
