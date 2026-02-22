-- ============================================================
-- FIX: BREAKING RLS RECURSION ON USERS TABLE
-- Date: 2026-02-22
-- ============================================================
-- 1. Redefinir is_admin como plpgsql para evitar inlining e recursão
-- Além disso, retornar FALSE se o UID for nulo para evitar eval em tokens anônimos
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE is_adm BOOLEAN;
BEGIN -- Se não houver UID, não é admin
IF auth.uid() IS NULL THEN RETURN FALSE;
END IF;
-- Buscar role diretamente ignorando RLS (por ser SECURITY DEFINER)
SELECT (role IN ('admin', 'staff')) INTO is_adm
FROM public.users
WHERE id = auth.uid();
RETURN COALESCE(is_adm, FALSE);
END;
$$;
-- 2. Garantir que políticas antigas problemáticas sejam removidas
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer usuário" ON public.users;
DROP POLICY IF EXISTS "Users can see own record" ON public.users;
-- 3. Criar política de auto-leitura (CRUCIAL para o AuthContext funcionar)
-- Esta política NUNCA deve chamar is_admin() para evitar o loop
CREATE POLICY "Users can see own record" ON public.users FOR
SELECT USING (auth.uid() = id);
-- 4. Recriar política de Admin para ver outros usuários
-- Agora is_admin() é plpgsql, então não haverá inlining e o loop acaba
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR
SELECT USING (public.is_admin());
-- 5. Recriar política de Admin para atualizar
CREATE POLICY "Admins podem atualizar qualquer usuário" ON public.users FOR
UPDATE USING (public.is_admin());
-- 6. Garantir permissões de execução
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;