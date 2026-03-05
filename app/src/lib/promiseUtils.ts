/**
 * Executa uma operação assíncrona com um limite de tempo (timeout).
 * Utiliza AbortController para cancelar a operação original se o tempo esgotar.
 */
export async function withTimeout<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number = 5000,
    context: string = 'Promise'
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fn(controller.signal);
    } catch (err: any) {
        if (controller.signal.aborted || err?.name === 'AbortError') {
            throw new Error(`TIMEOUT_EXCEEDED:${context}`);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}
