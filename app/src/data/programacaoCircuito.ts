// ============================================
// PROGRAMAÇÃO CIRCUITO DE EXPERIÊNCIA - GROWTH SUMMIT 2026
// Evento com estrutura: 1 Salão (80 pessoas) + 3 Salas (20 pessoas cada)
// Período: Manhã (8h30-12h) e Tarde (14h-17h30)
// ============================================

// Tipos de atividades
export const TiposAtividade = ['palestra', 'oficina', 'workshop', 'networking', 'circuito', 'mentoria'] as const;
export type TipoAtividade = typeof TiposAtividade[number];
export const TipoAtividade = TiposAtividade;

export interface AtividadeProgramacao {
    id: string;
    tipo: TipoAtividade;
    titulo: string;
    descricao: string;
    palestrante?: string;
    empresa?: string;
    local: string;
    horario_inicio: string;
    horario_fim: string;
    vagas?: number;
    gratuito: boolean;
    valor?: number;
    tags: string[];
    nivel?: 'Iniciante' | 'Intermediário' | 'Avançado';
    bloco?: 'manha-1' | 'manha-2' | 'tarde-1' | 'tarde-2' | 'circulacao';
}

// ============================================
// MANHÃ - BLOCO 1 (8h30 - 10h00)
// ============================================
const manhaBloco1: AtividadeProgramacao[] = [
    {
        id: 'palestra-abertura-salao',
        tipo: 'palestra',
        titulo: 'Mapa de Crescimento para MPEs do Sertão do Pajeú',
        descricao: 'Principais desafios: gestão do dia a dia, vendas, atração de clientes e caixa apertado. Oportunidades locais (comércio, serviços, agro, turismo) e tendências de consumo em Pernambuco. Como organizar prioridades para crescer com poucos recursos.',
        palestrante: 'A definir',
        local: 'Salão Principal (80 vagas)',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 80,
        gratuito: true,
        tags: ['Abertura', 'Gestão', 'Estratégia', 'MPE'],
        nivel: 'Iniciante',
        bloco: 'manha-1'
    },
    {
        id: 'oficina-gestao-sala1',
        tipo: 'oficina',
        titulo: 'Gestão Simples de Caixa, Estoque e Preço',
        descricao: 'Como organizar fluxo de caixa em planilha ou app simples. Definição de preço que cubra custos e gere lucro. Erros comuns em estoque que matam o lucro das MPEs.',
        palestrante: 'Consultor Sebrae',
        empresa: 'SEBRAE',
        local: 'Sala 1 (20 vagas)',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Finanças', 'Estoque', 'Precificação', 'Gestão'],
        nivel: 'Iniciante',
        bloco: 'manha-1'
    },
    {
        id: 'workshop-marketing-sala2',
        tipo: 'workshop',
        titulo: 'Posicionamento e Ofertas para Virar Referência',
        descricao: 'Como definir nicho, proposta de valor e diferenciais locais. Construção de ofertas simples (combo, recorrência, ticket médio). Casos práticos de negócios do interior.',
        palestrante: 'Especialista em Marketing',
        local: 'Sala 2 (20 vagas)',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Marketing', 'Posicionamento', 'Ofertas', 'Nicho'],
        nivel: 'Iniciante',
        bloco: 'manha-1'
    },
    {
        id: 'oficina-vendas-sala3',
        tipo: 'oficina',
        titulo: 'Atendimento que Vende: Roteiro de Abordagem',
        descricao: 'Passos de uma conversa de vendas eficaz. Como perguntar sem ser invasivo e propor solução. Técnicas simples de fechamento para quem não gosta de "vender".',
        palestrante: 'Especialista em Vendas',
        local: 'Sala 3 (20 vagas)',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Vendas', 'Atendimento', 'Fechamento', 'Técnicas'],
        nivel: 'Iniciante',
        bloco: 'manha-1'
    }
];

// ============================================
// MANHÃ - CIRCULAÇÃO (10h00 - 10h15)
// ============================================
const manhaCirculacao: AtividadeProgramacao[] = [
    {
        id: 'networking-manha',
        tipo: 'networking',
        titulo: 'Coffee Break & Networking',
        descricao: 'Tempo para café, networking e visita aos stands / área de marcas.',
        local: 'Área de Convivência',
        horario_inicio: '10:00',
        horario_fim: '10:15',
        gratuito: true,
        tags: ['Networking', 'Coffee Break', 'Conexões'],
        bloco: 'circulacao'
    }
];

// ============================================
// MANHÃ - BLOCO 2 (10h15 - 11h45)
// ============================================
const manhaBloco2: AtividadeProgramacao[] = [
    {
        id: 'palestra-digital-salao',
        tipo: 'palestra',
        titulo: 'Como usar o Digital e o WhatsApp para Vender Mais',
        descricao: 'Dados: boa parte das vendas das MPEs em PE já passa por mídias digitais e WhatsApp. Estratégia prática de funil simples: atração → conversa → fechamento → fidelização. Painel com 2 empresários locais contando o que funciona na prática.',
        palestrante: 'Painel de Empresários Locais',
        local: 'Salão Principal (80 vagas)',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 80,
        gratuito: true,
        tags: ['Digital', 'WhatsApp', 'Vendas', 'Funil'],
        nivel: 'Intermediário',
        bloco: 'manha-2'
    },
    {
        id: 'oficina-whatsapp-sala1',
        tipo: 'oficina',
        titulo: 'Listas de Transmissão, Status e Atendimento Rápido',
        descricao: 'Como organizar listas (clientes ativos, leads, VIP, cobrança). Modelos de mensagens para ofertas, relacionamento e pós-venda. Como não ser spam e ainda assim vender todo dia.',
        palestrante: 'Especialista em WhatsApp Business',
        local: 'Sala 1 (20 vagas)',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['WhatsApp', 'Listas', 'Atendimento', 'Mensagens'],
        nivel: 'Iniciante',
        bloco: 'manha-2'
    },
    {
        id: 'workshop-redes-sociais-sala2',
        tipo: 'workshop',
        titulo: 'Instagram e Reels para Negócios Locais',
        descricao: 'Tipos de conteúdo para quem vende produtos, serviços e agro. Rotina semanal de posts em 30 minutos por dia. Como medir resultado (alcance, salvamentos, directs).',
        palestrante: 'Social Media Especialista',
        local: 'Sala 2 (20 vagas)',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['Instagram', 'Reels', 'Redes Sociais', 'Conteúdo'],
        nivel: 'Iniciante',
        bloco: 'manha-2'
    },
    {
        id: 'oficina-ia-basica-sala3',
        tipo: 'oficina',
        titulo: 'Primeiros Passos com Inteligência Artificial',
        descricao: 'Exemplos de uso de IA que já estão no dia a dia das MPEs (mensageria, mapas, apps). Como usar IA para criar posts, textos de oferta, respostas a clientes. Demonstração guiada com 2–3 prompts prontos.',
        palestrante: 'Consultor de Inovação',
        local: 'Sala 3 (20 vagas)',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['IA', 'Inteligência Artificial', 'Produtividade', 'Automação'],
        nivel: 'Iniciante',
        bloco: 'manha-2'
    }
];

// ============================================
// TARDE - BLOCO 3 (14h00 - 15h30)
// ============================================
const tardeBloco3: AtividadeProgramacao[] = [
    {
        id: 'palestra-estrategia-salao',
        tipo: 'palestra',
        titulo: 'Do Improviso ao Plano: Construindo Estratégia para os Próximos 12 Meses',
        descricao: 'Por que MPE quebra por falta de planejamento e não só por falta de venda. Definindo metas simples: faturamento, margem, clientes-chave. Como tirar 3 prioridades claras para o negócio.',
        palestrante: 'Consultor de Planejamento Estratégico',
        empresa: 'SEBRAE',
        local: 'Salão Principal (80 vagas)',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 80,
        gratuito: true,
        tags: ['Planejamento', 'Estratégia', 'Metas', 'Gestão'],
        nivel: 'Intermediário',
        bloco: 'tarde-1'
    },
    {
        id: 'oficina-plano-acao-sala1',
        tipo: 'oficina',
        titulo: 'Plano de Ação em Uma Página para Sua Empresa',
        descricao: 'Preencher um canvas simples: metas, ações, responsáveis, prazo. Como revisar o plano todo mês. Entrega: cada participante sai com 1 plano impresso ou digital.',
        palestrante: 'Consultor de Gestão',
        local: 'Sala 1 (20 vagas)',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['Plano de Ação', 'Canvas', 'Metas', 'Gestão'],
        nivel: 'Intermediário',
        bloco: 'tarde-1'
    },
    {
        id: 'workshop-vendas-b2b-sala2',
        tipo: 'workshop',
        titulo: 'Vendendo para Empresas, Prefeituras e Grandes Clientes',
        descricao: 'Diferença entre vender para consumidor final e para empresa. Como abordar negócios locais, redes, órgãos públicos (visão básica). Construção de proposta simples e profissional.',
        palestrante: 'Especialista em Vendas B2B',
        local: 'Sala 2 (20 vagas)',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['Vendas B2B', 'Vendas B2G', 'Propostas', 'Grandes Clientes'],
        nivel: 'Avançado',
        bloco: 'tarde-1'
    },
    {
        id: 'oficina-ia-produtividade-sala3',
        tipo: 'oficina',
        titulo: 'Automatizando Tarefas Chatas com IA',
        descricao: 'Como usar IA para: criar modelos de contratos, planilhas, roteiros de atendimento. IA como "assistente" para dono de MPE com pouco tempo. Checklist de tarefas que podem ser automatizadas no dia a dia.',
        palestrante: 'Consultor de Tecnologia',
        local: 'Sala 3 (20 vagas)',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['IA', 'Automação', 'Produtividade', 'Tarefas'],
        nivel: 'Intermediário',
        bloco: 'tarde-1'
    }
];

// ============================================
// TARDE - CIRCULAÇÃO (15h30 - 15h45)
// ============================================
const tardeCirculacao: AtividadeProgramacao[] = [
    {
        id: 'networking-orientado-tarde',
        tipo: 'networking',
        titulo: 'Networking Orientado',
        descricao: 'Networking orientado com perguntas disparadoras para fazer conexões de negócio.',
        local: 'Área de Convivência',
        horario_inicio: '15:30',
        horario_fim: '15:45',
        gratuito: true,
        tags: ['Networking', 'Conexões', 'Negócios'],
        bloco: 'circulacao'
    }
];

// ============================================
// TARDE - BLOCO 4 (15h45 - 17h15)
// ============================================
const tardeBloco4: AtividadeProgramacao[] = [
    {
        id: 'talk-show-casos-salao',
        tipo: 'palestra',
        titulo: 'Histórias de Crescimento no Sertão',
        descricao: '3 empresários da região (comércio, serviços, agro/turismo). Perguntas guiadas: gestão, vendas, marketing, pessoas, tecnologia. Espaço para perguntas da plateia.',
        palestrante: '3 Empresários da Região',
        local: 'Salão Principal (80 vagas)',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 80,
        gratuito: true,
        tags: ['Cases', 'Empreendedores Locais', 'Histórias', 'Crescimento'],
        nivel: 'Iniciante',
        bloco: 'tarde-2'
    },
    {
        id: 'oficina-experiencia-cliente-sala1',
        tipo: 'oficina',
        titulo: 'Do Primeiro Contato ao Pós-Venda: Como Encantar Clientes',
        descricao: 'Jornada do cliente em negócios locais. Como pedir indicação sem ser chato. Ferramentas simples de pesquisa de satisfação.',
        palestrante: 'Especialista em CX',
        local: 'Sala 1 (20 vagas)',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['Experiência do Cliente', 'Jornada', 'Indicação', 'Pós-venda'],
        nivel: 'Intermediário',
        bloco: 'tarde-2'
    },
    {
        id: 'workshop-financas-credito-sala2',
        tipo: 'workshop',
        titulo: 'Organizando as Finanças para Acessar Crédito',
        descricao: 'Separar dinheiro da empresa e da família. Como se preparar para crédito (documentos, indicadores básicos). Quando faz sentido pegar crédito no contexto da MPE.',
        palestrante: 'Consultor Financeiro',
        empresa: 'SICOOB',
        local: 'Sala 2 (20 vagas)',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['Finanças', 'Crédito', 'Organização', 'Indicadores'],
        nivel: 'Iniciante',
        bloco: 'tarde-2'
    },
    {
        id: 'oficina-inovacao-pratica-sala3',
        tipo: 'oficina',
        titulo: 'Transformando Problemas do Sertão em Oportunidades',
        descricao: 'Mapeamento de dores locais (campo, turismo, comércio). Brainstorm guiado de soluções e novos produtos/serviços. Como testar uma ideia gastando pouco.',
        palestrante: 'Facilitador de Inovação',
        local: 'Sala 3 (20 vagas)',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['Inovação', 'Oportunidades', 'Brainstorm', 'Testes'],
        nivel: 'Intermediário',
        bloco: 'tarde-2'
    }
];

// ============================================
// ESTAÇÕES DO CIRCUITO DE EXPERIÊNCIA
// Funcionamento contínuo durante todo o evento
// ============================================
export const estacoesCircuito: AtividadeProgramacao[] = [
    {
        id: 'circuito-sebrae',
        tipo: 'circuito',
        titulo: 'Espaço Sebrae – Consultório de Negócios',
        descricao: 'Atendimentos de 15 minutos nas mesas paralelas. MEI, gestão, marketing, vendas, crédito, formalização, orientações rápidas. Capacidade: ~250 atendimentos/dia.',
        palestrante: 'Consultores SEBRAE',
        empresa: 'SEBRAE',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 250,
        gratuito: true,
        tags: ['SEBRAE', 'Consultoria', 'MEI', 'Formalização', 'Crédito']
    },
    {
        id: 'circuito-senac',
        tipo: 'circuito',
        titulo: 'Espaço Senac – Carreira e Profissão',
        descricao: 'Estação 1: escolha de cursos, trilhas formativas e profissões. Estação 2: "Como se posicionar para o mercado de trabalho da região". Capacidade: ~160-200 participações/dia.',
        palestrante: 'Consultores SENAC',
        empresa: 'SENAC',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 200,
        gratuito: true,
        tags: ['SENAC', 'Carreira', 'Profissões', 'Cursos', 'Emprego']
    },
    {
        id: 'circuito-sicoob',
        tipo: 'circuito',
        titulo: 'Espaço Sicoob – Dinheiro e Cooperativismo',
        descricao: 'Balcão de orientação + minipalestras de 15 min. Temas: conta PJ, crédito consciente, cooperativismo financeiro para MPEs, educação financeira. Capacidade: ~200-250 participações/dia.',
        palestrante: 'Consultores SICOOB',
        empresa: 'SICOOB',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 250,
        gratuito: true,
        tags: ['SICOOB', 'Crédito', 'Cooperativismo', 'Educação Financeira']
    },
    {
        id: 'circuito-diagnostico-digital',
        tipo: 'circuito',
        titulo: 'Diagnóstico de Marketing Digital',
        descricao: 'Consultoria express de 10 min olhando Instagram, Google Meu Negócio ou WhatsApp da empresa. Entrega: checklist rápido com 3 ações para fazer nos próximos 7 dias. Capacidade: ~140-150 atendimentos/dia.',
        palestrante: 'Consultor de Marketing Digital',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 150,
        gratuito: true,
        tags: ['Marketing Digital', 'Diagnóstico', 'Instagram', 'WhatsApp']
    },
    {
        id: 'circuito-clinica-vendas',
        tipo: 'circuito',
        titulo: 'Clínica de Vendas',
        descricao: 'Atendimento 1:1 de 10-15 min com roteiro pronto. Foco: script de abordagem, objeções, fechamento, pós-venda. Capacidade: ~120-150 participações/dia.',
        palestrante: 'Consultor de Vendas',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 150,
        gratuito: true,
        tags: ['Vendas', 'Script', 'Objeções', 'Fechamento']
    },
    {
        id: 'circuito-orientacao-emprego',
        tipo: 'circuito',
        titulo: 'Orientação de Emprego e Trabalho',
        descricao: 'Mesa 1: análise de currículo. Mesa 2: dicas de entrevista e postura profissional. Atende empresários e quem busca recolocação. Capacidade: ~90-100 participações/dia.',
        palestrante: 'Consultores de RH',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 100,
        gratuito: true,
        tags: ['Emprego', 'Currículo', 'Entrevista', 'RH']
    },
    {
        id: 'circuito-ia-pratica',
        tipo: 'circuito',
        titulo: 'Espaço IA na Prática para MPE',
        descricao: 'Mini-demos de 10 minutos, em grupo, a cada 20 minutos. Temas: criar post, resposta a cliente, descrição de produto, script de cobrança. Capacidade: ~250-300 participações/dia.',
        palestrante: 'Consultor de IA',
        local: 'Espaço Circuito',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 300,
        gratuito: true,
        tags: ['IA', 'Inteligência Artificial', 'Demos', 'Prática']
    },
    {
        id: 'circuito-pitchs',
        tipo: 'circuito',
        titulo: 'Arena de Pitches e Histórias de Negócio',
        descricao: '"Histórias de 5 minutos" de empreendedores locais, rodando a cada 30 min. Plateia em pé, aberta, 30-50 pessoas por rodada. Coproduzido com Sebrae/Senac. Capacidade: ~250-400 participações/dia.',
        palestrante: 'Empreendedores Locais',
        local: 'Arena Pitches',
        horario_inicio: '08:30',
        horario_fim: '17:30',
        vagas: 400,
        gratuito: true,
        tags: ['Pitches', 'Histórias', 'Cases', 'Empreendedores']
    }
];

// ============================================
// PROGRAMAÇÃO COMPLETA CONSOLIDADA
// ============================================
export const programacaoCompleta: AtividadeProgramacao[] = [
    ...manhaBloco1,
    ...manhaCirculacao,
    ...manhaBloco2,
    ...tardeBloco3,
    ...tardeCirculacao,
    ...tardeBloco4
];

// Apenas estações do circuito (para exibição separada)
export const circuitoExperiencia = estacoesCircuito;

// Todas as atividades do dia (programação + circuito)
export const todasAtividades: AtividadeProgramacao[] = [
    ...programacaoCompleta,
    ...estacoesCircuito
];

// ============================================
// HELPERS
// ============================================

// Buscar atividade por ID
export const getAtividadeById = (id: string): AtividadeProgramacao | undefined => {
    return todasAtividades.find(atividade => atividade.id === id);
};

// Filtrar por tipo
export const getAtividadesPorTipo = (tipo: TipoAtividade): AtividadeProgramacao[] => {
    return todasAtividades.filter(atividade => atividade.tipo === tipo);
};

// Filtrar por bloco
export const getAtividadesPorBloco = (bloco: AtividadeProgramacao['bloco']): AtividadeProgramacao[] => {
    return programacaoCompleta.filter(atividade => atividade.bloco === bloco);
};

// Filtrar por período (manhã/tarde)
export const getAtividadesPorPeriodo = (periodo: 'manha' | 'tarde'): AtividadeProgramacao[] => {
    return programacaoCompleta.filter(atividade => {
        const hora = parseInt(atividade.horario_inicio.split(':')[0]);
        if (periodo === 'manha') return hora >= 8 && hora < 12;
        return hora >= 14 && hora < 18;
    });
};

// Verificar se atividade está no Salão (80 vagas)
export const isSalaoPrincipal = (atividade: AtividadeProgramacao): boolean => {
    return atividade.local.includes('Salão Principal');
};

// Verificar se atividade é Sala (20 vagas)
export const isSala = (atividade: AtividadeProgramacao): boolean => {
    return atividade.local.includes('Sala ') && !atividade.local.includes('Salão');
};
