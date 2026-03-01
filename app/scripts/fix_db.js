import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

console.log('--- SCRIPT START ---');
console.log('Current Directory:', process.cwd());

// Load env variables manually from .env file
if (fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env', 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
        }
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltam variáveis de ambiente (VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
    console.log('🚀 Iniciando correção do banco de dados...');

    // 1. Aplicar o SQL do Trigger
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260301_sync_user_trigger.sql');
    if (fs.existsSync(migrationPath)) {
        console.log('📝 Lendo migração do trigger...');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Supabase JS doesn't have a direct "run arbitrary SQL" method in the client
        // unless we use an RPC that allows it. 
        // Usually we use the CLI for migrations.
        // However, we can try to use the REST API if 'pg_net' or similar is enabled, 
        // but the best way is to use the DATABASE_URL with a pg driver if possible.
    }

    // 2. Limpeza de usuários zumbis (via REST API com Service Role)
    console.log('🔍 Buscando usuários duplicados...');

    const { data: allUsers, error: fetchError } = await supabase
        .from('users')
        .select('id, email');

    if (fetchError) {
        console.error('❌ Erro ao buscar usuários:', fetchError);
        return;
    }

    // 3. Verificar contra auth.users (isso requer listUsers da Admin API)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('❌ Erro ao buscar usuários no Auth:', authError);
        return;
    }

    const authUserIds = new Set(authUsers.map(u => u.id));
    const zombies = allUsers.filter(u => !authUserIds.has(u.id));

    if (zombies.length > 0) {
        console.log(`🧹 Removendo ${zombies.length} usuários zumbis...`);
        for (const zombie of zombies) {
            const { error: delError } = await supabase
                .from('users')
                .delete()
                .eq('id', zombie.id);

            if (delError) console.error(`   ❌ Falha ao remover ${zombie.email}:`, delError.message);
            else console.log(`   ✅ Removido: ${zombie.email}`);
        }
    } else {
        console.log('✅ Nenhum usuário zumbi encontrado.');
    }

    console.log('✨ Operação concluída.');
}

fixDatabase();
