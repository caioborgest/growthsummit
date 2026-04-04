import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Carrega jsPDF e jspdf-autotable dinamicamente para evitar erro de build no Vercel
 */
async function getJsPDF() {
    const [{ jsPDF }, autoTable] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);
    return { jsPDF, autoTable: autoTable.default };
}

/**
 * Gera um relatório de inscrições em PDF
 */
export const generateInscricoesReport = async (registrations: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(255, 112, 67);
    doc.text('Relatório de Inscrições', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);
    doc.text(`Total de Inscritos: ${registrations.length}`, 14, 40);

    const tableColumn = ["Nome", "Email", "Telefone", "Tipo", "Status Pgto", "Data"];
    const tableRows = registrations.map(reg => [
        reg.nome || reg.name || '---',
        reg.email || '---',
        reg.phone || reg.phone || '---',
        reg.ticketType || 'standard',
        (reg.payment_status || reg.paymentStatus || '---').toUpperCase(),
        reg.createdAt ? format(new Date(reg.createdAt), 'dd/MM/yyyy') : '---'
    ]);

    (doc as any).autoTable({
        startY: 48,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [255, 112, 67], fontSize: 10, halign: 'center' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        margin: { top: 45 },
    });

    doc.save(`relatorio-inscricoes-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera um relatório financeiro em PDF
 */
export const generateFinanceiroReport = async (transactions: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94);
    doc.text('Relatório Financeiro', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);

    const tableColumn = ["Descrição", "Tipo", "Categoria", "Valor", "Data"];
    let totalIncome = 0;
    let totalExpense = 0;

    const tableRows = transactions.map(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
        return [
            t.description || '---',
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.category || '---',
            `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '---'
        ];
    });

    (doc as any).autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [34, 197, 94] },
        bodyStyles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.cursor.y || 50;
    doc.setFontSize(11);
    doc.text(`Total Receitas: R$ ${totalIncome.toLocaleString('pt-BR')}`, 14, finalY + 15);
    doc.text(`Total Despesas: R$ ${totalExpense.toLocaleString('pt-BR')}`, 14, finalY + 22);
    doc.setFontSize(14);
    doc.text(`SALDO: R$ ${(totalIncome - totalExpense).toLocaleString('pt-BR')}`, 14, finalY + 35);

    doc.save(`relatorio-financeiro-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera um relatório de startups com notas da Arena Pitch
 */
export const generateStartupsReport = async (startups: any[], scores: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(249, 115, 22); // orange-500
    doc.text('Relatório Arena Pitch', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);

    const tableColumn = ["Startup", "Setor", "Estágio", "Pacote", "Média Arena", "Votos"];
    const tableRows = startups.map(s => {
        const startupScores = scores.filter(sc => sc.startupId === s.id);
        const avg = startupScores.length
            ? (startupScores.reduce((acc, curr) => acc + Number(curr.totalScore), 0) / startupScores.length).toFixed(2)
            : '0.00';

        return [
            s.startupName || '---',
            s.sector || '---',
            s.stage || '---',
            s.packageType || '---',
            avg,
            startupScores.length.toString()
        ];
    });

    (doc as any).autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [249, 115, 22] },
        bodyStyles: { fontSize: 8 },
    });

    doc.save(`relatorio-arena-pitch-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera relatório de presença e check-in por sessões
 */
export const generatePresencaReport = async (sessions: any[], attendance: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(234, 179, 8); // yellow-500
    doc.text('Relatório de Presença por Atividades', 14, 22);

    const tableColumn = ["Atividade", "Local", "Horário", "Presenças"];
    const tableRows = sessions.map(s => {
        const counts = attendance.filter(a => a.sessionId === s.id).length;
        return [
            s.title || '---',
            s.room || '---',
            `${s.startTime} - ${s.endTime}`,
            counts.toString()
        ];
    });

    (doc as any).autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [234, 179, 8] },
        bodyStyles: { fontSize: 9 },
    });

    doc.save(`relatorio-presenca-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera relatório de patrocinadores e entregas
 */
export const generatePatrocinadoresReport = async (sponsors: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(168, 85, 247); // purple-500
    doc.text('Relatório de Patrocinadores', 14, 22);

    const tableColumn = ["Empresa", "Cota", "Status", "Investimento", "Entregas"];
    const tableRows = sponsors.map(s => [
        s.companyName || '---',
        s.level || '---',
        s.status || '---',
        `R$ ${(s.investment || 0).toLocaleString('pt-BR')}`,
        `${s.deliverables?.filter((d: any) => d.status === 'completed').length || 0}/${s.deliverables?.length || 0}`
    ]);

    (doc as any).autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [168, 85, 247] },
        bodyStyles: { fontSize: 9 },
    });

    doc.save(`relatorio-patrocinadores-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

export const generateMentoriasReport = async (sessions: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const tableColumn = ["Mentor", "Mentorado", "Data/Hora", "Status", "Tópico"];
    const tableRows = sessions.map(s => [
        s.mentorName || '---',
        s.menteeName || '---',
        s.scheduledAt ? format(new Date(s.scheduledAt), 'dd/MM HH:mm') : '---',
        s.status || '---',
        s.topic || '---'
    ]);

    (doc as any).autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { fontSize: 8 },
    });

    doc.save(`relatorio-mentorias-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

export const generateTicketPDF = async (registration: any, projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF({ format: [100, 150] });
    doc.setFillColor(255, 112, 67);
    doc.rect(5, 5, 90, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(projectName, 50, 15, { align: 'center' });
    doc.setTextColor(0);
    doc.text((registration.nome || 'Participante').toUpperCase(), 50, 50, { align: 'center' });
    doc.text(`#${(registration.id || '').slice(0, 8).toUpperCase()}`, 50, 100, { align: 'center' });
    doc.save(`ticket-${registration.id?.slice(0, 8)}.pdf`);
};

/**
 * Gera relatório de suporte com indicadores de qualidade e CSAT
 */
export const generateSupportReport = async (tickets: any[], stats: any, projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166); // teal-500
    doc.text('Relatório de Qualidade de Suporte', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);

    // Resumo de Qualidade
    if (stats) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Indicadores de Performance (SLA/CSAT)', 14, 45);
        doc.setFontSize(9);
        doc.text(`Total de Chamados: ${stats.total}`, 14, 52);
        doc.text(`Taxa de Resolução: ${stats.resolutionRate.toFixed(1)}%`, 14, 57);
        doc.text(`Tempo Médio de Resposta: ${stats.avgResponseTime.toFixed(0)} min`, 70, 52);
        doc.text(`Satisfação Média (CSAT): ${stats.avgRating?.toFixed(1) || '0.0'} / 5.0`, 70, 57);
    }

    const tableColumn = ["Assunto", "Categoria", "Status", "Prioridade", "Avaliação", "Data"];
    const tableRows = tickets.map(t => [
        t.subject || '---',
        t.category || 'general',
        (t.status || '---').toUpperCase(),
        (t.priority || '---').toUpperCase(),
        t.rating ? `${t.rating} / 5` : 'N/A',
        t.createdAt ? format(new Date(t.createdAt), 'dd/MM/yyyy HH:mm') : '---'
    ]);

    (doc as any).autoTable({
        startY: stats ? 65 : 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [20, 184, 166] },
        bodyStyles: { fontSize: 8 },
    });

    doc.save(`relatorio-suporte-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera relatório de sorteios e ganhadores
 */
export const generateRafflesReport = async (raffles: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(255, 112, 67); // orange-600
    doc.text('Relatório de Sorteios e Premiações', 14, 22);

    const tableColumn = ["Sorteio", "Tipo", "Status", "Ganhador", "ID Vencedor"];
    const tableRows = raffles.map(r => [
        r.name || '---',
        r.type === 'realtime_qr' ? 'QR Real-time' : 'Check-in Stand',
        (r.status || '---').toUpperCase(),
        r.winner_name || '---',
        r.winnerRegistrationId?.slice(0, 8) || '---'
    ]);

    (doc as any).autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [255, 112, 67] },
        bodyStyles: { fontSize: 9 },
    });

    doc.save(`relatorio-sorteios-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera relatório de engajamento nos stands (lead generation)
 */
export const generateStandsReport = async (stands: any[], checkins: any[], projectName: string) => {
    const { jsPDF } = await getJsPDF();
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // blue-600
    doc.text('Relatório de Engajamento em Stands', 14, 22);

    const tableColumn = ["Stand / Empresa", "Responsável", "Total Visitas", "Leads Únicos", "Conversão"];
    const tableRows = stands.map(s => {
        const standVisits = checkins.filter(c => c.standId === s.id);
        const uniqueLeads = new Set(standVisits.map(v => v.registrationId)).size;
        
        return [
            s.name || '---',
            s.responsavel || '---',
            standVisits.length.toString(),
            uniqueLeads.toString(),
            `${uniqueLeads > 0 ? ((uniqueLeads / standVisits.length) * 100).toFixed(0) : 0}%`
        ];
    });

    (doc as any).autoTable({
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { fontSize: 9 },
    });

    doc.save(`relatorio-stands-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};
