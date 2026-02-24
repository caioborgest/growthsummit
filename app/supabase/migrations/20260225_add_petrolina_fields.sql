-- Add Petrolina-specific fields to inscricoes_growth_experience
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS numero_colaboradores TEXT,
    ADD COLUMN IF NOT EXISTS faturamento_anual TEXT;
-- Update RLS for new columns (usually not needed if already open, but good practice)
COMMENT ON COLUMN public.inscricoes_growth_experience.numero_colaboradores IS 'Faixa de número de colaboradores (Petrolina)';
COMMENT ON COLUMN public.inscricoes_growth_experience.faturamento_anual IS 'Faixa de faturamento anual (Petrolina)';