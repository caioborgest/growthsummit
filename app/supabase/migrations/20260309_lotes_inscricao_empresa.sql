-- ============================================================
-- CORPORATE BATCH REGISTRATION (LOTES DE EQUIPES)
-- Date: 2026-03-09
-- Objective: Manage group registrations with 30%+ discount and single payment.
-- ============================================================
-- 1. Create the Batch Table
CREATE TABLE IF NOT EXISTS public.lotes_inscricao_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id),
    nome_empresa TEXT NOT NULL,
    cnpj TEXT,
    email_contato TEXT NOT NULL,
    voucher_code TEXT UNIQUE NOT NULL,
    quantidade_vagas INTEGER NOT NULL DEFAULT 5,
    vagas_utilizadas INTEGER NOT NULL DEFAULT 0,
    tipo_ingresso TEXT NOT NULL DEFAULT 'pro',
    valor_total DECIMAL(10, 2) NOT NULL,
    status_pagamento TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Add Link to Main Registration Table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'lote_id'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN lote_id UUID REFERENCES public.lotes_inscricao_empresa(id);
COMMENT ON COLUMN public.inscricoes_growth_experience.lote_id IS 'ID do lote de equipe (Corporate) caso o participante venha de uma compra em grupo.';
END IF;
END $$;
-- 3. Add Voucher Tracking Column to track which specific code was used
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'inscricoes_growth_experience'
        AND column_name = 'voucher_empresa_usado'
) THEN
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN voucher_empresa_usado TEXT;
END IF;
END $$;
-- 4. Enable RLS
ALTER TABLE public.lotes_inscricao_empresa ENABLE ROW LEVEL SECURITY;
-- 5. Policies
-- Admins can do everything
CREATE POLICY "lotes_admin_all" ON public.lotes_inscricao_empresa FOR ALL USING (public.is_admin());
-- Public can verify a voucher (needed for registration flow)
CREATE POLICY "lotes_public_verify" ON public.lotes_inscricao_empresa FOR
SELECT USING (true);
-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_lotes_empresa_updated_at BEFORE
UPDATE ON public.lotes_inscricao_empresa FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- 7. Grant access
GRANT ALL ON TABLE public.lotes_inscricao_empresa TO postgres;
GRANT ALL ON TABLE public.lotes_inscricao_empresa TO service_role;
GRANT SELECT,
    INSERT ON TABLE public.lotes_inscricao_empresa TO authenticated;
GRANT SELECT ON TABLE public.lotes_inscricao_empresa TO anon;
RAISE NOTICE 'Migration lotes_inscricao_empresa completed successfully';