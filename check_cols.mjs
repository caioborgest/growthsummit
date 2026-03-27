import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking mentorias_agendadas columns...');
    const { data, error } = await supabase.from('mentorias_agendadas').select().limit(1);

    if (error) {
        console.error('ERROR:', JSON.stringify(error, null, 2));
    } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : 'No data to show columns';
        console.log('COLUMNS:', columns);

        // If empty, try to get info via RPC if exists or assume missing
        if (data.length === 0) {
            console.log('Table is empty. Trying to insert a test row to see allowed columns...');
            // This might fail but will give hints in error
        }
    }
}

check();
