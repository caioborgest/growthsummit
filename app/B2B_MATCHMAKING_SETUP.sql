-- ============================================================
-- B2B MATCHMAKING "TINDER" SYSTEM
-- ============================================================
-- 1. Add logo_url to rodada_negocios_b2b
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN IF NOT EXISTS logo_url TEXT;
-- 2. Create b2b_swipes table
CREATE TABLE IF NOT EXISTS public.b2b_swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_company_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    to_company_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_company_id, to_company_id)
);
-- 3. Create b2b_matches table (to track mutual likes)
CREATE TABLE IF NOT EXISTS public.b2b_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_a_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    company_b_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending_schedule' CHECK (
        status IN ('pending_schedule', 'scheduled', 'cancelled')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_a_id, company_b_id)
);
-- 4. Create b2b_appointments_triunfo table
CREATE TABLE IF NOT EXISTS public.b2b_appointments_triunfo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.b2b_matches(id) ON DELETE CASCADE,
    company_a_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    company_b_id UUID NOT NULL REFERENCES public.rodada_negocios_b2b(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 15,
    table_number TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Enable RLS
ALTER TABLE public.b2b_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_appointments_triunfo ENABLE ROW LEVEL SECURITY;
-- 6. RLS Policies
CREATE POLICY "Public swipes" ON public.b2b_swipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public matches" ON public.b2b_matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public appointments" ON public.b2b_appointments_triunfo FOR ALL USING (true) WITH CHECK (true);
-- 7. Trigger to automatically create match on mutual like
CREATE OR REPLACE FUNCTION handle_b2b_swipe() RETURNS TRIGGER AS $$ BEGIN -- Only check for matches on 'like'
    IF NEW.status = 'like' THEN -- Check if the target has already liked the sender
    IF EXISTS (
        SELECT 1
        FROM public.b2b_swipes
        WHERE from_company_id = NEW.to_company_id
            AND to_company_id = NEW.from_company_id
            AND status = 'like'
    ) THEN -- Create a match if it doesn't exist
INSERT INTO public.b2b_matches (company_a_id, company_b_id)
VALUES (
        LEAST(NEW.from_company_id, NEW.to_company_id),
        GREATEST(NEW.from_company_id, NEW.to_company_id)
    ) ON CONFLICT (company_a_id, company_b_id) DO NOTHING;
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_b2b_swipe
AFTER
INSERT
    OR
UPDATE ON public.b2b_swipes FOR EACH ROW EXECUTE FUNCTION handle_b2b_swipe();
-- 8. Scheduling Logic
-- Function to get next available slots and schedule meetings
CREATE OR REPLACE FUNCTION generate_b2b_schedule() RETURNS void AS $$
DECLARE match_rec RECORD;
current_slot TIMESTAMP WITH TIME ZONE;
event_date DATE := '2026-03-20';
-- To be adjusted or passed as param
start_time TIME := '14:00:00';
end_time TIME := '17:00:00';
slot_duration INTERVAL := '15 minutes';
is_slot_available BOOLEAN;
BEGIN -- Iterate through matches that haven't been scheduled yet
FOR match_rec IN (
    SELECT *
    FROM public.b2b_matches
    WHERE status = 'pending_schedule'
    ORDER BY created_at
) LOOP -- Start searching from the beginning of the event window
current_slot := (event_date || ' ' || start_time)::TIMESTAMP WITH TIME ZONE;
WHILE current_slot < (event_date || ' ' || end_time)::TIMESTAMP WITH TIME ZONE LOOP -- Check if BOTH companies are free at this slot
SELECT NOT EXISTS (
        SELECT 1
        FROM public.b2b_appointments_triunfo
        WHERE scheduled_at = current_slot
            AND (
                company_a_id IN (match_rec.company_a_id, match_rec.company_b_id)
                OR company_b_id IN (match_rec.company_a_id, match_rec.company_b_id)
            )
            AND status != 'cancelled'
    ) INTO is_slot_available;
IF is_slot_available THEN -- Insert appointment
INSERT INTO public.b2b_appointments_triunfo (
        match_id,
        company_a_id,
        company_b_id,
        scheduled_at,
        duration_minutes
    )
VALUES (
        match_rec.id,
        match_rec.company_a_id,
        match_rec.company_b_id,
        current_slot,
        15
    );
-- Mark match as scheduled
UPDATE public.b2b_matches
SET status = 'scheduled'
WHERE id = match_rec.id;
EXIT;
-- Move to next match
END IF;
current_slot := current_slot + slot_duration;
END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql;
-- 9. RPC for Admin to trigger scheduling
CREATE OR REPLACE FUNCTION rpc_generate_b2b_schedule() RETURNS void AS $$ BEGIN PERFORM generate_b2b_schedule();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;