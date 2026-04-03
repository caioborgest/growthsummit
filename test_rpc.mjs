import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xeuqtxxhncvechrxerqw.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'dummy';

// We just want to see the error, so we create a dummy client if we don't know the key
// Actually, the user has a .env file. Let's read it.
import fs from 'fs';
import path from 'path';

let envUrl = SUPABASE_URL;
let envKey = SUPABASE_ANON_KEY;

try {
  const envContent = fs.readFileSync(path.join(process.cwd(), 'app', '.env.local'), 'utf-8');
  const vars = envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) envUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) envKey = line.split('=')[1].trim();
  });
} catch (e) {
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), 'app', '.env'), 'utf-8');
    const vars = envContent.split('\n').forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) envUrl = line.split('=')[1].trim();
      if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) envKey = line.split('=')[1].trim();
    });
  } catch (e) {}
}

const supabase = createClient(envUrl, envKey);

async function run() {
  const payload = {
      p_project_id: "8f56ac73-950c-4ad8-82db-9ea22e2eb9b8",
      p_user_id: null,
      p_nome: "Teste",
      p_email: "teste@teste.com",
      p_telefone: "11999999999",
      p_cpf: "11122233344",
      p_session_ids: [],
      p_tipo_inscricao: "standard",
      p_valor_pago: 0,
      p_status_pagamento: "pago",
      p_status: "ativo",
      p_evento: "Growth Experience",
      p_palestras_noturnas: false,
      p_tipo_atividade: null,
      p_sala_atividade: null,
      p_horario_atividade: null,
      p_nivel_atividade: null,
      p_indicacao_tipo: "nenhum",
      p_indicacao_nome: null,
      p_codigo_social: null,
      p_codigo_palestra: null,
      p_extra_data: {},
      p_lote_id: null,
      p_voucher_empresa: null
  };

  console.log("Calling register_participant_with_slots with:", payload);
  const { data, error } = await supabase.rpc('register_participant_with_slots', payload);

  console.log("Result:", data);
  console.log("Error:", error);
}

run();
