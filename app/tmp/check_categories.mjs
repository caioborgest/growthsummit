
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase
        .from('programacao_evento')
        .select('category, project_id');

    if (error) {
        console.error('Error:', error);
    } else {
        const counts = data.reduce((acc, item) => {
            const key = `${item.project_id} | ${item.category}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        console.log('Category breakdown:', JSON.stringify(counts, null, 2));
    }
}

checkCategories();
