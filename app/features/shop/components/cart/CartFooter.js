"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { formatPrice } from "../../../../lib/format";
import { useShop } from "../../context/ShopContext";

// Total y acción del paso actual: "Continuar" en el pedido, "Confirmar" en los datos.
export default function CartFooter({ step, onContinue }) {
  const { itemsCount, total, checkout, isOpen, order } = useShop();
  const isDelivery = isOpen && checkout.orderType === "delivery";
  const isCheckout = step === "checkout";

  return (
    <div className="pb-safe border-t border-white/10 bg-bj-bg/95 px-6 pt-5 backdrop-blur">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-neutral-400">
            Total · {itemsCount} {itemsCount === 1 ? "producto" : "productos"}
          </p>
          {isCheckout && isDelivery && <p className="text-xs text-neutral-600">+ envío por coordinar</p>}
        </div>
        <p className="font-anton text-4xl leading-none text-white">{formatPrice(total)}</p>
      </div>

      {isCheckout && order.submitError && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {order.submitError}
        </p>
      )}

      <button
        type="button"
        onClick={isCheckout ? order.submit : onContinue}
        disabled={itemsCount === 0 || order.isSubmitting}
        className="btn-streetwear mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full text-lg disabled:opacity-50"
      >
        {order.isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" aria-hidden="true" /> Enviando…
          </>
        ) : isCheckout ? (
          isOpen ? "Confirmar pedido" : "Confirmar pre-orden"
        ) : (
          <>
            Continuar <ArrowRight size={20} aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
