"use client";

import Image from "next/image";
import { AlertTriangle, Plus, Check } from "lucide-react";
import { useState } from "react";

export default function ProductCard({
  item,
  cart = [],
  onAdd,
  onOpenModal,
  recentlyAdded,
  complementBlocked,
  PRIMARY_CATEGORIES = [],
  COMPLEMENT_CATEGORIES = [],
}) {
  const isComplement = COMPLEMENT_CATEGORIES.includes(item.category);
  const isPrimary = PRIMARY_CATEGORIES.includes(item.category);
  const isUnavailable = item.available === false;
  const isDisabled = complementBlocked || isUnavailable;
  const [imgError, setImgError] = useState(false);

  const optionsToRender = item.options?.length
    ? item.options
    : [{ id: "regular", label: "Regular", price: item.price || 0 }];

  const basePrice = optionsToRender.reduce(
    (min, opt) => Math.min(min, opt.price),
    optionsToRender[0].price
  );

  const itemQtyInCart = cart
    .filter((c) => c.productId === item.id)
    .reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="group relative bg-[#1E1E1E] border-2 border-[#C0C0C0]/20 rounded-[2.5rem] overflow-hidden hover:border-[#FCC900]/50 transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:shadow-[#FCC900]/10 product-card-anim">
      {isUnavailable && (
        <div className="absolute top-3 right-3 z-30 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 drop-shadow-lg">
          <AlertTriangle size={14} />
          No disponible
        </div>
      )}

      <div className="relative block overflow-hidden bg-black flex-shrink-0 aspect-square sm:aspect-[4/3] w-full">
        {item.image && !imgError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transform transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold uppercase tracking-widest text-sm bg-neutral-900">
            {imgError ? "Sin foto" : "Sin foto"}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-[#1e1e1e]/60 to-transparent sm:via-[#1e1e1e]/40" />
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none" />

        {item.popular && (
          <span className="absolute top-5 left-5 bg-[#FCC900] text-black text-xs font-black uppercase tracking-[0.1em] px-4 py-2 rounded-full shadow-xl border-2 border-black/20 z-10">
            HIT DE BARRIO
          </span>
        )}

        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-20">
          <div className="flex-1 pr-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#FCC900] font-black mb-1 drop-shadow-md">
              {item.category}
            </p>
            <h3 className="font-anton text-3xl sm:text-4xl text-white leading-[0.9] tracking-[-0.02em] font-normal drop-shadow-xl">
              {item.name}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-[#FCC900] border-2 border-black/20 text-black px-4 py-2 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform transition-transform group-hover:-translate-y-1">
              <span className="text-[10px] font-black uppercase opacity-70 block leading-none mb-1">
                Desde
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold opacity-90 leading-none">S/</span>
                <span className="text-2xl sm:text-3xl font-black leading-none">
                  {basePrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between z-10 relative bg-[#1E1E1E]">
        <p className="text-[#C0C0C0] text-sm sm:text-base leading-relaxed mb-6 font-medium line-clamp-3">
          {item.description}
        </p>

        <div className="mt-auto border-t border-[#C0C0C0]/10 pt-5">
          {isPrimary ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenModal(item)}
                disabled={isUnavailable}
                className={`flex-1 py-4 px-6 rounded-2xl text-black text-base font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_5px_15px_rgba(252,201,0,0.15)] group-hover:shadow-[0_8px_20px_rgba(252,201,0,0.3)] ${
                  isUnavailable
                    ? "bg-neutral-500 text-neutral-700 cursor-not-allowed opacity-60"
                    : "bg-[#FCC900] hover:bg-[#e2b500]"
                }`}
              >
                <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                <span className="hidden sm:inline">Armar combo / Agregar</span>
                <span className="sm:hidden">Pedir ahora</span>
              </button>

              {itemQtyInCart > 0 && (
                <div className="w-14 h-14 bg-[#B22222]/10 border-2 border-[#B22222] text-[#ffb4b4] rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0">
                  x{itemQtyInCart}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-[#C0C0C0] uppercase tracking-[0.2em] font-black mb-1">
                Elige opción
              </p>
              {optionsToRender.map((option) => {
                const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                return (
                  <button
                    key={option.id}
                    onClick={() => onAdd(item, option.id)}
                    disabled={isDisabled}
                    className={`w-full py-4 px-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between active:scale-95 shadow-sm hover:shadow-md ${
                      isUnavailable
                        ? "border-red-500/30 bg-red-500/5 text-neutral-400 cursor-not-allowed opacity-50"
                        : isRecent
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-[#C0C0C0]/15 bg-[#2A2A2A] text-white hover:border-[#FCC900]/50"
                    } ${
                      complementBlocked && !isUnavailable ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span className="text-sm font-bold truncate mr-2">{option.label}</span>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        isUnavailable
                          ? "bg-red-500/20 text-red-400"
                          : isRecent
                          ? "bg-green-500 text-white"
                          : "bg-black/40 text-white group-hover:bg-[#FCC900] group-hover:text-black"
                      }`}
                    >
                      {isUnavailable ? (
                        <AlertTriangle size={16} />
                      ) : isRecent ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}