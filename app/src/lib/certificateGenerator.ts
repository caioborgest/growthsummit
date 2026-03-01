import { jsPDF } from 'jspdf';

// ============================================================
// CERTIFICATE GENERATOR — Growth Experience
// Idioma: Português do Brasil
// Design: cores da marca (laranja #FE4C38 / teal #21808D)
// ============================================================

export interface CertificateTemplateData {
    /** Nome completo do participante (inserido automaticamente) */
    userName: string;
    /** Nome do evento */
    eventName: string;
    /** Cidade do evento */
    eventCity?: string;
    /** Nome da atividade (palestra, workshop, oficina, curso) */
    sessionTitle?: string;
    /** Tipo da atividade — define o rótulo em português */
    type: 'event' | 'course' | 'lecture' | 'workshop' | 'oficina';
    /** Data de realização em pt-BR (ex: "15/03/2026") */
    date: string;
    /** Código único de validação */
    certificateCode: string;
    /** Carga horária — ex: 2 */
    totalHours?: number;
    /** Base64 PNG da assinatura. Se ausente, usa linha com nome em texto. */
    signatureBase64?: string;
}

// ── Paleta da marca ────────────────────────────────────────────
const C = {
    bg: [10, 10, 15] as [number, number, number],
    orange: [254, 76, 56] as [number, number, number],
    orangeDim: [150, 45, 33] as [number, number, number],
    teal: [33, 128, 141] as [number, number, number],
    tealDim: [20, 75, 85] as [number, number, number],
    gold: [218, 165, 32] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gray: [170, 170, 180] as [number, number, number],
    dim: [90, 90, 100] as [number, number, number],
};

// ── Rótulos em português ───────────────────────────────────────
const TIPO_LABEL_ARTIGO: Record<string, string> = {
    event: 'do evento',
    lecture: 'da palestra',
    workshop: 'do workshop',
    oficina: 'da oficina',
    course: 'do curso',
};

const TIPO_TITULO: Record<string, string> = {
    event: 'PARTICIPAÇÃO NO EVENTO',
    lecture: 'PARTICIPAÇÃO NA PALESTRA',
    workshop: 'CONCLUSÃO DE WORKSHOP',
    oficina: 'CONCLUSÃO DE OFICINA',
    course: 'CONCLUSÃO DE CURSO',
};

/**
 * Gera o PDF do certificado em A4 horizontal.
 * O nome do participante, atividade, data e duração são inseridos automaticamente.
 */
export async function generateCertificatePDF(data: CertificateTemplateData): Promise<void> {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();   // 297 mm
    const H = doc.internal.pageSize.getHeight();  // 210 mm
    const cx = W / 2;

    // ── FUNDO ────────────────────────────────────────────────────
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, H, 'F');

    // Manchas de glow simuladas (círculos escuros coloridos)
    doc.setFillColor(30, 12, 10);
    doc.circle(cx, H / 2, 70, 'F');
    doc.setFillColor(10, 25, 28);
    doc.circle(40, H - 30, 30, 'F');

    // ── FAIXA LATERAL ESQUERDA (laranja) ─────────────────────────
    doc.setFillColor(...C.orange);
    doc.rect(0, 0, 14, H, 'F');

    // Ícone branco na faixa
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');

    // Escrever "GROWTH" verticalmente na faixa
    ['G', 'R', 'O', 'W', 'T', 'H'].forEach((letter, i) => {
        doc.text(letter, 7, 30 + i * 7, { align: 'center' });
    });

    // ── FAIXA LATERAL DIREITA (teal) ─────────────────────────────
    doc.setFillColor(...C.teal);
    doc.rect(W - 14, 0, 14, H, 'F');

    // ── BORDAS ───────────────────────────────────────────────────
    // Borda dourada externa
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.8);
    doc.rect(17, 7, W - 34, H - 14, 'D');

    // Borda teal interna
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.3);
    doc.rect(19, 9, W - 38, H - 18, 'D');

    // ── CABEÇALHO ────────────────────────────────────────────────
    const headerY = 28;

    // Nome do evento (topo)
    doc.setTextColor(...C.orange);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('GROWTH EXPERIENCE  ·  TRIUNFO 2026', cx, headerY - 10, { align: 'center', charSpace: 1.5 });

    // Linha separadora dourada
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.5);
    doc.line(cx - 55, headerY - 6, cx + 55, headerY - 6);

    // Tipo do certificado
    doc.setTextColor(...C.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(
        `CERTIFICADO DE ${TIPO_TITULO[data.type] || 'PARTICIPAÇÃO'}`,
        cx,
        headerY + 6,
        { align: 'center', charSpace: 0.8 }
    );

    // ── TEXTO CERTIFICAMOS ────────────────────────────────────────
    doc.setTextColor(...C.gray);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos com orgulho que', cx, headerY + 22, { align: 'center' });

    // ── NOME DO PARTICIPANTE (automático) ─────────────────────────
    const nameY = headerY + 40;

    // Linha decorativa acima
    doc.setDrawColor(...C.tealDim);
    doc.setLineWidth(0.25);
    doc.line(cx - 85, nameY - 7, cx + 85, nameY - 7);

    // Tamanho da fonte adaptativo ao comprimento do nome
    const nameFontSize = data.userName.length > 35 ? 22
        : data.userName.length > 25 ? 26
            : data.userName.length > 18 ? 30
                : 34;

    doc.setTextColor(...C.white);
    doc.setFontSize(nameFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName.toUpperCase(), cx, nameY + 4, { align: 'center' });

    // Linha decorativa abaixo
    doc.setDrawColor(...C.tealDim);
    doc.setLineWidth(0.25);
    doc.line(cx - 85, nameY + 10, cx + 85, nameY + 10);

    // ── TEXTO DA ATIVIDADE ────────────────────────────────────────
    const actY = nameY + 26;
    const artigo = TIPO_LABEL_ARTIGO[data.type] || 'do evento';

    doc.setTextColor(...C.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Linha 1: atividade
    if (data.sessionTitle && data.type !== 'event') {
        // Título da atividade em destaque (laranja)
        doc.setTextColor(...C.orange);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(`"${data.sessionTitle}"`, W - 80);
        doc.text(titleLines, cx, actY, { align: 'center' });

        // Resto do texto
        doc.setTextColor(...C.gray);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lineCount = titleLines.length;
        doc.text(
            `integrante da programação ${artigo} ${data.eventName}${data.eventCity ? ', ' + data.eventCity : ''},`,
            cx,
            actY + lineCount * 7 + 2,
            { align: 'center' }
        );
        doc.text(
            `realizado no dia ${data.date}${data.totalHours ? `, com carga horária de ${data.totalHours} hora${data.totalHours > 1 ? 's' : ''}.` : '.'}`,
            cx,
            actY + lineCount * 7 + 10,
            { align: 'center' }
        );
    } else {
        doc.text(
            `participou ${artigo} ${data.eventName}${data.eventCity ? ', ' + data.eventCity : ''},`,
            cx, actY, { align: 'center' }
        );
        doc.text(
            `realizado no dia ${data.date}${data.totalHours ? `, com carga horária de ${data.totalHours} hora${data.totalHours > 1 ? 's' : ''}.` : '.'}`,
            cx, actY + 8, { align: 'center' }
        );
    }

    // ── PILLS DE METADADOS ────────────────────────────────────────
    const pillY = H - 50;

    const pills: { label: string; value: string; color: [number, number, number] }[] = [
        { label: 'DATA', value: data.date, color: C.teal },
        { label: 'TIPO', value: TIPO_TITULO[data.type]?.split(' ').slice(-1)[0] || 'EVENTO', color: C.orange },
    ];
    if (data.totalHours) {
        pills.push({ label: 'CARGA HORÁRIA', value: `${data.totalHours}h`, color: C.gold });
    }

    const pillW = 48;
    const pillGap = 8;
    const totalPillW = pills.length * pillW + (pills.length - 1) * pillGap;
    let pillX = cx - totalPillW / 2;

    pills.forEach(({ label, value, color }) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(pillX, pillY, pillW, 14, 3, 3, 'F');
        doc.setTextColor(...C.white);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'bold');
        doc.text(label, pillX + pillW / 2, pillY + 5, { align: 'center', charSpace: 0.5 });
        doc.setFontSize(8);
        doc.text(value, pillX + pillW / 2, pillY + 11, { align: 'center' });
        pillX += pillW + pillGap;
    });

    // ── ASSINATURA ────────────────────────────────────────────────
    const sigY = H - 30;
    const sigX = cx;

    if (data.signatureBase64) {
        try {
            doc.addImage(data.signatureBase64, 'PNG', sigX - 28, sigY - 16, 56, 16);
        } catch {
            // fallback: texto cursivo
            doc.setTextColor(...C.white);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bolditalic');
            doc.text('Caio Diniz Borges', sigX, sigY - 4, { align: 'center' });
        }
    }

    // Linha dourada da assinatura
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    doc.line(sigX - 36, sigY, sigX + 36, sigY);

    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Caio Diniz Borges', sigX, sigY + 6, { align: 'center' });

    doc.setTextColor(...C.gray);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('CEO Growth & IA', sigX, sigY + 12, { align: 'center' });

    doc.setTextColor(...C.dim);
    doc.setFontSize(6.5);
    doc.text('CNPJ: 54.789.957/0001-98', sigX, sigY + 17, { align: 'center' });

    // ── RODAPÉ DE VALIDAÇÃO ───────────────────────────────────────
    doc.setDrawColor(...C.dim);
    doc.setLineWidth(0.2);
    doc.line(20, H - 12, W - 20, H - 12);

    doc.setTextColor(...C.dim);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Código de Autenticidade: ${data.certificateCode}  ·  Emitido em: ${new Date().toLocaleDateString('pt-BR')}  ·  Valide em: growthsummit.site/certificado`,
        cx,
        H - 7,
        { align: 'center' }
    );

    // ── DOWNLOAD ──────────────────────────────────────────────────
    const safeName = data.userName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_áéíóúãõâêôç]/gi, '');
    doc.save(`Certificado_${safeName}_${data.certificateCode}.pdf`);
}

// ── UTILITÁRIOS ───────────────────────────────────────────────

/**
 * Converte URL de imagem em Base64 para uso no jsPDF.
 * Exemplo: const sig = await imageUrlToBase64('/assets/assinatura-caio.png');
 */
export async function imageUrlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas indisponível'));
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Falha ao carregar imagem da assinatura'));
        img.src = url;
    });
}

/**
 * Gera código único de certificado baseado em userId + referência.
 * Substitui o Math.random() pelo hash determinístico.
 */
export function generateCertificateCode(userId: string, ref: string): string {
    const raw = `${userId}-${ref}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

/**
 * issueCertificate — compatível com CertificateService.
 */
export async function issueCertificate(
    user: { id: string; name: string },
    project: { id: string; name: string; city?: string },
    certificateType: 'event' | 'course' | 'lecture' | 'workshop',
    session?: { id?: string; title?: string; startTime?: string }
): Promise<CertificateTemplateData> {
    const ref = session?.id ?? project.id;
    const code = generateCertificateCode(user.id, ref);

    return {
        userName: user.name,
        eventName: project.name,
        eventCity: project.city,
        sessionTitle: session?.title,
        date: session?.startTime
            ? new Date(session.startTime).toLocaleDateString('pt-BR')
            : new Date().toLocaleDateString('pt-BR'),
        certificateCode: code,
        type: certificateType,
    };
}
