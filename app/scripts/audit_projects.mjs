import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
    console.log('--- DB PROJECT AUDIT ---');
    const { data: projects, error } = await supabase.from('projects').select('id, name, slug');
    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }

    console.log('Total projects found:', projects.length);
    projects.forEach(p => {
        console.log(`[${p.id}] ${p.name} (${p.slug})`);
    });

    const TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const hasFixed = projects.some(p => p.id === TRIUNFO_ID);
    console.log('Fixed UUID Project Present:', hasFixed);
    
    console.log('--- END AUDIT ---');
}

checkProjects();
