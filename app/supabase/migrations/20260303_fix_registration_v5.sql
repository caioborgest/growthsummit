-- ============================================================
-- MIGRATION: FINAL FIX FOR REGISTRATION, STORAGE AND SYNC (V5)
-- Date: 2026-03-03
-- ============================================================
-- 1. STORAGE: PERMISSÕES RADICAIS (Garante upload imediato para novos usuários)
-- Criar buckets se não existirem
DO $$ BEGIN
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-assets', 'event-assets', true) ON CONFLICT (id) DO NOTHING;
END $$;
-- Limpar e recriar políticas de forma padrão
DROP POLICY IF EXISTS "Public Select All" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert All" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update All" ON storage.objects;
CREATE POLICY "Public Select All" ON storage.objects FOR
SELECT USING (bucket_id IN ('event-images', 'event-assets'));
CREATE POLICY "Auth Insert All" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id IN ('event-images', 'event-assets'));
CREATE POLICY "Auth Update All" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id IN ('event-images', 'event-assets'));
-- 2. DB: CORREÇÃO DE CONSTRAINT DE ROLE (Permitir b2b e outros novos papéis)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
        role IN (
            'admin',
            'staff',
            'mentor',
            'company',
            'startup',
            'sponsor',
            'visitor',
            'participant',
            'b2b'
        )
    );
-- 3. DB: TRIGGER DE USUÁRIO ROBUSTO
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE v_role TEXT;
BEGIN -- Mapeamento seguro de roles
v_role := LOWER(
    COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
);
-- Normalização para o que o banco aceita
IF v_role NOT IN (
    'admin',
    'staff',
    'mentor',
    'company',
    'startup',
    'sponsor',
    'visitor',
    'participant',
    'b2b'
) THEN v_role := 'participant';
END IF;
INSERT INTO public.users (id, email, name, phone, role, updated_at)
VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        v_role,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = COALESCE(
        NEW.raw_user_meta_data->>'name',
        public.users.name
    ),
    phone = COALESCE(
        NEW.raw_user_meta_data->>'phone',
        public.users.phone
    ),
    role = EXCLUDED.role,
    updated_at = NOW();
RETURN NEW;
EXCEPTION
WHEN OTHERS THEN RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    OR
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 4. RLS DAS TABELAS: JWT-BASED (Ultra rápido)
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentores_insert_policy" ON public.mentores_growth_experience;
CREATE POLICY "mentores_insert_policy" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "mentores_self_manage" ON public.mentores_growth_experience;
CREATE POLICY "mentores_self_manage" ON public.mentores_growth_experience FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "startups_insert_policy" ON public.startups_arena_pitch;
CREATE POLICY "startups_insert_policy" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "startups_self_manage" ON public.startups_arena_pitch;
CREATE POLICY "startups_self_manage" ON public.startups_arena_pitch FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_insert_policy" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_insert_policy" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "b2b_self_manage" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_self_manage" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
) WITH CHECK (
    user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
);
-- 5. PERMISSÕES DE TABELA
GRANT ALL ON TABLE public.users TO authenticated,
    anon;
GRANT ALL ON TABLE public.mentores_growth_experience TO authenticated,
    anon;
GRANT ALL ON TABLE public.startups_arena_pitch TO authenticated,
    anon;
GRANT ALL ON TABLE public.rodada_negocios_b2b TO authenticated,
    anon;
GRANT ALL ON TABLE public.inscricoes_growth_experience TO authenticated,
    anon;