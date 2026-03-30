import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '' // Using anon key might not work for rpc if RLS is tight, but let's try
);

async function checkSchema() {
  console.log('Checking notifications table...');
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error selecting from notifications:', error);
  } else {
    console.log('Notifications sample row:', data);
  }

  console.log('\nChecking columns via RPC (if exists)...');
  // Attempt to select multiple columns that might be missing
  const { error: colError } = await supabase
    .from('notifications')
    .select('id, user_id, project_id, title, message, type, read, action_url, metadata, created_at')
    .limit(1);

  if (colError) {
    console.error('Missing columns detected in notifications:', colError.message);
  } else {
    console.log('All expected columns exist in notifications.');
  }
}

checkSchema();
