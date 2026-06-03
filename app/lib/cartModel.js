export function getCartItemId(productId, optionId) {
  return `${productId}-${optionId || "default"}`;
}

export function buildCartItem(product, option, quantity = 1) {
  return {
    id: getCartItemId(product.id, option?.id),
    productId: product.id,
    category: product.category,
    name: product.name,
    optionId: option?.id || "default",
    optionLabel: option?.label || "Presentacion unica",
    sku: option?.sku || product.sku || null,
    price: Number(option?.price || 0),
    image: product.image,
    quantity,
  };
}

export function migrateLegacyCartItems(items, menuItems) {
  if (!Array.isArray(items)) return [];

  const itemByProductId = new Map(menuItems.map((entry) => [entry.id, entry]));

  return items
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const product = itemByProductId.get(entry.productId);
      const option = product?.options?.find((opt) => opt.id === entry.optionId) || product?.options?.[0];
      const sku = entry.sku || option?.sku || product?.sku || null;

      return {
        id: entry.id || getCartItemId(entry.productId, entry.optionId),
        productId: entry.productId,
        category: entry.category || product?.category || "OTROS",
        name: entry.name || product?.name || "Producto",
        optionId: entry.optionId || option?.id || "default",
        optionLabel: entry.optionLabel || option?.label || "Presentacion unica",
        sku,
        price: Number(entry.price || option?.price || 0),
        image: entry.image || product?.image || "",
        quantity: Math.max(1, Number(entry.quantity || 1)),
      };
    })
    .filter((entry) => entry && entry.sku);
}

export function hasMissingSku(items) {
  return items.some((entry) => !entry?.sku);
}
