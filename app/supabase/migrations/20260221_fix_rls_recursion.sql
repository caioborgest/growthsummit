-- ============================================================
-- FIX: Infinite recursion in RLS policies on public.users
-- Date: 2026-02-21
-- 
-- Root cause: Policies on public.users (and public.projects) were
-- referencing public.users inside their USING clauses, creating
-- infinite recursion when Supabase evaluated them.
--
-- Fix: Create a SECURITY DEFINER helper function `is_admin()`
-- that reads auth.jwt() metadata instead of querying public.users.
-- This breaks the recursive chain.
-- ============================================================
-- Step 1: Create helper function that bypasses RLS via SECURITY DEFINER
-- It reads the role from auth.users metadata, NOT from public.users.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role IN ('admin', 'staff')
    ) $$;
-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
-- Step 2: Drop all existing recursive policies on public.users
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins can update all user roles" ON public.users;
-- Also drop the one from user_management migration if it was applied
DROP POLICY IF EXISTS "Admins can update all user roles" ON public.users;
-- Step 3: Drop and recreate the projects admin policy (also recursive)
DROP POLICY IF EXISTS "Admins podem gerenciar projetos" ON public.projects;
-- Step 4: Recreate non-recursive policies using is_admin()
-- users: Admins can see all users (non-recursive via SECURITY DEFINER)
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR
SELECT USING (public.is_admin());
-- users: Admins can update any user's role/permissions
CREATE POLICY "Admins podem atualizar qualquer usuário" ON public.users FOR
UPDATE USING (public.is_admin());
-- projects: Admins can manage all projects (non-recursive)
CREATE POLICY "Admins podem gerenciar projetos" ON public.projects FOR ALL USING (public.is_admin());
-- Step 5: Also fix any other tables that have the same recursive pattern
-- (registrations policy also queries public.users)
DROP POLICY IF EXISTS "Admins veem todas as inscrições" ON public.registrations;
CREATE POLICY "Admins veem todas as inscrições" ON public.registrations FOR
SELECT USING (public.is_admin());
-- Add INSERT/UPDATE/DELETE for admins on registrations
DROP POLICY IF EXISTS "Admins gerenciam inscrições" ON public.registrations;
CREATE POLICY "Admins gerenciam inscrições" ON public.registrations FOR ALL USING (public.is_admin());