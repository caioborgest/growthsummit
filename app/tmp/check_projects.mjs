
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
    try {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) {
            console.error('Projects Error:', error.message);
        } else {
            console.log('Projects Count:', data.length);
            data.forEach(p => console.log(`Project: ${p.name} (Slug: ${p.slug})`));
        }
    } catch (e) {
        console.error('Global Catch Error:', e.message);
    }
}

checkProjects();
