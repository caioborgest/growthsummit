import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDg1NTAsImV4cCI6MjA4NTc4NDU1MH0.vi9d2V_Cvu-G3XbBQshgPX6sAtIuh8rjWk_H3qhnqJQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log('Checking mentorias_agendadas...');
    const { data, error } = await supabase
        .from('mentorias_agendadas')
        .select('*')
        .limit(1);

    if (error) {
        if (error.code === '42P01') {
            console.log('Table mentorias_agendadas does not exist!');
        } else {
            console.error('Error fetching table:', error);
        }
    } else {
        console.log('Table columns:', Object.keys(data[0] || {}));
    }
}

checkTable();
