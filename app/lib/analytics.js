// Eventos de Google Analytics 4 (comercio electrónico recomendado por Google).
// Si Analytics no está cargado (sin NEXT_PUBLIC_GA_ID o bloqueado), no hace nada.
// Los clics a WhatsApp, PedidosYa y Rappi los mide la "medición mejorada" de GA4 (outbound clicks).

const CURRENCY = "PEN";

export function track(name, params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

// Ítem GA4 desde un ítem de carrito ({ sku, name, optionLabel, category, price, quantity }).
export function toGaItem(item) {
  return {
    item_id: item.sku,
    item_name: item.name,
    item_variant: item.optionLabel,
    item_category: item.category,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  };
}

// Ítem GA4 desde un producto de la carta y una de sus opciones.
export function productToGaItem(product, option = product?.options?.[0], quantity = 1) {
  return toGaItem({
    sku: option?.sku || product?.sku,
    name: product?.name,
    optionLabel: option?.label,
    category: product?.category,
    price: option?.price,
    quantity,
  });
}

export function buildEcommerceParams(gaItems = []) {
  const value = gaItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { currency: CURRENCY, value: Math.round(value * 100) / 100, items: gaItems };
}

export const analytics = {
  viewItem: (product) => track("view_item", buildEcommerceParams([productToGaItem(product)])),
  addToCart: (product, option, quantity) =>
    track("add_to_cart", buildEcommerceParams([productToGaItem(product, option, quantity)])),
  removeFromCart: (cartItem) => track("remove_from_cart", buildEcommerceParams([toGaItem(cartItem)])),
  viewCart: (cart) => track("view_cart", buildEcommerceParams(cart.map(toGaItem))),
  beginCheckout: (cart) => track("begin_checkout", buildEcommerceParams(cart.map(toGaItem))),
  purchase: ({ orderId, cart, orderType, paymentMethod, isPreOrder }) =>
    track("purchase", {
      ...buildEcommerceParams(cart.map(toGaItem)),
      transaction_id: orderId || undefined,
      shipping_tier: orderType,
      payment_type: paymentMethod,
      pre_order: Boolean(isPreOrder),
    }),
  whatsappOrder: (orderId) => track("whatsapp_order_sent", { order_id: orderId || undefined }),
  gameStart: () => track("game_start", { game_name: "arma_tu_burger" }),
  gameOver: (score, isRecord) => track("post_score", { score, level: score, character: "burger", new_record: isRecord }),
};
