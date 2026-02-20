import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.resolve(__dirname, 'debug.log');

function log(msg) {
    const line = `${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, line);
    console.log(msg);
}

try {
    log('Starting make-admin script');

    // Manually load .env
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        log('Error: .env file not found at ' + envPath);
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            env[key] = value;
        }
    });

    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        log('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env');
        process.exit(1);
    }

    log('Supabase URL found: ' + supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = 'projetos@cbxgrowth.com.br';
    log('Promoting user: ' + email);

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (userError) {
        log('Error searching user: ' + JSON.stringify(userError));
    } else {
        log('Found user ID: ' + userData.id);
        const userId = userData.id;

        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userId);

        if (updateError) {
            log('Error updating public.users: ' + JSON.stringify(updateError));
        } else {
            log('Successfully updated public.users role');
        }

        const { error: authError } = await supabase.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: 'admin' } }
        );

        if (authError) {
            log('Error updating auth metadata: ' + JSON.stringify(authError));
        } else {
            log('Successfully updated auth metadata');
        }

        log('DONE! ' + email + ' is now admin.');
    }
} catch (err) {
    log('FATAL ERROR: ' + err.message);
    log(err.stack);
}
