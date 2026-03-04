-- ============================================================
-- MIGRATION: FIX REGISTRATION CONSTRAINTS AND POLICIES
-- Date: 2026-03-03
-- ============================================================
-- 1. FIX USERS Table: Permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR
UPDATE USING (auth.uid() = id);
-- 2. MELHORAR TRIGGER DE SINCRONIZAÇÃO: Rodar também no UPDATE para manter metadata síncrona
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    OR
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- 3. FIX MENTORES Table: Adicionar UNIQUE(email) e políticas de acesso
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_email_unique'
) THEN
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_email_unique UNIQUE (email);
END IF;
END $$;
-- Permitir inserção pública (candidatura)
DROP POLICY IF EXISTS "mentores_public_insert" ON public.mentores_growth_experience;
CREATE POLICY "mentores_public_insert" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
-- Permitir que o mentor veja e atualize sua própria candidatura
DROP POLICY IF EXISTS "mentores_user_select" ON public.mentores_growth_experience;
CREATE POLICY "mentores_user_select" ON public.mentores_growth_experience FOR
SELECT USING (
        auth.uid() = user_id
        OR email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "mentores_user_update" ON public.mentores_growth_experience;
CREATE POLICY "mentores_user_update" ON public.mentores_growth_experience FOR
UPDATE USING (
        auth.uid() = user_id
        OR email = (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );
-- 4. FIX STARTUPS Table: Adicionar UNIQUE(email) e políticas
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_email_unique'
) THEN
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_email_unique UNIQUE (email);
END IF;
END $$;
DROP POLICY IF EXISTS "startups_public_insert" ON public.startups_arena_pitch;
CREATE POLICY "startups_public_insert" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "startups_user_all" ON public.startups_arena_pitch;
CREATE POLICY "startups_user_all" ON public.startups_arena_pitch FOR ALL USING (
    auth.uid() = user_id
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
);
-- 5. FIX B2B Table: Adicionar UNIQUE(email) e políticas
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'b2b_email_unique'
) THEN
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT b2b_email_unique UNIQUE (email);
END IF;
END $$;
DROP POLICY IF EXISTS "b2b_public_insert" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_public_insert" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "b2b_user_all" ON public.rodada_negocios_b2b;
CREATE POLICY "b2b_user_all" ON public.rodada_negocios_b2b FOR ALL USING (
    auth.uid() = user_id
    OR email = (
        SELECT email
        FROM auth.users
        WHERE id = auth.uid()
    )
);
-- Garantir acesso ao storage para os novos cadastrados
-- (Já deve existir, mas reforçando se necessário)
GRANT ALL ON TABLE public.mentores_growth_experience TO authenticated,
    anon;
GRANT ALL ON TABLE public.startups_arena_pitch TO authenticated,
    anon;
GRANT ALL ON TABLE public.rodada_negocios_b2b TO authenticated,
    anon;