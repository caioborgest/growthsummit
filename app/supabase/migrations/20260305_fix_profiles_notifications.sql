-- Fix Database Schema for Profiles and Notifications
-- Ensure consistency for Mentor Profile Updates
-- 1. Create PROFILES table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company TEXT,
    position TEXT,
    bio TEXT,
    website TEXT,
    linkedin TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Brasil',
    birth_date DATE,
    gender TEXT,
    cpf TEXT,
    cnpj TEXT,
    newsletter_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);
-- Ensure RLS is enabled and set correctly for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Profiles are editable by owner" ON public.profiles;
CREATE POLICY "Profiles are editable by owner" ON public.profiles FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
CREATE POLICY "Admins can see all profiles" ON public.profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
-- 2. Create NOTIFICATIONS table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Ensure the column is named 'read' even if the table was created with 'is_read'
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
    END IF;
END $$;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
CREATE POLICY "Users can see their own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);
-- 3. Ensure users table has consistent columns
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
        AND column_name = 'avatar_url'
) THEN
ALTER TABLE public.users
    RENAME COLUMN avatar TO avatar_url;
END IF;
EXCEPTION
WHEN OTHERS THEN -- If neither avatar nor avatar_url exist, or other error
END $$;
-- 4. Seed some initial notifications for the test mentor (if user exists)
DO $$
DECLARE
    v_target_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_target_user_id) THEN
        INSERT INTO public.notifications (user_id, title, message, type, created_at)
        VALUES (
                v_target_user_id,
                'Nova Mentoria!',
                'Um novo participante se inscreveu para sua mentoria.',
                'success',
                now() - interval '5 minutes'
            ),
            (
                v_target_user_id,
                'Agenda Confirmada',
                'Seu cronograma de mentorias para hoje está pronto.',
                'info',
                now() - interval '1 hour'
            ) ON CONFLICT DO NOTHING;
    END IF;
END $$;