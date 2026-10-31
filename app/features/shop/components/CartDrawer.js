"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import Dialog from "../../../components/Dialog";
import { formatPrice } from "../../../lib/format";
import { useShop } from "../context/ShopContext";
import CartFooter from "./cart/CartFooter";
import CartItemList from "./cart/CartItemList";
import CustomerStep from "./cart/CustomerStep";
import DeliveryStep from "./cart/DeliveryStep";
import PaymentStep from "./cart/PaymentStep";

const STEPS = { cart: { title: "Tu pedido", index: 1 }, checkout: { title: "Entrega y pago", index: 2 } };

// Carrito en dos pasos: 1) revisar el pedido, 2) entrega, datos y pago.
export default function CartDrawer() {
  const { isCartOpen, closeCart, cart, itemsCount, total, notice, clearNotice } = useShop();
  const [requestedStep, setRequestedStep] = useState("cart");
  const step = cart.length === 0 ? "cart" : requestedStep;
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [step]);

  return (
    <Dialog open={isCartOpen} onClose={closeCart} labelledBy="cart-title" variant="drawer">
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2">
          {step === "checkout" && (
            <button
              type="button"
              onClick={() => setRequestedStep("cart")}
              className="-ml-3 flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 hover:text-white"
              aria-label="Volver al pedido"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <h2 id="cart-title" className="truncate font-anton text-[1.75rem] uppercase tracking-wide text-white">
            {STEPS[step].title}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="-mr-3 ml-auto flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        {cart.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-1.5" aria-label={`Paso ${STEPS[step].index} de 2`}>
            {[1, 2].map((index) => (
              <span
                key={index}
                className={`h-1 rounded-full transition-colors duration-300 ${
                  index <= STEPS[step].index ? "bg-bj-yellow" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-2">
        {notice && (
          <p role="status" className="mt-4 flex items-start gap-3 text-sm text-bj-yellow">
            <span className="flex-1">{notice}</span>
            <button type="button" onClick={clearNotice} className="shrink-0 text-neutral-500 hover:text-white" aria-label="Cerrar aviso">
              <X size={16} />
            </button>
          </p>
        )}

        {step === "cart" ? (
          <CartItemList />
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRequestedStep("cart")}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-neutral-300 hover:bg-white/[0.07]"
            >
              <span>
                {itemsCount} {itemsCount === 1 ? "producto" : "productos"} · {formatPrice(total)}
              </span>
              <span className="font-semibold text-bj-yellow">Editar</span>
            </button>
            <form onSubmit={(event) => event.preventDefault()} className="mt-10 space-y-12" aria-label="Datos del pedido">
              <DeliveryStep />
              <CustomerStep />
              <PaymentStep />
            </form>
          </>
        )}
      </div>

      {cart.length > 0 && <CartFooter step={step} onContinue={() => setRequestedStep("checkout")} />}
    </Dialog>
  );
}
