import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const sessions = [
  {
    project_id: TRIUNFO_ID,
    title: 'Credenciamento e Exposição de Marcas',
    description: 'Networking e conexões no Espaço Parque',
    type: 'checkin',
    track: 'Geral',
    day: 1,
    start_time: '17:00:00',
    end_time: '18:00:00',
    room: 'Espaço Parque',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Staff Growth']
  },
  {
    project_id: TRIUNFO_ID,
    title: 'Jerônimo Freire: Gestão e Liderança',
    description: 'Liderança em momentos desafiadores',
    type: 'palestra',
    track: 'Main Stage',
    day: 1,
    start_time: '18:00:00',
    end_time: '19:00:00',
    room: 'Salão Principal',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Jerônimo Freire']
  },
  {
    project_id: TRIUNFO_ID,
    title: 'Talk Show: Leandro & João Daniel',
    description: 'Bastidores de negócios que cresceram no interior',
    type: 'talkshow',
    track: 'Main Stage',
    day: 1,
    start_time: '19:00:00',
    end_time: '20:10:00',
    room: 'Salão Principal',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Leandro Batista', 'João Daniel']
  },
  {
    project_id: TRIUNFO_ID,
    title: 'Dra. Carolinne Castro: Liderança Jurídica',
    description: 'Redução de riscos e engajamento de equipes',
    type: 'palestra',
    track: 'Main Stage',
    day: 1,
    start_time: '20:10:00',
    end_time: '21:10:00',
    room: 'Salão Principal',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Dra. Carolinne Castro']
  },
  {
    project_id: TRIUNFO_ID,
    title: 'Vanylton Matias: Gestão para Escalar',
    description: 'Equilíbrio entre resultados e olhar humano',
    type: 'palestra',
    track: 'Main Stage',
    day: 1,
    start_time: '21:10:00',
    end_time: '22:30:00',
    room: 'Salão Principal',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Vanylton Matias']
  },
  {
    project_id: TRIUNFO_ID,
    title: 'Networking e Encerramento',
    description: 'Conexões finais e encerramento oficial (23h).',
    type: 'social',
    track: 'Lounge',
    day: 1,
    start_time: '22:30:00',
    end_time: '23:30:00',
    room: 'Área de Convívio',
    max_capacity: 2000,
    category: 'noturna',
    speakers: ['Staff Growth']
  }
];

async function seed() {
  console.log('Seeding sessions for Triunfo...');
  
  // Cleanup old sessions first to avoid duplicates (since we don't have IDs for all of them here)
  await supabase.from('event_schedule').delete().eq('project_id', TRIUNFO_ID);
  
  const { data, error } = await supabase
    .from('event_schedule')
    .insert(sessions);
    
  if (error) {
    console.error('Error seeding sessions:', error);
  } else {
    console.log('Successfully seeded 6 sessions for Triunfo.');
  }
}

seed();
