-- ============================================================
-- Módulo de Certificados — Schema Completo
-- Autoria: Antigravity AI
-- Data: 2026-03-07
-- ============================================================
-- 1. Criação/Ajuste da Tabela de Certificados
CREATE TABLE IF NOT EXISTS public.certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'event',
    -- 'event', 'course', 'lecture', 'workshop'
    activity_name TEXT,
    code TEXT UNIQUE,
    -- Código de validação único
    status TEXT DEFAULT 'disponivel',
    metadata JSONB DEFAULT '{}'::jsonb,
    issue_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_certificados_project ON public.certificados(project_id);
CREATE INDEX IF NOT EXISTS idx_certificados_registration ON public.certificados(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificados_code ON public.certificados(code);
-- 3. Habilitar RLS
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
-- 4. Políticas de Segurança (RLS)
-- Administradores: Acesso total
CREATE POLICY "Admins have full access to certificados" ON public.certificados FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Participantes: Podem ver seus próprios certificados
CREATE POLICY "Participants can view their own certificates" ON public.certificados FOR
SELECT TO authenticated USING (
        registration_id IN (
            SELECT id
            FROM public.inscricoes_growth_experience
            WHERE user_id = auth.uid()
        )
    );
-- 5. Trigger para Atualização de timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS tr_certificados_updated_at ON public.certificados;
CREATE TRIGGER tr_certificados_updated_at BEFORE
UPDATE ON public.certificados FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- 6. Adição de coluna de metadata no projeto (caso não exista)
-- Nota: A maioria das instalações GX já tem essa coluna, mas aqui garantimos.
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
        AND column_name = 'metadata'
) THEN
ALTER TABLE public.projects
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
END IF;
END $$;
COMMENT ON TABLE public.certificados IS 'Tabela que armazena as emissões de certificados para participantes de eventos e atividades.';