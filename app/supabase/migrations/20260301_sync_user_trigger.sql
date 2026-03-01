-- ============================================================
-- MIGRATION: AUTO-SYNC AUTH.USERS TO PUBLIC.USERS
-- Date: 2026-03-01 (v3 - corrigido sintaxe ON CONFLICT DO UPDATE)
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
'visitor',
'participant' THEN v_role := v_raw_role;
WHEN 'empresa' THEN v_role := 'company';
WHEN 'palestrante' THEN v_role := 'mentor';
ELSE v_role := 'participant';
END CASE
;
-- PREVENT ZOMBIE CONFLICTS: delete any record with same email but different id
DELETE FROM users
WHERE email = NEW.email
    AND id != NEW.id;
-- Insert or update the user record (including phone)
-- NOTE: inside ON CONFLICT DO UPDATE, reference the existing row
--       using the bare table name (no schema prefix).
INSERT INTO users (id, email, name, phone, role, updated_at)
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
EXCEPTION
WHEN OTHERS THEN -- Fallback: never block auth.users creation even if sync fails
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
-- 2. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 3. Backfill existing auth.users that may be missing from public.users
--    Apply role mapping to avoid CHECK constraint violations.
INSERT INTO public.users (id, email, name, phone, role, updated_at)
SELECT id,
    email,
    COALESCE(raw_user_meta_data->>'name', email),
    raw_user_meta_data->>'phone',
    CASE
        LOWER(
            COALESCE(raw_user_meta_data->>'role', 'participant')
        )
        WHEN 'participante' THEN 'participant'
        WHEN 'empresa' THEN 'company'
        WHEN 'palestrante' THEN 'mentor'
        WHEN 'admin' THEN 'admin'
        WHEN 'mentor' THEN 'mentor'
        WHEN 'company' THEN 'company'
        WHEN 'startup' THEN 'startup'
        WHEN 'sponsor' THEN 'sponsor'
        WHEN 'staff' THEN 'staff'
        ELSE 'participant'
    END,
    NOW()
FROM auth.users ON CONFLICT (id) DO NOTHING;