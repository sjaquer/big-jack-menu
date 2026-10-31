"use client";

import { createContext, useContext } from "react";

const CartContext = createContext(null);

export function CartProvider({ value, children }) {
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartDrawer() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartDrawer debe usarse dentro de CartProvider");
  }
  return context;
}
