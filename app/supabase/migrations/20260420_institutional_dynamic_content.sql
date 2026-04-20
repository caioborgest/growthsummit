-- ============================================================================
-- GX GROWTH EXPERIENCE 2026 - INSTITUTIONAL DYNAMIC CONTENT (V1)
-- ============================================================================

-- 1. SEED 2026 PROJECTS
-- ----------------------------------------------------------------------------
INSERT INTO public.projects (
    id, name, slug, type, description, short_description, location, city, state, country, 
    start_date, end_date, status, primary_color, secondary_color, 
    ticket_price_standard, ticket_price_pro, ticket_price_vip, 
    target_registrations, target_revenue, enable_check_in
) VALUES 
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
    'Growth Experience Triunfo - Pocket Edition (Noturno)', 
    'growth-experience-triunfo', 
    'growth_experience',
    'Um circuito de eventos focado em Negócios e Growth no sertão do Pajeú.',
    'Marketing, Vendas e Growth em Triunfo/PE.',
    'Auditório do SESC', 'Triunfo', 'PE', 'Brasil',
    '2026-05-15 18:00:00+00', '2026-05-15 22:00:00+00', 
    'active', '#FF8A4C', '#FF3B30',
    0, 17999, 49999,
    150, 1500000, true
),
(
    'b2c3d4e5-f678-9012-bcde-f01234567890', 
    'GX Experience Petrolina - Pocket Edition (Noturno)', 
    'ge-petrolina-pocket-edition-2026', 
    'growth_experience',
    'O maior circuito de marketing e vendas do Vale do São Francisco.',
    'Aceleração de negócios em Petrolina/PE.',
    'Auditório do SENAI', 'Petrolina', 'PE', 'Brasil',
    '2026-06-20 18:00:00+00', '2026-06-20 22:00:00+00', 
    'active', '#FF8A4C', '#FF3B30',
    0, 17999, 49999,
    300, 3000000, true
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    target_registrations = EXCLUDED.target_registrations,
    target_revenue = EXCLUDED.target_revenue,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- 2. CREATE GALLERY_ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    type TEXT DEFAULT 'photo', -- 'photo', 'video'
    category TEXT DEFAULT 'general',
    featured BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENHANCE SPONSORS TABLE
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsors' AND column_name='is_public') THEN
        ALTER TABLE public.sponsors ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsors' AND column_name='order_index') THEN
        ALTER TABLE public.sponsors ADD COLUMN order_index INT DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsors' AND column_name='featured') THEN
        ALTER TABLE public.sponsors ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 4. RLS POLICIES (READ ACCESS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access for Gallery" 
ON public.gallery_items FOR SELECT 
USING (active = true);

CREATE POLICY "Public Read Access for Sponsors" 
ON public.sponsors FOR SELECT 
USING (status = 'active' OR is_public = true);

-- 5. REFRESH SCHEMA
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
