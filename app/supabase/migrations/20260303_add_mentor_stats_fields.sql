-- Adicionar colunas de experiência e capacidade na tabela de mentores
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_mentories INTEGER DEFAULT 0;
-- Comentário para documentação
COMMENT ON COLUMN public.mentores_growth_experience.years_experience IS 'Anos de experiência profissional do mentor';
COMMENT ON COLUMN public.mentores_growth_experience.max_mentories IS 'Capacidade máxima de slots de mentoria para o evento';