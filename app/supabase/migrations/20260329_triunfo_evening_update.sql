
-- ============================================================
-- GROWTH SUMMIT 2026 - PROGRAMAÇÃO NOTURNA TRIUNFO
-- Data: 2026-03-29
-- ============================================================

-- 1. LIMPA PROGRAMAÇÃO ANTIGA DO TRIUNFO (Para evitar duplicidade)
DELETE FROM public.programacao_evento 
WHERE project_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- 2. GARANTE COLUNA TRACK (Failsafe)
ALTER TABLE IF EXISTS public.programacao_evento ADD COLUMN IF NOT EXISTS track TEXT;

-- 3. INSERE NOVA PROGRAMAÇÃO (FOCO NOTURNO)
INSERT INTO public.programacao_evento (
    id, project_id, title, description, type, track, day, start_time, end_time, room, max_capacity, category, speakers
) VALUES 
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Abertura dos Portões & Networking', 'Credenciamento e recepção dos participantes com welcome coffee.', 'checkin', 'Geral', 1, '17:00:00', '18:00:00', 'Espaço Parque', 2000, 'noturna', ARRAY['Staff Growth']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Abertura Oficial: Growth Experience 2026', 'Boas-vindas e introdução ao ecossistema de inovação.', 'palestra', 'Main Stage', 1, '18:00:00', '18:30:00', 'Salão Principal', 2000, 'noturna', ARRAY['Organização']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Talkshow: Inovação e Negócios no Sertão', 'Debate com empreendedores locais sobre os desafios e oportunidades da região.', 'talkshow', 'Main Stage', 1, '18:30:00', '19:30:00', 'Salão Principal', 2000, 'noturna', ARRAY['Convidados Especiais', 'Mediador']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Palestra Magna: O Futuro da Gestão', 'Tendências globais de gestão e marketing para 2026.', 'palestra', 'Main Stage', 1, '19:30:00', '20:30:00', 'Salão Principal', 2000, 'noturna', ARRAY['Palestrante Confirmado']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Talkshow Final: Perguntas e Respostas', 'Espaço aberto para interação direta com os palestrantes da noite.', 'talkshow', 'Main Stage', 1, '20:30:00', '21:15:00', 'Salão Principal', 2000, 'noturna', ARRAY['Todos os Palestrantes']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Networking & Encerramento', 'Momento de conexões finais e coquetel de encerramento.', 'social', 'Lounge', 1, '21:15:00', '22:00:00', 'Área de Convívio', 2000, 'noturna', ARRAY['Staff Growth']);

-- 3. ATUALIZA INFORMAÇÕES DO PROJETO PARA REFLETIR PROGRAMAÇÃO NOTURNA
UPDATE public.projects 
SET 
  name = 'Growth Experience Triunfo - Pocket Edition (Noturno)',
  short_description = 'Programação Noturna | Triunfo-PE',
  description = 'Uma edição exclusiva focada em conexões de alto nível. Programação concentrada no período noturno com palestras magnas, talkshows e networking estratégico. Tudo gratuito em 16 de abril de 2026.'
WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

NOTIFY pgrst, 'reload schema';
