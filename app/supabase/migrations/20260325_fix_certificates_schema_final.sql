-- ============================================================
-- FINAL FIX: Certificates Schema
-- Ensures 'activity_name' and other critical columns exist
-- ============================================================

-- 1. Ensure table exists
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add activity_name if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'certificates' AND column_name = 'activity_name'
    ) THEN
        ALTER TABLE public.certificates ADD COLUMN activity_name TEXT;
    END IF;
END $$;

-- 3. Ensure other expected columns exist
DO $$ 
BEGIN 
    -- project_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'project_id') THEN
        ALTER TABLE public.certificates ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- registration_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'registration_id') THEN
        ALTER TABLE public.certificates ADD COLUMN registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE;
    END IF;

    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'user_id') THEN
        ALTER TABLE public.certificates ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'type') THEN
        ALTER TABLE public.certificates ADD COLUMN type TEXT DEFAULT 'event';
    END IF;

    -- code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'code') THEN
        ALTER TABLE public.certificates ADD COLUMN code TEXT;
    END IF;

    -- issue_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'issue_date') THEN
        ALTER TABLE public.certificates ADD COLUMN issue_date TIMESTAMPTZ DEFAULT now();
    END IF;

    -- metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'metadata') THEN
        ALTER TABLE public.certificates ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'status') THEN
        ALTER TABLE public.certificates ADD COLUMN status TEXT DEFAULT 'issued';
    END IF;
END $$;

-- 4. Unique constraint on code
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'certificates_code_key'
    ) THEN
        ALTER TABLE public.certificates ADD CONSTRAINT certificates_code_key UNIQUE (code);
    END IF;
END $$;

-- 5. Notify PostgREST to refresh schema cache (Supabase specific hint)
-- Usually automatic, but this script ensures the structural integrity.
