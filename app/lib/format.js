// Formato de precios y rangos de la carta.

export function formatPrice(value) {
  const amount = Number(value);
  return `S/ ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

// Precio mínimo y máximo entre las opciones de un producto.
export function getPriceRange(item) {
  const prices = (item?.options || [])
    .map((option) => Number(option?.price))
    .filter((price) => Number.isFinite(price));

  if (!prices.length) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// Rango de toda la carta (para `priceRange` del schema).
export function getMenuPriceRange(items = []) {
  const prices = items.flatMap((item) => {
    const { min, max } = getPriceRange(item);
    return min || max ? [min, max] : [];
  });
  if (!prices.length) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
