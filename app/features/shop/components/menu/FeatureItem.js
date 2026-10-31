"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice, getPriceRange } from "../../../../lib/format";

/**
 * Producto estrella (hamburguesas): foto grande, nombre enorme y una sola acción.
 * `index` alterna el formato de la foto para romper la monotonía de la lista.
 */
export default function FeatureItem({ item, index = 0, quantityInCart = 0, onAdd, onOpen, priority = false }) {
  const { min } = getPriceRange(item);
  const hasOptions = (item.options?.length || 0) > 1;
  const isUnavailable = item.available === false;
  const tall = index % 2 === 0;

  return (
    <article aria-labelledby={`item-${item.slug}`} className="reveal">
      <button
        type="button"
        onClick={() => onOpen(item)}
        disabled={isUnavailable}
        className={`group relative block w-full overflow-hidden rounded-[2rem] bg-black ${
          tall ? "aspect-[4/5] sm:aspect-[5/4]" : "aspect-square sm:aspect-[16/9]"
        }`}
        aria-label={`Ver ${item.name}`}
      >
        <Image
          src={item.image}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {quantityInCart > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-bj-yellow backdrop-blur">
            {quantityInCart} en tu pedido
          </span>
        )}
      </button>

      {item.popular && (
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-bj-yellow">La más pedida</p>
      )}
      <h3
        id={`item-${item.slug}`}
        className={`font-anton text-5xl uppercase leading-[0.9] text-white sm:text-6xl ${item.popular ? "mt-2" : "mt-6"}`}
      >
        <Link href={`/product/${item.slug}`} className="hover:text-bj-yellow">
          {item.name}
        </Link>
      </h3>
      <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-400">{item.description}</p>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-anton text-3xl text-white">
          {hasOptions && <span className="mr-2 align-middle font-sans text-sm font-semibold text-neutral-500">desde</span>}
          {formatPrice(min)}
        </p>
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={isUnavailable}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-bj-yellow text-black transition-transform hover:scale-105 active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-500"
          aria-label={isUnavailable ? `${item.name} agotada` : `Agregar ${item.name}`}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}
