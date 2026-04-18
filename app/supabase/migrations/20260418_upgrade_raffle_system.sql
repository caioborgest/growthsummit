-- Migration: Raffle Professional Suite Upgrade (v2 - Robust)
-- Descrição: Evolução do sistema de sorteios para suportar múltiplos ganhadores, regras de elegibilidade e mídia do prêmio.

-- 1. Adicionar novas colunas na tabela de sorteios
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS winners_count INTEGER DEFAULT 1;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS prize_image_url TEXT;
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS prize_value NUMERIC(10,2);
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS eligibility_rules JSONB DEFAULT '{}'::jsonb;

-- 2. Criar tabela de ganhadores (Suporte a múltiplos ganhadores por sorteio)
CREATE TABLE IF NOT EXISTS public.raffle_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID REFERENCES public.raffles(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.growth_experience_registrations(id) ON DELETE CASCADE,
    drawn_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(raffle_id, registration_id)
);

-- Migrar ganhadores existentes (se houver) para a nova tabela
INSERT INTO public.raffle_winners (raffle_id, registration_id, drawn_at)
SELECT id, winner_registration_id, drawn_at
FROM public.raffles
WHERE winner_registration_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Habilitar RLS para a nova tabela
ALTER TABLE public.raffle_winners ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin gerencia ganhadores') THEN
        CREATE POLICY "Admin gerencia ganhadores" ON public.raffle_winners
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.user_id = auth.uid() 
                    AND profiles.role IN ('admin', 'staff')
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Público vê ganhadores') THEN
        CREATE POLICY "Público vê ganhadores" ON public.raffle_winners
            FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Atualizar a RPC de Sorteio para ser robusta e sem tabelas temporárias
CREATE OR REPLACE FUNCTION public.draw_raffle_winner_v2(
    p_raffle_id UUID,
    p_count INTEGER DEFAULT 1
)
RETURNS TABLE (
    registration_id UUID,
    winner_name TEXT,
    winner_email TEXT
) AS $$
DECLARE
    _raffle_type TEXT;
    _stand_id UUID;
    _rules JSONB;
    _project_id UUID;
    _winners_found UUID[];
BEGIN
    -- 1. Buscar metadados do sorteio
    SELECT type, stand_id, eligibility_rules, project_id 
    INTO _raffle_type, _stand_id, _rules, _project_id
    FROM public.raffles
    WHERE id = p_raffle_id;

    -- 2. Executar o sorteio baseado no tipo (separado para evitar erros de relação do Postgres)
    IF _raffle_type = 'realtime_qr' THEN
        INSERT INTO public.raffle_winners (raffle_id, registration_id)
        SELECT p_raffle_id, r.id
        FROM public.growth_experience_registrations r
        JOIN public.raffle_participants rp ON rp.registration_id = r.id AND rp.raffle_id = p_raffle_id
        WHERE r.project_id = _project_id
          AND r.status = 'active'
          AND NOT EXISTS (SELECT 1 FROM public.raffle_winners rw WHERE rw.raffle_id = p_raffle_id AND rw.registration_id = r.id)
          AND ((_rules->>'mustBeCheckedIn')::boolean IS NOT TRUE OR r.checked_in = true)
          AND (
               _rules->'ticketTypes' IS NULL 
               OR jsonb_array_length(_rules->'ticketTypes') = 0 
               OR lower(r.ticket_type) = ANY(SELECT lower(val) FROM jsonb_array_elements_text(_rules->'ticketTypes') val)
          )
        ORDER BY random()
        LIMIT p_count
        RETURNING public.raffle_winners.registration_id INTO _winners_found;

    ELSE -- Tipo: stand_checkin
        INSERT INTO public.raffle_winners (raffle_id, registration_id)
        SELECT p_raffle_id, r.id
        FROM public.growth_experience_registrations r
        JOIN public.stand_checkins sc ON sc.registration_id = r.id AND sc.stand_id = _stand_id
        WHERE r.project_id = _project_id
          AND r.status = 'active'
          AND NOT EXISTS (SELECT 1 FROM public.raffle_winners rw WHERE rw.raffle_id = p_raffle_id AND rw.registration_id = r.id)
          AND ((_rules->>'mustBeCheckedIn')::boolean IS NOT TRUE OR r.checked_in = true)
          AND (
               _rules->'ticketTypes' IS NULL 
               OR jsonb_array_length(_rules->'ticketTypes') = 0 
               OR lower(r.ticket_type) = ANY(SELECT lower(val) FROM jsonb_array_elements_text(_rules->'ticketTypes') val)
          )
        ORDER BY random()
        LIMIT p_count
        RETURNING public.raffle_winners.registration_id INTO _winners_found;
    END IF;

    -- 3. Finalizar sorteio se houver ganhadores
    IF _winners_found IS NOT NULL AND array_length(_winners_found, 1) > 0 THEN
        UPDATE public.raffles
        SET status = 'completed',
            drawn_at = now()
        WHERE id = p_raffle_id;
    END IF;

    -- 4. Retornar os novos ganhadores
    RETURN QUERY 
    SELECT r.id, r.name, r.email
    FROM public.growth_experience_registrations r
    WHERE r.id = ANY(_winners_found);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Dar permissão de execução
GRANT EXECUTE ON FUNCTION public.draw_raffle_winner_v2(UUID, INTEGER) TO anon, authenticated, service_role;

-- 6. Recarregar esquema
NOTIFY pgrst, 'reload schema';
