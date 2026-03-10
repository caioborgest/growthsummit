-- ============================================================
-- AUTH TO PUBLIC SYNC TRIGGER (Growth Experience 2026)
-- Data: 2026-03-10
-- Objetivo: Garantir que todo usuário criado no Auth do Supabase
-- seja sincronizado automaticamente com a tabela public.users,
-- evitando erros de chave estrangeira nas inscrições.
-- ============================================================

-- 1. FUNÇÃO DE SINCRONIZAÇÃO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insere ou atualiza na tabela public.users
    INSERT INTO public.users (
        id, 
        email, 
        name, 
        phone, 
        role, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'participant'),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = COALESCE(EXCLUDED.email, public.users.email),
        name = COALESCE(EXCLUDED.name, public.users.name),
        phone = COALESCE(EXCLUDED.phone, public.users.phone),
        updated_at = NOW();

    -- Opcional: Criar perfil vazio se não existir
    INSERT INTO public.profiles (user_id, country, country_code)
    VALUES (NEW.id, 'Brasil', 'BR')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER NO AUTH.USERS
-- Nota: É necessário rodar isso como superuser (postgres)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. TRIGGER DE ATUALIZAÇÃO (Sincronizar mudanças de email/meta-data)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE PROCEDURE public.handle_new_user();

-- 4. BACKFILL: Sincronizar usuários existentes que podem estar faltando
INSERT INTO public.users (id, email, name, role, updated_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', email),
    COALESCE(raw_user_meta_data->>'role', 'participant'),
    now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. REVISAR CHAVE ESTRANGEIRA (Opcional, mas garante consistência)
-- Se a FK estiver apontando para public.users, agora ela terá os registros.
-- Se houver lixo em inscricoes_growth_experience, pode ser necessário limpar.
-- DELETE FROM public.inscricoes_growth_experience WHERE user_id NOT IN (SELECT id FROM auth.users);

-- NOTAR: Se você estiver recebendo erro de 'permission denied' na schema 'auth', 
-- você deve rodar este comando via painel do Supabase com privilégios de admin.
