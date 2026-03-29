import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking projects table columns...');
    const { data, error } = await supabase.from('projects').select('*').limit(1);

    if (error) {
        console.error('FETCH ERROR:', JSON.stringify(error, null, 2));
    } else {
        const columns = data.length > 0 ? Object.keys(data[0]) : 'No data to show columns';
        console.log('COLUMNS:', columns);
        
        if (data.length > 0 && !data[0].hasOwnProperty('enable_b2b')) {
            console.warn('COLUMN enable_b2b IS MISSING IN FETCHED DATA!');
        } else if (data.length === 0) {
            console.log('Projects table is empty, cannot verify columns via select.');
        } else {
            console.log('COLUMN enable_b2b FOUND!');
        }
    }
}

check();
