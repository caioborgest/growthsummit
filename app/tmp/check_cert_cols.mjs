import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
    try {
        const { data, error } = await supabase.from('certificados').select('*').limit(1);
        if (error) {
            console.error('Error selecting:', error.message);
            return;
        }
        if (data && data.length > 0) {
            console.log('Columns in certificados:', Object.keys(data[0]));
        } else {
            // Try to get one row from another table to see if we can at least connect
            const { data: proj } = await supabase.from('projects').select('*').limit(1);
            console.log('Certificados exists but empty?');
        }
    } catch (e) {
        console.error('Failed to run check:', e);
    }
}

check();
