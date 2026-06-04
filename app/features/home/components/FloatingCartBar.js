"use client";

import { ShoppingCart } from "lucide-react";

export default function FloatingCartBar({
  cart = [],
  total = 0,
  isCartOpen,
  suggestionVisible,
  onOpenCart,
}) {
  if (suggestionVisible) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Barra resumen flotante (mobile) */}
      {!isCartOpen && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={onOpenCart}
            className="w-full rounded-2xl bg-gradient-to-r from-[#FCC900] via-[#eeb055] to-[#FCC900] text-black font-black px-5 py-4 shadow-2xl shadow-[#FCC900]/40 flex items-center justify-between gap-4 active:scale-[0.99]"
            aria-label="Ver carrito"
          >
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-[0.4em] text-black/70 font-bold">
                Tu pedido
              </p>
              <p className="text-lg">{totalItems} artículos</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black">S/ {total.toFixed(2)}</span>
              <div className="w-10 h-10 rounded-full bg-black/20 text-black grid place-content-center">
                <ShoppingCart size={20} />
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Botón flotante del carrito (solo cuando no hay resumen activo) */}
      {(cart.length === 0 || isCartOpen) && (
        <button
          onClick={onOpenCart}
          className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-[#FCC900] text-black rounded-full hover:bg-[#e2b500] transition-all shadow-2xl shadow-[#FCC900]/40 active:scale-95"
          style={{
            animation: cart.length > 0 ? "none" : "bounce 2s infinite",
          }}
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={28} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black min-w-[28px] h-7 flex items-center justify-center rounded-full shadow-lg px-2">
              {totalItems}
            </span>
          )}
        </button>
      )}
    </>
  );
}
