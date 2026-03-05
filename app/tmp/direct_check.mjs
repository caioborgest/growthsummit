import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zczfutmymobgypbbamme.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';

async function check() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: mentors, error: mError } = await supabase
        .from('mentores_growth_experience')
        .select('*')
        .eq('email', 'cbxgrowth@gmail.com');

    console.log('MENTORS:', JSON.stringify(mentors, null, 2));
    process.exit(0);
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
