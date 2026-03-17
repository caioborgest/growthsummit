-- ============================================================
-- ADD: increment_session_count and decrement_session_count RPCs
-- Date: 2026-03-17
-- ============================================================

-- Function to increment registered_count in programacao_evento
CREATE OR REPLACE FUNCTION public.increment_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.programacao_evento
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = session_id;
END;
$$;

-- Function to decrement registered_count in programacao_evento
CREATE OR REPLACE FUNCTION public.decrement_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.programacao_evento
    SET registered_count = GREATEST(0, COALESCE(registered_count, 0) - 1)
    WHERE id = session_id;
END;
$$;

-- Also add versions for the standard 'sessions' table just in case
CREATE OR REPLACE FUNCTION public.increment_standard_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.sessions
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_standard_session_count(session_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
    UPDATE public.sessions
    SET registered_count = GREATEST(0, COALESCE(registered_count, 0) - 1)
    WHERE id = session_id;
END;
$$;
