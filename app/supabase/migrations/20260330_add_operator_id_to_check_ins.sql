-- ============================================================
-- MIGRATION: Add operator_id to check-in tables for auditing
-- Description: Enables tracking which staff member performed the accreditation
-- Date: 2026-03-30
-- ============================================================

-- 1. Add operator_id to check_ins
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'check_ins' AND column_name = 'operator_id') THEN
        ALTER TABLE public.check_ins ADD COLUMN operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Add operator_id to check_ins_atividades
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'check_ins_atividades' AND column_name = 'operator_id') THEN
        ALTER TABLE public.check_ins_atividades ADD COLUMN operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Update comments
COMMENT ON COLUMN public.check_ins.operator_id IS 'ID do membro da equipe (admin/staff) que realizou o credenciamento.';
COMMENT ON COLUMN public.check_ins_atividades.operator_id IS 'ID do membro da equipe (admin/staff) que registrou a presença na atividade.';

-- 4. Ensure RLS allows admins/staff to see these columns (already covered by is_admin() policies)
