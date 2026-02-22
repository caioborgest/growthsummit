-- =====================================================================
-- 20260222_fix_trigger.sql
-- Corrige a função de trigger update_updated_at_column().
--
-- PROBLEMA: A função existente no banco usa NEW.data_atualizacao
-- mas as tabelas têm a coluna chamada updated_at → erro 42703.
--
-- SOLUÇÃO: Substituir a função para usar updated_at (padrão correto).
-- Idempotente — CREATE OR REPLACE não falha se a função já existir.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$;
-- =====================================================================
-- Após corrigir a função, execute o script fix_forms_final.sql
-- para criar as tabelas e políticas RLS do Growth Experience.
-- =====================================================================