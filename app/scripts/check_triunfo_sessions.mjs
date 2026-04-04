import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessions() {
  const projectId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  console.log(`Checking sessions for project ID: ${projectId}`);
  
  const { data, error } = await supabase
    .from('programacao_evento')
    .select('*')
    .eq('project_id', projectId);
    
  if (error) {
    console.error('Error fetching sessions:', error);
    return;
  }
  
  console.log(`Found ${data.length} sessions:`);
  data.forEach(s => {
    console.log(`- [${s.id}] ${s.title} (${s.category})`);
  });
}

checkSessions();
