-- ============================================
-- SEED: PROGRAMAÇÃO TRIUNFO 2026
-- ============================================
-- Primeiro, limpar dados existentes para este projeto (evitar duplicatas)
DELETE FROM public.programacao_evento
WHERE project_id = 'ge-triunfo-2026';
-- 1. MANHÃ - ÂNCORA
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        room,
        start_time,
        end_time
    )
VALUES (
        'ge-triunfo-2026',
        'manha_ancora',
        'talk',
        'Palestra: Mapa de Crescimento para MPEs',
        'Salão Principal',
        '08:30',
        '10:00'
    ),
    (
        'ge-triunfo-2026',
        'manha_ancora',
        'talk',
        'Palestra + Painel: Digital e WhatsApp',
        'Salão Principal',
        '10:15',
        '11:45'
    ),
    (
        'ge-triunfo-2026',
        'manha_ancora',
        'talk',
        'Encerramento Manhã e Orientações',
        'Salão Principal',
        '11:45',
        '12:00'
    );
-- 2. MANHÃ - BLOCO 1
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
        topics
    )
VALUES (
        'ge-triunfo-2026',
        'manha_bloco_1',
        'keynote',
        'Mapa de Crescimento para MPEs do Sertão do Pajeú',
        'Principais desafios: gestão do dia a dia, vendas, atração de clientes e caixa apertado.',
        'Salão Principal',
        '08:30',
        '10:00',
        80,
        ARRAY ['Desafios de gestão, vendas e caixa', 'Oportunidades locais', 'Organizar prioridades']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_1',
        'workshop',
        'Gestão simples de caixa, estoque e preço',
        'Como organizar fluxo de caixa em planilha ou app simples.',
        'Sala 01',
        '08:30',
        '10:00',
        20,
        ARRAY ['Fluxo de caixa', 'Precificação', 'Controle de estoque']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_1',
        'workshop',
        'Posicionamento e ofertas para virar referência',
        'Como definir nicho, proposta de valor e diferenciais locais.',
        'Sala 02',
        '08:30',
        '10:00',
        20,
        ARRAY ['Diferenciais locais', 'Proposta de valor', 'Construção de ofertas']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_1',
        'workshop',
        'Atendimento que vende: roteiro de abordagem',
        'Passos de uma conversa de vendas eficaz.',
        'Sala 03',
        '08:30',
        '10:00',
        20,
        ARRAY ['Técnicas de abordagem', 'Fechamento de vendas', 'Soluções para clientes']
    );
-- 3. MANHÃ - CIRCULAÇÃO & ENCERRAMENTO
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        room,
        start_time,
        end_time
    )
VALUES (
        'ge-triunfo-2026',
        'manha_circulacao',
        'networking',
        'Café, Networking e Visita aos Stands',
        'Área de Convivência',
        '10:00',
        '10:15'
    ),
    (
        'ge-triunfo-2026',
        'manha_encerramento',
        'talk',
        'Recados Finais e Chamada para Tarde',
        'Salão Principal',
        '11:45',
        '12:00'
    );
-- 4. MANHÃ - BLOCO 2
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
        topics
    )
VALUES (
        'ge-triunfo-2026',
        'manha_bloco_2',
        'keynote',
        'Como usar o digital e o WhatsApp para vender mais',
        'Estratégia prática de funil simples: atração → conversa → fechamento → fidelização.',
        'Salão Principal',
        '10:15',
        '11:45',
        80,
        ARRAY ['Vendas por mídias digitais e WhatsApp', 'Estratégia de funil simples', 'Painel com empresários locais']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_2',
        'workshop',
        'Listas de transmissão e atendimento rápido',
        'Como não ser spam e ainda assim vender todo dia.',
        'Sala 01',
        '10:15',
        '11:45',
        20,
        ARRAY ['Organização de listas', 'Modelos de mensagens', 'Pós-venda']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_2',
        'workshop',
        'Instagram e Reels para negócios locais',
        'Tipos de conteúdo para quem vende produtos, serviços e agro.',
        'Sala 02',
        '10:15',
        '11:45',
        20,
        ARRAY ['Conteúdo para produtos/serviços', 'Rotina de posts', 'Métricas']
    ),
    (
        'ge-triunfo-2026',
        'manha_bloco_2',
        'workshop',
        'Primeiros passos com Inteligência Artificial',
        'Exemplos de uso de IA que já estão no dia a dia das MPEs.',
        'Sala 03',
        '10:15',
        '11:45',
        20,
        ARRAY ['IA no dia a dia', 'Criação de posts/textos', 'Demonstração prática']
    );
-- 5. TARDE - ÂNCORA
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        room,
        start_time,
        end_time
    )
VALUES (
        'ge-triunfo-2026',
        'tarde_ancora',
        'talk',
        'Palestra: Do Improviso ao Plano',
        'Salão Principal',
        '14:00',
        '15:30'
    ),
    (
        'ge-triunfo-2026',
        'tarde_ancora',
        'talk',
        'Talk Show: Histórias de Crescimento',
        'Salão Principal',
        '15:45',
        '17:15'
    ),
    (
        'ge-triunfo-2026',
        'tarde_ancora',
        'talk',
        'Encerramento do Circuito',
        'Salão Principal',
        '17:15',
        '17:30'
    );
-- 6. TARDE - BLOCO 3
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
        topics
    )
VALUES (
        'ge-triunfo-2026',
        'tarde_bloco_3',
        'keynote',
        'Do improviso ao plano: estratégia para 12 meses',
        'Por que MPE quebra por falta de planejamento.',
        'Salão Principal',
        '14:00',
        '15:30',
        80,
        ARRAY ['Importância do planejamento', 'Definição de metas simples', 'Prioridades claras']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_3',
        'workshop',
        'Plano de ação em uma página',
        'Preencher um canvas simples: metas, ações, responsáveis, prazo.',
        'Sala 01',
        '14:00',
        '15:30',
        20,
        ARRAY ['Canvas de planejamento', 'Metas e ações', 'Revisão mensal']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_3',
        'workshop',
        'Vendendo para empresas e prefeituras (B2B/B2G)',
        'Diferença entre vender para consumidor final e para empresa.',
        'Sala 02',
        '14:00',
        '15:30',
        20,
        ARRAY ['Vendas corporativas', 'Abordagem a órgãos públicos', 'Propostas comerciais']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_3',
        'workshop',
        'Automatizando tarefas chatas com IA',
        'IA como assistente para dono de MPE com pouco tempo.',
        'Sala 03',
        '14:00',
        '15:30',
        20,
        ARRAY ['Automação de documentos', 'IA como assistente', 'Checklist de automação']
    );
-- 7. TARDE - CIRCULAÇÃO & ENCERRAMENTO
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        room,
        start_time,
        end_time
    )
VALUES (
        'ge-triunfo-2026',
        'tarde_circulacao',
        'networking',
        'Networking Orientado',
        'Área de Convivência',
        '15:30',
        '15:45'
    ),
    (
        'ge-triunfo-2026',
        'tarde_encerramento',
        'talk',
        'Encerramento e Chamada à Ação',
        'Salão Principal',
        '17:15',
        '17:30'
    );
-- 8. TARDE - BLOCO 4
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
        topics
    )
VALUES (
        'ge-triunfo-2026',
        'tarde_bloco_4',
        'keynote',
        'Histórias de crescimento no Sertão',
        '3 empresários da região contando o que funciona na prática.',
        'Salão Principal',
        '15:45',
        '17:15',
        80,
        ARRAY ['Casos de sucesso locais', 'Gestão e inovação na prática', 'Perguntas da plateia']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_4',
        'workshop',
        'Do primeiro contato ao pós-venda: experiência do cliente',
        'Como encantar clientes no dia a dia.',
        'Sala 01',
        '15:45',
        '17:15',
        20,
        ARRAY ['Jornada do cliente', 'Fidelização e indicação', 'Pesquisa de satisfação']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_4',
        'workshop',
        'Organizando as finanças para acessar crédito',
        'Separar dinheiro da empresa e da família.',
        'Sala 02',
        '15:45',
        '17:15',
        20,
        ARRAY ['Separação PF/PJ', 'Preparação para crédito', 'Indicadores financeiros']
    ),
    (
        'ge-triunfo-2026',
        'tarde_bloco_4',
        'workshop',
        'Transformando problemas em oportunidades',
        'Como testar uma ideia gastando pouco.',
        'Sala 03',
        '15:45',
        '17:15',
        20,
        ARRAY ['Mapeamento de dores locais', 'Brainstorm de soluções', 'Teste de ideias']
    );
-- 9. NOTURNA
INSERT INTO public.programacao_evento (
        project_id,
        category,
        type,
        title,
        room,
        start_time,
        end_time
    )
VALUES (
        'ge-triunfo-2026',
        'noturna',
        'keynote',
        'Leandro Batista: Crescimento Exponencial',
        'Palco Principal',
        '19:00',
        '20:00'
    ),
    (
        'ge-triunfo-2026',
        'noturna',
        'talk',
        'Premiação Arena Pitch + Networking',
        'Palco Principal',
        '20:00',
        '21:10'
    ),
    (
        'ge-triunfo-2026',
        'noturna',
        'keynote',
        'Vanylton Matias: Inovação Corporativa',
        'Palco Principal',
        '21:10',
        '22:30'
    ),
    (
        'ge-triunfo-2026',
        'noturna',
        'talk',
        'Encerramento Oficial',
        'Palco Principal',
        '22:30',
        '23:00'
    );
-- 10. CIRCUITO
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
        color,
        topics,
        metadata
    )
VALUES (
        'ge-triunfo-2026',
        'circuito',
        'circuito',
        'Espaço Sebrae',
        'Consultório de Negócios para MPEs.',
        'SEBRAE',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange',
        ARRAY ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'],
        '{"tempo": "15 min", "totalDia": "250 atendimentos"}'
    ),
    (
        'ge-triunfo-2026',
        'circuito',
        'circuito',
        'Espaço Senac',
        'Carreira e Profissão no Sertão.',
        'SENAC',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange',
        ARRAY ['Carreira', 'Cursos', 'Mercado de Trabalho'],
        '{"tempo": "15 min", "totalDia": "200 pessoas"}'
    ),
    (
        'ge-triunfo-2026',
        'circuito',
        'circuito',
        'Espaço Sicoob',
        'Dinheiro e Cooperativismo.',
        'SICOOB',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange',
        ARRAY ['Conta PJ', 'Crédito Consciente', 'Educação Financeira'],
        '{"tempo": "10 min", "totalDia": "250 pessoas"}'
    ),
    (
        'ge-triunfo-2026',
        'circuito',
        'circuito',
        'IA na Prática',
        'Tecnologia Aplicada a Pequenos Negócios.',
        'Tech Station',
        'Espaço Circuito',
        '08:30',
        '17:30',
        'orange',
        ARRAY ['Criação de Posts', 'Respostas Automáticas', 'Copywriting'],
        '{"tempo": "15 min", "totalDia": "300 pessoas"}'
    );