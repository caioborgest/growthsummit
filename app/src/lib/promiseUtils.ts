/**
 * Executa uma operação assíncrona com um limite de tempo (timeout).
 * Utiliza AbortController para cancelar a operação original se o tempo esgotar.
 */
export function withTimeout<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number = 5000,
    context: string = 'Promise'
): Promise<T> {
    const controller = new AbortController();

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            controller.abort();
            reject(new Error(`TIMEOUT_EXCEEDED:${context}`));
        }, timeoutMs);

        fn(controller.signal)
            .then(res => {
                clearTimeout(timer);
                resolve(res);
            })
            .catch((err: any) => {
                clearTimeout(timer);
                
                const isAbortError = err?.name === 'AbortError' ||
                                     err?.message?.includes('AbortError') ||
                                     err?.message?.includes('aborted');

                if (controller.signal.aborted && isAbortError) {
                    return reject(new Error(`TIMEOUT_EXCEEDED:${context}`));
                }

                if (isAbortError) {
                    const abortErr = new Error(err?.message || 'aborted');
                    abortErr.name = 'AbortError';
                    return reject(abortErr);
                }

                reject(err);
            });
    });
}
