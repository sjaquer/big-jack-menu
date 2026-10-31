// Índice de SKUs vendibles: sku → { price, name, category }. Fuente: menuData.js.
export function buildSkuIndex(menuItems = []) {
  const index = new Map();
  for (const item of menuItems) {
    if (!item || item.available === false) continue;
    for (const option of item.options || []) {
      if (!option?.sku) continue;
      index.set(option.sku.trim(), {
        price: Number(option.price),
        name: `${item.name} (${option.label})`,
        category: item.category,
      });
    }
  }
  return index;
}
