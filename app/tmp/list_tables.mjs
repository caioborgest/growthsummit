
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // Queries information_schema for tables in public schema
    const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (error) {
        // Fallback for when direct information_schema access is restricted through postgREST
        // (which is common unless specifically enabled)
        console.error('Information schema access failed:', error.message);
        console.log('Trying manual check of common tables...');

        const tables = [
            'users', 'projects', 'inscricoes_growth_experience', 'programacao', 'programacao_evento',
            'startups_arena_pitch', 'rodada_negocios_b2b', 'mentores_growth_experience',
            'mentorias_agendadas', 'whatsapp_groups', 'whatsapp_group_members',
            'whatsapp_invite_logs', 'whatsapp_message_templates', 'certificates',
            'check_ins', 'audit_logs', 'cupons_parceria_social', 'registrations', 'sessions'
        ];

        for (const table of tables) {
            const { error: tableError } = await supabase.from(table).select('id').limit(1);
            if (!tableError || tableError.code !== '42P01') {
                console.log(`Table exists: ${table}`);
            }
        }
    } else {
        console.log('Tables found via info schema:');
        data.forEach(t => console.log(t.table_name));
    }
}

listTables();
