import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDg1NTAsImV4cCI6MjA4NTc4NDU1MH0.vi9d2V_Cvu-G3XbBQshgPX6sAtIuh8rjWk_H3qhnqJQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking mentorias_agendadas columns...');
    const { data, error } = await supabase.from('mentorias_agendadas').select().limit(1);

    if (error) {
        console.error('ERROR:', JSON.stringify(error, null, 2));
    } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : 'No data to show columns';
        console.log('COLUMNS:', columns);

        // If empty, try to get info via RPC if exists or assume missing
        if (data.length === 0) {
            console.log('Table is empty. Trying to insert a test row to see allowed columns...');
            // This might fail but will give hints in error
        }
    }
}

check();
