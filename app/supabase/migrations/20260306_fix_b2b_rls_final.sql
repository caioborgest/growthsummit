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