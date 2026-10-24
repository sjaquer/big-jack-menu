export const DEFAULT_MAX_QTY_PER_ITEM = 10;
export const DEFAULT_MAX_CART_ITEMS = 30;

export function getCartItemId(productId, optionId) {
  return `${productId}-${optionId || "default"}`;
}

export function getCartItemsCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + Math.max(0, Number(item?.quantity) || 0), 0);
}

export function addItem(items, item, quantity = 1, options = {}) {
  const currentItems = Array.isArray(items) ? items : [];
  const maxPerItem = options.maxPerItem ?? DEFAULT_MAX_QTY_PER_ITEM;
  const maxItems = options.maxItems ?? DEFAULT_MAX_CART_ITEMS;
  const requested = Math.max(1, Number(quantity) || 1);
  const currentTotal = getCartItemsCount(currentItems);
  const remainingTotal = Math.max(0, maxItems - currentTotal);

  if (remainingTotal <= 0) {
    return { items: currentItems, added: 0, reason: "max_items" };
  }

  const existingIndex = currentItems.findIndex((entry) => entry?.id === item.id);
  const existingQuantity = existingIndex >= 0 ? Number(currentItems[existingIndex].quantity) || 0 : 0;
  const remainingForItem = Math.max(0, maxPerItem - existingQuantity);
  const added = Math.min(requested, remainingForItem, remainingTotal);

  if (added <= 0) {
    return { items: currentItems, added: 0, reason: "max_per_item" };
  }

  if (existingIndex >= 0) {
    const nextItems = currentItems.map((entry, index) =>
      index === existingIndex
        ? { ...entry, quantity: (Number(entry.quantity) || 0) + added }
        : entry
    );
    return { items: nextItems, added, reason: null };
  }

  return {
    items: [...currentItems, { ...item, quantity: added }],
    added,
    reason: null,
  };
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
