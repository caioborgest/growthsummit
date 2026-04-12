-- ==========================================
-- 1. SECURITY TELEMETRY TABLES
-- ==========================================

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    browser_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Login Attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Standardize created_at column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='login_attempts' AND column_name='created_at') THEN
        ALTER TABLE public.login_attempts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Security Views
CREATE OR REPLACE VIEW public.security_suspicious_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as failed_attempts,
    MAX(created_at) as last_attempt
FROM public.login_attempts
WHERE success = false
  AND created_at > now() - interval '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) >= 5;

-- ==========================================
-- 2. PITCH ARENA TABLES & FIXES
-- ==========================================

-- Ensure pitch_scores exists and has project_id
CREATE TABLE IF NOT EXISTS public.pitch_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID NOT NULL,
    judge_id UUID REFERENCES auth.users(id),
    innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
    market_score INTEGER CHECK (market_score >= 1 AND market_score <= 10),
    presentation_score INTEGER CHECK (presentation_score >= 1 AND presentation_score <= 10),
    business_model_score INTEGER CHECK (business_model_score >= 1 AND business_model_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add missing project_id column to pitch_scores
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pitch_scores' AND column_name='project_id') THEN
        ALTER TABLE public.pitch_scores ADD COLUMN project_id UUID;
    END IF;
END $$;

-- ==========================================
-- 3. PERMISSIONS & RLS POLICIES
-- ==========================================

-- Enable RLS on all relevant tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- ADMIN CHECK FUNCTION (Helper)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can manage pitch scores" ON public.pitch_scores;
DROP POLICY IF EXISTS "Admins can manage email campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can view email templates" ON public.email_templates;

-- CREATE NEW POLICIES

-- Audit Logs: Admin ONLY
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin());

-- Login Attempts: Admin ONLY
CREATE POLICY "Admins can view login attempts" ON public.login_attempts
    FOR SELECT USING (public.is_admin());

-- Pitch Scores: Admin can manage, Authenticated can insert (Judges)
CREATE POLICY "Admins can manage pitch scores" ON public.pitch_scores
    FOR ALL USING (public.is_admin());

CREATE POLICY "Judges can insert scores" ON public.pitch_scores
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Email Campaigns & Templates: Admin ONLY
CREATE POLICY "Admins can manage email campaigns" ON public.email_campaigns
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view email templates" ON public.email_templates
    FOR SELECT USING (public.is_admin());

-- Transactions: Admin viewable
DROP POLICY IF EXISTS "Admins can view transactions" ON public.growth_experience_transactions;
CREATE POLICY "Admins can view transactions" ON public.growth_experience_transactions
    FOR SELECT USING (public.is_admin());
