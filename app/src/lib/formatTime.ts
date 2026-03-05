/**
 * formatTime.ts
 * ─────────────────────────────────────────────────────────────
 * Utilitário para formatar horários vindos do banco de dados.
 *
 * CONTEXTO:
 * O banco PostgreSQL armazena os horários do evento como tipo TIME ('HH:MM:SS').
 * O tipo TIME não carrega informação de timezone. O evento ocorre em Triunfo/PE,
 * que usa o fuso horário America/Recife (UTC-3, sem horário de verão).
 *
 * COMO USAR:
 *   formatEventTime('08:30:00')   // → '08:30'
 *   formatEventTime('08:30')      // → '08:30'
 *   formatEventTime(null)         // → ''
 *
 * NOTA: Como os dados são armazenados como TIME (sem data/TZ), e o evento
 * sempre ocorre em Recife/Triunfo (UTC-3), NÃO fazemos conversão de fuso —
 * os horários já representam a hora local do evento.
 * Se o banco migrar para TIMESTAMPTZ, esta função deve ser atualizada.
 */

/**
 * Formata um horário de banco ('HH:MM:SS' ou 'HH:MM') para exibição 'HH:MM'.
 * Retorna string vazia se o valor for nulo, undefined ou inválido.
 */
export function formatEventTime(time: string | null | undefined): string {
    if (!time) return '';

    // Aceita formatos: 'HH:MM:SS', 'HH:MM', ou até ISO parcial '1970-01-01T08:30:00+00:00'
    const match = time.match(/(\d{1,2}):(\d{2})/);
    if (!match) return time; // Retorna original se formato desconhecido

    const [, hours, minutes] = match;
    return `${hours.padStart(2, '0')}:${minutes}`;
}

/**
 * Compara dois horários de evento para ordenação cronológica.
 * Aceita o mesmo formato que formatEventTime.
 */
export function compareEventTimes(a: string | null | undefined, b: string | null | undefined): number {
    const normalize = (t: string | null | undefined) => {
        if (!t) return '99:99';
        const match = t.match(/(\d{1,2}):(\d{2})/);
        if (!match) return t;
        return `${match[1].padStart(2, '0')}:${match[2]}`;
    };
    return normalize(a).localeCompare(normalize(b));
}
