
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('cupons_parceria_social').select('descricao').limit(1);
    if (error) {
        console.log('❌ Description column NOT found:', error.message);
    } else {
        console.log('✅ Description column exists!');
    }
}

check();
