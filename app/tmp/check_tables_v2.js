
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function checkStructure() {
    console.log('--- Checking Table Structure ---');

    const tables = ['profiles', 'mentores_growth_experience', 'notifications'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`Error: ${error.code} - ${error.message}`);
            if (error.code === '42P01') {
                console.log('Result: TABLE DOES NOT EXIST');
            }
        } else {
            console.log('Result: Table exists');
            if (data && data.length > 0) {
                console.log(`Columns: ${Object.keys(data[0]).join(', ')}`);
            } else {
                console.log('Table is empty, trying a probe query...');
                // Try to trigger a "column does not exist" error to see what DOES exist
                const { error: probeError } = await supabase.from(table).select('non_existent_column_123').limit(1);
                console.log(`Probe Error: ${probeError?.message}`);
            }
        }
    }
}

checkStructure();
