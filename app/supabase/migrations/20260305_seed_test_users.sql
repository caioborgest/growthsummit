-- ============================================================
-- SEED TEST USERS (AUTH + PUBLIC) - ROBUST VERSION
-- Goal: Ensure p_id and p_email are synchronized with specific password
-- Date: 2026-03-05
-- Password for all: growth2026
-- ============================================================
-- 0. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 1. GARANTIR CONSTRAINTS UNIQUE (Mesmo que o anterior, apenas para segurança)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_growth_experience_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentores_growth_experience' AND column_name = 'email') THEN
    ALTER TABLE public.mentores_growth_experience ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_arena_pitch_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'startups_arena_pitch' AND column_name = 'email') THEN
    ALTER TABLE public.startups_arena_pitch ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_arena_pitch_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rodada_negocios_b2b_email_key'
) THEN
-- Garantir que a coluna email existe antes da constraint
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rodada_negocios_b2b' AND column_name = 'email') THEN
    ALTER TABLE public.rodada_negocios_b2b ADD COLUMN email TEXT;
END IF;
ALTER TABLE public.rodada_negocios_b2b
ADD CONSTRAINT rodada_negocios_b2b_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'inscricoes_growth_experience_email_key'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD CONSTRAINT inscricoes_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sponsors_contact_email_key'
) THEN
ALTER TABLE public.sponsors
ADD CONSTRAINT sponsors_contact_email_key UNIQUE (contact_email);
END IF;
END $$;
-- 2. FUNÇÃO ROBUSTA PARA CRIAR/RESETAR USUÁRIO
CREATE OR REPLACE FUNCTION public.seed_full_user_robust(
        p_id UUID,
        p_email TEXT,
        p_name TEXT,
        p_phone TEXT,
        p_role TEXT
    ) RETURNS VOID AS $$
DECLARE v_encrypted_pw TEXT;
BEGIN v_encrypted_pw := crypt('growth2026', gen_salt('bf'));
-- Sincronizar auth.users
-- Se existir o ID, atualizamos. Se não existir o ID mas existir o E-MAIL, atualizamos o ID.
-- O mais seguro para Supabase é DELETE/INSERT se houver colisão de email ou id.
DELETE FROM auth.identities
WHERE user_id = p_id
    OR identity_data->>'email' = p_email;
DELETE FROM auth.users
WHERE id = p_id
    OR email = p_email;
INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token
    )
VALUES (
        p_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        v_encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('name', p_name, 'role', p_role, 'phone', p_phone),
        now(),
        now(),
        'authenticated',
        'authenticated',
        ''
    );
INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        p_id,
        jsonb_build_object('sub', p_id, 'email', p_email),
        'email',
        p_id::text,
        now(),
        now()
    );
-- Sincronizar public.users
INSERT INTO public.users (id, email, name, phone, role, updated_at)
VALUES (p_id, p_email, p_name, p_phone, p_role, now()) ON CONFLICT (id) DO
UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. EXECUÇÃO DO SEED
DO $$
DECLARE v_project_id UUID;
v_mentor_id UUID := '00000000-0000-0000-0000-000000000001';
v_startup_id UUID := '00000000-0000-0000-0000-000000000002';
v_company_id UUID := '00000000-0000-0000-0000-000000000003';
v_sponsor_id UUID := '00000000-0000-0000-0000-000000000004';
v_participant_id UUID := '00000000-0000-0000-0000-000000000005';
BEGIN -- Seleciona Projeto Triunfo
SELECT id INTO v_project_id
FROM public.projects
WHERE slug = 'growth-experience-triunfo'
LIMIT 1;
IF v_project_id IS NULL THEN
SELECT id INTO v_project_id
FROM public.projects
LIMIT 1;
END IF;
-- Criar/Resetar Usuários
PERFORM public.seed_full_user_robust(
    v_mentor_id,
    'mentor@test.com',
    'Mestre Mentor',
    '81999990001',
    'mentor'
);
PERFORM public.seed_full_user_robust(
    v_startup_id,
    'startup@test.com',
    'Fundador Inovador',
    '81999990002',
    'startup'
);
PERFORM public.seed_full_user_robust(
    v_company_id,
    'empresa@test.com',
    'Executivo B2B',
    '81999990003',
    'company'
);
PERFORM public.seed_full_user_robust(
    v_sponsor_id,
    'patrocinador@test.com',
    'Sponsor Master',
    '81999990004',
    'sponsor'
);
PERFORM public.seed_full_user_robust(
    v_participant_id,
    'participante@test.com',
    'Participante Pro',
    '81999990005',
    'participant'
);
-- MENTOR
INSERT INTO public.mentores_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        telefone,
        bio,
        especialidades,
        status
    )
VALUES (
        v_project_id,
        v_mentor_id,
        'Mestre Mentor',
        'mentor@test.com',
        '81999990001',
        'Especialista em Growth e IA.',
        ARRAY ['Growth Hacking', 'IA para Negócios'],
        'approved'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- STARTUP
INSERT INTO public.startups_arena_pitch (
        project_id,
        user_id,
        nome_startup,
        email,
        telefone,
        setor,
        estagio,
        status
    )
VALUES (
        v_project_id,
        v_startup_id,
        'TechFlow AI',
        'startup@test.com',
        '81999990002',
        'SaaS / AI',
        'Traction',
        'confirmed'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- COMPANY
INSERT INTO public.rodada_negocios_b2b (
        project_id,
        user_id,
        nome_empresa,
        email,
        telefone,
        setor,
        status
    )
VALUES (
        v_project_id,
        v_company_id,
        'Logistics S.A.',
        'empresa@test.com',
        '81999990003',
        'Logística',
        'approved'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- SPONSOR
INSERT INTO public.sponsors (
        project_id,
        user_id,
        company_name,
        contact_name,
        contact_email,
        level,
        status,
        investment
    )
VALUES (
        v_project_id,
        v_sponsor_id,
        'Titan Ventures',
        'Sponsor Master',
        'patrocinador@test.com',
        'diamond',
        'closed',
        50000
    ) ON CONFLICT (contact_email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- PARTICIPANTE
INSERT INTO public.inscricoes_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        tipo_inscricao,
        status_pagamento
    )
VALUES (
        v_project_id,
        v_participant_id,
        'Participante Pro',
        'participante@test.com',
        'pro',
        'pago'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
END $$;
DROP FUNCTION public.seed_full_user_robust;