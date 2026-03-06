-- Final Repair and Update Migration for Empresas Incentivadoras
-- Date: 2026-03-06
-- Description: Ensures all necessary columns exist (quantidade_dia, quantidade_noite, valor_investido) 
-- and initializes the invested amount based on participation.
-- 1. Garante colunas de quantidades (necessárias para o cálculo e rankings)
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS quantidade_dia INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quantidade_noite INTEGER NOT NULL DEFAULT 0;
-- 2. Garante a coluna de valor investido
ALTER TABLE public.inscricoes_empresas_incentivadoras
ADD COLUMN IF NOT EXISTS valor_investido DECIMAL(15, 2) DEFAULT 0.00;
-- 3. Atualização de dados antigos (Legacy Data Fix)
-- Se as novas colunas de quantidades estiverem vazias, usa a equipe total como base
UPDATE public.inscricoes_empresas_incentivadoras
SET quantidade_dia = quantidade_equipe,
    quantidade_noite = quantidade_equipe
WHERE quantidade_dia = 0
    AND quantidade_noite = 0;
-- 4. Cálculo do valor investido baseado na regra de negócio:
-- R$ 179,99 por pessoa na programação noturna. 
-- Desconto de 10% se o grupo noturno for >= 10 pessoas.
UPDATE public.inscricoes_empresas_incentivadoras
SET valor_investido = (
        CASE
            WHEN quantidade_noite >= 10 THEN (quantidade_noite * 179.99 * 0.9)
            ELSE (quantidade_noite * 179.99)
        END
    )
WHERE valor_investido = 0
    AND quantidade_noite > 0;