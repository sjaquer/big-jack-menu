"use client";

import { Loader2, Send } from "lucide-react";
import { useCartDrawer } from "../../context/CartContext";

export default function CartSummary() {
  const {
    cart,
    total,
    orderType,
    submitOrderToSystem,
    isSubmittingOrder,
    submitResult,
  } = useCartDrawer();

  return (
    <div className="p-6 border-t-2 border-neutral-800 bg-neutral-900">
      <div className="flex justify-between items-center mb-5 text-xl font-bold">
        <span className="text-white">Total</span>
        <span className="text-[#FCC900] text-3xl">S/ {total.toFixed(2)}</span>
      </div>
      {orderType === "delivery" && (
        <div className="mb-4 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
          El costo de delivery se coordina con inDrive. Este total no incluye el envío.
        </div>
      )}
      <button
        onClick={submitOrderToSystem}
        disabled={cart.length === 0 || isSubmittingOrder}
        className="w-full min-h-[68px] bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-green-900/30 active:scale-[0.98]"
      >
        {isSubmittingOrder ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <Send size={22} />
        )}
        {isSubmittingOrder ? "CONFIRMANDO PEDIDO..." : "CONFIRMAR PEDIDO"}
      </button>
      {submitResult && (
        <div
          className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
            submitResult.type === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          <p className="font-semibold">{submitResult.message}</p>
          {submitResult.orderId && (
            <p className="mt-1">Código de pedido: {submitResult.orderId}</p>
          )}
          {submitResult.saleId && (
            <p className="mt-1">Código interno: {submitResult.saleId}</p>
          )}
        </div>
      )}
    </div>
  );
}
