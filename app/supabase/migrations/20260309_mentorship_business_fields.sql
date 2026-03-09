-- ============================================================
-- MIGRATION: Add Business Fields to Mentorship Sessions
-- Growth Summit 2026
-- Data: 2026-03-09
-- ============================================================
DO $$ BEGIN -- 1. Add nome_startup (Business Name) to mentorias_agendadas if missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'nome_startup'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN nome_startup TEXT;
END IF;
-- 2. Add setor (Business Stage/Sector) to mentorias_agendadas if missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'setor'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN setor TEXT;
END IF;
-- 3. Safety check for data_mentoria (should be there based on previous migrations)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'data_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN data_mentoria TIMESTAMPTZ;
END IF;
-- Reload schema cache for PostgREST
PERFORM pg_notify('pgrst', 'reload schema');
END $$;