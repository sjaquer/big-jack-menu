function normalizePaymentMethod(method) {
  const value = String(method || "").toLowerCase();
  if (value === "cash") return "efectivo";
  if (value === "card") return "tarjeta";
  return value || "efectivo";
}

function buildEventId() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const nonce = Math.random().toString(36).slice(2, 8);
  return `menu-${date}-${nonce}`;
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
    customerPhone,
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
  const extraNotes = buildDeliveryNotes({
    orderType,
    deliveryReference,
    pickupTime,
    scheduledTime,
    locationLink,
  });

  const composedNotes = [notes?.trim(), extraNotes].filter(Boolean).join(" | ");
  const normalizedCustomerName = customerName?.trim() || "Cliente online";
  const normalizedCustomerPhone = customerPhone?.trim() || null;

  return {
    eventId: buildEventId(),
    orderDate,
    source: "menu-web",
    // Compatibilidad con webhooks que leen customerName/customerPhone en raíz.
    customerName: normalizedCustomerName,
    customerPhone: normalizedCustomerPhone,
    customer: {
      name: normalizedCustomerName,
      phone: normalizedCustomerPhone,
    },
    paymentMethod: normalizePaymentMethod(paymentMethod),
    notes: composedNotes || undefined,
    items: cart.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      notes: item.optionLabel || undefined,
    })),
    metadata: {
      origin: "menu-web",
      channel: "menu-web",
      orderType,
      pickupTime,
      scheduledTime: scheduledTime || null,
      isPreOrder: Boolean(isPreOrder),
      locationLink: locationLink || null,
      deliveryAddress: orderType === "delivery" ? deliveryAddress?.trim() || null : null,
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
