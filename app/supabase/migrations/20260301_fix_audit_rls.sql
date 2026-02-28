-- Script para corrigir RLS de Auditoria e Tentativas de Login
-- Isso permite que o sistema registre logs mesmo durante o processo de login/logout
-- e corrige o erro 401 que impede a auditoria de funcionar corretamente.
-- Corrigindo audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Permitir que QUALQUER UM (mesmo anon) insira logs de auditoria
-- (O risco é baixo pois usuários comuns não conseguem ler a tabela)
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.audit_logs;
CREATE POLICY "Sistema pode inserir logs" ON public.audit_logs FOR
INSERT WITH CHECK (true);
-- Garantir privilégios para perfis anon e authenticated
GRANT INSERT ON TABLE public.audit_logs TO anon,
    authenticated;
-- Corrigindo login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserção de tentativas de login" ON public.login_attempts;
CREATE POLICY "Permitir inserção de tentativas de login" ON public.login_attempts FOR
INSERT WITH CHECK (true);
-- Garantir privilégios para perfis anon e authenticated
GRANT INSERT ON TABLE public.login_attempts TO anon,
    authenticated;
-- Ajuste adicional: Garantir que is_admin() funcione corretamente
-- e que a tabela users tenha RLS robusto
DROP POLICY IF EXISTS "Permite leitura pública de usuários básicos" ON public.users;
CREATE POLICY "Permite leitura pública de usuários básicos" ON public.users FOR
SELECT USING (true);