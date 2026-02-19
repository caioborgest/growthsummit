-- ============================================
-- MIGRATION: TABELAS PARA GESTÃO DE GRUPOS WHATSAPP
-- Growth Summit Platform
-- ============================================
-- Data: 2026-02-19
-- Descrição: Cria tabelas necessárias para gerenciar grupos do WhatsApp
-- para eventos Growth Summit, Growth Experience e edições

-- ============================================
-- 1. TABELA PRINCIPAL: whatsapp_groups
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    group_type VARCHAR(50) NOT NULL CHECK (group_type IN (
        'participants_geral', 'participants_vip', 'speakers_palestrantes', 
        'startups_arena', 'mentores', 'organizacao', 'patrocinadores', 
        'networking_b2b', 'ajuda_suporte', 'custom'
    )),
    invite_link TEXT,
    qr_code_url TEXT,
    max_participants INTEGER DEFAULT 1024,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_full BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    welcome_message_template TEXT,
    auto_invite_on_registration BOOLEAN DEFAULT false,
    auto_invite_on_checkin BOOLEAN DEFAULT false
);

-- Comentários para documentação
COMMENT ON TABLE public.whatsapp_groups IS 'Grupos de WhatsApp para eventos';
COMMENT ON COLUMN public.whatsapp_groups.group_type IS 'Tipo: participants_geral, participants_vip, speakers_palestrantes, startups_arena, mentores, organizacao, patrocinadores, networking_b2b, ajuda_suporte, custom';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_project_id ON public.whatsapp_groups(project_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_group_type ON public.whatsapp_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_is_active ON public.whatsapp_groups(is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_created_at ON public.whatsapp_groups(created_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_groups_updated_at ON public.whatsapp_groups;
CREATE TRIGGER trg_whatsapp_groups_updated_at
    BEFORE UPDATE ON public.whatsapp_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_groups_updated_at();

-- Trigger para atualizar is_full automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_groups_is_full()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_full = NEW.current_participants >= NEW.max_participants;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_groups_is_full ON public.whatsapp_groups;
CREATE TRIGGER trg_whatsapp_groups_is_full
    BEFORE INSERT OR UPDATE ON public.whatsapp_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_groups_is_full();

-- Habilitar RLS
ALTER TABLE public.whatsapp_groups ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "whatsapp_groups_select_all" 
    ON public.whatsapp_groups FOR SELECT 
    USING (true);

CREATE POLICY "whatsapp_groups_insert_admin" 
    ON public.whatsapp_groups FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_groups_update_admin" 
    ON public.whatsapp_groups FOR UPDATE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_groups_delete_admin" 
    ON public.whatsapp_groups FOR DELETE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- ============================================
-- 2. TABELA DE MEMBROS: whatsapp_group_members
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.whatsapp_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'invited', 'invite_sent', 'joined', 'left', 'removed', 'declined'
    )),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    removed_at TIMESTAMP WITH TIME ZONE,
    invited_by UUID REFERENCES public.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, phone_number)
);

COMMENT ON TABLE public.whatsapp_group_members IS 'Membros dos grupos de WhatsApp';
COMMENT ON COLUMN public.whatsapp_group_members.status IS 'Status: pending, invited, invite_sent, joined, left, removed, declined';

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_group_id ON public.whatsapp_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_user_id ON public.whatsapp_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_status ON public.whatsapp_group_members(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_group_members_phone ON public.whatsapp_group_members(phone_number);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_group_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_whatsapp_group_members_updated_at ON public.whatsapp_group_members;
CREATE TRIGGER trg_whatsapp_group_members_updated_at
    BEFORE UPDATE ON public.whatsapp_group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_group_members_updated_at();

-- Trigger para atualizar contador de membros no grupo
CREATE OR REPLACE FUNCTION update_group_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'joined' THEN
        UPDATE public.whatsapp_groups 
        SET current_participants = current_participants + 1
        WHERE id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Se mudou de não-joined para joined
        IF OLD.status != 'joined' AND NEW.status = 'joined' THEN
            UPDATE public.whatsapp_groups 
            SET current_participants = current_participants + 1
            WHERE id = NEW.group_id;
        -- Se mudou de joined para não-joined
        ELSIF OLD.status = 'joined' AND NEW.status != 'joined' THEN
            UPDATE public.whatsapp_groups 
            SET current_participants = GREATEST(0, current_participants - 1)
            WHERE id = NEW.group_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'joined' THEN
        UPDATE public.whatsapp_groups 
        SET current_participants = GREATEST(0, current_participants - 1)
        WHERE id = OLD.group_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_group_count ON public.whatsapp_group_members;
CREATE TRIGGER trg_update_group_count
    AFTER INSERT OR UPDATE OR DELETE ON public.whatsapp_group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_participant_count();

-- Habilitar RLS
ALTER TABLE public.whatsapp_group_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "whatsapp_group_members_select_all" 
    ON public.whatsapp_group_members FOR SELECT 
    USING (true);

CREATE POLICY "whatsapp_group_members_insert_admin" 
    ON public.whatsapp_group_members FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_group_members_update_admin" 
    ON public.whatsapp_group_members FOR UPDATE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_group_members_delete_admin" 
    ON public.whatsapp_group_members FOR DELETE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- ============================================
-- 3. TABELA DE LOGS: whatsapp_invite_logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_invite_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.whatsapp_groups(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.whatsapp_group_members(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'invite_created', 'invite_sent', 'invite_accepted', 'invite_declined', 
        'removed', 'joined', 'left', 'message_sent', 'error'
    )),
    performed_by UUID REFERENCES public.users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    method VARCHAR(50), -- 'api', 'manual', 'bulk_import', 'auto'
    details JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    ip_address INET
);

COMMENT ON TABLE public.whatsapp_invite_logs IS 'Logs de ações nos grupos de WhatsApp';

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_invite_logs_group_id ON public.whatsapp_invite_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_invite_logs_action ON public.whatsapp_invite_logs(action);
CREATE INDEX IF NOT EXISTS idx_whatsapp_invite_logs_performed_at ON public.whatsapp_invite_logs(performed_at);

-- Habilitar RLS
ALTER TABLE public.whatsapp_invite_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_invite_logs_select_admin" 
    ON public.whatsapp_invite_logs FOR SELECT 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_invite_logs_insert_system" 
    ON public.whatsapp_invite_logs FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. TABELA DE TEMPLATES: whatsapp_message_templates
-- ============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
        'welcome', 'reminder', 'update', 'goodbye', 'invite', 'custom'
    )),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- ["nome", "evento", "data", "link_grupo"]
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, template_name)
);

COMMENT ON TABLE public.whatsapp_message_templates IS 'Templates de mensagens para grupos de WhatsApp';

-- Índices
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_project_id ON public.whatsapp_message_templates(project_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_type ON public.whatsapp_message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_active ON public.whatsapp_message_templates(is_active);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trg_whatsapp_templates_updated_at ON public.whatsapp_message_templates;
CREATE TRIGGER trg_whatsapp_templates_updated_at
    BEFORE UPDATE ON public.whatsapp_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_templates_select_all" 
    ON public.whatsapp_message_templates FOR SELECT 
    USING (true);

CREATE POLICY "whatsapp_templates_insert_admin" 
    ON public.whatsapp_message_templates FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_templates_update_admin" 
    ON public.whatsapp_message_templates FOR UPDATE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

CREATE POLICY "whatsapp_templates_delete_admin" 
    ON public.whatsapp_message_templates FOR DELETE 
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
    ));

-- ============================================
-- 5. FUNÇÕES ÚTEIS
-- ============================================

-- Função para obter estatísticas de um grupo
CREATE OR REPLACE FUNCTION get_group_stats(group_uuid UUID)
RETURNS TABLE (
    total_members BIGINT,
    pending_invites BIGINT,
    accepted_invites BIGINT,
    declined_invites BIGINT,
    removed_members BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE status IN ('pending', 'invited', 'invite_sent')) as pending_invites,
        COUNT(*) FILTER (WHERE status = 'joined') as accepted_invites,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_invites,
        COUNT(*) FILTER (WHERE status = 'removed') as removed_members
    FROM public.whatsapp_group_members
    WHERE group_id = group_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para obter grupos de um projeto com estatísticas
CREATE OR REPLACE FUNCTION get_project_groups(project_uuid UUID)
RETURNS TABLE (
    group_id UUID,
    group_name VARCHAR,
    group_type VARCHAR,
    is_active BOOLEAN,
    current_participants INTEGER,
    max_participants INTEGER,
    total_pending BIGINT,
    total_joined BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wg.id as group_id,
        wg.group_name,
        wg.group_type,
        wg.is_active,
        wg.current_participants,
        wg.max_participants,
        COUNT(wgm.id) FILTER (WHERE wgm.status IN ('pending', 'invited', 'invite_sent')) as total_pending,
        COUNT(wgm.id) FILTER (WHERE wgm.status = 'joined') as total_joined
    FROM public.whatsapp_groups wg
    LEFT JOIN public.whatsapp_group_members wgm ON wgm.group_id = wg.id
    WHERE wg.project_id = project_uuid
    GROUP BY wg.id, wg.group_name, wg.group_type, wg.is_active, wg.current_participants, wg.max_participants
    ORDER BY wg.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar membro com verificação de duplicidade
CREATE OR REPLACE FUNCTION add_group_member(
    p_group_id UUID,
    p_phone_number VARCHAR,
    p_name VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_invited_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_member_id UUID;
BEGIN
    -- Verificar se já existe
    SELECT id INTO new_member_id
    FROM public.whatsapp_group_members
    WHERE group_id = p_group_id AND phone_number = p_phone_number;
    
    IF new_member_id IS NOT NULL THEN
        -- Atualizar existente
        UPDATE public.whatsapp_group_members
        SET 
            name = COALESCE(p_name, name),
            email = COALESCE(p_email, email),
            user_id = COALESCE(p_user_id, user_id),
            updated_at = NOW()
        WHERE id = new_member_id;
        
        RETURN new_member_id;
    END IF;
    
    -- Inserir novo
    INSERT INTO public.whatsapp_group_members (
        group_id, user_id, phone_number, name, email, status, invited_by, invited_at
    ) VALUES (
        p_group_id, p_user_id, p_phone_number, p_name, p_email, 'pending', p_invited_by, NOW()
    )
    RETURNING id INTO new_member_id;
    
    RETURN new_member_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TEMPLATES PADRÃO (OPCIONAL - DESCOMENTAR SE DESEJADO)
-- ============================================
/*
-- Template de boas-vindas padrão
INSERT INTO public.whatsapp_message_templates (
    template_name, template_type, content, variables, is_active, is_default
) VALUES (
    'welcome_default',
    'welcome',
    'Olá {{nome}}! 🎉\n\nBem-vindo(a) ao grupo do {{evento}}!\n\nEstamos felizes em tê-lo(a) conosco. Fique atento(a) às novidades e informações importantes sobre o evento.\n\n📅 Data: {{data}}\n📍 Local: {{local}}\n\nEm breve enviaremos mais detalhes!\n\nEquipe Growth Summit',
    '["nome", "evento", "data", "local"]',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Template de convite padrão
INSERT INTO public.whatsapp_message_templates (
    template_name, template_type, content, variables, is_active, is_default
) VALUES (
    'invite_default',
    'invite',
    'Olá {{nome}}! 👋\n\nVocê está sendo convidado(a) para participar do grupo exclusivo do {{evento}} no WhatsApp!\n\nEste grupo será usado para:\n✅ Atualizações importantes\n✅ Networking com outros participantes\n✅ Informações em tempo real\n\nClique no link para entrar: {{link_grupo}}\n\nNos vemos no evento! 🚀',
    '["nome", "evento", "link_grupo"]',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Template de lembrete
INSERT INTO public.whatsapp_message_templates (
    template_name, template_type, content, variables, is_active, is_default
) VALUES (
    'reminder_default',
    'reminder',
    'Olá {{nome}}! ⏰\n\nFaltam apenas {{dias}} dias para o {{evento}}!\n\n📅 Data: {{data}}\n📍 Local: {{local}}\n\nPrepare-se para uma experiência incrível de aprendizado e networking!\n\nDúvidas? Responda aqui ou entre em contato pelo app.',
    '["nome", "dias", "evento", "data", "local"]',
    true,
    true
) ON CONFLICT DO NOTHING;
*/

-- ============================================
-- MIGRATION CONCLUÍDA
-- ============================================
-- Tabelas criadas:
-- - whatsapp_groups (grupos de WhatsApp)
-- - whatsapp_group_members (membros dos grupos)
-- - whatsapp_invite_logs (logs de ações)
-- - whatsapp_message_templates (templates de mensagens)
--
-- Funções criadas:
-- - get_group_stats (estatísticas de grupo)
-- - get_project_groups (grupos de um projeto)
-- - add_group_member (adicionar membro com verificação)
-- ============================================
