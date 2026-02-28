-- ============================================================
-- MIGRATION: FIX CERTIFICATES REFERENCES & AUTOMATION
-- Growth Summit 2026
-- ============================================================
-- 1. Corrigir Referência da Tabela de Certificados
-- A migração anterior referenciou 'registrations' em vez de 'inscricoes_growth_experience'
DO $$ BEGIN -- Se a tabela de certificados já existe, vamos corrigir a FK
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'certificates'
        AND table_schema = 'public'
) THEN -- Remover a FK errada
ALTER TABLE public.certificates DROP CONSTRAINT IF EXISTS certificates_registration_id_fkey;
-- Tentar adicionar a FK correta para inscricoes_growth_experience
-- Primeiro verificamos se a tabela inscricoes_growth_experience existe
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'inscricoes_growth_experience'
        AND table_schema = 'public'
) THEN
ALTER TABLE public.certificates
ADD CONSTRAINT certificates_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE;
END IF;
END IF;
END $$;
-- 2. Trigger para Emissão Automática de Certificados no Check-in
-- Quando um participante faz check-in no evento pela primeira vez, emitimos o certificado de participação
CREATE OR REPLACE FUNCTION public.issue_certificate_on_checkin() RETURNS TRIGGER AS $$
DECLARE v_registration_id UUID;
v_user_name TEXT;
v_project_name TEXT;
BEGIN -- Só emitimos certificado automático para check-in do tipo 'event'
IF NEW.check_in_type != 'event' THEN RETURN NEW;
END IF;
-- Obter ID da inscrição e nome do usuário
SELECT id,
    nome INTO v_registration_id,
    v_user_name
FROM public.inscricoes_growth_experience
WHERE user_id = NEW.user_id
    AND project_id = NEW.project_id
LIMIT 1;
-- Se encontramos a inscrição
IF v_registration_id IS NOT NULL THEN -- Verificar se já existe certificado de evento para este projeto
IF NOT EXISTS (
    SELECT 1
    FROM public.certificates
    WHERE user_id = NEW.user_id
        AND project_id = NEW.project_id
        AND type = 'event'
) THEN -- Obter nome do projeto
SELECT name INTO v_project_name
FROM public.projects
WHERE id = NEW.project_id;
-- Inserir Certificado
-- O código do certificado será gerado pelo trigger set_certificate_code já existente
INSERT INTO public.certificates (
        project_id,
        user_id,
        registration_id,
        type,
        metadata
    )
VALUES (
        NEW.project_id,
        NEW.user_id,
        v_registration_id,
        'event',
        jsonb_build_object(
            'event_name',
            COALESCE(v_project_name, 'Growth Experience'),
            'session_title',
            'Certificado de Participação Geral',
            'userName',
            v_user_name,
            'issue_date',
            NOW()
        )
    );
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Criar o trigger na tabela de check_ins
DROP TRIGGER IF EXISTS trg_issue_certificate_on_checkin ON public.check_ins;
CREATE TRIGGER trg_issue_certificate_on_checkin
AFTER
INSERT ON public.check_ins FOR EACH ROW EXECUTE FUNCTION public.issue_certificate_on_checkin();