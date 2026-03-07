-- ============================================================
-- MIGRATION: Ensure all columns for Mentorship Sessions exist
-- Growth Summit 2026
-- Data: 2026-03-07
-- ============================================================
DO $$ BEGIN -- 1. Ensure columns added in previous migration (safety check)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'tema_interesse'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN tema_interesse TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'anotacoes'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN anotacoes TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'email_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN email_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'telefone_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN telefone_mentorado TEXT;
END IF;
-- 2. Ensure extra columns used in getSelectFields but missing from previous migration
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'nome_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN nome_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'data_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN data_mentoria TIMESTAMPTZ;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'avaliacao_mentoria'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN avaliacao_mentoria INTEGER;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'indicacao_mentor'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN indicacao_mentor INTEGER;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'avaliado_em'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN avaliado_em TIMESTAMPTZ;
END IF;
-- 3. Ensure duration and mentor_name exist for compatibility (though focus is on semantic map)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'duration'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN duration INTEGER DEFAULT 30;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'mentor_name'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN mentor_name TEXT;
END IF;
-- 4. Reload PostgREST schema cache (Crucial for 400 errors)
PERFORM pg_notify('pgrst', 'reload schema');
END $$;