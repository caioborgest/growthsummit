-- ============================================================
-- MIGRATION: FIX REGISTRATION CONSTRAINTS AND POLICIES (V3)
-- Date: 2026-03-03
-- ============================================================
-- 0. GRANT BASE PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
GRANT ALL ON TABLE public.mentores_growth_experience TO anon,
    authenticated;
GRANT ALL ON TABLE public.startups_arena_pitch TO anon,
    authenticated;
GRANT ALL ON TABLE public.rodada_negocios_b2b TO anon,
    authenticated;
GRANT ALL ON TABLE public.inscricoes_growth_experience TO anon,
    authenticated;
-- 1. FIX UNIQUE CONSTRAINTS (Ensures ON CONFLICT works)
DO $$ BEGIN -- Mentores
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_email_unique'
) THEN
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_email_unique UNIQUE (email);
END IF;
-- Startups
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_email_unique'
) THEN
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_email_unique UNIQUE (email);
END IF;
-- B2B
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'b2b_email_unique'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT b2b_email_unique UNIQUE (email);
END IF;
END $$;
-- 2. FIX MENTORES POLICIES (Allow Public Insert + Auth Upsert)
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_insert_policy" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_user_select" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_user_update" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_admin_update" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_admin_all" ON public.mentores_growth_experience;
DROP POLICY IF EXISTS "mentores_self_manage" ON public.mentores_growth_experience;
-- Allow anyone to insert (submission)
CREATE POLICY "mentores_insert_policy" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
-- Allow users to see and update their own registry (by user_id or email in JWT)
CREATE POLICY "mentores_self_manage" ON public.mentores_growth_experience FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
-- Allow admins full access
CREATE POLICY "mentores_admin_all" ON public.mentores_growth_experience FOR ALL TO authenticated USING (public.is_admin());
-- 3. FIX STARTUPS POLICIES
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "startups_public_insert" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_insert_policy" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_user_all" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_admin_all" ON public.startups_arena_pitch;
DROP POLICY IF EXISTS "startups_self_manage" ON public.startups_arena_pitch;
CREATE POLICY "startups_insert_policy" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
CREATE POLICY "startups_self_manage" ON public.startups_arena_pitch FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
CREATE POLICY "startups_admin_all" ON public.startups_arena_pitch FOR ALL TO authenticated USING (public.is_admin());
-- 4. FIX B2B POLICIES
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_public_insert" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_insert_policy" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_user_all" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_admin_all" ON public.rodada_negocios_b2b;
DROP POLICY IF EXISTS "b2b_self_manage" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_insert_policy" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
CREATE POLICY "b2b_self_manage" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
CREATE POLICY "b2b_admin_all" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (public.is_admin());
-- 5. FIX PUBLIC.USERS POLICY (Optional for sync, but good for profile page)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);
-- 6. ENSURE HANDLE NEW USER TRIGGER IS ROBUST
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE v_role TEXT;
v_raw_role TEXT;
BEGIN v_raw_role := LOWER(
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
);
CASE
    v_raw_role
    WHEN 'participante' THEN v_role := 'participant';
WHEN 'empresa' THEN v_role := 'company';
WHEN 'palestrante' THEN v_role := 'mentor';
WHEN 'admin',
'staff',
'mentor',
'company',
'startup',
'sponsor',
'visitor',
'participant' THEN v_role := v_raw_role;
ELSE v_role := 'participant';
END CASE
;
-- Upsert mapping
INSERT INTO public.users (id, email, name, phone, role, updated_at)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        v_role,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', users.name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', users.phone),
    role = CASE
        WHEN EXCLUDED.role != 'participant' THEN EXCLUDED.role
        ELSE users.role
    END,
    updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;