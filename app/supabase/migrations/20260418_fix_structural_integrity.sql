-- GROWTH EXPERIENCE 2026 - STRUCTURAL INTEGRITY FIXES
-- Purpose: Fix certificates 'status' column and ensure public.users synchronization

-- 1. FIX CERTIFICATES SCHEMA
DO $$ 
BEGIN
    -- Ensure certificates table exists (it should)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'certificates') THEN
        -- Add status column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'status') THEN
            ALTER TABLE public.certificates ADD COLUMN status TEXT DEFAULT 'issued';
            RAISE NOTICE 'Added status column to certificates';
        END IF;
    END IF;
END $$;

-- 2. HARDEN USER SYNC (public.users mirror)
-- This ensures the '23503' (Foreign Key Violation) doesn't happen during check-ins

-- Create/Replace the sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, created_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Participant'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger to auth.users (System level might prevent this in some Supabase setups, but we try)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        -- Link it to auth.users if permissions allow (usually managed via dashboard, but SQL is possible)
        -- In some Supabase versions, you need to be cautious with cross-schema triggers
        -- If this fails, we rely on the backfill below
        EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create trigger on auth.users: %', SQLERRM;
END $$;

-- 3. BACKFILL public.users
-- This is critical for existing users that didn't sync correctly
INSERT INTO public.users (id, email, name, avatar_url, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Participant'),
    raw_user_meta_data->>'avatar_url',
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;

-- 4. ATOMIC CHECK-IN/OUT FUNCTION (Standardized)
-- Clean up existing functions to avoid "parameter defaults" conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.oid::regprocedure AS fn
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname IN ('check_in_registration_atomic', 'toggle_registration_checkin_atomic')
          AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn::text || ' CASCADE';
    END LOOP;
END;
$$;

-- This function replaces 'check_in_registration_atomic' and supports both actions
CREATE OR REPLACE FUNCTION public.toggle_registration_checkin_atomic(
    p_registration_id UUID,
    p_project_id UUID,
    p_action TEXT, -- 'check-in' or 'check-out'
    p_user_id UUID,
    p_ticket_number TEXT,
    p_operator_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT 'Entrada Principal',
    p_method TEXT DEFAULT 'manual'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated INTEGER;
    v_target_status BOOLEAN;
BEGIN
    v_target_status := (p_action = 'check-in');

    -- Update registration status
    UPDATE public.growth_experience_registrations
    SET checked_in = v_target_status,
        check_in_at = CASE WHEN v_target_status THEN NOW() ELSE NULL END
    WHERE id = p_registration_id
      AND project_id = p_project_id
      AND COALESCE(checked_in, NOT v_target_status) = NOT v_target_status;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    -- If no update was made, it means already in target state
    IF v_updated = 0 THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', CASE WHEN v_target_status THEN 'ALREADY_CHECKED_IN' ELSE 'ALREADY_CHECKED_OUT' END,
            'message', 'Participant is already in the requested state.'
        );
    END IF;

    -- Insert log entry
    INSERT INTO public.check_ins (
        project_id, registration_id, user_id, ticket_number, timestamp, location, method, operator_id
    ) VALUES (
        p_project_id, p_registration_id, p_user_id, p_ticket_number, NOW(), p_location, p_method, p_operator_id
    );

    RETURN jsonb_build_object('success', true, 'registration_id', p_registration_id, 'action', p_action);
END;
$$;

-- Alias for backward compatibility
CREATE OR REPLACE FUNCTION public.check_in_registration_atomic(
    p_registration_id UUID,
    p_project_id UUID,
    p_user_id UUID,
    p_ticket_number TEXT,
    p_operator_id UUID DEFAULT NULL,
    p_location TEXT DEFAULT 'Entrada Principal',
    p_method TEXT DEFAULT 'manual'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.toggle_registration_checkin_atomic(
        p_registration_id, p_project_id, 'check-in', p_user_id, p_ticket_number, p_operator_id, p_location, p_method
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_registration_checkin_atomic(UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_in_registration_atomic(UUID, UUID, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated, service_role;

-- 5. RELOAD POSTGREST CACHE
DO $$ 
BEGIN
    NOTIFY pgrst, 'reload schema';
    RAISE NOTICE 'Migration completed successfully and schema cache reloaded.';
END $$;
