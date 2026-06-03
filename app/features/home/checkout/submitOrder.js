import { buildOnlineOrderPayload, createOnlineOrder } from "../../../lib/onlineOrders";
import { hasMissingSku, migrateLegacyCartItems } from "../../../lib/cartModel";

function getActiveMenuSkus(menuItems = []) {
  const skus = new Set();

  for (const item of menuItems) {
    if (!item || item.available === false) continue;

    const optionSkus = Array.isArray(item.options) ? item.options.map((option) => option?.sku) : [];
    for (const sku of optionSkus) {
      if (typeof sku === "string" && sku.trim()) {
        skus.add(sku.trim());
      }
    }

    if (typeof item.sku === "string" && item.sku.trim()) {
      skus.add(item.sku.trim());
    }
  }

  return skus;
}

export async function submitOnlineOrder({
  cart,
  orderType,
  isPreOrder,
  isOpen,
  customerName,
  customerPhone,
  paymentMethod,
  deliveryAddress,
  locationLink,
  notes,
  deliveryReference,
  deliveryDetails,
  menuItems,
}) {
  if (!cart?.length) {
    throw new Error("Tu carrito está vacío.");
  }

  if (isPreOrder && orderType === "delivery") {
    throw new Error("Las pre-ordenes solo están disponibles para recojo en tienda. Cambia a 'Recojo' para continuar.");
  }

  if (!isPreOrder && !isOpen) {
    throw new Error("Estamos cerrados ahora. El envío de pedidos está deshabilitado hasta la próxima apertura.");
  }

  if (!customerName?.trim()) {
    throw new Error("Por favor ingresa tu nombre.");
  }

  if (orderType === "delivery" && paymentMethod === "efectivo") {
    throw new Error("Para delivery aceptamos Yape, Plin o Tarjeta. Por favor elige uno de esos métodos.");
  }

  if (orderType === "delivery" && !deliveryAddress?.trim() && !locationLink) {
    throw new Error("Por favor ingresa tu dirección o comparte tu ubicación.");
  }

  const migratedCart = migrateLegacyCartItems(cart, menuItems);
  if (hasMissingSku(migratedCart) || migratedCart.length !== cart.length) {
    throw new Error("Hay productos sin SKU válido. Actualiza el carrito para poder enviar el pedido.");
  }

  const activeSkus = getActiveMenuSkus(menuItems);
  const hasUnknownSku = migratedCart.some((item) => !activeSkus.has(String(item.sku || "").trim()));
  if (hasUnknownSku) {
    throw new Error("Hay productos desactualizados en tu carrito. Vacialo y vuelve a agregar desde el menu actual.");
  }

  const mergedDeliveryReference = [deliveryReference, deliveryDetails]
    .map((value) => (value || "").trim())
    .filter(Boolean)
    .join(" | ");

  const payload = buildOnlineOrderPayload({
    cart: migratedCart,
    customerName,
    customerPhone,
    paymentMethod,
    notes,
    orderType,
    deliveryAddress,
    deliveryReference: mergedDeliveryReference,
    pickupTime: "now",
    scheduledTime: "",
    locationLink,
    isPreOrder,
  });

  const response = await createOnlineOrder(payload);
  return { response, migratedCart };
}
