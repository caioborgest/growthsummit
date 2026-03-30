import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const env = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  env.VITE_SUPABASE_URL || '',
  env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
    console.log('Testing notifications insert...');
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // dummy
            title: 'Test',
            message: 'Test'
        });

    if (error) {
        console.error('Error detail:', error);
    } else {
        console.log('Insert success!');
    }
}

check();
