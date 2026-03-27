import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking raffles table ---');
    try {
        const { data, error } = await supabase.from('raffles').select('*').limit(1);

        if (error) {
            console.error('Initial select * ERROR:', error.message, error.code);
        } else {
            console.log('Success selecting * from raffles');
            if (data && data.length > 0) {
                console.log('Columns found:', Object.keys(data[0]));
            } else {
                console.log('Table is empty. Checking via RPC or trying to insert with project_id...');
                const { error: insertError } = await supabase.from('raffles').insert([{ 
                    project_id: '00000000-0000-0000-0000-000000000000',
                    name: 'TEST_SNAKE',
                    type: 'realtime_qr'
                }]);
                if (insertError) {
                    console.error('Insert with project_id ERROR:', insertError.message, insertError.code);
                } else {
                    console.log('Insert with project_id SUCCESS!');
                }
                
                const { error: insertErrorCamel } = await supabase.from('raffles').insert([{ 
                    projectId: '00000000-0000-0000-0000-000000000000',
                    name: 'TEST_CAMEL',
                    type: 'realtime_qr'
                }]);
                if (insertErrorCamel) {
                    console.error('Insert with projectId ERROR:', insertErrorCamel.message, insertErrorCamel.code);
                } else {
                    console.log('Insert with projectId SUCCESS!');
                }
            }
        }
    } catch (e) {
        console.error('FETCH ERROR:', e);
    }
}

check();
