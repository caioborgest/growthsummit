-- ============================================================
-- MIGRATION: B2B SWIPES AND MATCHMAKING (Tinder B2B)
-- ============================================================
-- 1. Create b2b_swipes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    from_company_id UUID REFERENCES public.rodada_negocios_b2b(id),
    to_company_id UUID REFERENCES public.rodada_negocios_b2b(id),
    status TEXT CHECK (status IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_company_id, to_company_id)
);
-- 2. RLS policies for b2b_swipes
ALTER TABLE public.b2b_swipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_swipes_admin_all" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_admin_all" ON public.b2b_swipes FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_swipes_read_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_read_own" ON public.b2b_swipes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_swipes.from_company_id
                    OR c.id = b2b_swipes.to_company_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_swipes_insert_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_insert_own" ON public.b2b_swipes FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND c.id = b2b_swipes.from_company_id
        )
    );
DROP POLICY IF EXISTS "b2b_swipes_update_own" ON public.b2b_swipes;
CREATE POLICY "b2b_swipes_update_own" ON public.b2b_swipes FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND c.id = b2b_swipes.from_company_id
        )
    );
-- 3. Matchmaking Trigger Function
-- When a new 'like' is inserted, check if there is a 'like' in the opposite direction.
-- If so, create a 'pending_schedule' inside b2b_matches if not already exists.
CREATE OR REPLACE FUNCTION public.check_b2b_match() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF NEW.status = 'like' THEN IF EXISTS (
        SELECT 1
        FROM public.b2b_swipes
        WHERE from_company_id = NEW.to_company_id
            AND to_company_id = NEW.from_company_id
            AND status = 'like'
    ) THEN -- Create a match if not exists
    -- Order the ids consistently to avoid duplicates
INSERT INTO public.b2b_matches (
        project_id,
        company_a_id,
        company_b_id,
        status
    )
VALUES (
        NEW.project_id,
        LEAST(NEW.from_company_id, NEW.to_company_id),
        GREATEST(NEW.from_company_id, NEW.to_company_id),
        'pending_schedule'
    ) ON CONFLICT (company_a_id, company_b_id) DO NOTHING;
END IF;
END IF;
RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_check_b2b_match ON public.b2b_swipes;
CREATE TRIGGER trigger_check_b2b_match
AFTER
INSERT
    OR
UPDATE ON public.b2b_swipes FOR EACH ROW EXECUTE FUNCTION public.check_b2b_match();
-- 4. B2B Appointments table (which comes after matches)
CREATE TABLE IF NOT EXISTS public.b2b_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    match_id UUID REFERENCES public.b2b_matches(id) ON DELETE CASCADE,
    company_a_id UUID REFERENCES public.rodada_negocios_b2b(id),
    company_b_id UUID REFERENCES public.rodada_negocios_b2b(id),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 20,
    table_number TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Appointments RLS
ALTER TABLE public.b2b_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_appointments_admin_all" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_admin_all" ON public.b2b_appointments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "b2b_appointments_read_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_read_own" ON public.b2b_appointments FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_appointments_update_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_update_own" ON public.b2b_appointments FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );
DROP POLICY IF EXISTS "b2b_appointments_insert_own" ON public.b2b_appointments;
CREATE POLICY "b2b_appointments_insert_own" ON public.b2b_appointments FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.rodada_negocios_b2b c
            WHERE c.user_id = auth.uid()
                AND (
                    c.id = b2b_appointments.company_a_id
                    OR c.id = b2b_appointments.company_b_id
                )
        )
    );