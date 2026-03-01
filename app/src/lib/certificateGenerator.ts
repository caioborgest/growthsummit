// ============================================================
// GERADOR DE CERTIFICADO — Growth Experience
// Versão 3 — Sem dourado | Logo GX | Design premium
// Idioma: Português do Brasil
// Cores: Laranja #FE4C38 | Teal #21808D | Sem dourado
// ============================================================
// NOTA: jsPDF é carregado dinamicamente para compatibilidade com build do Vercel
async function loadJsPDF() {
    const { jsPDF } = await import('jspdf');
    return jsPDF;
}

export interface CertificateTemplateData {
    /** Nome completo do participante (inserido automaticamente) */
    userName: string;
    /** Nome do evento */
    eventName: string;
    /** Cidade do evento */
    eventCity?: string;
    /** Nome da atividade (palestra, workshop, oficina, curso) */
    sessionTitle?: string;
    /** Tipo da atividade */
    type: 'event' | 'course' | 'lecture' | 'workshop' | 'oficina';
    /** Data em pt-BR, ex: "15/03/2026" */
    date: string;
    /** Código único de validação */
    certificateCode: string;
    /** Carga horária */
    totalHours?: number;
    /** Base64 PNG da assinatura (fundo transparente, tinta preta) */
    signatureBase64?: string;
    /** Base64 PNG da logomarca Growth Experience */
    logoBase64?: string;
}

// ── Paleta (SEM DOURADO) ──────────────────────────────────────
const C = {
    bg: [10, 10, 15] as [number, number, number],
    bgPanel: [22, 22, 32] as [number, number, number],
    orange: [254, 76, 56] as [number, number, number],
    orangeMid: [180, 55, 40] as [number, number, number],
    teal: [33, 128, 141] as [number, number, number],
    tealMid: [24, 90, 100] as [number, number, number],
    tealDim: [18, 60, 68] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gray: [165, 165, 178] as [number, number, number],
    dim: [80, 80, 95] as [number, number, number],
    signBg: [240, 240, 245] as [number, number, number], // fundo claro p/ assinatura preta
};

// ── Rótulos em Português ──────────────────────────────────────
const TIPO_ARTIGO: Record<string, string> = {
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

const TIPO_PILL: Record<string, string> = {
    event: 'EVENTO',
    lecture: 'PALESTRA',
    workshop: 'WORKSHOP',
    oficina: 'OFICINA',
    course: 'CURSO',
};

// ── Função auxiliar: texto em caixa com cantos arredondados ───
function roundedBox(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc: any,
    x: number, y: number, w: number, h: number,
    fillColor: [number, number, number],
    r = 3
) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, 'F');
}

/**
 * Gera PDF do certificado A4 horizontal.
 * Nome, atividade, data e duração são inseridos automaticamente.
 * A assinatura (tinta preta) é renderizada sobre fundo claro.
 * A logomarca é carregada do Supabase Storage via `logoBase64`.
 */
export async function generateCertificatePDF(data: CertificateTemplateData): Promise<void> {
    const JsPDF = await loadJsPDF();
    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();   // 297 mm
    const H = doc.internal.pageSize.getHeight();  // 210 mm
    const cx = W / 2;
    const BAND = 12; // largura das faixas laterais em mm

    // 1. FUNDO PRINCIPAL
    // ════════════════════════════════════════════════════════════
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, H, 'F');

    // Padrão geométrico de fundo (pontos sutis)
    doc.setFillColor(30, 30, 45);
    for (let i = BAND + 10; i < W - BAND - 10; i += 15) {
        for (let j = 10; j < H - 10; j += 15) {
            doc.circle(i, j, 0.15, 'F');
        }
    }

    // Marca d'água GX sutil no fundo
    doc.setTextColor(20, 20, 30);
    doc.setFontSize(120);
    doc.setFont('helvetica', 'bold');
    doc.text('GX', cx, H / 2 + 20, { align: 'center', angle: -15 });

    // Brilho sutil central (simulado com círculo escurecido)
    doc.setFillColor(18, 12, 12);
    doc.circle(cx, H * 0.42, 70, 'F');

    // ════════════════════════════════════════════════════════════
    // 2. FAIXAS LATERAIS
    // ════════════════════════════════════════════════════════════
    // Esquerda — laranja
    doc.setFillColor(...C.orange);
    doc.rect(0, 0, BAND, H, 'F');
    // Linha divisória interna laranja (mais escura)
    doc.setDrawColor(...C.orangeMid);
    doc.setLineWidth(0.3);
    doc.line(BAND, 0, BAND, H);

    // Direita — teal
    doc.setFillColor(...C.teal);
    doc.rect(W - BAND, 0, BAND, H, 'F');
    doc.setDrawColor(...C.tealMid);
    doc.setLineWidth(0.3);
    doc.line(W - BAND, 0, W - BAND, H);

    // ════════════════════════════════════════════════════════════
    // 3. BORDA INTERNA (teal, sem dourado)
    // ════════════════════════════════════════════════════════════
    doc.setDrawColor(...C.tealDim);
    doc.setLineWidth(0.4);
    doc.rect(BAND + 4, 6, W - (BAND + 4) * 2, H - 12, 'D');

    // ════════════════════════════════════════════════════════════
    // 4. LOGOMARCA GROWTH EXPERIENCE
    // ════════════════════════════════════════════════════════════
    const logoW = 44;
    const logoH = 16;
    const logoX = BAND + 10;
    const logoY = 14;

    if (data.logoBase64) {
        try {
            doc.addImage(data.logoBase64, 'PNG', logoX, logoY, logoW, logoH);
        } catch {
            // Fallback: logotipo em texto
            _renderTextLogo(doc, logoX, logoY + 10);
        }
    } else {
        _renderTextLogo(doc, logoX, logoY + 10);
    }

    // ════════════════════════════════════════════════════════════
    // 5. SEPARADOR HORIZONTAL TEAL (abaixo do logo)
    // ════════════════════════════════════════════════════════════
    const sepY = 34;
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.6);
    doc.line(BAND + 4, sepY, W - BAND - 4, sepY);

    // ════════════════════════════════════════════════════════════
    // 6. TIPO DO CERTIFICADO
    // ════════════════════════════════════════════════════════════
    doc.setTextColor(...C.white);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(
        `CERTIFICADO DE ${TIPO_TITULO[data.type] || 'PARTICIPAÇÃO'}`,
        cx, 44, { align: 'center', charSpace: 0.6 }
    );

    // ════════════════════════════════════════════════════════════
    // 7. TEXTO "CERTIFICAMOS"
    // ════════════════════════════════════════════════════════════
    doc.setTextColor(...C.gray);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos com orgulho que', cx, 55, { align: 'center' });

    // ════════════════════════════════════════════════════════════
    // 8. NOME DO PARTICIPANTE (automático)
    // ════════════════════════════════════════════════════════════
    const nameY = 74;

    // Linha teal acima
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.3);
    doc.line(cx - 90, nameY - 10, cx + 90, nameY - 10);

    // Nome — tamanho adaptativo
    const nameFontSize = data.userName.length > 38 ? 20
        : data.userName.length > 28 ? 24
            : data.userName.length > 20 ? 28
                : 32;

    doc.setTextColor(...C.white);
    doc.setFontSize(nameFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName.toUpperCase(), cx, nameY + 2, { align: 'center' });

    // Linha teal abaixo
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.3);
    doc.line(cx - 90, nameY + 9, cx + 90, nameY + 9);

    // ════════════════════════════════════════════════════════════
    // 9. NOME DA ATIVIDADE (laranja em destaque)
    // ════════════════════════════════════════════════════════════
    const actY = nameY + 24;
    const artigo = TIPO_ARTIGO[data.type] || 'do evento';

    if (data.sessionTitle && data.type !== 'event') {
        // Título da atividade em destaque
        doc.setTextColor(...C.orange);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(`"${data.sessionTitle}"`, W - (BAND + 8) * 2 - 20);
        doc.text(titleLines, cx, actY, { align: 'center' });

        const offsetY = (titleLines.length - 1) * 6;

        // Corpo do texto
        doc.setTextColor(...C.gray);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `integrante da programação ${artigo} ${data.eventName}${data.eventCity ? ', ' + data.eventCity : ''}`,
            cx, actY + 9 + offsetY, { align: 'center' }
        );
        doc.text(
            `realizado no dia ${data.date}${data.totalHours ? `, com carga horária de ${data.totalHours} hora${data.totalHours > 1 ? 's' : ''}` : ''}.`,
            cx, actY + 17 + offsetY, { align: 'center' }
        );
    } else {
        doc.setTextColor(...C.gray);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `participou ${artigo} ${data.eventName}${data.eventCity ? ', ' + data.eventCity : ''}`,
            cx, actY, { align: 'center' }
        );
        doc.text(
            `realizado no dia ${data.date}${data.totalHours ? `, com carga horária de ${data.totalHours} hora${data.totalHours > 1 ? 's' : ''}` : ''}.`,
            cx, actY + 8, { align: 'center' }
        );
    }

    // ════════════════════════════════════════════════════════════
    // 10. ASSINATURA (fundo claro para tinta preta ser visível)
    // ════════════════════════════════════════════════════════════
    const sigAreaX = BAND + 14;
    const sigAreaY = H - 54;
    const sigAreaW = 80;
    const sigAreaH = 36;

    // Painel claro para a assinatura preta
    roundedBox(doc, sigAreaX, sigAreaY, sigAreaW, sigAreaH, C.signBg, 3);

    // Linha laranja no topo do painel
    doc.setDrawColor(...C.orange);
    doc.setLineWidth(0.8);
    doc.line(sigAreaX, sigAreaY, sigAreaX + sigAreaW, sigAreaY);

    if (data.signatureBase64) {
        try {
            // Centralizar assinatura dentro do painel claro
            doc.addImage(
                data.signatureBase64, 'PNG',
                sigAreaX + 4, sigAreaY + 2,
                sigAreaW - 8, sigAreaH - 8
            );
        } catch {
            // Fallback: texto cursivo escuro
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bolditalic');
            doc.text('Caio Diniz Borges', sigAreaX + sigAreaW / 2, sigAreaY + 20, { align: 'center' });
        }
    } else {
        // Placeholder até assinatura ser enviada
        doc.setTextColor(...C.dim);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('[assinatura]', sigAreaX + sigAreaW / 2, sigAreaY + 20, { align: 'center' });
    }

    // Dados do responsável (abaixo do painel)
    const infoY = sigAreaY + sigAreaH + 5;
    doc.setTextColor(...C.white);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Caio Diniz Borges', sigAreaX + sigAreaW / 2, infoY, { align: 'center' });

    doc.setTextColor(...C.gray);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('CEO Growth & IA', sigAreaX + sigAreaW / 2, infoY + 5, { align: 'center' });

    doc.setTextColor(...C.dim);
    doc.setFontSize(6.5);
    doc.text('CNPJ: 54.789.957/0001-98', sigAreaX + sigAreaW / 2, infoY + 10, { align: 'center' });

    // ════════════════════════════════════════════════════════════
    // 11. PILLS DE METADADOS (lado direito)
    // ════════════════════════════════════════════════════════════
    const pillW = 58;
    const pillH = 11;
    const pillGap = 5;
    const pillX = W - BAND - 14 - pillW;
    let pillY = H - 60;

    // Pill 1: Tipo
    roundedBox(doc, pillX, pillY, pillW, pillH, C.orange, 4);
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(TIPO_PILL[data.type] || 'EVENTO', pillX + pillW / 2, pillY + 7.5, { align: 'center', charSpace: 0.8 });
    pillY += pillH + pillGap;

    // Pill 2: Data
    roundedBox(doc, pillX, pillY, pillW, pillH, C.teal, 4);
    doc.setTextColor(...C.white);
    doc.setFontSize(7);
    doc.text(data.date, pillX + pillW / 2, pillY + 7.5, { align: 'center' });
    pillY += pillH + pillGap;

    // Pill 3: Carga horária (condicional)
    if (data.totalHours) {
        roundedBox(doc, pillX, pillY, pillW, pillH, [40, 40, 55], 4);
        doc.setTextColor(...C.teal);
        doc.setFontSize(7);
        doc.text(
            `${data.totalHours} HORA${data.totalHours > 1 ? 'S' : ''}`,
            pillX + pillW / 2, pillY + 7.5, { align: 'center', charSpace: 0.5 }
        );
    }

    // ════════════════════════════════════════════════════════════
    // 12. RODAPÉ DE VALIDAÇÃO
    // ════════════════════════════════════════════════════════════
    const footerY = H - 10;

    doc.setDrawColor(...C.tealDim);
    doc.setLineWidth(0.25);
    doc.line(BAND + 4, footerY - 4, W - BAND - 4, footerY - 4);

    doc.setTextColor(...C.dim);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Código de Autenticidade: ${data.certificateCode}  ·  Emitido em: ${new Date().toLocaleDateString('pt-BR')}  ·  Valide em: growthsummit.site/certificado`,
        cx,
        footerY,
        { align: 'center' }
    );

    // ════════════════════════════════════════════════════════════
    // DOWNLOAD
    // ════════════════════════════════════════════════════════════
    const safeName = data.userName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');
    doc.save(`Certificado_${safeName}_${data.certificateCode}.pdf`);
}

// ── Fallback de logotipo em texto quando imagem não disponível ─
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _renderTextLogo(doc: any, x: number, y: number) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(254, 76, 56);
    doc.text('GROWTH', x, y);
    doc.setTextColor(33, 128, 141);
    doc.text('EXPERIENCE', x, y + 7);
}

// ── UTILITÁRIOS ───────────────────────────────────────────────

/**
 * Converte URL de imagem em Base64 para uso no jsPDF.
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
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = url;
    });
}

/**
 * Gera código único baseado em userId + referência.
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
