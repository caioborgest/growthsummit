// Tipos de atividades
export const TiposAtividade = ['curso', 'oficina', 'workshop', 'palestra', 'networking', 'startup', 'b2b', 'mentoria'] as const;
export type TipoAtividade = typeof TiposAtividade[number];
export const TipoAtividade = TiposAtividade; // Runtime value with the same name as the type

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
}

// PROGRAMAÇÃO DIURNA (08:00 - 18:00) - GRATUITA
export const programacaoDiurna: AtividadeProgramacao[] = [
    // BLOCO 1 (08:30 - 10:00)
    {
        id: 'oficina-gestao-caixa',
        tipo: 'curso',
        titulo: 'Gestão simples de caixa, estoque e preço',
        descricao: 'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.',
        palestrante: 'Consultor SEBRAE',
        local: 'Sala 1',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Gestão', 'Finanças', 'Estoque'],
        nivel: 'Iniciante'
    },
    {
        id: 'workshop-posicionamento',
        tipo: 'curso',
        titulo: 'Posicionamento e ofertas para virar referência',
        descricao: 'Como destacar seu negócio no mercado local e criar propostas irresistíveis para seus clientes.',
        palestrante: 'Especialista em Marketing',
        local: 'Sala 2',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Marketing', 'Posicionamento', 'Ofertas'],
        nivel: 'Intermediário'
    },
    {
        id: 'oficina-vendas-abordagem',
        tipo: 'curso',
        titulo: 'Atendimento que vende: roteiro de abordagem',
        descricao: 'Técnicas práticas de abordagem e fechamento de vendas focadas no cliente local.',
        palestrante: 'Mentor de Vendas',
        local: 'Sala 3',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        vagas: 20,
        gratuito: true,
        tags: ['Vendas', 'Atendimento', 'Negociação'],
        nivel: 'Iniciante'
    },
    // BLOCO 2 (10:15 - 11:45)
    {
        id: 'oficina-whatsapp-marketing',
        tipo: 'curso',
        titulo: 'Listas de transmissão e atendimento rápido no WhatsApp',
        descricao: 'Transforme seu WhatsApp em uma máquina de vendas com organização e automação simples.',
        palestrante: 'Consultor de Digital',
        local: 'Sala 1',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['WhatsApp', 'Vendas', 'Digital'],
        nivel: 'Iniciante'
    },
    {
        id: 'workshop-instagram-reels',
        tipo: 'curso',
        titulo: 'Instagram e Reels para negócios locais',
        descricao: 'Aprenda a produzir conteúdo que atrai clientes reais da sua região através do Instagram.',
        palestrante: 'Social Media Expert',
        local: 'Sala 2',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['Instagram', 'Conteúdo', 'Negócios Locais'],
        nivel: 'Intermediário'
    },
    {
        id: 'oficina-ia-pratica',
        tipo: 'curso',
        titulo: 'Primeiros passos com Inteligência Artificial',
        descricao: 'Como usar ChatGPT e outras IAs para acelerar a criação de posts e textos do seu negócio.',
        palestrante: 'Especialista em IA',
        local: 'Sala 3',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        vagas: 20,
        gratuito: true,
        tags: ['IA', 'Tecnologia', 'Inovação'],
        nivel: 'Iniciante'
    },
    // BLOCO 3 (14:00 - 15:30)
    {
        id: 'oficina-plano-acao',
        tipo: 'curso',
        titulo: 'Plano de ação em uma página',
        descricao: 'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual.',
        palestrante: 'Especialista em Estratégia',
        local: 'Sala 1',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['Estratégia', 'Planejamento', 'Gestão'],
        nivel: 'Intermediário'
    },
    {
        id: 'workshop-vendas-b2b',
        tipo: 'curso',
        titulo: 'Vendendo para empresas e prefeituras (B2B/B2G)',
        descricao: 'Como prospectar e fechar contratos com grandes empresas e órgãos públicos.',
        palestrante: 'Consultor de Vendas B2B',
        local: 'Sala 2',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['Vendas', 'B2B', 'B2G'],
        nivel: 'Avançado'
    },
    {
        id: 'oficina-ia-produtividade',
        tipo: 'curso',
        titulo: 'Automatizando tarefas chatas com IA',
        descricao: 'Use a inteligência artificial como seu assistente para ganhar tempo no dia a dia.',
        palestrante: 'Tech Station',
        local: 'Sala 3',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['IA', 'Produtividade', 'Automação'],
        nivel: 'Intermediário'
    },
    // BLOCO 4 (15:45 - 17:15)
    {
        id: 'oficina-experiencia-cliente',
        tipo: 'curso',
        titulo: 'Do primeiro contato ao pós-venda: experiência do cliente',
        descricao: 'Mapeie a jornada do seu cliente e aprenda a fidelizar através de uma experiência incrível.',
        palestrante: 'CX Specialist',
        local: 'Sala 1',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['CX', 'Fidelização', 'Atendimento'],
        nivel: 'Intermediário'
    },
    {
        id: 'workshop-financas-credito',
        tipo: 'curso',
        titulo: 'Organizando as finanças para acessar crédito',
        descricao: 'Prepare seu negócio financeiramente para parcerias e linhas de crédito.',
        palestrante: 'Consultor Financeiro',
        local: 'Sala 2',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['Finanças', 'Crédito', 'PME'],
        nivel: 'Intermediário'
    },
    {
        id: 'oficina-inovacao-pratica',
        tipo: 'curso',
        titulo: 'Transformando problemas em oportunidades',
        descricao: 'Metodologia prática para inovar e criar novos produtos ou serviços no seu negócio.',
        palestrante: 'Mentor de Inovação',
        local: 'Sala 3',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        vagas: 20,
        gratuito: true,
        tags: ['Inovação', 'Problemas', 'Oportunidades'],
        nivel: 'Avançado'
    },

    // OUTRAS ATIVIDADES (Networking e Pitch)
    {
        id: 'mentoria-1-1',
        tipo: 'mentoria',
        titulo: 'Mentorias 1:1 Personalizadas',
        descricao: 'Sessões individuais de 30 minutos com mentores especialistas em diversas áreas.',
        local: 'Sala de Mentorias',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        vagas: 20,
        gratuito: true,
        tags: ['Mentoria', 'Individual', 'Consultoria'],
        nivel: 'Iniciante'
    },
    {
        id: 'networking-tarde',
        tipo: 'networking',
        titulo: 'Networking Empresarial',
        descricao: 'Momento para fazer conexões, trocar experiências e criar parcerias de negócios.',
        local: 'Área de Networking',
        horario_inicio: '16:00',
        horario_fim: '17:00',
        gratuito: true,
        tags: ['Networking', 'Conexões', 'Parcerias']
    },
    {
        id: 'startup-pitch',
        tipo: 'startup',
        titulo: 'Pitch de Startups',
        descricao: 'Startups apresentam suas soluções inovadoras para investidores e empresários.',
        local: 'Palco Startups',
        horario_inicio: '15:30',
        horario_fim: '17:00',
        gratuito: true,
        tags: ['Startup', 'Pitch', 'Investimento']
    },
    {
        id: 'b2b-rodada',
        tipo: 'b2b',
        titulo: 'Rodada de Negócios B2B',
        descricao: 'Reuniões agendadas entre empresas para fechar parcerias e negócios.',
        local: 'Sala B2B',
        horario_inicio: '14:00',
        horario_fim: '18:00',
        vagas: 30,
        gratuito: true,
        tags: ['B2B', 'Negócios', 'Parcerias']
    }
];

// PROGRAMAÇÃO NOTURNA (19:00 - 22:30) - PAGA (R$ 179,99)
export const programacaoNoturna: AtividadeProgramacao[] = [
    {
        id: 'palestra-leandro-batista',
        tipo: 'palestra',
        titulo: 'Crescimento Exponencial em Mercado Competitivo: Estratégias de Escala',
        descricao: 'Como a Fitness Exclusive se tornou a maior rede de academias do interior do Nordeste. Estratégias práticas de crescimento, expansão e gestão de múltiplas unidades.',
        palestrante: 'Leandro Batista',
        empresa: 'CEO, Fitness Exclusive',
        local: 'Palco Principal',
        horario_inicio: '19:00',
        horario_fim: '19:50',
        gratuito: false,
        valor: 179.99,
        tags: ['Crescimento', 'Estratégia', 'Expansão', 'Gestão']
    },
    {
        id: 'premiacao-arena-pitch',
        tipo: 'startup',
        titulo: 'Premiação Arena Pitch',
        descricao: 'Anúncio e entrega da premiação para as startups vencedoras da Arena Pitch.',
        local: 'Palco Principal',
        horario_inicio: '20:00',
        horario_fim: '20:20',
        gratuito: false,
        valor: 179.99,
        tags: ['Startup', 'Pitch', 'Premiação']
    },
    {
        id: 'networking-noturno',
        tipo: 'networking',
        titulo: 'Networking Premium + Coffee',
        descricao: 'Coffee break e networking exclusivo com palestrantes e empresários de destaque.',
        local: 'Área VIP',
        horario_inicio: '20:20',
        horario_fim: '21:00',
        gratuito: false,
        valor: 179.99,
        tags: ['Networking', 'Premium', 'Conexões']
    },
    {
        id: 'palestra-vanylton-matias',
        tipo: 'palestra',
        titulo: 'Inovação Corporativa: Como Empresas se Mantêm Competitivos em Tempos de Transformação',
        descricao: 'Cases de sucesso em inovação e transformation digital. Como o Grupo Núcleo se reinventou e se tornou referência nacional em gestão e inovação.',
        palestrante: 'Vanylton Matias',
        empresa: 'CEO, Grupo Núcleo',
        local: 'Palco Principal',
        horario_inicio: '21:10',
        horario_fim: '22:30',
        gratuito: false,
        valor: 179.99,
        tags: ['Inovação', 'Transformação', 'Digital', 'Gestão']
    },
    {
        id: 'encerramento-evento',
        tipo: 'networking',
        titulo: 'Encerramento e Sorteios',
        descricao: 'Encerramento oficial do evento com sorteios exclusivos para os participantes da noite.',
        local: 'Palco Principal',
        horario_inicio: '22:30',
        horario_fim: '23:00',
        gratuito: false,
        valor: 179.99,
        tags: ['Encerramento', 'Sorteios']
    }
];

// TODOS OS CURSOS, OFICINAS E WORKSHOPS (para seleção na inscrição)
export const cursosDisponiveis = programacaoDiurna.filter(
    atividade => ['curso', 'oficina', 'workshop'].includes(atividade.tipo)
);

// TODAS AS PALESTRAS NOTURNAS (para oferta)
export const palestrasNoturnas = programacaoNoturna.filter(
    atividade => atividade.tipo === 'palestra'
);

// PROGRAMAÇÃO COMPLETA
export const programacaoCompleta = [...programacaoDiurna, ...programacaoNoturna];

// HELPER: Buscar atividade por ID
export const getAtividadeById = (id: string): AtividadeProgramacao | undefined => {
    return programacaoCompleta.find(atividade => atividade.id === id);
};

// HELPER: Filtrar por tipo
export const getAtividadesPorTipo = (tipo: TipoAtividade): AtividadeProgramacao[] => {
    return programacaoCompleta.filter(atividade => atividade.tipo === tipo);
};

// HELPER: Filtrar por período
export const getAtividadesPorPeriodo = (periodo: 'manha' | 'tarde' | 'noite'): AtividadeProgramacao[] => {
    const horarios = {
        manha: { inicio: '08:00', fim: '12:00' },
        tarde: { inicio: '12:00', fim: '18:00' },
        noite: { inicio: '18:00', fim: '23:59' }
    };

    return programacaoCompleta.filter(atividade => {
        const hora = parseInt(atividade.horario_inicio.split(':')[0]);
        const inicioRange = parseInt(horarios[periodo].inicio.split(':')[0]);
        const fimRange = parseInt(horarios[periodo].fim.split(':')[0]);
        return hora >= inicioRange && hora < fimRange;
    });
};
