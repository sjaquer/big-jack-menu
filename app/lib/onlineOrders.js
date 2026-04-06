function normalizePaymentMethod(method) {
  const value = String(method || "").toLowerCase();
  if (value === "efectivo") return "cash";
  if (value === "tarjeta") return "card";
  return value || "cash";
}

function buildDeliveryNotes({ orderType, deliveryReference, pickupTime, scheduledTime, locationLink }) {
  const chunks = [];

  if (orderType === "delivery" && deliveryReference) {
    chunks.push(`Referencia: ${deliveryReference}`);
  }

  if (orderType === "pickup") {
    if (pickupTime === "now") chunks.push("Recojo: inmediato (15-20 min)");
    if (pickupTime === "schedule" && scheduledTime) chunks.push(`Recojo programado: ${scheduledTime}`);
  }

  if (locationLink) {
    chunks.push(`Ubicacion: ${locationLink}`);
  }

  return chunks.join(" | ");
}

export function buildOnlineOrderPayload(input) {
  const {
    cart,
    customerName,
    paymentMethod,
    notes,
    orderType,
    deliveryAddress,
    deliveryReference,
    pickupTime,
    scheduledTime,
    locationLink,
    isPreOrder,
  } = input;

  const orderDate = new Date().toISOString();
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const extraNotes = buildDeliveryNotes({
    orderType,
    deliveryReference,
    pickupTime,
    scheduledTime,
    locationLink,
  });

  const composedNotes = [notes?.trim(), extraNotes].filter(Boolean).join(" | ");
  const externalOrderId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    externalOrderId,
    orderDate,
    customerName: customerName?.trim() || "Cliente online",
    paymentMethod: normalizePaymentMethod(paymentMethod),
    source: "web",
    status: "pending",
    useCatalogPrice: true,
    acceptPriceDiff: true,
    enforceStock: false,
    totalAmount,
    notes: composedNotes || undefined,
    deliveryAddress: orderType === "delivery" ? deliveryAddress?.trim() || undefined : undefined,
    items: cart.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      productName: item.name,
      unitPrice: item.price,
      lineNotes: item.optionLabel,
    })),
    metadata: {
      origin: "big-jack-menu-web",
      channel: "web",
      orderType,
      pickupTime,
      scheduledTime: scheduledTime || null,
      isPreOrder: Boolean(isPreOrder),
      locationLink: locationLink || null,
    },
  };
}

export async function createOnlineOrder(payload) {
  const response = await fetch("/api/online-orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo registrar el pedido en el sistema.");
  }

  return data;
}
