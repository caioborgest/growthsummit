-- ============================================================
-- SCHEMA FIXES — B2B MEETINGS & MENTOR STATUS (V3)
-- Data: 2026-03-05
-- ============================================================
-- 1. Ensure B2B Meetings table exists
CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
-- 2. Handle legacy columns if they exist BEFORE adding new ones
-- This prevents "column already exists" errors when trying to rename
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_anchor_id'
)
AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_a_id'
) THEN
ALTER TABLE public.b2b_meetings
    RENAME COLUMN company_anchor_id TO company_a_id;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_vendor_id'
)
AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'b2b_meetings'
        AND column_name = 'company_b_id'
) THEN
ALTER TABLE public.b2b_meetings
    RENAME COLUMN company_vendor_id TO company_b_id;
END IF;
END $$;
-- 3. Add/Correct columns for B2B Meetings (if they don't exist yet)
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS company_a_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS company_b_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 20;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS table_number TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS interest_level TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS feedback_a TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS feedback_b TEXT;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS follow_up BOOLEAN DEFAULT FALSE;
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.b2b_meetings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- 4. RLS for B2B Meetings
ALTER TABLE public.b2b_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_meetings_admin_all" ON public.b2b_meetings;
CREATE POLICY "b2b_meetings_admin_all" ON public.b2b_meetings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_meetings_own_read" ON public.b2b_meetings;
CREATE POLICY "b2b_meetings_own_read" ON public.b2b_meetings FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_meetings.company_a_id
                    OR c.id = b2b_meetings.company_b_id
                )
        )
    );
-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_project ON public.b2b_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_scheduled ON public.b2b_meetings(scheduled_at);
-- 6. Add rejection_reason to mentores if missing
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
-- 7. Inscriptions: Ensure columns exist
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS palestras_noturnas TEXT [] DEFAULT '{}';
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS cursos_selecionados TEXT [] DEFAULT '{}';
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS cupom_palestra TEXT;
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0;
-- 8. Checkins: Ensure created_at exists
ALTER TABLE public.check_ins
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- 9. Add matching table for B2B
CREATE TABLE IF NOT EXISTS public.b2b_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS company_a_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS company_b_id UUID REFERENCES public.rodada_negocios_b2b(id);
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.b2b_matches
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- Add UNIQUE constraint if missing
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'b2b_matches_unique_pair'
) THEN
ALTER TABLE public.b2b_matches
ADD CONSTRAINT b2b_matches_unique_pair UNIQUE(company_a_id, company_b_id);
END IF;
END $$;
ALTER TABLE public.b2b_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_matches_admin_all" ON public.b2b_matches;
CREATE POLICY "b2b_matches_admin_all" ON public.b2b_matches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_matches_own_read" ON public.b2b_matches;
CREATE POLICY "b2b_matches_own_read" ON public.b2b_matches FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_matches.company_a_id
                    OR c.id = b2b_matches.company_b_id
                )
        )
    );