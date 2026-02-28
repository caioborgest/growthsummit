
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

async function verifyData() {
    const { data, count, error } = await supabase
        .from('programacao_evento')
        .select('*', { count: 'exact' })
        .eq('project_id', TRIUNFO_ID);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${count} sessions for project ${TRIUNFO_ID}`);
        if (data.length > 0) {
            console.log('Sample session:', JSON.stringify(data[0], null, 2));
        }
    }
}

verifyData();
