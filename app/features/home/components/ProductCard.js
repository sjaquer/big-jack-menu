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
    <div className="group relative bg-[#131317] border-3 border-neutral-800 rounded-3xl overflow-hidden hover:border-[#FCC900] transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-[#FCC900]/15 product-card-anim">
      {isUnavailable && (
        <div className="absolute top-4 right-4 z-30 bg-red-600 border-2 border-black text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg">
          No disponible
        </div>
      )}

      <div className="relative block overflow-hidden bg-black flex-shrink-0 aspect-[4/3] w-full">
        {item.image && !imgError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transform transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold uppercase tracking-widest text-sm bg-neutral-900">
            Sin foto
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#131317] via-transparent to-transparent opacity-90" />

        {item.popular && (
          <span className="absolute top-4 left-4 z-20 block-yellow text-xs shadow-md">
            HIT LIMEÑO
          </span>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div>
            <span className="tag-streetwear text-[10px] mb-1 inline-block">
              {item.category}
            </span>
            <h3 className="font-anton text-3xl sm:text-4xl text-white leading-[0.95] tracking-tight drop-shadow-md">
              {item.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between z-10 relative bg-[#131317]">
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-6 font-medium line-clamp-3">
          {item.description}
        </p>

        <div className="mt-auto border-t-2 border-neutral-800/80 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
              PRECIO
            </span>
            <div className="block-yellow text-lg">
              <span className="text-xs font-black mr-1 opacity-80">DESDE</span>
              <span>S/ {basePrice.toFixed(2)}</span>
            </div>
          </div>

          {isPrimary ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenModal(item)}
                disabled={isUnavailable}
                className={`flex-1 py-4 px-6 rounded-xl text-base font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                  isUnavailable
                    ? "bg-neutral-800 text-neutral-600 border-2 border-neutral-700 cursor-not-allowed"
                    : "btn-streetwear"
                }`}
              >
                <Plus size={20} className="stroke-[3]" />
                <span className="hidden sm:inline">Armar combo / Agregar</span>
                <span className="sm:hidden">Pedir ahora</span>
              </button>

              {itemQtyInCart > 0 && (
                <div className="w-12 h-12 bg-black border-2 border-[#FCC900] text-[#FCC900] rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0">
                  x{itemQtyInCart}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                OPCIONES
              </p>
              {optionsToRender.map((option) => {
                const isRecent = recentlyAdded === `${item.id}-${option.id}`;
                return (
                  <button
                    key={option.id}
                    onClick={() => onAdd(item, option.id)}
                    disabled={isDisabled}
                    className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center justify-between font-bold text-sm ${
                      isUnavailable
                        ? "border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed"
                        : isRecent
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-neutral-800 bg-[#1F1F24] text-white hover:border-[#FCC900] hover:bg-neutral-800"
                    }`}
                  >
                    <span className="truncate mr-2">{option.label}</span>
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                        isUnavailable
                          ? "bg-neutral-800 text-neutral-600"
                          : isRecent
                          ? "bg-green-500 text-white"
                          : "bg-black text-[#FCC900]"
                      }`}
                    >
                      {isUnavailable ? (
                        <AlertTriangle size={14} />
                      ) : isRecent ? (
                        <Check size={14} />
                      ) : (
                        <Plus size={14} />
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