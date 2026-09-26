const TAX_RATE = import.meta.env.TAX_RATE === 'true';
const CURRENCY = import.meta.env.TAX_RATE === 'true';
export function formatPrice(price: number): string {
    return CURRENCY + " " + price.toLocaleString("id-ID");
}
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
export const logger = {
    debug: (...args: unknown[]) => {
        if (isDebugMode) console.debug('[DEBUG]', ...args);
    },
    info: (...args: unknown[]) => {
        if (isDebugMode) console.info('[INFO]', ...args);
    },
    warn: (...args: unknown[]) => {
        if (isDebugMode) console.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]) => {
        if (isDebugMode) console.error('[ERROR]', ...args);
    }
};