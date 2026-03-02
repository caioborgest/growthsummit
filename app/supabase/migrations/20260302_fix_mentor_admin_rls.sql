-- ============================================================
-- MIGRATION: ADD ADMIN POLICIES FOR MENTORS
-- Date: 2026-03-02
-- ============================================================
-- 1. ADICIONAR POLÍTICAS DE UPDATE E DELETE PARA ADMINS EM MENTORES
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentores_growth_experience'
        AND table_schema = 'public'
) THEN -- UPDATE Policy
DROP POLICY IF EXISTS "mentores_admin_update" ON public.mentores_growth_experience;
CREATE POLICY "mentores_admin_update" ON public.mentores_growth_experience FOR
UPDATE USING (public.is_admin());
-- DELETE Policy
DROP POLICY IF EXISTS "mentores_admin_delete" ON public.mentores_growth_experience;
CREATE POLICY "mentores_admin_delete" ON public.mentores_growth_experience FOR DELETE USING (public.is_admin());
-- Garante que o status 'aprovado' e 'rejeitado' sejam aceitos se houver check constraint
-- (Apenas nota: se houver check constraint, ela deve permitir esses valores)
END IF;
END $$;
-- 2. ADICIONAR POLÍTICAS PARA MENTORIAS AGENDADAS (Admin Full Access)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'mentorias_agendadas'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentorias_public_insert" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_public_insert" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mentorias_admin_all" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_admin_all" ON public.mentorias_agendadas FOR ALL USING (public.is_admin());
DROP POLICY IF EXISTS "mentorias_public_read" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_public_read" ON public.mentorias_agendadas FOR
SELECT USING (true);
END IF;
END $$;