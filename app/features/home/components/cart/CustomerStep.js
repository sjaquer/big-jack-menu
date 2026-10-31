"use client";

import { Check, Clock, Phone, Truck, User } from "lucide-react";
import { useCartDrawer } from "../../context/CartContext";

export default function CustomerStep() {
  const {
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    orderType,
    handleSelectOrderType,
    deliveryAddress,
    locationLink,
    paymentMethod,
  } = useCartDrawer();

  const cleanPhone = String(customerPhone || "").replace(/\D/g, "");
  const stepClientDone = customerName.trim().length >= 2 && cleanPhone.length >= 9;
  const stepDeliveryDone =
    orderType === "pickup" ? true : Boolean(deliveryAddress.trim() || locationLink);
  const stepPaymentDone = Boolean(paymentMethod);
  const completedSteps = [stepClientDone, stepDeliveryDone, stepPaymentDone].filter(Boolean).length;
  const checkoutProgress = `${(completedSteps / 3) * 100}%`;

  return (
    <>
      <div className="rounded-2xl border border-neutral-700 bg-neutral-900/70 p-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 uppercase tracking-[0.18em]">
          <span>Checkout</span>
          <span>{completedSteps}/3</span>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-[#FCC900] transition-all duration-300"
            style={{ width: checkoutProgress }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {[
            { key: "cliente", label: "Cliente", done: stepClientDone },
            { key: "entrega", label: "Entrega", done: stepDeliveryDone },
            { key: "pago", label: "Pago", done: stepPaymentDone },
          ].map((step, index) => (
            <div
              key={step.key}
              className={`rounded-xl border px-2 py-2 text-center ${
                step.done
                  ? "border-[#FCC900]/60 bg-[#FCC900]/10 text-[#FCC900]"
                  : "border-neutral-700 bg-neutral-800/60 text-neutral-400"
              }`}
            >
              <div className="mx-auto mb-1 w-5 h-5 rounded-full grid place-content-center text-[11px] font-black bg-black/25">
                {step.done ? <Check size={12} /> : index + 1}
              </div>
              <p className="font-semibold">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Cliente</p>
        <div className="relative">
          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="relative">
          <Phone
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="Teléfono (9 dígitos o más)"
            className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSelectOrderType("pickup")}
            className={`min-h-[88px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1.5 px-3 text-center transition-all ${
              orderType === "pickup"
                ? "bg-[#FCC900] text-black border-[#FCC900]"
                : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"
            }`}
          >
            <Clock size={18} />
            Recojo
          </button>
          <button
            type="button"
            onClick={() => handleSelectOrderType("delivery")}
            className={`min-h-[88px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1.5 px-3 text-center transition-all ${
              orderType === "delivery"
                ? "bg-[#FCC900] text-black border-[#FCC900]"
                : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"
            }`}
          >
            <Truck size={18} />
            Delivery
          </button>
        </div>
      </div>
    </>
  );
}
