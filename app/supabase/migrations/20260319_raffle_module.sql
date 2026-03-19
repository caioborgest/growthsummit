-- Raffle Module Migration
-- Create raffles table
CREATE TABLE IF NOT EXISTS public.raffles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('stand_checkin', 'realtime_qr')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'completed', 'cancelled')),
    stand_id UUID, -- For stand_checkin raffles
    winner_registration_id UUID REFERENCES public.inscricoes_growth_experience(id),
    drawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create raffle participants table (for realtime_qr)
CREATE TABLE IF NOT EXISTS public.raffle_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.inscricoes_growth_experience(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(raffle_id, registration_id)
);

-- Enable RLS
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raffles
CREATE POLICY "Admins can manage raffles" ON public.raffles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Everyone can view open raffles" ON public.raffles
    FOR SELECT TO authenticated
    USING (status = 'open' OR status = 'completed');

-- RLS Policies for raffle_participants
CREATE POLICY "Admins can view all participants" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can enter open realtime raffles" ON public.raffle_participants
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.raffles
            WHERE raffles.id = raffle_id AND raffles.status = 'open' AND raffles.type = 'realtime_qr'
        )
        AND 
        EXISTS (
            SELECT 1 FROM public.inscricoes_growth_experience
            WHERE inscricoes_growth_experience.id = registration_id AND inscricoes_growth_experience.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own raffle entries" ON public.raffle_participants
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.inscricoes_growth_experience
            WHERE inscricoes_growth_experience.id = registration_id AND inscricoes_growth_experience.user_id = auth.uid()
        )
    );

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_raffles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raffles_updated_at
BEFORE UPDATE ON public.raffles
FOR EACH ROW EXECUTE FUNCTION update_raffles_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_raffles_project ON public.raffles(project_id);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON public.raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_raffle ON public.raffle_participants(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_reg ON public.raffle_participants(registration_id);

-- Raffle Winner Function
CREATE OR REPLACE FUNCTION draw_raffle_winner(p_raffle_id UUID)
RETURNS TABLE (
    ref_registration_id UUID,
    winner_name TEXT,
    winner_email TEXT
) AS $$
DECLARE
    v_winner_id UUID;
    v_raffle_type TEXT;
    v_stand_id UUID;
BEGIN
    -- Get raffle info
    SELECT type, stand_id INTO v_raffle_type, v_stand_id
    FROM public.raffles
    WHERE id = p_raffle_id;

    IF v_raffle_type = 'realtime_qr' THEN
        SELECT registration_id INTO v_winner_id
        FROM public.raffle_participants
        WHERE raffle_id = p_raffle_id
        ORDER BY random()
        LIMIT 1;
    ELSIF v_raffle_type = 'stand_checkin' THEN
        SELECT registration_id INTO v_winner_id
        FROM public.stand_checkins
        WHERE stand_id = v_stand_id
        ORDER BY random()
        LIMIT 1;
    END IF;

    -- Update raffle with winner
    IF v_winner_id IS NOT NULL THEN
        UPDATE public.raffles
        SET winner_registration_id = v_winner_id,
            drawn_at = NOW(),
            status = 'completed'
        WHERE id = p_raffle_id;
        
        RETURN QUERY 
        SELECT 
            r.id as ref_registration_id,
            r.nome as winner_name,
            r.email as winner_email
        FROM public.inscricoes_growth_experience r
        WHERE r.id = v_winner_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
