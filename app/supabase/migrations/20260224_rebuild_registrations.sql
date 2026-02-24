-- =====================================================================
-- 20260224_rebuild_registrations.sql
-- Reconstruction of registration tables to ensure full alignment with frontend
-- AND multi-event support via project_id.
-- =====================================================================
-- 0. DROPS (Clean slate for registrations)
DROP TABLE IF EXISTS public.inscricoes_growth_experience CASCADE;
DROP TABLE IF EXISTS public.startups_arena_pitch CASCADE;
DROP TABLE IF EXISTS public.rodada_negocios_b2b CASCADE;
DROP TABLE IF EXISTS public.mentores_growth_experience CASCADE;
-- ================================================================
-- 1. TABLE: inscricoes_growth_experience (Standard Registration)
-- ================================================================
CREATE TABLE public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        empresa TEXT,
        tipo_inscricao TEXT,
        -- 'individual', 'equipe', etc.
        evento TEXT,
        -- Nome legível do evento
        cursos_selecionados TEXT [] DEFAULT '{}',
        palestras_noturnas BOOLEAN DEFAULT FALSE,
        valor_pago DECIMAL(10, 2) DEFAULT 0,
        status_pagamento TEXT DEFAULT 'pago',
        status TEXT DEFAULT 'ativo',
        app_instalado BOOLEAN DEFAULT FALSE,
        indicacao_tipo TEXT,
        indicacao_nome TEXT,
        codigo_social TEXT,
        codigo_palestra TEXT,
        cupom_palestra TEXT,
        valor_desconto_social DECIMAL(10, 2) DEFAULT 0,
        valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0,
        -- Campos de Atividade (Faltantes na versão anterior)
        tipo_atividade_selecionada TEXT,
        sala_atividade TEXT,
        horario_atividade TEXT,
        nivel_atividade TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_ige_email ON public.inscricoes_growth_experience(email);
CREATE INDEX idx_ige_project ON public.inscricoes_growth_experience(project_id);
-- ================================================================
-- 2. TABLE: startups_arena_pitch
-- ================================================================
CREATE TABLE public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        nome_fundador TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        nome_startup TEXT NOT NULL,
        setor TEXT NOT NULL,
        estagio TEXT NOT NULL,
        descricao_startup TEXT NOT NULL,
        problema TEXT,
        solucao TEXT,
        modelo_negocio TEXT,
        diferencial TEXT,
        site_url TEXT,
        linkedin_url TEXT,
        faturamento_mensal DECIMAL(15, 2),
        investimento_buscado DECIMAL(15, 2),
        pitch_deck_url TEXT,
        video_pitch_url TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sap_project ON public.startups_arena_pitch(project_id);
-- ================================================================
-- 3. TABLE: rodada_negocios_b2b
-- ================================================================
CREATE TABLE public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        nome_representante TEXT NOT NULL,
        cargo TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        nome_empresa TEXT NOT NULL,
        cnpj TEXT,
        setor TEXT NOT NULL,
        porte TEXT NOT NULL,
        faturamento_anual DECIMAL(15, 2),
        numero_funcionarios INTEGER,
        descricao_empresa TEXT NOT NULL,
        produtos_servicos TEXT NOT NULL,
        site_url TEXT,
        linkedin_url TEXT,
        logo_url TEXT,
        tipo_interesse TEXT NOT NULL,
        areas_interesse TEXT NOT NULL,
        descricao_objetivos TEXT NOT NULL,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_rnb_project ON public.rodada_negocios_b2b(project_id);
-- ================================================================
-- 4. TABLE: mentores_growth_experience
-- ================================================================
CREATE TABLE public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        empresa TEXT,
        cargo TEXT,
        especialidades TEXT [] DEFAULT '{}',
        bio TEXT,
        linkedin_url TEXT,
        foto_url TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_mge_project ON public.mentores_growth_experience(project_id);
-- ================================================================
-- 5. RLS POLICIES (Public Inserts, Admin Selects)
-- ================================================================
-- Enable RLS
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
-- inscricoes_growth_experience
CREATE POLICY "Public can insert registrations" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
CREATE POLICY "Admins can see all registrations" ON public.inscricoes_growth_experience FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Users can see their own registrations" ON public.inscricoes_growth_experience FOR
SELECT USING (user_id = auth.uid());
-- startups_arena_pitch
CREATE POLICY "Public can insert startups" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
CREATE POLICY "Admins can see all startups" ON public.startups_arena_pitch FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
-- rodada_negocios_b2b
CREATE POLICY "Public can insert b2b" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
CREATE POLICY "Admins can see all b2b" ON public.rodada_negocios_b2b FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
-- mentores_growth_experience
CREATE POLICY "Public can insert mentors" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
CREATE POLICY "Admins can see all mentors" ON public.mentores_growth_experience FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
-- ================================================================
-- 6. TRIGGERS (Updated At)
-- ================================================================
CREATE TRIGGER update_ige_updated_at BEFORE
UPDATE ON public.inscricoes_growth_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sap_updated_at BEFORE
UPDATE ON public.startups_arena_pitch FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rnb_updated_at BEFORE
UPDATE ON public.rodada_negocios_b2b FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mge_updated_at BEFORE
UPDATE ON public.mentores_growth_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();