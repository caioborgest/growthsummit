-- ============================================================
-- Growth Experience Triunfo-PE 2026 — Seed do Projeto
-- Execute no SQL Editor do Supabase Dashboard
-- Seguro executar múltiplas vezes (ON CONFLICT ... DO UPDATE)
-- ============================================================
-- 1. Inserir / atualizar o projeto
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
        max_registrations,
        max_mentors,
        max_startups,
        max_companies,
        enable_b2b,
        enable_mentoring,
        enable_startups,
        enable_check_in,
        ticket_price_standard,
        ticket_price_pro,
        ticket_price_vip,
        target_registrations,
        target_revenue,
        created_at,
        updated_at
    )
VALUES (
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Growth Experience Triunfo-PE 2026',
        'ge-triunfo-2026',
        'growth_experience',
        'A Maior Exposição de Negócios do Sertão do Pajeú. Capacitação, networking, mentoria 1:1 e Arena Pitch para startups. Tudo gratuito em 09 de abril de 2026.',
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
        '#FF6B35',
        500,
        30,
        20,
        40,
        TRUE,
        TRUE,
        TRUE,
        TRUE,
        0,
        17999,
        0,
        500,
        8000000,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    status = EXCLUDED.status,
    enable_b2b = EXCLUDED.enable_b2b,
    enable_mentoring = EXCLUDED.enable_mentoring,
    enable_startups = EXCLUDED.enable_startups,
    enable_check_in = EXCLUDED.enable_check_in,
    ticket_price_standard = EXCLUDED.ticket_price_standard,
    ticket_price_pro = EXCLUDED.ticket_price_pro,
    updated_at = NOW();
-- 2. Caso já exista com outro UUID (slug único)
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
    ticket_price_standard / 100.0 AS preco_standard_reais,
    ticket_price_pro / 100.0 AS preco_pro_reais,
    created_at
FROM public.projects
WHERE slug = 'ge-triunfo-2026';