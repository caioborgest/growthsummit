import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

const sql = `
-- Fix RLS for coupons and vouchers allowing anonymous read access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir leitura anonima de cupons" ON public.cupons_parceria_social;
    DROP POLICY IF EXISTS "Permitir leitura anonima de lotes" ON public.lotes_inscricao_empresa;
    DROP POLICY IF EXISTS "Permitir leitura anonima de parceiros" ON public.parceiros;
    
    CREATE POLICY "Permitir leitura anonima de cupons" ON public.cupons_parceria_social 
    FOR SELECT TO anon, authenticated
    USING (ativo = true);

    CREATE POLICY "Permitir leitura anonima de lotes" ON public.lotes_inscricao_empresa 
    FOR SELECT TO anon, authenticated
    USING (status_pagamento IN ('pago', 'paid'));

    CREATE POLICY "Permitir leitura anonima de parceiros" ON public.parceiros 
    FOR SELECT TO anon, authenticated
    USING (status = 'active');
EXCEPTION
    WHEN undefined_table OR undefined_object THEN
        NULL;
END $$;

CREATE OR REPLACE FUNCTION public.register_participant_with_slots(
        p_project_id UUID,
        p_user_id UUID,
        p_nome TEXT,
        p_email TEXT,
        p_telefone TEXT,
        p_session_ids UUID [],
        p_tipo_inscricao TEXT DEFAULT 'standard',
        p_valor_pago NUMERIC DEFAULT 0,
        p_status_pagamento TEXT DEFAULT 'pago',
        p_status TEXT DEFAULT 'ativo',
        p_evento TEXT DEFAULT NULL,
        p_palestras_noturnas BOOLEAN DEFAULT FALSE,
        p_tipo_atividade TEXT DEFAULT NULL,
        p_sala_atividade TEXT DEFAULT NULL,
        p_horario_atividade TEXT DEFAULT NULL,
        p_nivel_atividade TEXT DEFAULT NULL,
        p_indicacao_tipo TEXT DEFAULT 'nenhum',
        p_indicacao_nome TEXT DEFAULT NULL,
        p_codigo_social TEXT DEFAULT NULL,
        p_codigo_palestra TEXT DEFAULT NULL,
        p_extra_data JSONB DEFAULT '{}'::JSONB,
        p_lote_id UUID DEFAULT NULL,
        p_voucher_empresa TEXT DEFAULT NULL
    ) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE v_inscricao_id UUID;
v_session RECORD;
v_session_id UUID;
v_full_sessions TEXT [] := '{}';
v_lote RECORD;
BEGIN -- ── ETAPA 0: Verificar Lote de Equipe (se fornecido)
IF p_lote_id IS NOT NULL THEN
SELECT id,
    quantidade_vagas,
    vagas_utilizadas,
    status_pagamento INTO v_lote
FROM public.lotes_inscricao_empresa
WHERE id = p_lote_id FOR
UPDATE;
IF NOT FOUND THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_FOUND',
    'message',
    'Lote de inscrição não encontrado.'
);
END IF;
IF v_lote.status_pagamento != 'pago' AND v_lote.status_pagamento != 'paid' THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_NOT_PAID',
    'message',
    'O pagamento deste lote ainda não foi confirmado.'
);
END IF;
IF COALESCE(v_lote.vagas_utilizadas, 0) >= v_lote.quantidade_vagas THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'BATCH_FULL',
    'message',
    'O limite de vagas deste lote já foi atingido.'
);
END IF;
END IF;
-- ── ETAPA 1: Verificar disponibilidade de vagas (com lock para evitar race condition)
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
SELECT id,
    title,
    max_vagas,
    registered_count INTO v_session
FROM public.programacao_evento
WHERE id = v_session_id::UUID FOR
UPDATE;
IF FOUND
AND v_session.max_vagas IS NOT NULL
AND v_session.max_vagas > 0 THEN IF COALESCE(v_session.registered_count, 0) >= v_session.max_vagas THEN v_full_sessions := array_append(v_full_sessions, v_session.title);
END IF;
END IF;
END LOOP;
END IF;
IF array_length(v_full_sessions, 1) > 0 THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'SESSION_FULL',
    'full_sessions',
    to_jsonb(v_full_sessions),
    'message',
    format(
        'Vagas esgotadas para: %s',
        array_to_string(v_full_sessions, ', ')
    )
);
END IF;
-- ── ETAPA 2: Inserir a inscrição
INSERT INTO public.inscricoes_growth_experience (
        project_id,
        user_id,
        nome,
        email,
        telefone,
        cursos_selecionados,
        tipo_inscricao,
        valor_pago,
        status_pagamento,
        status,
        evento,
        palestras_noturnas,
        tipo_atividade_selecionada,
        sala_atividade,
        horario_atividade,
        nivel_atividade,
        indicacao_tipo,
        indicacao_nome,
        codigo_social,
        codigo_palestra,
        cupom_palestra,
        app_instalado,
        lote_id,
        voucher_empresa,
        created_at
    )
VALUES (
        p_project_id,
        p_user_id,
        p_nome,
        p_email,
        p_telefone,
        p_session_ids,
        p_tipo_inscricao,
        p_valor_pago,
        p_status_pagamento,
        p_status,
        p_evento,
        p_palestras_noturnas,
        p_tipo_atividade,
        p_sala_atividade,
        p_horario_atividade,
        p_nivel_atividade,
        p_indicacao_tipo,
        p_indicacao_nome,
        p_codigo_social,
        p_codigo_palestra,
        p_codigo_palestra,
        false,
        p_lote_id,
        p_voucher_empresa,
        NOW()
    )
RETURNING id INTO v_inscricao_id;
-- ── ETAPA 3: Incrementar contadores
-- a) Sessões
IF p_session_ids IS NOT NULL
AND array_length(p_session_ids, 1) > 0 THEN FOREACH v_session_id IN ARRAY p_session_ids LOOP
UPDATE public.programacao_evento
SET registered_count = COALESCE(registered_count, 0) + 1
WHERE id = v_session_id::UUID;
END LOOP;
END IF;
-- b) Lote Empresa
IF p_lote_id IS NOT NULL THEN
UPDATE public.lotes_inscricao_empresa
SET vagas_utilizadas = COALESCE(vagas_utilizadas, 0) + 1
WHERE id = p_lote_id;
END IF;
-- ── RETORNO: Sucesso
RETURN jsonb_build_object(
    'success',
    true,
    'inscricao_id',
    v_inscricao_id,
    'message',
    'Inscrição realizada com sucesso'
);
EXCEPTION
WHEN unique_violation THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'ALREADY_REGISTERED',
    'message',
    'Este e-mail já está inscrito neste evento.'
);
WHEN OTHERS THEN RETURN jsonb_build_object(
    'success',
    false,
    'error',
    'DB_ERROR',
    'message',
    SQLERRM
);
END;
$$;
`;

async function run() {
    let dbUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes('postgres:Caio020689!@#$%@')) {
        dbUrl = dbUrl.replace('postgres:Caio020689!@#$%', 'postgres:Caio020689!%40%23%24%25');
    }
    // Remove the quotes if they exist around the original string
    dbUrl = dbUrl.replace(/^"|"$/g, '').replace(/^postgresql:\/\/"/, 'postgresql://');
    
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query(sql);
        console.log('RPC Function updated successfully!');
    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        await client.end();
    }
}

run();
