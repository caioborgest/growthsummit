-- ============================================================
-- GROWTH SUMMIT 2026 - EVENT IMAGES BUCKET SETUP
-- ============================================================
-- Execute este SQL no Supabase SQL Editor para configurar
-- o bucket de imagens do Growth Experience Triunfo-PE
-- ============================================================
-- Criar bucket público para imagens do evento
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;
-- ============================================================
-- POLÍTICAS DE SEGURANÇA
-- ============================================================
-- Permitir leitura pública de todas as imagens do evento
CREATE POLICY "Allow public read event-images" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'event-images');
-- Permitir upload para usuários autenticados
CREATE POLICY "Allow authenticated uploads to event-images" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'event-images');
-- Permitir atualização para usuários autenticados
CREATE POLICY "Allow authenticated updates to event-images" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'event-images');
-- Permitir deleção para usuários autenticados
CREATE POLICY "Allow authenticated deletes to event-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-images');
-- Admins têm acesso total (esta política já deve existir no setup geral)
-- Se não existir, descomente as linhas abaixo:
-- CREATE POLICY "Admins can manage event-images" 
-- ON storage.objects FOR ALL 
-- TO authenticated 
-- USING (
--   bucket_id = 'event-images' 
--   AND EXISTS (
--     SELECT 1 FROM public.users 
--     WHERE id = auth.uid() AND role = 'admin'
--   )
-- );
-- ============================================================
-- ESTRUTURA DE PASTAS
-- ============================================================
-- event-images/
-- ├── stands/
-- │   ├── stand-diamante.jpg
-- │   ├── stand-ouro.jpg
-- │   ├── stand-prata-plus.jpg
-- │   ├── stand-prata.jpg
-- │   └── stand-bronze.jpg
-- └── palestrantes/
--     ├── leandro-batista.jpg
--     ├── vanylton-matias.jpg
--     └── palestrantes-juntos.jpg (opcional)
-- ============================================================
-- URLS DAS IMAGENS (após upload)
-- ============================================================
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-diamante.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-ouro.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-prata-plus.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-prata.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/stands/stand-bronze.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/leandro-batista.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/vanylton-matias.jpg
-- https://zczfutmymobgypbbamme.supabase.co/storage/v1/object/public/event-images/palestrantes/palestrantes-juntos.jpg
-- ============================================================
-- CONCLUÍDO! ✅
-- ============================================================