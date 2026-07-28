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
    <section className="relative overflow-hidden bg-[#1E1E1E]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(252,201,0,0.15),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(178,34,34,0.15),_transparent_50%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 grid gap-8 md:grid-cols-2 items-center">

        <div className="space-y-6 text-center md:text-left order-2 md:order-1">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCC900]/10 border border-[#FCC900]/25 text-[#FCC900] text-xs font-black uppercase tracking-widest mx-auto md:mx-0">
            <Flame size={14} className="text-[#B22222]" />
            Tu Vecino Confiable
          </div>

          <h1 className="font-anton text-6xl md:text-7xl lg:text-8xl leading-[0.85] text-white tracking-[-0.04em] uppercase drop-shadow-lg">
            POTENCIA <br/>
            <span className="text-[#FCC900]">HONESTA</span>
          </h1>

          <p className="text-[#C0C0C0] text-base md:text-lg font-semibold max-w-md mx-auto md:mx-0 leading-snug">
            Sin relleno corporativo. Solo carne gruesa, fuego y técnica. Hamburguesas reales que calman tu hambre, al toque.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <button
              onClick={scrollToMenu}
              className="h-16 px-8 rounded-2xl bg-[#FCC900] hover:bg-[#e2b500] text-black font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#FCC900]/20 transition-all active:scale-95 hover:-translate-y-1"
            >
              <ShoppingCart size={24} />
              HACER PEDIDO
            </button>
            <a
              href={`https://wa.me/${restaurantInfo.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="h-16 px-8 rounded-2xl bg-[#2A2A2A] hover:bg-[#353535] text-white font-bold text-lg flex items-center justify-center gap-3 border border-[#C0C0C0]/35 transition-all active:scale-95 hover:-translate-y-1"
            >
              <MessageCircle size={22} className="text-green-500" />
              Hablar por WhatsApp
            </a>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-neutral-400 mt-6">
            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1.5 rounded-full">
              <Truck size={14} className="text-[#FCC900]" /> Delivery local
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-800/50 px-3 py-1.5 rounded-full">
              <Clock size={14} className="text-[#FCC900]" /> Recojo en 15-20 min
            </span>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-[#FCC900]/30 shadow-2xl shadow-black/60 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
            {heroHighlight && !imgError ? (
              <Image
                src={heroHighlight.image}
                alt="Hamburguesa real Big Jack"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <Flame size={48} className="text-[#B22222]" />
              </div>
            )}

            {heroPriceRange && heroPriceRange.length > 0 && (
              <div className="absolute bottom-6 right-6 z-20 bg-[#FCC900] text-black px-6 py-3 rounded-2xl shadow-xl border-2 border-black/20">
                <p className="text-xs font-black uppercase opacity-80 mb-0.5">Desde</p>
                <p className="text-3xl font-black tracking-tighter">S/ {heroPriceRange[0].toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}