-- ============================================================
-- GROWTH SUMMIT 2026 - Seeds (Dados de Exemplo)
-- ============================================================
-- IMPORTANTE: Os usuários devem ser criados via auth.signUp() do Supabase
-- ou via Dashboard antes de executar este seed.
-- Este seed assume que os usuários já existem em auth.users
-- ============================================================
-- FUNÇÃO AUXILIAR PARA CRIAR USUÁRIOS (se não existirem)
-- ============================================================
-- Criar usuários no auth.users se não existirem (apenas para desenvolvimento)
DO $$
DECLARE user_id UUID;
-- Usuário Admin (Principal)
user_id := 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
-- ID fixo para consistência
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE email = 'projetos@cbxgrowth.com.br'
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'projetos@cbxgrowth.com.br',
        crypt('Caio020689!@#$%', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Admin Growth Summit", "role": "admin"}'
    );
END IF;
-- Usuário Participante
user_id := '00000000-0000-0000-0000-000000000002';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'participante@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"João Silva"}'
    );
END IF;
-- Usuário Mentor
user_id := '00000000-0000-0000-0000-000000000003';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'mentor@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Dr. Fernando Lima"}'
    );
END IF;
-- Usuário Empresa
user_id := '00000000-0000-0000-0000-000000000004';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'empresa@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Empresa ABC"}'
    );
END IF;
-- Usuário Startup
user_id := '00000000-0000-0000-0000-000000000005';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'startup@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"TechStart Brasil"}'
    );
END IF;
-- Usuário Patrocinador
user_id := '00000000-0000-0000-0000-000000000006';
IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
) THEN
INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    )
VALUES (
        user_id,
        'patrocinador@email.com',
        crypt('123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"TechCorp Brasil"}'
    );
END IF;
END $$;
-- ============================================================
-- USUÁRIOS (public.users)
-- ============================================================
INSERT INTO public.users (
        id,
        email,
        name,
        phone,
        role,
        avatar,
        email_verified,
        created_at
    )
VALUES (
        'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        'projetos@cbxgrowth.com.br',
        'Admin Growth Summit',
        '(88) 98843-2310',
        'admin',
        NULL,
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'participante@email.com',
        'João Silva',
        '(88) 98888-8888',
        'participant',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'mentor@email.com',
        'Dr. Fernando Lima',
        '(88) 97777-7777',
        'mentor',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'empresa@email.com',
        'Empresa ABC',
        '(88) 96666-6666',
        'company',
        NULL,
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'startup@email.com',
        'TechStart Brasil',
        '(88) 95555-5555',
        'startup',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
        TRUE,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000006',
        'patrocinador@email.com',
        'TechCorp Brasil',
        '(88) 94444-4444',
        'sponsor',
        NULL,
        TRUE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    avatar = EXCLUDED.avatar,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();
-- ============================================================
-- PERFIS
-- ============================================================
INSERT INTO public.profiles (
        user_id,
        company,
        position,
        bio,
        city,
        state,
        linkedin,
        created_at
    )
VALUES (
        '00000000-0000-0000-0000-000000000002',
        'TechStart Brasil',
        'Head de Growth',
        'Profissional de marketing com 10 anos de experiência.',
        'Juazeiro do Norte',
        'CE',
        'linkedin.com/in/joaosilva',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'ScaleUp Consultoria',
        'CEO',
        'Especialista em Growth Strategy e mentor de startups.',
        'São Paulo',
        'SP',
        'linkedin.com/in/fernandolima',
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Empresa ABC',
        'Diretor Comercial',
        NULL,
        'Fortaleza',
        'CE',
        NULL,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'TechStart Brasil',
        'CEO',
        'Fundador de startup de tecnologia.',
        'Juazeiro do Norte',
        'CE',
        'linkedin.com/in/techstart',
        NOW()
    ) ON CONFLICT (user_id) DO
UPDATE
SET company = EXCLUDED.company,
    position = EXCLUDED.position,
    bio = EXCLUDED.bio,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    linkedin = EXCLUDED.linkedin,
    updated_at = NOW();
-- ============================================================
-- PALESTRANTES
-- ============================================================
INSERT INTO public.speakers (
        id,
        project_id,
        name,
        email,
        role,
        company,
        bio,
        image,
        linkedin,
        topics,
        order_index,
        is_featured,
        created_at
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        '550e8400-e29b-41d4-a716-446655440000',
        'Ana Silva',
        'ana@techstart.com.br',
        'Head of Growth',
        'TechStart Brasil',
        'Especialista em growth hacking com 10+ anos de experiência em startups.',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        'linkedin.com/in/anasilva',
        ARRAY ['Growth Marketing', 'Aquisição', 'Retenção'],
        1,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111112',
        '550e8400-e29b-41d4-a716-446655440000',
        'Carlos Mendes',
        'carlos@datadriven.com',
        'CEO',
        'DataDriven Labs',
        'Pioneiro em IA aplicada a negócios no Brasil.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        'linkedin.com/in/carlosmendes',
        ARRAY ['Inteligência Artificial', 'Machine Learning', 'Data Science'],
        2,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111113',
        '550e8400-e29b-41d4-a716-446655440000',
        'Mariana Costa',
        'mariana@salespro.com',
        'VP de Vendas',
        'SalesPro',
        'Especialista em vendas B2B e revenue operations.',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        'linkedin.com/in/marianacosta',
        ARRAY ['Vendas B2B', 'Sales Ops', 'Revenue'],
        3,
        TRUE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111114',
        '550e8400-e29b-41d4-a716-446655440000',
        'Pedro Oliveira',
        'pedro@growthmasters.com',
        'Founder',
        'Growth Masters',
        'Mentor de startups e especialista em marketing digital.',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        'linkedin.com/in/pedrooliveira',
        ARRAY ['Marketing Digital', 'SEO', 'Content Marketing'],
        4,
        FALSE,
        NOW()
    ),
    (
        '11111111-1111-1111-1111-111111111115',
        '550e8400-e29b-41d4-a716-446655440000',
        'Juliana Ferreira',
        'juliana@innovateco.com',
        'People Director',
        'InnovateCo',
        'Especialista em cultura organizacional e liderança.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        'linkedin.com/in/julianaferreira',
        ARRAY ['Gestão', 'Liderança', 'People Ops'],
        5,
        FALSE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    updated_at = NOW();
-- ============================================================
-- SESSÕES (PROGRAMAÇÃO)
-- ============================================================
INSERT INTO public.sessions (
        id,
        project_id,
        title,
        description,
        type,
        track,
        day,
        start_time,
        end_time,
        room,
        max_capacity,
        registered_count,
        created_at
    )
VALUES -- Dia 1
    (
        '22222222-2222-2222-2222-222222222221',
        '550e8400-e29b-41d4-a716-446655440000',
        'Abertura + Palestra Âncora: Growth & IA em 2026',
        'Palestra de abertura do evento com as principais tendências.',
        'keynote',
        'Growth Marketing',
        1,
        '09:00',
        '10:00',
        'Auditório Principal',
        500,
        420,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '550e8400-e29b-41d4-a716-446655440000',
        'Growth Marketing em Startups',
        'Estratégias práticas de growth para startups em early stage.',
        'talk',
        'Growth Marketing',
        1,
        '10:30',
        '11:30',
        'Sala A',
        100,
        85,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222223',
        '550e8400-e29b-41d4-a716-446655440000',
        'SEO Avançado para 2026',
        'Técnicas avançadas de SEO e otimização para buscadores.',
        'workshop',
        'Marketing Digital',
        1,
        '10:30',
        '12:00',
        'Sala B',
        50,
        48,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222224',
        '550e8400-e29b-41d4-a716-446655440000',
        'Vendas B2B Consultiva',
        'Metodologia de vendas consultivas para grandes contas.',
        'talk',
        'Vendas B2B',
        1,
        '14:00',
        '15:30',
        'Sala A',
        100,
        72,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222225',
        '550e8400-e29b-41d4-a716-446655440000',
        'ChatGPT e IA na Prática',
        'Workshop hands-on de aplicação de IA no dia a dia.',
        'workshop',
        'Inteligência Artificial',
        1,
        '14:00',
        '16:00',
        'Sala C',
        50,
        50,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222226',
        '550e8400-e29b-41d4-a716-446655440000',
        'Painel: Inovação no Cariri-CE',
        'Discussão sobre o ecossistema de inovação da região.',
        'panel',
        NULL,
        1,
        '16:30',
        '17:30',
        'Auditório Principal',
        500,
        380,
        NOW()
    ),
    -- Dia 2
    (
        '22222222-2222-2222-2222-222222222227',
        '550e8400-e29b-41d4-a716-446655440000',
        'Palestra Âncora: Tendências 2026-2027',
        'O que esperar para os próximos anos em growth e inovação.',
        'keynote',
        NULL,
        2,
        '09:00',
        '10:00',
        'Auditório Principal',
        500,
        450,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222228',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Growth Hacking',
        'Táticas avançadas de growth hacking.',
        'workshop',
        'Growth Marketing',
        2,
        '10:30',
        '12:00',
        'Sala A',
        50,
        48,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222229',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Liderança em Times Remotos',
        'Gestão de equipes distribuídas e híbridas.',
        'workshop',
        'Gestão',
        2,
        '10:30',
        '12:00',
        'Sala B',
        50,
        45,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222230',
        '550e8400-e29b-41d4-a716-446655440000',
        'Workshop: Pitch para Investidores',
        'Como criar um pitch deck que converte.',
        'workshop',
        'Startups',
        2,
        '10:30',
        '12:00',
        'Sala C',
        30,
        30,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222231',
        '550e8400-e29b-41d4-a716-446655440000',
        'Rodada de Mentorias 1:1',
        'Sessões individuais de mentoria.',
        'networking',
        NULL,
        2,
        '15:00',
        '17:30',
        'Área de Networking',
        100,
        85,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222232',
        '550e8400-e29b-41d4-a716-446655440000',
        'Encerramento + Premiação Startups',
        'Cerimônia de encerramento e premiação.',
        'keynote',
        NULL,
        2,
        '17:30',
        '18:30',
        'Auditório Principal',
        500,
        480,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    updated_at = NOW();
-- ============================================================
-- MENTORES
-- ============================================================
INSERT INTO public.mentors (
        id,
        project_id,
        user_id,
        name,
        email,
        photo,
        bio,
        specialties,
        tracks,
        years_experience,
        company,
        position,
        linkedin,
        max_mentories,
        session_duration,
        status,
        created_at
    )
VALUES (
        '33333333-3333-3333-3333-333333333331',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000003',
        'Dr. Fernando Lima',
        'fernando@scaleup.com',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
        'Especialista em Growth Strategy com 15 anos de experiência em consultoria.',
        ARRAY ['Growth Strategy', 'Escala', 'Fundraising'],
        ARRAY ['Growth Marketing'],
        15,
        'ScaleUp',
        'CEO',
        'linkedin.com/in/fernandolima',
        5,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Dra. Amanda Rocha',
        'amanda@digitalpro.com',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        'Especialista em Marketing Digital e SEO.',
        ARRAY ['Marketing Digital', 'SEO', 'Content Marketing'],
        ARRAY ['Marketing Digital'],
        12,
        'DigitalPro',
        'CMO',
        'linkedin.com/in/amandarocha',
        4,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Prof. Bruno Dias',
        'bruno@salesforce.com',
        NULL,
        'Especialista em Vendas B2B e Sales Operations.',
        ARRAY ['Vendas B2B', 'Sales Ops', 'Negociação'],
        ARRAY ['Vendas B2B'],
        18,
        'SalesForce',
        'VP Sales',
        'linkedin.com/in/brunodias',
        3,
        25,
        'pending',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333334',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Eng. Carla Martins',
        'carla@ailabs.com',
        NULL,
        'Especialista em IA e Automação.',
        ARRAY ['Inteligência Artificial', 'Automação', 'Machine Learning'],
        ARRAY ['Inteligência Artificial'],
        14,
        'AI Labs',
        'CTO',
        'linkedin.com/in/carlamartins',
        4,
        25,
        'approved',
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333335',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Mestre Diego Alves',
        'diego@leadership.com',
        NULL,
        'Especialista em Liderança e Gestão de Pessoas.',
        ARRAY ['Liderança', 'Gestão', 'Cultura Organizacional'],
        ARRAY ['Gestão'],
        20,
        'Leadership Co',
        'Founder',
        'linkedin.com/in/diegoalves',
        3,
        25,
        'approved',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- EMPRESAS B2B
-- ============================================================
INSERT INTO public.companies (
        id,
        project_id,
        user_id,
        name,
        cnpj,
        type,
        sector,
        description,
        logo,
        website,
        contact_name,
        contact_email,
        contact_phone,
        package_type,
        max_meetings,
        status,
        interests,
        offers,
        created_at
    )
VALUES (
        '44444444-4444-4444-4444-444444444441',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000004',
        'Empresa ABC',
        '12.345.678/0001-90',
        'anchor',
        'Tecnologia',
        'Empresa de software e consultoria em TI.',
        'https://via.placeholder.com/200',
        'https://empresaabc.com.br',
        'Carlos Mendes',
        'carlos@empresaabc.com.br',
        '(11) 99999-9999',
        'anchor',
        8,
        'approved',
        ARRAY ['Fornecedores de Software', 'Consultoria'],
        ARRAY ['Serviços de TI', 'Consultoria'],
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Fornecedora XYZ',
        '98.765.432/0001-10',
        'vendor',
        'Marketing',
        'Agência de marketing digital e performance.',
        'https://via.placeholder.com/200',
        'https://xyzmarketing.com.br',
        'Ana Paula',
        'ana@xyzmarketing.com.br',
        '(21) 88888-8888',
        'vendor',
        15,
        'approved',
        ARRAY ['Clientes B2B'],
        ARRAY ['Marketing Digital', 'Performance'],
        NOW()
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Tech Solutions',
        '11.222.333/0001-44',
        'vendor',
        'TI',
        'Consultoria em infraestrutura de TI.',
        NULL,
        NULL,
        'Roberto Alves',
        'roberto@techsolutions.com.br',
        '(31) 77777-7777',
        'vendor',
        10,
        'pending',
        ARRAY ['Grandes Empresas'],
        ARRAY ['Infraestrutura TI', 'Cloud'],
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- STARTUPS
-- ============================================================
INSERT INTO public.startups (
        id,
        project_id,
        user_id,
        name,
        cnpj,
        description,
        sector,
        stage,
        logo,
        website,
        founding_team,
        metrics_revenue,
        metrics_users,
        metrics_growth,
        package_type,
        stand_number,
        status,
        created_at
    )
VALUES (
        '55555555-5555-5555-5555-555555555551',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000005',
        'TechStart Brasil',
        '33.444.555/0001-66',
        'Plataforma de gestão para pequenas empresas.',
        'SaaS',
        'traction',
        'https://via.placeholder.com/200',
        'https://techstart.com.br',
        '[{"name": "João Silva", "role": "CEO"}, {"name": "Maria Santos", "role": "CTO"}]'::jsonb,
        50000,
        1000,
        150.00,
        'pitch',
        'A01',
        'approved',
        NOW()
    ),
    (
        '55555555-5555-5555-5555-555555555552',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'AppNova',
        '77.888.999/0001-22',
        'Aplicativo de delivery para pequenos restaurantes.',
        'FoodTech',
        'mvp',
        'https://via.placeholder.com/200',
        'https://appnova.com.br',
        '[{"name": "Pedro Costa", "role": "Founder"}]'::jsonb,
        NULL,
        500,
        80.00,
        'expo',
        'A02',
        'approved',
        NOW()
    ),
    (
        '55555555-5555-5555-5555-555555555553',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'DataDriven',
        '55.666.777/0001-33',
        'Plataforma de analytics com IA para e-commerce.',
        'Data',
        'idea',
        NULL,
        NULL,
        '[{"name": "Lucas Lima", "role": "CEO"}]'::jsonb,
        NULL,
        NULL,
        NULL,
        'expo',
        NULL,
        'pending',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- PATROCINADORES
-- ============================================================
INSERT INTO public.sponsors (
        id,
        project_id,
        company_name,
        trading_name,
        cnpj,
        contact_name,
        contact_email,
        contact_phone,
        level,
        investment,
        status,
        closed_at,
        logo,
        website,
        notes,
        created_at
    )
VALUES (
        '66666666-6666-6666-6666-666666666661',
        '550e8400-e29b-41d4-a716-446655440000',
        'TechCorp Brasil',
        'TechCorp',
        '10.000.000/0001-00',
        'Ana Silva',
        'ana@techcorp.com.br',
        '(11) 99999-9999',
        'diamond',
        6000000,
        'closed',
        NOW() - INTERVAL '30 days',
        'https://via.placeholder.com/300',
        'https://techcorp.com.br',
        'Patrocinador principal do evento.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        '550e8400-e29b-41d4-a716-446655440000',
        'InnovateLabs',
        'InnovateLabs',
        '20.000.000/0001-00',
        'Bruno Mendes',
        'bruno@innovatelabs.com.br',
        '(21) 88888-8888',
        'gold',
        3000000,
        'closed',
        NOW() - INTERVAL '20 days',
        'https://via.placeholder.com/300',
        'https://innovatelabs.com.br',
        'Patrocinador gold.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666663',
        '550e8400-e29b-41d4-a716-446655440000',
        'CloudSys',
        'CloudSys Tecnologia',
        '30.000.000/0001-00',
        'Carla Rocha',
        'carla@cloudsys.com.br',
        '(31) 77777-7777',
        'silver',
        1500000,
        'negotiation',
        NULL,
        NULL,
        'https://cloudsys.com.br',
        'Em negociação.',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET company_name = EXCLUDED.company_name,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- ENTREGÁVEIS DE PATROCINADORES
-- ============================================================
INSERT INTO public.sponsor_deliverables (
        sponsor_id,
        item,
        description,
        status,
        deadline,
        completed_at,
        notes,
        created_at
    )
VALUES (
        '66666666-6666-6666-6666-666666666661',
        'Palestra 20min',
        'Palestra no palco principal',
        'completed',
        '2026-04-01',
        NOW() - INTERVAL '10 days',
        'Tema aprovado.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666661',
        'Stand 6x4m',
        'Stand premium na área de exposição',
        'completed',
        '2026-05-15',
        NOW() - INTERVAL '5 days',
        'Montagem concluída.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666661',
        'Logo em todos os materiais',
        'Logo em banners, site, etc.',
        'in_progress',
        '2026-05-01',
        NULL,
        'Em produção.',
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        'Stand 4x3m',
        'Stand na área de exposição',
        'in_progress',
        '2026-05-15',
        NULL,
        NULL,
        NOW()
    ),
    (
        '66666666-6666-6666-6666-666666666662',
        'Logo no site',
        'Logo no site do evento',
        'completed',
        '2026-03-01',
        NOW() - INTERVAL '15 days',
        NULL,
        NOW()
    ) ON CONFLICT DO NOTHING;
-- ============================================================
-- TRANSAÇÕES FINANCEIRAS
-- ============================================================
INSERT INTO public.transactions (
        id,
        project_id,
        type,
        category,
        description,
        amount,
        date,
        status,
        payment_method,
        payment_provider,
        related_type,
        notes,
        created_at
    )
VALUES (
        '77777777-7777-7777-7777-777777777771',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Inscrições',
        'João Silva - Passe Pro',
        49700,
        '2026-01-15',
        'completed',
        'credit_card',
        'stripe',
        'registration',
        'Pagamento confirmado.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777772',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Patrocínio',
        'TechCorp - Diamond',
        6000000,
        '2026-01-10',
        'completed',
        'transfer',
        'manual',
        'sponsor',
        'Patrocínio principal.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777773',
        '550e8400-e29b-41d4-a716-446655440000',
        'expense',
        'Venue',
        'Boulevard Hotel - Caução',
        1800000,
        '2026-01-05',
        'completed',
        'transfer',
        'manual',
        NULL,
        'Caução do local.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777774',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Startups',
        'TechStart Brasil - Pitch',
        250000,
        '2026-01-12',
        'completed',
        'pix',
        'stripe',
        'startup',
        'Taxa de participação startup.',
        NOW()
    ),
    (
        '77777777-7777-7777-7777-777777777775',
        '550e8400-e29b-41d4-a716-446655440000',
        'income',
        'Patrocínio',
        'InnovateLabs - Gold',
        3000000,
        '2026-01-20',
        'completed',
        'transfer',
        'manual',
        'sponsor',
        'Patrocínio gold.',
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET description = EXCLUDED.description,
    status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- INSCRIÇÕES (exemplo)
-- ============================================================
INSERT INTO public.registrations (
        id,
        project_id,
        user_id,
        ticket_type,
        status,
        ticket_number,
        qr_code,
        amount,
        discount_amount,
        final_amount,
        payment_method,
        payment_provider,
        payment_status,
        payment_date,
        checked_in,
        created_at
    )
VALUES (
        '88888888-8888-8888-8888-888888888881',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000002',
        'pro',
        'paid',
        NULL,
        'qr-data-1',
        49700,
        0,
        49700,
        'credit_card',
        'stripe',
        'completed',
        NOW() - INTERVAL '10 days',
        FALSE,
        NOW()
    ),
    (
        '88888888-8888-8888-8888-888888888882',
        '550e8400-e29b-41d4-a716-446655440000',
        '00000000-0000-0000-0000-000000000003',
        'vip',
        'paid',
        NULL,
        'qr-data-2',
        250000,
        0,
        250000,
        'pix',
        'stripe',
        'completed',
        NOW() - INTERVAL '5 days',
        FALSE,
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET status = EXCLUDED.status,
    updated_at = NOW();
-- ============================================================
-- NOTIFICAÇÕES (Idempotente)
-- ============================================================
DO $$
BEGIN
    -- Notificação para João Silva
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000002', 'Bem-vindo ao Growth Summit 2026!', 'Sua inscrição foi confirmada. Estamos ansiosos para vê-lo no evento.', 'success', '/minha-area', 'Ver minha área', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Notificação para João Silva (Perfil)
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000002') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000002', 'Complete seu perfil', 'Adicione mais informações ao seu perfil para aproveitar melhor o evento.', 'info', '/minha-area/dados', 'Completar perfil', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;

    -- Notificação para Dr. Fernando Lima
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000003') THEN
        INSERT INTO public.notifications (user_id, title, message, type, action_url, action_text, read, created_at)
        VALUES ('00000000-0000-0000-0000-000000000003', 'Nova solicitação de mentoria', 'Você recebeu uma nova solicitação de mentoria.', 'info', '/mentor-area/mentorias', 'Ver solicitações', FALSE, NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;