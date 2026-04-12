/**
 * Utility to generate QR Code data for various event entities
 */

export type QRType = 'registration' | 'session' | 'checkin' | 'feedback' | 'mentor' | 'company' | 'startup' | 'sponsor' | 'entry' | 'ticket' | 'partner' | 'exhibitor';

export interface QRData {
    type: QRType;
    projectId: string;
    id: string; // registrationId or sessionId
    participantId?: string;
    timestamp?: string;
    checksum?: string;
}

/**
 * Generates a string to be embedded in a QR code
 * The value is now a structured JSON string with ID, Project, Participant and Checksum
 */
export function generateQRString(type: QRType, projectId: string, id: string, participantId?: string): string {
    const data: Partial<QRData> = {
        type,
        projectId,
        id,
        participantId
    };

    // Calculate a simple checksum for validation
    data.checksum = btoa(`${id}-${projectId}-${participantId || 'anon'}`).substring(0, 8);

    // We use a prefix to identify our dynamic QR codes
    return `GS_EVENT:${btoa(JSON.stringify(data))}`;
}

/**
 * Parses a GS_EVENT QR code string or legacy GE- formats
 */
export function parseQRString(qrString: string): QRData | null {
    if (!qrString) return null;

    // 1. New Format: GS_EVENT:BASE64_JSON
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

    // 2. Legacy Formats: GE-CHECKIN, GE-ACTIVITY, GE-MENTORING, GE-STAND
    if (qrString.startsWith('GE-')) {
        const parts = qrString.split('|');
        const prefix = parts[0];

        try {
            switch (prefix) {
                case 'GE-CHECKIN':
                case 'GE - CHECKIN':
                    return {
                        type: 'registration',
                        projectId: '', // Not available in legacy string
                        id: parts[1], // registrationId
                        timestamp: new Date().toISOString()
                    };
                case 'GE-ACTIVITY':
                    return {
                        type: 'session',
                        projectId: '',
                        id: parts[1], // sessionId
                        timestamp: new Date().toISOString()
                    };
                case 'GE-PARTNER':
                    return {
                        type: 'partner',
                        projectId: '', // Legacy format doesn't have it
                        id: parts[1], // partner_team_member_id
                        timestamp: new Date().toISOString()
                    };
                case 'GE-MENTORING':
                    return {
                        type: 'mentor', 
                        projectId: '',
                        id: parts[1],
                        timestamp: new Date().toISOString()
                    };
                case 'GE-STAND':
                    return {
                        type: 'sponsor', 
                        projectId: '',
                        id: parts[1],
                        timestamp: new Date().toISOString()
                    };
                default:
                    return null;
            }
        } catch {
            return null;
        }
    }

    // 3. Fallback: Raw UUID-like IDs (often used in PWA TicketSection or legacy)
    if (qrString.length >= 32 && /^[0-9a-fA-F-]{32,36}$/.test(qrString)) {
        return {
            type: 'registration',
            projectId: '', // Context-neutral
            id: qrString,
            timestamp: new Date().toISOString()
        };
    }

    return null;
}
