-- Fix Raffle RLS Policies
-- Use public.is_admin() instead of manual subquery to avoid recursion and support all admin roles (admin, staff, superadmin)

-- Fix raffles table
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage raffles" ON public.raffles;
CREATE POLICY "Admins can manage raffles" ON public.raffles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Fix raffle_participants table
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all participants" ON public.raffle_participants;
CREATE POLICY "Admins can view all participants" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- Ensure everyone can view open/completed raffles (already exists but ensuring it matches patterns)
DROP POLICY IF EXISTS "Everyone can view open raffles" ON public.raffles;
CREATE POLICY "Everyone can view open raffles" ON public.raffles
    FOR SELECT TO authenticated
    USING (status = 'open' OR status = 'completed' OR public.is_admin());
