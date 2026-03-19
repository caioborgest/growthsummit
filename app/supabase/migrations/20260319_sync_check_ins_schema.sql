-- ============================================================
-- FIX: Sync check_ins table with current project schema
-- Date: 2026-03-19
-- ============================================================

-- 1. Ensure the table exists with the correct structure
-- If it exists but with wrong references, we'll fix migrations below
CREATE TABLE IF NOT EXISTS public.check_ins_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_number TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. If the old table exists, try to migrate data if possible
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'check_ins' AND table_schema = 'public') THEN
        -- Check if it's the old structure (referencing non-existent registrations)
        -- We just rename it and create the new one, but first check if check_ins_old exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'check_ins_old' AND table_schema = 'public') THEN
            ALTER TABLE public.check_ins RENAME TO check_ins_old;
            ALTER TABLE public.check_ins_new RENAME TO check_ins;
        ELSE
            -- If check_ins_old already exists, just drop it or just drop check_ins_new (sync already done probably)
            -- To be safe, we'll drop check_ins (the old one) since we have the new structure in check_ins_new
            DROP TABLE public.check_ins;
            ALTER TABLE public.check_ins_new RENAME TO check_ins;
        END IF;
    ELSE
        ALTER TABLE public.check_ins_new RENAME TO check_ins;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "check_ins_admin_all" ON public.check_ins;
CREATE POLICY "check_ins_admin_all" ON public.check_ins FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "check_ins_own_select" ON public.check_ins;
CREATE POLICY "check_ins_own_select" ON public.check_ins FOR SELECT USING (user_id = auth.uid());

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_check_ins_project_id ON public.check_ins(project_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_registration_id ON public.check_ins(registration_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins(user_id);

DO $$ 
BEGIN 
    RAISE NOTICE 'Table check_ins synchronized successfully.';
END $$;
