import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Anon Key in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    try {
        console.log("Checking columns for 'certificates' table...");
        const { data, error } = await supabase.from('certificates').select('*').limit(1);

        if (error) {
            console.error("Error fetching from certificates:", error.message);
            // try 'certificados' as fallback to see if it hasn't been renamed
            console.log("\nTrying 'certificados' table instead...");
            const { data: data2, error: err2 } = await supabase.from('certificados').select('*').limit(1);
            if (err2) {
                console.error("Error fetching from certificados:", err2.message);
            } else {
                console.log("'certificados' columns:", Object.keys(data2 && data2.length > 0 ? data2[0] : { 'no_data': 'no_data' }));
            }
        } else {
            console.log("Success! Columns exist.");
            const columns = data && data.length > 0 ? Object.keys(data[0]) : ['No data to infer columns but table exists.'];
            console.log("Columns:", columns);
        }

    } catch (e) {
        console.error("Exception in checkTable:", e);
    }
}

checkTable();
