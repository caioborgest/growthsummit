/**
 * Sistema de Logging Centralizado
 * 
 * Em desenvolvimento: Mostra todos os logs no console
 * Em produção: Silencia logs e envia erros para monitoramento
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    /**
     * Log informativo (apenas em desenvolvimento)
     */
    log(...args: unknown[]): void {
        if (isDevelopment) {
            console.log(...args);
        }
    }

    /**
     * Log de informação (apenas em desenvolvimento)
     */
    info(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.info(`ℹ️ ${message}`, context || '');
        }
    }

    /**
     * Log de aviso (apenas em desenvolvimento)
     */
    warn(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.warn(`⚠️ ${message}`, context || '');
        }
    }

    /**
     * Log de erro
     * Em desenvolvimento: mostra no console
     * Em produção: envia para serviço de monitoramento
     */
    error(message: string, error?: unknown, context?: LogContext): void {
        if (isDevelopment) {
            console.error(`❌ ${message}`, error || '', context || '');
        } else if (isProduction) {
            // Temporariamente mostrando erro completo para depuração
            console.error(`❌ ${message}`, error || '');
        }
    }

    /**
     * Log de debug (apenas em desenvolvimento)
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
}

// Exporta instância única do logger
export const logger = new Logger();

// Exporta também como default
export default logger;
