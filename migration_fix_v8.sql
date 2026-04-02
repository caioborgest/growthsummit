-- ============================================================
-- GROWTH SUMMIT 2026 - MIGRACAO FIX V8
-- Corrige erros de colunas faltantes e permissões de acesso
-- ============================================================

-- 1. CORRIGIR TABELA DE TRANSACOES (Coluna reference_person)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transacoes_growth_experience' AND column_name='reference_person') THEN
        ALTER TABLE public.transacoes_growth_experience ADD COLUMN reference_person TEXT;
    END IF;
    
    -- Também garantir na tabela genérica se necessário (para projetos não-GE)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='reference_person') THEN
        ALTER TABLE public.transactions ADD COLUMN reference_person TEXT;
    END IF;
END $$;

-- 2. CORRIGIR PERMISSÕES DE POP-UPS (Fix 403 Forbidden)
-- Habilitar RLS se não estiver habilitado
ALTER TABLE IF EXISTS public.project_popups ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Anyone can view active popups" ON public.project_popups;
DROP POLICY IF EXISTS "Admins can manage popups" ON public.project_popups;

-- Criar novas políticas robustas
CREATE POLICY "Public can view active popups" 
ON public.project_popups 
FOR SELECT 
TO anon, authenticated
USING (status = 'active');

CREATE POLICY "Admins can manage popups" 
ON public.project_popups 
FOR ALL 
TO authenticated 
USING (public.is_admin());

-- 3. GARANTIR QUE A TABELA DE POP-UPS TENHA COLUNA DE STATUS E PRIORIDADE
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_popups' AND column_name='status') THEN
        ALTER TABLE public.project_popups ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='project_popups' AND column_name='priority') THEN
        ALTER TABLE public.project_popups ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;
END $$;

-- 4. COMENTARIOS PARA DOCUMENTACAO
COMMENT ON COLUMN public.transacoes_growth_experience.reference_person IS 'Pessoa ou empresa de referência para o lançamento financeiro';
COMMENT ON TABLE public.project_popups IS 'Banners de marketing e captura de leads do sistema';

-- ============================================================
-- FIM DA MIGRACAO
-- ============================================================
