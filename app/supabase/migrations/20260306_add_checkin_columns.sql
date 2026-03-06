-- Add check-in columns to inscricoes_growth_experience
-- Date: 2026-03-06
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMP WITH TIME ZONE;
-- Create index for faster check-in queries
CREATE INDEX IF NOT EXISTS idx_ige_checked_in ON public.inscricoes_growth_experience(checked_in);