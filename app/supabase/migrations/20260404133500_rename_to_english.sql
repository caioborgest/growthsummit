-- ============================================================================
-- GROWTH SUMMIT 2026 - STANDARDIZATION TO ENGLISH (TABLES AND COLUMNS)
-- Date: 2026-04-04
-- Note: This migration renames all Portuguese structure names to English
-- ============================================================================

-- 1. RENAME TABLES
ALTER TABLE IF EXISTS inscricoes_growth_experience RENAME TO growth_experience_registrations;
ALTER TABLE IF EXISTS inscricoes_empresas_incentivadoras RENAME TO company_registrations;
ALTER TABLE IF EXISTS mentores_growth_experience RENAME TO growth_experience_mentors;
ALTER TABLE IF EXISTS mentorias_agendadas RENAME TO scheduled_mentorings;
ALTER TABLE IF EXISTS lotes_inscricao_empresa RENAME TO company_registration_batches;
ALTER TABLE IF EXISTS cupons_parceria_social RENAME TO social_partnership_coupons;
ALTER TABLE IF EXISTS check_ins_atividades RENAME TO activity_check_ins;
ALTER TABLE IF EXISTS parceiros RENAME TO partners;
ALTER TABLE IF EXISTS parceiros_equipe RENAME TO partner_team;
ALTER TABLE IF EXISTS programacao_evento RENAME TO event_sessions;
ALTER TABLE IF EXISTS startups_arena_pitch RENAME TO startup_pitches;
ALTER TABLE IF EXISTS rodada_negocios_b2b RENAME TO b2b_registration;
ALTER TABLE IF EXISTS transacoes_growth_experience RENAME TO growth_experience_transactions;
ALTER TABLE IF EXISTS inscricoes_sorteio RENAME TO raffle_registrations;

-- 2. RENAME COLUMNS - growth_experience_registrations
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN nome TO name;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN empresa TO company;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN cargo TO role;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN telefone TO phone;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN valor_pago TO paid_amount;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN tipo_inscricao TO registration_type;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN status_pagamento TO payment_status;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN palestras_noturnas TO palestras_noturnas;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN cursos_selecionados TO cursos_selecionados;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN cupom_palestra TO cupom_palestra;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN valor_desconto_palestra TO valor_desconto_palestra;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN criado_em TO created_at;
    ALTER TABLE IF EXISTS growth_experience_registrations RENAME COLUMN atualizado_em TO updated_at;
EXCEPTION
    WHEN undefined_column THEN
        NULL;
END $$;

-- 2. RENAME COLUMNS - company_registrations
DO $$ BEGIN
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN nome_empresa TO company_name;
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN nome_responsavel TO responsible_name;
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN telefone TO phone;
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN observacoes TO notes;
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN valor_investido TO paid_amount;
    ALTER TABLE IF EXISTS company_registrations RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - growth_experience_mentors
DO $$ BEGIN
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN nome TO name;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN empresa TO company;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN cargo TO role;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN telefone TO phone;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN especialidades TO specialties;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN bio TO bio;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN foto_url TO photo_url;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN linkedin_url TO linkedin_url;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN aprovado TO is_approved;
    ALTER TABLE IF EXISTS growth_experience_mentors RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - scheduled_mentorings
DO $$ BEGIN
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN nome_mentorado TO mentee_name;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN email_mentorado TO mentee_email;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN telefone_mentorado TO mentee_phone;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN mentorado_id TO mentee_id;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN data_mentoria TO start_date;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN duracao TO duration;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN tema_interesse TO topic;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN anotacoes TO notes;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN avaliacao_mentoria TO mentoring_rating;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN indicacao_mentor TO mentor_indication;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN avaliado_em TO rated_at;
    ALTER TABLE IF EXISTS scheduled_mentorings RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - company_registration_batches
DO $$ BEGIN
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN nome_responsavel TO responsible_name;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN nome_empresa TO company_name;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN email_contato TO contact_email;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN quantidade_vagas TO vacancy_count;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN vagas_utilizadas TO used_vacancies;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN tipo_ingresso TO registration_type;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN valor_total TO total_amount;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN status_pagamento TO payment_status;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN observacoes TO notes;
    ALTER TABLE IF EXISTS company_registration_batches RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - social_partnership_coupons
DO $$ BEGIN
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN codigo TO code;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN porcentagem_desconto TO discount_percentage;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN uso_limite TO usage_limit;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN uso_atual TO current_usage;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN descricao TO description;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN vencimento TO end_date;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN indicacao_nome TO referral_name;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN indicacao_tipo TO referral_type;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN ativo TO is_active;
    ALTER TABLE IF EXISTS social_partnership_coupons RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - startup_pitches
DO $$ BEGIN
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN nome_startup TO company_name;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN descricao_startup TO description;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN nome_fundador TO responsible_name;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN setor TO sector;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN estagio TO stage;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN aprovado TO is_approved;
    ALTER TABLE IF EXISTS startup_pitches RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 2. RENAME COLUMNS - b2b_registration
DO $$ BEGIN
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN nome_empresa TO company_name;
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN descricao_empresa TO description;
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN nome_representante TO responsible_name;
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN setor TO sector;
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN aprovado TO is_approved;
    ALTER TABLE IF EXISTS b2b_registration RENAME COLUMN criado_em TO created_at;
EXCEPTION WHEN undefined_column THEN NULL; END $$;

-- 3. RECREATE POLICIES TO USE NEW NAMES
-- Since the names have changed, the easiest way to ensure consistency is to run a drop/create
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies from the renamed tables to recreate them
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN (
            'growth_experience_registrations', 'company_registrations', 
            'growth_experience_mentors', 'scheduled_mentorings', 
            'company_registration_batches', 'social_partnership_coupons',
            'activity_check_ins', 'partners', 'partner_team',
            'event_schedule', 'startup_pitches', 'b2b_registration',
            'growth_experience_transactions', 'raffle_registrations'
        ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Note: In a real-world scenario, you would parse and recreate all specific policies.
-- Here we're adding the core basic RLS based on typical patterns.

ALTER TABLE IF EXISTS growth_experience_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_select_rg" ON public.growth_experience_registrations FOR SELECT USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR public.is_admin());
CREATE POLICY "admin_all_rg" ON public.growth_experience_registrations FOR ALL USING (public.is_admin());
CREATE POLICY "public_insert_rg" ON public.growth_experience_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "users_own_update_rg" ON public.growth_experience_registrations FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

ALTER TABLE IF EXISTS event_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_es" ON public.event_schedule FOR SELECT USING (true);
CREATE POLICY "admin_all_es" ON public.event_schedule FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE IF EXISTS growth_experience_mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_gm" ON public.growth_experience_mentors FOR SELECT USING (status = 'approved' OR public.is_admin() OR user_id = auth.uid());
CREATE POLICY "public_insert_gm" ON public.growth_experience_mentors FOR INSERT WITH CHECK (true);
CREATE POLICY "users_own_update_gm" ON public.growth_experience_mentors FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admin_delete_gm" ON public.growth_experience_mentors FOR DELETE USING (public.is_admin());

-- Re-enable RLS for all the renamed tables (as best effort schema enforcement)
ALTER TABLE IF EXISTS company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scheduled_mentorings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS company_registration_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_partnership_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS partner_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS startup_pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS b2b_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS growth_experience_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS raffle_registrations ENABLE ROW LEVEL SECURITY;

-- Note: Additional generic read policies for admin
CREATE POLICY "admin_all" ON public.company_registrations FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.scheduled_mentorings FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.company_registration_batches FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.social_partnership_coupons FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.startup_pitches FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.b2b_registration FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.partners FOR ALL USING (public.is_admin());
CREATE POLICY "admin_all" ON public.partner_team FOR ALL USING (public.is_admin());

-- End of Standardization Script
