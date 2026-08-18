function readPublicValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

// Vite embeds these values in browser JavaScript. They are public client configuration, not secrets.
export const tiandituKey = readPublicValue(import.meta.env.VITE_TIANDITU_KEY);
export const amapWebServiceKey = readPublicValue(import.meta.env.VITE_AMAP_WEB_SERVICE_KEY);
export const qweatherApiKey = readPublicValue(import.meta.env.VITE_QWEATHER_API_KEY);
export const qweatherApiHost = readPublicValue(import.meta.env.VITE_QWEATHER_API_HOST);
