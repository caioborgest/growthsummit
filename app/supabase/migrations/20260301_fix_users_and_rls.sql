-- ============================================================
-- MIGRATION: FIX USERS TABLE & RLS RECURSION
-- Date: 2026-03-01
-- ============================================================
-- 1. GARANTIR COLUNAS NA TABELA USERS
-- Adicionando colunas que estão causando erro 400 (Bad Request)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS staff_role TEXT,
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
-- 2. CORREÇÃO DEFINITIVA DE RECURSÃO RLS NA TABELA USERS
-- O problema ocorre quando a política de SELECT em 'users' chama uma função que faz SELECT em 'users'
-- Mesmo sendo SECURITY DEFINER, se não for executada pelo dono da tabela, pode causar loop.
-- Primeiro, remover políticas antigas problemáticas
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Users can see own record" ON public.users;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user roles" ON public.users;
DROP POLICY IF EXISTS "Individual User Data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
-- Novas políticas
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_admin_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;
DROP POLICY IF EXISTS "users_public_insert" ON public.users;
-- A. Política para o próprio usuário (SIMPLES E SEGURA)
CREATE POLICY "users_self_select" ON public.users FOR
SELECT USING (auth.uid() = id);
-- B. Função de verificação de admin extremamente robusta
-- Usamos SECURITY DEFINER para rodar com privilégios de superuser e ignorar RLS interno
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_role TEXT;
BEGIN -- Se não houver UID, retorna falso imediatamente
IF auth.uid() IS NULL THEN RETURN FALSE;
END IF;
-- Buscar a role diretamente da tabela users
-- Por ser SECURITY DEFINER e ter o OWNER correto, este SELECT ignora as políticas RLS de users
SELECT role INTO v_role
FROM public.users
WHERE id = auth.uid();
RETURN COALESCE(v_role, '') IN ('admin', 'staff');
EXCEPTION
WHEN OTHERS THEN RETURN FALSE;
END;
$$;
-- C. Garantir que a função pertence ao postgres (CRITICAL para bypass de RLS)
ALTER FUNCTION public.is_admin() OWNER TO postgres;
-- D. Política para Admins (Usando a função corrigida)
CREATE POLICY "users_admin_select" ON public.users FOR
SELECT USING (public.is_admin());
CREATE POLICY "users_self_update" ON public.users FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "users_admin_update" ON public.users FOR
UPDATE USING (public.is_admin());
-- 3. ACESSO PÚBLICO SOLICITADO
-- O usuário solicitou acesso de leitura pública nestas tabelas
-- A. programacao / programacao_evento
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'programacao'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.programacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programacao_public_read" ON public.programacao;
CREATE POLICY "programacao_public_read" ON public.programacao FOR
SELECT USING (true);
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'programacao_evento'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.programacao_evento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programacao_evento_public_read" ON public.programacao_evento;
CREATE POLICY "programacao_evento_public_read" ON public.programacao_evento FOR
SELECT USING (true);
END IF;
END $$;
-- B. mentores_growth_experience
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (true);
-- Permitir inserção pública (conforme solicitado)
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_insert" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
END IF;
END $$;
-- C. inscricoes_growth_experience
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
-- O usuário pediu leitura pública, mas geralmente isso é apenas para a própria inscrição.
-- Se o pedido for realmente PÚBLICO (anonimizado ou geral), usamos true.
-- Para segurança, permitiremos leitura por email/id se necessário, mas aqui faremos como pedido.
DROP POLICY IF EXISTS "inscricoes_public_read" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_public_read" ON public.inscricoes_growth_experience FOR
SELECT USING (true);
-- Permitir inserção pública (essencial para cadastro sem login)
DROP POLICY IF EXISTS "inscricoes_public_insert" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_public_insert" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
END IF;
END $$;
-- D. Permitir inserção pública em users (para novos cadastros)
DROP POLICY IF EXISTS "users_public_insert" ON public.users;
CREATE POLICY "users_public_insert" ON public.users FOR
INSERT WITH CHECK (true);
-- 4. PERMISSÕES DE EXECUÇÃO
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;