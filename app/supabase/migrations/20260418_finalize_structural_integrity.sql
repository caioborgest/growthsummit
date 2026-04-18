-- GROWTH EXPERIENCE 2026 - FINAL STRUCTURAL INTEGRITY
-- Purpose: Resolve PGRST204 errors for certificates and registrations

DO $$ 
BEGIN
    -- 1. FIX CERTIFICATES TABLE
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'certificates') THEN
        -- Ensure 'type' column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'type') THEN
            ALTER TABLE public.certificates ADD COLUMN type TEXT DEFAULT 'event';
            RAISE NOTICE 'Added type column to certificates';
        END IF;

        -- Ensure 'status' column exists (redundant but safe)
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'status') THEN
            ALTER TABLE public.certificates ADD COLUMN status TEXT DEFAULT 'issued';
            RAISE NOTICE 'Added status column to certificates';
        END IF;

        -- Ensure 'activity_name' column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'activity_name') THEN
            ALTER TABLE public.certificates ADD COLUMN activity_name TEXT;
            RAISE NOTICE 'Added activity_name column to certificates';
        END IF;

        -- Ensure 'issue_date' column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'certificates' AND column_name = 'issue_date') THEN
            ALTER TABLE public.certificates ADD COLUMN issue_date TIMESTAMPTZ DEFAULT NOW();
            RAISE NOTICE 'Added issue_date column to certificates';
        END IF;
    END IF;

    -- 2. FIX REGISTRATIONS TABLE
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'growth_experience_registrations') THEN
        -- Add check_in_at if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'growth_experience_registrations' AND column_name = 'check_in_at') THEN
            ALTER TABLE public.growth_experience_registrations ADD COLUMN check_in_at TIMESTAMPTZ;
            RAISE NOTICE 'Added check_in_at column to growth_experience_registrations';
        END IF;

        -- Add check_in_time as ALIAS or redundant column if frontend insists
        -- Actually, better to just ensure check_in_at exists and use mappers.
    END IF;

    -- 3. FIX PARTNER TEAM MEMBERS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partner_team_members') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'partner_team_members' AND column_name = 'check_in_at') THEN
            ALTER TABLE public.partner_team_members ADD COLUMN check_in_at TIMESTAMPTZ;
            RAISE NOTICE 'Added check_in_at column to partner_team_members';
        END IF;
    END IF;

END $$;

-- Reload PostgREST Cache
NOTIFY pgrst, 'reload schema';
