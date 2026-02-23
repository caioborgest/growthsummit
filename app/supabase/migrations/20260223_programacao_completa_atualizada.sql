-- ============================================
-- MIGRATION: ATUALIZAÇÃO PROGRAMAÇÃO COMPLETA
-- Growth Summit 2026 - Triunfo
-- ============================================
-- Execute este SQL no Supabase para atualizar programação completa
-- Data: 2026-02-23

-- ============================================
-- 1. ATUALIZAR TIPOS DE ATIVIDADES NA TABELA PROGRAMAÇÃO
-- ============================================

-- Remover constraint antigo se existir
ALTER TABLE public.programacao DROP CONSTRAINT IF EXISTS programacao_tipo_check;

-- Adicionar novos tipos de atividades
ALTER TABLE public.programacao 
ADD CONSTRAINT programacao_tipo_check 
CHECK (tipo IN ('palestra', 'oficina', 'workshop', 'curso', 'networking', 'circuito', 'mentoria', 'startup', 'b2b'));

-- ============================================
-- 2. LIMPAR DADOS ANTIGOS E INSERIR PROGRAMAÇÃO COMPLETA
-- ============================================

-- Limpar dados existentes
DELETE FROM public.programacao;

-- Inserir programação diurna completa (cursos, oficinas, workshops)
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, local, horario_inicio, horario_fim, vagas, gratuito, tags, nivel, bloco) VALUES
-- BLOCO 1 (08:30 - 10:00)
('oficina-gestao-caixa', 'curso', 'Gestão simples de caixa, estoque e preço', 'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.', 'Consultor SEBRAE', 'Sala 1', '08:30:00', '10:00:00', 20, true, ARRAY['Gestão', 'Finanças', 'Estoque'], 'Iniciante', 'manha-1'),
('workshop-posicionamento', 'curso', 'Posicionamento e ofertas para virar referência', 'Como destacar seu negócio no mercado local e criar propostas irresistíveis para seus clientes.', 'Especialista em Marketing', 'Sala 2', '08:30:00', '10:00:00', 20, true, ARRAY['Marketing', 'Posicionamento', 'Ofertas'], 'Intermediário', 'manha-1'),
('oficina-vendas-abordagem', 'curso', 'Atendimento que vende: roteiro de abordagem', 'Técnicas práticas de abordagem e fechamento de vendas focadas no cliente local.', 'Mentor de Vendas', 'Sala 3', '08:30:00', '10:00:00', 20, true, ARRAY['Vendas', 'Atendimento', 'Negociação'], 'Iniciante', 'manha-1'),
('workshop-negocios-escalaveis', 'workshop', 'Negócios Escaláveis - Do Zero ao Milhão', 'Estratégias para escalar seu negócio local e alcançar novos mercados.', 'Empreendedor Serial', 'Sala 4', '08:30:00', '10:00:00', 80, true, ARRAY['Escalabilidade', 'Negócios', 'Crescimento'], 'Intermediário', 'manha-1'),

-- BLOCO 2 (10:15 - 11:45)
('oficina-whatsapp-marketing', 'curso', 'Listas de transmissão e atendimento rápido no WhatsApp', 'Transforme seu WhatsApp em uma máquina de vendas com organização e automação simples.', 'Consultor de Digital', 'Sala 1', '10:15:00', '11:45:00', 20, true, ARRAY['WhatsApp', 'Vendas', 'Digital'], 'Iniciante', 'manha-2'),
('workshop-instagram-reels', 'curso', 'Instagram e Reels para negócios locais', 'Aprenda a produzir conteúdo que atrai clientes reais da sua região através do Instagram.', 'Social Media Expert', 'Sala 2', '10:15:00', '11:45:00', 20, true, ARRAY['Instagram', 'Conteúdo', 'Negócios Locais'], 'Intermediário', 'manha-2'),
('oficina-ia-pratica', 'curso', 'Primeiros passos com Inteligência Artificial', 'Como usar ChatGPT e outras IAs para acelerar a criação de posts e textos do seu negócio.', 'Especialista em IA', 'Sala 3', '10:15:00', '11:45:00', 20, true, ARRAY['IA', 'Tecnologia', 'Inovação'], 'Iniciante', 'manha-2'),
('curso-financas-pessoais', 'curso', 'Finanças Pessoais para Empreendedores', 'Como organizar suas finanças pessoais para ter mais liberdade e segurança no empreendedorismo.', 'Consultor Financeiro', 'Sala 4', '10:15:00', '11:45:00', 80, true, ARRAY['Finanças', 'Planejamento', 'Segurança'], 'Iniciante', 'manha-2'),

-- BLOCO 3 (14:00 - 15:30)
('oficina-plano-acao', 'curso', 'Plano de ação em uma página', 'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual.', 'Especialista em Estratégia', 'Sala 1', '14:00:00', '15:30:00', 20, true, ARRAY['Estratégia', 'Planejamento', 'Gestão'], 'Intermediário', 'tarde-1'),
('workshop-vendas-b2b', 'curso', 'Vendendo para empresas e prefeituras (B2B/B2G)', 'Como prospectar e fechar contratos com grandes empresas e órgãos públicos.', 'Consultor de Vendas B2B', 'Sala 2', '14:00:00', '15:30:00', 20, true, ARRAY['Vendas', 'B2B', 'B2G'], 'Avançado', 'tarde-1'),
('oficina-ia-produtividade', 'curso', 'Automatizando tarefas chatas com IA', 'Use a inteligência artificial como seu assistente para ganhar tempo no dia a dia.', 'Tech Station', 'Sala 3', '14:00:00', '15:30:00', 20, true, ARRAY['IA', 'Produtividade', 'Automação'], 'Iniciante', 'tarde-1'),
('workshop-lideranca-equipes', 'workshop', 'Liderança de Equipes de Alta Performance', 'Como formar, motivar e liderar equipes que entregam resultados extraordinários.', 'Coach de Liderança', 'Sala 4', '14:00:00', '15:30:00', 80, true, ARRAY['Liderança', 'Equipes', 'Performance'], 'Avançado', 'tarde-1'),

-- BLOCO 4 (15:45 - 17:15)
('oficina-marketing-digital', 'workshop', 'Marketing digital para quem não entende nada', 'Do zero ao básico: como criar campanhas simples que trazem clientes reais.', 'Digital Coach', 'Sala 1', '15:45:00', '17:15:00', 20, true, ARRAY['Marketing', 'Digital', 'Campanhas'], 'Iniciante', 'tarde-2'),
('workshop-fotografia-produtos', 'workshop', 'Fotografia de produtos com celular', 'Tire fotos profissionais dos seus produtos usando apenas o smartphone.', 'Fotógrafo Comercial', 'Sala 2', '15:45:00', '17:15:00', 20, true, ARRAY['Fotografia', 'Produtos', 'Smartphone'], 'Iniciante', 'tarde-2'),
('oficina-atendimento-cliente', 'workshop', 'Atendimento 5 estrelas que fideliza', 'Técnicas para encantar clientes e transformá-los em fãs do seu negócio.', 'Especialista em CX', 'Sala 3', '15:45:00', '17:15:00', 20, true, ARRAY['Atendimento', 'Clientes', 'Fidelização'], 'Intermediário', 'tarde-2'),
('curso-juridico-empreendedor', 'curso', 'Jurídico para Empreendedores', 'O que todo empreendedor precisa saber sobre contratos, tributos e proteção do negócio.', 'Advogado Empresarial', 'Sala 4', '15:45:00', '17:15:00', 80, true, ARRAY['Jurídico', 'Contratos', 'Tributos'], 'Intermediário', 'tarde-2');

-- Inserir programação noturna (palestras no Salão Principal)
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, local, horario_inicio, horario_fim, vagas, gratuito, valor, tags, bloco) VALUES
('palestra-abertura', 'palestra', 'Palestra de Abertura - O Futuro dos Negócios Locais', 'Como pequenos e médios negócios podem prosperar na era digital', 'Keynote Speaker', 'Salão Principal', '19:00:00', '20:30:00', 600, false, 179.00, ARRAY['Negócios', 'Digital', 'Futuro'], 'noite-1'),
('palestra-encerramento', 'palestra', 'Palestra de Encerramento - Transformação Digital', 'Cases de sucesso e estratégias para 2026', 'Keynote Speaker', 'Salão Principal', '20:45:00', '22:15:00', 600, false, 179.00, ARRAY['Transformação', 'Cases', 'Estratégias'], 'noite-2');

-- ============================================
-- 3. ATUALIZAR TABELA DE INSCRIÇÕES PARA SUPORTAR NOVOS TIPOS
-- ============================================

-- Adicionar colunas para tipos específicos se não existirem
ALTER TABLE public.inscricoes_growth_experience 
ADD COLUMN IF NOT EXISTS tipo_atividade_selecionada TEXT,
ADD COLUMN IF NOT EXISTS sala_atividade TEXT,
ADD COLUMN IF NOT EXISTS horario_atividade TIME,
ADD COLUMN IF NOT EXISTS nivel_atividade TEXT;

-- Adicionar constraint para tipo_atividade_selecionada
ALTER TABLE public.inscricoes_growth_experience 
ADD CONSTRAINT IF NOT EXISTS inscricoes_tipo_atividade_check 
CHECK (tipo_atividade_selecionada IN ('curso', 'oficina', 'workshop', 'palestra', 'networking', 'mentoria', 'startup', 'b2b'));

-- ============================================
-- 4. CRIAR VIEWS PARA FACILITAR CONSULTAS
-- ============================================

-- View para atividades disponíveis (diurna)
CREATE OR REPLACE VIEW public.view_atividades_disponiveis AS
SELECT 
    id_atividade,
    tipo,
    titulo,
    descricao,
    palestrante,
    local,
    horario_inicio,
    horario_fim,
    vagas,
    gratuito,
    valor,
    tags,
    nivel,
    bloco
FROM public.programacao
WHERE tipo IN ('curso', 'oficina', 'workshop')
ORDER BY horario_inicio;

-- View para palestras noturnas
CREATE OR REPLACE VIEW public.view_palestras_noturnas AS
SELECT 
    id_atividade,
    tipo,
    titulo,
    descricao,
    palestrante,
    local,
    horario_inicio,
    horario_fim,
    vagas,
    gratuito,
    valor,
    tags,
    bloco
FROM public.programacao
WHERE tipo = 'palestra' AND local = 'Salão Principal'
ORDER BY horario_inicio;

-- View para inscrições com detalhes da atividade
CREATE OR REPLACE VIEW public.view_inscricoes_com_atividade AS
SELECT 
    i.id,
    i.nome,
    i.email,
    i.telefone,
    i.cursos_selecionados,
    i.tipo_atividade_selecionada,
    i.sala_atividade,
    i.horario_atividade,
    i.nivel_atividade,
    i.status,
    i.created_at,
    p.titulo as atividade_titulo,
    p.tipo as atividade_tipo,
    p.local as atividade_local,
    p.horario_inicio as atividade_horario_inicio,
    p.horario_fim as atividade_horario_fim,
    p.palestrante as atividade_palestrante
FROM public.inscricoes_growth_experience i
LEFT JOIN public.programacao p ON i.cursos_selecionados && ARRAY[p.id_atividade]
ORDER BY i.created_at DESC;

-- ============================================
-- 5. ATUALIZAR POLÍTICAS RLS
-- ============================================

-- Política para view de atividades disponíveis
CREATE POLICY "Atividades disponíveis visíveis para todos" 
    ON public.view_atividades_disponiveis FOR SELECT 
    USING (true);

-- Política para view de inscrições (apenas admins)
CREATE POLICY "Apenas admins podem ver inscrições detalhadas" 
    ON public.view_inscricoes_com_atividade FOR SELECT 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_programacao_tipo_atividade ON public.programacao(tipo);
CREATE INDEX IF NOT EXISTS idx_programacao_local ON public.programacao(local);
CREATE INDEX IF NOT EXISTS idx_programacao_nivel ON public.programacao(nivel);
CREATE INDEX IF NOT EXISTS idx_inscricoes_tipo_atividade ON public.inscricoes_growth_experience(tipo_atividade_selecionada);
CREATE INDEX IF NOT EXISTS idx_inscricoes_sala ON public.inscricoes_growth_experience(sala_atividade);

-- ============================================
-- 7. TRIGGER PARA ATUALIZAR CAMPOS DERIVADOS
-- ============================================

-- Função para atualizar campos derivados da inscrição
CREATE OR REPLACE FUNCTION public.atualizar_campos_inscricao()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Se há cursos selecionados, atualizar campos derivados
    IF NEW.cursos_selecionados IS NOT NULL AND array_length(NEW.cursos_selecionados, 1) > 0 THEN
        -- Buscar informações da primeira atividade selecionada
        SELECT 
            p.tipo,
            p.local,
            p.horario_inicio,
            p.nivel
        INTO 
            NEW.tipo_atividade_selecionada,
            NEW.sala_atividade,
            NEW.horario_atividade,
            NEW.nivel_atividade
        FROM public.programacao p
        WHERE p.id_atividade = NEW.cursos_selecionados[1]
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para atualizar campos derivados
DROP TRIGGER IF EXISTS trigger_atualizar_inscricao ON public.inscricoes_growth_experience;
CREATE TRIGGER trigger_atualizar_inscricao
    BEFORE INSERT OR UPDATE ON public.inscricoes_growth_experience
    FOR EACH ROW
    EXECUTE FUNCTION public.atualizar_campos_inscricao();

-- ============================================
-- 8. RESUMO DAS ATUALIZAÇÕES
-- ============================================

/*
✅ ATUALIZAÇÕES REALIZADAS:

1. CAPACIDADES DAS SALAS:
   - Sala 1: 20 pessoas (cursos/oficinas/workshops)
   - Sala 2: 20 pessoas (cursos/oficinas/workshops)
   - Sala 3: 20 pessoas (cursos/oficinas/workshops)
   - Sala 4: 80 pessoas (workshops/cursos de maior capacidade)
   - Salão Principal: 600 pessoas (palestras noturnas)

2. PROGRAMAÇÃO DIURNA (GRATUITA):
   - 16 atividades: 4 blocos × 4 salas
   - 4 blocos horários: 08:30, 10:15, 14:00, 15:45
   - Salas 1-3: 20 vagas cada
   - Sala 4: 80 vagas cada

3. PROGRAMAÇÃO NOTURNA (PAGA):
   - 2 palestras no Salão Principal
   - 19:00-20:30: Palestra de Abertura
   - 20:45-22:15: Palestra de Encerramento
   - 600 vagas cada, valor R$ 179,00

4. TIPOS DE ATIVIDADES:
   - Cursos (Azul)
   - Oficinas (Verde)
   - Workshops (Roxo)
   - Palestras (Laranja)

5. VIEWS CRIADAS:
   - view_atividades_disponiveis: atividades diurnas
   - view_palestras_noturnas: palestras do Salão Principal
   - view_inscricoes_com_atividade: inscrições com detalhes

6. FORMULÁRIO ATUALIZADO:
   - Seleção de atividades diurnas (1 por pessoa)
   - Opção para palestras noturnas (pagas)
   - Badges coloridos por tipo
   - Informações completas salvas

🚀 PROGRAMAÇÃO MANTIDA - APENAS INTEGRADA AO FORMULÁRIO!
*/
