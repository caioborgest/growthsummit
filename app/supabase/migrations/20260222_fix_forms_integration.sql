-- =====================================================================
-- 20260222_fix_forms_integration.sql
-- Corrige a integração de todos os formulários de inscrição do
-- Growth Experience Triunfo-PE 2026 com o Supabase.
-- =====================================================================
-- 1. Adicionar project_id à tabela de empresas incentivadoras (estava faltando)
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_empresas_incentivadoras_project_id ON public.inscricoes_empresas_incentivadoras(project_id);
-- 2. Garantir RLS habilitado em todas as tabelas de inscrição
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;
-- 3. ================================================================
--    inscricoes_growth_experience — políticas completas
-- ================================================================
DROP POLICY IF EXISTS "Inscrição pública growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Inscrição pública growth experience" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura própria growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Leitura própria growth experience" ON public.inscricoes_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização growth experience" ON public.inscricoes_growth_experience;
CREATE POLICY "Atualização growth experience" ON public.inscricoes_growth_experience FOR
UPDATE USING (true);
-- 4. ================================================================
--    inscricoes_empresas_incentivadoras — políticas
-- ================================================================
DROP POLICY IF EXISTS "Qualquer um pode inscrever sua empresa" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Qualquer um pode inscrever sua empresa" ON public.inscricoes_empresas_incentivadoras FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública de inscrições de empresas" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Leitura pública de inscrições de empresas" ON public.inscricoes_empresas_incentivadoras FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização inscrições empresas" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "Atualização inscrições empresas" ON public.inscricoes_empresas_incentivadoras FOR
UPDATE USING (true);
-- 5. ================================================================
--    startups_arena_pitch — políticas
-- ================================================================
DROP POLICY IF EXISTS "Qualquer um pode inscrever startup" ON public.startups_arena_pitch;
CREATE POLICY "Qualquer um pode inscrever startup" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública startups" ON public.startups_arena_pitch;
CREATE POLICY "Leitura pública startups" ON public.startups_arena_pitch FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização startups" ON public.startups_arena_pitch;
CREATE POLICY "Atualização startups" ON public.startups_arena_pitch FOR
UPDATE USING (true);
-- 6. ================================================================
--    rodada_negocios_b2b — políticas
-- ================================================================
DROP POLICY IF EXISTS "Qualquer um pode inscrever empresa B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Qualquer um pode inscrever empresa B2B" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública rodada B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Leitura pública rodada B2B" ON public.rodada_negocios_b2b FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização rodada B2B" ON public.rodada_negocios_b2b;
CREATE POLICY "Atualização rodada B2B" ON public.rodada_negocios_b2b FOR
UPDATE USING (true);
-- 7. ================================================================
--    mentorias_agendadas — políticas
-- ================================================================
DROP POLICY IF EXISTS "Qualquer um pode agendar mentoria" ON public.mentorias_agendadas;
CREATE POLICY "Qualquer um pode agendar mentoria" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Leitura pública mentorias" ON public.mentorias_agendadas;
CREATE POLICY "Leitura pública mentorias" ON public.mentorias_agendadas FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização mentorias" ON public.mentorias_agendadas;
CREATE POLICY "Atualização mentorias" ON public.mentorias_agendadas FOR
UPDATE USING (true);
-- 8. ================================================================
--    mentores_growth_experience — políticas
-- ================================================================
DROP POLICY IF EXISTS "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience;
CREATE POLICY "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil de mentor" ON public.mentores_growth_experience;
CREATE POLICY "Usuários podem ver perfis de mentor" ON public.mentores_growth_experience FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Atualização mentores" ON public.mentores_growth_experience;
CREATE POLICY "Atualização mentores" ON public.mentores_growth_experience FOR
UPDATE USING (true);
-- 9. ================================================================
--    cupons_parceria_social — políticas (já existentes, reforçando)
-- ================================================================
DROP POLICY IF EXISTS "Leitura pública de cupons" ON public.cupons_parceria_social;
CREATE POLICY "Leitura pública de cupons" ON public.cupons_parceria_social FOR
SELECT USING (true);
DROP POLICY IF EXISTS "Inserção de cupons" ON public.cupons_parceria_social;
CREATE POLICY "Inserção de cupons" ON public.cupons_parceria_social FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Atualização de cupons" ON public.cupons_parceria_social;
CREATE POLICY "Atualização de cupons" ON public.cupons_parceria_social FOR
UPDATE USING (true);
-- 10. Criar função RPC para incrementar uso do cupom (se não existir)
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
UPDATE public.cupons_parceria_social
SET uso_atual = uso_atual + 1
WHERE codigo = coupon_code;
END;
$$;
-- 11. Garantir que o projeto GE Triunfo está ativo e visível
UPDATE public.projects
SET status = 'active',
    updated_at = NOW()
WHERE slug = 'ge-triunfo-2026';
-- 12. Verificação final: checar tabelas criadas
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'inscricoes_growth_experience',
        'inscricoes_empresas_incentivadoras',
        'startups_arena_pitch',
        'rodada_negocios_b2b',
        'mentorias_agendadas',
        'mentores_growth_experience',
        'cupons_parceria_social'
    )
ORDER BY tablename;