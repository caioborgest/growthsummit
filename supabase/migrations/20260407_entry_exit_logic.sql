-- Migration: Toggle Check-In/Check-Out Atomic
-- Description: Supports multiple entries and exits in the Growth Experience platform.

-- 1. Add log type to check_ins if needed, or use a specific column
-- We will use the 'method' or 'location' columns if needed, but let's add an 'action' column to check_ins for clarity.
ALTER TABLE public.check_ins ADD COLUMN IF NOT EXISTS action TEXT DEFAULT 'check-in';

-- 2. Create the toggle function
CREATE OR REPLACE FUNCTION public.toggle_registration_checkin_atomic(
    p_registration_id UUID,
    p_project_id UUID,
    p_action TEXT, -- 'check-in' or 'check-out'
    p_user_id UUID,
    p_ticket_number TEXT,
    p_operator_id UUID,
    p_location TEXT DEFAULT 'Entrada Principal',
    p_method TEXT DEFAULT 'qr_code'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_rows INTEGER;
    v_target_status BOOLEAN;
BEGIN
    -- Determine target status
    IF p_action = 'check-in' THEN
        v_target_status := TRUE;
    ELSIF p_action = 'check-out' THEN
        v_target_status := FALSE;
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_ACTION', 'message', 'Ação deve ser check-in ou check-out.');
    END IF;

    -- Validate participation rules
    DECLARE
        v_status TEXT;
        v_payment_status TEXT;
    BEGIN
        SELECT status, payment_status 
        INTO v_status, v_payment_status
        FROM public.growth_experience_registrations
        WHERE id = p_registration_id AND project_id = p_project_id;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Inscrição não encontrada.');
        END IF;

        IF v_status != 'active' AND p_action = 'check-in' THEN
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', 'Inscrição não está ativa (Status: ' || COALESCE(v_status, 'N/A') || ').');
        END IF;

        IF v_payment_status != 'paid' AND p_action = 'check-in' THEN
            RETURN jsonb_build_object('success', false, 'error', 'UNPAID', 'message', 'Inscrição não confirmada por falta de pagamento.');
        END IF;
    END;

    -- Update registration status
    UPDATE public.growth_experience_registrations
    SET checked_in = v_target_status,
        checked_in_at = CASE WHEN v_target_status THEN NOW() ELSE checked_in_at END,
        updated_at = NOW()
    WHERE id = p_registration_id
      AND project_id = p_project_id;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    IF v_updated_rows = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Inscrição não encontrada.');
    END IF;

    -- Insert log entry
    INSERT INTO public.check_ins (
        project_id, 
        registration_id, 
        user_id, 
        ticket_number, 
        timestamp, 
        location, 
        method, 
        operator_id,
        action
    ) VALUES (
        p_project_id, 
        p_registration_id, 
        p_user_id, 
        p_ticket_number, 
        NOW(), 
        COALESCE(p_location, CASE WHEN p_action = 'check-out' THEN 'Saída Evento' ELSE 'Entrada Evento' END), 
        COALESCE(p_method, 'qr_code'), 
        p_operator_id,
        p_action
    );

    RETURN jsonb_build_object(
        'success', true, 
        'registration_id', p_registration_id,
        'action', p_action,
        'checked_in', v_target_status
    );
END;
$$;

ALTER FUNCTION public.toggle_registration_checkin_atomic(UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.toggle_registration_checkin_atomic(UUID, UUID, TEXT, UUID, TEXT, UUID, TEXT, TEXT) TO authenticated, service_role;
