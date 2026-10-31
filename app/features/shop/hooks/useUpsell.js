"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { menuItems } from "../../../data/menuData";
import { MAX_QTY_PER_ITEM, PRIMARY_CATEGORIES, SIDES_CATEGORY, UPSELL_SLUGS } from "../constants";

const UPSELL_ITEMS = UPSELL_SLUGS.map((slug) => menuItems.find((item) => item.slug === slug)).filter(
  (item) => item && item.available !== false
);

const isDrink = (category) => category === "BEBIDAS";

/**
 * Sugerencia de complementos tras agregar una hamburguesa.
 * Se muestra una sola vez por visita y solo si al pedido le falta guarnición o bebida.
 */
export default function useUpsell() {
  const [isOpen, setIsOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const shownRef = useRef(false);

  const maybeShow = useCallback((product, cart) => {
    if (shownRef.current || !PRIMARY_CATEGORIES.includes(product.category)) return;
    const hasSide = cart.some((item) => item.category === SIDES_CATEGORY);
    const hasDrink = cart.some((item) => isDrink(item.category));
    if (hasSide && hasDrink) return;

    shownRef.current = true;
    setQuantities({});
    setIsOpen(true);
  }, []);

  const change = useCallback((slug, delta) => {
    setQuantities((current) => ({
      ...current,
      [slug]: Math.max(0, Math.min(MAX_QTY_PER_ITEM, (current[slug] || 0) + delta)),
    }));
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuantities({});
  }, []);

  // Devuelve las entradas elegidas para que el llamador las agregue al carrito.
  const confirm = useCallback(() => {
    const entries = UPSELL_ITEMS.filter((item) => quantities[item.slug] > 0).map((item) => ({
      product: item,
      option: item.options?.[0],
      quantity: quantities[item.slug],
    }));
    close();
    return entries;
  }, [close, quantities]);

  const subtotal = useMemo(
    () =>
      UPSELL_ITEMS.reduce(
        (sum, item) => sum + (item.options?.[0]?.price || 0) * (quantities[item.slug] || 0),
        0
      ),
    [quantities]
  );

  return { isOpen, items: UPSELL_ITEMS, quantities, subtotal, maybeShow, change, confirm, close };
}
