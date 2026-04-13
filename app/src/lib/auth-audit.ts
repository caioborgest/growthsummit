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

// State for resilience
let tableUnreachable = false;
let lastFailureTime = 0;
const RETRY_COOLDOWN_MS = 60000; // 1 minute

export function logAuditEvent(event: string, userId?: string, metadata?: unknown) {
    // Skip if logout is in progress or common noisy events
    if (isLoggingOut || SKIP_AUDIT_EVENTS.has(event)) return;

    // Cooldown check: if table was recently unreachable, don't spam requests
    const now = Date.now();
    if (tableUnreachable && now - lastFailureTime < RETRY_COOLDOWN_MS) {
        return;
    }

    // Deduplicate: skip if same event+user was logged in the last 5 seconds
    const dedupKey = `${event}:${userId || 'anon'}`;
    const lastLogged = recentEvents.get(dedupKey);
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
                // Determine if this is a "fatal" table error (doesn't exist, permission denied, etc)
                const isTableMissing = error.message?.includes('does not exist') || 
                                     error.message?.includes('not found') || 
                                     error.code === 'PGRST116' || 
                                     error.code === '42P01';
                
                const isPermissionError = error.code === '42501' || error.status === 403;
                const isBadRequest = error.status === 400 || error.code === 'PGRST100';

                if (isTableMissing || isPermissionError || isBadRequest) {
                    if (!tableUnreachable) {
                        logger.debug(`[audit] Logging suspended for ${RETRY_COOLDOWN_MS/1000}s due to: ${error.message}`);
                    }
                    tableUnreachable = true;
                    lastFailureTime = Date.now();
                }

                // Silently ignore expected errors in production
                const ignoredCodes = ['23503', '42501', 'PGRST301', '42P01', 'PGRST204', 'PGRST116', '42883'];
                if (!ignoredCodes.includes(error.code) && !isTableMissing && !isPermissionError) {
                    logger.debug('Auditoria info:', error.message);
                }
            } else {
                // Success: reset failure state
                tableUnreachable = false;
            }
        });
    }).catch(() => {
        // Silently skip if IP fetch fails
    });
}
