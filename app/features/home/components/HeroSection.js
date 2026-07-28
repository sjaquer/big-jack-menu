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
    <section className="relative overflow-hidden bg-[#0F0F12] py-12 md:py-20 border-b-3 border-neutral-800">
      <div className="relative z-10 max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-2 items-center">

        <div className="space-y-6 text-center md:text-left order-2 md:order-1">
          <div className="inline-flex items-center gap-2">
            <span className="tag-streetwear">
              [ LIMA CENTRO & LINCE ]
            </span>
            <span className="tag-streetwear hidden sm:inline-block">
              [ 100% RES ]
            </span>
          </div>

          <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] text-white uppercase tracking-tight">
            HAMBURGUESAS <br/>
            <span className="text-[#FCC900]">ARTESANALES</span>
          </h1>

          <p className="text-neutral-400 text-base md:text-lg font-medium max-w-md mx-auto md:mx-0 leading-relaxed">
            Carne 100% de res jugosa y gruesa, queso derretido en su punto y salsas de la casa. Pide online con delivery o pasa a recoger al toque.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
            <button
              onClick={scrollToMenu}
              className="btn-streetwear h-14 px-8 rounded-xl text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              <ShoppingCart size={22} className="stroke-[3]" />
              HACER PEDIDO
            </button>
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="h-14 px-8 rounded-xl bg-[#1F1F24] border-2 border-neutral-700 hover:border-[#FCC900] text-white font-bold text-base flex items-center justify-center gap-3 transition-colors"
            >
              <MessageCircle size={20} className="text-green-400" />
              WhatsApp Directo
            </a>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-bold text-neutral-400 pt-2">
            <span className="flex items-center gap-2 bg-[#1F1F24] border border-neutral-800 px-3 py-1.5 rounded-lg">
              <Truck size={14} className="text-[#FCC900]" /> Delivery directo
            </span>
            <span className="flex items-center gap-2 bg-[#1F1F24] border border-neutral-800 px-3 py-1.5 rounded-lg">
              <Clock size={14} className="text-[#FCC900]" /> Recojo en 15-20 min
            </span>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          {/* Framed Hero Image */}
          <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border-3 border-neutral-800 hover:border-[#FCC900] shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
            
            {heroHighlight && !imgError ? (
              <Image
                src={heroHighlight.image}
                alt="Hamburguesa real Big Jack"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <Flame size={48} className="text-[#FCC900]" />
              </div>
            )}

            {heroPriceRange && heroPriceRange.length > 0 && (
              <div className="absolute bottom-6 right-6 z-20 block-yellow text-2xl shadow-xl">
                <span className="text-xs font-black mr-1 opacity-80">DESDE</span>
                <span>S/ {heroPriceRange[0].toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}