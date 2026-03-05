import pkg from '@supabase/supabase-js';
const { createClient } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedTestUsers() {
    console.log('🚀 Starting test user seed...');

    // 1. Get Project ID
    const { data: projects, error: projError } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', 'growth-experience-triunfo')
        .limit(1);

    if (projError) {
        console.error('Error fetching project:', projError);
        process.exit(1);
    }

    const projectId = projects[0]?.id;
    if (!projectId) {
        console.error('Project "growth-experience-triunfo" not found.');
        process.exit(1);
    }

    console.log(`📍 Using Project ID: ${projectId}`);

    const testUsers = [
        { id: '00000000-0000-0000-0000-000000000001', email: 'mentor@test.com', name: 'Mestre Mentor', role: 'mentor', phone: '81999990001' },
        { id: '00000000-0000-0000-0000-000000000002', email: 'startup@test.com', name: 'Fundador Inovador', role: 'startup', phone: '81999990002' },
        { id: '00000000-0000-0000-0000-000000000003', email: 'empresa@test.com', name: 'Executivo B2B', role: 'company', phone: '81999990003' },
        { id: '00000000-0000-0000-0000-000000000004', email: 'patrocinador@test.com', name: 'Sponsor Master', role: 'sponsor', phone: '81999990004' },
        { id: '00000000-0000-0000-0000-000000000005', email: 'participante@test.com', name: 'Participante Pro', role: 'participant', phone: '81999990005' }
    ];

    for (const u of testUsers) {
        console.log(`\n👤 Processing user: ${u.email}`);

        // Create in Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            id: u.id,
            email: u.email,
            password: 'growth2026',
            email_confirm: true,
            user_metadata: { name: u.name, role: u.role, phone: u.phone }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`ℹ️ Auth user ${u.email} already exists.`);
            } else {
                console.error(`❌ Error creating auth user ${u.email}:`, authError.message);
            }
        } else {
            console.log(`✅ Auth user ${u.email} created.`);
        }

        // Ensure synced in public.users (trigger should do this, but being explicit)
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                phone: u.phone
            });

        if (userError) console.error(`❌ Error syncing public.user ${u.email}:`, userError.message);

        // Seed specific tables
        if (u.role === 'mentor') {
            await supabase.from('mentores_growth_experience').upsert({
                project_id: projectId,
                user_id: u.id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                bio: 'Especialista em Growth e IA com +10 anos de experiência.',
                especialidades: ['Growth Hacking', 'IA para Negócios', 'Vendas B2B'],
                status: 'aprovado'
            }, { onConflict: 'email' });
        }

        if (u.role === 'startup') {
            await supabase.from('startups_arena_pitch').upsert({
                project_id: projectId,
                user_id: u.id,
                nome_startup: 'TechFlow AI',
                email: u.email,
                telefone: u.phone,
                setor: 'SaaS / AI',
                estagio: 'Traction',
                descricao_startup: 'Otimização de fluxos de trabalho com IA generativa.',
                status: 'selecionada'
            }, { onConflict: 'email' });
        }

        if (u.role === 'company') {
            await supabase.from('rodada_negocios_b2b').upsert({
                project_id: projectId,
                user_id: u.id,
                nome_empresa: 'Global Logistics S.A.',
                email: u.email,
                telefone: u.phone,
                setor: 'Logística',
                produtos_servicos: 'Soluções de transporte e armazenagem inteligente.',
                tipo_interesse: 'todos',
                status: 'confirmada'
            }, { onConflict: 'email' });
        }

        if (u.role === 'sponsor') {
            await supabase.from('sponsors').upsert({
                project_id: projectId,
                user_id: u.id,
                company_name: 'Titan Ventures',
                contact_name: u.name,
                contact_email: u.email,
                contact_phone: u.phone,
                level: 'diamond',
                status: 'closed',
                investment: 50000
            }, { onConflict: 'id' });
        }

        // Notifications
        await supabase.from('notifications').insert({
            project_id: projectId,
            user_id: u.id,
            title: 'Bem-vindo ao Growth Experience!',
            message: `Seu painel de ${u.role} está pronto.`,
            type: 'success'
        });
    }

    console.log('\n✨ Seed completed successfully!');
}

seedTestUsers().catch(err => {
    console.error('Fatal error during seed:', err);
    process.exit(1);
});
