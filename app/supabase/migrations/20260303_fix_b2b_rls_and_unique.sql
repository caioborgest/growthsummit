-- ============================================================
-- MIGRATION: FIX B2B, STARTUP, MENTOR AND COMPANY UPSERT (UNIQUE + RLS)
-- Date: 2026-03-03
-- ============================================================
-- 1. ADICIONAR CONSTRAINTS UNIQUE (Obrigatório para UPSERT on_conflict)
ALTER TABLE public.rodada_negocios_b2b DROP CONSTRAINT IF EXISTS rodada_negocios_b2b_email_key;
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT rodada_negocios_b2b_email_key UNIQUE (email);
ALTER TABLE public.startups_arena_pitch DROP CONSTRAINT IF EXISTS startups_arena_pitch_email_key;
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_arena_pitch_email_key UNIQUE (email);
ALTER TABLE public.mentores_growth_experience DROP CONSTRAINT IF EXISTS mentores_growth_experience_email_key;
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_growth_experience_email_key UNIQUE (email);
-- EMPRESA INCENTIVADORA
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.inscricoes_empresas_incentivadoras DROP CONSTRAINT IF EXISTS inscricoes_empresas_incentivadoras_email_key;
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD CONSTRAINT inscricoes_empresas_incentivadoras_email_key UNIQUE (email);
-- 2. GARANTIR PERMISSÕES DE TABELA
GRANT ALL ON public.rodada_negocios_b2b TO anon,
    authenticated,
    service_role;
GRANT ALL ON public.startups_arena_pitch TO anon,
    authenticated,
    service_role;
GRANT ALL ON public.mentores_growth_experience TO anon,
    authenticated,
    service_role;
GRANT ALL ON public.inscricoes_empresas_incentivadoras TO anon,
    authenticated,
    service_role;
-- 3. POLÍTICAS RLS ROBUSTAS (INSERT + UPDATE)
-- RODADA NEGOCIOS B2B
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_insert_policy" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_manage_policy" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_insert_policy" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
CREATE POLICY "b2b_manage_policy" ON public.rodada_negocios_b2b FOR ALL USING (
    email = (auth.jwt()->>'email')
    OR user_id = auth.uid()
    OR public.is_admin()
);
-- STARTUPS
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "startups_insert_policy" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_manage_policy" ON public.startups_arena_pitch;
CREATE POLICY "startups_insert_policy" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
CREATE POLICY "startups_manage_policy" ON public.startups_arena_pitch FOR ALL USING (
    email = (auth.jwt()->>'email')
    OR user_id = auth.uid()
    OR public.is_admin()
);
-- MENTORES
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_insert_policy" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_manage_policy" ON public.mentores_growth_experience;
CREATE POLICY "mentores_insert_policy" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
CREATE POLICY "mentores_manage_policy" ON public.mentores_growth_experience FOR ALL USING (
    email = (auth.jwt()->>'email')
    OR user_id = auth.uid()
    OR public.is_admin()
);
-- EMPRESA INCENTIVADORA
ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "iei_insert_public" ON public.inscricoes_empresas_incentivadoras;
DROP POLICY IF EXISTS "iei_manage_policy" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "iei_insert_public" ON public.inscricoes_empresas_incentivadoras FOR
INSERT WITH CHECK (true);
CREATE POLICY "iei_manage_policy" ON public.inscricoes_empresas_incentivadoras FOR ALL USING (
    email = (auth.jwt()->>'email')
    OR public.is_admin()
);