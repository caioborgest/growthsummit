-- ============================================================
-- SEED DATA COMPLETO PARA TESTES (DADOS FICTÍCIOS PREMIUM)
-- Date: 2026-03-05
-- Versão: 4 (Correção de Colunas e Estrutura de Tabelas)
-- Password: growth2026
-- ============================================================
-- 1. CORREÇÃO DE CONSTRAINTS NO BANCO
DO $$ BEGIN -- Atualizar lista de cargos permitidos na tabela users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
ADD CONSTRAINT users_role_check CHECK (
        role IN (
            'visitor',
            'participant',
            'mentor',
            'company',
            'startup',
            'sponsor',
            'admin',
            'staff',
            'speaker'
        )
    );
-- Garantir colunas extras necessárias para FKs e Seed
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'mentores_growth_experience_email_key'
) THEN
ALTER TABLE public.mentores_growth_experience
ADD CONSTRAINT mentores_growth_experience_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'startups_arena_pitch_email_key'
) THEN
ALTER TABLE public.startups_arena_pitch
ADD CONSTRAINT startups_arena_pitch_email_key UNIQUE (email);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rodada_negocios_b2b_email_key'
) THEN
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
-- 2. FUNÇÃO AUXILIAR PARA CRIAR USUÁRIO (AUTH + PUBLIC)
CREATE OR REPLACE FUNCTION public.seed_full_user(
        p_id UUID,
        p_email TEXT,
        p_name TEXT,
        p_phone TEXT,
        p_role TEXT
    ) RETURNS VOID AS $$ BEGIN -- Auth.users
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users
        WHERE email = p_email
            OR id = p_id
    ) THEN
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
        crypt('growth2026', gen_salt('bf')),
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
        last_login_at,
        created_at,
        updated_at
    )
VALUES (
        gen_random_uuid(),
        p_id,
        jsonb_build_object('sub', p_id, 'email', p_email),
        'email',
        now(),
        now(),
        now()
    );
END IF;
-- Public.users
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
-- 3. EXECUÇÃO DO SEED MASSIFICAÇÃO DE DADOS
DO $$
DECLARE v_project_id UUID;
v_mentor_id UUID := '00000000-0000-0000-0000-000000000001';
-- User ID do Mentor
v_startup_id UUID := '00000000-0000-0000-0000-000000000002';
v_company_id UUID := '00000000-0000-0000-0000-000000000003';
v_sponsor_id UUID := '00000000-0000-0000-0000-000000000004';
v_participant_id UUID := '00000000-0000-0000-0000-000000000005';
v_internal_mentor_id UUID;
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
-- A. Criar Usuários
PERFORM public.seed_full_user(
    v_mentor_id,
    'mentor@test.com',
    'Mestre Mentor',
    '81999990001',
    'mentor'
);
PERFORM public.seed_full_user(
    v_startup_id,
    'startup@test.com',
    'Startup Founder',
    '81999990002',
    'startup'
);
PERFORM public.seed_full_user(
    v_company_id,
    'empresa@test.com',
    'B2B CEO',
    '81999990003',
    'company'
);
PERFORM public.seed_full_user(
    v_sponsor_id,
    'patrocinador@test.com',
    'Sponsor Alpha',
    '81999990004',
    'sponsor'
);
PERFORM public.seed_full_user(
    v_participant_id,
    'participante@test.com',
    'Joaquim Silva',
    '81999990005',
    'participant'
);
-- B. Dados de MENTOR
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
        'Especialista em Growth e SaaS.',
        ARRAY ['Growth Hacking', 'SaaS'],
        'aprovado'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id
RETURNING id INTO v_internal_mentor_id;
-- C. Dados de MENTORIA AGENDADA (Corrigido mentorado_id e data_mentoria)
INSERT INTO public.mentorias_agendadas (
        project_id,
        mentor_id,
        mentorado_id,
        nome_mentorado,
        email_mentorado,
        anotacoes,
        data_mentoria,
        status
    )
VALUES (
        v_project_id,
        v_internal_mentor_id,
        v_participant_id,
        'Joaquim Silva',
        'participante@test.com',
        'Tema: Estratégia B2B',
        now() + interval '1 day',
        'agendada'
    ) ON CONFLICT DO NOTHING;
-- D. Dados de STARTUP
INSERT INTO public.startups_arena_pitch (
        project_id,
        user_id,
        nome_startup,
        nome_fundador,
        email,
        telefone,
        setor,
        estagio,
        descricao_startup,
        status
    )
VALUES (
        v_project_id,
        v_startup_id,
        'SmartFlow AI',
        'Startup Founder',
        'startup@test.com',
        '81999990002',
        'IA',
        'Traction',
        'Plataforma de automação inteligente.',
        'selecionada'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- E. Dados de COMPANY / B2B (Corrigido colunas)
INSERT INTO public.rodada_negocios_b2b (
        project_id,
        user_id,
        nome_empresa,
        nome_representante,
        cargo,
        email,
        telefone,
        setor,
        porte,
        faturamento_anual,
        descricao_empresa,
        produtos_servicos,
        tipo_interesse,
        areas_interesse,
        descricao_objetivos,
        status
    )
VALUES (
        v_project_id,
        v_company_id,
        'Global S.A.',
        'B2B CEO',
        'CEO',
        'empresa@test.com',
        '81999990003',
        'Logística',
        'Grande',
        5000000,
        'Empresa líder em logística.',
        'Transporte inteligente.',
        'fornecedores',
        'Tecnologia',
        'Networking e novos parceiros.',
        'confirmada'
    ) ON CONFLICT (email) DO
UPDATE
SET user_id = EXCLUDED.user_id;
-- F. Dados de SPONSOR (Corrigido user_id removido pois não existe na tabela)
INSERT INTO public.sponsors (
        project_id,
        company_name,
        contact_name,
        contact_email,
        level,
        investment,
        status
    )
VALUES (
        v_project_id,
        'Titan Ventures',
        'Sponsor Alpha',
        'patrocinador@test.com',
        'diamond',
        75000,
        'closed'
    ) ON CONFLICT (contact_email) DO NOTHING;
-- G. NOTIFICAÇÕES (Corrigido is_read)
INSERT INTO public.notifications (
        project_id,
        user_id,
        title,
        message,
        type,
        is_read
    )
VALUES (
        v_project_id,
        v_mentor_id,
        'Nova Mentoria',
        'Joaquim Silva agendou com você.',
        'info',
        false
    ),
    (
        v_project_id,
        v_startup_id,
        'Pitch Aprovado',
        'Prepare seu deck para amanhã!',
        'success',
        false
    ),
    (
        v_project_id,
        v_company_id,
        'Match no B2B',
        'Você tem um novo match.',
        'info',
        false
    );
END $$;
DROP FUNCTION public.seed_full_user;