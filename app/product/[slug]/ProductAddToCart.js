"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { formatMsToCountdown } from "../../lib/openHours";
import {
  addItem,
  buildCartItem,
  migrateLegacyCartItems,
} from "../../lib/cartModel";
import { readJson, writeJson } from "../../lib/safeStorage";
import {
  COMPLEMENT_CATEGORIES,
  MAX_CART_ITEMS,
  MAX_QTY_PER_ITEM,
  PRIMARY_CATEGORIES,
} from "../../features/home/constants";
import { applyComplementRules } from "../../features/home/cartRules";
import useOpenStatus from "../../features/home/hooks/useOpenStatus";
import { menuItems } from "../../data/menuData";

export default function ProductAddToCart({ product }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(product.options?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState("");

  const addToCart = () => {
    if (!selectedOption) return false;

    const saved = readJson("cart", []);
    const cart = migrateLegacyCartItems(saved, menuItems);

    const isComplement = COMPLEMENT_CATEGORIES.includes(product.category);
    const hasPrimary = cart.some((item) => PRIMARY_CATEGORIES.includes(item.category));
    if (isComplement && !hasPrimary) {
      setNotice("Para agregar bebidas primero agrega una hamburguesa.");
      return false;
    }

    const result = addItem(
      cart,
      buildCartItem(product, selectedOption, quantity),
      quantity,
      { maxPerItem: MAX_QTY_PER_ITEM, maxItems: MAX_CART_ITEMS }
    );

    if (result.added === 0) {
      setNotice(
        result.reason === "max_items"
          ? `Tu pedido no puede tener más de ${MAX_CART_ITEMS} productos en total.`
          : `La cantidad máxima por producto es de ${MAX_QTY_PER_ITEM} unidades.`
      );
      return false;
    }

    const nextCart = applyComplementRules(
      result.items,
      PRIMARY_CATEGORIES,
      COMPLEMENT_CATEGORIES
    ).items;

    writeJson("cart", nextCart);
    if (!isOpen) {
      writeJson("bj_preorder", true);
    }

    setNotice("");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event("storage"));
    return true;
  };

  const goToCartAndCheckout = () => {
    if (!addToCart()) return;
    setTimeout(() => {
      router.push("/?openCart=true");
    }, 300);
  };

  const { isOpen, nextOpenMs } = useOpenStatus();
  const countdown = nextOpenMs != null ? formatMsToCountdown(nextOpenMs) : null;

  return (
    <div className="space-y-6">
      {/* Selector de opciones */}
      {product.options && product.options.length > 0 && (
        <div className="space-y-3">
          <p className="font-anton text-base text-white uppercase tracking-wide">
            Elige tu versión
          </p>
          <div className="grid gap-3">
            {product.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`flex items-center justify-between rounded-2xl p-5 border-2 transition-all ${
                  selectedOption?.id === option.id
                    ? "border-[#FCC900] bg-[#FCC900]/10 text-white shadow-lg shadow-[#FCC900]/20"
                    : "bg-neutral-900 border-neutral-700 text-white hover:border-[#FCC900]/50"
                }`}
              >
                <div className="text-left">
                  <p className="font-anton text-lg uppercase tracking-wide">{option.label}</p>
                  {option.description && (
                    <p className={`text-xs ${selectedOption?.id === option.id ? "text-[#FCC900]" : "text-neutral-500"}`}>
                      {option.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-anton text-2xl ${selectedOption?.id === option.id ? "text-[#FCC900]" : "text-white"}`}>
                    S/ {option.price.toFixed(2)}
                  </span>
                  {selectedOption?.id === option.id && (
                    <div className="w-6 h-6 bg-[#FCC900] rounded-full flex items-center justify-center">
                      <Check size={16} className="text-black" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de cantidad */}
      <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5">
        <p className="font-anton text-base text-white uppercase tracking-wide mb-3">
          Cantidad
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center transition"
            disabled={quantity <= 1}
          >
            <Minus size={20} className={quantity <= 1 ? "text-neutral-600" : "text-white"} />
          </button>
          <span className="font-anton text-3xl text-[#FCC900]">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center transition"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Total y botones */}
      <div className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400 text-sm font-semibold">Subtotal:</span>
          <span className="font-anton text-3xl text-[#FCC900]">
            S/ {(selectedOption ? selectedOption.price * quantity : 0).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={goToCartAndCheckout}
            disabled={!selectedOption}
            className={`w-full min-h-[64px] rounded-2xl font-anton uppercase tracking-wide text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              added
                ? "bg-green-600 text-white"
                : "bg-[#FCC900] hover:bg-[#E2B500] text-black active:scale-[0.98]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <Check size={24} />
                ¡AGREGADO AL CARRITO!
              </>
            ) : (
              <>
                <ShoppingCart size={24} />
                PEDIR AHORA
              </>
            )}
          </button>

          <button
            onClick={addToCart}
            disabled={!selectedOption}
            className="w-full min-h-[56px] bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Agregar al carrito
          </button>
        </div>
      </div>

      {notice && (
        <div role="status" className="rounded-xl border-2 border-[#FCC900]/40 bg-[#FCC900]/10 p-3 text-center text-sm text-[#FCC900]">
          {notice}
        </div>
      )}

      {!isOpen ? (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-3 text-center text-sm text-red-200">
          <p className="font-semibold">Ahora estamos cerrados, pero puedes dejar una pre-orden.</p>
          {countdown ? (
            <p className="text-xs mt-1">Abrimos en {countdown}</p>
          ) : (
            <p className="text-xs mt-1">Pronto abriremos — revisa el horario</p>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-neutral-500">Listo en 15-20 minutos • Recojo en tienda</p>
      )}
    </div>
  );
}
