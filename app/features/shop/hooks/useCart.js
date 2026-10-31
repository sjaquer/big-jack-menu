"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addItem,
  buildCartItem,
  getCartItemsCount,
  migrateLegacyCartItems,
} from "../../../lib/cartModel";
import { readJson, writeJson } from "../../../lib/safeStorage";
import { applyComplementRules } from "../cartRules";
import {
  COMPLEMENT_CATEGORIES,
  MAX_CART_ITEMS,
  MAX_QTY_PER_ITEM,
  PRIMARY_CATEGORIES,
} from "../constants";

export default function useCart({
  menuItems,
  maxPerItem = MAX_QTY_PER_ITEM,
  maxItems = MAX_CART_ITEMS,
} = {}) {
  const [cart, setCart] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const normalize = useCallback(
    (items) =>
      applyComplementRules(
        migrateLegacyCartItems(Array.isArray(items) ? items : [], menuItems || []),
        PRIMARY_CATEGORIES,
        COMPLEMENT_CATEGORIES
      ).items,
    [menuItems]
  );

  useEffect(() => {
    const saved = readJson("cart", []);
    if (Array.isArray(saved) && saved.length > 0) {
      setCart(normalize(saved));
    }
    setIsHydrated(true);

    const handleStorage = () => {
      setCart(normalize(readJson("cart", [])));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [normalize]);

  useEffect(() => {
    if (!isHydrated) return;
    writeJson("cart", cart);
  }, [cart, isHydrated]);

  const addToCart = useCallback(
    (product, option, quantity = 1) => {
      if (!option) return { items: cart, added: 0, reason: "invalid_option" };

      const result = addItem(
        cart,
        buildCartItem(product, option, quantity),
        quantity,
        { maxPerItem, maxItems }
      );

      if (result.added > 0) {
        setCart(
          applyComplementRules(
            result.items,
            PRIMARY_CATEGORIES,
            COMPLEMENT_CATEGORIES
          ).items
        );
      }

      return result;
    },
    [cart, maxItems, maxPerItem]
  );

  const addMany = useCallback(
    (entries = []) => {
      let nextItems = cart;
      let added = 0;
      let limitReached = false;

      entries.forEach(({ product, option, quantity }) => {
        if (!product || !option || quantity <= 0) return;
        const result = addItem(
          nextItems,
          buildCartItem(product, option, quantity),
          quantity,
          { maxPerItem, maxItems }
        );
        added += result.added;
        if (result.added < quantity) limitReached = true;
        nextItems = result.items;
      });

      if (added > 0) {
        nextItems = applyComplementRules(
          nextItems,
          PRIMARY_CATEGORIES,
          COMPLEMENT_CATEGORIES
        ).items;
        setCart(nextItems);
      }

      return { items: nextItems, added, limitReached };
    },
    [cart, maxItems, maxPerItem]
  );

  const removeFromCart = useCallback(
    (id) => {
      const result = applyComplementRules(
        cart.filter((item) => item.id !== id),
        PRIMARY_CATEGORIES,
        COMPLEMENT_CATEGORIES
      );
      setCart(result.items);
      return result;
    },
    [cart]
  );

  const updateQuantity = useCallback(
    (id, delta) => {
      const currentItem = cart.find((item) => item.id === id);

      if (delta > 0 && currentItem?.quantity >= maxPerItem) {
        return { updated: false, reason: "max_per_item" };
      }
      if (delta > 0 && getCartItemsCount(cart) >= maxItems) {
        return { updated: false, reason: "max_items" };
      }

      setCart(
        cart.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            quantity: Math.min(maxPerItem, Math.max(1, item.quantity + delta)),
          };
        })
      );

      return { updated: true, reason: null };
    },
    [cart, maxItems, maxPerItem]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const itemsCount = useMemo(() => getCartItemsCount(cart), [cart]);
  const hasPrimaryProduct = useMemo(
    () => cart.some((item) => PRIMARY_CATEGORIES.includes(item.category)),
    [cart]
  );

  return {
    cart,
    total,
    itemsCount,
    hasPrimaryProduct,
    addToCart,
    addMany,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
