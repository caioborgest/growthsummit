import pkg from '@supabase/supabase-js';
const { createClient } = pkg;
import fs from 'fs';
import path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve('.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function resetAuth() {
    const testEmails = ['mentor@test.com', 'startup@test.com', 'empresa@test.com', 'patrocinador@test.com', 'participante@test.com'];

    console.log('🔄 Cleaning up and recreating test users via Admin API...');

    for (const email of testEmails) {
        // Find existing
        const { data: users } = await supabase.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === email);

        if (existing) {
            console.log(`🗑️ Deleting existing user: ${email}`);
            await supabase.auth.admin.deleteUser(existing.id);
        }

        console.log(`🆕 Creating user: ${email}`);
        const { error } = await supabase.auth.admin.createUser({
            email,
            password: 'growth2026',
            email_confirm: true,
            user_metadata: { name: email.split('@')[0], role: email.split('@')[0] === 'empresa' ? 'company' : email.split('@')[0] }
        });

        if (error) console.error(`❌ Error: ${error.message}`);
        else console.log(`✅ Success: ${email}`);
    }
}

resetAuth();
