-- MIGRATION V10: Fix Partners (parceiros) and Stands schema/permissions
-- Resolves 400 (missing columns) and 403 (forbidden) errors

-- 1. FIX STANDS TABLE
DO $$ 
BEGIN
    -- Ensure stands table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stands') THEN
        CREATE TABLE public.stands (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES public.projects(id),
            name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            location TEXT,
            owner_id UUID,
            owner_type TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;

    -- Add missing logo_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stands' AND column_name='logo_url') THEN
        ALTER TABLE public.stands ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- 2. FIX PARCEIROS (PARTNERS) TABLE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parceiros') THEN
        CREATE TABLE public.parceiros (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID REFERENCES public.projects(id),
            name TEXT NOT NULL,
            cnpj TEXT,
            type TEXT DEFAULT 'institutional',
            category TEXT DEFAULT 'permuta',
            status TEXT DEFAULT 'active',
            logo_url TEXT,
            contact_name TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            access_code TEXT UNIQUE,
            max_team_members INTEGER DEFAULT 10,
            sponsor_id UUID,
            stand_id UUID,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- 3. FIX PARCEIROS_EQUIPE TABLE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parceiros_equipe') THEN
        CREATE TABLE public.parceiros_equipe (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            partner_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE,
            project_id UUID REFERENCES public.projects(id),
            user_id UUID REFERENCES auth.users(id),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            cpf TEXT,
            role TEXT,
            qr_code TEXT UNIQUE,
            checked_in BOOLEAN DEFAULT false,
            check_in_time TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;
END $$;

-- 4. ENABLE RLS AND PERMISSIONS
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros_equipe ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.stands TO anon, authenticated;
GRANT SELECT ON public.parceiros TO anon, authenticated;
GRANT SELECT ON public.parceiros_equipe TO anon, authenticated;
GRANT ALL ON public.stands TO authenticated;
GRANT ALL ON public.parceiros TO authenticated;
GRANT ALL ON public.parceiros_equipe TO authenticated;

-- Policies
DROP POLICY IF EXISTS "Public can view stands" ON public.stands;
CREATE POLICY "Public can view stands" ON public.stands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can view partners" ON public.parceiros;
CREATE POLICY "Public can view partners" ON public.parceiros FOR SELECT TO anon, authenticated USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage partners" ON public.parceiros;
CREATE POLICY "Admins can manage partners" ON public.parceiros FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage stands" ON public.stands;
CREATE POLICY "Admins can manage stands" ON public.stands FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage partner team" ON public.parceiros_equipe;
CREATE POLICY "Admins can manage partner team" ON public.parceiros_equipe FOR ALL TO authenticated USING (public.is_admin());

-- 5. FIX 403 ON POPUPS (Robustness)
GRANT SELECT ON public.project_popups TO anon, authenticated;
DROP POLICY IF EXISTS "Public can view active popups" ON public.project_popups;
CREATE POLICY "Public can view active popups" ON public.project_popups FOR SELECT TO anon, authenticated USING (status = 'active');

-- 6. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_parceiros_project ON public.parceiros(project_id);
CREATE INDEX IF NOT EXISTS idx_stands_project ON public.stands(project_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_equipe_partner ON public.parceiros_equipe(partner_id);
