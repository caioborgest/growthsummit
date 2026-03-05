/**
 * Sistema de Logging Centralizado — Growth Summit 2026
 * ─────────────────────────────────────────────────────────────
 * Em desenvolvimento: Mostra todos os logs no console com emojis
 * Em produção: Silencia logs de debug/info e envia ERROS para telemetria
 *
 * TELEMETRIA:
 * Usa window.onerror + um buffer de erros para capturar erros em produção.
 * Compatível com Sentry, LogRocket ou qualquer SDK externo:
 *   1. Se window.__SENTRY__ existir, usa Sentry.captureException
 *   2. Caso contrário, buffura os erros em window.__errorLog para debug posterior
 *
 * Para integrar Sentry futuramente:
 *   npm install @sentry/react
 *   Em main.tsx: Sentry.init({ dsn: '...' })
 *   O logger.error() já chamará Sentry.captureException automaticamente.
 */

declare global {
    interface Window {
        Sentry?: {
            captureException: (err: Error, ctx?: Record<string, unknown>) => void;
            captureMessage: (msg: string, ctx?: Record<string, unknown>) => void;
        };
        __errorLog?: Array<{ message: string; error?: unknown; ts: string }>;
    }
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface LogContext {
    [key: string]: unknown;
}

/**
 * Captura um erro para telemetria de produção.
 * Usa Sentry se disponível; caso contrário, acumula no window.__errorLog.
 */
function captureError(message: string, error?: unknown, context?: LogContext): void {
    try {
        if (window.Sentry?.captureException) {
            // Sentry instalado → captura com contexto completo
            const err = error instanceof Error ? error : new Error(message);
            window.Sentry.captureException(err, { extra: { message, context, rawError: error } });
        } else {
            // Fallback: buffura para leitura manual (ex: DevTools → window.__errorLog)
            if (!window.__errorLog) window.__errorLog = [];
            window.__errorLog.push({
                message,
                error,
                ts: new Date().toISOString(),
            });
            // Mantém o buffer em no máximo 50 erros para não vazar memória
            if (window.__errorLog.length > 50) {
                window.__errorLog = window.__errorLog.slice(-50);
            }

            // Ainda mostra no console de produção para facilitar depuração
            console.error(`❌ [GrowthSummit] ${message}`, error || '', context || '');
        }
    } catch (_captureErr) {
        // Nunca deixar o sistema de log causar crash na aplicação
        console.error(`❌ ${message}`, error || '');
    }
}

class Logger {
    /**
     * Log genérico (apenas em desenvolvimento)
     */
    log(...args: unknown[]): void {
        if (isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Log informativo (apenas em desenvolvimento)
     */
    info(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.info(`ℹ️ ${message}`, context || '');
        }
    }

    /**
     * Log de aviso
     * DEV: Mostra no console
     * PROD: Silencioso (avisos não são críticos; usar error() para problemas sérios)
     */
    warn(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.warn(`⚠️ ${message}`, context || '');
        }
        // Em produção, warnings são suprimidos para reduzir ruído nos logs
    }

    /**
     * Log de erro
     * DEV: Mostra no console em vermelho
     * PROD: Envia para telemetria (Sentry ou buffer local)
     */
    error(message: string, error?: unknown, context?: LogContext): void {
        if (isDevelopment) {
            console.error(`❌ ${message}`, error || '', context || '');
        } else if (isProduction) {
            captureError(message, error, context);
        }
    }

    /**
     * Log de debug (apenas em desenvolvimento, silencioso em produção)
     */
    debug(message: string, data?: unknown): void {
        if (isDevelopment) {
            console.debug(`🐛 ${message}`, data || '');
        }
    }

    /**
     * Log de sucesso (apenas em desenvolvimento)
     */
    success(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.log(`✅ ${message}`, context || '');
        }
    }

    /**
     * Agrupa logs relacionados (apenas em desenvolvimento)
     */
    group(label: string, callback: () => void): void {
        if (isDevelopment) {
            console.group(label);
            callback();
            console.groupEnd();
        } else {
            callback();
        }
    }

    /**
     * Mede tempo de execução (apenas em desenvolvimento)
     */
    time(label: string): void {
        if (isDevelopment) {
            console.time(label);
        }
    }

    /**
     * Finaliza medição de tempo (apenas em desenvolvimento)
     */
    timeEnd(label: string): void {
        if (isDevelopment) {
            console.timeEnd(label);
        }
    }

    /**
     * Exibe tabela (apenas em desenvolvimento)
     */
    table(data: unknown): void {
        if (isDevelopment) {
            console.table(data);
        }
    }

    /**
     * Retorna o buffer de erros capturados em produção (para diagnóstico)
     * Útil em sessões de suporte: abrir DevTools e chamar window.__errorLog
     */
    getProductionErrors(): Array<{ message: string; error?: unknown; ts: string }> {
        return window.__errorLog || [];
    }
}

// Exporta instância única do logger
export const logger = new Logger();

// Exporta também como default
export default logger;
