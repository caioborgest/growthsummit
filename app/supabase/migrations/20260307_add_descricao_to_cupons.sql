-- ============================================================
-- Add missing 'descricao' column to cupons_parceria_social
-- Date: 2026-03-07
-- Objective: Fix "Could not find column 'descricao' in schema cache" error
-- ============================================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'cupons_parceria_social'
        AND column_name = 'descricao'
) THEN
ALTER TABLE public.cupons_parceria_social
ADD COLUMN descricao TEXT;
COMMENT ON COLUMN public.cupons_parceria_social.descricao IS 'Observações internas e detalhes da parceria do cupom';
RAISE NOTICE 'Coluna descricao adicionada com sucesso à tabela cupons_parceria_social';
ELSE RAISE NOTICE 'A coluna descricao já existe na tabela cupons_parceria_social';
END IF;
END $$;