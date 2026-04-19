import { NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_ERP_BASE_URL = "https://bigjack-rp.vercel.app";
const DEFAULT_WEBHOOK_PATH = "/api/webhooks/orders";

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

export async function POST(request) {
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
      body: JSON.stringify(payload),
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
        { success: false, error: "Tiempo de espera agotado al conectar con el webhook." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "No se pudo conectar con el webhook de pedidos." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
