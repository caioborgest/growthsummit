import { supabase } from './supabase';
import { logger } from './logger';

const PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Triunfo ID
const EVENT_DATE = '2026-04-16';

const programacaoTriunfo = [
    // BLOC 1 (08:30 - 10:00)
    {
        title: 'Gestão simples de caixa, estoque e preço',
        description: 'Aprenda a controlar o fluxo de caixa, precificar produtos e gerir seu estoque de forma eficiente.',
        type: 'curso',
        category: 'manha_bloco_1',
        start_time: '08:30',
        end_time: '10:00',
        room: 'Sala 01',
        speakers: ['Consultor SEBRAE'],
        topics: ['Gestão', 'Finanças', 'Estoque'],
    },
    {
        title: 'Posicionamento e ofertas para virar referência',
        description: 'Como destacar seu negócio no mercado local e criar propostas irresistíveis para seus clientes.',
        type: 'curso',
        category: 'manha_bloco_1',
        start_time: '08:30',
        end_time: '10:00',
        room: 'Sala 02',
        speakers: ['Especialista em Marketing'],
        topics: ['Marketing', 'Posicionamento', 'Ofertas'],
    },
    {
        title: 'Atendimento que vende: roteiro de abordagem',
        description: 'Técnicas práticas de abordagem e fechamento de vendas focadas no cliente local.',
        type: 'curso',
        category: 'manha_bloco_1',
        start_time: '08:30',
        end_time: '10:00',
        room: 'Sala 03',
        speakers: ['Mentor de Vendas'],
        topics: ['Vendas', 'Atendimento', 'Negociação'],
    },
    // BLOC 2 (10:15 - 11:45)
    {
        title: 'Listas de transmissão e atendimento rápido no WhatsApp',
        description: 'Transforme seu WhatsApp em uma máquina de vendas com organização e automação simples.',
        type: 'curso',
        category: 'manha_bloco_2',
        start_time: '10:15',
        end_time: '11:45',
        room: 'Sala 01',
        speakers: ['Consultor de Digital'],
        topics: ['WhatsApp', 'Vendas', 'Digital'],
    },
    {
        title: 'Instagram e Reels para negócios locais',
        description: 'Aprenda a produzir conteúdo que atrai clientes reais da sua região através do Instagram.',
        type: 'curso',
        category: 'manha_bloco_2',
        start_time: '10:15',
        end_time: '11:45',
        room: 'Sala 02',
        speakers: ['Social Media Expert'],
        topics: ['Instagram', 'Conteúdo', 'Negócios Locais'],
    },
    {
        title: 'Primeiros passos com Inteligência Artificial',
        description: 'Como usar ChatGPT e outras IAs para acelerar a criação de posts e textos do seu negócio.',
        type: 'curso',
        category: 'manha_bloco_2',
        start_time: '10:15',
        end_time: '11:45',
        room: 'Sala 03',
        speakers: ['Especialista em IA'],
        topics: ['IA', 'Tecnologia', 'Inovação'],
    },
    // BLOC 3 (14:00 - 15:30)
    {
        title: 'Plano de ação em uma página',
        description: 'Saia do improviso e aprenda a planejar os próximos 12 meses do seu negócio de forma visual.',
        type: 'curso',
        category: 'tarde_bloco_3',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Sala 01',
        speakers: ['Especialista em Estratégia'],
        topics: ['Estratégia', 'Planejamento', 'Gestão'],
    },
    {
        title: 'Vendendo para empresas e prefeituras (B2B/B2G)',
        description: 'Como prospectar e fechar contratos com grandes empresas e órgãos públicos.',
        type: 'curso',
        category: 'tarde_bloco_3',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Sala 02',
        speakers: ['Consultor de Vendas B2B'],
        topics: ['Vendas', 'B2B', 'B2G'],
    },
    {
        title: 'Automatizando tarefas chatas com IA',
        description: 'Use a inteligência artificial como seu assistente para ganhar tempo no dia a dia.',
        type: 'oficina',
        category: 'tarde_bloco_3',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Sala 03',
        speakers: ['Tech Station'],
        topics: ['IA', 'Produtividade', 'Automação'],
    },
    // BLOC 4 (15:45 - 17:15)
    {
        title: 'Do primeiro contato ao pós-venda: experiência do cliente',
        description: 'Mapeie a jornada do seu cliente e aprenda a fidelizar através de uma experiência incrível.',
        type: 'oficina',
        category: 'tarde_bloco_4',
        start_time: '15:45',
        end_time: '17:15',
        room: 'Sala 01',
        speakers: ['CX Specialist'],
        topics: ['CX', 'Fidelização', 'Atendimento'],
    },
    {
        title: 'Organizando as finanças para acessar crédito',
        description: 'Prepare seu negócio financeiramente para parcerias e linhas de crédito.',
        type: 'workshop',
        category: 'tarde_bloco_4',
        start_time: '15:45',
        end_time: '17:15',
        room: 'Sala 02',
        speakers: ['Consultor Financeiro'],
        topics: ['Finanças', 'Crédito', 'PME'],
    },
    {
        title: 'Transformando problemas em oportunidades',
        description: 'Metodologia prática para inovar e criar novos produtos ou serviços no seu negócio.',
        type: 'oficina',
        category: 'tarde_bloco_4',
        start_time: '15:45',
        end_time: '17:15',
        room: 'Sala 03',
        speakers: ['Mentor de Inovação'],
        topics: ['Inovação', 'Problemas', 'Oportunidades'],
    },
    // NIGHT EXPERIENCE
    {
        title: 'Crescimento Exponencial em Mercado Competitivo: Estratégias de Escala',
        description: 'Como a Fitness Exclusive se tornou a maior rede de academias do interior do Nordeste. Estratégias práticas de crescimento, expansão e gestão de múltiplas unidades.',
        type: 'palestra',
        category: 'noturna',
        start_time: '19:00',
        end_time: '19:50',
        room: 'Salão Principal',
        speakers: ['Leandro Batista'],
        partner: 'CEO, Fitness Exclusive',
        topics: ['Crescimento', 'Estratégia', 'Expansão', 'Gestão'],
    },
    {
        title: 'Premiação Arena Pitch',
        description: 'Anúncio e entrega da premiação para as startups vencedoras da Arena Pitch.',
        type: 'startup',
        category: 'noturna',
        start_time: '20:00',
        end_time: '20:20',
        room: 'Salão Principal',
        topics: ['Startup', 'Pitch', 'Premiação'],
    },
    {
        title: 'Networking Premium + Coffee',
        description: 'Coffee break e networking exclusivo com palestrantes e empresários de destaque.',
        type: 'networking',
        category: 'noturna',
        start_time: '20:20',
        end_time: '21:00',
        room: 'Área de Convivência',
        topics: ['Networking', 'Premium', 'Conexões'],
    },
    {
        title: 'Inovação Corporativa: Como Empresas se Mantêm Competitivos em Tempos de Transformação',
        description: 'Cases de sucesso em inovação e transformation digital. Como o Grupo Núcleo se reinventou e se tornou referência nacional em gestão e inovação.',
        type: 'palestra',
        category: 'noturna',
        start_time: '21:10',
        end_time: '22:30',
        room: 'Salão Principal',
        speakers: ['Vanylton Matias'],
        partner: 'CEO, Grupo Núcleo',
        topics: ['Inovação', 'Transformação', 'Digital', 'Gestão'],
    },
    {
        title: 'Encerramento e Sorteios',
        description: 'Encerramento oficial do evento com sorteios exclusivos para os participantes da noite.',
        type: 'networking',
        category: 'noturna',
        start_time: '22:30',
        end_time: '23:00',
        room: 'Salão Principal',
        topics: ['Encerramento', 'Sorteios'],
    },
];

export async function seedTriunfoSchedule() {
    try {
        const activities = programacaoTriunfo.map(a => ({
            ...a,
            project_id: PROJECT_ID,
            date: EVENT_DATE,
            created_at: new Date().toISOString(),
        }));

        const { error: delError } = await (supabase.from('event_schedule' as any).delete() as any).eq('project_id', PROJECT_ID);
        if (delError) logger.warn('[seeding] Error clearing old schedule:', delError);

        const { data, error } = await (supabase.from('event_schedule' as any).insert(activities as any) as any).select();
        if (error) throw error;

        return { success: true, count: data?.length || 0 };
    } catch (err) {
        logger.error('[seeding] Error:', err);
        return { success: false, error: err };
    }
}
