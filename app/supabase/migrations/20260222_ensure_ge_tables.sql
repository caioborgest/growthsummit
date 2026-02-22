-- =====================================================================
-- 20260222_ensure_ge_tables.sql
-- Garante a existência de todas as tabelas específicas do
-- Growth Experience Triunfo-PE 2026 com estrutura completa.
-- Idempotente — usa CREATE TABLE IF NOT EXISTS e ADD COLUMN IF NOT EXISTS.
-- =====================================================================
-- ================================================================
-- 1. TABLE: inscricoes_growth_experience
-- ================================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        empresa TEXT,
        tipo_inscricao TEXT,
        evento TEXT,
        cursos_selecionados TEXT [] DEFAULT '{}',
        palestras_noturnas BOOLEAN DEFAULT FALSE,
        valor_pago DECIMAL(10, 2) DEFAULT 0,
        status_pagamento TEXT DEFAULT 'pago' CHECK (
            status_pagamento IN ('pago', 'pendente', 'cancelado')
        ),
        status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'cancelado', 'ausente')),
        app_instalado BOOLEAN DEFAULT FALSE,
        indicacao_tipo TEXT CHECK (
            indicacao_tipo IN (
                'prefeitura',
                'politico',
                'empresa',
                'promocional',
                'influenciador',
                'associacao',
                'instituicao',
                'outro',
                'nenhum'
            )
        ),
        indicacao_nome TEXT,
        codigo_social TEXT,
        codigo_palestra TEXT,
        cupom_palestra TEXT,
        valor_desconto_social DECIMAL(10, 2) DEFAULT 0,
        valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_inscricoes_ge_email ON public.inscricoes_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_ge_status ON public.inscricoes_growth_experience(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_ge_project_id ON public.inscricoes_growth_experience(project_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_ge_user_id ON public.inscricoes_growth_experience(user_id);
-- ================================================================
-- 2. TABLE: startups_arena_pitch
-- ================================================================
CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- Fundador
        nome_fundador TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        -- Startup
        nome_startup TEXT NOT NULL,
        segmento TEXT NOT NULL,
        estagio TEXT NOT NULL,
        descricao TEXT NOT NULL,
        problema TEXT,
        solucao TEXT,
        modelo_negocio TEXT,
        diferenciais TEXT,
        -- Links
        site_url TEXT,
        linkedin_url TEXT,
        pitch_deck_url TEXT,
        video_pitch_url TEXT,
        -- Controle
        status TEXT DEFAULT 'pendente' CHECK (
            status IN (
                'pendente',
                'aprovada',
                'rejeitada',
                'confirmada'
            )
        ),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_startups_ap_email ON public.startups_arena_pitch(email);
CREATE INDEX IF NOT EXISTS idx_startups_ap_status ON public.startups_arena_pitch(status);
CREATE INDEX IF NOT EXISTS idx_startups_ap_project_id ON public.startups_arena_pitch(project_id);
-- ================================================================
-- 3. TABLE: rodada_negocios_b2b
-- ================================================================
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        -- Representante
        nome_representante TEXT NOT NULL,
        cargo TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        -- Empresa
        nome_empresa TEXT NOT NULL,
        cnpj TEXT,
        setor TEXT NOT NULL,
        porte TEXT NOT NULL,
        faturamento_anual DECIMAL(15, 2),
        numero_funcionarios INTEGER,
        -- Sobre
        descricao_empresa TEXT NOT NULL,
        produtos_servicos TEXT NOT NULL,
        site_url TEXT,
        linkedin_url TEXT,
        logo_url TEXT,
        -- Objetivos
        tipo_interesse TEXT NOT NULL,
        areas_interesse TEXT NOT NULL,
        descricao_objetivos TEXT NOT NULL,
        -- Controle
        status TEXT DEFAULT 'pendente' CHECK (
            status IN (
                'pendente',
                'aprovado',
                'rejeitado',
                'confirmado'
            )
        ),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rodada_b2b_email ON public.rodada_negocios_b2b(email);
CREATE INDEX IF NOT EXISTS idx_rodada_b2b_status ON public.rodada_negocios_b2b(status);
CREATE INDEX IF NOT EXISTS idx_rodada_b2b_project_id ON public.rodada_negocios_b2b(project_id);
-- ================================================================
-- 4. TABLE: mentores_growth_experience
-- ================================================================
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE
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
        status TEXT DEFAULT 'pendente' CHECK (
            status IN ('pendente', 'aprovado', 'rejeitado', 'inativo')
        ),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentores_ge_email ON public.mentores_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_mentores_ge_status ON public.mentores_growth_experience(status);
CREATE INDEX IF NOT EXISTS idx_mentores_ge_project_id ON public.mentores_growth_experience(project_id);
-- ================================================================
-- 5. TABLE: mentorias_agendadas
-- ================================================================
CREATE TABLE IF NOT EXISTS public.mentorias_agendadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    mentorado_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        mentor_id UUID REFERENCES public.mentores_growth_experience(id) ON DELETE
    SET NULL,
        nome_mentorado TEXT NOT NULL,
        email_mentorado TEXT NOT NULL,
        telefone_mentorado TEXT NOT NULL,
        tema_interesse TEXT NOT NULL,
        status TEXT DEFAULT 'pendente' CHECK (
            status IN (
                'pendente',
                'confirmado',
                'realizado',
                'cancelado'
            )
        ),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentorias_agendadas_project_id ON public.mentorias_agendadas(project_id);
CREATE INDEX IF NOT EXISTS idx_mentorias_agendadas_mentor_id ON public.mentorias_agendadas(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorias_agendadas_status ON public.mentorias_agendadas(status);
-- ================================================================
-- 6. TABLE: inscricoes_empresas_incentivadoras
-- ================================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_empresas_incentivadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_responsavel TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    quantidade_equipe INTEGER NOT NULL,
    objetivo TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_empresas_incentivadoras_project_id ON public.inscricoes_empresas_incentivadoras(project_id);
-- ================================================================
-- 7. Habilitar RLS em todas as tabelas
-- ================================================================
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;
-- ================================================================
-- 8. Políticas RLS — INSERT aberto para todos (público)
-- ================================================================
-- inscricoes_growth_experience
DROP POLICY IF EXISTS "Inscrição pública growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Inscrição pública growth experience" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura própria growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Leitura própria growth experience" ON public.inscricoes_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Atualização growth experience" ON public.inscricoes_growth_experience FOR
UPDATE USING (true);
-- startups_arena_pitch
DROP POLICY IF EXISTS "Qualquer um pode inscrever startup" ON public.startups_arena_pitch;
CREATE POLICY "Qualquer um pode inscrever startup" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública startups" ON public.startups_arena_pitch;
CREATE POLICY "Leitura pública startups" ON public.startups_arena_pitch FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização startups" ON public.startups_arena_pitch;
CREATE POLICY "Atualização startups" ON public.startups_arena_pitch FOR
UPDATE USING (true);
-- rodada_negocios_b2b
DROP POLICY IF EXISTS "Qualquer um pode inscrever empresa B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Qualquer um pode inscrever empresa B2B" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública rodada B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Leitura pública rodada B2B" ON public.rodada_negocios_b2b FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização rodada B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Atualização rodada B2B" ON public.rodada_negocios_b2b FOR
UPDATE USING (true);
-- mentores_growth_experience
DROP POLICY IF EXISTS "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience;
CREATE POLICY "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Usuários podem ver perfis de mentor" ON public.mentores_growth_experience;
CREATE POLICY "Usuários podem ver perfis de mentor" ON public.mentores_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização mentores" ON public.mentores_growth_experience;
CREATE POLICY "Atualização mentores" ON public.mentores_growth_experience FOR
UPDATE USING (true);
-- mentorias_agendadas
DROP POLICY IF EXISTS "Qualquer um pode agendar mentoria" ON public.mentorias_agendadas;
CREATE POLICY "Qualquer um pode agendar mentoria" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública mentorias" ON public.mentorias_agendadas;
CREATE POLICY "Leitura pública mentorias" ON public.mentorias_agendadas FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização mentorias" ON public.mentorias_agendadas;
CREATE POLICY "Atualização mentorias" ON public.mentorias_agendadas FOR
UPDATE USING (true);
-- inscricoes_empresas_incentivadoras
DROP POLICY IF EXISTS "Qualquer um pode inscrever sua empresa" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Qualquer um pode inscrever sua empresa" ON public.inscricoes_empresas_incentivadoras FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública de inscrições de empresas" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Leitura pública de inscrições de empresas" ON public.inscricoes_empresas_incentivadoras FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização inscrições empresas" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Atualização inscrições empresas" ON public.inscricoes_empresas_incentivadoras FOR
UPDATE USING (true);
-- ================================================================
-- 9. Função RPC: incrementar uso de cupom
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
UPDATE public.cupons_parceria_social
SET uso_atual = uso_atual + 1
WHERE codigo = coupon_code;
END;
$$;
-- ================================================================
-- 10. Garantir que o projeto GE Triunfo está ativo
-- ================================================================
UPDATE public.projects
SET status = 'active',
    updated_at = NOW()
WHERE slug = 'ge-triunfo-2026';