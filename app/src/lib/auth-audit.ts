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

export function logAuditEvent(event: string, userId?: string, metadata?: any) {
    try {
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
            return;
        }
        recentEvents.set(dedupKey, now);

        // Fire and forget - COMPLETELY DEFENSIVE
        getClientIP().then(ip => {
            // Mapping allowed fields based on database schema
            const logData: any = {
                action: event,
                user_id: userId || null,
                ip_address: ip,
                user_agent: navigator.userAgent,
                // Map metadata to details for safety, but also send as metadata if allowed
                details: metadata || {},
                metadata: metadata || {},
                // Optional fields with fallbacks
                status: (metadata as any)?.status || 'info',
                email: (metadata as any)?.email || null,
                project_id: (metadata as any)?.projectId || (metadata as any)?.project_id || null,
                entity_type: (metadata as any)?.entityType || null,
                entity_id: (metadata as any)?.entityId || null
            };

            // Remove any field that might be undefined to avoid Supabase errors
            Object.keys(logData).forEach(key => {
                if (logData[key] === undefined) delete logData[key];
            });

            supabase.from('audit_logs')
                .insert(logData)
                .then(({ error }) => {
                    if (error) {
                        const isTableMissing = error.code === '42P01' || error.message?.includes('does not exist');
                        if (isTableMissing) {
                            tableUnreachable = true;
                            lastFailureTime = Date.now();
                        }
                        logger.debug('[audit] Log failed silently:', error.message);
                    } else {
                        tableUnreachable = false;
                    }
                })
                .catch(() => {
                    // Fail silently
                });
        }).catch(() => {
            // Silently skip if IP fetch fails
        });
    } catch (err) {
        // Audit logs MUST NEVER block the application
        console.warn('[audit] Critical failure in logging system:', err);
    }
}
