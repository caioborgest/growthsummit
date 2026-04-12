import { supabase } from './supabase';
import { logger } from './logger';

// Cache IP in memory — only fetch once per session to avoid repeated external requests
let cachedIP: string | null = null;
let ipFetchPromise: Promise<string> | null = null;

export async function getClientIP(): Promise<string> {
    if (cachedIP) return cachedIP;

    // Deduplicate concurrent calls — reuse the same in-flight promise
    if (!ipFetchPromise) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);

        ipFetchPromise = fetch('https://api.ipify.org?format=json', { signal: controller.signal })
            .then(r => r.json() as Promise<{ ip: string }>)
            .then(data => {
                clearTimeout(id);
                cachedIP = data.ip;
                ipFetchPromise = null;
                return data.ip;
            })
            .catch(() => {
                ipFetchPromise = null;
                return 'unknown';
            });
    }

    return ipFetchPromise;
}

// Deduplication map: avoid logging the same event+userId more than once within 5s
const recentEvents = new Map<string, number>();
const DEDUP_WINDOW_MS = 5000;

let isLoggingOut = false;
export const setLoggingOut = (val: boolean) => { isLoggingOut = val; };

// Events that fire automatically on page load and don't need to be audited
const SKIP_AUDIT_EVENTS = new Set([
    'INITIAL_SESSION',
    'session_restored',
    'TOKEN_REFRESHED',
]);

export function logAuditEvent(event: string, userId?: string, metadata?: unknown) {
    // Skip if logout is in progress or common noisy events
    if (isLoggingOut || SKIP_AUDIT_EVENTS.has(event)) return;

    // Deduplicate: skip if same event+user was logged in the last 5 seconds
    const dedupKey = `${event}:${userId || 'anon'}`;
    const lastLogged = recentEvents.get(dedupKey);
    const now = Date.now();
    if (lastLogged && now - lastLogged < DEDUP_WINDOW_MS) {
        logger.debug(`[audit] Skipping duplicate event: ${event}`);
        return;
    }
    recentEvents.set(dedupKey, now);

    // Fire and forget
    getClientIP().then(ip => {
        supabase.from('audit_logs').insert({
            event,
            user_id: userId || null,
            metadata: metadata || {},
            ip_address: ip,
            browser_agent: navigator.userAgent,
            created_at: new Date().toISOString(),
        }).then(({ error }) => {
            if (error) {
                // Ignorar 23503 (FK violation - user ainda não existe no DB público)
                // Ignorar 42501 (RLS permission denied)
                // Ignorar PGRST301 (schema cache outdated)
                // Ignorar 42P01 (table does not exist - audit_logs pode não existir)
                // Ignorar PGRST204/PGRST116 (404 - recurso não encontrado)
                const ignoredCodes = ['23503', '42501', 'PGRST301', '42P01', 'PGRST204', 'PGRST116'];
                const msg = error.message || '';
                const isTableMissing = msg.includes('does not exist') || msg.includes('not found') || msg.includes('404');
                if (!ignoredCodes.includes(error.code) && !isTableMissing) {
                    logger.debug('Auditoria info:', error.message);
                }
            }
        });
    }).catch(() => {
        // Silently skip if IP fetch fails
    });
}
