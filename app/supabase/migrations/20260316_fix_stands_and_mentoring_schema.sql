-- ============================================================
-- MIGRATION: Fix Stands Schema and Mentorship Consistency
-- Growth Summit 2026
-- ============================================================

DO $$ 
BEGIN 
    -- 1. FIX STANDS TABLE (Growth Experience)
    -- This table is used by the AdminStands.tsx module
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stands') THEN
        CREATE TABLE public.stands (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            nome TEXT NOT NULL,
            localizacao TEXT,
            descricao TEXT,
            logo_url TEXT,
            owner_id UUID, 
            owner_type TEXT CHECK (owner_type IN ('startup', 'company', 'sponsor')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Table "stands" created with standard GE column names (nome, localizacao, descricao).';
    ELSE
        -- Rename 'name' to 'nome' if it exists (Fix for "nome column not found" error)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'name') THEN
            ALTER TABLE public.stands RENAME COLUMN name TO nome;
            RAISE NOTICE 'Renamed column "name" to "nome" in "stands".';
        END IF;

        -- Ensure other columns exist for AdminStands.tsx
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'localizacao') THEN
            ALTER TABLE public.stands ADD COLUMN localizacao TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'descricao') THEN
            ALTER TABLE public.stands ADD COLUMN descricao TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stands' AND column_name = 'logo_url') THEN
            ALTER TABLE public.stands ADD COLUMN logo_url TEXT;
        END IF;
    END IF;

    -- 2. ENSURE MENTORSHIP SESSION COLUMNS (GE MODULE)
    -- These are often missing when expanding the mentor dashboard
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'nome_mentorado') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN nome_mentorado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'email_mentorado') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN email_mentorado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias_agendadas' AND column_name = 'duracao') THEN
        ALTER TABLE public.mentorias_agendadas ADD COLUMN duracao INTEGER DEFAULT 20;
    END IF;

    -- 3. ENSURE STAND_CHECKINS TABLE
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stand_checkins') THEN
        CREATE TABLE public.stand_checkins (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
            stand_id UUID REFERENCES public.stands(id) ON DELETE CASCADE,
            registration_id UUID NOT NULL, 
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Table "stand_checkins" created.';
    END IF;

    -- 4. RELOAD SCHEMA CACHE
    -- PostgREST needs this to see the new/renamed columns immediately
    NOTIFY pgrst, 'reload schema';

END $$;
