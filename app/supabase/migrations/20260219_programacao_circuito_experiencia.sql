-- ============================================
-- MIGRATION: PROGRAMAÇÃO CIRCUITO DE EXPERIÊNCIA
-- Growth Summit 2026 - Triunfo
-- ============================================
-- Execute este SQL no Supabase para criar/atualizar a programação
-- Data: 2026-02-19

-- ============================================
-- 1. CRIAR/ATUALIZAR TABELA DE PROGRAMAÇÃO
-- ============================================

-- Verificar se a tabela existe, se não, criar
CREATE TABLE IF NOT EXISTS public.programacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_atividade VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('palestra', 'oficina', 'workshop', 'networking', 'circuito', 'mentoria')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    palestrante VARCHAR(255),
    empresa VARCHAR(100),
    local VARCHAR(255) NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    vagas INTEGER DEFAULT 0,
    gratuito BOOLEAN DEFAULT true,
    valor DECIMAL(10,2),
    tags TEXT[],
    nivel VARCHAR(20) CHECK (nivel IN ('Iniciante', 'Intermediário', 'Avançado')),
    bloco VARCHAR(20) CHECK (bloco IN ('manha-1', 'manha-2', 'tarde-1', 'tarde-2', 'circulacao')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_programacao_tipo ON public.programacao(tipo);
CREATE INDEX IF NOT EXISTS idx_programacao_bloco ON public.programacao(bloco);
CREATE INDEX IF NOT EXISTS idx_programacao_horario ON public.programacao(horario_inicio);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.programacao ENABLE ROW LEVEL SECURITY;

-- Política: todos podem ler
CREATE POLICY "Programação visível para todos" 
    ON public.programacao FOR SELECT 
    USING (true);

-- Política: apenas admins podem modificar
CREATE POLICY "Apenas admins podem modificar programação" 
    ON public.programacao FOR ALL 
    USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 2. TRIGGER PARA ATUALIZAR data_atualizacao
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_programacao_updated_at ON public.programacao;
CREATE TRIGGER update_programacao_updated_at
    BEFORE UPDATE ON public.programacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. LIMPAR PROGRAMAÇÃO ANTIGA (OPCIONAL)
-- Descomente se quiser limpar antes de inserir nova
-- DELETE FROM public.programacao WHERE bloco IN ('manha-1', 'manha-2', 'tarde-1', 'tarde-2', 'circulacao');
-- ============================================

-- ============================================
-- 4. INSERIR PROGRAMAÇÃO - MANHÃ BLOCO 1 (8h30-10h00)
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, empresa, local, horario_inicio, horario_fim, vagas, gratuito, tags, nivel, bloco) VALUES
('palestra-abertura-salao', 'palestra', 'Mapa de Crescimento para MPEs do Sertão do Pajeú', 
 'Principais desafios: gestão do dia a dia, vendas, atração de clientes e caixa apertado. Oportunidades locais (comércio, serviços, agro, turismo) e tendências de consumo em Pernambuco. Como organizar prioridades para crescer com poucos recursos.',
 'A definir', NULL, 'Salão Principal (80 vagas)', '08:30', '10:00', 80, true, 
 ARRAY['Abertura', 'Gestão', 'Estratégia', 'MPE'], 'Iniciante', 'manha-1'),

('oficina-gestao-sala1', 'oficina', 'Gestão Simples de Caixa, Estoque e Preço',
 'Como organizar fluxo de caixa em planilha ou app simples. Definição de preço que cubra custos e gere lucro. Erros comuns em estoque que matam o lucro das MPEs.',
 'Consultor Sebrae', 'SEBRAE', 'Sala 1 (20 vagas)', '08:30', '10:00', 20, true,
 ARRAY['Finanças', 'Estoque', 'Precificação', 'Gestão'], 'Iniciante', 'manha-1'),

('workshop-marketing-sala2', 'workshop', 'Posicionamento e Ofertas para Virar Referência',
 'Como definir nicho, proposta de valor e diferenciais locais. Construção de ofertas simples (combo, recorrência, ticket médio). Casos práticos de negócios do interior.',
 'Especialista em Marketing', NULL, 'Sala 2 (20 vagas)', '08:30', '10:00', 20, true,
 ARRAY['Marketing', 'Posicionamento', 'Ofertas', 'Nicho'], 'Iniciante', 'manha-1'),

('oficina-vendas-sala3', 'oficina', 'Atendimento que Vende: Roteiro de Abordagem',
 'Passos de uma conversa de vendas eficaz. Como perguntar sem ser invasivo e propor solução. Técnicas simples de fechamento para quem não gosta de "vender".',
 'Especialista em Vendas', NULL, 'Sala 3 (20 vagas)', '08:30', '10:00', 20, true,
 ARRAY['Vendas', 'Atendimento', 'Fechamento', 'Técnicas'], 'Iniciante', 'manha-1')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    palestrante = EXCLUDED.palestrante,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    vagas = EXCLUDED.vagas,
    gratuito = EXCLUDED.gratuito,
    tags = EXCLUDED.tags,
    nivel = EXCLUDED.nivel,
    bloco = EXCLUDED.bloco,
    data_atualizacao = NOW();

-- ============================================
-- 5. INSERIR NETWORKING - CIRCULAÇÃO MANHÃ
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, local, horario_inicio, horario_fim, vagas, gratuito, tags, bloco) VALUES
('networking-manha', 'networking', 'Coffee Break & Networking',
 'Tempo para café, networking e visita aos stands / área de marcas.',
 'Área de Convivência', '10:00', '10:15', 200, true,
 ARRAY['Networking', 'Coffee Break', 'Conexões'], 'circulacao')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    data_atualizacao = NOW();

-- ============================================
-- 6. INSERIR PROGRAMAÇÃO - MANHÃ BLOCO 2 (10h15-11h45)
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, empresa, local, horario_inicio, horario_fim, vagas, gratuito, tags, nivel, bloco) VALUES
('palestra-digital-salao', 'palestra', 'Como usar o Digital e o WhatsApp para Vender Mais',
 'Dados: boa parte das vendas das MPEs em PE já passa por mídias digitais e WhatsApp. Estratégia prática de funil simples: atração → conversa → fechamento → fidelização. Painel com 2 empresários locais contando o que funciona na prática.',
 'Painel de Empresários Locais', NULL, 'Salão Principal (80 vagas)', '10:15', '11:45', 80, true,
 ARRAY['Digital', 'WhatsApp', 'Vendas', 'Funil'], 'Intermediário', 'manha-2'),

('oficina-whatsapp-sala1', 'oficina', 'Listas de Transmissão, Status e Atendimento Rápido',
 'Como organizar listas (clientes ativos, leads, VIP, cobrança). Modelos de mensagens para ofertas, relacionamento e pós-venda. Como não ser spam e ainda assim vender todo dia.',
 'Especialista em WhatsApp Business', NULL, 'Sala 1 (20 vagas)', '10:15', '11:45', 20, true,
 ARRAY['WhatsApp', 'Listas', 'Atendimento', 'Mensagens'], 'Iniciante', 'manha-2'),

('workshop-redes-sociais-sala2', 'workshop', 'Instagram e Reels para Negócios Locais',
 'Tipos de conteúdo para quem vende produtos, serviços e agro. Rotina semanal de posts em 30 minutos por dia. Como medir resultado (alcance, salvamentos, directs).',
 'Social Media Especialista', NULL, 'Sala 2 (20 vagas)', '10:15', '11:45', 20, true,
 ARRAY['Instagram', 'Reels', 'Redes Sociais', 'Conteúdo'], 'Iniciante', 'manha-2'),

('oficina-ia-basica-sala3', 'oficina', 'Primeiros Passos com Inteligência Artificial',
 'Exemplos de uso de IA que já estão no dia a dia das MPEs (mensageria, mapas, apps). Como usar IA para criar posts, textos de oferta, respostas a clientes. Demonstração guiada com 2–3 prompts prontos.',
 'Consultor de Inovação', NULL, 'Sala 3 (20 vagas)', '10:15', '11:45', 20, true,
 ARRAY['IA', 'Inteligência Artificial', 'Produtividade', 'Automação'], 'Iniciante', 'manha-2')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    palestrante = EXCLUDED.palestrante,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    vagas = EXCLUDED.vagas,
    gratuito = EXCLUDED.gratuito,
    tags = EXCLUDED.tags,
    nivel = EXCLUDED.nivel,
    bloco = EXCLUDED.bloco,
    data_atualizacao = NOW();

-- ============================================
-- 7. INSERIR PROGRAMAÇÃO - TARDE BLOCO 3 (14h-15h30)
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, empresa, local, horario_inicio, horario_fim, vagas, gratuito, tags, nivel, bloco) VALUES
('palestra-estrategia-salao', 'palestra', 'Do Improviso ao Plano: Construindo Estratégia para os Próximos 12 Meses',
 'Por que MPE quebra por falta de planejamento e não só por falta de venda. Definindo metas simples: faturamento, margem, clientes-chave. Como tirar 3 prioridades claras para o negócio.',
 'Consultor de Planejamento Estratégico', 'SEBRAE', 'Salão Principal (80 vagas)', '14:00', '15:30', 80, true,
 ARRAY['Planejamento', 'Estratégia', 'Metas', 'Gestão'], 'Intermediário', 'tarde-1'),

('oficina-plano-acao-sala1', 'oficina', 'Plano de Ação em Uma Página para Sua Empresa',
 'Preencher um canvas simples: metas, ações, responsáveis, prazo. Como revisar o plano todo mês. Entrega: cada participante sai com 1 plano impresso ou digital.',
 'Consultor de Gestão', NULL, 'Sala 1 (20 vagas)', '14:00', '15:30', 20, true,
 ARRAY['Plano de Ação', 'Canvas', 'Metas', 'Gestão'], 'Intermediário', 'tarde-1'),

('workshop-vendas-b2b-sala2', 'workshop', 'Vendendo para Empresas, Prefeituras e Grandes Clientes',
 'Diferença entre vender para consumidor final e para empresa. Como abordar negócios locais, redes, órgãos públicos (visão básica). Construção de proposta simples e profissional.',
 'Especialista em Vendas B2B', NULL, 'Sala 2 (20 vagas)', '14:00', '15:30', 20, true,
 ARRAY['Vendas B2B', 'Vendas B2G', 'Propostas', 'Grandes Clientes'], 'Avançado', 'tarde-1'),

('oficina-ia-produtividade-sala3', 'oficina', 'Automatizando Tarefas Chatas com IA',
 'Como usar IA para: criar modelos de contratos, planilhas, roteiros de atendimento. IA como "assistente" para dono de MPE com pouco tempo. Checklist de tarefas que podem ser automatizadas no dia a dia.',
 'Consultor de Tecnologia', NULL, 'Sala 3 (20 vagas)', '14:00', '15:30', 20, true,
 ARRAY['IA', 'Automação', 'Produtividade', 'Tarefas'], 'Intermediário', 'tarde-1')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    palestrante = EXCLUDED.palestrante,
    empresa = EXCLUDED.empresa,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    vagas = EXCLUDED.vagas,
    gratuito = EXCLUDED.gratuito,
    tags = EXCLUDED.tags,
    nivel = EXCLUDED.nivel,
    bloco = EXCLUDED.bloco,
    data_atualizacao = NOW();

-- ============================================
-- 8. INSERIR NETWORKING - CIRCULAÇÃO TARDE
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, local, horario_inicio, horario_fim, vagas, gratuito, tags, bloco) VALUES
('networking-orientado-tarde', 'networking', 'Networking Orientado',
 'Networking orientado com perguntas disparadoras para fazer conexões de negócio.',
 'Área de Convivência', '15:30', '15:45', 200, true,
 ARRAY['Networking', 'Conexões', 'Negócios'], 'circulacao')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    data_atualizacao = NOW();

-- ============================================
-- 9. INSERIR PROGRAMAÇÃO - TARDE BLOCO 4 (15h45-17h15)
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, empresa, local, horario_inicio, horario_fim, vagas, gratuito, tags, nivel, bloco) VALUES
('talk-show-casos-salao', 'palestra', 'Histórias de Crescimento no Sertão',
 '3 empresários da região (comércio, serviços, agro/turismo). Perguntas guiadas: gestão, vendas, marketing, pessoas, tecnologia. Espaço para perguntas da plateia.',
 '3 Empresários da Região', NULL, 'Salão Principal (80 vagas)', '15:45', '17:15', 80, true,
 ARRAY['Cases', 'Empreendedores Locais', 'Histórias', 'Crescimento'], 'Iniciante', 'tarde-2'),

('oficina-experiencia-cliente-sala1', 'oficina', 'Do Primeiro Contato ao Pós-Venda: Como Encantar Clientes',
 'Jornada do cliente em negócios locais. Como pedir indicação sem ser chato. Ferramentas simples de pesquisa de satisfação.',
 'Especialista em CX', NULL, 'Sala 1 (20 vagas)', '15:45', '17:15', 20, true,
 ARRAY['Experiência do Cliente', 'Jornada', 'Indicação', 'Pós-venda'], 'Intermediário', 'tarde-2'),

('workshop-financas-credito-sala2', 'workshop', 'Organizando as Finanças para Acessar Crédito',
 'Separar dinheiro da empresa e da família. Como se preparar para crédito (documentos, indicadores básicos). Quando faz sentido pegar crédito no contexto da MPE.',
 'Consultor Financeiro', 'SICOOB', 'Sala 2 (20 vagas)', '15:45', '17:15', 20, true,
 ARRAY['Finanças', 'Crédito', 'Organização', 'Indicadores'], 'Iniciante', 'tarde-2'),

('oficina-inovacao-pratica-sala3', 'oficina', 'Transformando Problemas do Sertão em Oportunidades',
 'Mapeamento de dores locais (campo, turismo, comércio). Brainstorm guiado de soluções e novos produtos/serviços. Como testar uma ideia gastando pouco.',
 'Facilitador de Inovação', NULL, 'Sala 3 (20 vagas)', '15:45', '17:15', 20, true,
 ARRAY['Inovação', 'Oportunidades', 'Brainstorm', 'Testes'], 'Intermediário', 'tarde-2')
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    palestrante = EXCLUDED.palestrante,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    vagas = EXCLUDED.vagas,
    gratuito = EXCLUDED.gratuito,
    tags = EXCLUDED.tags,
    nivel = EXCLUDED.nivel,
    bloco = EXCLUDED.bloco,
    data_atualizacao = NOW();

-- ============================================
-- 10. INSERIR ESTAÇÕES DO CIRCUITO DE EXPERIÊNCIA
-- Funcionamento contínuo 8h30-17h30
-- ============================================
INSERT INTO public.programacao (id_atividade, tipo, titulo, descricao, palestrante, empresa, local, horario_inicio, horario_fim, vagas, gratuito, tags) VALUES
('circuito-sebrae', 'circuito', 'Espaço Sebrae – Consultório de Negócios',
 'Atendimentos de 15 minutos nas mesas paralelas. MEI, gestão, marketing, vendas, crédito, formalização, orientações rápidas. Capacidade: ~250 atendimentos/dia.',
 'Consultores SEBRAE', 'SEBRAE', 'Espaço Circuito', '08:30', '17:30', 250, true,
 ARRAY['SEBRAE', 'Consultoria', 'MEI', 'Formalização', 'Crédito']),

('circuito-senac', 'circuito', 'Espaço Senac – Carreira e Profissão',
 'Estação 1: escolha de cursos, trilhas formativas e profissões. Estação 2: "Como se posicionar para o mercado de trabalho da região". Capacidade: ~160-200 participações/dia.',
 'Consultores SENAC', 'SENAC', 'Espaço Circuito', '08:30', '17:30', 200, true,
 ARRAY['SENAC', 'Carreira', 'Profissões', 'Cursos', 'Emprego']),

('circuito-sicoob', 'circuito', 'Espaço Sicoob – Dinheiro e Cooperativismo',
 'Balcão de orientação + minipalestras de 15 min. Temas: conta PJ, crédito consciente, cooperativismo financeiro para MPEs, educação financeira. Capacidade: ~200-250 participações/dia.',
 'Consultores SICOOB', 'SICOOB', 'Espaço Circuito', '08:30', '17:30', 250, true,
 ARRAY['SICOOB', 'Crédito', 'Cooperativismo', 'Educação Financeira']),

('circuito-diagnostico-digital', 'circuito', 'Diagnóstico de Marketing Digital',
 'Consultoria express de 10 min olhando Instagram, Google Meu Negócio ou WhatsApp da empresa. Entrega: checklist rápido com 3 ações para fazer nos próximos 7 dias. Capacidade: ~140-150 atendimentos/dia.',
 'Consultor de Marketing Digital', NULL, 'Espaço Circuito', '08:30', '17:30', 150, true,
 ARRAY['Marketing Digital', 'Diagnóstico', 'Instagram', 'WhatsApp']),

('circuito-clinica-vendas', 'circuito', 'Clínica de Vendas',
 'Atendimento 1:1 de 10-15 min com roteiro pronto. Foco: script de abordagem, objeções, fechamento, pós-venda. Capacidade: ~120-150 participações/dia.',
 'Consultor de Vendas', NULL, 'Espaço Circuito', '08:30', '17:30', 150, true,
 ARRAY['Vendas', 'Script', 'Objeções', 'Fechamento']),

('circuito-orientacao-emprego', 'circuito', 'Orientação de Emprego e Trabalho',
 'Mesa 1: análise de currículo. Mesa 2: dicas de entrevista e postura profissional. Atende empresários e quem busca recolocação. Capacidade: ~90-100 participações/dia.',
 'Consultores de RH', NULL, 'Espaço Circuito', '08:30', '17:30', 100, true,
 ARRAY['Emprego', 'Currículo', 'Entrevista', 'RH']),

('circuito-ia-pratica', 'circuito', 'Espaço IA na Prática para MPE',
 'Mini-demos de 10 minutos, em grupo, a cada 20 minutos. Temas: criar post, resposta a cliente, descrição de produto, script de cobrança. Capacidade: ~250-300 participações/dia.',
 'Consultor de IA', NULL, 'Espaço Circuito', '08:30', '17:30', 300, true,
 ARRAY['IA', 'Inteligência Artificial', 'Demos', 'Prática']),

('circuito-pitchs', 'circuito', 'Arena de Pitches e Histórias de Negócio',
 '"Histórias de 5 minutos" de empreendedores locais, rodando a cada 30 min. Plateia em pé, aberta, 30-50 pessoas por rodada. Coproduzido com Sebrae/Senac. Capacidade: ~250-400 participações/dia.',
 'Empreendedores Locais', NULL, 'Arena Pitches', '08:30', '17:30', 400, true,
 ARRAY['Pitches', 'Histórias', 'Cases', 'Empreendedores'])
ON CONFLICT (id_atividade) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    palestrante = EXCLUDED.palestrante,
    empresa = EXCLUDED.empresa,
    local = EXCLUDED.local,
    horario_inicio = EXCLUDED.horario_inicio,
    horario_fim = EXCLUDED.horario_fim,
    vagas = EXCLUDED.vagas,
    gratuito = EXCLUDED.gratuito,
    tags = EXCLUDED.tags,
    data_atualizacao = NOW();

-- ============================================
-- 11. FUNÇÕES ÚTEIS PARA CONSULTA
-- ============================================

-- Função para buscar atividades por período
CREATE OR REPLACE FUNCTION get_atividades_por_periodo(periodo TEXT)
RETURNS TABLE (
    id UUID,
    id_atividade VARCHAR,
    tipo VARCHAR,
    titulo VARCHAR,
    local VARCHAR,
    horario_inicio TIME,
    horario_fim TIME,
    vagas INTEGER
) AS $$
BEGIN
    IF periodo = 'manha' THEN
        RETURN QUERY
        SELECT p.id, p.id_atividade, p.tipo, p.titulo, p.local, p.horario_inicio, p.horario_fim, p.vagas
        FROM public.programacao p
        WHERE p.horario_inicio >= '08:00' AND p.horario_inicio < '12:00'
        ORDER BY p.horario_inicio;
    ELSIF periodo = 'tarde' THEN
        RETURN QUERY
        SELECT p.id, p.id_atividade, p.tipo, p.titulo, p.local, p.horario_inicio, p.horario_fim, p.vagas
        FROM public.programacao p
        WHERE p.horario_inicio >= '14:00' AND p.horario_inicio < '18:00'
        ORDER BY p.horario_inicio;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION CONCLUÍDA
-- ============================================
-- Total de atividades inseridas/atualizadas:
-- - Manhã Bloco 1: 4 atividades
-- - Circulação Manhã: 1 atividade
-- - Manhã Bloco 2: 4 atividades
-- - Tarde Bloco 3: 4 atividades
-- - Circulação Tarde: 1 atividade
-- - Tarde Bloco 4: 4 atividades
-- - Estações Circuito: 8 atividades
-- TOTAL: 26 atividades
-- ============================================
