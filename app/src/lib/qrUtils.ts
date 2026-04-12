/**
 * QR Code Utilities — Growth Experience Platform
 * 
 * Format v2 (compact): GS|type_code|short_id
 *   - type_code: R=registration, S=session, M=mentor, C=company, P=partner, T=startup, E=entry
 *   - short_id: first 8 chars of UUID (enough for uniqueness in event context)
 * 
 * This produces ~20-30 char payloads → fewer QR modules → easier camera focus
 */

export type QRType = 'registration' | 'session' | 'checkin' | 'feedback' | 'mentor' | 'company' | 'startup' | 'sponsor' | 'entry' | 'ticket' | 'partner' | 'exhibitor';

export interface QRData {
    type: QRType;
    projectId: string;
    id: string;
    participantId?: string;
    timestamp?: string;
    checksum?: string;
}

// Compact type codes for minimal QR payload
const TYPE_TO_CODE: Record<string, string> = {
    registration: 'R', session: 'S', checkin: 'K', feedback: 'F',
    mentor: 'M', company: 'C', startup: 'T', sponsor: 'X',
    entry: 'E', ticket: 'R', partner: 'P', exhibitor: 'P'
};

const CODE_TO_TYPE: Record<string, QRType> = {
    R: 'registration', S: 'session', K: 'checkin', F: 'feedback',
    M: 'mentor', C: 'company', T: 'startup', X: 'sponsor',
    E: 'entry', P: 'partner'
};

/**
 * Generate a compact QR string (~20-30 chars instead of ~200)
 * Format: GS|R|full-uuid
 */
export function generateQRString(type: QRType, projectId: string, id: string, _participantId?: string): string {
    const code = TYPE_TO_CODE[type] || 'R';
    // Use full ID for reliable lookup, but compact envelope
    return `GS|${code}|${id}`;
}

/**
 * Parse QR code string — supports all formats:
 *   1. Compact v2:    GS|R|uuid
 *   2. Legacy v1:     GS_EVENT:base64json
 *   3. Legacy prefix: GE-CHECKIN|id
 *   4. Raw UUID
 */
export function parseQRString(qrString: string): QRData | null {
    if (!qrString) return null;

    // 1. Compact v2 format: GS|TYPE_CODE|ID
    if (qrString.startsWith('GS|')) {
        const parts = qrString.split('|');
        if (parts.length >= 3) {
            const typeCode = parts[1];
            const id = parts[2];
            const type = CODE_TO_TYPE[typeCode] || 'registration';
            return { type, projectId: '', id };
        }
        return null;
    }

    // 2. Legacy v1 format: GS_EVENT:BASE64_JSON
    if (qrString.startsWith('GS_EVENT:')) {
        try {
            const base64Data = qrString.split(':')[1];
            const data = JSON.parse(atob(base64Data)) as QRData;
            return data;
        } catch (e) {
            console.error('Failed to parse GS QR Code:', e);
            return null;
        }
    }

    // 3. Legacy GE- prefix formats
    if (qrString.startsWith('GE-')) {
        const parts = qrString.split('|');
        const prefix = parts[0];

        try {
            switch (prefix) {
                case 'GE-CHECKIN':
                case 'GE - CHECKIN':
                    return { type: 'registration', projectId: '', id: parts[1] };
                case 'GE-ACTIVITY':
                    return { type: 'session', projectId: '', id: parts[1] };
                case 'GE-PARTNER':
                    return { type: 'partner', projectId: '', id: parts[1] };
                case 'GE-MENTORING':
                    return { type: 'mentor', projectId: '', id: parts[1] };
                case 'GE-STAND':
                    return { type: 'sponsor', projectId: '', id: parts[1] };
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }

    // 4. Raw UUID fallback
    if (qrString.length >= 32 && /^[0-9a-fA-F-]{32,36}$/.test(qrString)) {
        return { type: 'registration', projectId: '', id: qrString };
    }

    return null;
}

