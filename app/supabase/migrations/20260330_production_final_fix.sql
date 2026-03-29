-- ============================================================
-- PRODUCTION FINAL FIX - GROWTH EXPERIENCE 2026
-- Date: 2026-03-29
-- Resolve: Missing columns, Missing Tables, Broken FKs, Cache Refresh
-- ============================================================

-- 1. IDENTIDADE - FUNÇÕES AUXILIARES (Failsafe)
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
  ) IN ('admin', 'staff', 'superadmin');
$$;

-- 2. FIX PROGRAMACAO_EVENTO (Missing Partner column)
ALTER TABLE IF EXISTS public.programacao_evento 
ADD COLUMN IF NOT EXISTS partner TEXT DEFAULT 'Growth Experience',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS topics TEXT[],
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2.1 FIX USERS (Rename avatar to avatar_url for Auth compatibility)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE public.users RENAME COLUMN avatar TO avatar_url;
    ELSE
        ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    END IF;
END $$;

-- 2. ENSURE MISSING TABLES EXIST (For Production Cache)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    logo TEXT,
    level TEXT,
    investment NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    contact_name TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    company_anchor_id UUID,
    company_vendor_id UUID,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'scheduled',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stand_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
    registration_id UUID,
    user_id UUID REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pitch_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id UUID,
    judge_id UUID REFERENCES public.users(id),
    score NUMERIC,
    criteria JSONB,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_ins_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.programacao_evento(id) ON DELETE CASCADE,
    registration_id UUID,
    user_id UUID REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 FIX PROJECTS (Missing Target Columns for Analytics)
ALTER TABLE IF EXISTS public.projects 
ADD COLUMN IF NOT EXISTS target_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS banner TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS max_startups INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_companies INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT TRUE;

-- 3. FIX CERTIFICATES RELATIONSHIP
-- Add columns if missing
ALTER TABLE IF EXISTS public.certificates
ADD COLUMN IF NOT EXISTS registration_id UUID,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS activity_name TEXT,
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure Foreign Key to inscricoes_growth_experience
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_certificates_registration_ge'
    ) THEN
        ALTER TABLE public.certificates 
        ADD CONSTRAINT fk_certificates_registration_ge 
        FOREIGN KEY (registration_id) 
        REFERENCES public.inscricoes_growth_experience(id) 
        ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add FK to certificates. Maybe table does not exist or column mismatch.';
END $$;

-- 4. FIX LOTES_INSCRICAO_EMPRESA (Registration Batches)
ALTER TABLE IF EXISTS public.lotes_inscricao_empresa
ADD COLUMN IF NOT EXISTS nome_responsavel TEXT,
ADD COLUMN IF NOT EXISTS email_responsavel TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 5. REINFORCE RLS POLICIES (Admin CRUD)
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        IF t IN ('notifications', 'sponsors', 'b2b_meetings', 'stands', 'stand_checkins', 'pitch_scores', 'check_ins_atividades', 'certificates', 'lotes_inscricao_empresa') THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('DROP POLICY IF EXISTS "Admin CRUD %I" ON public.%I', t, t);
            EXECUTE format('CREATE POLICY "Admin CRUD %I" ON public.%I FOR ALL USING (public.is_admin())', t, t);
        END IF;
    END LOOP;
END $$;

-- 6. RELOAD SCHEMA CACHE & SET PERMISSIONS
NOTIFY pgrst, 'reload schema';

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON public.inscricoes_growth_experience TO anon;
GRANT INSERT ON public.lotes_inscricao_empresa TO anon;
GRANT INSERT ON public.support_tickets TO anon;

-- Validation Message
DO $$ BEGIN RAISE NOTICE 'Production Final Fix applied successfully. Schema cache reloaded.'; END $$;
