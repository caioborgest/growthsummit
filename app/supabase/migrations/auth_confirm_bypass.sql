-- ============================================================
-- MANUAL EMAIL CONFIRMATION BYPASS
-- Use this ONLY if you are getting "Email not confirmed" error
-- ============================================================

-- 1. Confirma o e-mail do seu usuário admin atual
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW(),
    last_sign_in_at = NOW()
WHERE email = 'projetos@cbxgrowth.com.br'; -- Ou coloque o seu e-mail aqui

-- 2. (Opcional) Desativar confirmação de e-mail para NOVOS usuários (Local/Dev)
-- Nota: Isso geralmente é feito no Dashboard do Supabase (Authentication -> Settings -> User Signups) 
-- Mas você pode forçar a confirmação de qualquer usuário pendente com:
/*
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
*/
