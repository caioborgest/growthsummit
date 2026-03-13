/**
 * Utility to generate QR Code data for various event entities
 */

export type QRType = 'registration' | 'session' | 'checkin' | 'feedback' | 'mentor' | 'company' | 'startup' | 'sponsor';

export interface QRData {
    type: QRType;
    projectId: string;
    id: string; // registrationId or sessionId
    timestamp: string;
}

/**
 * Generates a string to be embedded in a QR code
 */
export function generateQRString(type: QRType, projectId: string, id: string): string {
    const data: QRData = {
        type,
        projectId,
        id,
        timestamp: new Date().toISOString()
    };

    // We use a prefix to identify our dynamic QR codes
    return `GS_EVENT:${btoa(JSON.stringify(data))}`;
}

/**
 * Parses a GS_EVENT QR code string
 */
export function parseQRString(qrString: string): QRData | null {
    if (!qrString.startsWith('GS_EVENT:')) return null;

    try {
        const base64Data = qrString.split(':')[1];
        const data = JSON.parse(atob(base64Data)) as QRData;
        return data;
    } catch (e) {
        console.error('Failed to parse GS QR Code:', e);
        return null;
    }
}
