-- ============================================================
-- VERIFICAÇÃO: Growth Experience Triunfo-PE
-- Execute este SQL para verificar se tudo está OK
-- ============================================================
-- Verificar se as tabelas existem
SELECT 'inscricoes_growth_experience_triunfo' as tabela,
    COUNT(*) as total_registros
FROM public.inscricoes_growth_experience_triunfo
UNION ALL
SELECT 'startups_arena_pitch' as tabela,
    COUNT(*) as total_registros
FROM public.startups_arena_pitch
UNION ALL
SELECT 'rodada_negocios_b2b' as tabela,
    COUNT(*) as total_registros
FROM public.rodada_negocios_b2b
UNION ALL
SELECT 'pagamentos_stripe' as tabela,
    COUNT(*) as total_registros
FROM public.pagamentos_stripe;
-- Verificar estrutura das tabelas
SELECT table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN (
        'inscricoes_growth_experience_triunfo',
        'startups_arena_pitch',
        'rodada_negocios_b2b',
        'pagamentos_stripe'
    )
ORDER BY table_name,
    ordinal_position;
-- Verificar RLS policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN (
        'inscricoes_growth_experience_triunfo',
        'startups_arena_pitch',
        'rodada_negocios_b2b',
        'pagamentos_stripe'
    )
ORDER BY tablename,
    policyname;
-- Verificar views
SELECT table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
    AND table_name LIKE 'estatisticas_%';