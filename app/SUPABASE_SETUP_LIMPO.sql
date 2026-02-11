-- ============================================================
-- GROWTH SUMMIT 2026 - SETUP LIMPO (SEM ERROS)
-- ============================================================
-- Este script pode ser executado múltiplas vezes sem erros
-- Ele verifica se cada elemento já existe antes de criar
-- ============================================================
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================================
-- LIMPAR TRIGGERS EXISTENTES (se necessário)
-- ============================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
DROP TRIGGER IF EXISTS update_speakers_updated_at ON public.speakers;
DROP TRIGGER IF EXISTS update_mentors_updated_at ON public.mentors;
DROP TRIGGER IF EXISTS update_mentoring_sessions_updated_at ON public.mentoring_sessions;
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
DROP TRIGGER IF EXISTS update_b2b_meetings_updated_at ON public.b2b_meetings;
DROP TRIGGER IF EXISTS update_startups_updated_at ON public.startups;
DROP TRIGGER IF EXISTS update_sponsors_updated_at ON public.sponsors;
DROP TRIGGER IF EXISTS update_sponsor_deliverables_updated_at ON public.sponsor_deliverables;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON public.email_templates;
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON public.email_campaigns;
DROP TRIGGER IF EXISTS set_ticket_number ON public.registrations;
-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================
-- Usuários (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (
        role IN (
            'visitor',
            'participant',
            'mentor',
            'company',
            'startup',
            'sponsor',
            'admin',
            'staff'
        )
    ),
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
    gender TEXT CHECK (
        gender IN ('male', 'female', 'other', 'prefer_not_to_say')
    ),
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
    type TEXT NOT NULL CHECK (
        type IN (
            'growth_summit',
            'growth_experience',
            'growth_conference',
            'growth_festival'
        )
    ),
    description TEXT NOT NULL,
    short_description TEXT,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'BR',
    address TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'active',
            'paused',
            'completed',
            'cancelled'
        )
    ),
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
-- Inscrições
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('standard', 'pro', 'vip')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'paid',
            'cancelled',
            'refunded',
            'expired'
        )
    ),
    ticket_number TEXT UNIQUE,
    qr_code TEXT,
    qr_code_data TEXT,
    amount INTEGER NOT NULL,
    discount_amount INTEGER DEFAULT 0,
    final_amount INTEGER NOT NULL,
    payment_method TEXT CHECK (
        payment_method IN (
            'credit_card',
            'pix',
            'boleto',
            'transfer',
            'cash'
        )
    ),
    payment_provider TEXT CHECK (
        payment_provider IN ('stripe', 'pagarme', 'mercadopago', 'manual')
    ),
    payment_provider_id TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'processing',
            'completed',
            'failed',
            'refunded'
        )
    ),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_metadata JSONB,
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_at TIMESTAMP WITH TIME ZONE,
    check_in_location TEXT,
    check_in_by UUID REFERENCES public.users(id),
    check_in_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);
-- Sessões do evento
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (
        type IN (
            'keynote',
            'talk',
            'panel',
            'workshop',
            'networking',
            'break'
        )
    ),
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
    topics TEXT [],
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
-- Mentores
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        photo TEXT,
        bio TEXT NOT NULL,
        specialties TEXT [] NOT NULL,
        tracks TEXT [],
        years_experience INTEGER,
        company TEXT,
        position TEXT,
        linkedin TEXT,
        website TEXT,
        max_mentories INTEGER DEFAULT 5,
        session_duration INTEGER DEFAULT 25,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'approved', 'rejected', 'inactive')
        ),
        rejection_reason TEXT,
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
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 25,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        )
    ),
    topic TEXT,
    description TEXT,
    notes TEXT,
    location TEXT,
    meeting_url TEXT,
    mentee_rating INTEGER CHECK (
        mentee_rating >= 1
        AND mentee_rating <= 5
    ),
    mentee_comment TEXT,
    mentor_rating INTEGER CHECK (
        mentor_rating >= 1
        AND mentor_rating <= 5
    ),
    mentor_comment TEXT,
    three_steps TEXT [],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES public.users(id),
    cancellation_reason TEXT
);
-- Empresas B2B
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        cnpj TEXT,
        type TEXT NOT NULL CHECK (type IN ('anchor', 'vendor')),
        sector TEXT NOT NULL,
        description TEXT NOT NULL,
        logo TEXT,
        website TEXT,
        contact_name TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        contact_whatsapp TEXT,
        package_type TEXT CHECK (package_type IN ('anchor', 'vendor', 'custom')),
        max_meetings INTEGER DEFAULT 10,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'approved', 'rejected', 'inactive')
        ),
        rejection_reason TEXT,
        interests TEXT [],
        offers TEXT [],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Reuniões B2B
CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_anchor_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    company_vendor_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 15,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled',
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        )
    ),
    location TEXT,
    table_number TEXT,
    notes TEXT,
    interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
    follow_up BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    deal_closed BOOLEAN DEFAULT FALSE,
    deal_value INTEGER,
    requested_by UUID NOT NULL REFERENCES public.users(id),
    accepted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Startups
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        cnpj TEXT,
        description TEXT NOT NULL,
        sector TEXT NOT NULL,
        stage TEXT NOT NULL CHECK (
            stage IN ('idea', 'mvp', 'traction', 'scale', 'exit')
        ),
        logo TEXT,
        pitch_deck TEXT,
        video_pitch TEXT,
        website TEXT,
        founding_team JSONB DEFAULT '[]'::jsonb,
        metrics_revenue INTEGER,
        metrics_users INTEGER,
        metrics_growth DECIMAL(5, 2),
        metrics_other JSONB,
        package_type TEXT NOT NULL CHECK (package_type IN ('expo', 'pitch', 'both')),
        stand_number TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (
            status IN ('pending', 'approved', 'rejected', 'confirmed')
        ),
        rejection_reason TEXT,
        pitch_scheduled_at TIMESTAMP WITH TIME ZONE,
        pitch_duration INTEGER DEFAULT 5,
        pitch_order INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_company TEXT,
    visitor_registration_id UUID REFERENCES public.registrations(id),
    interest_level TEXT NOT NULL CHECK (interest_level IN ('low', 'medium', 'high')),
    notes TEXT,
    tags TEXT [],
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Patrocinadores
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    trading_name TEXT,
    cnpj TEXT,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    level TEXT NOT NULL CHECK (
        level IN (
            'diamond',
            'gold',
            'silver',
            'bronze',
            'supporter'
        )
    ),
    investment INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (
        status IN ('prospect', 'negotiation', 'closed', 'cancelled')
    ),
    closed_at TIMESTAMP WITH TIME ZONE,
    logo TEXT,
    website TEXT,
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    deadline DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    responsible_id UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'cancelled', 'refunded')
    ),
    related_id UUID,
    related_type TEXT,
    payment_method TEXT,
    payment_provider TEXT,
    payment_provider_id TEXT,
    receipt_url TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
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
    ticket_number TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    method TEXT NOT NULL CHECK (
        method IN ('qr_code', 'manual', 'rfid', 'facial')
    ),
    staff_id UUID REFERENCES public.users(id),
    device_id TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Templates de email
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT [] DEFAULT '{}',
    category TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Campanhas de email
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    subject TEXT,
    body_html TEXT,
    recipient_filter JSONB,
    recipient_count INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'scheduled',
            'sending',
            'sent',
            'cancelled'
        )
    ),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
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
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    action_url TEXT,
    action_text TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        project_id UUID REFERENCES public.projects(id) ON DELETE
    SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_registrations_project ON public.registrations(project_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON public.registrations(ticket_number);
CREATE INDEX IF NOT EXISTS idx_sessions_project ON public.sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_day ON public.sessions(day);
CREATE INDEX IF NOT EXISTS idx_mentors_project ON public.mentors(project_id);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON public.mentors(status);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentor ON public.mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentee ON public.mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_date ON public.mentoring_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_companies_project ON public.companies(project_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_project ON public.b2b_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_date ON public.b2b_meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_startups_project ON public.startups(project_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups(status);
CREATE INDEX IF NOT EXISTS idx_transactions_project ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_check_ins_project ON public.check_ins(project_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_registration ON public.check_ins(registration_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_timestamp ON public.check_ins(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
-- ============================================================
-- FUNÇÕES
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE OR REPLACE FUNCTION generate_ticket_number() RETURNS TRIGGER AS $$
DECLARE project_slug TEXT;
sequence INTEGER;
new_ticket_number TEXT;
BEGIN
SELECT slug INTO project_slug
FROM public.projects
WHERE id = NEW.project_id;
SELECT COUNT(*) + 1 INTO sequence
FROM public.registrations
WHERE project_id = NEW.project_id;
new_ticket_number := UPPER(REPLACE(project_slug, '-', '')) || '-' || LPAD(sequence::TEXT, 5, '0');
NEW.ticket_number := new_ticket_number;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE
UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE
UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE
UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_speakers_updated_at BEFORE
UPDATE ON public.speakers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE
UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_sessions_updated_at BEFORE
UPDATE ON public.mentoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE
UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_b2b_meetings_updated_at BEFORE
UPDATE ON public.b2b_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_startups_updated_at BEFORE
UPDATE ON public.startups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsors_updated_at BEFORE
UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsor_deliverables_updated_at BEFORE
UPDATE ON public.sponsor_deliverables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE
UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE
UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_ticket_number BEFORE
INSERT ON public.registrations FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();
-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
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
-- Limpar políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Projetos ativos são visíveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
DROP POLICY IF EXISTS "Usuários veem suas próprias inscrições" ON public.registrations;
DROP POLICY IF EXISTS "Admins veem todas as inscrições" ON public.registrations;
DROP POLICY IF EXISTS "Usuários podem criar inscrições" ON public.registrations;
DROP POLICY IF EXISTS "Mentores veem suas sessões" ON public.mentoring_sessions;
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem marcar notificações como lidas" ON public.notifications;
-- Criar políticas
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Projetos ativos são visíveis para todos" ON public.projects FOR
SELECT USING (status = 'active');
CREATE POLICY "Admins podem gerenciar projetos" ON public.projects FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'staff')
    )
);
CREATE POLICY "Usuários veem suas próprias inscrições" ON public.registrations FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins veem todas as inscrições" ON public.registrations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Usuários podem criar inscrições" ON public.registrations FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Mentores veem suas sessões" ON public.mentoring_sessions FOR
SELECT USING (
        mentor_id IN (
            SELECT id
            FROM public.mentors
            WHERE user_id = auth.uid()
        )
        OR mentee_id = auth.uid()
    );
CREATE POLICY "Usuários veem suas próprias notificações" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Usuários podem marcar notificações como lidas" ON public.notifications FOR
UPDATE USING (user_id = auth.uid());
-- ============================================================
-- DADOS INICIAIS
-- ============================================================
INSERT INTO public.projects (
        id,
        name,
        slug,
        type,
        description,
        short_description,
        location,
        city,
        state,
        address,
        start_date,
        end_date,
        status,
        primary_color,
        secondary_color,
        max_registrations,
        max_mentors,
        max_startups,
        max_companies,
        enable_b2b,
        enable_mentoring,
        enable_startups,
        enable_check_in,
        ticket_price_standard,
        ticket_price_pro,
        ticket_price_vip,
        target_registrations,
        target_revenue
    )
VALUES (
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
        '2026-05-21',
        '2026-05-22',
        'active',
        '#21808D',
        '#FE4C38',
        1500,
        20,
        15,
        50,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        29700,
        49700,
        250000,
        1500,
        61600000
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.email_templates (name, subject, body_html, category, is_default)
VALUES (
        'welcome',
        'Bem-vindo ao Growth Summit 2026!',
        '<h1>Olá {{name}}!</h1><p>Bem-vindo ao Growth Summit 2026.</p>',
        'onboarding',
        TRUE
    ),
    (
        'payment_confirmed',
        'Pagamento Confirmado',
        '<h1>Pagamento Confirmado!</h1><p>Olá {{name}}, seu pagamento foi confirmado.</p>',
        'transaction',
        TRUE
    ),
    (
        'mentoring_scheduled',
        'Mentoria Agendada',
        '<h1>Mentoria Confirmada</h1><p>Sua mentoria foi agendada.</p>',
        'mentoring',
        TRUE
    ),
    (
        'event_reminder',
        'Lembrete: Growth Summit 2026',
        '<h1>Falta pouco!</h1><p>O evento começa amanhã!</p>',
        'reminder',
        TRUE
    ) ON CONFLICT DO NOTHING;
-- ============================================================
-- PERMISSÕES
-- ============================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.projects TO anon;
GRANT INSERT ON public.users TO anon;
-- ============================================================
-- CONCLUÍDO! ✅
-- ============================================================