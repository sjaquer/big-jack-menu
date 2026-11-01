import { PAYMENT_METHODS } from "../constants";

export const PAYMENT_LABELS = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.id, method.label])
);

export function normalizePhoneForDisplay(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return `+${digits}`;
}

export function buildDeliveryPaymentReminder(selectedMethod, businessNumber) {
  if (!["yape", "plin", "tarjeta"].includes(selectedMethod)) return null;

  if (selectedMethod === "tarjeta") {
    return {
      title: "Pago por tarjeta",
      body: "Recuerda solicitar por WhatsApp el link de pago para completar tu delivery.",
    };
  }

  const methodLabel = selectedMethod === "yape" ? "Yape" : "Plin";
  return {
    title: `Pago por ${methodLabel}`,
    body: `Recuerda realizar el pago al número oficial de BIG JACK: ${businessNumber}.`,
  };
}

export function buildFriendlyOrderError(rawMessage) {
  const fallback = "Algo falló de nuestro lado, no del tuyo. Inténtalo otra vez o escríbenos al WhatsApp.";
  if (!rawMessage || typeof rawMessage !== "string") return fallback;

  if (/webhook/i.test(rawMessage)) {
    return "Se nos cruzaron los cables un momento. Inténtalo otra vez en unos minutos o escríbenos al WhatsApp.";
  }

  return rawMessage;
}

export function buildWhatsappOrderMessage({
  migratedCart,
  orderType,
  customerName,
  customerPhone,
  paymentMethod,
  total,
  deliveryAddress,
  deliveryReference,
  deliveryDetails,
  locationLink,
  notes,
  paymentReminder,
}) {
  const cartLines = migratedCart
    .map((item) => `• *${item.quantity}x* ${item.name} _(${item.optionLabel})_`)
    .join("\n");
  const orderMode = orderType === "delivery" ? "🛵 Delivery" : "🏪 Recojo en Tienda";

  const paymentIcons = {
    efectivo: "💵 Efectivo",
    yape: "📱 Yape",
    plin: "📱 Plin",
    tarjeta: "💳 Tarjeta",
  };
  const paymentLabel = paymentIcons[paymentMethod] || paymentMethod;

  const referenceText = [deliveryReference, deliveryDetails]
    .map((value) => (value || "").trim())
    .filter(Boolean)
    .join(" | ");

  const deliveryBlock =
    orderType === "delivery"
      ? `\n📍 *DATOS DE ENTREGA*\n• *Dirección:* ${deliveryAddress || "No especificada"}\n• *Referencia:* ${referenceText || "No especificada"}\n• *Ubicación GPS:* ${locationLink || "No compartida"}`
      : "";

  const notesBlock = notes?.trim() ? `\n📝 *NOTAS DEL PEDIDO*\n• _${notes.trim()}_` : "";

  const paymentReminderBlock = paymentReminder
    ? `\n⚠️ *${paymentReminder.title.toUpperCase()}*\n• ${paymentReminder.body}`
    : "";

  const lines = [
    "🍔 *¡NUEVO PEDIDO REGISTRADO!* 🍔",
    "",
    "¡Hola, *BIG JACK*! 👋🏻 Te mando mi pedido de la carta web:",
    "",
    "━━━━━━━━━━━━━━━━━━━",
    "📝 *DETALLE DEL PEDIDO*",
    "━━━━━━━━━━━━━━━━━━━",
    cartLines,
    "",
    "👤 *DATOS DEL CLIENTE*",
    `• *Nombre:* ${customerName}`,
    `• *Teléfono:* ${customerPhone || "No especificado"}`,
    `• *Tipo de pedido:* ${orderMode}`,
    `• *Método de pago:* ${paymentLabel}`,
    `• *Total:* *S/ ${total.toFixed(2)}*${orderType === "delivery" ? " _(sin costo de envío)_" : ""}`,
  ];

  if (deliveryBlock) lines.push(deliveryBlock);
  if (notesBlock) lines.push(notesBlock);
  if (paymentReminderBlock) lines.push(paymentReminderBlock);

  lines.push("", "━━━━━━━━━━━━━━━━━━━", "_Quedo atento(a) a la confirmación por aquí. ¡Gracias!_");

  return lines.join("\n");
}
