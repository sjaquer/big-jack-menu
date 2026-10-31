"use client";

import { AlertTriangle, ShoppingCart, X } from "lucide-react";
import { useCartDrawer } from "../context/CartContext";
import CartItemList from "./cart/CartItemList";
import CustomerStep from "./cart/CustomerStep";
import DeliveryStep from "./cart/DeliveryStep";
import PaymentStep from "./cart/PaymentStep";
import CartSummary from "./cart/CartSummary";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartNotice,
    onDismissCartNotice,
  } = useCartDrawer();

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end cart-drawer-container ${isCartOpen ? "" : "cart-closed"}`}
      aria-hidden={!isCartOpen}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer cart-drawer-backdrop"
        onClick={() => setIsCartOpen(false)}
        aria-label="Cerrar carrito"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className="relative w-full max-w-md bg-neutral-900 h-full shadow-2xl rounded-l-[32px] flex flex-col border-l border-neutral-800 z-10 cart-drawer-panel"
      >
        <div className="relative border-b-3 border-[#FCC900] bg-[#0F0F12] p-5 flex justify-between items-center">
          <h2 className="text-2xl font-anton tracking-wide flex items-center gap-3 text-white uppercase">
            <ShoppingCart className="text-[#FCC900]" size={24} />
            TU PEDIDO
            {cart.length > 0 && (
              <span className="block-yellow text-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} ITEMS
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cartNotice && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-[#FCC900]/40 bg-[#FCC900]/10 px-3 py-2 text-xs text-[#FCC900]"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span className="flex-1">{cartNotice}</span>
              <button
                type="button"
                onClick={onDismissCartNotice}
                className="shrink-0 rounded p-0.5 hover:bg-[#FCC900]/20"
                aria-label="Cerrar aviso"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <CartItemList />

          {cart.length > 0 && (
            <div className="space-y-5">
              <CustomerStep />
              <DeliveryStep />
              <PaymentStep />
            </div>
          )}
        </div>

        <CartSummary />
      </div>
    </div>
  );
}
