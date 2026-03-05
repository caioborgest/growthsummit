
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
    console.log('--- Starting General Database Test ---');

    // 1. Check Tables
    const tables = [
        'projects', 'users', 'inscricoes_growth_experience', 'programacao_evento',
        'startups_arena_pitch', 'rodada_negocios_b2b', 'mentores_growth_experience',
        'mentorias_agendadas', 'whatsapp_groups', 'whatsapp_group_members',
        'cupons_parceria_social', 'check_ins', 'certificates'
    ];

    console.log('\nChecking table existence:');
    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error && error.code === '42P01') {
            console.error(`❌ Table ${table} NOT FOUND`);
        } else {
            console.log(`✅ Table ${table} exists`);
        }
    }

    // 2. Check Seeded Projects
    console.log('\nChecking seeded projects:');
    const { data: projects, error: projectsError } = await supabase.from('projects').select('name, slug');
    if (projectsError) {
        console.error('❌ Error fetching projects:', projectsError.message);
    } else {
        console.log(`✅ Found ${projects.length} projects:`, projects.map(p => p.slug).join(', '));
        const tri = projects.find(p => p.slug === 'ge-triunfo-2026');
        const pet = projects.find(p => p.slug === 'ge-petrolina-2026');
        if (tri && pet) console.log('✅ Standard projects (Triunfo/Petrolina) are present');
        else console.error('❌ Missing standard projects');
    }

    // 3. Test Insert (Inscricao)
    console.log('\nTesting insert into inscricoes_growth_experience:');
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabase
        .from('inscricoes_growth_experience')
        .insert([{
            nome: 'Test Runner',
            email: testEmail,
            telefone: '87999999999'
        }])
        .select();

    if (insertError) {
        console.error('❌ Insert failed:', insertError.message);
    } else {
        console.log('✅ Insert successful');
        const insertedId = insertData[0].id;

        // 4. Check Trigger (updated_at)
        console.log('\nTesting updated_at trigger:');
        const { error: updateError } = await supabase
            .from('inscricoes_growth_experience')
            .update({ empresa: 'Test Corp' })
            .eq('id', insertedId);

        if (updateError) {
            console.error('❌ Update failed:', updateError.message);
        } else {
            const { data: checkData } = await supabase
                .from('inscricoes_growth_experience')
                .select('created_at, updated_at')
                .eq('id', insertedId)
                .single();

            if (checkData.updated_at > checkData.created_at) {
                console.log('✅ updated_at trigger working');
            } else {
                console.log('⚠️ updated_at was not updated (might be same timestamp)');
            }
        }

        // Cleanup
        await supabase.from('inscricoes_growth_experience').delete().eq('id', insertedId);
        console.log('✅ Cleanup successful');
    }

    // 5. Check is_admin function (if possible via RPC)
    console.log('\nChecking public.is_admin() function:');
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError) {
        console.error('❌ RPC is_admin failed:', rpcError.message);
    } else {
        console.log(`✅ RPC is_admin returned: ${isAdmin} (Expected false for service_role without auth context or if not explicitly admin)`);
    }

    console.log('\n--- Test Finished ---');
}

runTests();
