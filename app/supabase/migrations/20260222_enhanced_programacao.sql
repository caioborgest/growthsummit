-- ============================================
-- MIGRATION: ENHANCED PROGRAMACAO SCHEMA
-- Growth Summit 2026 - Triunfo
-- ============================================
-- Ensure the table programacao_evento exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.programacao_evento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    -- diurna_bloco_1, circuito, noturna, etc.
    type VARCHAR(50) NOT NULL,
    -- keynote, talk, workshop, networking, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    speakers TEXT [] DEFAULT '{}',
    partner VARCHAR(255),
    room VARCHAR(255),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INTEGER DEFAULT 0,
    registered_count INTEGER DEFAULT 0,
    topics TEXT [] DEFAULT '{}',
    color VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.programacao_evento ENABLE ROW LEVEL SECURITY;
-- Policies
DO $$ BEGIN DROP POLICY IF EXISTS "Public can see programming" ON public.programacao_evento;
DROP POLICY IF EXISTS "Admins can manage programming" ON public.programacao_evento;
END $$;
CREATE POLICY "Public can see programming" ON public.programacao_evento FOR
SELECT USING (true);
CREATE POLICY "Admins can manage programming" ON public.programacao_evento FOR ALL USING (public.is_admin());
-- Trigger for update
DROP TRIGGER IF EXISTS tr_programacao_update ON public.programacao_evento;
CREATE TRIGGER tr_programacao_update BEFORE
UPDATE ON public.programacao_evento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();