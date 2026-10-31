// Configuración pública de Cloudflare Turnstile (la usan navegador y servidor).
// La clave secreta NO va aquí: está solo en lib/turnstile.js (servidor) vía TURNSTILE_SECRET_KEY.
const isDev = process.env.NODE_ENV !== "production";

// Clave de prueba oficial de Cloudflare (siempre aprueba) para desarrollo sin configuración.
export const TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (isDev ? TEST_SITE_KEY : "");
export const TURNSTILE_ACTION = "checkout";
export const TURNSTILE_HEADER = "x-turnstile-token";
