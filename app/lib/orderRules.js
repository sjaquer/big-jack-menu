// Reglas del pedido aplicadas en el SERVIDOR (no se confía en el navegador).
// Valida el cuerpo recibido y reconstruye el pedido para el ERP con una lista blanca
// de campos y la misma forma que `buildOnlineOrderPayload` (contrato en docs/webhook-pedidos.md).
import {
  COMPLEMENT_CATEGORIES,
  MAX_CART_ITEMS,
  MAX_QTY_PER_ITEM,
  PAYMENT_METHODS,
  PRIMARY_CATEGORIES,
} from "../features/shop/constants";
import { isOpenNow } from "./openHours";

export const LIMITS = { name: 60, phone: 20, notes: 400, address: 160, itemNotes: 80, scheduledTime: 40 };

const EVENT_ID = /^[A-Za-z0-9._:-]{8,100}$/;
const PHONE = /^[+\d\s()-]{6,20}$/;
// Solo links de ubicación que arma la propia web (useGeolocation).
const LOCATION_LINK = /^https:\/\/www\.google\.com\/maps\?q=-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/;
const PAYMENT_ALIASES = { cash: "efectivo", card: "tarjeta" };

const fail = (error, status = 400) => ({ ok: false, status, error });

function text(value, max) {
  if (typeof value !== "string") return "";
  // Quita caracteres de control (salvo saltos de línea) y recorta.
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim().slice(0, max);
}

/**
 * @returns {{ ok: true, order: object } | { ok: false, status: number, error: string }}
 */
export function validateOrder(body, { catalog, now = new Date(), hours } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("El pedido no tiene un formato válido.");

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  if (!EVENT_ID.test(eventId)) return fail("El pedido debe incluir un eventId válido.");

  // --- Ítems ---
  if (!Array.isArray(body.items) || body.items.length === 0) return fail("El pedido debe incluir productos.");
  if (body.items.length > MAX_CART_ITEMS) return fail("El pedido tiene demasiados productos.");

  const items = [];
  const categories = new Set();
  let total = 0;
  for (const raw of body.items) {
    const sku = typeof raw?.sku === "string" ? raw.sku.trim() : "";
    const product = catalog.get(sku);
    if (!product) return fail("Hay un producto que ya no está disponible. Actualiza la página.");

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) return fail("La cantidad de cada producto debe ser un entero mayor a 0.");
    if (quantity > MAX_QTY_PER_ITEM) return fail(`La cantidad máxima por producto es ${MAX_QTY_PER_ITEM} unidades.`);
    if (raw.price !== undefined && Math.abs(Number(raw.price) - product.price) > 0.01) {
      return fail(`El precio de ${product.name} no coincide con la carta.`);
    }

    total += quantity;
    categories.add(product.category);
    const notes = text(raw.notes, LIMITS.itemNotes);
    items.push({ sku, quantity, ...(notes ? { notes } : {}) });
  }
  if (total > MAX_CART_ITEMS) return fail(`El pedido no puede superar las ${MAX_CART_ITEMS} unidades.`);

  const hasPrimary = PRIMARY_CATEGORIES.some((category) => categories.has(category));
  const hasComplement = COMPLEMENT_CATEGORIES.some((category) => categories.has(category));
  if (hasComplement && !hasPrimary) return fail("Las bebidas se venden solo con una hamburguesa.");

  // --- Cliente ---
  const customerName = text(body.customerName ?? body.customer?.name, LIMITS.name) || "Cliente online";
  const rawPhone = text(body.customerPhone ?? body.customer?.phone, LIMITS.phone);
  if (rawPhone && !PHONE.test(rawPhone)) return fail("El teléfono no es válido.");
  const customerPhone = rawPhone || null;

  // --- Entrega, pago y horario ---
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const orderType = metadata.orderType;
  if (orderType !== "pickup" && orderType !== "delivery") return fail("Elige recojo o delivery.");

  const paymentId = PAYMENT_ALIASES[body.paymentMethod] || body.paymentMethod;
  const payment = PAYMENT_METHODS.find((method) => method.id === paymentId);
  if (!payment) return fail("Elige un método de pago válido.");
  if (orderType === "delivery" && !payment.delivery) return fail("Para delivery aceptamos Yape, Plin o tarjeta.");

  // El servidor decide si es pre-orden (no se confía en el reloj del cliente).
  const isOpen = isOpenNow(now, hours);
  if (!isOpen && orderType !== "pickup") return fail("Fuera de horario solo hay pre-orden para recojo.");

  const deliveryAddress = orderType === "delivery" ? text(metadata.deliveryAddress, LIMITS.address) || null : null;
  const linkCandidate = typeof metadata.locationLink === "string" ? metadata.locationLink.trim() : "";
  const locationLink = LOCATION_LINK.test(linkCandidate) ? linkCandidate : null;
  if (orderType === "delivery" && !deliveryAddress && !locationLink) {
    return fail("Ingresa tu dirección o comparte tu ubicación.");
  }

  const notes = text(body.notes, LIMITS.notes);
  const pickupTime = metadata.pickupTime === "schedule" ? "schedule" : "now";
  const scheduledTime = text(metadata.scheduledTime, LIMITS.scheduledTime) || null;

  return {
    ok: true,
    order: {
      eventId,
      orderDate: now.toISOString(),
      source: "menu-web",
      customerName,
      customerPhone,
      customer: { name: customerName, phone: customerPhone },
      paymentMethod: payment.id,
      ...(notes ? { notes } : {}),
      items,
      metadata: {
        origin: "menu-web",
        channel: "menu-web",
        orderType,
        pickupTime,
        scheduledTime,
        isPreOrder: !isOpen,
        locationLink,
        deliveryAddress,
      },
    },
  };
}
