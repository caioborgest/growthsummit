-- ============================================================
-- MIGRATION: QR CODE CHECK-IN & CERTIFICATION SYSTEM
-- ============================================================
-- 1. Melhorar a tabela de check-ins para suportar sessões específicas
ALTER TABLE public.check_ins
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS check_in_type TEXT DEFAULT 'event' CHECK (check_in_type IN ('event', 'session')),
    DROP CONSTRAINT IF EXISTS check_ins_method_check,
    ADD CONSTRAINT check_ins_method_check CHECK (
        method IN (
            'qr_code',
            'manual',
            'rfid',
            'facial',
            'self_scan'
        )
    );
-- 2. Criar tabela de certificados
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    -- NULL se for certificado do evento geral
    type TEXT NOT NULL CHECK (
        type IN ('event', 'course', 'lecture', 'workshop')
    ),
    code TEXT UNIQUE NOT NULL,
    -- Código de validação único
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0,
    -- Metadados para o template
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_check_ins_session ON public.check_ins(session_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(code);
-- 4. RLS para Certificados
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver seus próprios certificados" ON public.certificates FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins podem gerenciar certificados" ON public.certificates FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'staff')
    )
);
-- 5. Função para gerar código de certificado único
CREATE OR REPLACE FUNCTION generate_certificate_code() RETURNS TRIGGER AS $$ BEGIN NEW.code := UPPER(
        SUBSTRING(
            REPLACE(uuid_generate_v4()::TEXT, '-', ''),
            1,
            12
        )
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_certificate_code BEFORE
INSERT ON public.certificates FOR EACH ROW EXECUTE FUNCTION generate_certificate_code();
-- 6. Trigger de update
CREATE TRIGGER update_certificates_updated_at BEFORE
UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();