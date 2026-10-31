"use client";

import Image from "next/image";
import { X } from "lucide-react";
import Dialog from "../../../../components/Dialog";
import { formatPrice } from "../../../../lib/format";
import { useShop } from "../../context/ShopContext";
import { MAX_QTY_PER_ITEM } from "../../constants";
import QuantityStepper from "../QuantityStepper";

// Sugerencia de papas y bebidas después de la primera hamburguesa.
export default function UpsellSheet() {
  const { upsell } = useShop();
  const hasSelection = upsell.subtotal > 0;

  return (
    <Dialog open={upsell.isOpen} onClose={upsell.close} labelledBy="upsell-title" variant="sheet">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-800 p-5">
        <div>
          <h2 id="upsell-title" className="font-anton text-2xl uppercase text-white">
            ¿Le pones papas y gaseosa?
          </h2>
          <p className="mt-1 text-sm text-neutral-400">La hamburguesa ya está en tu pedido.</p>
        </div>
        <button
          type="button"
          onClick={upsell.close}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto p-5">
        {upsell.items.map((item) => {
          const option = item.options?.[0];
          return (
            <li
              key={item.slug}
              className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-black">
                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-bold leading-tight text-white">{item.name}</p>
                <p className="text-sm font-black text-bj-yellow">{formatPrice(option?.price)}</p>
              </div>
              <QuantityStepper
                size="sm"
                min={0}
                max={MAX_QTY_PER_ITEM}
                label={`Cantidad de ${item.name}`}
                value={upsell.quantities[item.slug] || 0}
                onChange={(next) => upsell.change(item.slug, next - (upsell.quantities[item.slug] || 0))}
              />
            </li>
          );
        })}
      </ul>

      <div className="pb-safe grid grid-cols-[1fr_1.4fr] gap-3 border-t border-neutral-800 p-4">
        <button
          type="button"
          onClick={upsell.close}
          className="h-14 rounded-full border border-white/15 font-semibold text-neutral-200 hover:bg-white/5"
        >
          No, gracias
        </button>
        <button
          type="button"
          onClick={upsell.confirm}
          disabled={!hasSelection}
          className="btn-streetwear h-14 rounded-full text-base disabled:border-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {hasSelection ? `Agregar · ${formatPrice(upsell.subtotal)}` : "Elige al menos uno"}
        </button>
      </div>
    </Dialog>
  );
}
