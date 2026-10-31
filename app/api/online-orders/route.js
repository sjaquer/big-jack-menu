import { NextResponse } from "next/server";
import { menuItems } from "../../data/menuData.js";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "../../features/shop/constants.js";
import { buildSkuIndex } from "../../lib/catalog.js";
import { validateOrder } from "../../lib/orderRules.js";
import { isTurnstileEnabled, verifyTurnstile } from "../../lib/turnstile.js";
import { TURNSTILE_HEADER } from "../../lib/turnstileConfig.js";

// Proxy al webhook del ERP. El servidor es la fuente de verdad: valida reglas de negocio
// y reenvía solo campos conocidos (ver lib/orderRules.js y docs/webhook-pedidos.md).

const REQUEST_TIMEOUT_MS = 15000;
const MAX_BODY_BYTES = 16 * 1024;
const DEFAULT_ERP_BASE_URL = "https://bigjack-rp.vercel.app";
const DEFAULT_WEBHOOK_PATH = "/api/webhooks/orders";
const GENERIC_ERROR = "No pudimos registrar tu pedido. Intenta otra vez en unos minutos o escríbenos por WhatsApp.";

const catalog = buildSkuIndex(menuItems);
// Contra pedidos en masa: además del máximo por ventana, un pedido cada 20 s por IP.
const MIN_INTERVAL_MS = 20000;
const BOT_ERROR = "No pudimos verificar tu pedido. Recarga la página e inténtalo otra vez.";

if (!isTurnstileEnabled()) {
  console.warn("[online-orders] Turnstile desactivado: falta TURNSTILE_SECRET_KEY.");
}

// Límite por IP en memoria (por instancia). Para un límite global en serverless ver SEC-04.
const ipCache = new Map();

function isRateLimited(ip, now) {
  for (const [key, list] of ipCache) {
    const recent = list.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length) ipCache.set(key, recent);
    else ipCache.delete(key);
  }
  const list = ipCache.get(ip) || [];
  const last = list[list.length - 1];
  return list.length >= RATE_LIMIT_MAX_REQUESTS || (last !== undefined && now - last < MIN_INTERVAL_MS);
}

function registerRequest(ip, now) {
  ipCache.set(ip, [...(ipCache.get(ip) || []), now]);
}

// Si el ERP falla, el intento no cuenta: el cliente puede reintentar sin esperar.
function forgetRequest(ip, now) {
  const list = (ipCache.get(ip) || []).filter((ts) => ts !== now);
  if (list.length) ipCache.set(ip, list);
  else ipCache.delete(ip);
}

function getWebhookUrl() {
  if (process.env.WEBHOOK_ORDERS_URL) return process.env.WEBHOOK_ORDERS_URL;
  const baseUrl = process.env.ERP_BASE_URL || DEFAULT_ERP_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}${DEFAULT_WEBHOOK_PATH}`;
}

function getWebhookSecret() {
  // WEBHOOK_MENU_SECRET es el nombre oficial; los otros quedan por compatibilidad (SEC-11).
  return process.env.WEBHOOK_MENU_SECRET || process.env.WEBHOOK_SECRET || process.env.ERP_WEBHOOK_SECRET || null;
}

// Solo se aceptan pedidos enviados desde el propio sitio (SEC-02).
function isSameOrigin(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    return originHost === host;
  } catch {
    return false;
  }
}

const json = (body, status) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
const error = (message, status) => json({ success: false, error: message }, status);

export async function POST(request) {
  if (!isSameOrigin(request)) return error("Origen no permitido.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return error("El pedido debe enviarse como JSON.", 415);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  if (isRateLimited(ip, now)) {
    return error("Hiciste varios pedidos seguidos. Espera 15 minutos o escríbenos por WhatsApp.", 429);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return error("El pedido es demasiado grande.", 413);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return error("El pedido no tiene un formato válido.", 400);
  }

  const result = validateOrder(body, { catalog, now: new Date(now) });
  if (!result.ok) return error(result.error, result.status);

  // Anti-bots: el token de Turnstile es de un solo uso y se valida antes de tocar el ERP.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const human = await verifyTurnstile(request.headers.get(TURNSTILE_HEADER), {
    remoteip: ip,
    hostname: host.split(":")[0],
  });
  if (!human.ok) {
    console.warn("[online-orders] Turnstile rechazó el pedido:", human.reason);
    return error(BOT_ERROR, 403);
  }

  registerRequest(ip, now);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = { "Content-Type": "application/json" };
    const secret = getWebhookSecret();
    if (secret) headers["x-webhook-secret"] = secret;

    const upstream = await fetch(getWebhookUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(result.order),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await upstream.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!upstream.ok || data.success === false) {
      // La respuesta del ERP se registra en el servidor; al cliente va un mensaje genérico (SEC-09).
      console.error("[online-orders] ERP rechazó el pedido", upstream.status, text.slice(0, 500));
      forgetRequest(ip, now);
      return error(GENERIC_ERROR, upstream.status >= 500 ? 502 : 422);
    }

    const orderId = data.orderId ?? data.order?.id ?? data.id ?? null;
    return json(
      {
        success: true,
        orderId: orderId != null ? String(orderId).slice(0, 64) : null,
        duplicated: Boolean(data.duplicated),
      },
      200
    );
  } catch (err) {
    forgetRequest(ip, now);
    if (err?.name === "AbortError") return error("El sistema tardó demasiado. Intenta otra vez.", 504);
    console.error("[online-orders] Error al llamar al ERP", err?.message);
    return error(GENERIC_ERROR, 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
