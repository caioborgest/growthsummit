-- ============================================================
-- SECURITY CRITICAL FIXES — Growth Summit 2026
-- Data: 2026-03-05 | Auditoria 360°
-- Seguro para reexecutar (idempotente com DROP IF EXISTS)
-- ============================================================
-- RESUMO:
--   1. is_admin() reescrita via JWT (sem query ao banco = sem recursão)
--   2. inscricoes_growth_experience — remove SELECT público (violação LGPD)
--   3. users — remove INSERT público (escalada de privilégio)
--   4. mentores_growth_experience — restringe UPDATE/DELETE ao próprio mentor + admin
--   5. profiles — padroniza política admin para usar is_admin()
--   6. notifications — garante políticas corretas
--   7. programacao_evento — restringe escrita a admin
--   8. projects — garante leitura pública apenas de projetos ativos
--   9. Índices de performance para queries mais comuns
-- ============================================================
-- ============================================================
-- 1. REESCREVER is_admin() VIA JWT (SEM QUERY AO BANCO)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;
ALTER FUNCTION public.is_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
-- Função auxiliar: retorna o papel do usuário via JWT
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        'visitor'
    );
$$;
ALTER FUNCTION public.current_user_role() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO service_role;
-- ============================================================
-- 2. inscricoes_growth_experience — CORRIGIR VIOLAÇÃO LGPD
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscricoes_public_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_all_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "anyone_can_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_admin_select" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_own_update" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_admin_delete" ON public.inscricoes_growth_experience;
-- Usuário autenticado vê apenas a própria inscrição (por user_id OU email)
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
-- Admin vê todas
CREATE POLICY "inscricoes_admin_select" ON public.inscricoes_growth_experience FOR
SELECT USING (public.is_admin());
-- Qualquer um pode inserir (formulário público de inscrição)
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
-- Usuário ou admin pode atualizar
CREATE POLICY "inscricoes_own_update" ON public.inscricoes_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Apenas admin pode deletar
CREATE POLICY "inscricoes_admin_delete" ON public.inscricoes_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em inscricoes_growth_experience';
ELSE RAISE NOTICE 'AVISO: Tabela inscricoes_growth_experience nao encontrada';
END IF;
END $$;
-- ============================================================
-- 3. TABELA USERS — REMOVER INSERT PÚBLICO (ESCALADA DE PRIVILÉGIO)
-- ============================================================
DROP POLICY IF EXISTS "users_public_insert" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_delete" ON public.users;
-- INSERT apenas com id = auth.uid() (o trigger de sync do Supabase usa service_role, que bypass RLS)
CREATE POLICY "users_insert_own" ON public.users FOR
INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_self_select" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "users_admin_select" ON public.users FOR
SELECT USING (public.is_admin());
CREATE POLICY "users_self_update" ON public.users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "users_admin_update" ON public.users FOR
UPDATE USING (public.is_admin());
CREATE POLICY "users_admin_delete" ON public.users FOR DELETE USING (public.is_admin());
-- ============================================================
-- 4. MENTORES — RESTRINGIR EDIÇÃO AO PRÓPRIO MENTOR + ADMIN
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_own_update" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_admin_delete" ON public.mentores_growth_experience;
-- Leitura: aprovados são públicos; mentor vê o próprio mesmo pendente; admin vê tudo
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'approved'
        OR public.is_admin()
        OR user_id = auth.uid()
    );
-- Inserção pública (formulário de candidatura)
CREATE POLICY "mentores_public_insert" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
-- Update: próprio mentor ou admin
CREATE POLICY "mentores_own_update" ON public.mentores_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Delete: apenas admin
CREATE POLICY "mentores_admin_delete" ON public.mentores_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em mentores_growth_experience';
ELSE RAISE NOTICE 'AVISO: Tabela mentores_growth_experience nao encontrada';
END IF;
END $$;
-- ============================================================
-- 5. PROFILES — ELIMINAR SUBQUERY RECURSIVA NA POLÍTICA ADMIN
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());
-- ============================================================
-- 6. NOTIFICATIONS — POLÍTICAS CORRETAS
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'notifications'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Usuarios veem suas proprias notificacoes" ON public.notifications;
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem marcar notificações como lidas" ON public.notifications;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_self_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_self_update" ON public.notifications FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em notifications';
ELSE RAISE NOTICE 'AVISO: Tabela notifications nao encontrada';
END IF;
END $$;
-- ============================================================
-- 7. PROGRAMACAO_EVENTO — RESTRINGIR ESCRITA A ADMIN
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'programacao_evento'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.programacao_evento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programacao_evento_public_read" ON public.programacao_evento;
DROP POLICY IF EXISTS "programacao_evento_admin_all" ON public.programacao_evento;
CREATE POLICY "programacao_evento_public_read" ON public.programacao_evento FOR
SELECT USING (true);
CREATE POLICY "programacao_evento_admin_all" ON public.programacao_evento FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
RAISE NOTICE 'OK: RLS corrigido em programacao_evento';
ELSE RAISE NOTICE 'AVISO: Tabela programacao_evento nao encontrada';
END IF;
END $$;
-- ============================================================
-- 8. PROJECTS — LEITURA PÚBLICA APENAS DE PROJETOS ATIVOS
-- ============================================================
DROP POLICY IF EXISTS "Projetos ativos sao visiveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Projetos ativos são visíveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
DROP POLICY IF EXISTS "projects_public_active_read" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
CREATE POLICY "projects_public_active_read" ON public.projects FOR
SELECT USING (
        status = 'active'
        OR public.is_admin()
    );
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
-- ============================================================
-- 9. ÍNDICES DE PERFORMANCE (queries mais frequentes)
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN CREATE INDEX IF NOT EXISTS idx_inscricoes_user_id ON public.inscricoes_growth_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON public.inscricoes_growth_experience(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_project_status ON public.inscricoes_growth_experience(project_id, status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created_at ON public.inscricoes_growth_experience(created_at DESC);
RAISE NOTICE 'OK: Indices criados em inscricoes_growth_experience';
END IF;
END $$;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN CREATE INDEX IF NOT EXISTS idx_mentores_user_id ON public.mentores_growth_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_mentores_project_status ON public.mentores_growth_experience(project_id, status);
RAISE NOTICE 'OK: Indices criados em mentores_growth_experience';
END IF;
END $$;
-- ============================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================
SELECT tablename,
    policyname,
    cmd AS operation
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'users',
        'profiles',
        'projects',
        'notifications',
        'inscricoes_growth_experience',
        'mentores_growth_experience',
        'programacao_evento'
    )
ORDER BY tablename,
    cmd,
    policyname;
-- FIM DO SCRIPT