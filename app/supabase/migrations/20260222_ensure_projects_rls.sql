-- ============================================================
-- Política RLS para permitir leitura pública de projetos ativos
-- (já deve existir, mas garantindo idempotência)
-- ============================================================
-- Garantir que projetos ativos sejam visíveis para todos (incluindo anônimos)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'projects'
        AND policyname = 'Projetos ativos são visíveis para todos'
) THEN CREATE POLICY "Projetos ativos são visíveis para todos" ON public.projects FOR
SELECT USING (status = 'active');
END IF;
END $$;
-- Política para leitura de qualquer projeto (admin/staff)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'projects'
        AND policyname = 'Admins podem gerenciar projetos'
) THEN CREATE POLICY "Admins podem gerenciar projetos" ON public.projects FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'staff')
    )
);
END IF;
END $$;
-- Verificar que o projeto está ativo
UPDATE public.projects
SET status = 'active',
    updated_at = NOW()
WHERE slug = 'ge-triunfo-2026'
    AND status <> 'active';
-- Status final
SELECT id,
    name,
    slug,
    status
FROM public.projects
WHERE slug = 'ge-triunfo-2026';