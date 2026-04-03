-- ============================================================
-- FIX: Cupons e Parceiros - Growth Experience 2026
-- Date: 2026-04-03
-- Objective: Fix RLS policies to allow public (anon) validation of coupons/vouchers
--            and ensure the 'parceiros' module works in registration.
-- ============================================================

-- 1. ESTRUTURA: Garantir existência das tabelas de Parceiros (GE Standard)
CREATE TABLE IF NOT EXISTS public.parceiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    type TEXT, -- sponsor, exhibitor, institutional, media
    category TEXT, -- permuta, investimento, misto
    status TEXT DEFAULT 'active',
    logo_url TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    access_code TEXT UNIQUE,
    max_team_members INTEGER DEFAULT 10,
    sponsor_id UUID,
    stand_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parceiros_equipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    role TEXT DEFAULT 'Integrante',
    qr_code TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SEGURANÇA: Habilitar RLS
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_inscricao_empresa ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE SELECT (Para Validação no Form)
-- Estas políticas permitem que o formulário de inscrição (usuário público/anon) 
-- valide se um cupom ou código de parceiro é válido antes de prosseguir.

-- Cupons Sociais/Promocionais
DROP POLICY IF EXISTS "permitir_select_cupons_publico" ON public.cupons_parceria_social;
CREATE POLICY "permitir_select_cupons_publico" ON public.cupons_parceria_social
    FOR SELECT 
    TO public
    USING (ativo = TRUE AND (vencimento IS NULL OR vencimento > NOW()));

-- Vouchers de Empresa (Lotes)
DROP POLICY IF EXISTS "permitir_select_lotes_publico" ON public.lotes_inscricao_empresa;
CREATE POLICY "permitir_select_lotes_publico" ON public.lotes_inscricao_empresa
    FOR SELECT 
    TO public
    USING (status_pagamento = 'pago');

-- Parceiros/Expositores
DROP POLICY IF EXISTS "permitir_select_parceiros_publico" ON public.parceiros;
CREATE POLICY "permitir_select_parceiros_publico" ON public.parceiros
    FOR SELECT 
    TO public
    USING (status = 'active');

-- Equipe de Parceiros (Necessário para contar limites de membros)
DROP POLICY IF EXISTS "permitir_select_equipe_publico" ON public.parceiros_equipe;
CREATE POLICY "permitir_select_equipe_publico" ON public.parceiros_equipe
    FOR SELECT 
    TO public
    USING (true);

-- 4. POLÍTICA DE INSERT (Para registro de equipe)
-- Permite que o formulário publique novos membros na equipe ao usar um código de parceiro
DROP POLICY IF EXISTS "permitir_insert_equipe_publico" ON public.parceiros_equipe;
CREATE POLICY "permitir_insert_equipe_publico" ON public.parceiros_equipe
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- 5. POLÍTICAS DE ADMIN (Controle Total)
DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT unnest(ARRAY['parceiros', 'parceiros_equipe', 'cupons_parceria_social', 'lotes_inscricao_empresa'])) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "admin_manage_%I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "admin_manage_%I" ON public.%I FOR ALL TO authenticated USING (public.is_admin())', t, t);
    END LOOP;
END $$;

-- 6. PERMISSÕES DE ACESSO (GRANT)
GRANT SELECT ON public.cupons_parceria_social TO anon, authenticated;
GRANT SELECT ON public.lotes_inscricao_empresa TO anon, authenticated;
GRANT SELECT ON public.parceiros TO anon, authenticated;
GRANT SELECT ON public.parceiros_equipe TO anon, authenticated;
GRANT INSERT ON public.parceiros_equipe TO anon, authenticated;

-- 7. NOTIFICAÇÃO DE RELOAD
NOTIFY pgrst, 'reload schema';

DO $$ BEGIN RAISE NOTICE 'Fix de Cupons e Parceiros aplicado com sucesso.'; END $$;
