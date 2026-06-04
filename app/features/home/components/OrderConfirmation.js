"use client";

export default function OrderConfirmation({
  orderConfirmation,
  onClose,
  onOpenWhatsapp,
}) {
  if (!orderConfirmation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Cerrar confirmación"
      />
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="border-b border-neutral-800 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#FCC900] font-bold">
            Pedido registrado
          </p>
          <h3 id="confirmation-modal-title" className="mt-2 text-2xl font-black text-white">
            Confirma el envío por WhatsApp
          </h3>
          <p className="mt-2 text-sm text-neutral-300">
            {orderConfirmation.customerName}, tu pedido ya se registró en el sistema. Ahora envíalo por WhatsApp para coordinar la atención.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4 text-sm text-neutral-200">
            <p>
              <span className="text-neutral-400">Tipo:</span> {orderConfirmation.orderMode}
            </p>
            <p>
              <span className="text-neutral-400">Pago:</span> {orderConfirmation.paymentMethod}
            </p>
            <p>
              <span className="text-neutral-400">Total:</span> {orderConfirmation.total}
            </p>
            {orderConfirmation.orderId && (
              <p>
                <span className="text-neutral-400">Pedido:</span> {orderConfirmation.orderId}
              </p>
            )}
          </div>

          {orderConfirmation.paymentReminder && (
            <div className="rounded-2xl border border-blue-500/35 bg-blue-500/10 p-4 text-sm text-blue-100 animate-pulse">
              <p className="font-bold">{orderConfirmation.paymentReminder.title}</p>
              <p className="mt-1">{orderConfirmation.paymentReminder.body}</p>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-700 bg-neutral-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-bold">
              Resumen
            </p>
            <ul className="mt-2 space-y-1 text-sm text-neutral-200">
              {orderConfirmation.items.slice(0, 4).map((line) => (
                <li key={line}>- {line}</li>
              ))}
              {orderConfirmation.items.length > 4 && (
                <li className="text-neutral-400">
                  + {orderConfirmation.items.length - 4} item(s) adicional(es)
                </li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] rounded-xl border border-neutral-700 bg-neutral-800 px-4 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors active:scale-95"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={onOpenWhatsapp}
              className="min-h-[48px] rounded-xl bg-[#25D366] px-4 text-sm font-black text-black hover:bg-[#1ebc58] transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              {orderConfirmation.whatsappSent ? "Reenviar por WhatsApp" : "Enviar por WhatsApp"}
            </button>
          </div>

          <p className="text-xs text-neutral-400">
            WhatsApp BIG JACK: {orderConfirmation.whatsappContact}
          </p>
        </div>
      </div>
    </div>
  );
}
