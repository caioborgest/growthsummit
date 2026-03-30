-- ============================================================
-- MIGRATION: Growth Experience PWA Final Stabilization
-- Date: 2026-03-30
-- ============================================================

-- 1. NOTIFICATIONS TABLE ENHANCEMENTS
DO $$ 
BEGIN 
    -- Add action_url for better navigation from notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE public.notifications ADD COLUMN action_url TEXT;
    END IF;

    -- Add type if missing or ensure standard types
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE public.notifications ADD COLUMN type TEXT DEFAULT 'info';
    END IF;
END $$;

-- 2. SUPPORT TICKETS ENHANCEMENTS
DO $$ 
BEGIN 
    -- Ensure project_id exists for scoped support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'project_id') THEN
        ALTER TABLE public.support_tickets ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
    END IF;

    -- Add whatsapp notification flag for future integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'notificado_via_whatsapp') THEN
        ALTER TABLE public.support_tickets ADD COLUMN notificado_via_whatsapp BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 3. FIX ACTIVITIES CHECK-IN SCHEMA
DO $$ 
BEGIN 
    -- Ensure check_in_at is the standard timestamp column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'check_ins_atividades' AND column_name = 'check_in_at') THEN
        ALTER TABLE public.check_ins_atividades ADD COLUMN check_in_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Ensure session_id is used instead of activity_id for consistency with programming
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'check_ins_atividades' AND column_name = 'session_id') THEN
        ALTER TABLE public.check_ins_atividades ADD COLUMN session_id UUID REFERENCES public.programacao_evento(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. HARDEN is_admin() FUNCTION
-- This version handles role detection from both App Metadata and User Metadata
-- without making recursive database calls that trigger RLS errors.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER 
SET search_path = public AS $$
SELECT COALESCE(
        (auth.jwt()->'app_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->>'role'),
        (auth.jwt()->'user_metadata'->'role'->>0), -- handles array if any
        ''
    ) IN ('admin', 'staff', 'superadmin');
$$;

-- 5. ENSURE SUPPORT TRIGGER EXISTS AND IS ROBUST
CREATE OR REPLACE FUNCTION public.notify_admins_on_support()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
    notif_title TEXT;
    notif_msg TEXT;
    target_project_id UUID;
BEGIN
    IF (TG_TABLE_NAME = 'support_tickets') THEN
        notif_title := 'Novo Chamado: ' || NEW.subject;
        notif_msg := 'Participante ' || NEW.name || ' abriu um chamado.';
        target_project_id := NEW.project_id;
    ELSIF (TG_TABLE_NAME = 'support_ticket_messages' AND NEW.is_admin = FALSE) THEN
        notif_title := 'Nova Mensagem no Suporte';
        notif_msg := 'Um participante respondeu em um chamado aberto.';
        SELECT project_id INTO target_project_id FROM public.support_tickets WHERE id = NEW.ticket_id;
    ELSE
        RETURN NEW;
    END IF;

    -- Create notification for all admins and staff
    -- We use a raw query to avoid RLS recursion during trigger execution
    FOR admin_record IN (
        SELECT id FROM public.users 
        WHERE role IN ('admin', 'staff', 'superadmin')
    ) LOOP
        INSERT INTO public.notifications (user_id, project_id, title, message, type, action_url)
        VALUES (admin_record.id, target_project_id, notif_title, notif_msg, 'info', '/admin/suporte');
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Re-apply triggers just in case
DROP TRIGGER IF EXISTS tr_notify_admin_new_ticket ON public.support_tickets;
CREATE TRIGGER tr_notify_admin_new_ticket
    AFTER INSERT ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_support();

DROP TRIGGER IF EXISTS tr_notify_admin_new_message ON public.support_ticket_messages;
CREATE TRIGGER tr_notify_admin_new_message
    AFTER INSERT ON public.support_ticket_messages
    FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_support();

-- 6. PERMISSIONS & RELOAD
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_ticket_messages TO authenticated;
GRANT ALL ON public.check_ins_atividades TO authenticated;

NOTIFY pgrst, 'reload schema';
