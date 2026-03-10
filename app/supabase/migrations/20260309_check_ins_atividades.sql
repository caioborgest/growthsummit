-- ============================================================
-- TABLE: check_ins_atividades
-- Description: Records attendance for specific event sessions (lectures, workshops, etc.)
-- Date: 2026-03-09
-- ============================================================
CREATE TABLE IF NOT EXISTS public.check_ins_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.programacao_evento(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    check_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_in_type TEXT DEFAULT 'qr',
    -- 'qr' or 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure a user can only check in once per session
    UNIQUE(session_id, registration_id)
);
-- Enable RLS
ALTER TABLE public.check_ins_atividades ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "check_ins_atividades_admin_all" ON public.check_ins_atividades;
CREATE POLICY "check_ins_atividades_admin_all" ON public.check_ins_atividades FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "check_ins_atividades_own_select" ON public.check_ins_atividades;
CREATE POLICY "check_ins_atividades_own_select" ON public.check_ins_atividades FOR
SELECT USING (user_id = auth.uid());
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cia_project_id ON public.check_ins_atividades(project_id);
CREATE INDEX IF NOT EXISTS idx_cia_session_id ON public.check_ins_atividades(session_id);
CREATE INDEX IF NOT EXISTS idx_cia_registration_id ON public.check_ins_atividades(registration_id);
CREATE INDEX IF NOT EXISTS idx_cia_user_id ON public.check_ins_atividades(user_id);
-- Trigger for updated_at (optional if we only have created_at)
-- But keeping it standard
COMMENT ON TABLE public.check_ins_atividades IS 'Registro de presença em atividades específicas (palestras, workshops) do Growth Experience.';