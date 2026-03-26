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
    }
];

export const momentosAncoraData = {
    manha: [
        { horario: '17:00', atividade: 'Início: Credenciamento e Networking', local: 'Recepção / Hall' },
        { horario: '18:00', atividade: 'Abertura Oficial e Boas-vindas', local: 'Salão Principal' }
    ],
    tarde: [
        { horario: '20:10', atividade: 'Momento Especial / Sorteios', local: 'Salão Principal' },
        { horario: '22:30', atividade: 'Encerramento Oficial e Networking Final', local: 'Salão Principal' }
    ]
};

export const programacaoManhaData = {
    bloco1: {
        horario: '---',
        titulo: 'Sessão Diurna (Somente Edição Full)',
        salao: {
            titulo: 'Esta edição acontece exclusivamente no turno da noite.',
            tipo: 'Informação Importante',
            capacidade: 0,
            topicos: ['Eventos diurnos não aplicáveis a esta edição Pocket']
        },
        salas: []
    },
    circulacao1: { horario: '---', atividade: '---' },
    bloco2: {
        horario: '---',
        titulo: '---',
        salao: undefined,
        salas: []
    },
    encerramento: { horario: '---', atividade: '---' }
};

export const programacaoTardeData = {
    bloco3: {
        horario: '---',
        titulo: '---',
        salao: undefined,
        salas: []
    },
    circulacao2: { horario: '---', atividade: '---' },
    bloco4: {
        horario: '---',
        titulo: '---',
        salao: undefined,
        salas: []
    },
    encerramento: { horario: '---', atividade: '---' }
};

export const programacaoNoturnaData = [
    { horario: '17:00', atividade: 'Credenciamento e Visitacao aos Stands' },
    { horario: '18:00', atividade: 'Jeronimo Freire: Gestão Exponencial' },
    { horario: '19:00', atividade: 'Leandro Batista: Crescimento em Mercado Competitivo' },
    { horario: '20:00', atividade: 'Carolinne Castro: Vendas e Encantamento' },
    { horario: '21:10', atividade: 'Vanylton Matias: Inovação Corporativa' },
    { horario: '22:30', atividade: 'Encerramento e Sorteios' }
];
