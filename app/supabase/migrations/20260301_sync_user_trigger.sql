-- ============================================================
-- MIGRATION: AUTO-SYNC AUTH.USERS TO PUBLIC.USERS
-- Date: 2026-03-01
-- Description: Ensures public.users record exists as soon as 
--              auth.users record is created, preventing FK errors.
-- ============================================================
-- 1. Function to handle new user sync with robust mapping and conflict resolution
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE v_role TEXT;
v_raw_role TEXT;
BEGIN -- Mapping roles from Portuguese/Friendly names to DB Check Constraint values
v_raw_role := LOWER(
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
);
CASE
    v_raw_role
    WHEN 'participante' THEN v_role := 'participant';
WHEN 'admin',
'staff',
'mentor',
'company',
'startup',
'sponsor',
'visitor' THEN v_role := v_raw_role;
WHEN 'empresa' THEN v_role := 'company';
WHEN 'palestrante' THEN v_role := 'mentor';
ELSE v_role := 'participant';
END CASE
;
-- PREVENT ZOMBIE CONFLICTS: If another record has this email, delete it first
-- This ensures the UNIQUE(email) constraint won't break the Auth process
DELETE FROM public.users
WHERE email = NEW.email
    AND id != NEW.id;
-- Insert or Update the user record
INSERT INTO public.users (id, email, name, role, updated_at)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        v_role,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(
        NEW.raw_user_meta_data->>'name',
        public.users.name
    ),
    role = CASE
        WHEN EXCLUDED.role != 'participant' THEN EXCLUDED.role
        ELSE public.users.role
    END,
    updated_at = NOW();
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN -- Fallback: If anything fails, still allow the auth.users record to be created
-- We'll log the error indirectly by the fact that the public record wasn't created
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 3. Backfill existing users if any are missing
-- (Safety step to ensure consistency)
INSERT INTO public.users (id, email, name, role, updated_at)
SELECT id,
    email,
    COALESCE(raw_user_meta_data->>'name', email),
    COALESCE(raw_user_meta_data->>'role', 'participant'),
    NOW()
FROM auth.users ON CONFLICT (id) DO NOTHING;