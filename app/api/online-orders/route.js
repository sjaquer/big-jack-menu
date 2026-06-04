import { NextResponse } from "next/server";
import { menuItems } from "../../data/menuData.js";
import {
  MAX_QTY_PER_ITEM,
  MAX_CART_ITEMS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "../../features/home/constants.js";

const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_ERP_BASE_URL = "https://bigjack-rp.vercel.app";
const DEFAULT_WEBHOOK_PATH = "/api/webhooks/orders";

const ipCache = new Map();

function cleanIpCache(now) {
  for (const [key, val] of ipCache.entries()) {
    const filtered = val.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (filtered.length === 0) {
      ipCache.delete(key);
    } else {
      ipCache.set(key, filtered);
    }
  }
}

const skuCatalog = new Map();
for (const item of menuItems) {
  if (item.available === false) continue;

  if (Array.isArray(item.options)) {
    for (const option of item.options) {
      if (option?.sku) {
        skuCatalog.set(option.sku.trim(), {
          price: option.price,
          name: `${item.name} (${option.label})`,
        });
      }
    }
  } else if (item.sku) {
    skuCatalog.set(item.sku.trim(), {
      price: item.price || 0,
      name: item.name,
    });
  }
}

function getWebhookUrl() {
  const directUrl = process.env.WEBHOOK_ORDERS_URL;
  if (directUrl) return directUrl;

  const baseUrl = process.env.ERP_BASE_URL || DEFAULT_ERP_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}${DEFAULT_WEBHOOK_PATH}`;
}

function getWebhookSecret() {
  return (
    process.env.WEBHOOK_MENU_SECRET ||
    process.env.WEBHOOK_SECRET ||
    process.env.ERP_WEBHOOK_SECRET ||
    null
  );
}

function normalizePayloadForWebhook(payload) {
  const customerName =
    typeof payload?.customerName === "string"
      ? payload.customerName.trim()
      : typeof payload?.customer?.name === "string"
      ? payload.customer.name.trim()
      : "";

  const customerPhone =
    typeof payload?.customerPhone === "string"
      ? payload.customerPhone.trim()
      : typeof payload?.customer?.phone === "string"
      ? payload.customer.phone.trim()
      : "";

  return {
    ...payload,
    customerName: customerName || "Cliente online",
    customerPhone: customerPhone || null,
    customer: {
      ...(payload?.customer || {}),
      name: customerName || "Cliente online",
      phone: customerPhone || null,
    },
  };
}

export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const now = Date.now();
  cleanIpCache(now);

  let timestamps = ipCache.get(ip) || [];
  timestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      {
        success: false,
        error: "Has superado el límite de pedidos. Por favor, espera 15 minutos antes de volver a intentarlo.",
      },
      { status: 429 }
    );
  }

  const upstreamUrl = getWebhookUrl();
  const webhookSecret = getWebhookSecret();

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "El body debe ser JSON válido." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload?.items) || payload.items.length === 0) {
    return NextResponse.json(
      { success: false, error: "El pedido debe incluir items." },
      { status: 400 }
    );
  }

  if (!payload?.eventId || typeof payload.eventId !== "string") {
    return NextResponse.json(
      { success: false, error: "El pedido debe incluir eventId para idempotencia." },
      { status: 400 }
    );
  }

  const hasInvalidItem = payload.items.some(
    (item) => !item?.sku || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0
  );
  if (hasInvalidItem) {
    return NextResponse.json(
      { success: false, error: "Todos los items deben incluir sku y quantity mayor a 0." },
      { status: 400 }
    );
  }

  let totalItemsCount = 0;
  for (const item of payload.items) {
    const itemSku = String(item.sku || "").trim();
    const qty = Number(item.quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      return NextResponse.json(
        { success: false, error: "La cantidad de cada producto debe ser un entero mayor a 0." },
        { status: 400 }
      );
    }

    if (qty > MAX_QTY_PER_ITEM) {
      return NextResponse.json(
        { success: false, error: `La cantidad máxima por producto es ${MAX_QTY_PER_ITEM} unidades.` },
        { status: 400 }
      );
    }
    totalItemsCount += qty;

    const catalogItem = skuCatalog.get(itemSku);
    if (!catalogItem) {
      return NextResponse.json(
        { success: false, error: `El producto con SKU ${itemSku} no existe o no está disponible.` },
        { status: 400 }
      );
    }

    if (item.price !== undefined && Math.abs(Number(item.price) - catalogItem.price) > 0.01) {
      return NextResponse.json(
        { success: false, error: `El precio para el producto ${catalogItem.name} es incorrecto.` },
        { status: 400 }
      );
    }
  }

  if (totalItemsCount > MAX_CART_ITEMS) {
    return NextResponse.json(
      { success: false, error: `El total de productos en el pedido no puede superar las ${MAX_CART_ITEMS} unidades.` },
      { status: 400 }
    );
  }

  timestamps.push(now);
  ipCache.set(ip, timestamps);

  const normalizedPayload = normalizePayloadForWebhook(payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (webhookSecret) {
      headers["x-webhook-secret"] = webhookSecret;
    }

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(normalizedPayload),
      signal: controller.signal,
    });

    const rawText = await upstream.text();
    let body = {};

    try {
      body = rawText ? JSON.parse(rawText) : {};
    } catch {
      body = { success: upstream.ok, message: rawText || "Respuesta sin JSON" };
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    if (error?.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Tiempo de espera agotado al registrar tu pedido. Intenta nuevamente." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "No se pudo completar el registro del pedido en este momento." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
