-- ============================================================
-- SECURITY & PERFORMANCE RLS REFINEMENT
-- Data: 2026-03-05
-- ============================================================
-- 1. inscricoes_growth_experience: Remove slow subquery from policy
-- It's much faster to use the email from the JWT
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'inscricoes_growth_experience'
        AND policyname = 'inscricoes_own_select'
) THEN
ALTER TABLE public.inscricoes_growth_experience DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
    );
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
END IF;
END $$;
-- 2. mentores_growth_experience: Fix SELECT policy
-- Allow reading own profile even if pending, and public profiles if approved
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'mentores_growth_experience'
        AND policyname = 'mentores_public_read'
) THEN DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (
        status = 'approved'
        OR status = 'aprovado'
        OR public.is_admin()
        OR user_id = auth.uid()
        OR email = auth.jwt()->>'email'
    );
END IF;
END $$;
-- 3. rodada_negocios_b2b: Fix SELECT policy
-- Allow reading own profile
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'rodada_negocios_b2b'
        AND policyname = 'B2B visível para admins'
) THEN DROP POLICY IF EXISTS "B2B visível para admins" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_own_select" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_own_select" ON public.rodada_negocios_b2b FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
        OR public.is_admin()
    );
END IF;
END $$;
-- 4. Startups: Fix SELECT policy
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'startups_arena_pitch'
        AND policyname = 'Startups visíveis para admins'
) THEN DROP POLICY IF EXISTS "Startups visíveis para admins" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_own_select" ON public.startups_arena_pitch;
CREATE POLICY "startups_own_select" ON public.startups_arena_pitch FOR
SELECT USING (
        user_id = auth.uid()
        OR email = auth.jwt()->>'email'
        OR public.is_admin()
    );
END IF;
END $$;
-- 5. Notifications: Ensure users can see their own
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'notifications'
) THEN
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_self_read" ON public.notifications;
CREATE POLICY "notifications_self_read" ON public.notifications FOR
SELECT USING (user_id = auth.uid());
END IF;
END $$;