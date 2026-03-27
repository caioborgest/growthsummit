import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('check_ins').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}
run();
