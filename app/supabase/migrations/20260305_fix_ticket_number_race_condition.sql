-- ============================================================
-- FASE 3: ITEM 20 — Corrigir generate_ticket_number
-- Data: 2026-03-05 | Auditoria 360°
-- Problema: Race condition — COUNT(*)+1 sem lock gera tickets duplicados
-- Solução: SELECT MAX() FOR UPDATE garante atomicidade
-- ============================================================
-- ============================================================
-- 1. FUNÇÃO CORRIGIDA: generate_ticket_number
--    Usa SELECT MAX() ... FOR UPDATE para evitar duplicatas
--    quando múltiplas inscrições chegam simultaneamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_ticket_number() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_sequence INTEGER;
v_prefix TEXT;
BEGIN -- Obter o próximo número de sequência com LOCK pessimista
-- FOR UPDATE impede que outra transação concurrent leia o mesmo MAX()
SELECT COALESCE(
        MAX(
            CAST(SPLIT_PART(ticket_number, '-', 2) AS INTEGER)
        ),
        0
    ) + 1 INTO v_sequence
FROM public.registrations
WHERE project_id = NEW.project_id FOR
UPDATE;
-- Prefixo baseado no tipo de inscrição
v_prefix := CASE
    WHEN NEW.ticket_type = 'vip' THEN 'VIP'
    WHEN NEW.ticket_type = 'pro' THEN 'PRO'
    ELSE 'STD'
END;
-- Formatar: STD-0001, PRO-0042, VIP-0003
NEW.ticket_number := format('%s-%04s', v_prefix, v_sequence);
RETURN NEW;
END;
$$;
ALTER FUNCTION public.generate_ticket_number() OWNER TO postgres;
-- Recriar a trigger se existir
DROP TRIGGER IF EXISTS trg_generate_ticket_number ON public.registrations;
CREATE TRIGGER trg_generate_ticket_number BEFORE
INSERT ON public.registrations FOR EACH ROW
    WHEN (
        NEW.ticket_number IS NULL
        OR NEW.ticket_number = ''
    ) EXECUTE FUNCTION public.generate_ticket_number();
-- ============================================================
-- 2. VERIFICAÇÃO
-- ============================================================
SELECT trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND event_object_table = 'registrations'
    AND trigger_name = 'trg_generate_ticket_number';
-- FIM DO SCRIPT