-- ============================================
-- MIGRATION: ADD MISSING COLUMNS FOR QR CHECK-IN
-- Date: 2026-03-01
-- ============================================
-- 1. Inscrições (Growth Experience)
-- Adicionando colunas de controle de check-in e QR Code que faltavam na unificação
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS qr_code TEXT,
    ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMP WITH TIME ZONE;
-- 2. Garantir que as tabelas específicas usem UUIDs consistentes
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN project_id
SET NOT NULL;
-- 3. Programação do Evento (Campos extras de sincronização)
ALTER TABLE public.programacao_evento
ADD COLUMN IF NOT EXISTS track VARCHAR(100),
    ADD COLUMN IF NOT EXISTS day INTEGER DEFAULT 1;
-- 4. Rodada B2B (Mapeamento de nomes para o useData)
-- Se a tabela já existir com campos PT-BR, garantimos que o select funcione ou adicionamos aliases
-- Mas aqui apenas garantimos as colunas básicas de controle
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN IF NOT EXISTS user_name TEXT,
    ADD COLUMN IF NOT EXISTS company_name TEXT;
-- 5. Atualizar políticas RLS para permitir leitura pública se o projeto for ativo
-- Já fizemos isso na migração anterior de RLS, mas garantimos aqui para estas tabelas específicas
ALTER TABLE public.programacao_evento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programacao_evento_public_read" ON public.programacao_evento;
CREATE POLICY "programacao_evento_public_read" ON public.programacao_evento FOR
SELECT USING (true);
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_public_read" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_read" ON public.mentores_growth_experience FOR
SELECT USING (true);