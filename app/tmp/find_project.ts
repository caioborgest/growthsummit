
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function findProject() {
    const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('slug', 'ge-triunfo-2026')
        .single();

    if (error) {
        console.error('Error finding project:', error);
        process.exit(1);
    }

    console.log('Project ID:', data.id);
    process.exit(0);
}

findProject();
