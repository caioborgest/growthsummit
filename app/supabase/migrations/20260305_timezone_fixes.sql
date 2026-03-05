-- ============================================================
-- FASE 3: ITEM 17 — Ajuste de Fuso Horário (TIMESTAMPTZ)
-- Objetivo: Garantir que datas de auditoria e registro usem TIMESTAMPTZ
-- Nota: Colunas de "TIME" (hora do dia) permanecem como TIME, pois 
-- não possuem componente de data para conversão automática.
-- ============================================================
-- 1. Tabela de Inscrições
-- Garantimos que created_at e updated_at sejam TIMESTAMPTZ
DO $$ BEGIN -- created_at
IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) THEN -- Se for timestamp sem zone, converte. Se for TIME, ignora.
IF (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) != 'time'::regtype
AND (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'created_at'
) != 'time with time zone'::regtype THEN
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN created_at
SET DEFAULT now();
END IF;
END IF;
-- updated_at
IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'updated_at'
) THEN IF (
    SELECT atttypid::regtype
    FROM pg_attribute
    WHERE attrelid = 'public.inscricoes_growth_experience'::regclass
        AND attname = 'updated_at'
) != 'time'::regtype THEN
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
ALTER TABLE public.inscricoes_growth_experience
ALTER COLUMN updated_at
SET DEFAULT now();
END IF;
END IF;
END $$;
-- 2. Tabela de Auditoria
-- Esta tabela DEVE ser TIMESTAMPTZ para rastreio global
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'public.audit_logs'::regclass
        AND attname = 'created_at'
) THEN
ALTER TABLE public.audit_logs
ALTER COLUMN created_at TYPE TIMESTAMPTZ;
ALTER TABLE public.audit_logs
ALTER COLUMN created_at
SET DEFAULT now();
END IF;
END $$;
-- 3. Função auxiliar para converter para Horário de Brasília
-- Utilizada em relatórios e no frontend se necessário
CREATE OR REPLACE FUNCTION public.to_brasilia(ts TIMESTAMPTZ) RETURNS TIMESTAMP AS $$ BEGIN RETURN ts AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- NOTA sobre programacao_evento:
-- As colunas start_time e end_time nesta tabela são do tipo TIME (hora do dia).
-- Elas não devem ser convertidas para TIMESTAMPTZ pois não possuem uma data associada.
-- A conversão de fuso horário para exibição deve ser feita no frontend usando dayjs.