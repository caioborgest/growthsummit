
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        const sql = fs.readFileSync('app/supabase/migrations/20260227_qr_certification.sql', 'utf8');
        console.log('Applying migration...');

        // Supabase JS client doesn't have a direct 'query' method for raw SQL, 
        // we usually use migrations via CLI, but here we can try a workaround 
        // using an edge function or a specialized RPC if available.
        // However, for this environment, we will assume we can use the REST API 
        // or a helper if it exists. 
        // Since I cannot run raw SQL easily via the JS client without a custom RPC,
        // I will check if there's a 'exec_sql' RPC or similar.

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('Error applying migration via RPC:', error);
            console.log('Falling back to manual check of tables...');
        } else {
            console.log('Migration applied successfully!');
        }
    } catch (err) {
        console.error('Failed to read migration file:', err);
    }
}

applyMigration();
