-- ============================================================
-- MIGRATION: FIX REGISTRATION, STORAGE AND SYNC (V4)
-- Date: 2026-03-03
-- ============================================================
-- 1. STORAGE PERMISSIONS (Fixes RLS/Storage error 400/403)
-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- Storage Policies for event-images (mentors, etc)
DROP POLICY IF EXISTS "Allow Public Select" ON storage.objects;
CREATE POLICY "Allow Public Select" ON storage.objects FOR
SELECT USING (bucket_id IN ('event-images', 'event-assets'));
DROP POLICY IF EXISTS "Allow Authenticated Insert" ON storage.objects;
CREATE POLICY "Allow Authenticated Insert" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id IN ('event-images', 'event-assets'));
DROP POLICY IF EXISTS "Allow Authenticated Update" ON storage.objects;
CREATE POLICY "Allow Authenticated Update" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id IN ('event-images', 'event-assets'));
-- 2. DB PERMISSIONS & CONSTRAINTS
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
GRANT ALL ON TABLE public.users TO anon,
    authenticated;
-- Ensure Unique Constraints for UPSERT
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_email_unique'
) THEN
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_email_unique UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_email_unique'
) THEN
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_email_unique UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'b2b_email_unique'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT b2b_email_unique UNIQUE (email);
END IF;
END $$;
-- 3. RLS POLICIES FOR TABLES
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_insert_policy" ON public.mentores_growth_experience;
CREATE POLICY "mentores_insert_policy" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mentores_self_manage" ON public.mentores_growth_experience;
CREATE POLICY "mentores_self_manage" ON public.mentores_growth_experience FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
) WITH CHECK (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
);
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "startups_insert_policy" ON public.startups_arena_pitch;
CREATE POLICY "startups_insert_policy" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "startups_self_manage" ON public.startups_arena_pitch;
CREATE POLICY "startups_self_manage" ON public.startups_arena_pitch FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
) WITH CHECK (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
);
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_insert_policy" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_insert_policy" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "b2b_self_manage" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_self_manage" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
) WITH CHECK (
    user_id = auth.uid()
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
);
-- 4. FIX USER SYNC TRIGGER (The missing link)
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
    name = COALESCE(
        NEW.raw_user_meta_data->>'name',
        public.users.name
    ),
    phone = COALESCE(
        NEW.raw_user_meta_data->>'phone',
        public.users.phone
    ),
    role = CASE
        WHEN EXCLUDED.role != 'participant' THEN EXCLUDED.role
        ELSE public.users.role
    END,
    updated_at = NOW();
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN RETURN NEW;
-- Prevent blocking auth if sync fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    OR
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Policy for users table to allow profile updates
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);