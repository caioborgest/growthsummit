// ============================================================
// GERADOR DE CERTIFICADO — Growth Experience
// Versão 4 — Design Inovador | Suporte a Marcas Parceiras
// Cores: Laranja #FE4C38 | Teal #21808D
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
    /** Base64 PNGs de marcas parceiras (ex: SEBRAE, Prefeitura, etc.) */
    partnerLogosBase64?: string[];
    /** Overrides configuráveis via Admin */
    templateOverrides?: {
        title?: string;
        description?: string;
        ceoName?: string;
        ceoRole?: string;
        primaryColor?: string; // hex #fe4c38
        secondaryColor?: string; // hex #21808d
        accentColor?: string; // hex #ffffff
        showBackgroundPattern?: boolean;
        customBackgroundBase64?: string;
    };
}

// ── Paleta Premium ────────────────────────────────────────────
const C = {
    bg: [8, 8, 12] as [number, number, number],
    bgPanel: [20, 20, 30] as [number, number, number],
    orange: [254, 76, 56] as [number, number, number],
    orangeGlow: [255, 112, 67] as [number, number, number],
    teal: [33, 128, 141] as [number, number, number],
    tealGlow: [45, 170, 185] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    gray: [180, 180, 195] as [number, number, number],
    dim: [70, 70, 85] as [number, number, number],
    glass: [255, 255, 255, 0.03] as [number, number, number, number],
    signBg: [245, 245, 250] as [number, number, number],
};

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

// ── Funções Auxiliares de Desenho ──────────────────────────────
function roundedBox(doc: any, x: number, y: number, w: number, h: number, fillColor: [number, number, number], r = 3) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, 'F');
}

function gradientLine(doc: any, x: number, y: number, w: number, c1: [number, number, number], c2: [number, number, number]) {
    const steps = 40;
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
        const ratio = i / steps;
        const r = Math.floor(c1[0] * (1 - ratio) + c2[0] * ratio);
        const g = Math.floor(c1[1] * (1 - ratio) + c2[1] * ratio);
        const b = Math.floor(c1[2] * (1 - ratio) + c2[2] * ratio);
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.5);
        doc.line(x + (i * stepW), y, x + ((i + 1) * stepW), y);
    }
}

export async function generateCertificatePDF(data: CertificateTemplateData, output: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const JsPDF = await loadJsPDF();
    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const cx = W / 2;
    const bandWidth = 10;

    const primaryRGB = data.templateOverrides?.primaryColor ? _hexToRgb(data.templateOverrides.primaryColor) : C.orange;
    const secondaryRGB = data.templateOverrides?.secondaryColor ? _hexToRgb(data.templateOverrides.secondaryColor) : C.teal;

    // 1. FUNDO E BASE ESTRUTURAL
    doc.setFillColor(...C.bg);
    doc.rect(0, 0, W, H, 'F');

    // Background Image ou Pattern
    if (data.templateOverrides?.customBackgroundBase64) {
        try {
            doc.addImage(data.templateOverrides.customBackgroundBase64, 'JPEG', 0, 0, W, H);
        } catch (e) { console.error('BG Image error', e); }
    } else if (data.templateOverrides?.showBackgroundPattern !== false) {
        // Pattern Geométrico Moderno (Grid de linhas finas + pontos)
        doc.setDrawColor(25, 25, 35);
        doc.setLineWidth(0.1);
        for(let i=0; i<W; i+=20) doc.line(i, 0, i, H);
        for(let i=0; i<H; i+=20) doc.line(0, i, W, i);
        
        doc.setFillColor(40, 40, 60);
        for(let i=10; i<W; i+=20) {
            for(let j=10; j<H; j+=20) doc.circle(i, j, 0.2, 'F');
        }
    }

    // Marca d'água central estilizada
    doc.setTextColor(15, 15, 20);
    doc.setFontSize(150);
    doc.setFont('helvetica', 'bold');
    doc.text('GROWTH', cx, H/2 + 30, { align: 'center', angle: 5 });

    // 2. FAIXAS DE CORES INNOVATIVAS (Gradientes simulados e glow)
    // Esquerda Glow
    for(let i=0; i<bandWidth; i++) {
        const alpha = 1 - (i/bandWidth);
        const r = Math.floor(primaryRGB[0] * alpha + C.bg[0] * (1-alpha));
        const g = Math.floor(primaryRGB[1] * alpha + C.bg[1] * (1-alpha));
        const b = Math.floor(primaryRGB[2] * alpha + C.bg[2] * (1-alpha));
        doc.setFillColor(r, g, b);
        doc.rect(i, 0, 1, H, 'F');
    }
    // Direita Glow
    for(let i=0; i<bandWidth; i++) {
        const alpha = 1 - (i/bandWidth);
        const r = Math.floor(secondaryRGB[0] * alpha + C.bg[0] * (1-alpha));
        const g = Math.floor(secondaryRGB[1] * alpha + C.bg[1] * (1-alpha));
        const b = Math.floor(secondaryRGB[2] * alpha + C.bg[2] * (1-alpha));
        doc.setFillColor(r, g, b);
        doc.rect(W - i - 1, 0, 1, H, 'F');
    }

    // 3. MOLDURA INTERNA "GLASS"
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.setLineWidth(0.3);
    doc.roundedRect(bandWidth + 5, 8, W - (bandWidth + 5)*2, H - 16, 5, 5, 'D');

    // 4. HEADER: LOGO E MARCAS PARCEIRAS
    const logoY = 18;
    // Logo Principal (GX)
    if (data.logoBase64) {
        doc.addImage(data.logoBase64, 'PNG', bandWidth + 12, logoY, 45, 15);
    } else {
        _renderTextLogo(doc, bandWidth + 12, logoY + 8);
    }

    // Marcas Parceiras (Ex: SEBRAE) no canto superior direito
    if (data.partnerLogosBase64 && data.partnerLogosBase64.length > 0) {
        let currentX = W - bandWidth - 15;
        data.partnerLogosBase64.reverse().forEach((logo) => {
            currentX -= 30; // largura aproximada p/ cada logo parceiro
            try {
                doc.addImage(logo, 'PNG', currentX, logoY - 2, 25, 12);
            } catch(e) { console.error('Partner logo error', e); }
        });
    }

    // 5. CONTEÚDO PRINCIPAL
    // Título do Certificado
    doc.setTextColor(...C.white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const fullTitle = data.templateOverrides?.title || `CERTIFICADO DE ${TIPO_TITULO[data.type] || 'PARTICIPAÇÃO'}`;
    doc.text(fullTitle, cx, 50, { align: 'center', charSpace: 1 });

    // Subtítulo
    doc.setTextColor(...C.gray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos para os devidos fins que', cx, 60, { align: 'center' });

    // NOME DO PARTICIPANTE (ESTILO PREMIUM)
    const nameY = 85;
    doc.setTextColor(...C.white);
    const nameSize = data.userName.length > 30 ? 24 : 32;
    doc.setFontSize(nameSize);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName.toUpperCase(), cx, nameY, { align: 'center' });

    // Linha de detalhe sob o nome (gradiente)
    gradientLine(doc, cx - 80, nameY + 5, 160, primaryRGB, secondaryRGB);

    // DESCRIÇÃO DA ATIVIDADE
    const descY = nameY + 22;
    doc.setTextColor(...C.gray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const artigo = TIPO_ARTIGO[data.type] || 'do evento';
    let descriptionText = data.templateOverrides?.description;

    if (!descriptionText) {
        if (data.sessionTitle && data.type !== 'event') {
            descriptionText = `participou com êxito ${artigo} "${data.sessionTitle}"`;
        } else {
            descriptionText = `participou ativamente ${artigo} ${data.eventName}`;
        }
        descriptionText += `${data.eventCity ? ', em ' + data.eventCity : ''}, no dia ${data.date}.`;
    }

    const descLines = doc.splitTextToSize(descriptionText, 180);
    doc.text(descLines, cx, descY, { align: 'center', lineHeightFactor: 1.5 });

    // CARGA HORÁRIA (PILL ESTILIZADO)
    if (data.totalHours) {
        const chY = descY + (descLines.length * 8) + 5;
        roundedBox(doc, cx - 25, chY, 50, 8, [30, 30, 45], 4);
        doc.setTextColor(...primaryRGB);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`CARGA HORÁRIA: ${data.totalHours} HORAS`, cx, chY + 5.5, { align: 'center' });
    }

    // 6. RODAPÉ: ASSINATURA E VALIDAÇÃO
    const footerTopY = H - 55;

    // Painel de Assinatura (Minimalista e Elegante)
    const sigX = bandWidth + 15;
    const sigW = 75;
    doc.setDrawColor(...C.dim);
    doc.setLineWidth(0.2);
    doc.line(sigX, footerTopY + 25, sigX + sigW, footerTopY + 25);

    if (data.signatureBase64) {
        doc.addImage(data.signatureBase64, 'PNG', sigX + 10, footerTopY, 55, 22);
    } else {
        doc.setTextColor(...C.dim);
        doc.setFontSize(8);
        doc.text('[ Assinatura Direção ]', sigX + sigW/2, footerTopY + 15, { align: 'center' });
    }

    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.templateOverrides?.ceoName || 'Caio Diniz Borges', sigX + sigW/2, footerTopY + 31, { align: 'center' });
    
    doc.setTextColor(...C.gray);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(data.templateOverrides?.ceoRole || 'CEO, Growth Experience', sigX + sigW/2, footerTopY + 36, { align: 'center' });

    // Código de Validação e QR Code simulation
    const valX = W - bandWidth - 15 - 50;
    doc.setTextColor(...C.dim);
    doc.setFontSize(7);
    doc.text('AUTENTICIDADE', valX + 25, footerTopY + 20, { align: 'center' });
    doc.setTextColor(...secondaryRGB);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(data.certificateCode, valX + 25, footerTopY + 26, { align: 'center' });

    // 7. HOLOGRAM STAMP (Subtle Seal simulation)
    const sealX = W - bandWidth - 14;
    const sealY = H - 32;
    doc.setDrawColor(...primaryRGB);
    doc.setLineWidth(0.3);
    doc.circle(sealX, sealY, 10, 'D'); // Outer
    doc.setFillColor(primaryRGB[0], primaryRGB[1], primaryRGB[2], 0.05);
    doc.circle(sealX, sealY, 9, 'F');
    
    doc.setTextColor(...primaryRGB);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('GX', sealX, sealY - 1, { align: 'center' });
    doc.setFontSize(3.5);
    doc.text('OFFICIAL', sealX, sealY + 2, { align: 'center' });

    // Texto de Rodapé Final
    doc.setTextColor(50, 50, 65);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const footerNote = `Este certificado foi gerado eletronicamente e pode ser validado através do código ${data.certificateCode} em growthsummit.site/validar. CNPJ: 54.789.957/0001-98.`;
    doc.text(footerNote, cx, H - 8, { align: 'center' });


    // Finalização e Download
    const safeFilename = `Certificado_${data.userName.replace(/\s+/g, '_')}_${data.certificateCode}.pdf`;
    
    if (output === 'save') {
        doc.save(safeFilename);
    } else if (output === 'bloburl') {
        const url = doc.output('bloburl');
        return url;
    }
}

function _renderTextLogo(doc: any, x: number, y: number) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(254, 76, 56);
    doc.text('GROWTH', x, y);
    doc.setTextColor(33, 128, 141);
    doc.text('EXPERIENCE', x, y + 6);
}

export async function imageUrlToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas Error'));
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Image Load Error'));
        img.src = url;
    });
}

function _hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

async function loadJsPDF() {
    const { jsPDF } = await import('jspdf');
    return jsPDF;
}

export function generateCertificateCode(userId: string, ref: string): string {
    const raw = `${userId}-${ref}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase().padStart(8, '0').slice(0, 8);
}

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
        date: session?.startTime ? new Date(session.startTime).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        certificateCode: code,
        type: certificateType,
    };
}
