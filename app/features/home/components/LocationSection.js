"use client";

import { Navigation, MapPin } from "lucide-react";
import SecureMap from "./SecureMap";

export default function LocationSection({
  restaurantInfo,
  PEDIDOSYA_LINK,
  RAPPI_LINK,
}) {
  return (
    <div className="bg-[#1E1E1E] border-t-2 border-[#FCC900]/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FCC900]/50 to-transparent" />
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 items-center">
          {/* Fast Info */}
          <div className="space-y-6 text-center lg:text-left">
            <h3 className="font-anton text-4xl sm:text-5xl text-white leading-tight uppercase tracking-tight">
              ESTAMOS EN EL <span className="text-[#FCC900]">CENTRO</span>
            </h3>
            <p className="text-[#C0C0C0] text-lg font-semibold max-w-md mx-auto lg:mx-0">
              Recojo en tienda al toque o delivery rápido en zonas cercanas.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto lg:mx-0">
              <a
                href={restaurantInfo.contact.googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#FCC900] hover:bg-[#e2b500] text-black font-black px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <Navigation size={20} /> Ir con Google Maps
              </a>
              <a
                href={PEDIDOSYA_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#c80040] hover:bg-[#b00038] text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <span className="font-black text-xl leading-none mr-1">Pe</span> PedidosYa
              </a>
              <a
                href={RAPPI_LINK}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 bg-[#c33316] hover:bg-[#a92b12] text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                <span className="font-black text-xl leading-none mr-1">R</span> Rappi
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-[2rem] overflow-hidden border-4 border-neutral-800 h-[300px] lg:h-[400px] shadow-2xl relative group">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
            <SecureMap />
          </div>
        </div>
      </section>
    </div>
  );
}
