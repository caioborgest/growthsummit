/**
 * Executa uma promise com um limite de tempo (timeout).
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000, context: string = 'Promise'): Promise<T> {
    let timeoutId: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`TIMEOUT_EXCEEDED:${context}`)), timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}
