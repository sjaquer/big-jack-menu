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
            className="w-full rounded-xl bg-[#FCC900] border-3 border-black text-black font-black px-5 py-4 shadow-2xl flex items-center justify-between gap-4 active:scale-[0.99] transition-all"
            aria-label="Ver carrito"
          >
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest text-black/80 font-black">
                [ TU PEDIDO ]
              </p>
              <p className="text-xl font-anton tracking-wide">{totalItems} PRODUCTO(S)</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-anton tracking-wide">S/ {total.toFixed(2)}</span>
              <div className="w-10 h-10 rounded-lg bg-black text-[#FCC900] grid place-content-center shadow-md">
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
          className="lg:hidden fixed bottom-6 right-6 z-40 p-4 bg-[#FCC900] border-3 border-black text-black rounded-2xl hover:bg-white transition-all shadow-2xl active:scale-95"
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={26} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 border-2 border-black text-white text-xs font-black min-w-[28px] h-7 flex items-center justify-center rounded-full shadow-lg px-2">
              {totalItems}
            </span>
          )}
        </button>
      )}
    </>
  );
}
