"use client";

import { Banknote, CreditCard, Smartphone } from "lucide-react";
import { useCartDrawer } from "../../context/CartContext";

export default function PaymentStep() {
  const {
    orderType,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    restaurantInfo,
  } = useCartDrawer();

  const businessWhatsapp = `+${String(restaurantInfo?.contact?.whatsapp || "").replace(/\D/g, "")}`;
  const showDeliveryPaymentReminder =
    orderType === "delivery" && ["yape", "plin", "tarjeta"].includes(paymentMethod);

  return (
    <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Pago</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: "efectivo", label: "Efectivo", icon: Banknote },
          { id: "yape", label: "Yape", icon: Smartphone },
          { id: "plin", label: "Plin", icon: Smartphone },
          { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
        ].map((m) => {
          const isCashDisabled = orderType === "delivery" && m.id === "efectivo";
          const disabled = m.disabled || isCashDisabled;
          const isActive = paymentMethod === m.id && !disabled;
          return (
            <button
              type="button"
              key={m.id}
              onClick={() => {
                if (!disabled) setPaymentMethod(m.id);
              }}
              disabled={disabled}
              aria-disabled={disabled ? "true" : "false"}
              className={`min-h-[72px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1 px-3 text-center transition-all ${
                isActive
                  ? "bg-[#FCC900] text-black border-[#FCC900]"
                  : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"
              } ${disabled ? "opacity-45 cursor-not-allowed" : ""}`}
            >
              <m.icon size={16} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Nota opcional"
        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-sm focus:border-[#FCC900] outline-none resize-none text-white placeholder:text-neutral-500"
      />
      {showDeliveryPaymentReminder && (
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
          {paymentMethod === "tarjeta" ? (
            <p>
              Delivery con tarjeta: recuerda pedir por WhatsApp el link de pago para completar
              tu pedido.
            </p>
          ) : (
            <p>
              Delivery con {paymentMethod === "yape" ? "Yape" : "Plin"}: recuerda realizar el
              pago al número de BIG JACK {businessWhatsapp} y enviar el comprobante por
              WhatsApp.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
