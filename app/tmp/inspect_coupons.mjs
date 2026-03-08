
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Inspecting cupons_parceria_social ---');
    const { data, error } = await supabase.from('cupons_parceria_social').select('*').limit(1);

    if (error) {
        console.error('❌ Error selecting from cupons_parceria_social:', error.message);
        if (error.hint) console.log('Hint:', error.hint);
        if (error.details) console.log('Details:', error.details);
    } else {
        console.log('✅ Selection successful');
        if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, trying to get column names from schema...');
            // In case table is empty, we can't easily get keys from data[0]
            // But we can try an insert that fails to see columns or something else
            // Or better, just try to select 'descricao' specifically
            const { error: descError } = await supabase.from('cupons_parceria_social').select('descricao').limit(1);
            if (descError) {
                console.error('❌ Descricao column check failed:', descError.message);
            } else {
                console.log('✅ Descricao column exists');
            }
        }
    }
}

inspect();
