import { NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_ERP_BASE_URL = "https://bigjack-rp.vercel.app";

function getUpstreamUrl() {
  const baseUrl = process.env.ERP_BASE_URL || DEFAULT_ERP_BASE_URL;
  return `${baseUrl.replace(/\/$/, "")}/api/online-orders`;
}

function getApiKey() {
  return process.env.ERP_ONLINE_ORDERS_KEY || process.env.ONLINE_ORDERS_API_KEY || null;
}

export async function POST(request) {
  const upstreamUrl = getUpstreamUrl();
  const apiKey = getApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Falta configurar ERP_ONLINE_ORDERS_KEY u ONLINE_ORDERS_API_KEY." },
      { status: 500 }
    );
  }

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-online-orders-key": apiKey,
      },
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

    const isGenericUpstreamError =
      upstream.status >= 500 &&
      typeof body?.error === "string" &&
      body.error.trim().toLowerCase() === "no se pudo registrar el pedido.";

    if (isGenericUpstreamError) {
      return NextResponse.json(
        {
          ...body,
          error: "El ERP devolvio un error interno al registrar el pedido.",
          upstreamStatus: upstream.status,
          hint: "Revisa logs del ERP (modulo online-orders, creacion de venta, stock e inventario).",
        },
        { status: upstream.status }
      );
    }

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    if (error?.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Tiempo de espera agotado al conectar con el ERP." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "No se pudo conectar con el ERP de pedidos." },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
