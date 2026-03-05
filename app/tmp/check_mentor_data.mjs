import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zczfutmymobgypbbamme.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '...'; // Use anon or service role if needed

// Hardcode for script if needed
const FIXED_KEY = '...';

const supabase = createClient(SUPABASE_URL, FIXED_KEY);

async function check() {
    const { data, error } = await supabase
        .from('mentores_growth_experience')
        .select('*')
        .eq('email', 'cbxgrowth@gmail.com');

    const result = {
        data,
        error
    };

    fs.writeFileSync('mentor_check.json', JSON.stringify(result, null, 2));
    console.log('Check complete, saved to mentor_check.json');
}

check();
