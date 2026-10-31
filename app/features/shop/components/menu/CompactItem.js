"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice, getPriceRange } from "../../../../lib/format";

// Complementos (papas, bebidas): fila liviana, sin competir con las hamburguesas.
export default function CompactItem({ item, quantityInCart = 0, note, onAdd, onOpen }) {
  const { min } = getPriceRange(item);
  const isUnavailable = item.available === false;

  return (
    <article aria-labelledby={`item-${item.slug}`} className="reveal flex items-center gap-4 py-5">
      <button
        type="button"
        onClick={() => onOpen(item)}
        disabled={isUnavailable}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-black"
        aria-label={`Ver ${item.name}`}
      >
        <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
      </button>

      <div className="min-w-0 flex-1">
        <h3 id={`item-${item.slug}`} className="text-lg font-bold leading-tight text-white">
          <Link href={`/product/${item.slug}`} className="hover:text-bj-yellow">
            {item.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-neutral-400">{formatPrice(min)}</p>
        {quantityInCart > 0 && <p className="mt-0.5 text-xs text-bj-yellow">{quantityInCart} en tu pedido</p>}
        {note && <p className="mt-1 text-xs text-neutral-500">{note}</p>}
      </div>

      <button
        type="button"
        onClick={() => onAdd(item)}
        disabled={isUnavailable}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-neutral-700 text-white transition-colors hover:border-bj-yellow hover:text-bj-yellow disabled:opacity-40"
        aria-label={isUnavailable ? `${item.name} agotado` : `Agregar ${item.name}`}
      >
        <Plus size={22} />
      </button>
    </article>
  );
}
