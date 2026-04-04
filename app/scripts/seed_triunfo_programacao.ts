
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey);

const PROJECT_ID = 'ge-triunfo-2026';

const sessions = [
    // MANHÃ
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
        end_time: '11:30',
        room: 'Salão Principal',
        speakers: ['Convidado 1', 'Convidado 2', 'Mediador'],
        max_capacity: 0,
        registered_count: 0,
        color: 'purple'
    },
    // TARDE
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
    // NOITE
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
    // CIRCUITO
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

async function seed() {
    console.log('Iniciando seed de programação para:', PROJECT_ID);

    // Limpar programação existente para este projeto (opcional, mas bom para refazer)
    const { error: deleteError } = await supabase
        .from('event_schedule')
        .delete()
        .eq('project_id', PROJECT_ID);

    if (deleteError) {
        console.error('Erro ao limpar programação:', deleteError);
    } else {
        console.log('Programação antiga limpa com sucesso.');
    }

    const { data, error } = await supabase
        .from('event_schedule')
        .insert(sessions);

    if (error) {
        console.error('Erro ao inserir sessões:', error);
    } else {
        console.log('Programação inserida com sucesso!', sessions.length, 'atividades criadas.');
    }
}

seed();
