import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let envUrl = process.env.VITE_SUPABASE_URL || 'https://xeuqtxxhncvechrxerqw.supabase.co';
let envKey = process.env.VITE_SUPABASE_ANON_KEY || 'dummy';

try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('VITE_SUPABASE_URL=')) envUrl = line.split('=')[1].trim();
    if (line.trim().startsWith('VITE_SUPABASE_ANON_KEY=')) envKey = line.split('=')[1].trim();
  });
} catch (e) {
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
      p_session_ids: ["8f56ac73-950c-4ad8-82db-9ea22e2eb9b8"],  // Valid UUID!
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

  console.log("Calling RPC with p_session_ids having an element!");
  const { data, error } = await supabase.rpc('register_participant_with_slots', payload);

  console.log("Error:", error);
}

run();
