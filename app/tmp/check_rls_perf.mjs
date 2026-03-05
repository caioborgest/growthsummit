import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'programacao_evento' });
    // If RPC doesn't exist, try raw SQL via another RPC or just skip
    // Usually there's no easy way to list RLS via JS client unless there's a specific RPC.

    // Let's try to just select and see how long it takes.
    const start = Date.now();
    const { data: sessions, error: sError } = await supabase.from('programacao_evento').select('*').limit(1);
    const end = Date.now();

    fs.writeFileSync('c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\tmp\\rls_check.json', JSON.stringify({
        duration: end - start,
        error: sError,
        data: sessions
    }, null, 2));
}
checkRLS();
