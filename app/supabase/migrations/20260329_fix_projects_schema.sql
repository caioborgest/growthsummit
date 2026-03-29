-- ============================================================
-- GROWTH SUMMIT 2026 - SCHEMA HARMONIZATION & FIX
-- Execute este SQL no Dashboard do Supabase (SQL Editor)
-- Resolve erros de "schema cache" e colunas faltantes (birth_date, enable_b2b, etc.)
-- ============================================================

-- 1. TABELA PROJECTS (Eventos)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT true;

-- 2. Harmoniza os nomes das metas (meta de receita e inscritos)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS goal_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_sponsorship NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_revenue NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_registrations INTEGER DEFAULT 0;

-- 3. Garante colunas básicas de configuração e identidade visual
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS banner TEXT,
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#21808D',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#FE4C38';

-- 4. TABELA PROFILES (Perfis de Usuários)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 5. TABELA USERS (Identity Fix)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- 6. TABELA INSCRICOES_GROWTH_EXPERIENCE (Campos GE)
ALTER TABLE public.inscricoes_growth_experience 
ADD COLUMN IF NOT EXISTS indicacao_tipo TEXT DEFAULT 'nenhum',
ADD COLUMN IF NOT EXISTS indicacao_nome TEXT,
ADD COLUMN IF NOT EXISTS codigo_social TEXT,
ADD COLUMN IF NOT EXISTS codigo_palestra TEXT,
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- 7. FORÇA O RECARREGAMENTO DO CACHE DO POSTGREST
NOTIFY pgrst, 'reload schema';
