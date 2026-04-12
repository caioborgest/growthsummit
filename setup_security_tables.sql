-- ============================================================================
-- GROWTH SUMMIT 2026 - COMPREHENSIVE SECURITY & MONITORING INFRASTRUCTURE
-- Objective: Fix all Admin 403, 404, and 400 errors.
-- ==================	==========================================================

-- 1. STANDARDIZE TELEMETRY TABLES
-- ----------------------------------------------------------------------------
-- audit_logs: expanded to support all variants
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    action TEXT,                 -- alias for event
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    browser_agent TEXT,          -- used by AdminSecurity.tsx
    user_agent TEXT,             -- alias for browser_agent
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- login_attempts: fixing column names for AdminSecurity.tsx compatibility
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    success BOOLEAN DEFAULT false,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist if table was already there (CREATE TABLE IF NOT EXISTS doesn't update schema)
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.login_attempts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Ensure two_factor_enabled exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'participant';

-- Ensure all columns exist if audit_logs table was already there
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS browser_agent TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- 2. CREATE SECURITY MONITORING VIEWS (Fixing 404 Errors)
-- ----------------------------------------------------------------------------

-- active_sessions view (simplified for monitoring)
CREATE OR REPLACE VIEW public.active_sessions AS
SELECT 
    id,
    user_id,
    created_at,
    updated_at as last_activity,
    (created_at + interval '24 hours') as expires_at -- mock expiration for the view
FROM auth.sessions;

-- security_suspicious_logins view
CREATE OR REPLACE VIEW public.security_suspicious_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as failed_attempts,
    MAX(attempted_at) as last_attempt
FROM public.login_attempts
WHERE success = false
GROUP BY email, ip_address
HAVING COUNT(*) >= 5;

-- security_user_activity view
CREATE OR REPLACE VIEW public.security_user_activity AS
SELECT 
    p.user_id as id,
    u.email,
    p.name,
    p.role,
    u.last_sign_in_at as last_login_at,
    (SELECT ip_address FROM public.login_attempts WHERE email = u.email ORDER BY attempted_at DESC LIMIT 1) as last_login_ip,
    COALESCE(p.two_factor_enabled, false) as two_factor_enabled,
    (SELECT COUNT(*) FROM auth.sessions WHERE user_id = p.user_id) as active_sessions
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id;

-- Maintenance of public.users table (instead of view to avoid name collision)
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- 3. APPLY ROBUST ADMIN RLS POLICIES (Fixing 403 Errors)
-- ----------------------------------------------------------------------------

-- Enable RLS on core tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Helper to apply Admin policy to any table
DO $$
DECLARE
    t TEXT;
    tables_to_fix TEXT[] := ARRAY[
        'audit_logs', 
        'login_attempts', 
        'growth_experience_transactions', 
        'email_campaigns', 
        'email_templates',
        'users'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_fix LOOP
        -- Drop existing to avoid conflicts
        EXECUTE format('DROP POLICY IF EXISTS "Admin full access" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can view %I" ON public.%I', t, t);
        
        -- Create broad Admin policy with fallback to profiles table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
            EXECUTE format('CREATE POLICY "Admin full access" ON public.%I FOR ALL USING (
                public.is_admin() 
                OR (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN (''admin'', ''staff'', ''superadmin'')
            )', t);
        END IF;
    END LOOP;
END $$;

-- Policies for telemetry (Participants only INSERT)
DROP POLICY IF EXISTS "Public can insert audit logs" ON public.audit_logs;
CREATE POLICY "Public can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Ensure permissions are granted to authenticated users (who might be admins)
GRANT SELECT ON public.active_sessions TO authenticated;
GRANT SELECT ON public.security_suspicious_logins TO authenticated;
GRANT SELECT ON public.security_user_activity TO authenticated;
GRANT SELECT ON public.users TO authenticated;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Full Security & Monitoring Infrastructure applied successfully.'; END $$;
