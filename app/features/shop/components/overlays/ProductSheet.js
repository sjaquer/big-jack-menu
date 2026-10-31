"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import Dialog from "../../../../components/Dialog";
import { formatPrice } from "../../../../lib/format";
import { useShop } from "../../context/ShopContext";
import { MAX_QTY_PER_ITEM } from "../../constants";
import OptionPicker from "../OptionPicker";
import QuantityStepper from "../QuantityStepper";

function SheetContent({ product, initialOptionId, onClose, onAdd }) {
  const [optionId, setOptionId] = useState(initialOptionId || product.options?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const option = product.options?.find((entry) => entry.id === optionId) || product.options?.[0];

  return (
    <>
      <div className="relative aspect-[16/10] w-full shrink-0 bg-black sm:aspect-[16/9]">
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 512px" className="object-cover" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur hover:bg-black"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <h2 id="product-sheet-title" className="font-anton text-3xl uppercase leading-none text-white">
            {product.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{product.description}</p>
          <Link
            href={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-2 inline-block text-xs font-bold text-bj-yellow underline-offset-4 hover:underline"
          >
            Ver ficha completa
          </Link>
        </div>

        <OptionPicker name={`option-${product.slug}`} options={product.options} value={optionId} onChange={setOptionId} />

        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Cantidad</span>
          <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_QTY_PER_ITEM} />
        </div>
      </div>

      <div className="pb-safe border-t border-neutral-800 bg-neutral-900 p-4">
        <button
          type="button"
          data-autofocus
          onClick={() => onAdd(option?.id, quantity)}
          disabled={!option}
          className="btn-streetwear flex h-14 w-full items-center justify-center gap-3 rounded-full text-lg disabled:opacity-50"
        >
          <ShoppingBag size={20} aria-hidden="true" />
          Agregar · {formatPrice((option?.price || 0) * quantity)}
        </button>
      </div>
    </>
  );
}

export default function ProductSheet() {
  const { sheet, closeSheet, addProduct } = useShop();
  const product = sheet?.product;

  return (
    <Dialog open={Boolean(product)} onClose={closeSheet} labelledBy="product-sheet-title" variant="sheet">
      {product && (
        <SheetContent
          key={product.id}
          product={product}
          initialOptionId={sheet.optionId}
          onClose={closeSheet}
          onAdd={(optionId, quantity) => {
            if (addProduct(product, optionId, quantity)) closeSheet();
          }}
        />
      )}
    </Dialog>
  );
}
