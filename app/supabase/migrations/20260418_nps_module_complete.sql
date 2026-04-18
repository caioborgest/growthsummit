-- ==============================================================================
-- Migration: Módulo Profissional de NPS (Net Promoter Score) e Loop Fechado
-- Descrição: Estrutura completa para gestão de pesquisas NPS, campanhas, respostas e cases de detratores.
-- ==============================================================================

-- 1. Enums (Tipos predefinidos)
DO $$ BEGIN
    CREATE TYPE nps_form_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_question_type AS ENUM ('nps_score', 'textarea', 'short_text', 'single_choice', 'multi_choice', 'csat', 'ces', 'yes_no', 'hidden_metadata');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_classification AS ENUM ('detractor', 'passive', 'promoter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_automation_trigger AS ENUM ('manual', 'post_event', 'post_session', 'check_in', 'check_out', 'session_attendance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_channel AS ENUM ('email', 'whatsapp', 'sms', 'push', 'in_app', 'qr');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_case_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nps_case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop antigas tabelas se existirem para evitar conflitos (foram criadas hoje mais cedo)
DROP TABLE IF EXISTS event_nps_responses CASCADE;
DROP TABLE IF EXISTS event_nps_surveys CASCADE;

-- ==============================================================================
-- 2. Estrutura de Tabelas
-- ==============================================================================

-- 2.1 Formulários NPS (nps_forms)
CREATE TABLE IF NOT EXISTS nps_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    internal_name TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    status nps_form_status DEFAULT 'draft',
    default_channel nps_channel DEFAULT 'email',
    language TEXT DEFAULT 'pt-BR',
    
    -- Configuração Visual
    visual_settings JSONB DEFAULT '{"primaryColor": "#000000", "logo": null}',
    
    -- Configuração Base NPS
    nps_question TEXT DEFAULT 'De 0 a 10, o quanto você recomendaria este evento para um amigo ou colega?',
    min_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 10,
    min_label TEXT DEFAULT 'Pouco provável',
    max_label TEXT DEFAULT 'Muito provável',
    
    -- Lógica de Agradecimento
    thanks_promoter TEXT DEFAULT 'Excelente! Obrigado pelo feedback e por ser nosso promotor.',
    thanks_passive TEXT DEFAULT 'Obrigado pelo seu feedback! Vamos trabalhar para melhorar.',
    thanks_detractor TEXT DEFAULT 'Lamentamos que sua experiência não tenha sido a melhor. Agradecemos o feedback para melhorar.',
    
    -- Tracking
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 Perguntas Adicionais (nps_questions)
CREATE TABLE IF NOT EXISTS nps_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    type nps_question_type NOT NULL,
    label TEXT NOT NULL,
    help_text TEXT,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    
    -- JSON para regras condicionais e opções
    options JSONB DEFAULT '[]'::jsonb, -- ex: [{"label": "A", "value": "a"}]
    conditional_rules JSONB DEFAULT '{}'::jsonb, -- ex: {"show_if": {"score": "<=", "value": 6}}
    
    tags TEXT[],
    slug TEXT NOT NULL, -- chave técnica
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(form_id, slug) -- Um form não pode ter perguntas com a mesma chave
);

-- 2.3 Cadência de Disparos/Automações (nps_automations)
CREATE TABLE IF NOT EXISTS nps_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    
    -- Regras de Disparo
    trigger_type nps_automation_trigger NOT NULL,
    channel nps_channel NOT NULL,
    delay_amount INTEGER DEFAULT 0,
    delay_unit TEXT DEFAULT 'hours', -- 'minutes', 'hours', 'days'
    
    -- Filtros e Controle
    audience_rules JSONB DEFAULT '{}'::jsonb, -- Segmentação baseada em ticket, lote, etc.
    quiet_hours JSONB DEFAULT '{"start": "22:00", "end": "08:00"}'::jsonb,
    dedup_window_hours INTEGER DEFAULT 720, -- Default de 30 dias para evitar spam no mesmo evento
    active_from TIMESTAMP WITH TIME ZONE,
    active_until TIMESTAMP WITH TIME ZONE,
    
    -- Templates
    message_template TEXT NOT NULL,
    subject_template TEXT,
    sender_name TEXT,
    utm_params JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 Registros de Envios (nps_dispatches)
CREATE TABLE IF NOT EXISTS nps_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES nps_automations(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    channel nps_channel NOT NULL,
    
    status TEXT DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, failed
    failure_reason TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Respostas Coletadas (nps_responses)
CREATE TABLE IF NOT EXISTS nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    dispatch_id UUID REFERENCES nps_dispatches(id) ON DELETE SET NULL,
    
    -- Contexto (se avaliando partes específicas do evento)
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    speaker_id UUID, -- Poderia ser FK para users ou speakers
    sponsor_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    -- Resultado
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    classification nps_classification NOT NULL,
    main_comment TEXT,
    
    -- Respostas Adicionais (mapeado pelas slugs de nps_questions)
    answers JSONB DEFAULT '{}'::jsonb,
    
    channel nps_channel DEFAULT 'in_app',
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 Loop Fechado / Cases (nps_loop_cases)
CREATE TABLE IF NOT EXISTS nps_loop_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    response_id UUID REFERENCES nps_responses(id) ON DELETE CASCADE,
    
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status nps_case_status DEFAULT 'open',
    priority nps_case_priority DEFAULT 'medium',
    
    sla_due_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    root_cause TEXT,
    action_taken TEXT,
    recovery_outcome TEXT, -- ex: "recovered", "lost", "neutral"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. Índices (Para otimização de Dashboard e Consultas)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_nps_forms_project ON nps_forms(project_id);
CREATE INDEX IF NOT EXISTS idx_nps_automations_project ON nps_automations(project_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_project ON nps_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_class ON nps_responses(project_id, classification);
CREATE INDEX IF NOT EXISTS idx_nps_responses_score ON nps_responses(project_id, score);
CREATE INDEX IF NOT EXISTS idx_nps_cases_project ON nps_loop_cases(project_id);
CREATE INDEX IF NOT EXISTS idx_nps_cases_status ON nps_loop_cases(project_id, status);

-- ==============================================================================
-- 4. Funções e Triggers
-- ==============================================================================

-- 4.1 Trigger para auto-classificar a nota NPS antes do INSERT
CREATE OR REPLACE FUNCTION classify_nps_score()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.score <= 6 THEN
        NEW.classification = 'detractor';
    ELSIF NEW.score >= 9 THEN
        NEW.classification = 'promoter';
    ELSE
        NEW.classification = 'passive';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_classify_nps_score
BEFORE INSERT OR UPDATE OF score ON nps_responses
FOR EACH ROW EXECUTE FUNCTION classify_nps_score();

-- 4.2 Trigger para criar Case no Loop Fechado se for Detrator
CREATE OR REPLACE FUNCTION auto_create_nps_case()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.classification = 'detractor' THEN
        INSERT INTO nps_loop_cases (
            project_id, 
            response_id, 
            status, 
            priority, 
            sla_due_at
        ) VALUES (
            NEW.project_id, 
            NEW.id, 
            'open', 
            CASE WHEN NEW.score <= 3 THEN 'high'::nps_case_priority ELSE 'medium'::nps_case_priority END,
            now() + interval '24 hours' -- SLA padrão de 24h
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_nps_case
AFTER INSERT ON nps_responses
FOR EACH ROW EXECUTE FUNCTION auto_create_nps_case();

-- 4.3 Triggers de Updated At
CREATE OR REPLACE FUNCTION update_nps_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_nps_forms_upd BEFORE UPDATE ON nps_forms FOR EACH ROW EXECUTE FUNCTION update_nps_updated_at_column();
CREATE TRIGGER trg_nps_automations_upd BEFORE UPDATE ON nps_automations FOR EACH ROW EXECUTE FUNCTION update_nps_updated_at_column();
CREATE TRIGGER trg_nps_loop_cases_upd BEFORE UPDATE ON nps_loop_cases FOR EACH ROW EXECUTE FUNCTION update_nps_updated_at_column();

-- ==============================================================================
-- 5. Row Level Security (RLS) e Grants
-- ==============================================================================

-- Grants
GRANT ALL ON TABLE nps_forms TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_questions TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_automations TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_dispatches TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_responses TO anon, authenticated, service_role;
GRANT ALL ON TABLE nps_loop_cases TO anon, authenticated, service_role;

-- Habilitar RLS
ALTER TABLE nps_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_loop_cases ENABLE ROW LEVEL SECURITY;

-- Helper Function para checar se o usuário atual é admin do app (staff ou admin master)
-- Baseado no perfil do usuário
CREATE OR REPLACE FUNCTION is_admin_or_staff() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5.1 Políticas para Forms
CREATE POLICY "Forms públicos são visíveis" ON nps_forms FOR SELECT USING (status IN ('active', 'archived'));
CREATE POLICY "Admins gerenciam forms" ON nps_forms FOR ALL USING (is_admin_or_staff());

-- 5.2 Políticas para Questions
CREATE POLICY "Questions públicas visíveis" ON nps_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM nps_forms WHERE id = nps_questions.form_id AND status IN ('active', 'archived'))
);
CREATE POLICY "Admins gerenciam questions" ON nps_questions FOR ALL USING (is_admin_or_staff());

-- 5.3 Políticas para Automations
CREATE POLICY "Apenas admin vê automations" ON nps_automations FOR ALL USING (is_admin_or_staff());

-- 5.4 Políticas para Dispatches
CREATE POLICY "Apenas admin vê dispatches" ON nps_dispatches FOR ALL USING (is_admin_or_staff());

-- 5.5 Políticas para Responses
-- Participante pode inserir sua resposta
CREATE POLICY "Participante insere resposta" ON nps_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Participante vê suas respostas" ON nps_responses FOR SELECT USING (user_id = auth.uid());
-- Admin pode ver tudo
CREATE POLICY "Admin vê todas responses" ON nps_responses FOR SELECT USING (is_admin_or_staff());

-- 5.6 Políticas para Cases
CREATE POLICY "Apenas admin gerencia cases" ON nps_loop_cases FOR ALL USING (is_admin_or_staff());

-- ==============================================================================
-- 6. DADOS FAKE (SEEDS DE EXEMPLO) - Opcional e gerado após criação do Admin se houver algum projeto
-- Para evitar erros caso um projeto não exista, encapsulamos num bloco condicional DO
-- ==============================================================================
DO $$
DECLARE
    v_project_id UUID;
    v_form_id UUID;
BEGIN
    -- Busca primeiro projeto apenas de exemplo
    SELECT id INTO v_project_id FROM projects LIMIT 1;
    
    IF v_project_id IS NOT NULL THEN
        -- Cria um Form Padrão
        INSERT INTO nps_forms (project_id, internal_name, description, objective, status)
        VALUES (v_project_id, 'NPS de Satisfação Geral', 'Pesquisa principal após o evento.', 'Medir o sucesso global.', 'active')
        RETURNING id INTO v_form_id;

        -- Adiciona algumas perguntas
        INSERT INTO nps_questions (form_id, type, label, is_required, order_index, slug)
        VALUES 
            (v_form_id, 'textarea', 'O que motivou sua nota?', false, 1, 'motivo_nota'),
            (v_form_id, 'single_choice', 'Como você avalia nossa organização?', true, 2, 'avaliacao_org');
            
        -- Atualiza opcoes da pergunta single choice
        UPDATE nps_questions SET options = '[{"label": "Excelente", "value": "5"}, {"label": "Boa", "value": "4"}, {"label": "Regular", "value": "3"}, {"label": "Ruim", "value": "2"}, {"label": "Muito Ruim", "value": "1"}]'::jsonb 
        WHERE slug = 'avaliacao_org' AND form_id = v_form_id;

        -- Cria Automação
        INSERT INTO nps_automations (project_id, form_id, name, is_active, trigger_type, channel, message_template, subject_template)
        VALUES (v_project_id, v_form_id, 'Disparo Pós-Evento', true, 'post_event', 'email', 'Olá, {{name}}. Conte como foi sua experiência: {{link}}', 'Ajude a melhorar o evento!');
    END IF;
END $$;
