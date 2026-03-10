import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkFunction() {
    const { data, error } = await supabase.rpc('register_participant_with_slots', {
        p_project_id: '00000000-0000-0000-0000-000000000000',
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_nome: 'Test',
        p_email: 'test@example.com',
        p_telefone: '000',
        p_session_ids: [],
        p_tipo_inscricao: 'standard',
        p_valor_pago: 0,
        p_status_pagamento: 'pago',
        p_status: 'ativo',
        p_evento: null,
        p_palestras_noturnas: false,
        p_tipo_atividade: null,
        p_sala_atividade: null,
        p_horario_atividade: null,
        p_nivel_atividade: null,
        p_indicacao_tipo: 'nenhum',
        p_indicacao_nome: null,
        p_codigo_social: null,
        p_codigo_palestra: null,
        p_extra_data: {},
        p_lote_id: null,
        p_voucher_empresa: null
    });

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data:', data);
    }
}

checkFunction();
