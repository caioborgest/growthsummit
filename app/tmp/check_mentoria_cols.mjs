
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCols() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'mentorias_agendadas' });
    if (error) {
        console.log('Error getting columns via RPC:', error);
        // Fallback: try to select 1 row and check keys
        const { data: row, error: selectError } = await supabase.from('mentorias_agendadas').select('*').limit(1);
        if (selectError) {
            console.log('Error selecting from table:', selectError);
        } else if (row && row.length > 0) {
            console.log('Columns found in row:', Object.keys(row[0]));
        } else {
            console.log('Table empty, trying to query information_schema if possible (usually restricted)');
        }
    } else {
        console.log('Columns:', data);
    }
}

checkCols();
