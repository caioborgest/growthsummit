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
        supabase.from('audit_logs').insert({
            event,
            user_id: userId,
            metadata,
            ip_address: ip,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        }).then(({ error }) => {
            if (error) logger.error('❌ Erro no log de auditoria:', error);
        });
    }).catch(err => {
        logger.error('❌ Erro ao obter IP para auditoria:', err);
    });
}
