
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function checkAuthUsers() {
    let output = '';
    output += '--- checking auth.users via admin api ---\n';
    try {
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            output += `Error listing users: ${JSON.stringify(error)}\n`;
        } else {
            output += `Found ${data.users.length} users.\n`;
            data.users.forEach(u => {
                output += `- ${u.email} (id: ${u.id}, confirmed: ${!!u.email_confirmed_at})\n`;
            });
        }
    } catch (e) {
        output += `Exception: ${e.message}\n`;
    }

    fs.writeFileSync('c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\tmp\\check_auth_results.txt', output);
    console.log('Results written to tmp/check_auth_results.txt');
}

checkAuthUsers();
