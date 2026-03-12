
-- ============================================================
-- MIGRATION: B2B INTEGRITY TRIGGERS (CONFLITOS DE AGENDA)
-- Data: 2026-03-11
-- ============================================================

-- 1. Funo de validao para a tabela b2b_meetings (Manual Admin)
CREATE OR REPLACE FUNCTION public.fn_validate_b2b_meeting_integrity() 
RETURNS TRIGGER AS $$
DECLARE
    new_end TIMESTAMPTZ;
BEGIN
    -- Determina o fim da reunio (default 20 min)
    new_end := NEW.scheduled_at + (COALESCE(NEW.duration_minutes, 20) || ' minutes')::interval;

    -- A. Impede agendamento com a mesma empresa
    IF NEW.company_a_id = NEW.company_b_id THEN
        RAISE EXCEPTION 'Uma empresa no pode agendar uma reunio consigo mesma.';
    END IF;

    -- B. Verifica conflito de horário para as empresas selecionadas
    IF EXISTS (
        SELECT 1 FROM public.b2b_meetings
        WHERE id <> NEW.id
        AND status NOT IN ('cancelled', 'no_show')
        AND (
            company_a_id IN (NEW.company_a_id, NEW.company_b_id)
            OR company_b_id IN (NEW.company_a_id, NEW.company_b_id)
        )
        AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
            tsrange(NEW.scheduled_at, new_end)
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: Uma das empresas j possui compromisso neste intervalo.';
    END IF;

    -- C. Verifica conflito de mesa (se table_number estiver preenchido)
    IF NEW.table_number IS NOT NULL AND NEW.table_number <> '' THEN
        IF EXISTS (
            SELECT 1 FROM public.b2b_meetings
            WHERE id <> NEW.id
            AND status NOT IN ('cancelled', 'no_show')
            AND table_number = NEW.table_number
            AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
                tsrange(NEW.scheduled_at, new_end)
        ) THEN
            RAISE EXCEPTION 'Conflito de mesa: A mesa % j est ocupada neste horrio.', NEW.table_number;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Atribuio do Trigger para b2b_meetings
DROP TRIGGER IF EXISTS trigger_b2b_meeting_integrity ON public.b2b_meetings;
CREATE TRIGGER trigger_b2b_meeting_integrity
BEFORE INSERT OR UPDATE ON public.b2b_meetings
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_b2b_meeting_integrity();


-- 3. Atualizar a funo existente de b2b_appointments para incluir checagem de mesa
-- (Complementando a migrao anterior 20260311_rbac_lgpd_and_schedule_fix)
CREATE OR REPLACE FUNCTION public.validate_b2b_appointment() 
RETURNS TRIGGER AS $$
DECLARE
    new_end TIMESTAMPTZ;
BEGIN
    new_end := NEW.scheduled_at + (COALESCE(NEW.duration_minutes, 20) || ' minutes')::interval;

    -- no permite agendar com horrio anterior ao presente
    IF NEW.scheduled_at < now() AND TG_OP = 'INSERT' THEN
        RAISE EXCEPTION 'Horrio no pode ficar no passado';
    END IF;

    -- verifica sobreposio para as empresas
    IF EXISTS (
        SELECT 1
        FROM public.b2b_appointments a
        WHERE a.id <> NEW.id
          AND a.status NOT IN ('cancelled', 'no_show')
          AND (
                a.company_a_id = NEW.company_a_id
             OR a.company_b_id = NEW.company_a_id
             OR a.company_a_id = NEW.company_b_id
             OR a.company_b_id = NEW.company_b_id
          )
          AND tsrange(a.scheduled_at, a.scheduled_at + (COALESCE(a.duration_minutes, 20) || ' minutes')::interval) &&
              tsrange(NEW.scheduled_at, new_end)
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: Uma das empresas j possui compromisso no Tinder B2B.';
    END IF;

    -- verifica conflito de mesa
    IF NEW.table_number IS NOT NULL AND NEW.table_number <> '' THEN
        IF EXISTS (
            SELECT 1 FROM public.b2b_appointments
            WHERE id <> NEW.id
            AND status NOT IN ('cancelled', 'no_show')
            AND table_number = NEW.table_number
            AND tsrange(scheduled_at, scheduled_at + (COALESCE(duration_minutes, 20) || ' minutes')::interval) &&
                tsrange(NEW.scheduled_at, new_end)
        ) THEN
            RAISE EXCEPTION 'Conflito de mesa: A mesa % j est ocupada no Tinder B2B.', NEW.table_number;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
