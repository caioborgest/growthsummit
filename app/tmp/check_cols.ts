
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function checkColumns() {
    const { data, error } = await supabase
        .from('programacao_evento')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error checking columns:', error);
    } else if (data && data.length > 0) {
        console.log('Columns in programacao_evento:', Object.keys(data[0]));
    } else {
        console.log('No data in programacao_evento, trying to insert a dummy row to see columns...');
        // This might fail but it will give us an error with column names if we provide wrong ones
    }
}

checkColumns();
