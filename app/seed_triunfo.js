import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';
const PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Fixed ID for Triunfo
const EVENT_DATE = '2026-04-16';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const programacaoDiurna = [
    {
        id: 'oficina-gestao-caixa',
        tipo: 'curso',
        titulo: 'Gestão simples de caixa, estoque e preço',
        descricao: 'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.',
        palestrante: 'Consultor SEBRAE',
        local: 'Sala 1',
        horario_inicio: '08:30',
        horario_fim: '10:00',
        tags: ['Gestão', 'Finanças', 'Estoque'],
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
        tags: ['Marketing', 'Posicionamento', 'Ofertas'],
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
        tags: ['Vendas', 'Atendimento', 'Negociação'],
    },
    {
        id: 'oficina-whatsapp-marketing',
        tipo: 'curso',
        titulo: 'Listas de transmissão e atendimento rápido no WhatsApp',
        descricao: 'Transforme seu WhatsApp em uma máquina de vendas com organização e automação simples.',
        palestrante: 'Consultor de Digital',
        local: 'Sala 1',
        horario_inicio: '10:15',
        horario_fim: '11:45',
        tags: ['WhatsApp', 'Vendas', 'Digital'],
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
        tags: ['Instagram', 'Conteúdo', 'Negócios Locais'],
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
        tags: ['IA', 'Tecnologia', 'Inovação'],
    },
    {
        id: 'oficina-plano-acao',
        tipo: 'curso',
        titulo: 'Plano de ação em uma página',
        descricao: 'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual.',
        palestrante: 'Especialista em Estratégia',
        local: 'Sala 1',
        horario_inicio: '14:00',
        horario_fim: '15:30',
        tags: ['Estratégia', 'Planejamento', 'Gestão'],
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
        tags: ['Vendas', 'B2B', 'B2G'],
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
        tags: ['IA', 'Produtividade', 'Automação'],
    },
    {
        id: 'oficina-experiencia-cliente',
        tipo: 'curso',
        titulo: 'Do primeiro contato ao pós-venda: experiência do cliente',
        descricao: 'Mapeie a jornada do seu cliente e aprenda a fidelizar através de uma experiência incrível.',
        palestrante: 'CX Specialist',
        local: 'Sala 1',
        horario_inicio: '15:45',
        horario_fim: '17:15',
        tags: ['CX', 'Fidelização', 'Atendimento'],
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
        tags: ['Finanças', 'Crédito', 'PME'],
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
        tags: ['Inovação', 'Problemas', 'Oportunidades'],
    }
];

const programacaoNoturna = [
    {
        id: 'credenciamento-exposicao',
        tipo: 'networking',
        titulo: 'Credenciamento e Exposição de Marcas',
        descricao: 'Início da jornada de conexões no Espaço Parque',
        local: 'Espaço Parque',
        horario_inicio: '17:00',
        horario_fim: '18:00',
        tags: ['Conexões', 'Check-in'],
    },
    {
        id: 'jeronimo-freire-gestao',
        tipo: 'palestra',
        titulo: 'Jerônimo Freire: Gestão e Liderança',
        descricao: 'Estratégias avançadas para mercados competitivos',
        palestrante: 'Jerônimo Freire',
        local: 'Salão Principal',
        horario_inicio: '18:00',
        horario_fim: '19:00',
        tags: ['Gestão', 'Liderança', 'Estratégia'],
    },
    {
        id: 'talk-show-inovacao',
        tipo: 'palestra',
        titulo: 'Talk Show: Inovação e Resultados',
        descricao: 'Leandro Batista & João Daniel compartilham bastidores',
        palestrante: 'Leandro Batista & João Daniel',
        local: 'Salão Principal',
        horario_inicio: '19:00',
        horario_fim: '20:10',
        tags: ['Inovação', 'Resultados', 'Bastidores'],
    },
    {
        id: 'carolinne-castro-lideranca',
        tipo: 'palestra',
        titulo: 'Dra. Carolinne Castro: Liderança Inteligente',
        descricao: 'Otimização de processos e engajamento humano',
        palestrante: 'Dra. Carolinne Castro',
        local: 'Salão Principal',
        horario_inicio: '20:10',
        horario_fim: '21:10',
        tags: ['Liderança', 'Processos', 'Engajamento'],
    },
    {
        id: 'vanylton-matias-escala',
        tipo: 'palestra',
        titulo: 'Vanylton Matias: Escala de Negócios',
        descricao: 'Acelerando seu faturamento com estratégia digital',
        palestrante: 'Vanylton Matias',
        local: 'Salão Principal',
        horario_inicio: '21:10',
        horario_fim: '22:30',
        tags: ['Escala', 'Estratégia Digital', 'Faturamento'],
    },
    {
        id: 'networking-premium-encerramento',
        tipo: 'networking',
        titulo: 'Networking Premium e Encerramento',
        descricao: 'Conexões finais de alto nível e brindes',
        local: 'Salão Principal',
        horario_inicio: '22:30',
        horario_fim: '23:30',
        tags: ['Networking', 'Encerramento', 'Brindes'],
    }
];

function getCategory(time) {
    const hour = parseInt(time.split(':')[0]);
    const min = parseInt(time.split(':')[1]);
    const totalMin = hour * 60 + min;

    if (totalMin >= 19 * 60) return 'noturna';
    if (totalMin < 10 * 60) return 'manha_bloco_1';
    if (totalMin < 12 * 60) return 'manha_bloco_2';
    if (totalMin < 15 * 60 + 45) return 'tarde_bloco_3';
    return 'tarde_bloco_4';
}

async function seed() {
    console.log('Seed starting...');

    const allActivities = [...programacaoDiurna, ...programacaoNoturna];
    
    const rows = allActivities.map(a => ({
        project_id: PROJECT_ID,
        title: a.titulo,
        description: a.descricao,
        type: a.tipo,
        category: getCategory(a.horario_inicio),
        start_time: a.horario_inicio,
        end_time: a.horario_fim,
        room: a.local,
        speakers: a.palestrante ? [a.palestrante] : [],
        partner: a.empresa || null,
        max_slots: 20,
        topics: a.tags || [],
        date: EVENT_DATE,
        created_at: new Date().toISOString()
    }));

    // First clear existing for this project to avoid duplicates if re-running
    const { error: delError } = await supabase
        .from('event_schedule')
        .delete()
        .eq('project_id', PROJECT_ID);

    if (delError) {
        console.error('Error clearing old schedule:', delError);
        // Continue anyway
    }

    const { data, error } = await supabase
        .from('event_schedule')
        .insert(rows);

    if (error) {
        console.error('Error seeding schedule:', error);
    } else {
        console.log('Successfully seeded', rows.length, 'activities.');
    }
}

seed();
