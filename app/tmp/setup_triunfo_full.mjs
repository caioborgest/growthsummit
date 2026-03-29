
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xeuqtxxhncvechrxerqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldXF0eHhobmN2ZWNocnhlcnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzI1NTA2NiwiZXhwIjoyMDU4ODMwNjY2fQ.y4oVofFhT9M2pB1O_9YF3aD_6mS6Z8O-a-R9U-wN0F0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTriunfo() {
    console.log('--- Setup Growth Experience Triunfo 2026 ---');
    
    // 1. Create Project
    const project = {
        name: 'Growth Experience Triunfo 2026',
        slug: 'ge-triunfo-2026',
        type: 'growth_experience',
        description: 'GX Growth Experience Triunfo – Noite de Palestras e Negócios. Programação especial das 17h às 23h em 16 de abril de 2026 no Espaço Parque. Palestras, talk shows e networking.',
        short_description: 'Edição Triunfo-PE',
        location: 'Espaço Parque',
        city: 'Triunfo',
        state: 'PE',
        start_date: '2026-04-16',
        end_date: '2026-04-16',
        status: 'active',
        primary_color: '#FE4C38',
        ticket_price_standard: 17900, // R$ 179,00
        ticket_price_pro: 24700,
        ticket_price_vip: 50000,
        max_registrations: 300,
        enable_b2b: false,
        enable_mentoring: false,
        enable_startups: false,
        enable_check_in: true,
        public_content: {
            heroTitle: 'Growth Experience Triunfo 2026',
            heroSubtitle: 'O MAIOR EVENTO DE CRESCIMENTO DO SERTÃO DO PAJEÚ',
            vagas: [
                { nome: 'DIAMANTE', espaco: '10m x 10m', ingressos: 15, vagas: 2 },
                { nome: 'OURO', espaco: '5m x 12m', ingressos: 10, vagas: 3 },
                { nome: 'PRATA', espaco: '5m x 3m', ingressos: 6, vagas: 13 }
            ],
            palestrantes: [
                { nome: 'Jeronimo Freire', cargo: 'Consultor', tema: 'Gestão e Liderança' },
                { nome: 'Leandro Batista', cargo: 'CEO Fitness Exclusive', tema: 'Talk Show: Experiências' }
            ]
        }
    };

    console.log('1. Inserindo/Atualizando Projeto...');
    const { data: pData, error: pError } = await supabase
        .from('projects')
        .upsert(project, { onConflict: 'slug' })
        .select()
        .single();

    if (pError) {
        console.error('Erro ao criar projeto:', pError);
        return;
    }
    const projectId = pData.id;
    console.log('✅ Projeto criado/atualizado ID:', projectId);

    // 2. Setup Batch Registration Coupon (30% for 5+)
    console.log('2. Configurando Lote (30% desc para 5+)...');
    const loteCoupon = {
        project_id: projectId,
        codigo: 'LOTE-EQUIPE-30',
        indicacao_tipo: 'empresa',
        indicacao_nome: 'Lote Corporativo',
        porcentagem_desconto: 30,
        uso_limite: 100,
        uso_atual: 0,
        ativo: true,
        descricao: 'Desconto automático para grupos acima de 5 pessoas.'
    };
    await supabase.from('cupons_parceria_social').upsert(loteCoupon, { onConflict: 'projeto_id,codigo' });
    console.log('✅ Cupom de Lote configurado.');

    // 3. Setup Programming (Sessions)
    console.log('3. Inserindo Programação...');
    const sessions = [
        { project_id: projectId, title: 'Credenciamento e Exposição', start_time: '2026-04-16T17:00:00Z', end_time: '2026-04-16T18:00:00Z', type: 'network', category: 'Networking' },
        { project_id: projectId, title: 'Jeronimo Freire: Gestão e Liderança', start_time: '2026-04-16T18:00:00Z', end_time: '2026-04-16T18:50:00Z', type: 'lecture', category: 'Palestra' },
        { project_id: projectId, title: 'Talk Show: Experiências no Interior', start_time: '2026-04-16T19:00:00Z', end_time: '2026-04-16T19:50:00Z', type: 'talk', category: 'Talk Show' },
        { project_id: projectId, title: 'Network e Encerramento', start_time: '2026-04-16T20:00:00Z', end_time: '2026-04-16T21:00:00Z', type: 'network', category: 'Networking' }
    ];

    // Delete existing sessions to avoid duplicates
    await supabase.from('programacao_evento').delete().eq('project_id', projectId);
    const { error: sError } = await supabase.from('programacao_evento').insert(sessions);
    
    if (sError) {
        console.error('Erro ao inserir sessões:', sError);
    } else {
        console.log('✅ Programação inserida com sucesso.');
    }

    console.log('\n--- SETUP CONCLUÍDO COM SUCESSO! ---');
}

setupTriunfo();
