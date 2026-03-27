-- Adiciona a coluna public_content para suportar configurações dinâmicas como pop-ups e textos do Admin
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS public_content JSONB DEFAULT '{}'::jsonb;
