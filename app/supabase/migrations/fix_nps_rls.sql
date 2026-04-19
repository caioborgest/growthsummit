-- ==============================================================================
-- 1. Garante que os privilégios base estão concedidos
-- ==============================================================================
GRANT ALL ON TABLE nps_forms TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_cases TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_responses TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_automations TO anon, authenticated, service_role;

-- ==============================================================================
-- 2. Recria Políticas de Segurança RLS com acesso irrestrito para usuários logados
-- ==============================================================================

-- Tabela: nps_forms
ALTER TABLE nps_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins gerenciam forms" ON nps_forms;
DROP POLICY IF EXISTS "Permitir crud admins forms" ON nps_forms;
CREATE POLICY "Forms all for authenticated" ON nps_forms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Forms select for anon" ON nps_forms FOR SELECT USING (true); -- Permitir o fetch do PublicNPS

-- Tabela: nps_responses
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participante insere resposta" ON nps_responses;
DROP POLICY IF EXISTS "Admin vê todas responses" ON nps_responses;
CREATE POLICY "Responses all access" ON nps_responses FOR ALL USING (true); -- Public envia form e Admin lê via Dashboard

-- Tabela: nps_cases
ALTER TABLE nps_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admin gerencia cases" ON nps_cases;
CREATE POLICY "Loop cases for authenticated" ON nps_cases FOR ALL USING (auth.role() = 'authenticated');

-- Tabela: nps_automations
ALTER TABLE nps_automations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Apenas admin vê automations" ON nps_automations;
CREATE POLICY "Automations for authenticated" ON nps_automations FOR ALL USING (auth.role() = 'authenticated');

-- Recarregar schema cache do PostgREST para o 400 bad request / 403 não voltar a ocorrer
NOTIFY pgrst, 'reload schema';
