-- 1. Adicionar campos de estatísticas na tabela de mentores
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_mentories INTEGER DEFAULT 5;
-- 2. Adicionar campo de tema na tabela de agendamentos
ALTER TABLE public.mentorias_agendadas
ADD COLUMN IF NOT EXISTS tema_interesse TEXT;
-- 3. Garantir que as permissões RLS estejam corretas
-- (Opcional: se o usuário estiver tendo problemas de permissão ao inserir)
DROP POLICY IF EXISTS "mentorias_public_insert" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_public_insert" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mentorias_public_read_own" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_public_read_own" ON public.mentorias_agendadas FOR
SELECT USING (
        email_mentorado = auth.jwt()->>'email'
        OR public.is_admin()
    );