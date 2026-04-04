import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const FIXED_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const CODE_SLUG = 'ge-triunfo-pocket-edition-noturno-2026';

async function syncTriunfo() {
    console.log('--- Sincronizando Projeto Triunfo ---');

    // 1. Atualizar o slug e nome do projeto com o ID fixo
    const { data: proj, error: projErr } = await supabase
        .from('projects')
        .upsert({
            id: FIXED_ID,
            name: 'Growth Experience Triunfo-PE 2026',
            slug: CODE_SLUG,
            type: 'growth_experience',
            status: 'active'
        }, { onConflict: 'id' });

    if (projErr) {
        console.error('Erro ao sincronizar projeto:', projErr);
        return;
    }
    console.log('Projeto Triunfo sincronizado com slug:', CODE_SLUG);

    // 2. Garantir que as sessões estão vinculadas a esse ID
    const { data: sessions, error: sessErr } = await supabase
        .from('programacao_evento')
        .update({ project_id: FIXED_ID })
        .eq('project_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'); // No caso de já estarem certas, não muda nada
    
    // Tentar também por slug se por algum motivo project_id for texto (em algumas versões do useData)
    await supabase.from('programacao_evento').update({ project_id: FIXED_ID }).eq('project_id', 'ge-triunfo-2026');

    if (sessErr) {
        console.warn('Erro ao atualizar sessões (pode ser que já estejam certas ou a tabela esteja vazia):', sessErr);
    } else {
        console.log('Sessões de programação vinculadas ao ID fixo:', FIXED_ID);
    }

    console.log('--- Sincronização Concluída ---');
}

syncTriunfo();
