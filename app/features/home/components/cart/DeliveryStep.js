"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { useCartDrawer } from "../../context/CartContext";

export default function DeliveryStep() {
  const {
    orderType,
    isOpen,
    isPreOrder,
    restaurantInfo,
    PEDIDOSYA_LINK,
    RAPPI_LINK,
    deliveryAddress,
    setDeliveryAddress,
    deliveryReference,
    setDeliveryReference,
    deliveryDetails,
    setDeliveryDetails,
    locationLink,
    isLocating,
    getUserLocation,
  } = useCartDrawer();

  return (
    <div className="bg-neutral-800/60 rounded-2xl border border-neutral-700 p-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
        {orderType === "delivery" ? "Entrega" : "Recojo"}
      </p>

      {orderType === "delivery" ? (
        <>
          <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
              Recomendado
            </p>
            <p className="text-sm text-neutral-200">
              Delivery vía <span className="font-bold text-[#FCC900]">inDrive</span>. También
              puedes pedir por apps.
            </p>
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
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Dirección"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-[#FCC900] outline-none transition-colors text-white placeholder:text-neutral-500"
              />
            </div>
            <div className="relative">
              <Navigation
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
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
            className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              locationLink
                ? "bg-green-600/20 border-green-500 text-green-200"
                : "bg-[#4285F4] border-[#4285F4] text-white hover:bg-[#3367D6]"
            }`}
          >
            {isLocating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            {locationLink
              ? "Ubicación lista"
              : isLocating
                ? "Detectando ubicación..."
                : "Usar mi ubicación"}
          </button>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
            <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2">
              inDrive
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 py-2">
              Tarifa variable
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
              !isOpen && isPreOrder
                ? "border-[#FCC900]/40 bg-[#FCC900]/10 text-[#FCC900]"
                : "border-neutral-700 bg-neutral-900/70 text-neutral-200"
            }`}
          >
            {!isOpen && isPreOrder ? <AlertTriangle size={16} /> : <Clock size={16} />}
            {!isOpen && isPreOrder
              ? "Pre-orden para recojo al abrir"
              : "Recojo inmediato (15-20 min)"}
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
  );
}
