import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const TARGET_PROJECT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Starting registration alignment verification...');
  console.log(`🎯 Target Project ID: ${TARGET_PROJECT_ID}`);

  try {
    // 1. Check total registrations
    const { count: totalCount, error: countErr } = await supabase
      .from('growth_experience_registrations')
      .select('*', { count: 'exact', head: true });

    if (countErr) throw countErr;
    console.log(`📊 Total Registrations: ${totalCount}`);

    // 2. Check aligned registrations
    const { count: alignedCount, error: alignedErr } = await supabase
      .from('growth_experience_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', TARGET_PROJECT_ID);

    if (alignedErr) throw alignedErr;
    console.log(`✅ Aligned Registrations: ${alignedCount}`);

    // 3. Check orphaned registrations
    const { data: orphans, error: orphanErr } = await supabase
      .from('growth_experience_registrations')
      .select('id, name, email, project_id')
      .is('project_id', null);

    if (orphanErr) throw orphanErr;
    
    if (orphans.length > 0) {
      console.warn(`⚠️ Found ${orphans.length} registrations with NULL project_id!`);
      orphans.forEach(o => console.log(`   - ${o.name} (${o.email})`));
    } else {
      console.log('🎉 No orphaned registrations found.');
    }

    // 4. Summarize
    if (totalCount === alignedCount) {
      console.log('🚀 SUCCESS: All registrations are correctly aligned to the Triunfo project.');
    } else {
      console.log(`❌ MISMATCH: ${totalCount - alignedCount} registrations are linked to other projects or missing IDs.`);
    }

  } catch (err) {
    console.error('❌ Verification failed:', err);
  }
}

verify();
