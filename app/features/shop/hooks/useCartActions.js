"use client";

import { useCallback } from "react";
import { menuItems } from "../../../data/menuData";
import { COMPLEMENT_CATEGORIES, MAX_CART_ITEMS, MAX_QTY_PER_ITEM } from "../constants";

const LIMIT_MESSAGES = {
  max_items: `Tu pedido no puede tener más de ${MAX_CART_ITEMS} productos en total.`,
  max_per_item: `La cantidad máxima por producto es de ${MAX_QTY_PER_ITEM} unidades.`,
};

function findAvailable(product) {
  const canonical = menuItems.find((entry) => entry.id === product?.id);
  if (!canonical || canonical.available === false) return null;
  return canonical;
}

/**
 * Acciones del carrito con las reglas de negocio y los mensajes al cliente.
 * `cartApi` es el resultado de `useCart`.
 */
export default function useCartActions({ cartApi, showToast, showNotice, onPrimaryAdded }) {
  const { cart, hasPrimaryProduct } = cartApi;

  const addProduct = useCallback(
    (product, optionId, quantity = 1) => {
      const canonical = findAvailable(product);
      if (!canonical) {
        showToast({ type: "error", message: "Este producto no está disponible ahora." });
        return false;
      }

      const option =
        canonical.options?.find((entry) => entry.id === optionId) || canonical.options?.[0];
      if (!option) {
        showToast({ type: "error", message: "No encontramos esa presentación. Elige otra." });
        return false;
      }

      if (COMPLEMENT_CATEGORIES.includes(canonical.category) && !hasPrimaryProduct) {
        showToast({ type: "info", message: "Las bebidas van con hamburguesa. Así es la casa." });
        return false;
      }

      const result = cartApi.addToCart(canonical, option, quantity);
      if (result.added === 0) {
        showToast({ type: "info", message: LIMIT_MESSAGES[result.reason] || LIMIT_MESSAGES.max_per_item });
        return false;
      }

      if (result.added < quantity) {
        showNotice(`Agregamos ${result.added}: llegaste al máximo de ${MAX_QTY_PER_ITEM} por producto.`);
      }

      showToast({ type: "success", message: `Listo. ${canonical.name} ya está en tu pedido.`, duration: 2500 });
      onPrimaryAdded?.(canonical, cart);
      return true;
    },
    [cart, cartApi, hasPrimaryProduct, onPrimaryAdded, showNotice, showToast]
  );

  const addMany = useCallback(
    (entries) => {
      const { added, limitReached } = cartApi.addMany(entries);
      if (limitReached) {
        showNotice(
          `No entró todo: el límite es ${MAX_QTY_PER_ITEM} por producto y ${MAX_CART_ITEMS} en total.`
        );
      }
      if (added > 0) {
        showToast({ type: "success", message: "Listo. Tu pedido quedó completo.", duration: 2500 });
      }
    },
    [cartApi, showNotice, showToast]
  );

  const removeItem = useCallback(
    (id) => {
      const result = cartApi.removeFromCart(id);
      if (result.removed.length > 0) {
        const names = [...new Set(result.removed.map((item) => item.name))].join(", ");
        showNotice(`Quitamos ${names}: las bebidas van con hamburguesa.`);
      }
    },
    [cartApi, showNotice]
  );

  const updateQuantity = useCallback(
    (id, delta) => {
      const result = cartApi.updateQuantity(id, delta);
      if (!result.updated) showNotice(LIMIT_MESSAGES[result.reason] || LIMIT_MESSAGES.max_per_item);
    },
    [cartApi, showNotice]
  );

  return { addProduct, addMany, removeItem, updateQuantity };
}
