-- ============================================================
-- SEED: Programação Growth Experience Triunfo-PE 2026
-- 16 de Abril de 2026 | Espaço Parque, Triunfo-PE
-- Execute no SQL Editor do Supabase
-- CORREÇÃO: ids gerados automaticamente (UUID)
-- ============================================================
DO $$
DECLARE v_project_id UUID;
BEGIN -- Buscar UUID do projeto Triunfo
SELECT id INTO v_project_id
FROM public.projects
WHERE slug = 'ge-triunfo-2026'
LIMIT 1;
IF v_project_id IS NULL THEN RAISE EXCEPTION 'Projeto ge-triunfo-2026 não encontrado. Acesse https://www.growthsummit.site/growth-experience-triunfo primeiro.';
END IF;
-- Limpar programação existente para este projeto (idempotente)
DELETE FROM public.programacao_evento
WHERE project_id = v_project_id;
RAISE NOTICE 'Inserindo programação para project_id: %',
v_project_id;
-- ================================================================
-- 1. BLOCO MANHÃ 1 — 08:30 às 10:00  |  Gestão e Vendas
-- ================================================================
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'manha_bloco_1',
        'keynote',
        'Mapa de Crescimento para MPEs do Sertão do Pajeú',
        'Palestra de abertura com foco nos desafios de gestão, vendas e oportunidades locais para PMEs do Sertão do Pajeú.',
        ARRAY ['Caio Borges'],
        'Salão Principal',
        '08:30',
        '10:00',
        80,
        ARRAY ['Gestão', 'Vendas', 'Oportunidades locais', 'Caixa', 'Prioridades'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_1',
        'workshop',
        'Gestão simples de caixa, estoque e preço',
        'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.',
        ARRAY ['Consultor SEBRAE'],
        'Sala 1',
        '08:30',
        '10:00',
        20,
        ARRAY ['Fluxo de caixa', 'Precificação', 'Controle de estoque'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_1',
        'workshop',
        'Posicionamento e ofertas para virar referência',
        'Como destacar seu negócio no mercado local e criar propostas irresistíveis para seus clientes.',
        ARRAY ['Especialista em Marketing'],
        'Sala 2',
        '08:30',
        '10:00',
        20,
        ARRAY ['Diferenciais locais', 'Proposta de valor', 'Construção de ofertas'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_1',
        'workshop',
        'Atendimento que vende: roteiro de abordagem',
        'Técnicas práticas de abordagem e fechamento de vendas focadas no cliente local.',
        ARRAY ['Mentor de Vendas'],
        'Sala 3',
        '08:30',
        '10:00',
        20,
        ARRAY ['Técnicas de abordagem', 'Fechamento de vendas', 'Soluções para clientes'],
        'orange'
    );
-- Intervalo Circulação 1
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'manha_circulacao',
        'break',
        'Café, Networking e Visita aos Stands',
        'Momento de networking livre e visita aos expositores e estações do circuito.',
        'Área Geral',
        '10:00',
        '10:15',
        1500,
        ARRAY ['Networking', 'Café', 'Stands'],
        'orange'
    );
-- ================================================================
-- 2. BLOCO MANHÃ 2 — 10:15 às 11:45  |  Digital e IA
-- ================================================================
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'manha_bloco_2',
        'keynote',
        'Como usar o digital e o WhatsApp para vender mais',
        'Painel com especialistas e empresários locais sobre as melhores estratégias de vendas via redes sociais e WhatsApp.',
        ARRAY ['Especialista Digital', 'Empresários Locais'],
        'Salão Principal',
        '10:15',
        '11:45',
        80,
        ARRAY ['Marketing digital', 'WhatsApp', 'Funil de vendas', 'Redes sociais'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_2',
        'workshop',
        'Listas de transmissão e atendimento rápido',
        'Transforme seu WhatsApp em uma máquina de vendas com organização de listas e automação simples.',
        ARRAY ['Consultor de Digital'],
        'Sala 1',
        '10:15',
        '11:45',
        20,
        ARRAY ['Organização de listas', 'Modelos de mensagens', 'Pós-venda'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_2',
        'workshop',
        'Instagram e Reels para negócios locais',
        'Aprenda a produzir conteúdo que atrai clientes reais da sua região através do Instagram.',
        ARRAY ['Social Media Expert'],
        'Sala 2',
        '10:15',
        '11:45',
        20,
        ARRAY ['Conteúdo para produtos/serviços', 'Rotina de posts', 'Métricas'],
        'orange'
    ),
    (
        v_project_id,
        'manha_bloco_2',
        'workshop',
        'Primeiros passos com Inteligência Artificial',
        'Como usar ChatGPT e outras IAs para acelerar a criação de posts e textos do seu negócio.',
        ARRAY ['Especialista em IA'],
        'Sala 3',
        '10:15',
        '11:45',
        20,
        ARRAY ['IA no dia a dia', 'Criação de posts/textos', 'Demonstração prática'],
        'orange'
    );
-- Encerramento Manhã
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'manha_encerramento',
        'break',
        'Recados Finais e Chamada para a Tarde',
        'Encerramento do bloco da manhã com orientações para a programação da tarde.',
        'Salão Principal',
        '11:45',
        '12:00',
        80,
        ARRAY ['Orientações', 'Próximas atividades'],
        'orange'
    ),
    (
        v_project_id,
        'intervalo_almoco',
        'break',
        'Almoço e Pausa',
        'Pausa para almoço e descanso.',
        'Área Geral',
        '12:00',
        '14:00',
        1500,
        ARRAY ['Almoço', 'Descanso'],
        'neutral'
    );
-- ================================================================
-- 3. BLOCO TARDE 3 — 14:00 às 15:30  |  Estratégia e Planejamento
-- ================================================================
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'tarde_bloco_3',
        'keynote',
        'Do improviso ao plano: estratégia para 12 meses',
        'Palestra estratégica sobre como sair do improviso e planejar o crescimento do negócio para os próximos 12 meses.',
        ARRAY ['Caio Borges'],
        'Salão Principal',
        '14:00',
        '15:30',
        80,
        ARRAY ['Planejamento estratégico', 'Definição de metas', 'Prioridades', 'Crescimento'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_3',
        'workshop',
        'Plano de ação em uma página',
        'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual e prática.',
        ARRAY ['Especialista em Estratégia'],
        'Sala 1',
        '14:00',
        '15:30',
        20,
        ARRAY ['Canvas de planejamento', 'Metas e ações', 'Revisão mensal'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_3',
        'workshop',
        'Vendendo para empresas e prefeituras (B2B/B2G)',
        'Como prospectar e fechar contratos com grandes empresas e órgãos públicos da região.',
        ARRAY ['Consultor de Vendas B2B'],
        'Sala 2',
        '14:00',
        '15:30',
        20,
        ARRAY ['Vendas corporativas', 'Abordagem a órgãos públicos', 'Propostas comerciais'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_3',
        'workshop',
        'Automatizando tarefas chatas com IA',
        'Use a inteligência artificial como seu assistente para ganhar tempo e produtividade no dia a dia.',
        ARRAY ['Tech Station'],
        'Sala 3',
        '14:00',
        '15:30',
        20,
        ARRAY ['Automação de documentos', 'IA como assistente', 'Checklist de automação'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_3',
        'mentoria',
        'Mentorias 1:1 Personalizadas',
        'Sessões individuais de 30 minutos com mentores especialistas em crescimento, finanças, marketing e tecnologia.',
        ARRAY ['Mentores Growth'],
        'Sala de Mentorias',
        '14:00',
        '17:30',
        30,
        ARRAY ['Mentoria', 'Individual', 'Crescimento', 'Finanças', 'Marketing'],
        'teal'
    );
-- Circulação 2 / Networking orientado
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'tarde_circulacao',
        'break',
        'Networking Orientado',
        'Momento estruturado para conexões estratégicas entre participantes.',
        'Área Geral',
        '15:30',
        '15:45',
        1500,
        ARRAY ['Networking', 'Conexões'],
        'orange'
    );
-- ================================================================
-- 4. BLOCO TARDE 4 — 15:45 às 17:15  |  Crescimento e Inovação
-- ================================================================
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'tarde_bloco_4',
        'keynote',
        'Histórias de crescimento no Sertão',
        'Talk Show com casos reais de empreendedores que transformaram seus negócios na região.',
        ARRAY ['Empreendedores Locais'],
        'Salão Principal',
        '15:45',
        '17:15',
        80,
        ARRAY ['Casos de sucesso locais', 'Gestão e inovação na prática', 'Perguntas da plateia'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_4',
        'workshop',
        'Do primeiro contato ao pós-venda: experiência do cliente',
        'Mapeie a jornada do seu cliente e aprenda a fidelizar e gerar indicações.',
        ARRAY ['CX Specialist'],
        'Sala 1',
        '15:45',
        '17:15',
        20,
        ARRAY ['Jornada do cliente', 'Fidelização e indicação', 'Pesquisa de satisfação'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_4',
        'workshop',
        'Organizando as finanças para acessar crédito',
        'Prepare seu negócio financeiramente para parcerias, linhas de crédito e crescimento sustentável.',
        ARRAY ['Consultor Financeiro'],
        'Sala 2',
        '15:45',
        '17:15',
        20,
        ARRAY ['Separação PF/PJ', 'Preparação para crédito', 'Indicadores financeiros'],
        'orange'
    ),
    (
        v_project_id,
        'tarde_bloco_4',
        'workshop',
        'Transformando problemas em oportunidades',
        'Metodologia prática para inovar e criar novos produtos ou serviços a partir das dores do mercado local.',
        ARRAY ['Mentor de Inovação'],
        'Sala 3',
        '15:45',
        '17:15',
        20,
        ARRAY ['Mapeamento de dores locais', 'Brainstorm de soluções', 'Teste de ideias'],
        'orange'
    );
-- Encerramento Tarde
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'tarde_encerramento',
        'break',
        'Encerramento e Chamada à Ação',
        'Encerramento da programação diurna e orientações para a noite de palestras.',
        'Salão Principal',
        '17:15',
        '17:30',
        80,
        ARRAY ['Encerramento', 'Orientações'],
        'orange'
    );
-- ================================================================
-- 5. PROGRAMAÇÃO NOTURNA — 19:00 às 23:00
-- ================================================================
INSERT INTO public.programacao_evento (
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
        v_project_id,
        'noturna',
        'keynote',
        'Crescimento Exponencial em Mercado Competitivo: Estratégias de Escala',
        'CEO da rede de academias que mais cresce no interior do Nordeste revela as estratégias que transformaram a Fitness Exclusive em referência regional.',
        ARRAY ['Leandro Batista'],
        'Palco Principal',
        '19:00',
        '20:00',
        1500,
        ARRAY ['Crescimento Exponencial', 'Estratégias de Escala', 'Mercado Competitivo', 'Liderança'],
        'blue'
    ),
    (
        v_project_id,
        'noturna',
        'award',
        'Premiação Arena Pitch + Networking',
        'Premiação das melhores startups da Arena Pitch com prêmios de até R$ 2.000 + mentorias. Seguida de networking geral.',
        ARRAY ['Caio Borges', 'Organização'],
        'Palco Principal',
        '20:00',
        '21:10',
        1500,
        ARRAY ['Prêmio Arena Pitch', 'Networking', 'Startups', 'Premiação'],
        'orange'
    ),
    (
        v_project_id,
        'noturna',
        'keynote',
        'Inovação Corporativa: Como Empresas se Mantêm Competitivos em Tempos de Transformação',
        'CEO de grupo empresarial multisetorial reconhecido em gestão e inovação a nível nacional compartilha sua visão sobre o futuro dos negócios.',
        ARRAY ['Vanylton Matias'],
        'Palco Principal',
        '21:10',
        '22:30',
        1500,
        ARRAY ['Inovação Corporativa', 'Transformação Digital', 'Gestão', 'Competitividade'],
        'blue'
    ),
    (
        v_project_id,
        'noturna',
        'ceremony',
        'Encerramento Oficial',
        'Encerramento da maior exposição de negócios do Sertão do Pajeú.',
        ARRAY ['Caio Borges'],
        'Palco Principal',
        '22:30',
        '23:00',
        1500,
        ARRAY ['Encerramento', 'Celebração'],
        'orange'
    );
-- ================================================================
-- 6. CIRCUITO DE EXPERIÊNCIAS (10 estações — funciona o dia todo)
-- ================================================================
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        description,
        partner,
        room,
        start_time,
        end_time,
        max_capacity,
        topics,
        color
    )
VALUES (
        v_project_id,
        'circuito',
        'circuito',
        'Espaço Sebrae — Consultório de Negócios',
        '2 mesas com atendimento de 15 minutos para MPEs. Capacidade: 32 atendimentos/hora. 250 atendimentos no dia.',
        'SEBRAE',
        'Espaço Circuito',
        '08:00',
        '17:30',
        250,
        ARRAY ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Espaço Senac — Carreira e Profissão',
        'Atendimentos individuais e oficinas rápidas. Capacidade: 25 pessoas/hora. 200 pessoas no dia.',
        'SENAC',
        'Espaço Circuito',
        '08:00',
        '17:30',
        200,
        ARRAY ['Carreira', 'Cursos', 'Mercado de Trabalho'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Espaço Sicoob — Dinheiro e Cooperativismo',
        'Balcão de atendimento e talks rápidos. Capacidade: 35 pessoas/hora. 250 pessoas no dia.',
        'SICOOB',
        'Espaço Circuito',
        '08:00',
        '17:30',
        250,
        ARRAY ['Conta PJ', 'Crédito Consciente', 'Educação Financeira'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Diagnóstico Digital — Consultoria Express',
        '3 posições de 10 minutos cada. Capacidade: 18 diagnósticos/hora. 150 no dia.',
        'MKT Digital',
        'Espaço Circuito',
        '08:00',
        '17:30',
        150,
        ARRAY ['Instagram', 'Google Meu Negócio', 'WhatsApp'],
        'neutral'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Clínica de Vendas — Aceleração Comercial',
        'Sessões 1:1 de 15 minutos focadas em scripts, objeções e fechamento. 150 atendimentos no dia.',
        'Growth',
        'Espaço Circuito',
        '08:00',
        '17:30',
        150,
        ARRAY ['Scripts', 'Objeções', 'Fechamento', 'Pós-venda'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Balcão de Emprego — Orientação Profissional',
        '2 mesas com atendimento de 10 minutos. 100 pessoas atendidas no dia.',
        'Senac + Parceiros',
        'Espaço Circuito',
        '08:00',
        '17:30',
        100,
        ARRAY ['Currículo', 'Entrevista', 'Postura Profissional'],
        'neutral'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Totem Growth — Espaço Instagramável',
        'Foto profissional + QR Code de networking. 50 interações/hora, 400 no dia.',
        'Growth Experience',
        'Área Central',
        '08:00',
        '22:30',
        400,
        ARRAY ['Foto Profissional', 'Networking', 'Social Media'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Sabores Locais — Degustação e Amostras',
        '3 mesas temáticas com produtos locais. 80 pessoas/hora, 1000 degustações no dia.',
        'Produtores Locais',
        'Área de Alimentação',
        '08:00',
        '22:30',
        1000,
        ARRAY ['Alimentos', 'Bebidas', 'Artesanato'],
        'neutral'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'IA na Prática — Tecnologia para PMEs',
        'Demos em grupo sobre uso de IA no dia a dia do negócio. 45 pessoas/hora, 300 no dia.',
        'Tech Station',
        'Espaço Tech',
        '08:00',
        '17:30',
        300,
        ARRAY ['Criação de Posts', 'Respostas Automáticas', 'Copywriting'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'circuito',
        'Arena de Pitches — Histórias de Negócio',
        'Rodas de 30 minutos com pitches e cases de sucesso reais. 50 por sessão, 400 ouvintes no dia.',
        'Sebrae/Senac',
        'Arena',
        '08:00',
        '17:30',
        400,
        ARRAY ['Pitchs', 'Cases de Sucesso', 'Histórias Reais'],
        'orange'
    ),
    (
        v_project_id,
        'circuito',
        'b2b',
        'Rodada de Negócios B2B',
        'Reuniões agendadas entre empresas para fechar parcerias e negócios estratégicos.',
        'Growth Experience',
        'Sala B2B',
        '14:00',
        '18:00',
        30,
        ARRAY ['B2B', 'Negócios', 'Parcerias', 'Networking'],
        'orange'
    );
RAISE NOTICE '✅ Programação do GE Triunfo 2026 inserida com sucesso! project_id: %',
v_project_id;
END $$;
-- ============================================================
-- VERIFICAÇÃO final: resume por categoria
-- ============================================================
SELECT category,
    COUNT(*) AS sessoes,
    MIN(start_time) AS inicio,
    MAX(end_time) AS fim
FROM public.programacao_evento
WHERE project_id = (
        SELECT id
        FROM public.projects
        WHERE slug = 'ge-triunfo-2026'
        LIMIT 1
    )
GROUP BY category
ORDER BY inicio;