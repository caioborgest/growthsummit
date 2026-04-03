import { logger } from './logger';

/**
 * Normalizes a date string to noon UTC to avoid timezone shifts.
 * Use this whenever parsing a date-only string from the database.
 */
export const normalizeDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    try {
        // Handle ISO strings with time already included
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        }
        // Handle date-only strings by appending noon
        return new Date(`${dateStr}T12:00:00`);
    } catch (e) {
        logger.error('Error normalizing date:', { dateStr, error: e });
        return null;
    }
};

/**
 * Formats a date or date string using the standard project pattern (pt-BR).
 */
export const formatDate = (date: Date | string | undefined, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }): string => {
    if (!date) return 'Data a definir';
    
    const d = typeof date === 'string' ? normalizeDate(date) : date;
    if (!d || isNaN(d.getTime())) return 'Data inválida';
    
    return d.toLocaleDateString('pt-BR', options);
};

/**
 * Formats a time string (HH:mm:ss or HH:mm) to shorter version.
 */
export const formatTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '--:--';
    return timeStr.substring(0, 5);
};

/**
 * Returns a relative date string (Hoje, Amanhã, etc.)
 */
export const getRelativeDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? normalizeDate(date) : date;
    if (!d || isNaN(d.getTime())) return '';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff === -1) return 'Ontem';
    if (diff > 1 && diff < 7) {
        return d.toLocaleDateString('pt-BR', { weekday: 'long' });
    }
    
    return formatDate(d);
};
