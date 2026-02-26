
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://zczfutmymobgypbbamme.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjemZ1dG15bW9iZ3lwYmJhbW1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIwODU1MCwiZXhwIjoyMDg1Nzg0NTUwfQ.2Zv0vEXpIiNeC0aWSqTXsRSA4nvW1L6jZS5J-FdOdlU'
);

const projectSlug = 'ge-triunfo-2026';

async function migrate() {
    console.log('Starting migration for', projectSlug);

    // 1. Get Project ID (Actual UUID)
    const { data: project, error: pError } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .single();

    if (pError || !project) {
        console.error('Project not found or multiple projects found:', projectSlug, pError);
        // If exact slug fails, maybe it exists by ID already?
        // Let's use 'ge-triunfo-2026' as the fixed project_id if it's there
    }

    const projectId = project?.id || projectSlug;
    console.log('Using Project Identifier:', projectId);

    // 2. Clear existing programming for this project to avoid duplicates
    console.log('Cleaning existing programming for', projectId);
    await supabase.from('programacao_evento').delete().eq('project_id', projectId);

    const sessions = [];

    // Momentos Ancora Manhã
    [
        { horario: '08:30', atividade: 'Palestra: Mapa de Crescimento para MPEs', local: 'Salão Principal' },
        { horario: '10:15', atividade: 'Palestra + Painel: Digital e WhatsApp', local: 'Salão Principal' },
        { horario: '11:45', atividade: 'Encerramento Manhã e Orientações', local: 'Salão Principal' }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'manha_ancora',
            title: s.atividade,
            start_time: s.horario,
            end_time: s.horario,
            room: s.local,
            type: 'keynote'
        });
    });

    // Momentos Ancora Tarde
    [
        { horario: '14:00', atividade: 'Palestra: Do Improviso ao Plano', local: 'Salão Principal' },
        { horario: '15:45', atividade: 'Talk Show: Histórias de Crescimento', local: 'Salão Principal' },
        { horario: '17:15', atividade: 'Encerramento do Circuito', local: 'Salão Principal' }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'tarde_ancora',
            title: s.atividade,
            start_time: s.horario,
            end_time: s.horario,
            room: s.local,
            type: 'keynote'
        });
    });

    // Diurna Manhã: Bloco 1
    sessions.push({
        project_id: projectId,
        category: 'manha_bloco_1',
        title: 'Mapa de Crescimento para MPEs do Sertão do Pajeú',
        start_time: '08:30',
        end_time: '10:00',
        room: 'Salão Principal',
        type: 'keynote',
        max_capacity: 80,
        topics: ['Desafios de gestão, vendas e caixa', 'Oportunidades locais', 'Prioridades com poucos recursos']
    });

    [
        { horario: '08:30', numero: 1, titulo: 'Gestão simples de caixa, estoque e preço', tipo: 'Oficina de Gestão', capacidade: 20, topicos: ['Fluxo de caixa', 'Precificação', 'Controle de estoque'] },
        { horario: '08:30', numero: 2, titulo: 'Posicionamento e ofertas para virar referência', tipo: 'Workshop de Marketing', capacidade: 20, topicos: ['Diferenciais locais', 'Proposta de valor', 'Construção de ofertas'] },
        { horario: '08:30', numero: 3, titulo: 'Atendimento que vende: roteiro de abordagem', tipo: 'Oficina de Vendas', capacidade: 20, topicos: ['Técnicas de abordagem', 'Fechamento de vendas', 'Soluções para clientes'] }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'manha_bloco_1',
            title: s.titulo,
            start_time: s.horario,
            end_time: '10:00',
            room: `Sala ${s.numero}`,
            type: 'workshop',
            max_capacity: s.capacidade,
            topics: s.topicos
        });
    });

    // Diurna Manhã: Circulação 1
    sessions.push({
        project_id: projectId,
        category: 'manha_circulacao',
        title: 'Café, Networking e Visita aos Stands',
        start_time: '10:00',
        end_time: '10:15',
        room: 'Área de Stands',
        type: 'networking'
    });

    // Diurna Manhã: Bloco 2
    sessions.push({
        project_id: projectId,
        category: 'manha_bloco_2',
        title: 'Como usar o digital e o WhatsApp para vender mais',
        start_time: '10:15',
        end_time: '11:45',
        room: 'Salão Principal',
        type: 'panel',
        max_capacity: 80,
        topics: ['Vendas por mídias digitais', 'Funil simples', 'Painel regional']
    });

    [
        { horario: '10:15', numero: 1, titulo: 'Listas de transmissão e atendimento rápido', tipo: 'Oficina Marketing WhatsApp', capacidade: 20, topicos: ['Organização de listas', 'Modelos de mensagens', 'Pós-venda'] },
        { horario: '10:15', numero: 2, titulo: 'Instagram e Reels para negócios locais', tipo: 'Workshop de Redes Sociais', capacidade: 20, topicos: ['Conteúdo', 'Rotina', 'Métricas'] },
        { horario: '10:15', numero: 3, titulo: 'Primeiros passos com Inteligência Artificial', tipo: 'Oficina de IA Aplicada', capacidade: 20, topicos: ['IA no dia a dia', 'Criação de posts', 'Demonstração prática'] }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'manha_bloco_2',
            title: s.titulo,
            start_time: s.horario,
            end_time: '11:45',
            room: `Sala ${s.numero}`,
            type: 'workshop',
            max_capacity: s.capacidade,
            topics: s.topicos
        });
    });

    // Diurna Manhã: Encerramento
    sessions.push({
        project_id: projectId,
        category: 'manha_encerramento',
        title: 'Recados Finais e Chamada para Tarde',
        start_time: '11:45',
        end_time: '12:00',
        room: 'Salão Principal',
        type: 'networking'
    });

    // Diurna Tarde: Bloco 3
    sessions.push({
        project_id: projectId,
        category: 'tarde_bloco_3',
        title: 'Do improviso ao plano: estratégia para 12 meses',
        start_time: '14:00',
        end_time: '15:30',
        room: 'Salão Principal',
        type: 'keynote',
        max_capacity: 80,
        topics: ['Planejamento', 'Metas simples', 'Prioridades']
    });

    [
        { horario: '14:00', numero: 1, titulo: 'Plano de ação em uma página', tipo: 'Oficina de Planejamento', capacidade: 20, topicos: ['Canvas', 'Metas', 'Revisão'] },
        { horario: '14:00', numero: 2, titulo: 'Vendendo para empresas e prefeituras (B2B/B2G)', tipo: 'Workshop de Vendas', capacidade: 20, topicos: ['B2B', 'B2G', 'Propostas'] },
        { horario: '14:00', numero: 3, titulo: 'Automatizando tarefas chatas com IA', tipo: 'Oficina de IA para Produtividade', capacidade: 20, topicos: ['Automação', 'IA assistente', 'Checklist'] }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'tarde_bloco_3',
            title: s.titulo,
            start_time: s.horario,
            end_time: '15:30',
            room: `Sala ${s.numero}`,
            type: 'workshop',
            max_capacity: s.capacidade,
            topics: s.topicos
        });
    });

    // Diurna Tarde: Circulação 2
    sessions.push({
        project_id: projectId,
        category: 'tarde_circulacao',
        title: 'Networking Orientado',
        start_time: '15:30',
        end_time: '15:45',
        room: 'Área de Stands',
        type: 'networking'
    });

    // Diurna Tarde: Bloco 4
    sessions.push({
        project_id: projectId,
        category: 'tarde_bloco_4',
        title: 'Histórias de crescimento no Sertão',
        start_time: '15:45',
        end_time: '17:15',
        room: 'Salão Principal',
        type: 'panel',
        max_capacity: 80,
        topics: ['Cases reais', 'Gestão na prática', 'Perguntas']
    });

    [
        { horario: '15:45', numero: 1, titulo: 'Do primeiro contato ao pós-venda: experiência do cliente', tipo: 'Oficina de Experiência do Cliente', capacidade: 20, topicos: ['Jornada', 'Fidelização', 'Satisfação'] },
        { horario: '15:45', numero: 2, titulo: 'Organizando as finanças para acessar crédito', tipo: 'Workshop de Finanças', capacidade: 20, topicos: ['PF/PJ', 'Preparação para crédito', 'Indicadores'] },
        { horario: '15:45', numero: 3, titulo: 'Transformando problemas em oportunidades', tipo: 'Oficina de Inovação Prática', capacidade: 20, topicos: ['Dores locais', 'Brainstorm', 'Teste'] }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'tarde_bloco_4',
            title: s.titulo,
            start_time: s.horario,
            end_time: '17:15',
            room: `Sala ${s.numero}`,
            type: 'workshop',
            max_capacity: s.capacidade,
            topics: s.topicos
        });
    });

    // Diurna Tarde: Encerramento
    sessions.push({
        project_id: projectId,
        category: 'tarde_encerramento',
        title: 'Encerramento e Chamada à Ação',
        start_time: '17:15',
        end_time: '17:30',
        room: 'Salão Principal',
        type: 'networking'
    });

    // Night Experience
    [
        { horario: '19:00', atividade: 'Leandro Batista: Crescimento Exponencial' },
        { horario: '20:00', atividade: 'Premiação Arena Pitch + Networking' },
        { horario: '21:10', atividade: 'Vanylton Matias: Inovação Corporativa' },
        { horario: '22:30', atividade: 'Encerramento Oficial' }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'noturna',
            title: s.atividade,
            start_time: s.horario,
            end_time: s.horario,
            room: 'Palco Principal',
            type: s.atividade.includes(':') ? 'keynote' : 'networking'
        });
    });

    // Circuito de Experiências
    [
        { nome: 'Espaço Sebrae', subtitulo: 'Consultório de Negócios', parceiro: 'SEBRAE', temas: ['MEI', 'Gestão', 'Marketing', 'Vendas', 'Crédito'], cor: 'orange', tempo: '15 min' },
        { nome: 'Espaço Senac', subtitulo: 'Carreira e Profissão', parceiro: 'SENAC', temas: ['Carreira', 'Cursos', 'Mercado de Trabalho'], cor: 'orange', tempo: '15 min' },
        { nome: 'Espaço Sicoob', subtitulo: 'Dinheiro e Cooperativismo', parceiro: 'SICOOB', temas: ['Conta PJ', 'Crédito Consciente', 'Educação Financeira'], cor: 'orange', tempo: '10 min' },
        { nome: 'Diagnóstico Digital', subtitulo: 'Consultoria Express', parceiro: 'MKT Dig', temas: ['Instagram', 'Google Meu Negócio', 'WhatsApp'], cor: 'neutral', tempo: '10 min' },
        { nome: 'Clínica de Vendas', subtitulo: 'Aceleração Comercial', parceiro: 'Growth', temas: ['Scripts', 'Objeções', 'Fechamento', 'Pós-venda'], cor: 'orange', tempo: '15 min' },
        { nome: 'Balcão de Emprego', subtitulo: 'Orientação Profissional', parceiro: 'Senac + Parceiros', temas: ['Currículo', 'Entrevista', 'Postura Profissional'], cor: 'neutral', tempo: '10 min' },
        { nome: 'Totem Growth', subtitulo: 'Espaço Instagramável', parceiro: 'Growth Experience', temas: ['Foto Profissional', 'Networking', 'Social Media'], cor: 'orange', tempo: '05 min' },
        { nome: 'Sabores Locais', subtitulo: 'Degustação e Amostras', parceiro: 'Produtores Locais', temas: ['Alimentos', 'Bebidas', 'Artesanato'], cor: 'neutral', tempo: '10 min' },
        { nome: 'IA na Prática', subtitulo: 'Tecnologia para PMEs', parceiro: 'Tech Station', temas: ['Criação de Posts', 'Respostas Automáticas', 'Copywriting'], cor: 'orange', tempo: '15 min' },
        { nome: 'Arena de Pitches', subtitulo: 'Histórias de Negócio', parceiro: 'Sebrae/Senac', temas: ['Pits', 'Cases de Sucesso', 'Histórias Reais'], cor: 'orange', tempo: '30 min' }
    ].forEach(s => {
        sessions.push({
            project_id: projectId,
            category: 'circuito',
            title: s.nome,
            description: s.subtitulo,
            partner: s.parceiro,
            start_time: 'Contínuo',
            end_time: 'Contínuo',
            room: 'Área de Stands',
            type: 'circuito',
            topics: s.temas,
            color: s.cor,
            metadata: { tempo: s.tempo }
        });
    });

    console.log('Inserting', sessions.length, 'sessions into programacao_evento...');

    const { error: upsertError } = await supabase
        .from('programacao_evento')
        .insert(sessions);

    if (upsertError) {
        console.error('Error inserting sessions:', upsertError);
    } else {
        console.log('Migration completed successfully!');
    }

    process.exit(0);
}

migrate();
