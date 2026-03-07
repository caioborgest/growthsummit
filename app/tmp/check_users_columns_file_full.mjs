
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

const resultFile = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\tmp\\db_check_result.txt';

async function check() {
    try {
        console.log('Fetching...');
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.log('Error fetching');
            fs.writeFileSync(resultFile, 'Error: ' + JSON.stringify(error));
        } else {
            console.log('Success');
            const columns = Object.keys(data[0] || {});
            fs.writeFileSync(resultFile, 'Columns: ' + columns.join(', '));
        }
    } catch (e) {
        console.log('Exception');
        fs.writeFileSync(resultFile, 'Exception: ' + e.message);
    }
    process.exit(0);
}

check();
