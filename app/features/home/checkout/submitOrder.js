import { buildOnlineOrderPayload, createOnlineOrder } from "../../../lib/onlineOrders";
import { hasMissingSku, migrateLegacyCartItems } from "../../../lib/cartModel";

export async function submitOnlineOrder({
  cart,
  orderType,
  isPreOrder,
  isOpen,
  customerName,
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

  const mergedDeliveryReference = [deliveryReference, deliveryDetails]
    .map((value) => (value || "").trim())
    .filter(Boolean)
    .join(" | ");

  const payload = buildOnlineOrderPayload({
    cart: migratedCart,
    customerName,
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
