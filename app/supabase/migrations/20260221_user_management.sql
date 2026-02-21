-- Migration: User Management & Staff Roles
-- Date: 2026-02-21
-- Alter users table to add staff related columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS staff_role TEXT,
    ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;
-- Update role check constraint if needed
-- First drop existing constraint
DO $$ BEGIN
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
END $$;
-- Add updated constraint
ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
        role IN (
            'visitor',
            'participant',
            'mentor',
            'company',
            'startup',
            'sponsor',
            'admin',
            'staff',
            'speaker'
        )
    );
-- Create a view for staff management
CREATE OR REPLACE VIEW public.staff_view AS
SELECT u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.staff_role,
    u.avatar,
    u.created_at,
    p.company,
    p.position
FROM public.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.role IN ('admin', 'staff');
-- Enable RLS on the new columns for staff
CREATE POLICY "Admins can update all user roles" ON public.users FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Grant access
GRANT SELECT ON public.staff_view TO authenticated;