-- Migration: Calibrate Registration Goals to Count (Units)
-- Date: 2026-03-06
-- Description: Ensures goal_registrations is treated as a quantity/count of people, not revenue.
-- 1. Garante que as colunas existam (idempotente)
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS goal_revenue DECIMAL(15, 2) DEFAULT 616000.00,
    ADD COLUMN IF NOT EXISTS goal_sponsorship DECIMAL(15, 2) DEFAULT 200000.00,
    ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 300;
-- 2. Correção de Dados: 
-- Se goal_registrations estiver com valores muito altos (ex: > 10.000), 
-- provavelmente era um valor monetário e precisa ser resetado para uma meta de pessoas.
UPDATE public.projects
SET goal_registrations = 300
WHERE goal_registrations > 10000;
-- 3. Ajuste fino para projetos conhecidos (opcional, ajuste conforme necessário)
-- Exemplo: Edição Triunfo
UPDATE public.projects
SET goal_registrations = 400,
    goal_revenue = 250000
WHERE slug LIKE '%triunfo%';
-- Exemplo: Edição Petrolina
UPDATE public.projects
SET goal_registrations = 300,
    goal_revenue = 180000
WHERE slug LIKE '%petrolina%';
-- 4. Garante que não fiquem valores nulos
UPDATE public.projects
SET goal_revenue = COALESCE(goal_revenue, 616000.00),
    goal_sponsorship = COALESCE(goal_sponsorship, 200000.00),
    goal_registrations = COALESCE(goal_registrations, 300)
WHERE goal_revenue IS NULL
    OR goal_sponsorship IS NULL
    OR goal_registrations IS NULL;