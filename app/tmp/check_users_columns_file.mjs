
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            fs.writeFileSync('tmp/db_check_result.txt', 'Error: ' + JSON.stringify(error));
        } else {
            const columns = Object.keys(data[0] || {});
            fs.writeFileSync('tmp/db_check_result.txt', 'Columns: ' + columns.join(', '));
        }
    } catch (e) {
        fs.writeFileSync('tmp/db_check_result.txt', 'Exception: ' + e.message);
    }
    process.exit(0);
}

check();
