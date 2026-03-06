-- Migration: Add invested amount to Empresa Incentivadora
-- Date: 2026-03-06
-- Description: Adds valor_investido column to inscricoes_empresas_incentivadoras table.
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS valor_investido DECIMAL(15, 2) DEFAULT 0.00;
-- Optional: Update existing records based on the business logic if they are 0
-- (179.99 per person at night, with 10% discount if >= 10 people)
UPDATE public.inscricoes_empresas_incentivadoras
SET valor_investido = (
        CASE
            WHEN quantidade_noite >= 10 THEN (quantidade_noite * 179.99 * 0.9)
            ELSE (quantidade_noite * 179.99)
        END
    )
WHERE valor_investido = 0
    AND quantidade_noite > 0;