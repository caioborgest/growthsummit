-- ============================================================
-- GROWTH EXPERIENCE 2026 - INTEGRAÇÃO TOTAL (MASTER SCHEMA)
-- Data: 2026-03-28
-- Abrangência: Todos os módulos, financeiro, suporte, sorteios, etc.
-- ============================================================

-- 0. CONFIGURAÇÕES INICIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET session_replication_role = 'origin';

-- 1. HELPERS GLOBAIS
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((auth.jwt()->'app_metadata'->>'role'), (auth.jwt()->'user_metadata'->>'role'), '') IN ('admin', 'staff', 'superadmin');
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

-- 2. IDENTIDADE (USUÁRIOS E PERFIS)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant',
    phone TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    company TEXT,
    position TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    city TEXT,
    state TEXT,
    cpf TEXT,
    cnpj TEXT,
    newsletter_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GESTÃO DE PROJETOS (EVENTOS)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'growth_experience',
    description TEXT,
    short_description TEXT,
    location TEXT,
    city TEXT,
    state TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    primary_color TEXT DEFAULT '#FE4C38',
    secondary_color TEXT DEFAULT '#FF6B35',
    max_registrations INTEGER DEFAULT 500,
    max_mentors INTEGER DEFAULT 50,
    ticket_price_standard INTEGER DEFAULT 0,
    ticket_price_pro INTEGER DEFAULT 0,
    ticket_price_vip INTEGER DEFAULT 0,
    goal_revenue NUMERIC DEFAULT 0,
    goal_sponsorship NUMERIC DEFAULT 0,
    goal_registrations INTEGER DEFAULT 0,
    public_content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MÓDULO DE INSCRIÇÕES E PARTICIPAÇÃO
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    cpf TEXT,
    cursos_selecionados UUID[] DEFAULT '{}',
    tipo_inscricao TEXT DEFAULT 'standard',
    valor_pago NUMERIC DEFAULT 0,
    status_pagamento TEXT DEFAULT 'pendente',
    status TEXT DEFAULT 'ativo',
    evento TEXT,
    palestras_noturnas BOOLEAN DEFAULT FALSE,
    cupom_palestra TEXT,
    tipo_atividade_selecionada TEXT,
    sala_atividade TEXT,
    horario_atividade TEXT,
    external_payment_id TEXT,
    external_payment_url TEXT,
    app_instalado BOOLEAN DEFAULT FALSE,
    voucher_empresa TEXT,
    lote_id UUID,
    extra_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Módulo de Programação
CREATE TABLE IF NOT EXISTS public.programacao_evento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT,
    category TEXT,
    speakers TEXT[],
    room TEXT,
    start_time TIME,
    end_time TIME,
    max_vagas INTEGER DEFAULT 0,
    registered_count INTEGER DEFAULT 0,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MÓDULO EXECUTIVO (B2B, STARTUPS, MENTORIAS)
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    empresa TEXT,
    cargo TEXT,
    especialidades TEXT[],
    bio TEXT,
    foto_url TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'aprovado',
    max_mentories INTEGER DEFAULT 5,
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentorias_agendadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentores_growth_experience(id) ON DELETE CASCADE,
    mentorado_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    nome_mentorado TEXT,
    email_mentorado TEXT,
    telefone_mentorado TEXT,
    tema_interesse TEXT,
    anotacoes TEXT,
    data_mentoria TIMESTAMP WITH TIME ZONE,
    duracao INTEGER DEFAULT 25,
    status TEXT DEFAULT 'agendado',
    avaliacao_mentoria INTEGER,
    indicacao_mentor INTEGER,
    avaliado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome_empresa TEXT NOT NULL,
    nome_representante TEXT,
    email TEXT,
    telefone TEXT,
    setor TEXT,
    cnpj TEXT,
    porte TEXT,
    site_url TEXT,
    logo_url TEXT,
    tipo_interesse TEXT,
    areas_interesse TEXT,
    descricao_objetivos TEXT,
    valor_investido NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    nome_startup TEXT NOT NULL,
    nome_fundador TEXT,
    descricao_startup TEXT,
    setor TEXT,
    estagio TEXT,
    video_pitch_url TEXT,
    pitch_deck_url TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MÓDULO CORPORATIVO E CUPONS
CREATE TABLE IF NOT EXISTS public.lotes_inscricao_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    nome_empresa TEXT NOT NULL,
    email_contato TEXT NOT NULL,
    nome_responsavel TEXT,
    email_responsavel TEXT,
    voucher_code TEXT UNIQUE NOT NULL,
    quantidade_vagas INTEGER NOT NULL,
    vagas_utilizadas INTEGER DEFAULT 0,
    tipo_ingresso TEXT DEFAULT 'pro',
    valor_total NUMERIC DEFAULT 0,
    status_pagamento TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cupons_parceria_social (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    codigo TEXT UNIQUE NOT NULL,
    indicacao_tipo TEXT,
    indicacao_nome TEXT,
    porcentagem_desconto NUMERIC DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    uso_limite INTEGER,
    uso_atual INTEGER DEFAULT 0,
    descricao TEXT,
    vencimento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inscricoes_empresas_incentivadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    nome_responsavel TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    quantidade_equipe INTEGER DEFAULT 0,
    quantidade_dia INTEGER DEFAULT 0,
    quantidade_noite INTEGER DEFAULT 0,
    objetivo TEXT,
    valor_investido NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MÓDULO DE CERTIFICADOS E SUPORTE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    item_id UUID, -- ID da inscrição ou sessão
    item_type TEXT, -- 'registration', 'session'
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'open', 'resolved', 'closed'
    priority TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MÓDULO DE FINANCEIRO E TRANSAÇÕES
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL, -- em centavos
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'completed',
    payment_method TEXT,
    payment_provider TEXT,
    external_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MÓDULO DE SORTEIOS (RAFFLES)
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    stand_id UUID,
    winner_registration_id UUID,
    drawn_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(raffle_id, registration_id)
);

-- 10. MÓDULO DE LEADS E CHECK-INS
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_company TEXT,
    interest_level TEXT,
    startup_id UUID,
    company_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    method TEXT DEFAULT 'qr_code',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. RPCs (FUNÇÕES AVANÇADAS)
CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
    p_project_id UUID, p_user_id UUID, p_nome TEXT, p_email TEXT, p_telefone TEXT, p_cpf TEXT, 
    p_session_ids UUID[], p_tipo_inscricao TEXT, p_valor_pago NUMERIC, p_status_pagamento TEXT, 
    p_status TEXT, p_evento TEXT, p_palestras_noturnas BOOLEAN, p_tipo_atividade TEXT, 
    p_sala_atividade TEXT, p_horario_atividade TEXT, p_nivel_atividade TEXT, p_indicacao_tipo TEXT, 
    p_indicacao_nome TEXT, p_codigo_social TEXT, p_codigo_palestra TEXT, p_extra_data JSONB, 
    p_lote_id UUID, p_voucher_empresa TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_insc_id UUID; v_sess_id UUID;
BEGIN
    INSERT INTO public.inscricoes_growth_experience (
        project_id, user_id, nome, email, telefone, cpf, cursos_selecionados, 
        tipo_inscricao, valor_pago, status_pagamento, status, evento, 
        palestras_noturnas, tipo_atividade_selecionada, sala_atividade, 
        horario_atividade, indicacao_tipo, indicacao_nome, cupom_palestra, 
        extra_data, lote_id, voucher_empresa
    ) VALUES (
        p_project_id, p_user_id, p_nome, p_email, p_telefone, p_cpf, p_session_ids,
        p_tipo_inscricao, p_valor_pago, p_status_pagamento, p_status, p_evento,
        p_palestras_noturnas, p_tipo_atividade, p_sala_atividade, p_horario_atividade,
        p_indicacao_tipo, p_indicacao_nome, p_codigo_palestra, p_extra_data, p_lote_id, p_voucher_empresa
    ) RETURNING id INTO v_insc_id;

    IF p_session_ids IS NOT NULL AND array_length(p_session_ids, 1) > 0 THEN
        FOREACH v_sess_id IN ARRAY p_session_ids LOOP
            UPDATE public.programacao_evento SET registered_count = registered_count + 1 WHERE id = v_sess_id;
        END LOOP;
    END IF;
    RETURN jsonb_build_object('success', true, 'id', v_insc_id);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END; $$;

-- 12. TRIGGERS E AUTOMACAO DE USUARIO
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'Usuário'), 'participant')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name;
  INSERT INTO public.profiles (user_id) VALUES (new.id) ON CONFLICT DO NOTHING;
  RETURN new;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. SEED DATA (PROJETOS)
INSERT INTO public.projects (name, slug, city, state, start_date, end_date, description)
VALUES 
('Growth Experience Triunfo 2026', 'ge-triunfo-2026', 'Triunfo', 'PE', '2026-04-16', '2026-04-16', 'Imersão em Growth e IA no Sertão.'),
('Growth Experience Petrolina 2026', 'ge-petrolina-2026', 'Petrolina', 'PE', '2026-05-20', '2026-05-22', 'O maior evento de marketing do Vale.')
ON CONFLICT (slug) DO NOTHING;

-- 14. POLÍTICAS RLS (CONTROLE GERAL)
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admin CRUD %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Admin CRUD %I" ON public.%I FOR ALL USING (public.is_admin())', t, t);
    END LOOP;
END $$;

CREATE POLICY "Public Select Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Select Schedule" ON public.programacao_evento FOR SELECT USING (true);
CREATE POLICY "Anyone Insert Reg" ON public.inscricoes_growth_experience FOR INSERT WITH CHECK (true);
CREATE POLICY "Self Manage Prof" ON public.profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone Insert Support" ON public.support_tickets FOR INSERT WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
