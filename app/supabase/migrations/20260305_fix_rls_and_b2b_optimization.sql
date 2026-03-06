-- ============================================================
-- MIGRATION: FIX RLS AND B2B QUERY OPTIMIZATIONS
-- Date: 2026-03-05
-- ============================================================
-- 1. Melhorar RLS em inscricoes_growth_experience
-- Substituir subquery no auth.users por leitura direta do JWT (mais rápido e seguro)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN DROP POLICY IF EXISTS "inscricoes_own_select" ON public.inscricoes_growth_experience;
CREATE POLICY "inscricoes_own_select" ON public.inscricoes_growth_experience FOR
SELECT USING (
        user_id = auth.uid()
        OR email = (auth.jwt()->>'email')
    );
RAISE NOTICE 'OK: RLS otimizado em inscricoes_growth_experience';
END IF;
END $$;
-- 2. Garantir que a tabela rodada_negocios_b2b tenha os campos necessários para consultas admin
-- Algumas views administrativas podem estar tentando acessar campos que faltavam
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'rodada_negocios_b2b'
        AND table_schema = 'public'
) THEN -- Adicionar campos se não existirem (idempotente)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'cnpj'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN cnpj TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'porte'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN porte TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'faturamento_anual'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN faturamento_anual DECIMAL;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'rodada_negocios_b2b'
        AND column_name = 'numero_funcionarios'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN numero_funcionarios INTEGER;
END IF;
RAISE NOTICE 'OK: Campos adicionais verificados em rodada_negocios_b2b';
END IF;
END $$;
-- 3. Corrigir a função is_admin() para ser ainda mais robusta
-- Garante que o role venha de qualquer fonte de metadados
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        (auth.jwt()->>'role'),
        -- Fallback para role direto se houver
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;
-- 4. Criar índices faltantes para performance em filtros de admin
CREATE INDEX IF NOT EXISTS idx_b2b_project_status ON public.rodada_negocios_b2b(project_id, status);
CREATE INDEX IF NOT EXISTS idx_startups_project_status ON public.startups_arena_pitch(project_id, status);
CREATE INDEX IF NOT EXISTS idx_mentores_project_status ON public.mentores_growth_experience(project_id, status);