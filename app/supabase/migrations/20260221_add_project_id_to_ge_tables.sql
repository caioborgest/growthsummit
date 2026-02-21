-- Migração para adicionar project_id às tabelas do Growth Experience
-- Permitindo a gestão de múltiplos eventos (Triunfo, Petrolina, etc)
-- 1. Adicionar project_id à tabela de inscrições
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- 2. Adicionar project_id à tabela de startups
ALTER TABLE public.startups_arena_pitch
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- 3. Adicionar project_id à tabela de rodada B2B
ALTER TABLE public.rodada_negocios_b2b
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- 4. Adicionar project_id à tabela de cupons sociais
ALTER TABLE public.cupons_parceria_social
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- 5. Adicionar project_id à tabela de mentorias agendadas
ALTER TABLE public.mentorias_agendadas
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- 6. Adicionar project_id à tabela de programação
ALTER TABLE public.programacao
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_inscricoes_ge_project_id ON public.inscricoes_growth_experience(project_id);
CREATE INDEX IF NOT EXISTS idx_startups_ap_project_id ON public.startups_arena_pitch(project_id);
CREATE INDEX IF NOT EXISTS idx_rodada_b2b_project_id ON public.rodada_negocios_b2b(project_id);
CREATE INDEX IF NOT EXISTS idx_cupons_social_project_id ON public.cupons_parceria_social(project_id);
CREATE INDEX IF NOT EXISTS idx_programacao_project_id ON public.programacao(project_id);