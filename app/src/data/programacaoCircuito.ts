import {
    Lightbulb,
    GraduationCap,
    Landmark,
    Smartphone,
    DollarSign,
    Briefcase,
    Camera,
    Utensils,
    Bot,
    Mic
} from 'lucide-react';

export const circuitoExperienciasData = [
    {
        icon: Lightbulb,
        nome: 'Espaço Sebrae',
        subtitulo: 'Consultório de Negócios',
        parceiro: 'SEBRAE',
        formato: '2 mesas • 15min',
        capacidade: '32/h',
        totalDia: '250 atendimentos',
        temas: ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'],
        cor: 'orange',
        tempo: '15 min'
    },
    {
        icon: GraduationCap,
        nome: 'Espaço Senac',
        subtitulo: 'Carreira e Profissão',
        parceiro: 'SENAC',
        formato: 'Atend + Oficinas',
        capacidade: '25/h',
        totalDia: '200 pessoas',
        temas: ['Carreira', 'Cursos', 'Mercado de Trabalho'],
        cor: 'orange',
        tempo: '15 min'
    },
    {
        icon: Landmark,
        nome: 'Espaço Sicoob',
        subtitulo: 'Dinheiro e Cooperativismo',
        parceiro: 'SICOOB',
        formato: 'Balcão + Talks',
        capacidade: '35/h',
        totalDia: '250 pessoas',
        temas: ['Conta PJ', 'Crédito Consciente', 'Educação Financeira'],
        cor: 'orange',
        tempo: '10 min'
    },
    {
        icon: Smartphone,
        nome: 'Diagnóstico Digital',
        subtitulo: 'Consultoria Express',
        parceiro: 'MKT Dig',
        formato: '3 posições • 10min',
        capacidade: '18/h',
        totalDia: '150 diagnósticos',
        temas: ['Instagram', 'Google Meu Negócio', 'WhatsApp'],
        cor: 'neutral',
        tempo: '10 min'
    },
    {
        icon: DollarSign,
        nome: 'Clínica de Vendas',
        subtitulo: 'Aceleração Comercial',
        parceiro: 'Growth',
        formato: '1:1 • 15min',
        capacidade: '20/h',
        totalDia: '150 atendimentos',
        temas: ['Scripts', 'Objeções', 'Fechamento', 'Pós-venda'],
        cor: 'orange',
        tempo: '15 min'
    },
    {
        icon: Briefcase,
        nome: 'Balcão de Emprego',
        subtitulo: 'Orientação Profissional',
        parceiro: 'Senac + Parceiros',
        formato: '2 mesas • 10min',
        capacidade: '12/h',
        totalDia: '100 pessoas',
        temas: ['Currículo', 'Entrevista', 'Postura Profissional'],
        cor: 'neutral',
        tempo: '10 min'
    },
    {
        icon: Camera,
        nome: 'Totem Growth',
        subtitulo: 'Espaço Instagramável',
        parceiro: 'Growth Experience',
        formato: 'Foto + QR Code',
        capacidade: '50/h',
        totalDia: '400 interações',
        temas: ['Foto Profissional', 'Networking', 'Social Media'],
        cor: 'orange',
        tempo: '05 min'
    },
    {
        icon: Utensils,
        nome: 'Sabores Locais',
        subtitulo: 'Degustação e Amostras',
        parceiro: 'Produtores Locais',
        formato: '3 mesas temáticas',
        capacidade: '80/h',
        totalDia: '1000 degustações',
        temas: ['Alimentos', 'Bebidas', 'Artesanato'],
        cor: 'neutral',
        tempo: '10 min'
    },
    {
        icon: Bot,
        nome: 'IA na Prática',
        subtitulo: 'Tecnologia para PMEs',
        parceiro: 'Tech Station',
        formato: 'Demos em grupo',
        capacidade: '45/h',
        totalDia: '300 pessoas',
        temas: ['Criação de Posts', 'Respostas Automáticas', 'Copywriting'],
        cor: 'orange',
        tempo: '15 min'
    },
    {
        icon: Mic,
        nome: 'Arena de Pitches',
        subtitulo: 'Histórias de Negócio',
        parceiro: 'Sebrae/Senac',
        formato: 'Rodas de 30min',
        capacidade: '50/sessão',
        totalDia: '400 ouvintes',
        temas: ['Pits', 'Cases de Sucesso', 'Histórias Reais'],
        cor: 'orange',
        tempo: '30 min'
    }
];

export const momentosAncoraData = {
    manha: [
        { horario: '08:30', atividade: 'Palestra: Mapa de Crescimento para MPEs', local: 'Salão Principal' },
        { horario: '10:15', atividade: 'Palestra + Painel: Digital e WhatsApp', local: 'Salão Principal' },
        { horario: '11:45', atividade: 'Encerramento Manhã e Orientações', local: 'Salão Principal' }
    ],
    tarde: [
        { horario: '14:00', atividade: 'Palestra: Do Improviso ao Plano', local: 'Salão Principal' },
        { horario: '15:45', atividade: 'Talk Show: Histórias de Crescimento', local: 'Salão Principal' },
        { horario: '17:15', atividade: 'Encerramento do Circuito', local: 'Salão Principal' }
    ]
};

export const programacaoManhaData = {
    bloco1: {
        horario: '08:30 - 10:00',
        titulo: 'Bloco 1: Gestão e Vendas',
        salao: {
            titulo: 'Mapa de Crescimento para MPEs do Sertão do Pajeú',
            tipo: 'Palestra de Abertura',
            capacidade: 80,
            topicos: [
                'Desafios de gestão, vendas e caixa',
                'Oportunidades locais (comércio, serviços, agro, turismo)',
                'Como organizar prioridades com poucos recursos'
            ]
        },
        salas: [
            { horario: '08:30', numero: 1, titulo: 'Gestão simples de caixa, estoque e preço', tipo: 'Oficina de Gestão', capacidade: 20, topicos: ['Fluxo de caixa', 'Precificação', 'Controle de estoque'] },
            { horario: '08:30', numero: 2, titulo: 'Posicionamento e ofertas para virar referência', tipo: 'Workshop de Marketing', capacidade: 20, topicos: ['Diferenciais locais', 'Proposta de valor', 'Construção de ofertas'] },
            { horario: '08:30', numero: 3, titulo: 'Atendimento que vende: roteiro de abordagem', tipo: 'Oficina de Vendas', capacidade: 20, topicos: ['Técnicas de abordagem', 'Fechamento de vendas', 'Soluções para clientes'] }
        ]
    },
    circulacao1: { horario: '10:00 - 10:15', atividade: 'Café, Networking e Visita aos Stands' },
    bloco2: {
        horario: '10:15 - 11:45',
        titulo: 'Bloco 2: Digital e IA',
        salao: {
            titulo: 'Como usar o digital e o WhatsApp para vender mais',
            tipo: 'Palestra + Painel',
            capacidade: 80,
            topicos: [
                'Vendas por mídias digitais e WhatsApp',
                'Estratégia de funil simples',
                'Painel com empresários locais'
            ]
        },
        salas: [
            { horario: '10:15', numero: 1, titulo: 'Listas de transmissão e atendimento rápido', tipo: 'Oficina Marketing WhatsApp', capacidade: 20, topicos: ['Organização de listas', 'Modelos de mensagens', 'Pós-venda'] },
            { horario: '10:15', numero: 2, titulo: 'Instagram e Reels para negócios locais', tipo: 'Workshop de Redes Sociais', capacidade: 20, topicos: ['Conteúdo para produtos/serviços', 'Rotina de posts', 'Métricas'] },
            { horario: '10:15', numero: 3, titulo: 'Primeiros passos com Inteligência Artificial', tipo: 'Oficina de IA Aplicada', capacidade: 20, topicos: ['IA no dia a dia', 'Criação de posts/textos', 'Demonstração prática'] }
        ]
    },
    encerramento: { horario: '11:45 - 12:00', atividade: 'Recados Finais e Chamada para Tarde' }
};

export const programacaoTardeData = {
    bloco3: {
        horario: '14:00 - 15:30',
        titulo: 'Bloco 3: Estratégia e Planejamento',
        salao: {
            titulo: 'Do improviso ao plano: estratégia para 12 meses',
            tipo: 'Palestra Estratégica',
            capacidade: 80,
            topicos: [
                'Importância do planejamento',
                'Definição de metas simples',
                'Prioridades claras'
            ]
        },
        salas: [
            { horario: '14:00', numero: 1, titulo: 'Plano de ação em uma página', tipo: 'Oficina de Planejamento', capacidade: 20, topicos: ['Canvas de planejamento', 'Metas e ações', 'Revisão mensal'] },
            { horario: '14:00', numero: 2, titulo: 'Vendendo para empresas e prefeituras (B2B/B2G)', tipo: 'Workshop de Vendas', capacidade: 20, topicos: ['Vendas corporativas', 'Abordagem a órgãos públicos', 'Propostas comerciais'] },
            { horario: '14:00', numero: 3, titulo: 'Automatizando tarefas chatas com IA', tipo: 'Oficina de IA para Produtividade', capacidade: 20, topicos: ['Automação de documentos', 'IA como assistente', 'Checklist de automação'] }
        ]
    },
    circulacao2: { horario: '15:30 - 15:45', atividade: 'Networking Orientado' },
    bloco4: {
        horario: '15:45 - 17:15',
        titulo: 'Bloco 4: Crescimento e Inovação',
        salao: {
            titulo: 'Histórias de crescimento no Sertão',
            tipo: 'Talk Show com Casos Reais',
            capacidade: 80,
            topicos: [
                'Casos de sucesso locais',
                'Gestão e inovação na prática',
                'Perguntas da plateia'
            ]
        },
        salas: [
            { horario: '15:45', numero: 1, titulo: 'Do primeiro contato ao pós-venda: experiência do cliente', tipo: 'Oficina de Experiência do Cliente', capacidade: 20, topicos: ['Jornada do cliente', 'Fidelização e indicação', 'Pesquisa de satisfação'] },
            { horario: '15:45', numero: 2, titulo: 'Organizando as finanças para acessar crédito', tipo: 'Workshop de Finanças', capacidade: 20, topicos: ['Separação PF/PJ', 'Preparação para crédito', 'Indicadores financeiros'] },
            { horario: '15:45', numero: 3, titulo: 'Transformando problemas em oportunidades', tipo: 'Oficina de Inovação Prática', capacidade: 20, topicos: ['Mapeamento de dores locais', 'Brainstorm de soluções', 'Teste de ideias'] }
        ]
    },
    encerramento: { horario: '17:15 - 17:30', atividade: 'Encerramento e Chamada à Ação' }
};

export const programacaoNoturnaData = [
    { horario: '19:00', atividade: 'Leandro Batista: Crescimento Exponencial' },
    { horario: '20:00', atividade: 'Premiação Arena Pitch + Networking' },
    { horario: '21:10', atividade: 'Vanylton Matias: Inovação Corporativa' },
    { horario: '22:30', atividade: 'Encerramento Oficial' }
];
