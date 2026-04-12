-- ============================================================================
-- GROWTH SUMMIT 2026 - SECURITY & TELEMETRY STANDARDIZATION
-- Objective: Fix console 400 errors and ensure participants can log activity.
-- ============================================================================

-- 1. CONSOLIDATE AUDIT LOGS (Fix 400 Bad Request)
-- ----------------------------------------------------------------------------
-- We create a table that supports both 'activity_logs' and 'audit_logs' styles
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,         -- compatible with auth-audit.ts
    action TEXT,                 -- compatible with older loggers
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    browser_agent TEXT,          -- compatible with auth-audit.ts
    user_agent TEXT,             -- compatible with older loggers
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist if table was already there
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);

-- 2. LOGIN ATTEMPTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. PERMISSIONS & RLS (Fix 403 Forbidden)
-- ----------------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- CLEAR OLD POLICIES
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public can insert audit logs" ON public.audit_logs;

-- CREATE ROBUST POLICIES
-- Admin can see everything
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- Everyone (even anon/authenticated) can INSERT logs (Fire and forget telemetry)
CREATE POLICY "Public can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Login Attempts: Admin ONLY
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
CREATE POLICY "Admins can view login attempts" ON public.login_attempts
    FOR SELECT USING (public.is_admin());

-- 4. FIX PROFILES TABLE PERMISSIONS
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- 5. REFRESH CACHE
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Security & Telemetry standardization applied successfully.'; END $$;
