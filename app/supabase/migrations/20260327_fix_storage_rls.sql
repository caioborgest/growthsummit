-- GROWTH SUMMIT 2026 - FIX STORAGE RLS
-- Run this in your Supabase SQL Editor to enable profile photo uploads

-- 1. Ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on storage.objects
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Event Images Avatar Upload Policy" ON storage.objects;

-- 4. Create Policies

-- Allow PUBLIC READ access to the buckets
CREATE POLICY "Public Access Policy"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('avatars', 'event-images') );

-- Allow users to upload to 'avatars' bucket (root level)
-- FileName must start with their user ID
CREATE POLICY "Avatar Upload Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    name LIKE (auth.uid()::text || '-%')
);

-- Allow users to upload to 'event-images' bucket under specific folders
CREATE POLICY "Event Images Avatar Upload Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'event-images' AND
    (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    )
);

-- Allow users to UPDATE their own avatars
CREATE POLICY "Avatar Update Policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '-%')) OR
    (bucket_id = 'event-images' AND (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    ))
);

-- Allow users to DELETE their own avatars
CREATE POLICY "Avatar Delete Policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '-%')) OR
    (bucket_id = 'event-images' AND (
        name LIKE ('avatars/' || auth.uid()::text || '-%') OR
        name LIKE ('profiles/' || auth.uid()::text || '-%') OR
        name LIKE ('mentores/' || auth.uid()::text || '-%')
    ))
);
