// Cloudflare Turnstile (anti-bots) — verificación en el servidor.
// Claves: NEXT_PUBLIC_TURNSTILE_SITE_KEY (pública) y TURNSTILE_SECRET_KEY (solo servidor, nunca en el repo).
// En desarrollo, si no están configuradas, se usan las claves de prueba oficiales de Cloudflare
// (siempre aprueban): https://developers.cloudflare.com/turnstile/troubleshooting/testing/

import { TURNSTILE_ACTION } from "./turnstileConfig";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";
const isDev = process.env.NODE_ENV !== "production";

function getSecret() {
  return process.env.TURNSTILE_SECRET_KEY || (isDev ? TEST_SECRET_KEY : "");
}

export function isTurnstileEnabled() {
  return Boolean(getSecret());
}

// Decide si la respuesta de siteverify es aceptable para este pedido.
export function evaluateSiteverify(result, { action = TURNSTILE_ACTION, hostname, testMode = false } = {}) {
  if (!result || result.success !== true) {
    return { ok: false, reason: (result?.["error-codes"] || ["invalid"]).join(",") };
  }
  // Las claves de prueba no devuelven acción ni hostname reales.
  if (!testMode) {
    if (result.action && result.action !== action) return { ok: false, reason: "action-mismatch" };
    if (hostname && result.hostname && result.hostname !== hostname) return { ok: false, reason: "hostname-mismatch" };
  }
  return { ok: true };
}

/**
 * Verifica el token con Cloudflare. Cada token sirve una sola vez y dura 5 minutos,
 * así que un token no se puede reutilizar para crear pedidos en masa.
 */
export async function verifyTurnstile(token, { remoteip, hostname, fetchImpl = fetch } = {}) {
  const secret = getSecret();
  if (!secret) return { ok: true, skipped: true };
  if (typeof token !== "string" || !token || token.length > 2048) return { ok: false, reason: "missing-token" };

  const form = new URLSearchParams({ secret, response: token });
  if (remoteip && remoteip !== "local") form.set("remoteip", remoteip);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl(SITEVERIFY_URL, { method: "POST", body: form, signal: controller.signal, cache: "no-store" });
    const result = await response.json();
    return evaluateSiteverify(result, { hostname, testMode: secret === TEST_SECRET_KEY });
  } catch (error) {
    return { ok: false, reason: error?.name === "AbortError" ? "timeout" : "network" };
  } finally {
    clearTimeout(timeout);
  }
}
