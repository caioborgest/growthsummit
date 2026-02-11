-- ============================================================
-- GROWTH EXPERIENCE TRIUNFO-PE 2026 - DATABASE SETUP
-- ============================================================
-- Execute este SQL no Supabase SQL Editor
-- ============================================================
-- ============================================================
-- TABELA: inscricoes_growth_experience_triunfo
-- Armazena todas as inscrições (palestras, mentores, cursos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience_triunfo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    empresa VARCHAR(255),
    tipo_inscricao VARCHAR(50) NOT NULL CHECK (
        tipo_inscricao IN ('palestra', 'mentor', 'cursos')
    ),
    evento VARCHAR(255) NOT NULL DEFAULT 'Growth Experience Triunfo-PE 2026',
    valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (
        status IN ('pendente', 'confirmado', 'pago', 'cancelado')
    ),
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    stripe_payment_status VARCHAR(50),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    -- Índices
    CONSTRAINT unique_email_tipo UNIQUE (email, tipo_inscricao)
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON public.inscricoes_growth_experience_triunfo(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_tipo ON public.inscricoes_growth_experience_triunfo(tipo_inscricao);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON public.inscricoes_growth_experience_triunfo(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created ON public.inscricoes_growth_experience_triunfo(created_at);
-- ============================================================
-- TABELA: startups_arena_pitch
-- Armazena inscrições de startups para a Arena Pitch
-- ============================================================
CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Informações do Fundador
    nome_fundador VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    -- Informações da Startup
    nome_startup VARCHAR(255) NOT NULL,
    descricao_startup TEXT NOT NULL,
    setor VARCHAR(100) NOT NULL,
    estagio VARCHAR(50) NOT NULL CHECK (
        estagio IN ('ideia', 'mvp', 'validacao', 'tracao', 'escala')
    ),
    -- Pitch
    problema TEXT NOT NULL,
    solucao TEXT NOT NULL,
    diferencial TEXT NOT NULL,
    faturamento_mensal DECIMAL(10, 2),
    investimento_buscado DECIMAL(10, 2),
    -- Documentos
    pitch_deck_url VARCHAR(500),
    video_pitch_url VARCHAR(500),
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (
        status IN (
            'pendente',
            'aprovado',
            'reprovado',
            'finalista',
            'vencedor'
        )
    ),
    pontuacao INTEGER DEFAULT 0,
    feedback TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avaliado_at TIMESTAMP WITH TIME ZONE
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_startups_email ON public.startups_arena_pitch(email);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups_arena_pitch(status);
CREATE INDEX IF NOT EXISTS idx_startups_setor ON public.startups_arena_pitch(setor);
CREATE INDEX IF NOT EXISTS idx_startups_estagio ON public.startups_arena_pitch(estagio);
-- ============================================================
-- TABELA: rodada_negocios_b2b
-- Armazena inscrições para rodada de negócios B2B
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Informações do Representante
    nome_representante VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    -- Informações da Empresa
    nome_empresa VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    setor VARCHAR(100) NOT NULL,
    porte VARCHAR(50) NOT NULL CHECK (
        porte IN ('mei', 'micro', 'pequena', 'media', 'grande')
    ),
    faturamento_anual DECIMAL(15, 2),
    numero_funcionarios INTEGER,
    -- Sobre a Empresa
    descricao_empresa TEXT NOT NULL,
    produtos_servicos TEXT NOT NULL,
    site_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    -- Objetivos na Rodada
    tipo_interesse VARCHAR(50) NOT NULL CHECK (
        tipo_interesse IN ('comprar', 'vender', 'parceria', 'todos')
    ),
    areas_interesse TEXT NOT NULL,
    descricao_objetivos TEXT NOT NULL,
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado')),
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprovado_at TIMESTAMP WITH TIME ZONE
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_rodada_email ON public.rodada_negocios_b2b(email);
CREATE INDEX IF NOT EXISTS idx_rodada_status ON public.rodada_negocios_b2b(status);
CREATE INDEX IF NOT EXISTS idx_rodada_setor ON public.rodada_negocios_b2b(setor);
CREATE INDEX IF NOT EXISTS idx_rodada_porte ON public.rodada_negocios_b2b(porte);
CREATE INDEX IF NOT EXISTS idx_rodada_tipo_interesse ON public.rodada_negocios_b2b(tipo_interesse);
-- ============================================================
-- TABELA: pagamentos_stripe
-- Armazena logs de pagamentos do Stripe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pagamentos_stripe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Stripe IDs
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    -- Informações do Pagamento
    inscricao_id UUID REFERENCES public.inscricoes_growth_experience_triunfo(id),
    email VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    moeda VARCHAR(3) DEFAULT 'BRL',
    -- Status
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'pending',
            'processing',
            'succeeded',
            'failed',
            'canceled',
            'refunded'
        )
    ),
    -- Metadados
    metadata JSONB,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_pagamentos_payment_intent ON public.pagamentos_stripe(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_session ON public.pagamentos_stripe(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_inscricao ON public.pagamentos_stripe(inscricao_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos_stripe(status);
-- ============================================================
-- TRIGGERS: Updated At
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Aplicar triggers
DROP TRIGGER IF EXISTS update_inscricoes_updated_at ON public.inscricoes_growth_experience_triunfo;
CREATE TRIGGER update_inscricoes_updated_at BEFORE
UPDATE ON public.inscricoes_growth_experience_triunfo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_startups_updated_at ON public.startups_arena_pitch;
CREATE TRIGGER update_startups_updated_at BEFORE
UPDATE ON public.startups_arena_pitch FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_rodada_updated_at ON public.rodada_negocios_b2b;
CREATE TRIGGER update_rodada_updated_at BEFORE
UPDATE ON public.rodada_negocios_b2b FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON public.pagamentos_stripe;
CREATE TRIGGER update_pagamentos_updated_at BEFORE
UPDATE ON public.pagamentos_stripe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================
-- Habilitar RLS
ALTER TABLE public.inscricoes_growth_experience_triunfo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_stripe ENABLE ROW LEVEL SECURITY;
-- Políticas para inscricoes_growth_experience_triunfo
CREATE POLICY "Permitir inserção pública de inscrições" ON public.inscricoes_growth_experience_triunfo FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura própria de inscrições" ON public.inscricoes_growth_experience_triunfo FOR
SELECT TO authenticated USING (
        email = auth.jwt()->>'email'
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Admins podem gerenciar inscrições" ON public.inscricoes_growth_experience_triunfo FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Políticas para startups_arena_pitch
CREATE POLICY "Permitir inserção pública de startups" ON public.startups_arena_pitch FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura própria de startups" ON public.startups_arena_pitch FOR
SELECT TO authenticated USING (
        email = auth.jwt()->>'email'
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Admins podem gerenciar startups" ON public.startups_arena_pitch FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Políticas para rodada_negocios_b2b
CREATE POLICY "Permitir inserção pública de rodada B2B" ON public.rodada_negocios_b2b FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura própria de rodada B2B" ON public.rodada_negocios_b2b FOR
SELECT TO authenticated USING (
        email = auth.jwt()->>'email'
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Admins podem gerenciar rodada B2B" ON public.rodada_negocios_b2b FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- Políticas para pagamentos_stripe
CREATE POLICY "Permitir inserção de pagamentos" ON public.pagamentos_stripe FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
CREATE POLICY "Permitir leitura própria de pagamentos" ON public.pagamentos_stripe FOR
SELECT TO authenticated USING (
        email = auth.jwt()->>'email'
        OR EXISTS (
            SELECT 1
            FROM public.users
            WHERE id = auth.uid()
                AND role IN ('admin', 'staff')
        )
    );
CREATE POLICY "Admins podem gerenciar pagamentos" ON public.pagamentos_stripe FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.users
        WHERE id = auth.uid()
            AND role = 'admin'
    )
);
-- ============================================================
-- VIEWS: Estatísticas e Relatórios
-- ============================================================
-- View: Estatísticas de Inscrições
CREATE OR REPLACE VIEW public.estatisticas_inscricoes AS
SELECT tipo_inscricao,
    COUNT(*) as total,
    COUNT(
        CASE
            WHEN status = 'pago' THEN 1
        END
    ) as pagos,
    COUNT(
        CASE
            WHEN status = 'pendente' THEN 1
        END
    ) as pendentes,
    SUM(valor) as valor_total,
    SUM(
        CASE
            WHEN status = 'pago' THEN valor
            ELSE 0
        END
    ) as valor_pago
FROM public.inscricoes_growth_experience_triunfo
GROUP BY tipo_inscricao;
-- View: Estatísticas de Startups
CREATE OR REPLACE VIEW public.estatisticas_startups AS
SELECT estagio,
    setor,
    COUNT(*) as total,
    COUNT(
        CASE
            WHEN status = 'aprovado' THEN 1
        END
    ) as aprovados,
    COUNT(
        CASE
            WHEN status = 'finalista' THEN 1
        END
    ) as finalistas,
    AVG(pontuacao) as pontuacao_media
FROM public.startups_arena_pitch
GROUP BY estagio,
    setor;
-- View: Estatísticas de Rodada B2B
CREATE OR REPLACE VIEW public.estatisticas_rodada_b2b AS
SELECT setor,
    porte,
    tipo_interesse,
    COUNT(*) as total,
    COUNT(
        CASE
            WHEN status = 'aprovado' THEN 1
        END
    ) as aprovados
FROM public.rodada_negocios_b2b
GROUP BY setor,
    porte,
    tipo_interesse;
-- ============================================================
-- DADOS INICIAIS (Opcional)
-- ============================================================
-- Comentário: Você pode adicionar dados de teste aqui se necessário
-- ============================================================
-- CONCLUÍDO! ✅
-- ============================================================
-- Tabelas criadas:
-- 1. inscricoes_growth_experience_triunfo
-- 2. startups_arena_pitch
-- 3. rodada_negocios_b2b
-- 4. pagamentos_stripe
--
-- Recursos adicionados:
-- - Triggers para updated_at
-- - RLS policies para segurança
-- - Views para estatísticas
-- - Índices para performance
-- ============================================================