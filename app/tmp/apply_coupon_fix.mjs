
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('--- Applying Migration ---');
    const migrationPath = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\supabase\\migrations\\20260307_add_descricao_to_cupons.sql';

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('SQL read successfully.');

        // Attempt to run via exec_sql RPC (if it exists)
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ RPC exec_sql failed:', error.message);
            console.log('Reason:', error.details || 'Function likely does not exist or insufficient permissions.');
            console.log('\nPlease apply the migration manually in the Supabase SQL Editor:');
            console.log(migrationPath);
        } else {
            console.log('✅ Migration applied successfully via RPC!');
            console.log('Result:', data);
        }
    } catch (err) {
        console.error('❌ Script error:', err.message);
    }
}

runMigration();
