import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzYxNDIsImV4cCI6MjA5MDExMjE0Mn0.9PU5IOHvIuxbehImyG08rRD2vfqVdL_ZML6GCkyqfWE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  const tables = ['stands', 'stands_ge', 'ge_stands', 'checkins_stands', 'stand_checkins', 'check_ins_stands'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ Table exists: ${table}`);
    } else {
      console.log(`❌ Table missing: ${table} (${error.message})`);
    }
  }
}

checkTables();
