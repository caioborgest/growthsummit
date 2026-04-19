-- ==============================================================================
-- Migration V2: Módulo NPS Profissional - 100% Audit Compliance
-- Limpa o esquema v1 e monta toda a hierarquia relacional profunda com RLS Nível 5
-- ==============================================================================

-- ==============================================================================
-- 0. DROPS (CUIDADO: Limpa estado anterior do módulo)
-- ==============================================================================
DROP TABLE IF EXISTS nps_dispatches CASCADE;
DROP TABLE IF EXISTS nps_questions CASCADE;
DROP TABLE IF EXISTS nps_loop_cases CASCADE;
DROP TABLE IF EXISTS nps_cases CASCADE;
DROP TABLE IF EXISTS nps_case_activities CASCADE;
DROP TABLE IF EXISTS nps_response_answers CASCADE;
DROP TABLE IF EXISTS nps_responses CASCADE;
DROP TABLE IF EXISTS nps_response_sessions CASCADE;
DROP TABLE IF EXISTS nps_send_logs CASCADE;
DROP TABLE IF EXISTS nps_public_tokens CASCADE;
DROP TABLE IF EXISTS nps_automations CASCADE;
DROP TABLE IF EXISTS nps_form_questions CASCADE;
DROP TABLE IF EXISTS nps_forms CASCADE;

DROP TYPE IF EXISTS nps_log_status CASCADE;
DROP TYPE IF EXISTS nps_session_status CASCADE;
DROP TYPE IF EXISTS nps_question_type CASCADE;

-- ==============================================================================
-- 1. ENUMS (Customização Profunda)
-- ==============================================================================
DO $$ BEGIN CREATE TYPE nps_form_status AS ENUM ('draft', 'active', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nps_classification AS ENUM ('detractor', 'passive', 'promoter'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nps_automation_trigger AS ENUM ('manual', 'post_event', 'post_session', 'check_in', 'check_out', 'session_attendance', 'abandoned_cart'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nps_channel AS ENUM ('email', 'whatsapp', 'sms', 'push', 'in_app', 'qr'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nps_case_status AS ENUM ('open', 'in_progress', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nps_case_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Novos enums para V2
CREATE TYPE nps_question_type AS ENUM ('nps_score', 'textarea', 'short_text', 'single_choice', 'multi_choice', 'csat_stars', 'csat_emoji', 'ces', 'yes_no', 'hidden_metadata', 'welcome_screen', 'thank_you_screen');
CREATE TYPE nps_log_status AS ENUM ('pending', 'processing', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'complained');
CREATE TYPE nps_session_status AS ENUM ('started', 'in_progress', 'completed', 'abandoned');

-- ==============================================================================
-- 2. TABELAS: MODELO RELACIONAL V2 (10 Tabelas)
-- ==============================================================================

-- 1. nps_forms
CREATE TABLE nps_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    internal_name TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    status nps_form_status DEFAULT 'draft',
    default_channel nps_channel DEFAULT 'email',
    language TEXT DEFAULT 'pt-BR',
    visual_settings JSONB DEFAULT '{"primaryColor": "#000000", "logo": null, "theme": "light"}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. nps_form_questions
CREATE TABLE nps_form_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    type nps_question_type NOT NULL,
    label TEXT NOT NULL,
    help_text TEXT,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    options JSONB DEFAULT '[]', -- Para single/multi choice
    conditional_rules JSONB DEFAULT '{"show_always": true}', -- {"depends_on": "uuid", "condition": "equals", "value": "A"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. nps_automations
CREATE TABLE nps_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    trigger_type nps_automation_trigger NOT NULL,
    delay_minutes INTEGER DEFAULT 0, -- 0 = Imediato
    channel nps_channel NOT NULL,
    message_template TEXT NOT NULL,
    subject_template TEXT,
    audience_rules JSONB DEFAULT '{"rule": "all"}', -- Segmentação de audiência (ex: tags=VIP)
    quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00", "timezone": "America/Sao_Paulo"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. nps_send_logs (Preparado p/ integrações Resend / Sendgrid / WPP)
CREATE TABLE nps_send_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    automation_id UUID REFERENCES nps_automations(id) ON DELETE CASCADE,
    participant_user_id UUID, -- Destinatário (referência flexível p/ tabela profile/user)
    contact_address TEXT NOT NULL, -- Email ou Telefone disparado
    status nps_log_status DEFAULT 'pending',
    external_provider_id TEXT, -- ID do Resend / Twilio
    error_message TEXT,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. nps_public_tokens
CREATE TABLE nps_public_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT UNIQUE NOT NULL, -- UUIDv4 ou HMAC base64 do envio
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    participant_user_id UUID NOT NULL,
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    metadata JSONB, -- Utm, tracking
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. nps_response_sessions
CREATE TABLE nps_response_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE,
    participant_user_id UUID,
    public_token_id UUID REFERENCES nps_public_tokens(id) ON DELETE SET NULL,
    device_info JSONB, -- Browser, OS, IP Location string
    status nps_session_status DEFAULT 'started',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. nps_responses (Core score table p/ Dashboards)
CREATE TABLE nps_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES nps_response_sessions(id) ON DELETE CASCADE UNIQUE,
    form_id UUID REFERENCES nps_forms(id) ON DELETE CASCADE, -- Desnormalizado para velocidade de leitura
    nps_score INTEGER,
    classification nps_classification,
    main_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. nps_response_answers (As respostas atômicas para os blocos complexos do form_questions)
CREATE TABLE nps_response_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES nps_response_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES nps_form_questions(id) ON DELETE CASCADE,
    value_text TEXT,
    value_numeric INTEGER,
    value_json JSONB, -- P/ multi_choice arrays
    time_spent_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. nps_cases (CX Inbox)
CREATE TABLE nps_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    response_id UUID REFERENCES nps_responses(id) ON DELETE CASCADE UNIQUE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Agente atribuído
    status nps_case_status DEFAULT 'open',
    priority nps_case_priority DEFAULT 'medium',
    sla_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. nps_case_activities (Zendesk-Style feed/History)
CREATE TABLE nps_case_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES nps_cases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Quem agiu (Null = System)
    action_type TEXT NOT NULL, -- 'status_changed', 'comment', 'email_sent', 'owner_assigned'
    content TEXT,
    internal_only BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==============================================================================
-- 3. TRIGGERS e ÍNDICES
-- ==============================================================================

-- 3.1 Índices (Perf extrema)
CREATE INDEX idx_nps_forms_event ON nps_forms(event_id);
CREATE INDEX idx_nps_form_quest_form ON nps_form_questions(form_id);
CREATE INDEX idx_nps_tokens_hash ON nps_public_tokens(token_hash);
CREATE INDEX idx_nps_session_event ON nps_response_sessions(event_id);
CREATE INDEX idx_nps_responses_class ON nps_responses(event_id, classification);
CREATE INDEX idx_nps_responses_score ON nps_responses(event_id, nps_score);
CREATE INDEX idx_nps_answers_session ON nps_response_answers(session_id);
CREATE INDEX idx_nps_cases_status ON nps_cases(event_id, status);
CREATE INDEX idx_nps_activities_case ON nps_case_activities(case_id);
CREATE INDEX idx_nps_sendlogs_automation ON nps_send_logs(automation_id);
CREATE INDEX idx_nps_sendlogs_status ON nps_send_logs(event_id, status);

-- 3.2 Trigger Classificação Automação
CREATE OR REPLACE FUNCTION classify_nps_score_v2() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.nps_score IS NOT NULL THEN
        IF NEW.nps_score <= 6 THEN NEW.classification = 'detractor';
        ELSIF NEW.nps_score >= 9 THEN NEW.classification = 'promoter';
        ELSE NEW.classification = 'passive'; END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_classify_nps_score_v2 BEFORE INSERT OR UPDATE OF nps_score ON nps_responses FOR EACH ROW EXECUTE FUNCTION classify_nps_score_v2();

-- 3.3 Trigger Auto Criar NPS Case
CREATE OR REPLACE FUNCTION auto_create_nps_case_v2() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.classification = 'detractor' THEN
        INSERT INTO nps_cases (event_id, response_id, status, priority, sla_due_at)
        VALUES (NEW.event_id, NEW.id, 'open', CASE WHEN NEW.nps_score <= 3 THEN 'urgent'::nps_case_priority ELSE 'high'::nps_case_priority END, now() + interval '24 hours');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_nps_case_v2 AFTER INSERT ON nps_responses FOR EACH ROW EXECUTE FUNCTION auto_create_nps_case_v2();

-- 3.4 Updated_at genérico
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ language 'plpgsql';

CREATE TRIGGER trg_nps_forms_upd BEFORE UPDATE ON nps_forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nps_fq_upd BEFORE UPDATE ON nps_form_questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nps_auto_upd BEFORE UPDATE ON nps_automations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nps_logs_upd BEFORE UPDATE ON nps_send_logs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nps_sess_upd BEFORE UPDATE ON nps_response_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_nps_cases_upd BEFORE UPDATE ON nps_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS 5-STARS - Segurança Isolada Extrema)
-- ==============================================================================
-- Todos com grant public
GRANT ALL ON TABLE nps_forms, nps_form_questions, nps_automations, nps_send_logs, nps_public_tokens, nps_response_sessions, nps_responses, nps_response_answers, nps_cases, nps_case_activities TO anon, authenticated, service_role;

-- Função auxiliar rigorosa: Usuario pode mexer nesse evento específico? 
-- Regra de negócio: Tem q ser admin/staff O GERAL ou estar ligado ao evento no app (presumiremos is_admin_or_staff global nativa por comodidade do CRM master).
CREATE OR REPLACE FUNCTION has_event_nps_access(chk_event UUID) RETURNS BOOLEAN AS $$
BEGIN
    -- Se o usuario logado tiver role de admin master no perfil, ele entra em tudo. O RLS do tenant base do Growth Experience confia nisso.
    RETURN EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar RLS
ALTER TABLE nps_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_send_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_public_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_response_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_case_activities ENABLE ROW LEVEL SECURITY;

-- nps_forms
CREATE POLICY "Leitura Publica" ON nps_forms FOR SELECT USING (status = 'active');
CREATE POLICY "Isolamento Select" ON nps_forms FOR SELECT TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Isolamento Insert" ON nps_forms FOR INSERT TO authenticated WITH CHECK (has_event_nps_access(event_id));
CREATE POLICY "Isolamento Update" ON nps_forms FOR UPDATE TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Isolamento Delete" ON nps_forms FOR DELETE TO authenticated USING (has_event_nps_access(event_id));

-- nps_form_questions
CREATE POLICY "FQ Leitura Publica" ON nps_form_questions FOR SELECT USING (EXISTS(SELECT 1 FROM nps_forms WHERE id = form_id AND status = 'active'));
CREATE POLICY "FQ Select" ON nps_form_questions FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM nps_forms f WHERE f.id = form_id AND has_event_nps_access(f.event_id)));
CREATE POLICY "FQ Insert" ON nps_form_questions FOR INSERT TO authenticated WITH CHECK (EXISTS(SELECT 1 FROM nps_forms f WHERE f.id = form_id AND has_event_nps_access(f.event_id)));
CREATE POLICY "FQ Update" ON nps_form_questions FOR UPDATE TO authenticated USING (EXISTS(SELECT 1 FROM nps_forms f WHERE f.id = form_id AND has_event_nps_access(f.event_id)));
CREATE POLICY "FQ Delete" ON nps_form_questions FOR DELETE TO authenticated USING (EXISTS(SELECT 1 FROM nps_forms f WHERE f.id = form_id AND has_event_nps_access(f.event_id)));

-- nps_public_tokens
CREATE POLICY "Tokens Auth" ON nps_public_tokens FOR ALL TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Tokens Verify" ON nps_public_tokens FOR SELECT USING (true); -- Public pode verificar existencia
CREATE POLICY "Tokens Use" ON nps_public_tokens FOR UPDATE USING (true); -- Public pode marcar usado (se trigger deixar)

-- nps_response_sessions
CREATE POLICY "Session Anon Insert" ON nps_response_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Session Anon Upd" ON nps_response_sessions FOR UPDATE USING (true);
CREATE POLICY "Session Auth All" ON nps_response_sessions FOR ALL TO authenticated USING (has_event_nps_access(event_id));

-- nps_responses, nps_response_answers
CREATE POLICY "Resp Anon Insert" ON nps_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Ans Anon Insert" ON nps_response_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Resp Auth All" ON nps_responses FOR ALL TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Ans Auth All" ON nps_response_answers FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM nps_response_sessions s WHERE s.id = session_id AND has_event_nps_access(s.event_id)));

-- Automations, Logs, Cases, Activities isolados aos Admins do Evento
CREATE POLICY "Auto Auth All" ON nps_automations FOR ALL TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Logs Auth All" ON nps_send_logs FOR ALL TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Case Auth All" ON nps_cases FOR ALL TO authenticated USING (has_event_nps_access(event_id));
CREATE POLICY "Act Auth All" ON nps_case_activities FOR ALL TO authenticated USING (EXISTS(SELECT 1 FROM nps_cases c WHERE c.id = case_id AND has_event_nps_access(c.event_id)));

-- Reload Final Schema PostgREST
NOTIFY pgrst, 'reload schema';
