
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zczfutmymobgypbbamme.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDynamic() {
    console.log('Buscando ID do projeto Triunfo...');
    const { data: projects } = await supabase.from('projects').select('id').eq('slug', 'ge-triunfo-2026').single();

    if (!projects) {
        console.error('Projeto Triunfo não encontrado!');
        return;
    }

    const projectId = projects.id;
    console.log(`ID encontrado: ${projectId}`);

    const sessions = [
        // MANHA ANCORA
        { project_id: projectId, category: 'manha_ancora', start_time: '08:30', end_time: '10:00', title: 'Palestra: Mapa de Crescimento para MPEs', room: 'Salão Principal', type: 'talk' },
        { project_id: projectId, category: 'manha_ancora', start_time: '10:15', end_time: '11:45', title: 'Palestra + Painel: Digital e WhatsApp', room: 'Salão Principal', type: 'talk' },
        { project_id: projectId, category: 'manha_ancora', start_time: '11:45', end_time: '12:00', title: 'Encerramento Manhã e Orientações', room: 'Salão Principal', type: 'talk' },

        // TARDE ANCORA
        { project_id: projectId, category: 'tarde_ancora', start_time: '14:00', end_time: '15:30', title: 'Palestra: Do Improviso ao Plano', room: 'Salão Principal', type: 'talk' },
        { project_id: projectId, category: 'tarde_ancora', start_time: '15:45', end_time: '17:15', title: 'Talk Show: Histórias de Crescimento', room: 'Salão Principal', type: 'talk' },
        { project_id: projectId, category: 'tarde_ancora', start_time: '17:15', end_time: '17:30', title: 'Encerramento do Circuito', room: 'Salão Principal', type: 'talk' },

        // BLOCO 1
        { project_id: projectId, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Mapa de Crescimento para MPEs do Sertão do Pajeú', room: 'Salão Principal', type: 'talk', max_capacity: 80, topics: ['Desafios de gestão', 'Oportunidades locais', 'Prioridades'] },
        { project_id: projectId, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Gestão simples de caixa, estoque e preço', room: 'Sala 01', type: 'workshop', max_capacity: 20, topics: ['Fluxo de caixa', 'Precificação', 'Estoque'] },
        { project_id: projectId, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Posicionamento e ofertas para virar referência', room: 'Sala 02', type: 'workshop', max_capacity: 20, topics: ['Diferenciais locals', 'Proposta de valor'] },
        { project_id: projectId, category: 'manha_bloco_1', start_time: '08:30', end_time: '10:00', title: 'Atendimento que vende: roteiro de abordagem', room: 'Sala 03', type: 'workshop', max_capacity: 20, topics: ['Técnicas de abordagem', 'Fechamento'] },

        // MANHA CIRCULACAO
        { project_id: projectId, category: 'manha_circulacao', start_time: '10:00', end_time: '10:15', title: 'Café, Networking e Visita aos Stands', room: 'Área de Convivência', type: 'networking' },

        // BLOCO 2
        { project_id: projectId, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Como usar o digital e o WhatsApp para vender mais', room: 'Salão Principal', type: 'talk', max_capacity: 80, topics: ['Vendas digital', 'Funil simples'] },
        { project_id: projectId, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Listas de transmissão e atendimento rápido', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Instagram e Reels para negócios locais', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'manha_bloco_2', start_time: '10:15', end_time: '11:45', title: 'Primeiros passos com Inteligência Artificial', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

        // MANHA ENCERRAMENTO
        { project_id: projectId, category: 'manha_encerramento', start_time: '11:45', end_time: '12:00', title: 'Recados Finais e Chamada para Tarde', room: 'Salão Principal', type: 'talk' },

        // BLOCO 3
        { project_id: projectId, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Do improviso ao plano: estratégia para 12 meses', room: 'Salão Principal', type: 'talk', max_capacity: 80 },
        { project_id: projectId, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Plano de ação em uma página', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Vendendo para empresas e prefeituras (B2B/B2G)', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'tarde_bloco_3', start_time: '14:00', end_time: '15:30', title: 'Automatizando tarefas chatas com IA', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

        // TARDE CIRCULACAO
        { project_id: projectId, category: 'tarde_circulacao', start_time: '15:30', end_time: '15:45', title: 'Networking Orientado', room: 'Área de Convivência', type: 'networking' },

        // BLOCO 4
        { project_id: projectId, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Histórias de crescimento no Sertão', room: 'Salão Principal', type: 'talk', max_capacity: 80 },
        { project_id: projectId, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'experience do cliente', room: 'Sala 01', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Organizando as finanças para acessar crédito', room: 'Sala 02', type: 'workshop', max_capacity: 20 },
        { project_id: projectId, category: 'tarde_bloco_4', start_time: '15:45', end_time: '17:15', title: 'Transformando problemas em oportunidades', room: 'Sala 03', type: 'workshop', max_capacity: 20 },

        // TARDE ENCERRAMENTO
        { project_id: projectId, category: 'tarde_encerramento', start_time: '17:15', end_time: '17:30', title: 'Encerramento e Chamada à Ação', room: 'Salão Principal', type: 'talk' },

        // NOTURNA
        { project_id: projectId, category: 'noturna', start_time: '19:00', end_time: '19:50', title: 'Leandro Batista: Crescimento Exponencial', room: 'Salão Principal', type: 'keynote' },
        { project_id: projectId, category: 'noturna', start_time: '20:00', end_time: '21:00', title: 'Premiação Arena Pitch + Networking', room: 'Stage', type: 'keynote' },
        { project_id: projectId, category: 'noturna', start_time: '21:10', end_time: '22:30', title: 'Vanylton Matias: Inovação Corporativa', room: 'Salão Principal', type: 'keynote' },
        { project_id: projectId, category: 'noturna', start_time: '22:30', end_time: '23:00', title: 'Encerramento Oficial', room: 'Salão Principal', type: 'keynote' },

        // CIRCUITO
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Espaço Sebrae', description: 'Consultório de Negócios', partner: 'SEBRAE', type: 'circuito', max_capacity: 32, topics: ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'], metadata: { tempo: '15 min', totalDia: '250 atendimentos' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Espaço Senac', description: 'Carreira e Profissão', partner: 'SENAC', type: 'circuito', max_capacity: 25, topics: ['Carreira', 'Cursos'], metadata: { tempo: '15 min', totalDia: '200 pessoas' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Espaço Sicoob', description: 'Dinheiro e Cooperativismo', partner: 'SICOOB', type: 'circuito', max_capacity: 35, topics: ['Conta PJ', 'Crédito'], metadata: { tempo: '10 min', totalDia: '250 pessoas' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Diagnóstico Digital', description: 'Consultoria Express', partner: 'MKT Dig', type: 'circuito', max_capacity: 18, topics: ['Instagram', 'Google'], metadata: { tempo: '10 min', totalDia: '150 diagnósticos' }, color: 'neutral' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Clínica de Vendas', description: 'Aceleração Comercial', partner: 'Growth', type: 'circuito', max_capacity: 20, topics: ['Scripts', 'Objeções'], metadata: { tempo: '15 min', totalDia: '150 atendimentos' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Balcão de Emprego', description: 'Orientação Profissional', partner: 'Senac + Parceiros', type: 'circuito', max_capacity: 12, topics: ['Currículo', 'Entrevista'], metadata: { tempo: '10 min', totalDia: '100 pessoas' }, color: 'neutral' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Totem Growth', description: 'Espaço Instagramável', partner: 'Growth Experience', type: 'circuito', max_capacity: 50, topics: ['Foto Profissional'], metadata: { tempo: '05 min', totalDia: '400 interactions' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Sabores Locais', description: 'Degustação e Amostras', partner: 'Produtores Locais', type: 'circuito', max_capacity: 80, topics: ['Alimentos', 'Bebidas'], metadata: { tempo: '10 min', totalDia: '1000 degustações' }, color: 'neutral' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'IA na Prática', description: 'Tecnologia para PMEs', partner: 'Tech Station', type: 'circuito', max_capacity: 45, topics: ['Criação de Posts', 'IA'], metadata: { tempo: '15 min', totalDia: '300 pessoas' }, color: 'orange' },
        { project_id: projectId, category: 'circuito', start_time: '08:30', end_time: '17:30', title: 'Arena de Pitches', description: 'Histórias de Negócio', partner: 'Sebrae/Senac', type: 'circuito', max_capacity: 50, topics: ['Pits', 'Cases'], metadata: { tempo: '30 min', totalDia: '400 ouvintes' }, color: 'orange' },
    ];

    console.log(`Limpando programação existente para o projeto ${projectId}...`);
    await supabase.from('programacao_evento').delete().eq('project_id', projectId);

    console.log('Inserindo nova programação...');
    const { error } = await supabase.from('programacao_evento').insert(sessions);

    if (error) {
        console.error('Erro ao sincronizar:', error);
    } else {
        console.log('Sincronização concluída com sucesso!');
    }
}

syncDynamic();
