-- ============================================================
-- GROWTH SUMMIT 2026 - STORAGE BUCKETS SETUP
-- ============================================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================================
-- Criar buckets (se não existirem)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true),
    ('logos', 'logos', true),
    ('documents', 'documents', false),
    ('pitch-decks', 'pitch-decks', false),
    ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
-- ============================================================
-- POLÍTICAS PARA BUCKET: avatars (PÚBLICO)
-- ============================================================
-- Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
-- Permitir leitura pública
CREATE POLICY "Allow public read avatars" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'avatars');
-- Permitir usuários atualizarem seus próprios arquivos
CREATE POLICY "Allow users to update own avatars" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
-- Permitir usuários deletarem seus próprios arquivos
CREATE POLICY "Allow users to delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- ============================================================
-- POLÍTICAS PARA BUCKET: logos (PÚBLICO)
-- ============================================================
CREATE POLICY "Allow authenticated uploads to logos" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Allow public read logos" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'logos');
CREATE POLICY "Allow users to update own logos" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'logos'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Allow users to delete own logos" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- ============================================================
-- POLÍTICAS PARA BUCKET: documents (PRIVADO)
-- ============================================================
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Users can read own documents" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'documents'
        AND (
            auth.uid()::text = (storage.foldername(name)) [1]
            OR EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                    AND role IN ('admin', 'staff')
            )
        )
    );
CREATE POLICY "Users can update own documents" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- ============================================================
-- POLÍTICAS PARA BUCKET: pitch-decks (PRIVADO)
-- ============================================================
CREATE POLICY "Authenticated users can upload pitch-decks" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'pitch-decks');
CREATE POLICY "Users can read own pitch-decks" ON storage.objects FOR
SELECT TO authenticated USING (
        bucket_id = 'pitch-decks'
        AND (
            auth.uid()::text = (storage.foldername(name)) [1]
            OR EXISTS (
                SELECT 1
                FROM public.users
                WHERE id = auth.uid()
                    AND role IN ('admin', 'staff')
            )
        )
    );
CREATE POLICY "Users can update own pitch-decks" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'pitch-decks'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete own pitch-decks" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'pitch-decks'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- ============================================================
-- POLÍTICAS PARA ADMINS (acesso total)
-- ============================================================
CREATE POLICY "Admins can do anything in storage" ON storage.objects FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ============================================================
-- CONCLUÍDO! ✅
-- ============================================================
-- Seus buckets estão configurados e prontos para uso!
-- 
-- ESTRUTURA DE PASTAS RECOMENDADA:
-- avatars/{user_id}/{filename}
-- logos/{entity_type}/{entity_id}/{filename}
-- documents/{user_id}/{filename}
-- pitch-decks/{startup_id}/{filename}
-- ============================================================