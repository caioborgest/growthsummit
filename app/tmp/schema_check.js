
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

async function checkSchema() {
    let output = '--- Schema Check ---\n';

    // Check users table
    const { data: userData, error: userError } = await supabase.from('users').select('*').limit(1);
    if (userError) {
        output += `Users table error: ${JSON.stringify(userError)}\n`;
    } else if (userData && userData.length > 0) {
        output += `Users columns: ${Object.keys(userData[0]).join(', ')}\n`;
    } else {
        output += `Users table empty or not accessible.\n`;
        // Try to get columns anyway via a fake query
        const { error: colError } = await supabase.from('users').select('non_existent_column').limit(0);
        output += `Users col check probe: ${JSON.stringify(colError)}\n`;
    }

    // Check profiles table
    const { data: profData, error: profError } = await supabase.from('profiles').select('*').limit(1);
    if (profError) {
        output += `Profiles table error: ${JSON.stringify(profError)}\n`;
    } else if (profData && profData.length > 0) {
        output += `Profiles columns: ${Object.keys(profData[0]).join(', ')}\n`;
    } else {
        output += `Profiles table empty or not accessible.\n`;
    }

    // Check mentor table
    const { data: mentorData, error: mentorError } = await supabase.from('mentores_growth_experience').select('*').limit(1);
    if (mentorError) {
        output += `Mentores table error: ${JSON.stringify(mentorError)}\n`;
    } else if (mentorData && mentorData.length > 0) {
        output += `Mentores columns: ${Object.keys(mentorData[0]).join(', ')}\n`;
    }

    fs.writeFileSync('c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\tmp\\schema_check_results.txt', output);
}

checkSchema();
