-- MIGRATION: GESTOR DE COMUNICAÇÃO (V1)
-- Adiciona suporte para persistência de templates e campanhas no Supabase

-- 1. Tabela de Templates de Email
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'Inscrições',
    variables JSONB DEFAULT '["nome", "email", "empresa", "ticket", "data", "evento"]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Campanhas de Email
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id),
    recipients_filter TEXT NOT NULL DEFAULT 'all',
    status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, sent
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "bounced": 0}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can manage templates" ON public.email_templates
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage campaigns" ON public.email_campaigns
    FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_campaigns;

-- MIGRATION: PROGRAMAÇÃO - ADD DATE (V1)
-- Adiciona o campo de data e horários específicos para a programação
ALTER TABLE public.programacao_evento ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.programacao_evento ADD COLUMN IF NOT EXISTS end_time TEXT;

-- MIGRATION: PARCEIROS E STANDS (V10) - FIX PERMISSIONS
-- Garante que todos possam visualizar parceiros ativos para o PWA funcionar
CREATE POLICY IF NOT EXISTS "Public can view active partners" ON public.parceiros
    FOR SELECT USING (status = 'active');

CREATE POLICY IF NOT EXISTS "Public can view active stands" ON public.stands
    FOR SELECT USING (TRUE);
