-- ============================================================
-- SCRIPT DE CORREÇÃO PÓS-RESET: GROWTH EXPERIENCE 2026
-- Data: 2026-03-04  |  Versão: 2 (idempotente)
-- Objetivo: Corrigir inconsistências identificadas na auditoria
-- Execute no Supabase SQL Editor após o reset_db_schema.sql
-- Seguro para reexecutar múltiplas vezes.
-- ============================================================
-- ============================================================
-- 1. CORRIGIR TABELA USERS: full_name → name
-- ============================================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'full_name'
) THEN
ALTER TABLE public.users
    RENAME COLUMN full_name TO name;
END IF;
END $$;
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
-- ============================================================
-- 2. CORRIGIR TABELA PROJECTS: adicionar colunas faltantes
-- ============================================================
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR',
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS banner TEXT,
    ADD COLUMN IF NOT EXISTS logo TEXT,
    ADD COLUMN IF NOT EXISTS max_registrations INTEGER,
    ADD COLUMN IF NOT EXISTS max_mentors INTEGER,
    ADD COLUMN IF NOT EXISTS max_startups INTEGER,
    ADD COLUMN IF NOT EXISTS max_companies INTEGER,
    ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS ticket_price_standard INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ticket_price_pro INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS ticket_price_vip INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS target_registrations INTEGER DEFAULT 500,
    ADD COLUMN IF NOT EXISTS target_revenue NUMERIC(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'projects'
        AND column_name = 'created_by'
) THEN
ALTER TABLE public.projects
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE
SET NULL;
END IF;
END $$;
-- ============================================================
-- 3. CORRIGIR TABELA rodada_negocios_b2b: colunas faltantes
-- ============================================================
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN IF NOT EXISTS faturamento_anual NUMERIC(15, 2),
    ADD COLUMN IF NOT EXISTS numero_funcionarios INTEGER,
    ADD COLUMN IF NOT EXISTS produtos_servicos TEXT,
    ADD COLUMN IF NOT EXISTS site_url TEXT,
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS tipo_interesse TEXT DEFAULT 'todos',
    ADD COLUMN IF NOT EXISTS areas_interesse TEXT,
    ADD COLUMN IF NOT EXISTS descricao_objetivos TEXT;
-- ============================================================
-- 4. CRIAR TABELA: inscricoes_empresas_incentivadoras
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_empresas_incentivadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        nome_responsavel TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT NOT NULL,
        nome_empresa TEXT NOT NULL,
        quantidade_equipe INTEGER NOT NULL DEFAULT 1,
        objetivo TEXT,
        status TEXT DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 5. CRIAR TABELA: audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        ip_address TEXT,
        browser_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 6. CRIAR TABELA: login_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        email TEXT,
        ip_address TEXT,
        success BOOLEAN DEFAULT false,
        attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 7. CRIAR TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'BR',
    birth_date DATE,
    gender TEXT,
    cpf TEXT,
    cnpj TEXT,
    newsletter_opt_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Garantir colunas mesmo se a tabela já existia
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR';
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_opt_in BOOLEAN DEFAULT false;
-- ============================================================
-- 8. CRIAR TABELA: transactions (financeiro)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'completed',
    related_id UUID,
    related_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 9. CRIAR TABELA: sponsors (patrocinadores)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    level TEXT DEFAULT 'silver' CHECK (level IN ('diamond', 'gold', 'silver', 'bronze')),
    investment NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'prospect',
    logo TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 10. CRIAR TABELA: whatsapp_invite_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_invite_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.whatsapp_groups(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.whatsapp_group_members(id) ON DELETE
    SET NULL,
        user_id UUID REFERENCES public.users(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        performed_by UUID REFERENCES public.users(id),
        performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        method TEXT,
        details JSONB DEFAULT '{}'::jsonb,
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================================
-- 11. CRIAR TABELA: whatsapp_message_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, template_name)
);
-- ============================================================
-- 12. CRIAR TABELA: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Garantir coluna is_read mesmo se a tabela já existia sem ela
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
-- ============================================================
-- 13. TRIGGERS DE UPDATED_AT (idempotente com DROP IF EXISTS)
-- ============================================================
DROP TRIGGER IF EXISTS tr_emp_incentivadoras_updated_at ON public.inscricoes_empresas_incentivadoras;
CREATE TRIGGER tr_emp_incentivadoras_updated_at BEFORE
UPDATE ON public.inscricoes_empresas_incentivadoras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_transactions_updated_at ON public.transactions;
CREATE TRIGGER tr_transactions_updated_at BEFORE
UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_sponsors_updated_at ON public.sponsors;
CREATE TRIGGER tr_sponsors_updated_at BEFORE
UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS tr_whatsapp_templates_updated_at ON public.whatsapp_message_templates;
CREATE TRIGGER tr_whatsapp_templates_updated_at BEFORE
UPDATE ON public.whatsapp_message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ============================================================
-- 14. HABILITAR RLS E POLÍTICAS (idempotente com DROP IF EXISTS)
-- ============================================================
-- inscricoes_empresas_incentivadoras
ALTER TABLE public.inscricoes_empresas_incentivadoras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "empresas_inc_public_insert" ON public.inscricoes_empresas_incentivadoras;
DROP POLICY IF EXISTS "empresas_inc_public_read" ON public.inscricoes_empresas_incentivadoras;
DROP POLICY IF EXISTS "empresas_inc_admin_all" ON public.inscricoes_empresas_incentivadoras;
CREATE POLICY "empresas_inc_public_insert" ON public.inscricoes_empresas_incentivadoras FOR
INSERT WITH CHECK (true);
CREATE POLICY "empresas_inc_public_read" ON public.inscricoes_empresas_incentivadoras FOR
SELECT USING (true);
CREATE POLICY "empresas_inc_admin_all" ON public.inscricoes_empresas_incentivadoras FOR ALL USING (public.is_admin());
-- audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_log_insert_all" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_log_admin_read" ON public.audit_logs;
CREATE POLICY "audit_log_insert_all" ON public.audit_logs FOR
INSERT WITH CHECK (true);
CREATE POLICY "audit_log_admin_read" ON public.audit_logs FOR
SELECT USING (public.is_admin());
-- login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "login_attempts_insert_all" ON public.login_attempts;
DROP POLICY IF EXISTS "login_attempts_admin_read" ON public.login_attempts;
CREATE POLICY "login_attempts_insert_all" ON public.login_attempts FOR
INSERT WITH CHECK (true);
CREATE POLICY "login_attempts_admin_read" ON public.login_attempts FOR
SELECT USING (public.is_admin());
-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "profiles_self_write" ON public.profiles FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_self_update" ON public.profiles FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());
-- transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "transactions_admin_all" ON public.transactions;
CREATE POLICY "transactions_admin_all" ON public.transactions FOR ALL USING (public.is_admin());
-- sponsors
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sponsors_public_read" ON public.sponsors;
DROP POLICY IF EXISTS "sponsors_admin_all" ON public.sponsors;
CREATE POLICY "sponsors_public_read" ON public.sponsors FOR
SELECT USING (true);
CREATE POLICY "sponsors_admin_all" ON public.sponsors FOR ALL USING (public.is_admin());
-- whatsapp_invite_logs
ALTER TABLE public.whatsapp_invite_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_logs_admin_all" ON public.whatsapp_invite_logs;
CREATE POLICY "whatsapp_logs_admin_all" ON public.whatsapp_invite_logs FOR ALL USING (public.is_admin());
-- whatsapp_message_templates
ALTER TABLE public.whatsapp_message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_templates_read" ON public.whatsapp_message_templates;
DROP POLICY IF EXISTS "whatsapp_templates_admin" ON public.whatsapp_message_templates;
CREATE POLICY "whatsapp_templates_read" ON public.whatsapp_message_templates FOR
SELECT USING (true);
CREATE POLICY "whatsapp_templates_admin" ON public.whatsapp_message_templates FOR ALL USING (public.is_admin());
-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL USING (public.is_admin());
-- ============================================================
-- 15. ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON public.transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_project_id ON public.sponsors(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
-- ============================================================
-- 16. GRANTS DE EXECUÇÃO
-- ============================================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;
-- ============================================================
-- VERIFICAÇÃO FINAL: lista as tabelas criadas
-- ============================================================
SELECT table_name,
    'OK' as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'users',
        'projects',
        'profiles',
        'audit_logs',
        'login_attempts',
        'inscricoes_growth_experience',
        'inscricoes_empresas_incentivadoras',
        'mentores_growth_experience',
        'mentorias_agendadas',
        'startups_arena_pitch',
        'rodada_negocios_b2b',
        'programacao_evento',
        'check_ins',
        'certificates',
        'transactions',
        'sponsors',
        'cupons_parceria_social',
        'whatsapp_groups',
        'whatsapp_group_members',
        'whatsapp_invite_logs',
        'whatsapp_message_templates',
        'notifications'
    )
ORDER BY table_name;
-- ============================================================
-- FIM DO SCRIPT | Execute e verifique a lista acima
-- Todas as tabelas devem aparecer com status 'OK'
-- ============================================================