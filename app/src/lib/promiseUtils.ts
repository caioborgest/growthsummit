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
        const isAbortError = err?.name === 'AbortError' ||
                             err?.message?.includes('AbortError') ||
                             err?.message?.includes('aborted');

        if (controller.signal.aborted) {
            throw new Error(`TIMEOUT_EXCEEDED:${context}`);
        }
        if (isAbortError) {
            // Se o erro foi um abort mas NÃO foi o nosso timeout, repassar como abort puro
            const abortErr = new Error(err?.message || 'aborted');
            abortErr.name = 'AbortError';
            throw abortErr;
        }
        throw err;
    }
 finally {
        clearTimeout(timer);
    }
}
