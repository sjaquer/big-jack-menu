"use client";

import {
  AlertTriangle,
  Banknote,
  Check,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Send,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Phone,
  Trash2,
  Truck,
  User,
  X,
  ArrowUpRight,
} from "lucide-react";

export default function CartDrawer({
  isCartOpen,
  setIsCartOpen,
  cart,
  menuItems,
  openProductModal,
  updateQuantity,
  removeFromCart,
  orderType,
  handleSelectOrderType,
  deliveryAvailable,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  deliveryAddress,
  setDeliveryAddress,
  deliveryReference,
  setDeliveryReference,
  deliveryDetails,
  setDeliveryDetails,
  locationLink,
  isLocating,
  getUserLocation,
  setLocationLink,
  isOpen,
  isPreOrder,
  restaurantInfo,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes,
  clearCart,
  total,
  submitOrderToSystem,
  isSubmittingOrder,
  submitResult,
}) {
  if (!isCartOpen) return null;

  const cleanPhone = String(customerPhone || "").replace(/\D/g, "");
  const stepClientDone = customerName.trim().length >= 2 && cleanPhone.length >= 9;
  const stepDeliveryDone =
    orderType === "pickup" ? true : Boolean(deliveryAddress.trim() || locationLink);
  const stepPaymentDone = Boolean(paymentMethod);
  const completedSteps = [stepClientDone, stepDeliveryDone, stepPaymentDone].filter(Boolean).length;
  const checkoutProgress = `${(completedSteps / 3) * 100}%`;
  const businessWhatsapp = `+${String(restaurantInfo?.contact?.whatsapp || "").replace(/\D/g, "")}`;
  const showDeliveryPaymentReminder =
    orderType === "delivery" && ["yape", "plin", "tarjeta"].includes(paymentMethod);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsCartOpen(false)}
        aria-label="Cerrar carrito"
      ></div>

      <div className="relative w-full max-w-md bg-neutral-900 h-full shadow-2xl rounded-l-[32px] flex flex-col border-l border-neutral-800 animate-in slide-in-from-right duration-300 z-10">
        <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
          <h2 className="text-xl font-black flex items-center gap-2 text-white">
            <ShoppingCart className="text-[#FCC900]" />
            TU PEDIDO
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="space-y-2">
                <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart size={40} className="text-neutral-600" />
                </div>
                <p className="text-xl font-black text-white">Tu carrito está vacío</p>
                <p className="text-sm text-neutral-400 max-w-[200px] mx-auto">¿No sabes qué pedir? Aquí tienes nuestros favoritos:</p>
              </div>

              <div className="w-full space-y-3">
                {menuItems
                  .filter((i) => i.popular)
                  .slice(0, 2)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openProductModal(item)}
                      className="w-full flex items-center gap-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-[#FCC900]/50 p-3 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-700 flex-shrink-0 border border-neutral-600">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://placehold.co/100x100/222/d99133?text=BJ";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white group-hover:text-[#FCC900] transition-colors truncate">{item.name}</p>
                        <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>
                        <p className="text-[#FCC900] font-black text-sm mt-1">S/ {item.options?.[0]?.price.toFixed(2)}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#FCC900] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 shadow-lg shadow-[#FCC900]/20">
                        <Plus size={18} />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">Productos ({cart.length})</p>
                  <button
                    onClick={clearCart}
                    className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border border-red-600/50 bg-red-600/10 px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-red-600/20"
                  >
                    <Trash2 size={14} />
                    Vaciar carrito
                  </button>
                </div>

                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-neutral-800/50 p-3 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <div className="w-16 h-16 bg-neutral-700 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-700">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/100x100/222/d99133?text=BJ";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm mb-1 text-white truncate">{item.name}</h4>
                      <p className="text-xs text-neutral-400 mb-2">{item.optionLabel}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[#FCC900] font-black text-sm">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        <div className="flex items-center gap-3 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center bg-[#FCC900] hover:bg-[#e2b500] text-black rounded transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-neutral-500 hover:text-red-500 self-start p-1 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-neutral-700 bg-neutral-900/70 p-4">
                  <div className="flex items-center justify-between text-xs text-neutral-400 uppercase tracking-[0.18em]">
                    <span>Checkout</span>
                    <span>{completedSteps}/3</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-[#FCC900] transition-all duration-300" style={{ width: checkoutProgress }} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {[
                      { key: "cliente", label: "Cliente", done: stepClientDone },
                      { key: "entrega", label: "Entrega", done: stepDeliveryDone },
                      { key: "pago", label: "Pago", done: stepPaymentDone },
                    ].map((step, index) => (
                      <div key={step.key} className={`rounded-xl border px-2 py-2 text-center ${step.done ? "border-[#FCC900]/60 bg-[#FCC900]/10 text-[#FCC900]" : "border-neutral-700 bg-neutral-800/60 text-neutral-400"}`}>
                        <div className="mx-auto mb-1 w-5 h-5 rounded-full grid place-content-center text-[11px] font-black bg-black/25">{step.done ? <Check size={12} /> : index + 1}</div>
                        <p className="font-semibold">{step.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Cliente</p>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full bg-neutral-950 border-2 border-neutral-700 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
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
                      className={`min-h-[88px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1.5 px-3 text-center transition-all ${orderType === "pickup" ? "bg-[#FCC900] text-black border-[#FCC900]" : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"}`}
                    >
                      <Clock size={18} />
                      Recojo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectOrderType("delivery")}
                      className={`min-h-[88px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1.5 px-3 text-center transition-all ${deliveryAvailable && orderType === "delivery" ? "bg-[#FCC900] text-black border-[#FCC900]" : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"}`}
                    >
                      <Truck size={18} />
                      Delivery
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">{orderType === "delivery" ? "Entrega" : "Recojo"}</p>

                  {orderType === "delivery" ? (
                    <>
                      <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-2">Recomendado</p>
                        <p className="text-sm text-neutral-200">Delivery vía <span className="font-bold text-[#FCC900]">inDrive</span>. También puedes pedir por apps.</p>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <a
                            href={PEDIDOSYA_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ea004b]/40 bg-[#ea004b]/15 px-4 py-2.5 text-xs font-semibold text-[#ff8db6] hover:bg-[#ea004b]/25 transition-colors"
                          >
                            PedidosYa
                            <ArrowUpRight size={12} />
                          </a>
                          <a
                            href={RAPPI_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ff441f]/40 bg-[#ff441f]/15 px-4 py-2.5 text-xs font-semibold text-[#ffb4a8] hover:bg-[#ff441f]/25 transition-colors"
                          >
                            Rappi
                            <ArrowUpRight size={12} />
                          </a>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                          <input
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Dirección"
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
                          />
                        </div>
                        <div className="relative">
                          <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                          <input
                            value={deliveryReference}
                            onChange={(e) => setDeliveryReference(e.target.value)}
                            placeholder="Referencia"
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
                          />
                        </div>
                        <div className="relative">
                          <Navigation className="absolute left-4 top-4 text-neutral-400" size={18} />
                          <textarea
                            value={deliveryDetails}
                            onChange={(e) => setDeliveryDetails(e.target.value)}
                            rows={2}
                            placeholder="Datos extra: casa/depa, piso, interior, bloque, portería, etc."
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500 resize-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => getUserLocation()}
                        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${locationLink ? "bg-green-600/20 border-green-500 text-green-200" : "bg-[#4285F4] border-[#4285F4] text-white hover:bg-[#3367D6]"}`}
                      >
                        {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                        {locationLink ? "Ubicación lista" : isLocating ? "Detectando ubicación..." : "Usar mi ubicación"}
                      </button>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                        <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2">inDrive</div>
                        <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2">Tarifa variable</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`rounded-xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 ${!isOpen && isPreOrder ? "border-[#FCC900]/40 bg-[#FCC900]/10 text-[#FCC900]" : "border-neutral-700 bg-neutral-900/70 text-neutral-200"}`}>
                        {!isOpen && isPreOrder ? <AlertTriangle size={16} /> : <Clock size={16} />}
                        {!isOpen && isPreOrder ? "Pre-orden para recojo al abrir" : "Recojo inmediato (15-20 min)"}
                      </div>
                      <a
                        href={restaurantInfo.contact.googleMapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full min-h-[44px] bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-neutral-700"
                      >
                        <Navigation size={16} /> Ver ubicación
                      </a>
                    </>
                  )}
                </div>

                <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4 animate-in fade-in">
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
                          className={`min-h-[72px] rounded-xl text-sm font-bold border flex flex-col items-center justify-center gap-1 px-3 text-center transition-all ${isActive ? "bg-[#FCC900] text-black border-[#FCC900]" : "bg-neutral-950 border-neutral-700 text-white hover:border-neutral-500"} ${disabled ? "opacity-45 cursor-not-allowed" : ""}`}
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
                        <p>Delivery con tarjeta: recuerda pedir por WhatsApp el link de pago para completar tu pedido.</p>
                      ) : (
                        <p>Delivery con {paymentMethod === "yape" ? "Yape" : "Plin"}: recuerda realizar el pago al numero de BIG JACK {businessWhatsapp} y enviar el comprobante por WhatsApp.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t-2 border-neutral-800 bg-neutral-900">
          <div className="flex justify-between items-center mb-5 text-xl font-bold">
            <span className="text-white">Total</span>
            <span className="text-[#FCC900] text-3xl">S/ {total.toFixed(2)}</span>
          </div>
          {orderType === "delivery" && (
            <div className="mb-4 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-xs text-blue-100">
              El costo de delivery se coordina con inDrive y puede variar según ubicación, tráfico y hora. Este total no incluye ese envío.
            </div>
          )}
          <button
            onClick={submitOrderToSystem}
            disabled={cart.length === 0 || isSubmittingOrder}
            className="w-full min-h-[68px] bg-green-600 hover:bg-green-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-green-900/30 active:scale-[0.98]"
          >
            {isSubmittingOrder ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
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
              {submitResult.orderId && <p className="mt-1">Codigo de pedido: {submitResult.orderId}</p>}
              {submitResult.saleId && <p className="mt-1">Codigo interno: {submitResult.saleId}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
