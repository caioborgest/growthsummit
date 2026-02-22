-- ============================================================
-- Growth Experience Triunfo-PE 2026  — Seed do Projeto
-- Execute este script no SQL Editor do Supabase Dashboard
-- É seguro executar múltiplas vezes (ON CONFLICT DO NOTHING)
-- ============================================================
-- 1. Inserir o projeto principal
INSERT INTO public.projects (
        id,
        name,
        slug,
        type,
        description,
        short_description,
        location,
        city,
        state,
        address,
        country,
        start_date,
        end_date,
        status,
        primary_color,
        secondary_color,
        -- capacidade
        max_registrations,
        max_mentors,
        max_startups,
        max_companies,
        -- módulos
        enable_b2b,
        enable_mentoring,
        enable_startups,
        enable_check_in,
        -- preços em centavos (R$ 179,99 night / gratuito cursos)
        ticket_price_standard,
        ticket_price_pro,
        ticket_price_vip,
        -- metas
        target_registrations,
        target_revenue,
        created_at,
        updated_at
    )
VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        -- UUID fixo → slug ge-triunfo-2026
        'Growth Experience Triunfo-PE 2026',
        'ge-triunfo-2026',
        'growth_experience',
        'A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking, mentoria 1:1 e Arena Pitch para startups. Tudo gratuito no dia 09 de abril de 2026.',
        'Edição Triunfo-PE',
        'Espaço Parque',
        'Triunfo',
        'PE',
        'Espaço Parque — Triunfo, Pernambuco',
        'BR',
        '2026-04-09',
        '2026-04-09',
        'active',
        '#FE4C38',
        -- brand-orange-coral
        '#FF6B35',
        -- brand-orange-intense
        500,
        -- max inscrições
        30,
        -- max mentores
        20,
        -- max startups
        40,
        -- max empresas B2B
        TRUE,
        -- B2B habilitado
        TRUE,
        -- mentoring habilitado
        TRUE,
        -- startups habilitado
        TRUE,
        -- check-in habilitado
        0,
        -- ticket standard: GRATUITO
        17999,
        -- ticket pro: R$ 179,99 (palestras noturnas)
        0,
        -- ticket vip: não utilizado
        500,
        -- meta de inscrições
        8000000,
        -- meta de receita (R$ 80.000 em centavos × 100)
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    updated_at = NOW();
-- 2. Confirmar slug único (caso já exista com outro id)
-- Se já existir um row com slug='ge-triunfo-2026' mas id diferente, atualizamos as configurações
UPDATE public.projects
SET status = 'active',
    enable_b2b = TRUE,
    enable_mentoring = TRUE,
    enable_startups = TRUE,
    enable_check_in = TRUE,
    max_registrations = 500,
    ticket_price_standard = 0,
    ticket_price_pro = 17999,
    updated_at = NOW()
WHERE slug = 'ge-triunfo-2026'
    AND id <> 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- 3. Verificar resultado
SELECT id,
    name,
    slug,
    status,
    city,
    state,
    start_date,
    enable_b2b,
    enable_mentoring,
    enable_startups,
    ticket_price_standard / 100.0 AS preco_standard,
    ticket_price_pro / 100.0 AS preco_pro,
    created_at
FROM public.projects
WHERE slug = 'ge-triunfo-2026';