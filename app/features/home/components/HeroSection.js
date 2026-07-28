"use client";

import Image from "next/image";
import { Flame, ShoppingCart, MessageCircle, Truck, Clock } from "lucide-react";
import { useState } from "react";

export default function HeroSection({
  heroHighlight,
  heroPriceRange,
  restaurantInfo,
  scrollToMenu,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#0F0F12] py-10 sm:py-16 md:py-20 border-b-3 border-neutral-800">
      {/* Halo dorado centrado detrás de la hamburguesa */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(252,201,0,0.14),_transparent_65%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
        {/* Tags superiores */}
        <div className="flex items-center justify-center gap-3">
          <span className="tag-streetwear">
            [ LIMA CENTRO & LINCE ]
          </span>
          <span className="tag-streetwear">
            [ CARNE 100% RES ]
          </span>
        </div>

        {/* Titular Principal Centrado */}
        <h1 className="font-anton text-5xl sm:text-7xl md:text-8xl leading-[0.9] text-white uppercase tracking-tight drop-shadow-2xl">
          HAMBURGUESAS <br className="hidden sm:inline" />
          <span className="text-[#FCC900]">ARTESANALES</span> Y GRUESAS
        </h1>

        {/* Subtítulo Claro */}
        <p className="text-neutral-300 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Carne 100% de res jugosa, queso cheddar derretido y salsas caseras de la casa. Pide online directo con delivery o recojo en tienda.
        </p>

        {/* PROTAGONISTA CENTRAL: burger_hero.png */}
        <div className="relative w-full max-w-lg mx-auto aspect-square sm:aspect-[4/3] my-4 group">
          <div className="relative w-full h-full">
            <Image
              src="/images/burger_hero.png"
              alt="Hamburguesa artesanal Big Jack con queso derretido"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)] transform transition-transform duration-700 group-hover:scale-108"
              priority
            />
          </div>

          {/* Badge de Precio Flotante */}
          {heroPriceRange && heroPriceRange.length > 0 && (
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-6 z-20 block-yellow text-xl sm:text-2xl shadow-2xl">
              <span className="text-[10px] sm:text-xs font-black mr-1 opacity-80">DESDE</span>
              <span>S/ {heroPriceRange[0].toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Botones de Acción Centrados */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={scrollToMenu}
            className="btn-streetwear w-full sm:w-auto h-14 px-8 rounded-xl text-lg flex items-center justify-center gap-3 shadow-xl"
          >
            <ShoppingCart size={22} className="stroke-[3]" />
            HACER PEDIDO / VER MENÚ
          </button>
          <a
            href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[#1F1F24] border-2 border-neutral-700 hover:border-[#FCC900] text-white font-bold text-base flex items-center justify-center gap-3 transition-colors"
          >
            <MessageCircle size={20} className="text-green-400" />
            Pedir por WhatsApp
          </a>
        </div>

        {/* Métricas e Indicadores Rápidos */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-neutral-400 pt-4">
          <span className="flex items-center gap-2 bg-[#131317] border border-neutral-800 px-3.5 py-2 rounded-xl">
            <Truck size={15} className="text-[#FCC900]" /> Delivery directo en tu zona
          </span>
          <span className="flex items-center gap-2 bg-[#131317] border border-neutral-800 px-3.5 py-2 rounded-xl">
            <Clock size={15} className="text-[#FCC900]" /> Recojo en local (15 min)
          </span>
        </div>
      </div>
    </section>
  );
}