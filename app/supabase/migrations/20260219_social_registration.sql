-- Migração para suporte ao Programa de Inscrição Social
-- Growth Experience Triunfo 2026
-- 1. Adicionar colunas de indicação na tabela de inscrições
ALTER TABLE public.inscricoes_growth_experience
ADD COLUMN IF NOT EXISTS indicacao_tipo TEXT CHECK (
        indicacao_tipo IN (
            'prefeitura',
            'politico',
            'empresa',
            'promocional',
            'influenciador',
            'associacao',
            'instituicao',
            'outro',
            'nenhum'
        )
    ),
    ADD COLUMN IF NOT EXISTS indicacao_nome TEXT,
    ADD COLUMN IF NOT EXISTS codigo_social TEXT,
    ADD COLUMN IF NOT EXISTS codigo_palestra TEXT,
    ADD COLUMN IF NOT EXISTS cupom_palestra TEXT,
    -- Alias para consistência
ADD COLUMN IF NOT EXISTS valor_desconto_social DECIMAL(10, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS valor_desconto_palestra DECIMAL(10, 2) DEFAULT 0;
-- 2. Criar uma View para o Ranking de Prefeituras (Opcional para o Admin)
CREATE OR REPLACE VIEW public.view_ranking_prefeituras AS
SELECT indicacao_nome as prefeitura,
    count(*) as total_inscritos
FROM public.inscricoes_growth_experience
WHERE indicacao_tipo = 'prefeitura'
    AND status = 'ativo'
GROUP BY indicacao_nome
ORDER BY total_inscritos DESC;
-- 3. Criar uma View para o Ranking de Políticos (Opcional para o Admin)
CREATE OR REPLACE VIEW public.view_ranking_politicos AS
SELECT indicacao_nome as lideranca,
    count(*) as total_inscritos
FROM public.inscricoes_growth_experience
WHERE indicacao_tipo = 'politico'
    AND status = 'ativo'
GROUP BY indicacao_nome
ORDER BY total_inscritos DESC;
-- Comentários para documentação
COMMENT ON COLUMN public.inscricoes_growth_experience.indicacao_tipo IS 'Tipo de indicação: prefeitura ou liderança política';
COMMENT ON COLUMN public.inscricoes_growth_experience.indicacao_nome IS 'Nome da prefeitura ou do político para o programa social';
-- 4. Tabela de Cupons de Parceria Social
CREATE TABLE IF NOT EXISTS public.cupons_parceria_social (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo TEXT UNIQUE NOT NULL,
    indicacao_tipo TEXT NOT NULL CHECK (indicacao_tipo IN ('prefeitura', 'politico')),
    indicacao_nome TEXT NOT NULL,
    porcentagem_desconto INTEGER NOT NULL DEFAULT 100 CHECK (
        porcentagem_desconto >= 0
        AND porcentagem_desconto <= 100
    ),
    ativo BOOLEAN DEFAULT TRUE,
    uso_limite INTEGER DEFAULT NULL,
    uso_atual INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Inserir alguns cupons de exemplo
INSERT INTO public.cupons_parceria_social (
        codigo,
        indicacao_tipo,
        indicacao_nome,
        porcentagem_desconto
    )
VALUES ('TRIUNFO50', 'prefeitura', 'TRIUNFO', 50) ON CONFLICT (codigo) DO NOTHING;
-- 5. Ajustes na Tabela de Mentores (Adicionar colunas faltantes)
ALTER TABLE public.mentores_growth_experience
ADD COLUMN IF NOT EXISTS foto_url TEXT,
    ADD COLUMN IF NOT EXISTS cargo TEXT;
-- Habilitar RLS
ALTER TABLE public.cupons_parceria_social ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de cupons" ON public.cupons_parceria_social;
CREATE POLICY "Leitura pública de cupons" ON public.cupons_parceria_social FOR
SELECT USING (true);
-- Garantir RLS em mentores
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience;
CREATE POLICY "Qualquer um pode se candidatar como mentor" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil de mentor" ON public.mentores_growth_experience;
CREATE POLICY "Usuários podem ver seu próprio perfil de mentor" ON public.mentores_growth_experience FOR
SELECT USING (true);