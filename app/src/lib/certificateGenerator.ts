import { jsPDF } from 'jspdf';
import type { User, Project, Session } from '@/types';

interface CertificateTemplateData {
    userName: string;
    eventName: string;
    sessionTitle?: string;
    date: string;
    certificateCode: string;
    type: 'event' | 'course' | 'lecture' | 'workshop';
}

/**
 * Generates a professional certificate PDF
 */
export async function generateCertificatePDF(data: CertificateTemplateData) {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // --- Background Design ---
    // Dark Background (matching the platform theme)
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, width, height, 'F');

    // Decorative borders
    doc.setDrawColor(254, 76, 56); // Brand Orange
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20, 'D');

    doc.setDrawColor(33, 128, 141); // Brand Teal
    doc.setLineWidth(0.5);
    doc.rect(12, 12, width - 24, height - 24, 'D');

    // --- Content ---
    // Logo placeholder or text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text('GROWTH EXPERIENCE', width / 2, 40, { align: 'center' });

    doc.setTextColor(254, 76, 56);
    doc.setFontSize(18);
    doc.text('CERTIFICADO DE PARTICIPAÇÃO', width / 2, 60, { align: 'center' });

    // Body text
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos que', width / 2, 85, { align: 'center' });

    // User Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName.toUpperCase(), width / 2, 105, { align: 'center' });

    // Description
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');

    let description = `participou do evento ${data.eventName}`;
    if (data.sessionTitle) {
        const typeLabel = data.type === 'lecture' ? 'da palestra' : data.type === 'workshop' ? 'do workshop' : 'do curso';
        description += ` e concluiu com êxito ${typeLabel} "${data.sessionTitle}"`;
    }
    description += `, realizado em ${data.date}.`;

    const splitDescription = doc.splitTextToSize(description, width - 60);
    doc.text(splitDescription, width / 2, 125, { align: 'center' });

    // Footer / Validation
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Código de Validação: ${data.certificateCode}`, width / 2, 160, { align: 'center' });

    // Signatures Area
    doc.setDrawColor(100, 100, 100);
    doc.line(width / 2 - 40, 185, width / 2 + 40, 185);
    doc.text('DIRETORIA GROWTH SUMMIT', width / 2, 192, { align: 'center' });

    // Save the PDF
    const filename = `Certificado_${data.userName.replace(/\s+/g, '_')}_${data.certificateCode}.pdf`;
    doc.save(filename);
}

/**
 * Issuance logic: checks attendance and issues certificate
 */
export async function issueCertificate(
    user: User,
    project: Project,
    certificateType: 'event' | 'course' | 'lecture' | 'workshop',
    session?: Session
) {
    // Logic to save to database would go here via supabase
    // For now, we return the data needed for PDF generation

    const certificateData: CertificateTemplateData = {
        userName: user.name,
        eventName: project.name,
        sessionTitle: session?.title,
        date: session?.startTime ? new Date(session.startTime).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        certificateCode: Math.random().toString(36).substring(2, 10).toUpperCase(), // Temporary mock code
        type: certificateType
    };

    localStorage.setItem(`cert_${certificateData.certificateCode}`, JSON.stringify(certificateData));
    return certificateData;
}
