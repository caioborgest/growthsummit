-- ============================================================
-- Data: 2026-03-29
-- ============================================================
-- 1. GARANTE QUE O PROJETO EXISTE COM O ID CORRETO (Failsafe)
-- Primeiro, deletamos qualquer projeto antigo com o mesmo slug para evitar erro de duplicidade
DELETE FROM public.projects WHERE slug = 'ge-triunfo-2026' AND id != 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Garantimos que o projeto existe com o ID fixo
INSERT INTO public.projects (id, name, slug, type, status, created_at, updated_at)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Growth Experience Triunfo-PE 2026', 'ge-triunfo-2026', 'growth_experience', 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET slug = EXCLUDED.slug, status = 'active';

-- 2. LIMPA PROGRAMAÇÃO ANTIGA DO TRIUNFO (Para evitar duplicidade)
DELETE FROM public.programacao_evento
WHERE project_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- 3. GARANTE COLUNAS NECESSÁRIAS (Failsafe)
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS track TEXT;
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS day INTEGER DEFAULT 1;
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 2000;
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS registered_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS speakers TEXT[] DEFAULT '{}';
-- 3. INSERE NOVA PROGRAMAÇÃO (FOCO NOTURNO)
INSERT INTO public.programacao_evento (
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
    category,
    speakers
  )
VALUES (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Credenciamento e Exposição de Marcas', 'Networking e conexões no Espaço Parque', 'checkin', 'Geral', 1, '17:00:00', '18:00:00', 'Espaço Parque', 2000, 'noturna', ARRAY['Staff Growth']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jerônimo Freire: Gestão e Liderança', 'Liderança em momentos desafiadores', 'palestra', 'Main Stage', 1, '18:00:00', '19:00:00', 'Salão Principal', 2000, 'noturna', ARRAY['Jerônimo Freire']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Talk Show: Leandro & João Daniel', 'Bastidores de negócios que cresceram no interior', 'talkshow', 'Main Stage', 1, '19:00:00', '20:10:00', 'Salão Principal', 2000, 'noturna', ARRAY['Leandro Batista', 'João Daniel']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dra. Carolinne Castro: Liderança Jurídica', 'Redução de riscos e engajamento de equipes', 'palestra', 'Main Stage', 1, '20:10:00', '21:10:00', 'Salão Principal', 2000, 'noturna', ARRAY['Dra. Carolinne Castro']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Vanylton Matias: Gestão para Escalar', 'Equilíbrio entre resultados e olhar humano', 'palestra', 'Main Stage', 1, '21:10:00', '22:30:00', 'Salão Principal', 2000, 'noturna', ARRAY['Vanylton Matias']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Networking e Encerramento', 'Conexões finais e encerramento oficial (23h).', 'social', 'Lounge', 1, '22:30:00', '23:30:00', 'Área de Convívio', 2000, 'noturna', ARRAY['Staff Growth']);
-- 3. ATUALIZA INFORMAÇÕES DO PROJETO PARA REFLETIR PROGRAMAÇÃO NOTURNA
UPDATE public.projects
SET name = 'Growth Experience Triunfo - Pocket Edition (Noturno)',
  short_description = 'Programação Noturna | Triunfo-PE',
  description = 'Uma edição exclusiva focada em conexões de alto nível. Programação concentrada no período noturno com palestras magnas, talkshows e networking estratégico. Tudo gratuito em 16 de abril de 2026.'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
NOTIFY pgrst,
'reload schema';