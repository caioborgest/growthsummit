
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TRIUNFO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const sessions = [
    // MANHA ANCORA
    { project_id: TRIUNFO_ID, category: 'manha_ancora', start_time: '08:30', title: 'Palestra: Mapa de Crescimento para MPEs', room: 'Salão Principal', type: 'talk' },
    { project_id: TRIUNFO_ID, category: 'manha_ancora', start_time: '10:15', title: 'Palestra + Painel: Digital e WhatsApp', room: 'Salão Principal', type: 'talk' },
    { project_id: TRIUNFO_ID, category: 'manha_ancora', start_time: '11:45', title: 'Encerramento Manhã e Orientações', room: 'Salão Principal', type: 'talk' },

    // TARDE ANCORA
    { project_id: TRIUNFO_ID, category: 'tarde_ancora', start_time: '14:00', title: 'Palestra: Do Improviso ao Plano', room: 'Salão Principal', type: 'talk' },
    { project_id: TRIUNFO_ID, category: 'tarde_ancora', start_time: '15:45', title: 'Talk Show: Histórias de Crescimento', room: 'Salão Principal', type: 'talk' },
    { project_id: TRIUNFO_ID, category: 'tarde_ancora', start_time: '17:15', title: 'Encerramento do Circuito', room: 'Salão Principal', type: 'talk' },

    // BLOCO 1
    { project_id: TRIUNFO_ID, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Mapa de Crescimento para MPEs do Sertão do Pajeú', room: 'Salão Principal', type: 'talk', max_capacity: 80, topics: ['Desafios de gestão', 'Oportunidades locais', 'Prioridades'] },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Gestão simples de caixa, estoque e preço', room: 'Sala 01', type: 'workshop', max_capacity: 20, topics: ['Fluxo de caixa', 'Precificação', 'Estoque'] },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Posicionamento e ofertas para virar referência', room: 'Sala 02', type: 'workshop', max_capacity: 20, topics: ['Diferenciais locals', 'Proposta de valor'] },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Atendimento que vende: roteiro de abordagem', room: 'Sala 03', type: 'workshop', max_capacity: 20, topics: ['Técnicas de abordagem', 'Fechamento'] },

    // MANHA CIRCULACAO
    { project_id: TRIUNFO_ID, category: 'manha_circulacao', start_time: '10:00', end_time: '10:15', title: 'Café, Networking e Visita aos Stands', room: 'Área de Convivência', type: 'networking' },

    // BLOCO 2
    { project_id: TRIUNFO_ID, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Como usar o digital e o WhatsApp para vender mais', room: 'Salão Principal', type: 'talk', max_capacity: 80, topics: ['Vendas digitais', 'Funil simples'] },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Listas de transmissão e atendimento rápido', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Instagram e Reels para negócios locais', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Primeiros passos com Inteligência Artificial', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

    // MANHA ENCERRAMENTO
    { project_id: TRIUNFO_ID, category: 'manha_encerramento', start_time: '11:45', end_time: '12:00', title: 'Recados Finais e Chamada para Tarde', room: 'Salão Principal', type: 'talk' },

    // BLOCO 3
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Do improviso ao plano: estratégia para 12 meses', room: 'Salão Principal', type: 'talk', max_capacity: 80 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Plano de ação em uma página', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Vendendo para empresas e prefeituras (B2B/B2G)', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Automatizando tarefas chatas com IA', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

    // TARDE CIRCULACAO
    { project_id: TRIUNFO_ID, category: 'tarde_circulacao', start_time: '15:30', end_time: '15:45', title: 'Networking Orientado', room: 'Área de Convivência', type: 'networking' },

    // BLOCO 4
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Histórias de crescimento no Sertão', room: 'Salão Principal', type: 'talk', max_capacity: 80 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'experience do cliente', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Organizando as finanças para acessar crédito', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
    { project_id: TRIUNFO_ID, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Transformando problemas em oportunidades', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

    // TARDE ENCERRAMENTO
    { project_id: TRIUNFO_ID, category: 'tarde_encerramento', start_time: '17:15', end_time: '17:30', title: 'Encerramento e Chamada à Ação', room: 'Salão Principal', type: 'talk' },

    // NOTURNA
    { project_id: TRIUNFO_ID, category: 'noturna', start_time: '19:00', title: 'Leandro Batista: Crescimento Exponencial', room: 'Salão Principal', type: 'keynote' },
    { project_id: TRIUNFO_ID, category: 'noturna', start_time: '20:00', title: 'Premiação Arena Pitch + Networking', room: 'Stage', type: 'keynote' },
    { project_id: TRIUNFO_ID, category: 'noturna', start_time: '21:10', title: 'Vanylton Matias: Inovação Corporativa', room: 'Salão Principal', type: 'keynote' },
    { project_id: TRIUNFO_ID, category: 'noturna', start_time: '22:30', title: 'Encerramento Oficial', room: 'Salão Principal', type: 'keynote' },

    // CIRCUITO
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Espaço Sebrae', description: 'Consultório de Negócios', partner: 'SEBRAE', type: 'circuito', max_capacity: 32, topics: ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'], metadata: { tempo: '15 min', totalDia: '250 atendimentos' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Espaço Senac', description: 'Carreira e Profissão', partner: 'SENAC', type: 'circuito', max_capacity: 25, topics: ['Carreira', 'Cursos'], metadata: { tempo: '15 min', totalDia: '200 pessoas' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Espaço Sicoob', description: 'Dinheiro e Cooperativismo', partner: 'SICOOB', type: 'circuito', max_capacity: 35, topics: ['Conta PJ', 'Crédito'], metadata: { tempo: '10 min', totalDia: '250 pessoas' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Diagnóstico Digital', description: 'Consultoria Express', partner: 'MKT Dig', type: 'circuito', max_capacity: 18, topics: ['Instagram', 'Google'], metadata: { tempo: '10 min', totalDia: '150 diagnósticos' }, color: 'neutral' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Clínica de Vendas', description: 'Aceleração Comercial', partner: 'Growth', type: 'circuito', max_capacity: 20, topics: ['Scripts', 'Objeções'], metadata: { tempo: '15 min', totalDia: '150 atendimentos' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Balcão de Emprego', description: 'Orientação Profissional', partner: 'Senac + Parceiros', type: 'circuito', max_capacity: 12, topics: ['Currículo', 'Entrevista'], metadata: { tempo: '10 min', totalDia: '100 pessoas' }, color: 'neutral' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Totem Growth', description: 'Espaço Instagramável', partner: 'Growth Experience', type: 'circuito', max_capacity: 50, topics: ['Foto Profissional'], metadata: { tempo: '05 min', totalDia: '400 interações' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Sabores Locais', description: 'Degustação e Amostras', partner: 'Produtores Locais', type: 'circuito', max_capacity: 80, topics: ['Alimentos', 'Bebidas'], metadata: { tempo: '10 min', totalDia: '1000 degustações' }, color: 'neutral' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'IA na Prática', description: 'Tecnologia para PMEs', partner: 'Tech Station', type: 'circuito', max_capacity: 45, topics: ['Criação de Posts', 'IA'], metadata: { tempo: '15 min', totalDia: '300 pessoas' }, color: 'orange' },
    { project_id: TRIUNFO_ID, category: 'circuito', title: 'Arena de Pitches', description: 'Histórias de Negócio', partner: 'Sebrae/Senac', type: 'circuito', max_capacity: 50, topics: ['Pits', 'Cases'], metadata: { tempo: '30 min', totalDia: '400 ouvintes' }, color: 'orange' },
];

async function sync() {
    console.log('Iniciando sincronização da programação...');

    // Limpar programação atual (opcional, mas recomendado para evitar duplicidade neste caso específico de "sync fiel")
    const { error: deleteError } = await supabase
        .from('programacao_evento')
        .delete()
        .eq('project_id', TRIUNFO_ID);

    if (deleteError) {
        console.error('Erro ao limpar programação:', deleteError);
    } else {
        console.log('Programação anterior limpa.');
    }

    // Inserir nova programação
    const { data, error } = await supabase
        .from('programacao_evento')
        .insert(sessions);

    if (error) {
        console.error('Erro ao sincronizar:', error);
    } else {
        console.log('Sincronização concluída com sucesso!');
    }
}

sync();
