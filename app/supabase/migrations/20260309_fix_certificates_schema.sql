-- ============================================================
-- Fix Certificates Schema
-- Renames 'certificados' to 'certificates' and adds missing columns
-- ============================================================
-- 1. Rename table if old one exists and new one does not
DO $$ BEGIN IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'certificados'
)
AND NOT EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = 'certificates'
) THEN
ALTER TABLE public.certificados
    RENAME TO certificates;
END IF;
END $$;
-- 2. Create 'certificates' table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'event',
    activity_name TEXT,
    code TEXT UNIQUE,
    status TEXT DEFAULT 'disponivel',
    metadata JSONB DEFAULT '{}'::jsonb,
    issue_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 3. Add missing columns expected by Frontend
DO $$ BEGIN IF NOT EXISTS (
    SELECT
    FROM information_schema.columns
    WHERE table_name = 'certificates'
        AND column_name = 'user_id'
) THEN
ALTER TABLE public.certificates
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
END IF;
IF NOT EXISTS (
    SELECT
    FROM information_schema.columns
    WHERE table_name = 'certificates'
        AND column_name = 'session_id'
) THEN
ALTER TABLE public.certificates
ADD COLUMN session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE;
END IF;
END $$;
-- 4. Re-create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_project ON public.certificates(project_id);
CREATE INDEX IF NOT EXISTS idx_certificates_registration ON public.certificates(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_session ON public.certificates(session_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(code);
-- 5. Update RLS Policies
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to certificados" ON public.certificates;
DROP POLICY IF EXISTS "Participants can view their own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins have full access to certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.certificates;
CREATE POLICY "Admins have full access to certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR
SELECT TO authenticated USING (
        user_id = auth.uid()
        OR registration_id IN (
            SELECT id
            FROM public.inscricoes_growth_experience
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert their own certificates via RPC or if matching uid" ON public.certificates FOR
INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- 6. Re-attach trigger
DROP TRIGGER IF EXISTS tr_certificados_updated_at ON public.certificates;
DROP TRIGGER IF EXISTS tr_certificates_updated_at ON public.certificates;
CREATE TRIGGER tr_certificates_updated_at BEFORE
UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
COMMENT ON TABLE public.certificates IS 'Stores certificate generations for events and activities.';