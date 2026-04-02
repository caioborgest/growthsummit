-- ============================================================
-- GROWTH SUMMIT 2026 - MIGRACAO PROJETOS V7
-- Sincroniza o schema do banco com as novas funcionalidades do editor
-- Adiciona suporte para metas financeiras, categorias e lotes segmentados
-- ============================================================

-- 1. ADICIONAR COLUNAS PARA METAS E ESTATISTICAS (SE NAO EXISTIREM)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='goal_revenue') THEN
        ALTER TABLE public.projects ADD COLUMN goal_revenue BIGINT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='goal_sponsorship') THEN
        ALTER TABLE public.projects ADD COLUMN goal_sponsorship BIGINT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='goal_registrations') THEN
        ALTER TABLE public.projects ADD COLUMN goal_registrations INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. ADICIONAR COLUNAS PARA CONTEUDO PUBLICO E LOTES (JSONB)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='public_content') THEN
        ALTER TABLE public.projects ADD COLUMN public_content JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='ticket_tiers') THEN
        ALTER TABLE public.projects ADD COLUMN ticket_tiers JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. GARANTIR EXTENSOES PARA ANALISE DE TRANSACOES (OPCIONAL)
-- CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- 4. COMENTARIOS PARA DOCUMENTACAO
COMMENT ON COLUMN public.projects.ticket_tiers IS 'Contém o array de categorias e seus respectivos lotes de venda (Financeiro/Lotes)';
COMMENT ON COLUMN public.projects.goal_revenue IS 'Meta total de faturamento bruto do evento (Dashboard)';
COMMENT ON COLUMN public.projects.public_content IS 'Conteúdo dinâmico para a landing page (Palestrantes, Hero, etc.)';

-- ============================================================
-- FIM DA MIGRACAO
-- ============================================================
