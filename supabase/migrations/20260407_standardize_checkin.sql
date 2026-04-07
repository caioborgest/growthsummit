-- Migration: Add check-in columns and RLS policy for staff
-- Description: Standardizes the check-in module for registrations table.

-- 1. Add columns to registrations if they don't exist
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS checked_in boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamp with time zone;

-- 2. Ensure RLS is enabled
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing staff check-in policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "staff_checkin_registrations" ON public.registrations;

-- 4. Create policy: Staff/Admin can update checked_in status
CREATE POLICY "staff_checkin_registrations"
ON public.registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff', 'organizer')
  )
)
WITH CHECK (true);

-- 5. Add index for performance on check-in queries
CREATE INDEX IF NOT EXISTS idx_registrations_checked_in ON public.registrations(checked_in) WHERE checked_in = true;
CREATE INDEX IF NOT EXISTS idx_registrations_project_id_id ON public.registrations(project_id, id);
