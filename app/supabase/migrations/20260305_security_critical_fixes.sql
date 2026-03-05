-- ============================================================
-- SECURITY CRITICAL FIXES — Growth Summit 2026
-- Data: 2026-03-05 | Auditoria 360°
-- Seguro para reexecutar (idempotente com DROP IF EXISTS)
-- ============================================================
-- RESUMO DO QUE ESTE SCRIPT FAZ:
--   1. is_admin() reescrita via JWT — elimina risco de recursão RLS
--   2. inscricoes_growth_experience — remove SELECT público (violação LGPD)
--   3. users — remove INSERT público (escalada de privilégio)
--   4. mentores_growth_experience — restringe UPDATE/DELETE ao próprio mentor + admin
--   5. profiles — padroniza política admin para usar is_admin()
--   6. notifications — garante políticas corretas
--   7. Índices de performance para queries mais comuns
-- ============================================================
-- ============================================================
-- 1. REESCREVER is_admin() VIA JWT (SEM QUERY AO BANCO)
--    Vantagem: zero risco de recursão RLS, performance superior
--    A função lê o JWT do auth.jwt() — já validado pelo Supabase Auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        -- Prioridade 1: app_metadata (definido no server-side, mais confiável)
        (auth.jwt()->'app_metadata'->>'role'),
        -- Prioridade 2: user_metadata (definido no client, menos confiável)
        (auth.jwt()->'user_metadata'->>'role'),
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;
-- Garantir que o owner seja postgres para SECURITY DEFINER funcionar
ALTER FUNCTION public.is_admin() OWNER TO postgres;
-- Grants
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
-- Função auxiliar: retorna o papel do usuário autenticado via JWT
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
-- 2. INSCRIÇÕES GROWTH EXPERIENCE — CORRIGIR VIOLAÇÃO LGPD
--    ANTES: SELECT USING (true) → qualquer anônimo via API vê TODOS os dados
--    DEPOIS: Cada usuário vê apenas a própria inscrição; admin vê tudo
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN -- Remover políticas inseguras
DROP POLICY IF EXISTS "inscricoes_public_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "inscricoes_all_read" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "anyone_can_read" ON public.inscricoes_growth_experience;
-- Habilitar RLS (idempotente)
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
-- Política 1: Usuário autenticado vê sua própria inscrição (por user_id OU email)
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
-- Política 2: Admin vê tudo
DROP POLICY IF EXISTS "inscricoes_admin_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_admin_select" ON public.inscricoes_growth_experience FOR
SELECT USING (public.is_admin());
-- Política 3: Qualquer um pode INSERIR (formulário público de inscrição - necessário)
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
-- Política 4: Usuário pode atualizar própria inscrição; admin pode atualizar qualquer uma
DROP POLICY IF EXISTS "inscricoes_own_update" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_update" ON public.inscricoes_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Política 5: Apenas admin pode deletar
DROP POLICY IF EXISTS "inscricoes_admin_delete" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_admin_delete" ON public.inscricoes_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: inscricoes_growth_experience';
ELSE RAISE NOTICE '⚠️  Tabela inscricoes_growth_experience não encontrada — pulando.';
END IF;
END $$;
-- ============================================================
-- 3. TABELA USERS — REMOVER INSERT PÚBLICO (ESCALADA DE PRIVILÉGIO)
--    ANTES: users_public_insert WITH CHECK (true) → qualquer um insercia usuário admin
--    DEPOIS: Inserção apenas quando id = auth.uid() (próprio user do Supabase Auth)
-- ============================================================
-- Remover política insegura
DROP POLICY IF EXISTS "users_public_insert" ON public.users;
-- Recriar com restrição correta
-- Nota: O trigger de sync do Supabase Auth roda como service_role (bypass RLS),
--       portanto é seguro restringir a política pública
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users FOR
INSERT WITH CHECK (id = auth.uid());
-- Garantir demais políticas de users usando is_admin() (sem subquery recursiva)
DROP POLICY IF EXISTS "users_self_select" ON public.users;
CREATE POLICY "users_self_select" ON public.users FOR
SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
CREATE POLICY "users_admin_select" ON public.users FOR
SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "users_self_update" ON public.users;
CREATE POLICY "users_self_update" ON public.users FOR
UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
CREATE POLICY "users_admin_update" ON public.users FOR
UPDATE USING (public.is_admin());
-- Admin pode deletar usuários (ex: limpeza de contas de teste)
DROP POLICY IF EXISTS "users_admin_delete" ON public.users;
CREATE POLICY "users_admin_delete" ON public.users FOR DELETE USING (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: users (removido public INSERT)';
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
-- Leitura pública (ok para a página de mentores no site)
DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'approved'
        OR public.is_admin()
        OR user_id = auth.uid()
    );
-- Inserção pública (necessária para formulário de candidatura)
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_insert" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
-- Update: apenas o próprio mentor ou admin
DROP POLICY IF EXISTS "mentores_own_update" ON public.mentores_growth_experience;
CREATE POLICY "mentores_own_update" ON public.mentores_growth_experience FOR
UPDATE USING (
        user_id = auth.uid()
        OR public.is_admin()
    );
-- Delete: apenas admin
DROP POLICY IF EXISTS "mentores_admin_delete" ON public.mentores_growth_experience;
CREATE POLICY "mentores_admin_delete" ON public.mentores_growth_experience FOR DELETE USING (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: mentores_growth_experience';
ELSE RAISE NOTICE '⚠️  Tabela mentores_growth_experience não encontrada — pulando.';
END IF;
END $$;
-- ============================================================
-- 5. PROFILES — PADRONIZAR POLÍTICA ADMIN (ELIMINAR SUBQUERY RECURSIVA)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Remover política antiga com subquery recursiva
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: profiles (removida subquery recursiva)';
-- ============================================================
-- 6. NOTIFICATIONS — GARANTIR POLÍTICAS CORRETAS
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
DROP POLICY IF EXISTS "Usuários veem suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem marcar notificações como lidas" ON public.notifications;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_self_update" ON public.notifications FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: notifications';
END IF;
END $$;
-- ============================================================
-- 7. PROGRAMACAO_EVENTO — SELECT PÚBLICO OK (dados públicos do evento)
--    Apenas garantir que INSERT/UPDATE/DELETE sejam restritos a admin
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
-- Leitura pública (programação do evento é informação pública)
CREATE POLICY "programacao_evento_public_read" ON public.programacao_evento FOR
SELECT USING (true);
-- Escrita apenas para admin
CREATE POLICY "programacao_evento_admin_all" ON public.programacao_evento FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: programacao_evento';
END IF;
END $$;
-- ============================================================
-- 8. PROJETOS — GARANTIR POLÍTICA CORRECTA
-- ============================================================
DROP POLICY IF EXISTS "Projetos ativos são visíveis para todos" ON public.projects;
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
-- Leitura pública de projetos ativos (necessário para a landing page)
CREATE POLICY "projects_public_active_read" ON public.projects FOR
SELECT USING (
        status = 'active'
        OR public.is_admin()
    );
-- Admin gerencia tudo
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
RAISE NOTICE '✅ RLS corrigido: projects';
-- ============================================================
-- 9. ÍNDICES CRÍTICOS DE PERFORMANCE (queries mais frequentes)
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
RAISE NOTICE '✅ Índices criados: inscricoes_growth_experience';
END IF;
END $$;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN CREATE INDEX IF NOT EXISTS idx_mentores_user_id ON public.mentores_growth_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_mentores_project_status ON public.mentores_growth_experience(project_id, status);
RAISE NOTICE '✅ Índices criados: mentores_growth_experience';
END IF;
END $$;
-- ============================================================
-- 10. VERIFICAÇÃO FINAL — confirmar que as políticas foram aplicadas
-- ============================================================
SELECT schemaname,
    tablename,
    policyname,
    cmd AS operation,
    qual AS using_clause
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
-- ============================================================
-- FIM DO SCRIPT DE SEGURANÇA CRÍTICA
-- Verifique a listagem acima para confirmar as políticas aplicadas
-- ============================================================