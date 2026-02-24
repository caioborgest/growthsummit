-- ============================================
-- SYNC: PROGRAMAÇÃO COMPLETA TRIUNFO 2026
-- ============================================
-- IDs de Projeto
-- GE Triunfo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- Ajustar tipo de ID se necessário (de UUID para TEXT para aceitar slugs)
DO $$ BEGIN
ALTER TABLE public.programacao_evento
ALTER COLUMN id TYPE TEXT;
EXCEPTION
WHEN others THEN NULL;
END $$;
-- Função para Incrementar Contador de Sessão (Real-time)
CREATE OR REPLACE FUNCTION public.increment_session_count(session_id TEXT) RETURNS void AS $$ BEGIN
UPDATE public.programacao_evento
SET registered_count = registered_count + 1
WHERE id = session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Primeiro, limpar atividades vinculadas a este projeto para evitar duplicatas 
DELETE FROM public.programacao_evento
WHERE project_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
-- 1. DIURNA - BLOCO 1
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        speakers,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'oficina-gestao-caixa',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_1',
        'workshop',
        'Gestão simples de caixa, estoque e preço',
        'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.',
        ARRAY ['Consultor SEBRAE'],
        'Sala 1',
        '08:30',
        '10:00',
        20,
        ARRAY ['Gestão', 'Finanças', 'Estoque'],
        'orange'
    ),
    (
        'workshop-posicionamento',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_1',
        'workshop',
        'Posicionamento e ofertas para virar referência',
        'Como destacar seu negócio no mercado local e criar propostas irresistíveis para seus clientes.',
        ARRAY ['Especialista em Marketing'],
        'Sala 2',
        '08:30',
        '10:00',
        20,
        ARRAY ['Marketing', 'Posicionamento', 'Ofertas'],
        'orange'
    ),
    (
        'oficina-vendas-abordagem',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_1',
        'workshop',
        'Atendimento que vende: roteiro de abordagem',
        'Técnicas práticas de abordagem e fechamento de vendas focadas no cliente local.',
        ARRAY ['Mentor de Vendas'],
        'Sala 3',
        '08:30',
        '10:00',
        20,
        ARRAY ['Vendas', 'Atendimento', 'Negociação'],
        'orange'
    );
-- 2. DIURNA - BLOCO 2
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        speakers,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'oficina-whatsapp-marketing',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_2',
        'workshop',
        'Listas de transmissão e atendimento rápido no WhatsApp',
        'Transforme seu WhatsApp em uma máquina de vendas com organização e automação simples.',
        ARRAY ['Consultor de Digital'],
        'Sala 1',
        '10:15',
        '11:45',
        20,
        ARRAY ['WhatsApp', 'Vendas', 'Digital'],
        'orange'
    ),
    (
        'workshop-instagram-reels',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_2',
        'workshop',
        'Instagram e Reels para negócios locais',
        'Aprenda a produzir conteúdo que atrai clientes reais da sua região através do Instagram.',
        ARRAY ['Social Media Expert'],
        'Sala 2',
        '10:15',
        '11:45',
        20,
        ARRAY ['Instagram', 'Conteúdo', 'Negócios Locais'],
        'orange'
    ),
    (
        'oficina-ia-pratica',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'manha_bloco_2',
        'workshop',
        'Primeiros passos com Inteligência Artificial',
        'Como usar ChatGPT e outras IAs para acelerar a criação de posts e textos do seu negócio.',
        ARRAY ['Especialista em IA'],
        'Sala 3',
        '10:15',
        '11:45',
        20,
        ARRAY ['IA', 'Tecnologia', 'Inovação'],
        'orange'
    );
-- 3. DIURNA - BLOCO 3
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        speakers,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'oficina-plano-acao',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_3',
        'workshop',
        'Plano de ação em uma página',
        'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual.',
        ARRAY ['Especialista em Estratégia'],
        'Sala 1',
        '14:00',
        '15:30',
        20,
        ARRAY ['Estratégia', 'Planejamento', 'Gestão'],
        'orange'
    ),
    (
        'workshop-vendas-b2b',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_3',
        'workshop',
        'Vendendo para empresas e prefeituras (B2B/B2G)',
        'Como prospectar e fechar contratos com grandes empresas e órgãos públicos.',
        ARRAY ['Consultor de Vendas B2B'],
        'Sala 2',
        '14:00',
        '15:30',
        20,
        ARRAY ['Vendas', 'B2B', 'B2G'],
        'orange'
    ),
    (
        'oficina-ia-produtividade',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_3',
        'workshop',
        'Automatizando tarefas chatas com IA',
        'Use a inteligência artificial como seu assistente para ganhar tempo no dia a dia.',
        ARRAY ['Tech Station'],
        'Sala 3',
        '14:00',
        '15:30',
        20,
        ARRAY ['IA', 'Produtividade', 'Automação'],
        'orange'
    );
-- 4. DIURNA - BLOCO 4
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        speakers,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'oficina-experiencia-cliente',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_4',
        'workshop',
        'Do primeiro contato ao pós-venda: experiência do cliente',
        'Mapeie a jornada do seu cliente e aprenda a fidelizar através de uma experiência incrível.',
        ARRAY ['CX Specialist'],
        'Sala 1',
        '15:45',
        '17:15',
        20,
        ARRAY ['CX', 'Fidelização', 'Atendimento'],
        'orange'
    ),
    (
        'workshop-financas-credito',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_4',
        'workshop',
        'Organizando as finanças para acessar crédito',
        'Prepare seu negócio financeiramente para parcerias e linhas de crédito.',
        ARRAY ['Consultor Financeiro'],
        'Sala 2',
        '15:45',
        '17:15',
        20,
        ARRAY ['Finanças', 'Crédito', 'PME'],
        'orange'
    ),
    (
        'oficina-inovacao-pratica',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_4',
        'workshop',
        'Transformando problemas em oportunidades',
        'Metodologia prática para inovar e criar novos produtos ou serviços no seu negócio.',
        ARRAY ['Mentor de Inovação'],
        'Sala 3',
        '15:45',
        '17:15',
        20,
        ARRAY ['Inovação', 'Problemas', 'Oportunidades'],
        'orange'
    );
-- 5. OUTRAS ATIVIDADES
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'mentoria-1-1',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'tarde_bloco_3',
        'workshop',
        'Mentorias 1:1 Personalizadas',
        'Sessões individuais de 30 minutos com mentores especialistas em diversas áreas.',
        'Sala de Mentorias',
        '14:00',
        '15:30',
        20,
        ARRAY ['Mentoria', 'Individual', 'Consultoria'],
        'teal'
    ),
    (
        'b2b-rodada',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'circuito',
        'circuito',
        'Rodada de Negócios B2B',
        'Reuniões agendadas entre empresas para fechar parcerias e negócios.',
        'Sala B2B',
        '14:00',
        '18:00',
        30,
        ARRAY ['B2B', 'Negócios', 'Parcerias'],
        'orange'
    );
-- 6. NOTURNA (NIGHT EXPERIENCE)
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        speakers,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        'palestra-leandro-batista',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'noturna',
        'keynote',
        'Crescimento Exponencial em Mercado Competitivo',
        'Como a Fitness Exclusive se tornou a maior rede de academias do interior do Nordeste.',
        ARRAY ['Leandro Batista (CEO)'],
        'Palco Principal',
        '19:00',
        '19:50',
        500,
        ARRAY ['Crescimento', 'Estratégia', 'Expansão'],
        'blue'
    ),
    (
        'palestra-vanylton-matias',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'noturna',
        'keynote',
        'Inovação Corporativa e Transformação',
        'Como o Grupo Núcleo se reinventou e se tornou referência nacional.',
        ARRAY ['Vanylton Matias (CEO)'],
        'Palco Principal',
        '21:10',
        '22:30',
        500,
        ARRAY ['Inovação', 'Transformação', 'Digital'],
        'blue'
    );
-- 7. CIRCUITO FIXO
INSERT INTO public.programacao_evento (
        id,
        project_id,
        category,
        type,
        title,
        description,
        partner,
        room,
        start_time,
        end_time,
        color
    )
VALUES (
        'estacao-sebrae',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'circuito',
        'circuito',
        'Espaço Sebrae',
        'Consultório de Negócios para MPEs.',
        'SEBRAE',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange'
    ),
    (
        'estacao-senac',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'circuito',
        'circuito',
        'Espaço Senac',
        'Carreira e Profissão no Sertão.',
        'SENAC',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange'
    ),
    (
        'estacao-sicoob',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'circuito',
        'circuito',
        'Espaço Sicoob',
        'Dinheiro e Cooperativismo.',
        'SICOOB',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange'
    );