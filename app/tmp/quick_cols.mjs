
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://zczfutmymobgypbbamme.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDg1NTAsImV4cCI6MjA4NTc4NDU1MH0.vi9d2V_Cvu-G3XbBQshgPX6sAtIuh8rjWk_H3qhnqJQ');

async function test() {
    const { data, error } = await supabase.from('mentorias_agendadas').select('*').limit(1);
    if (error) console.log('ERROR:', error);
    else if (data && data.length > 0) console.log('COLS:', Object.keys(data[0]));
    else console.log('EMPTY TABLE');
}
test();
