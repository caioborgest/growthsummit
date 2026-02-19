-- ============================================================
-- GROWTH EXPERIENCE TRIUNFO - TABELAS DE INSCRIÇÃO
-- ============================================================
-- 1. Tabela Principal de Inscrições do Evento (Cursos e Palestras)
CREATE TABLE IF NOT EXISTS public.inscricoes_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    empresa TEXT,
    tipo_inscricao TEXT,
    -- 'palestra', 'cursos', 'participante'
    cursos_selecionados TEXT [],
    -- Array de IDs dos cursos (para inscrição diurna)
    palestras_noturnas BOOLEAN DEFAULT FALSE,
    valor_pago DECIMAL(10, 2) DEFAULT 0,
    status_pagamento TEXT DEFAULT 'pendente',
    -- 'pendente', 'pago', 'cancelado'
    status TEXT DEFAULT 'ativo',
    app_instalado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 2. Tabela de Inscrição de Startups (Arena Pitch)
CREATE TABLE IF NOT EXISTS public.startups_arena_pitch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_fundador TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_startup TEXT NOT NULL,
    descricao_startup TEXT NOT NULL,
    setor TEXT NOT NULL,
    estagio TEXT NOT NULL,
    problema TEXT NOT NULL,
    solucao TEXT NOT NULL,
    diferencial TEXT NOT NULL,
    faturamento_mensal DECIMAL(12, 2),
    investimento_buscado DECIMAL(12, 2),
    pitch_deck_url TEXT,
    video_pitch_url TEXT,
    status TEXT DEFAULT 'pendente',
    -- 'pendente', 'aprovado', 'rejeitado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Tabela de Inscrição para Rodada de Negócios B2B
CREATE TABLE IF NOT EXISTS public.rodada_negocios_b2b (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_representante TEXT NOT NULL,
    cargo TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT,
    setor TEXT NOT NULL,
    porte TEXT NOT NULL,
    faturamento_anual DECIMAL(15, 2),
    numero_funcionarios INTEGER,
    descricao_empresa TEXT NOT NULL,
    produtos_servicos TEXT NOT NULL,
    site_url TEXT,
    linkedin_url TEXT,
    tipo_interesse TEXT NOT NULL,
    areas_interesse TEXT NOT NULL,
    descricao_objetivos TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    -- 'pendente', 'aprovado', 'rejeitado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Tabela de Cadastro de Mentores
CREATE TABLE IF NOT EXISTS public.mentores_growth_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    empresa TEXT,
    especialidades TEXT [],
    bio TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Tabela de Agendamento de Mentoria (Sessões 1:1)
CREATE TABLE IF NOT EXISTS public.mentorias_agendadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentorado_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID,
    nome_mentorado TEXT NOT NULL,
    email_mentorado TEXT NOT NULL,
    telefone_mentorado TEXT NOT NULL,
    tema_interesse TEXT,
    horario_preferido TEXT,
    status TEXT DEFAULT 'pendente',
    -- 'pendente', 'confirmado', 'concluido'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Habilitar RLS
ALTER TABLE public.inscricoes_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups_arena_pitch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rodada_negocios_b2b ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentores_growth_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorias_agendadas ENABLE ROW LEVEL SECURITY;
-- Políticas de Acesso (Simplificadas para o evento)
-- Inscricoes: Permitir inserção pública e leitura básica
CREATE POLICY "Permitir inserção pública" ON public.inscricoes_growth_experience FOR
INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura para o próprio usuário" ON public.inscricoes_growth_experience FOR
SELECT USING (true);
-- Simplificado para o evento
-- Startups: Permitir inserção pública
CREATE POLICY "Permitir inserção pública startups" ON public.startups_arena_pitch FOR
INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura startups" ON public.startups_arena_pitch FOR
SELECT USING (true);
-- B2B: Permitir inserção pública
CREATE POLICY "Permitir inserção pública b2b" ON public.rodada_negocios_b2b FOR
INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura b2b" ON public.rodada_negocios_b2b FOR
SELECT USING (true);
-- Mentores: Permitir inserção pública
CREATE POLICY "Permitir inserção pública mentores" ON public.mentores_growth_experience FOR
INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura mentores" ON public.mentores_growth_experience FOR
SELECT USING (true);
-- Mentorias: Permitir inserção pública
CREATE POLICY "Permitir inserção pública mentorias" ON public.mentorias_agendadas FOR
INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura mentorias" ON public.mentorias_agendadas FOR
SELECT USING (true);