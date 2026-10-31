"use client";

import { useEffect, useState } from "react";
import { analytics } from "../../../lib/analytics";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "../../../lib/format";
import { formatPrepTime } from "../../../lib/schedule";
import OptionPicker from "../../../features/shop/components/OptionPicker";
import QuantityStepper from "../../../features/shop/components/QuantityStepper";
import { useShop } from "../../../features/shop/context/ShopContext";
import { MAX_QTY_PER_ITEM } from "../../../features/shop/constants";

export default function ProductAddToCart({ product }) {
  const { addProduct, openCart, ready, isOpen, nextOpenLabel } = useShop();
  const [optionId, setOptionId] = useState(product.options?.[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const option = product.options?.find((entry) => entry.id === optionId) || product.options?.[0];
  const isUnavailable = product.available === false;

  useEffect(() => {
    analytics.viewItem(product);
  }, [product]);

  return (
    <div className="space-y-5">
      <OptionPicker name="product-option" options={product.options} value={optionId} onChange={setOptionId} />

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-semibold text-neutral-400">Cantidad</span>
        <QuantityStepper value={quantity} onChange={setQuantity} max={MAX_QTY_PER_ITEM} />
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => addProduct(product, option?.id, quantity)}
          disabled={!option || isUnavailable}
          className="btn-streetwear flex h-16 items-center justify-center gap-3 rounded-full text-lg disabled:opacity-50"
        >
          <ShoppingBag size={20} aria-hidden="true" />
          {isUnavailable ? "Agotado" : `Agregar · ${formatPrice((option?.price || 0) * quantity)}`}
        </button>
        <button
          type="button"
          onClick={openCart}
          className="h-12 text-sm font-semibold text-neutral-400 underline-offset-4 hover:text-white hover:underline"
        >
          Ver mi pedido
        </button>
      </div>

      {ready && (
        <p className={`text-center text-sm ${isOpen ? "text-neutral-500" : "text-red-200"}`}>
          {isOpen
            ? `Recojo listo en ${formatPrepTime()} o delivery cercano.`
            : `Ya cerramos. Deja tu pre-orden para recojo: volvemos ${nextOpenLabel || "pronto"}.`}
        </p>
      )}
    </div>
  );
}
