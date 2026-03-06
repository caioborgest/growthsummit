-- Update empresas_incentivadoras table to support day/night participation tracking
-- Date: 2026-03-06
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS quantidade_dia INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quantidade_noite INTEGER NOT NULL DEFAULT 0;
-- Update existing records to use quantidade_equipe as default for both if they are 0
UPDATE public.inscricoes_empresas_incentivadoras
SET quantidade_dia = quantidade_equipe,
    quantidade_noite = quantidade_equipe
WHERE quantidade_dia = 0
    AND quantidade_noite = 0;