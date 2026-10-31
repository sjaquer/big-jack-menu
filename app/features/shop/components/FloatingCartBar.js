"use client";

import { formatPrice } from "../../../lib/format";
import { useShop } from "../context/ShopContext";

// Acceso al pedido siempre al alcance del pulgar (solo móvil).
export default function FloatingCartBar() {
  const { itemsCount, total, isCartOpen, openCart, upsell, sheet, isOpen } = useShop();
  if (!itemsCount || isCartOpen || upsell.isOpen || sheet) return null;

  return (
    <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pt-2 lg:hidden">
      <button
        type="button"
        onClick={openCart}
        className="pointer-events-auto flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-bj-yellow pl-6 pr-2 font-bold text-black shadow-2xl shadow-black/70 active:scale-[0.98]"
      >
        <span>
          {isOpen ? "Ver pedido" : "Ver pre-orden"} · {itemsCount}
        </span>
        <span className="rounded-full bg-black px-4 py-2 font-anton text-lg text-bj-yellow">{formatPrice(total)}</span>
      </button>
    </div>
  );
}
