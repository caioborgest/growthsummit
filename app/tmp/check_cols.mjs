import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zczfutmymobgypbbamme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';

async function check() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'mentores_growth_experience' });
    // If rpc doesn't exist, try a select limit 1
    if (error) {
        const { data: one, error: e2 } = await supabase.from('mentores_growth_experience').select('*').limit(1);
        console.log('COLUMNS:', Object.keys(one?.[0] || {}));
        process.exit(0);
    }
    console.log('INFO:', data);
    process.exit(0);
}

check();
