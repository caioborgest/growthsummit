-- Adiciona colunas de configuração e habilitadores de módulos para a tabela projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enable_b2b BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_mentoring BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_startups BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS enable_check_in BOOLEAN DEFAULT true;

-- Força o reload do schema no cache da API REST do Supabase (para evitar "Failed to fetch")
NOTIFY pgrst, 'reload schema';
