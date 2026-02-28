import { supabase } from './supabase';
import { logger } from './logger';

export async function getClientIP(): Promise<string> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // 2 segundos timeout

    try {
        const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(id);
        const data = (await response.json()) as { ip: string };
        return data.ip;
    } catch {
        return 'unknown';
    }
}

export function logAuditEvent(event: string, userId?: string, metadata?: unknown) {
    // Fire and forget
    getClientIP().then(ip => {
        // Only attempt to log if we have a userId to avoid 401 if RLS is strict
        // If not, we still try, but catch the error silently if it's 401
        supabase.from('audit_logs').insert({
            event,
            user_id: userId,
            metadata: metadata || {},
            ip_address: ip,
            browser_agent: navigator.userAgent,
            created_at: new Date().toISOString(), // Unificado para created_at
        }).then(({ error }) => {
            if (error) {
                // Silent fail on auditing if not an admin/logged in (RLS 42501)
                if (error.code !== '42501' && error.code !== 'PGRST301') {
                    logger.debug('Auditoria info:', error.message);
                }
            }
        });
    }).catch(() => {
        // Silently skip if IP fetch fails
    });
}
