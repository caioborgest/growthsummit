-- Corrigindo recursão infinita nas políticas de RLS
-- O problema ocorre quando uma política na tabela X consulta a própria tabela X ou uma tabela Y que por sua vez consulta a tabela X.
-- 1. Corrigir políticas da tabela public.users
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR
SELECT USING (
        (
            SELECT role
            FROM public.users
            WHERE id = auth.uid()
        ) = 'admin' -- Nota: No Supabase, subqueries em USING são executadas com os privilégios do usuário, mas o Postgres otimiza melhor se usarmos funções security definer ou se evitarmos a recursão direta. 
    );
-- Na verdade, a melhor forma de evitar a recursão em 'users' é usar a role do JWT se disponível, ou uma função:
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECURITY DEFINER ignora o RLS da tabela users
-- Agora usamos a função nas políticas
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR
SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
CREATE POLICY "Admins podem gerenciar projetos" ON public.projects FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "Admins veem todas as inscrições" ON public.registrations;
CREATE POLICY "Admins veem todas as inscrições" ON public.registrations FOR
SELECT USING (public.is_admin());
-- Adicionar permissão para inserção pública na tabela de usuários (necessário para SignUp)
-- Ou garantir que o trigger handle_new_user funcione corretamente se existir.
-- Atualmente o código faz upsert manual.
DROP POLICY IF EXISTS "Qualquer um pode criar seu perfil" ON public.users;
CREATE POLICY "Qualquer um pode criar seu perfil" ON public.users FOR
INSERT WITH CHECK (true);
-- Permite que o auth.signUp() ou o código insira o registro inicial
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.users FOR
UPDATE USING (auth.uid() = id);
-- 2. Garantir que event_schedule tenha políticas de leitura pública
-- Se a tabela event_schedule existir, ela precisa de RLS liberado para leitura
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE tablename = 'event_schedule'
) THEN
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de programação" ON public.event_schedule;
CREATE POLICY "Leitura pública de programação" ON public.event_schedule FOR
SELECT USING (true);
END IF;
IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE tablename = 'mentores_growth_experience'
) THEN
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Candidatura pública de mentores" ON public.mentores_growth_experience;
CREATE POLICY "Candidatura pública de mentores" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Visualização pública de mentores aprovados" ON public.mentores_growth_experience;
CREATE POLICY "Visualização pública de mentores aprovados" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'aprovado'
        OR user_id = auth.uid()
        OR public.is_admin()
    );
END IF;
IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE tablename = 'inscricoes_growth_experience'
) THEN
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inscrição pública" ON public.inscricoes_growth_experience;
CREATE POLICY "Inscrição pública" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Usuário vê suas inscrições" ON public.inscricoes_growth_experience;
CREATE POLICY "Usuário vê suas inscrições" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
DROP POLICY IF EXISTS "Usuário atualiza sua inscrição" ON public.inscricoes_growth_experience;
CREATE POLICY "Usuário atualiza sua inscrição" ON public.inscricoes_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
END IF;
END $$;