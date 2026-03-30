-- ============================================================
-- FIX: Colunas faltantes em notifications, stand_checkins e b2b_meetings
-- Data: 2026-03-30
-- Erro: "column notifications.read does not exist"
--        "column stand_checkins.created_at does not exist"
--        "column b2b_meetings.company_a_id does not exist"
-- ============================================================

-- ── 1. NOTIFICATIONS ────────────────────────────────────────────────────────
-- Garante que a tabela existe com todas as colunas necessárias
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Renomeia 'is_read' para 'read' se a tabela existia com esse nome antigo
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
          AND column_name = 'is_read'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'notifications'
          AND column_name = 'read'
    ) THEN
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
        RAISE NOTICE 'Renomeado notifications.is_read → read';
    END IF;
END $$;

-- Adiciona cada coluna individualmente se não existir (seguro para tabela já existente)
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS action_url TEXT;

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS project_id UUID;

-- Adiciona FK em project_id apenas se a coluna foi recém-criada sem ela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'notifications'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'project_id'
    ) THEN
        BEGIN
            ALTER TABLE public.notifications
                ADD CONSTRAINT fk_notifications_project_id
                FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own notifications" ON public.notifications;
CREATE POLICY "Users can see their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON public.notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ── 2. STAND_CHECKINS ───────────────────────────────────────────────────────
-- Garante que a tabela existe
CREATE TABLE IF NOT EXISTS public.stand_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    stand_id UUID,
    registration_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona colunas faltantes se a tabela já existia sem elas
ALTER TABLE public.stand_checkins
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.stand_checkins
    ADD COLUMN IF NOT EXISTS project_id UUID;

ALTER TABLE public.stand_checkins
    ADD COLUMN IF NOT EXISTS user_id UUID;

-- RLS
ALTER TABLE public.stand_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage stand_checkins" ON public.stand_checkins;
CREATE POLICY "Admins can manage stand_checkins"
    ON public.stand_checkins FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own checkins" ON public.stand_checkins;
CREATE POLICY "Users can view own checkins"
    ON public.stand_checkins FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert stand_checkins" ON public.stand_checkins;
CREATE POLICY "Anyone can insert stand_checkins"
    ON public.stand_checkins FOR INSERT
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_stand_checkins_registration ON public.stand_checkins(registration_id);
CREATE INDEX IF NOT EXISTS idx_stand_checkins_stand ON public.stand_checkins(stand_id);

-- ── 3. B2B_MEETINGS ─────────────────────────────────────────────────────────
-- Garante que a tabela exista com os campos esperados
CREATE TABLE IF NOT EXISTS public.b2b_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    company_a_id UUID,
    company_b_id UUID,
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 25,
    table_number INTEGER,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona colunas faltantes
ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS company_a_id UUID;

ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS company_b_id UUID;

ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 25;

ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS table_number INTEGER;

ALTER TABLE public.b2b_meetings
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Se existia com nomes alternativos, tenta renomear
DO $$
BEGIN
    -- empresa_a_id -> company_a_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_meetings' AND column_name = 'empresa_a_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_meetings' AND column_name = 'company_a_id'
    ) THEN
        ALTER TABLE public.b2b_meetings RENAME COLUMN empresa_a_id TO company_a_id;
    END IF;

    -- empresa_b_id -> company_b_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_meetings' AND column_name = 'empresa_b_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_meetings' AND column_name = 'company_b_id'
    ) THEN
        ALTER TABLE public.b2b_meetings RENAME COLUMN empresa_b_id TO company_b_id;
    END IF;
END $$;

-- RLS
ALTER TABLE public.b2b_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage b2b_meetings" ON public.b2b_meetings;
CREATE POLICY "Admins can manage b2b_meetings"
    ON public.b2b_meetings FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Companies can view their meetings" ON public.b2b_meetings;
CREATE POLICY "Companies can view their meetings"
    ON public.b2b_meetings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rodada_negocios_b2b
            WHERE id IN (company_a_id, company_b_id)
              AND user_id = auth.uid()
        )
    );

CREATE INDEX IF NOT EXISTS idx_b2b_meetings_company_a ON public.b2b_meetings(company_a_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_company_b ON public.b2b_meetings(company_b_id);
CREATE INDEX IF NOT EXISTS idx_b2b_meetings_project ON public.b2b_meetings(project_id);

-- ── 4. B2B_MATCHES (também usa company_a_id) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.b2b_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    company_a_id UUID,
    company_b_id UUID,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.b2b_matches
    ADD COLUMN IF NOT EXISTS company_a_id UUID;

ALTER TABLE public.b2b_matches
    ADD COLUMN IF NOT EXISTS company_b_id UUID;

-- ── 5. PERMISSÕES ───────────────────────────────────────────────────────────
GRANT ALL ON public.notifications TO postgres, service_role, authenticated;
GRANT ALL ON public.stand_checkins TO postgres, service_role, authenticated;
GRANT ALL ON public.b2b_meetings TO postgres, service_role, authenticated;
GRANT ALL ON public.b2b_matches TO postgres, service_role, authenticated;

-- ── 6. RELOAD CACHE DO POSTGREST ────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
