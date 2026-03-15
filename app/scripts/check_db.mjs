import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStructure() {
    console.log('Checking table structure...');
    
    const { data: cols1, error: err1 } = await supabase.rpc('get_table_columns', { table_name: 'inscricoes_growth_experience' });
    if (err1) {
        console.log('Error getting columns for inscricoes_growth_experience (maybe RPC get_table_columns doesnt exist)');
    } else {
        console.log('Columns for inscricoes_growth_experience:', cols1);
    }

    // Alternative: try to select one row
    const { data: reg, error: err2 } = await supabase.from('inscricoes_growth_experience').select('*').limit(1);
    if (err2) {
        console.error('Error selecting from inscricoes_growth_experience:', err2);
    } else if (reg && reg.length > 0) {
        console.log('Sample registration keys:', Object.keys(reg[0]));
    } else {
        console.log('No registrations found to check columns');
    }

    const { data: prof, error: err3 } = await supabase.from('profiles').select('*').limit(1);
    if (err3) {
        console.error('Error selecting from profiles:', err3);
    } else if (prof && prof.length > 0) {
        console.log('Sample profile keys:', Object.keys(prof[0]));
    } else {
        console.log('No profiles found to check columns');
    }
}

checkStructure();
