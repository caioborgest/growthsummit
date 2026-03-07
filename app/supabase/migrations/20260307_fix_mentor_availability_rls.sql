-- ============================================================
-- MIGRATION: Fix RLS and Schema for Mentorship Sessions
-- Growth Summit 2026
-- Data: 2026-03-07
-- ============================================================
-- 1. Garantir que a tabela mentorias_agendadas tenha as colunas necessárias (caso falte em algum environment)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'tema_interesse'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN tema_interesse TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'anotacoes'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN anotacoes TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'email_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN email_mentorado TEXT;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'mentorias_agendadas'
        AND column_name = 'telefone_mentorado'
) THEN
ALTER TABLE public.mentorias_agendadas
ADD COLUMN telefone_mentorado TEXT;
END IF;
END $$;
-- 2. Habilitar RLS
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
-- 3. Políticas de Segurança
-- SELECT: Todos os autenticados e anonimos podem ver os horários (para poderem agendar)
DROP POLICY IF EXISTS "mentorias_read_all" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_read_all" ON public.mentorias_agendadas FOR
SELECT USING (true);
-- INSERT: Mentores podem criar seus próprios horários (disponibilidade)
DROP POLICY IF EXISTS "mentorias_mentor_insert" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_mentor_insert" ON public.mentorias_agendadas FOR
INSERT TO authenticated WITH CHECK (
        public.is_admin()
        OR EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
    );
-- UPDATE: Mentores podem editar seus horários; Participantes podem agendar preenchendo os campos
DROP POLICY IF EXISTS "mentorias_update_policy" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_update_policy" ON public.mentorias_agendadas FOR
UPDATE TO authenticated USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
        OR mentorado_id = auth.uid()
        OR -- Mentorado já dono do slot
        mentorado_id IS NULL -- Permite agendar slots vazios
    ) WITH CHECK (true);
-- DELETE: Mentores podem excluir seus horários vazios; Admin exclui tudo
DROP POLICY IF EXISTS "mentorias_delete_policy" ON public.mentorias_agendadas;
CREATE POLICY "mentorias_delete_policy" ON public.mentorias_agendadas FOR DELETE TO authenticated USING (
    public.is_admin()
    OR (
        EXISTS (
            SELECT 1
            FROM public.mentores_growth_experience
            WHERE user_id = auth.uid()
                AND id = mentor_id
        )
        AND mentorado_id IS NULL
    )
);
DO $$ BEGIN RAISE NOTICE 'RLS e colunas de mentorias_agendadas atualizados com sucesso.';
END $$;
-- 4. Garantir Buckets de Storage e Políticas (para Avatar e Imagens)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
-- Políticas para avatars (Leitura pública, escrita apenas autenticados)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Auth Insert Avatars" ON storage.objects;
CREATE POLICY "Auth Insert Avatars" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'avatars');
-- Políticas para event-images
DROP POLICY IF EXISTS "Public Access Event Images" ON storage.objects;
CREATE POLICY "Public Access Event Images" ON storage.objects FOR
SELECT USING (bucket_id = 'event-images');
DROP POLICY IF EXISTS "Auth All Event Images" ON storage.objects;
CREATE POLICY "Auth All Event Images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'event-images');
DO $$ BEGIN RAISE NOTICE 'Buckets de storage e políticas configurados.';
END $$;