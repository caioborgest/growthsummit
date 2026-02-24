import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extend jsPDF with autotable types for TypeScript
declare module 'jspdf' {
    interface jsPDF {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        autoTable: (options: any) => jsPDF;
    }
}

/**
 * Gera um relatório de inscrições em PDF
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateInscricoesReport = (registrations: any[], projectName: string) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    // Cabeçalho Premium
    doc.setFontSize(22);
    doc.setTextColor(255, 112, 67); // brand-orange-coral
    doc.text('Relatório de Inscrições', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);
    doc.text(`Total de Inscritos: ${registrations.length}`, 14, 40);

    // Colunas da Tabela
    const tableColumn = ["Nome", "Email", "Telefone", "Tipo", "Status Pgto", "Data"];
    const tableRows: any[][] = [];

    registrations.forEach(reg => {
        const regData = [
            reg.nome || reg.name || '---',
            reg.email || '---',
            reg.telefone || reg.phone || '---',
            reg.ticketType || reg.tipo_inscricao || 'standard',
            (reg.status_pagamento || reg.paymentStatus || '---').toUpperCase(),
            reg.createdAt ? format(new Date(reg.createdAt), 'dd/MM/yyyy') : '---'
        ];
        tableRows.push(regData);
    });

    doc.autoTable({
        startY: 48,
        head: [tableColumn],
        body: tableRows,
        headStyles: {
            fillColor: [255, 112, 67],
            fontSize: 10,
            halign: 'center'
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { top: 45 },
        didDrawPage: (data: any) => {
            // Rodapé
            const str = 'Página ' + doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
    });

    doc.save(`relatorio-inscricoes-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera um relatório financeiro resumido em PDF
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateFinanceiroReport = (transactions: any[], projectName: string) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(34, 197, 94); // green-500
    doc.text('Relatório Financeiro', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);

    const tableColumn = ["Descrição", "Tipo", "Categoria", "Valor", "Data"];
    const tableRows: any[][] = [];

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;

        const rowData = [
            t.description || '---',
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.category || '---',
            `R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '---'
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [34, 197, 94] },
        bodyStyles: { fontSize: 9 },
    });

    const finalY = (doc as any).lastAutoTable.cursor.y || 50;

    doc.setDrawColor(200);
    doc.line(14, finalY + 5, 196, finalY + 5);

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Total Receitas:`, 14, finalY + 15);
    doc.setTextColor(34, 197, 94);
    doc.text(`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, finalY + 15, { align: 'right' });

    doc.setTextColor(80);
    doc.text(`Total Despesas:`, 14, finalY + 22);
    doc.setTextColor(239, 68, 68); // red-500
    doc.text(`R$ ${totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, finalY + 22, { align: 'right' });

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`SALDO FINAL:`, 14, finalY + 35);
    doc.setTextColor(totalIncome - totalExpense >= 0 ? [34, 197, 94] : [239, 68, 68]);
    doc.text(`R$ ${(totalIncome - totalExpense).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, finalY + 35, { align: 'right' });

    doc.save(`relatorio-financeiro-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera um relatório de mentorias em PDF
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateMentoriasReport = (sessions: any[], projectName: string) => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // blue-500
    doc.text('Relatório de Mentorias', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Evento: ${projectName}`, 14, 30);
    doc.text(`Gerado em: ${dateStr}`, 14, 35);

    const tableColumn = ["Mentor", "Mentorado", "Data/Hora", "Status", "Tópico"];
    const tableRows: any[][] = [];

    sessions.forEach(s => {
        const rowData = [
            s.mentorName || '---',
            s.menteeName || '---',
            s.scheduledAt ? format(new Date(s.scheduledAt), 'dd/MM HH:mm') : '---',
            s.status || '---',
            s.topic || '---'
        ];
        tableRows.push(rowData);
    });

    doc.autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: [59, 130, 246] },
        bodyStyles: { fontSize: 8 },
    });

    doc.save(`relatorio-mentorias-${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

/**
 * Gera um ingresso individual em PDF
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const generateTicketPDF = (registration: any, projectName: string) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150] // Tamanho estilo crachá/ticket
    });

    // Borda e Decoração
    doc.setDrawColor(255, 112, 67);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 90, 140);

    // Cabeçalho Laranja
    doc.setFillColor(255, 112, 67);
    doc.rect(5, 5, 90, 30, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(projectName, 50, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Workshop & Training 2026', 50, 25, { align: 'center' });

    // Nome do Participante
    doc.setTextColor(40);
    doc.setFontSize(14);
    const nome = (registration.nome || registration.name || 'Participante').toUpperCase();
    doc.text(nome, 50, 50, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(registration.email || '---', 50, 56, { align: 'center' });

    // Tipo de Ingresso (Badge)
    doc.setFillColor(245, 245, 245);
    doc.rect(15, 65, 70, 15, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 112, 67);
    const tipo = registration.palestrasNoturnas ? 'EXPERIENCE PRO' : 'FREE MORNING';
    doc.text(tipo, 50, 75, { align: 'center' });

    // Protocolo e QR Code
    doc.setTextColor(150);
    doc.setFontSize(8);
    doc.text('PROTOCOLO DE ACESSO', 50, 95, { align: 'center' });
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text(`#${(registration.id || '---').slice(0, 8).toUpperCase()}`, 50, 105, { align: 'center' });

    // QR Code Box (Simulacional)
    doc.setDrawColor(200);
    doc.rect(35, 110, 30, 30);
    doc.setFontSize(6);
    doc.setTextColor(180);
    doc.text('QR CODE VALIDATION', 50, 126, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text('Apresente este documento na recepção', 50, 145, { align: 'center' });

    doc.save(`ingresso-gs2026-${(registration.id || 'ticket').slice(0, 4)}.pdf`);
};
