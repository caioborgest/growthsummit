// Tipos de atividades
export const TiposAtividade = ['curso', 'mentoria', 'palestra', 'networking', 'startup', 'b2b'] as const;
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
    // MANHÃ - CURSOS (08:00 - 12:00)
    {
        id: 'curso-marketing-digital',
        tipo: 'curso',
        titulo: 'Marketing Digital para PMEs',
        descricao: 'Estratégias práticas de marketing digital, redes sociais e vendas online para pequenas e médias empresas.',
        palestrante: 'Ana Paula Silva',
        empresa: 'SEBRAE',
        local: 'Sala 1',
        horario_inicio: '08:00',
        horario_fim: '10:00',
        vagas: 50,
        gratuito: true,
        tags: ['Marketing', 'Digital', 'Redes Sociais'],
        nivel: 'Iniciante'
    },
    {
        id: 'curso-gestao-financeira',
        tipo: 'curso',
        titulo: 'Gestão Financeira Empresarial',
        descricao: 'Controle financeiro, fluxo de caixa, precificação e análise de custos para seu negócio.',
        palestrante: 'Carlos Eduardo Santos',
        empresa: 'Consultor Financeiro',
        local: 'Sala 2',
        horario_inicio: '08:00',
        horario_fim: '10:00',
        vagas: 50,
        gratuito: true,
        tags: ['Finanças', 'Gestão', 'Custos'],
        nivel: 'Intermediário'
    },
    {
        id: 'curso-vendas-estrategicas',
        tipo: 'curso',
        titulo: 'Técnicas de Vendas Estratégicas',
        descricao: 'Aprenda técnicas comprovadas de vendas, negociação e fechamento de contratos.',
        palestrante: 'Mariana Costa',
        empresa: 'Especialista em Vendas',
        local: 'Sala 3',
        horario_inicio: '08:00',
        horario_fim: '10:00',
        vagas: 40,
        gratuito: true,
        tags: ['Vendas', 'Negociação', 'Fechamento'],
        nivel: 'Iniciante'
    },
    {
        id: 'curso-gestao-pessoas',
        tipo: 'curso',
        titulo: 'Gestão de Pessoas e Liderança',
        descricao: 'Desenvolva habilidades de liderança, gestão de equipes e cultura organizacional.',
        palestrante: 'Roberto Almeida',
        empresa: 'Coach Empresarial',
        local: 'Sala 4',
        horario_inicio: '08:00',
        horario_fim: '10:00',
        vagas: 45,
        gratuito: true,
        tags: ['Liderança', 'RH', 'Gestão'],
        nivel: 'Intermediário'
    },
    {
        id: 'curso-inovacao-negocios',
        tipo: 'curso',
        titulo: 'Inovação e Transformação Digital',
        descricao: 'Como inovar no seu negócio usando tecnologia e processos digitais.',
        palestrante: 'Juliana Ferreira',
        empresa: 'Consultora de Inovação',
        local: 'Sala 5',
        horario_inicio: '10:30',
        horario_fim: '12:00',
        vagas: 50,
        gratuito: true,
        tags: ['Inovação', 'Tecnologia', 'Digital'],
        nivel: 'Avançado'
    },
    {
        id: 'curso-atendimento-cliente',
        tipo: 'curso',
        titulo: 'Excelência no Atendimento ao Cliente',
        descricao: 'Estratégias para encantar clientes, fidelizar e aumentar vendas através do atendimento.',
        palestrante: 'Patricia Oliveira',
        empresa: 'Especialista em CX',
        local: 'Sala 6',
        horario_inicio: '10:30',
        horario_fim: '12:00',
        vagas: 40,
        gratuito: true,
        tags: ['Atendimento', 'Cliente', 'Fidelização'],
        nivel: 'Iniciante'
    },

    // TARDE - MENTORIAS E ATIVIDADES (14:00 - 18:00)
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

// TODOS OS CURSOS (para seleção na inscrição)
export const cursosDisponiveis = programacaoDiurna.filter(
    atividade => atividade.tipo === 'curso'
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
