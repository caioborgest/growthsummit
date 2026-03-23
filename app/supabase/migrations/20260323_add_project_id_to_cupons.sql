-- ============================================================
-- Add missing 'project_id' column to cupons_parceria_social
-- Date: 2026-03-23
-- Objective: Fix PGRST204 "Could not find column project_id in schema cache"
-- ============================================================

DO $$ 
BEGIN 
    -- 1. Check if the column project_id exists in cupons_parceria_social
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cupons_parceria_social'
            AND column_name = 'project_id'
    ) THEN
        ALTER TABLE public.cupons_parceria_social
        ADD COLUMN project_id UUID REFERENCES public.projects(id);
        
        COMMENT ON COLUMN public.cupons_parceria_social.project_id IS 'ID do projeto ao qual este cupom pertence';
        
        -- Optional: Create an index for faster filtering
        CREATE INDEX IF NOT EXISTS idx_cupons_parceria_social_project ON public.cupons_parceria_social(project_id);
        
        RAISE NOTICE 'Coluna project_id adicionada com sucesso à tabela cupons_parceria_social';
    ELSE 
        RAISE NOTICE 'A coluna project_id já existe na tabela cupons_parceria_social';
    END IF;

    -- 2. Ensure Row Level Security is enabled and configured correctly
    ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;

    -- Cleanup old policies if they exist
    DROP POLICY IF EXISTS "cupons_admin_all" ON public.cupons_parceria_social;
    DROP POLICY IF EXISTS "cupons_public_read" ON public.cupons_parceria_social;

    -- Admin/Staff can do anything
    CREATE POLICY "cupons_admin_all" ON public.cupons_parceria_social
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

    -- Authenticated users (participants) can read to validate coupons
    CREATE POLICY "cupons_public_read" ON public.cupons_parceria_social
    FOR SELECT USING (true);

    RAISE NOTICE 'RLS policies updated for cupons_parceria_social';

END $$;

