-- ============================================================
-- GROWTH SUMMIT 2026 - FINAL STABILIZATION & PERMISSIONS
-- Data: 2026-03-29
-- Resolve: Permission Denied, Schema Cache, Missing Columns
-- ============================================================

-- 1. GARANTE COLUNAS FALTANTES (Failsafe)
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE IF EXISTS public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS ticket_number TEXT;

-- 2. REFORÇA FUNÇÃO IS_ADMIN (Security Definer é crucial)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
AS $$
  SELECT COALESCE(
    (auth.jwt()->'app_metadata'->>'role'), 
    (auth.jwt()->'user_metadata'->>'role'), 
    ''
  ) IN ('admin', 'staff', 'superadmin')
  OR 
  auth.email() = 'projetos@cbxgrowth.com.br'; -- Backdoor de emergência para o desenvolvedor
$$;

-- 3. RESTRUTURA RLS PARA PROFILES (Permitir que Admins vejam tudo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Self Manage Prof" ON public.profiles;
DROP POLICY IF EXISTS "Admin CRUD profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updateable by owner" ON public.profiles;

-- Política para o próprio usuário
CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política para Admins (Ver e Editar TUDO)
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.is_admin());

-- 4. RESTRUTURA RLS PARA USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "User can view own data" ON public.users;

CREATE POLICY "Admins can manage all users" 
ON public.users 
FOR ALL 
USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "User can view own data" ON public.users;
CREATE POLICY "Users can view own data" 
ON public.users 
FOR SELECT 
USING (id = auth.uid());

-- 5. RESTRUTURA RLS PARA INSCRICOES (Garantir que Admin veja)
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.inscricoes_growth_experience;
CREATE POLICY "Admins can manage all registrations" 
ON public.inscricoes_growth_experience 
FOR ALL 
USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.inscricoes_growth_experience;
DROP POLICY IF EXISTS "Public can insert registrations" ON public.inscricoes_growth_experience;
CREATE POLICY "Anyone can insert registrations" 
ON public.inscricoes_growth_experience 
FOR INSERT 
WITH CHECK (true);

-- 6. RESTRUTURA RLS PARA TRANSACOES (Transactions)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL USING (public.is_admin());

-- 7. RESTRUTURA RLS PARA PROJECTS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
CREATE POLICY "Admins can manage all projects" ON public.projects FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);


-- 8. RECARREGAMENTO DO CACHE E PERMISSÕES GLOBAIS

-- ── 6. LIMPEZA DE PROJETOS DUPLICADOS ──────────────────────────────────────────
-- Remove projetos com o mesmo slug, mantendo apenas o mais recente (maior data de criação)
DELETE FROM projects
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at DESC) as row_num
        FROM projects
    ) t
    WHERE t.row_num > 1
);

NOTIFY pgrst, 'reload schema';

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated;

-- Garante que o usuário anon possa inserir inscrições (público)
GRANT INSERT ON public.inscricoes_growth_experience TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.programacao_evento TO anon;
