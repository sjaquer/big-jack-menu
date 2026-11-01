"use client";

import { CheckCircle2 } from "lucide-react";
import Dialog from "../../../../components/Dialog";
import { WhatsAppIcon } from "../../../../components/icons/BrandIcons";
import { useShop } from "../../context/ShopContext";

const MAX_LINES = 5;

export default function OrderConfirmation() {
  const { order } = useShop();
  const confirmation = order.confirmation;

  return (
    <Dialog open={Boolean(confirmation)} onClose={order.closeConfirmation} labelledBy="confirmation-title" zIndex="z-[65]">
      {confirmation && (
        <>
          <div className="space-y-2 border-b border-neutral-800 p-5">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-400">
              <CheckCircle2 size={16} aria-hidden="true" />
              {confirmation.duplicated ? "Este pedido ya estaba registrado" : "Pedido recibido"}
            </p>
            <h2 id="confirmation-title" className="font-anton text-3xl uppercase leading-none text-white">
              Último paso: mándalo por WhatsApp
            </h2>
            <p className="text-sm text-neutral-300">
              {confirmation.customerName}, tu pedido ya está registrado.{" "}
              {confirmation.isPreOrder
                ? "Mándalo por WhatsApp y lo dejamos listo para cuando abramos."
                : "Mándalo por WhatsApp y entra a la plancha."}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm">
              <dt className="text-neutral-400">Tipo</dt>
              <dd className="text-right font-semibold text-white">{confirmation.orderMode}</dd>
              <dt className="text-neutral-400">Pago</dt>
              <dd className="text-right font-semibold text-white">{confirmation.paymentMethod}</dd>
              {confirmation.orderId && (
                <>
                  <dt className="text-neutral-400">N.º de pedido</dt>
                  <dd className="text-right font-semibold text-white">{confirmation.orderId}</dd>
                </>
              )}
              <dt className="text-neutral-400">Total</dt>
              <dd className="text-right font-anton text-xl text-bj-yellow">{confirmation.total}</dd>
            </dl>

            {confirmation.paymentReminder && (
              <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100">
                <p className="font-bold">{confirmation.paymentReminder.title}</p>
                <p className="mt-1">{confirmation.paymentReminder.body}</p>
              </div>
            )}

            <ul className="space-y-1 text-sm text-neutral-200">
              {confirmation.items.slice(0, MAX_LINES).map((line) => (
                <li key={line}>· {line}</li>
              ))}
              {confirmation.items.length > MAX_LINES && (
                <li className="text-neutral-400">+ {confirmation.items.length - MAX_LINES} más</li>
              )}
            </ul>
          </div>

          <div className="pb-safe space-y-2 border-t border-neutral-800 p-4">
            <button
              type="button"
              data-autofocus
              onClick={order.openWhatsapp}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-whatsapp font-black text-black transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon size={20} />
              {confirmation.whatsappSent ? "Abrir WhatsApp otra vez" : "Enviar por WhatsApp"}
            </button>
            <button
              type="button"
              onClick={order.closeConfirmation}
              className="h-12 w-full rounded-full font-semibold text-neutral-400 hover:text-white"
            >
              Cerrar
            </button>
            <p className="text-center text-xs text-neutral-500">WhatsApp BIG JACK: {confirmation.whatsappContact}</p>
          </div>
        </>
      )}
    </Dialog>
  );
}
