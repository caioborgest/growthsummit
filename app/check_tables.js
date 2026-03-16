import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDg1NTAsImV4cCI6MjA4NTc4NDU1MH0.vi9d2V_Cvu-G3XbBQshgPX6sAtIuh8rjWk_H3qhnqJQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('🚀 Starting table check...');
  const tables = ['stands', 'stands_ge', 'ge_stands', 'checkins_stands', 'stand_checkins', 'check_ins_stands', 'startups', 'rodada_negocios_b2b', 'mentores_growth_experience'];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`✅ Table exists: ${table}`);
      } else {
        console.log(`❌ Table missing: ${table} (${error.message})`);
      }
    } catch (e) {
      console.log(`💥 Error checking ${table}: ${e.message}`);
    }
  }
}

checkTables();
