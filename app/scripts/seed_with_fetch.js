
const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseKey = 'YOUR_NEW_SERVICE_ROLE_KEY'; // Obtida no Dashboard do Supabase
const PROJECT_ID = 'ge-triunfo-2026';

const sessions = [
    {
        project_id: PROJECT_ID,
        title: 'Credenciamento e Welcome Coffee',
        description: 'Recepção dos participantes, entrega de kits e networking inicial.',
        type: 'networking',
        category: 'manha_ancora',
        start_time: '08:00',
        end_time: '08:30',
        room: 'Salão Principal',
        speakers: [],
        max_capacity: 0,
        registered_count: 0,
        color: 'orange'
    },
    {
        project_id: PROJECT_ID,
        title: 'Abertura Oficial: O Futuro da Inovação no Sertão',
        description: 'Boas-vindas dos organizadores e visão estratégica para 2026.',
        type: 'keynote',
        category: 'manha_ancora',
        start_time: '08:30',
        end_time: '09:00',
        room: 'Salão Principal',
        speakers: ['Caio Borges', 'Autoridades Locais'],
        max_capacity: 0,
        registered_count: 0,
        color: 'orange'
    },
    {
        project_id: PROJECT_ID,
        title: 'Palestra: Do Improviso ao Plano',
        description: 'Como estruturar processos de crescimento em ambientes incertos.',
        type: 'talk',
        category: 'manha_bloco_1',
        start_time: '09:00',
        end_time: '10:00',
        room: 'Salão Principal',
        speakers: ['Leandro Batista'],
        max_capacity: 0,
        registered_count: 0,
        color: 'blue'
    },
    {
        project_id: PROJECT_ID,
        title: 'Coffee Break & Networking',
        description: 'Intervalo para conexões e visitação à área de negócios.',
        type: 'networking',
        category: 'manha_circulacao',
        start_time: '10:00',
        end_time: '10:15',
        room: 'Área de Convivência',
        speakers: [],
        max_capacity: 0,
        registered_count: 0,
        color: 'green'
    },
    {
        project_id: PROJECT_ID,
        title: 'Painel: Ecossistemas Regionais de Inovação',
        description: 'Discussão sobre como fortalecer o empreendedorismo local.',
        type: 'panel',
        category: 'manha_bloco_2',
        start_time: '10:15',
        end_time: '11:45',
        room: 'Salão Principal',
        speakers: ['Representante SEBRAE', 'Investidor Convidado', 'Mediador'],
        max_capacity: 0,
        registered_count: 0,
        color: 'purple'
    },
    {
        project_id: PROJECT_ID,
        title: 'Rodada de Negócios B2B - Sessão 1',
        description: 'Reuniões pré-agendadas entre empresas âncoras e fornecedores.',
        type: 'workshop',
        category: 'tarde_bloco_3',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Espaço B2B',
        speakers: [],
        max_capacity: 50,
        registered_count: 0,
        color: 'orange'
    },
    {
        project_id: PROJECT_ID,
        title: 'Arena Pitch: Demonstração de Startups',
        description: 'Startups locais apresentam suas soluções para banca de investidores.',
        type: 'circuito',
        category: 'tarde_bloco_3',
        start_time: '14:00',
        end_time: '17:00',
        room: 'Arena Pitches',
        speakers: [],
        max_capacity: 100,
        registered_count: 0,
        color: 'orange'
    },
    {
        project_id: PROJECT_ID,
        title: 'Workshop: Marketing Digital para Negócios Locais',
        description: 'Estratégias práticas para aumentar vendas usando canais digitais.',
        type: 'workshop',
        category: 'tarde_bloco_4',
        start_time: '15:45',
        end_time: '17:15',
        room: 'Sala 01',
        speakers: ['Especialista de Marketing'],
        max_capacity: 30,
        registered_count: 0,
        color: 'orange'
    },
    {
        project_id: PROJECT_ID,
        title: 'Night Experience: Sunset & Networking',
        description: 'Happy hour de encerramento com música ao vivo e networking premium.',
        type: 'networking',
        category: 'noturna',
        start_time: '18:00',
        end_time: '21:00',
        room: 'Rooftop / Área Externa',
        speakers: ['Artista Convidado'],
        max_capacity: 0,
        registered_count: 0,
        color: 'purple'
    },
    {
        project_id: PROJECT_ID,
        title: 'Estação de Mentoria Flash',
        description: 'Mentorias rápidas de 15 minutos com especialistas do hub.',
        type: 'circuito',
        category: 'circuito',
        start_time: '09:00',
        end_time: '17:00',
        room: 'Espaço Circuito',
        speakers: [],
        max_capacity: 0,
        registered_count: 0,
        color: 'orange'
    }
];

async function run() {
    console.log('Inserting sessions...');

    // Delete existing first
    const delRes = await fetch(`${supabaseUrl}/rest/v1/programacao_evento?project_id=eq.${PROJECT_ID}`, {
        method: 'DELETE',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (delRes.ok) {
        console.log('Existing sessions deleted.');
    } else {
        console.error('Error deleting sessions:', await delRes.text());
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/programacao_evento`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(sessions)
    });

    if (res.ok) {
        console.log('Sessions inserted successfully!');
    } else {
        console.error('Error inserting sessions:', await res.text());
    }
}

run();
