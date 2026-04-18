-- Migration: Módulo de NPS (Net Promoter Score)
-- Descrição: Criação das tabelas para gestão de pesquisas NPS e coleta de respostas.

-- 1. Tabela de Configuração de Pesquisas NPS
CREATE TABLE IF NOT EXISTS event_nps_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    target_audience TEXT DEFAULT 'all', -- 'all', 'pro', 'vip'
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Respostas NPS
CREATE TABLE IF NOT EXISTS event_nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES event_nps_surveys(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    comment TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unicidade: Um participante só responde uma vez por pesquisa
    CONSTRAINT unique_registration_response UNIQUE(survey_id, registration_id)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_nps_survey_project ON event_nps_surveys(project_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_survey ON event_nps_responses(survey_id);

-- 4. RLS (Row Level Security) - Permissões
ALTER TABLE event_nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_nps_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para Surveys (Leitura pública se ativa, escrita admin)
CREATE POLICY "Surveys são visíveis por todos" ON event_nps_surveys
    FOR SELECT USING (active = true);

CREATE POLICY "Admin gerencia surveys" ON event_nps_surveys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Políticas para Respostas (Inserção autenticada, leitura admin)
CREATE POLICY "Qualquer participante logado pode responder" ON event_nps_responses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participante vê sua própria resposta" ON event_nps_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin vê todas as respostas" ON event_nps_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_nps_surveys_updated_at
    BEFORE UPDATE ON event_nps_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
