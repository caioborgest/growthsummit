-- ============================================================================
-- GROWTH SUMMIT 2026 - FIX MISMATCHED COLUMNS AND RLS POLICIES
-- Date: 2026-04-04
-- Objective: Fix the 403 Forbidden and 400 Bad Request errors in the frontend
-- ============================================================================

-- 1. FIX GROWTH EXPERIENCE TRANSACTIONS POLICIES (Fix 403 Forbidden)
-- Even if RLS is enabled, we need policies to allow access
DO $$ 
BEGIN
    -- Ensure RLS is enabled
    ALTER TABLE IF EXISTS public.growth_experience_transactions ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins can manage transactions" ON public.growth_experience_transactions;
    DROP POLICY IF EXISTS "Staff can view transactions" ON public.growth_experience_transactions;

    -- Create robust admin policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_experience_transactions' AND policyname = 'Admins can manage transactions') THEN
        CREATE POLICY "Admins can manage transactions" 
        ON public.growth_experience_transactions 
        FOR ALL 
        TO authenticated 
        USING (public.is_admin());
    END IF;

    -- Create staff view policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'growth_experience_transactions' AND policyname = 'Staff can view transactions') THEN
        CREATE POLICY "Staff can view transactions" 
        ON public.growth_experience_transactions 
        FOR SELECT 
        TO authenticated 
        USING (public.is_admin());
    END IF;
END $$;

-- 2. FIX COMPANY REGISTRATION BATCHES (Fix 400 Bad Request)
-- Ensure missing columns exist and have correct types
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist (frequently used in frontend)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'is_active') THEN
        ALTER TABLE public.company_registration_batches ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    -- Add responsible_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'responsible_email') THEN
        ALTER TABLE public.company_registration_batches ADD COLUMN responsible_email TEXT;
    END IF;

    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'expires_at') THEN
        ALTER TABLE public.company_registration_batches ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    -- Add voucher_code if somehow it was missed during renames (it is mandatory for logic)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_registration_batches' AND column_name = 'voucher_code') THEN
        ALTER TABLE public.company_registration_batches ADD COLUMN voucher_code TEXT UNIQUE;
    END IF;
END $$;

-- 3. ENFORCE POLICIES FOR COMPANY REGISTRATION BATCHES
DO $$ 
BEGIN
    -- Ensure RLS is enabled
    ALTER TABLE IF EXISTS public.company_registration_batches ENABLE ROW LEVEL SECURITY;

    -- Drop existing to avoid conflicts
    DROP POLICY IF EXISTS "Admins can manage batches" ON public.company_registration_batches;
    DROP POLICY IF EXISTS "Public can verify batches" ON public.company_registration_batches;
    DROP POLICY IF EXISTS "admin_all" ON public.company_registration_batches;

    -- Admin policy
    CREATE POLICY "Admins can manage batches" 
    ON public.company_registration_batches 
    FOR ALL 
    TO authenticated 
    USING (public.is_admin());

    -- Public policy (needed for voucher validation during registration)
    CREATE POLICY "Public can verify batches" 
    ON public.company_registration_batches 
    FOR SELECT 
    TO anon, authenticated 
    USING (true);
END $$;

-- 4. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
