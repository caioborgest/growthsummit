-- =====================================================================
-- 20260222_fix_forms_final.sql
-- Migration FINAL e limpa para formulários do Growth Experience.
-- Sem referência a colunas que podem não existir.
-- Segura para re-execução (idempotente).
-- =====================================================================
-- 0. FIX GLOBAL TRIGGER (Resolve erro de data_atualizacao)
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$;
-- Garantir extensão uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ================================================================
-- 1. TABLE: inscricoes_growth_experience
-- ================================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    user_id UUID,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    empresa TEXT,
    tipo_inscricao TEXT,
    evento TEXT,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Adicionar project_id se já existia sem ela
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS project_id UUID;
-- Índices
CREATE INDEX IF NOT EXISTS idx_ige_email ON public.inscricoes_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_ige_status ON public.inscricoes_growth_experience(status);
CREATE INDEX IF NOT EXISTS idx_ige_project ON public.inscricoes_growth_experience(project_id);
-- ================================================================
-- 2. TABLE: startups_arena_pitch
-- ================================================================
CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    user_id UUID,
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
ALTER TABLE public.startups_arena_pitch
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_sap_email ON public.startups_arena_pitch(email);
CREATE INDEX IF NOT EXISTS idx_sap_project ON public.startups_arena_pitch(project_id);
-- ================================================================
-- 3. TABLE: rodada_negocios_b2b
-- ================================================================
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    user_id UUID,
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
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_rnb_email ON public.rodada_negocios_b2b(email);
CREATE INDEX IF NOT EXISTS idx_rnb_project ON public.rodada_negocios_b2b(project_id);
-- ================================================================
-- 4. TABLE: mentores_growth_experience
-- ================================================================
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    user_id UUID,
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
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_mge_email ON public.mentores_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_mge_status ON public.mentores_growth_experience(status);
CREATE INDEX IF NOT EXISTS idx_mge_project ON public.mentores_growth_experience(project_id);
-- ================================================================
-- 5. TABLE: mentorias_agendadas
-- ================================================================
CREATE TABLE IF NOT EXISTS public.mentorias_agendadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    mentorado_id UUID,
    mentor_id UUID,
    nome_mentorado TEXT NOT NULL,
    email_mentorado TEXT NOT NULL,
    telefone_mentorado TEXT NOT NULL,
    tema_interesse TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.mentorias_agendadas
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_ma_project ON public.mentorias_agendadas(project_id);
CREATE INDEX IF NOT EXISTS idx_ma_status ON public.mentorias_agendadas(status);
-- ================================================================
-- 6. TABLE: inscricoes_empresas_incentivadoras
-- ================================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_empresas_incentivadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    user_id UUID,
    nome_responsavel TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    quantidade_equipe INTEGER NOT NULL,
    objetivo TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_iei_project ON public.inscricoes_empresas_incentivadoras(project_id);
-- ================================================================
-- 7. TABLE: cupons_parceria_social (se não existir)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.cupons_parceria_social (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID,
    codigo TEXT UNIQUE NOT NULL,
    indicacao_nome TEXT NOT NULL,
    indicacao_tipo TEXT NOT NULL,
    porcentagem_desconto INTEGER NOT NULL DEFAULT 0,
    uso_atual INTEGER NOT NULL DEFAULT 0,
    uso_limite INTEGER,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    vencimento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.cupons_parceria_social
ADD COLUMN IF NOT EXISTS project_id UUID;
CREATE INDEX IF NOT EXISTS idx_cps_codigo ON public.cupons_parceria_social(codigo);
CREATE INDEX IF NOT EXISTS idx_cps_ativo ON public.cupons_parceria_social(ativo);
-- ================================================================
-- 8. Habilitar RLS
-- ================================================================
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;
-- ================================================================
-- 9. Políticas RLS — INSERT + SELECT abertos
-- ================================================================
-- inscricoes_growth_experience
DROP POLICY IF EXISTS "ige_insert_public" ON public.inscricoes_growth_experience;
CREATE POLICY "ige_insert_public" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ige_select_public" ON public.inscricoes_growth_experience;
CREATE POLICY "ige_select_public" ON public.inscricoes_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "ige_update_public" ON public.inscricoes_growth_experience;
CREATE POLICY "ige_update_public" ON public.inscricoes_growth_experience FOR
UPDATE USING (true);
-- startups_arena_pitch
DROP POLICY IF EXISTS "sap_insert_public" ON public.startups_arena_pitch;
CREATE POLICY "sap_insert_public" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "sap_select_public" ON public.startups_arena_pitch;
CREATE POLICY "sap_select_public" ON public.startups_arena_pitch FOR
SELECT USING (true);
DROP POLICY IF EXISTS "sap_update_public" ON public.startups_arena_pitch;
CREATE POLICY "sap_update_public" ON public.startups_arena_pitch FOR
UPDATE USING (true);
-- rodada_negocios_b2b
DROP POLICY IF EXISTS "rnb_insert_public" ON public.rodada_negocios_b2b;
CREATE POLICY "rnb_insert_public" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rnb_select_public" ON public.rodada_negocios_b2b;
CREATE POLICY "rnb_select_public" ON public.rodada_negocios_b2b FOR
SELECT USING (true);
DROP POLICY IF EXISTS "rnb_update_public" ON public.rodada_negocios_b2b;
CREATE POLICY "rnb_update_public" ON public.rodada_negocios_b2b FOR
UPDATE USING (true);
-- mentores_growth_experience
DROP POLICY IF EXISTS "mge_insert_public" ON public.mentores_growth_experience;
CREATE POLICY "mge_insert_public" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mge_select_public" ON public.mentores_growth_experience;
CREATE POLICY "mge_select_public" ON public.mentores_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "mge_update_public" ON public.mentores_growth_experience;
CREATE POLICY "mge_update_public" ON public.mentores_growth_experience FOR
UPDATE USING (true);
-- mentorias_agendadas
DROP POLICY IF EXISTS "ma_insert_public" ON public.mentorias_agendadas;
CREATE POLICY "ma_insert_public" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ma_select_public" ON public.mentorias_agendadas;
CREATE POLICY "ma_select_public" ON public.mentorias_agendadas FOR
SELECT USING (true);
DROP POLICY IF EXISTS "ma_update_public" ON public.mentorias_agendadas;
CREATE POLICY "ma_update_public" ON public.mentorias_agendadas FOR
UPDATE USING (true);
-- inscricoes_empresas_incentivadoras
DROP POLICY IF EXISTS "iei_insert_public" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "iei_insert_public" ON public.inscricoes_empresas_incentivadoras FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "iei_select_public" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "iei_select_public" ON public.inscricoes_empresas_incentivadoras FOR
SELECT USING (true);
DROP POLICY IF EXISTS "iei_update_public" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "iei_update_public" ON public.inscricoes_empresas_incentivadoras FOR
UPDATE USING (true);
-- cupons_parceria_social
DROP POLICY IF EXISTS "cps_select_public" ON public.cupons_parceria_social;
CREATE POLICY "cps_select_public" ON public.cupons_parceria_social FOR
SELECT USING (true);
DROP POLICY IF EXISTS "cps_insert_public" ON public.cupons_parceria_social;
CREATE POLICY "cps_insert_public" ON public.cupons_parceria_social FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "cps_update_public" ON public.cupons_parceria_social;
CREATE POLICY "cps_update_public" ON public.cupons_parceria_social FOR
UPDATE USING (true);
-- ================================================================
-- 10. Função RPC: incrementar uso de cupom (SECURITY DEFINER evita
--     problemas de RLS na chamada)
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN
UPDATE public.cupons_parceria_social
SET uso_atual = uso_atual + 1
WHERE codigo = coupon_code;
END;
$$;
-- ================================================================
-- 11. Garantir projeto GE Triunfo ativo
-- ================================================================
UPDATE public.projects
SET status = 'active',
    updated_at = NOW()
WHERE slug = 'ge-triunfo-2026';