-- ============================================================
-- MIGRATION: Mentorship Management Refinement
-- Growth Summit 2026
-- ============================================================

-- 1. WAITLIST TABLE
CREATE TABLE IF NOT EXISTS public.mentoring_waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL,
    mentor_id UUID REFERENCES public.mentores_growth_experience(id), -- Optional: specific mentor
    challenge TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'redirected', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ADD TRIGGER TO UPDATE updated_at
-- This function can be created independently without DO
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Now use a DO block ONLY for the trigger which doesn't have IF NOT EXISTS in plain SQL
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mentoring_waitlist_updated_at') THEN
        CREATE TRIGGER update_mentoring_waitlist_updated_at
        BEFORE UPDATE ON public.mentoring_waitlist
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 3. ENABLE RLS
ALTER TABLE public.mentoring_waitlist ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own waitlist entries') THEN
        CREATE POLICY "Users can view their own waitlist entries"
        ON public.mentoring_waitlist FOR SELECT
        TO authenticated
        USING (true); -- Simplified for now, or filter by registration_id
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage all waitlist entries') THEN
        CREATE POLICY "Admins can manage all waitlist entries"
        ON public.mentoring_waitlist FOR ALL
        TO authenticated
        USING (true);
    END IF;
END $$;

-- 5. RELOAD SCHEMA CACHE
SELECT pg_notify('pgrst', 'reload schema');
