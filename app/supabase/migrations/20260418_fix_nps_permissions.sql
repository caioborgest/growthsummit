-- Migration: Correção de permissões NPS
-- Descrição: Garante que as tabelas de NPS tenham permissões de acesso para os roles do Supabase.

-- Apenas os GRANTS são necessários agora, pois as políticas já existem e o erro anterior foi de duplicidade nelas.
GRANT ALL ON TABLE event_nps_surveys TO anon, authenticated, service_role;
GRANT ALL ON TABLE event_nps_responses TO anon, authenticated, service_role;
