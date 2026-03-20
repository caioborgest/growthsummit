import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDg1NTAsImV4cCI6MjA4NTc4NDU1MH0.vi9d2V_Cvu-G3XbBQshgPX6sAtIuh8rjWk_H3qhnqJQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking raffles table ---');
    const { data, error } = await supabase.from('raffles').select('*').limit(1);

    if (error) {
        console.error('Initial select * ERROR:', error.message, error.code);
    } else {
        console.log('Success selecting * from raffles');
        if (data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty. Checking via RPC or trying to insert with project_id...');
            const { error: insertError } = await supabase.from('raffles').insert([{ 
                project_id: '00000000-0000-0000-0000-000000000000',
                name: 'TEST',
                type: 'realtime_qr'
            }]);
            if (insertError) {
                console.error('Insert with project_id ERROR:', insertError.message, insertError.code);
            } else {
                console.log('Insert with project_id SUCCESS!');
            }
            
            const { error: insertErrorCamel } = await supabase.from('raffles').insert([{ 
                projectId: '00000000-0000-0000-0000-000000000000',
                name: 'TEST',
                type: 'realtime_qr'
            }]);
            if (insertErrorCamel) {
                console.error('Insert with projectId ERROR:', insertErrorCamel.message, insertErrorCamel.code);
            } else {
                console.log('Insert with projectId SUCCESS!');
            }
        }
    }
}

check();
