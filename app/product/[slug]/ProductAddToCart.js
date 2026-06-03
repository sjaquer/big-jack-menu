"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "../../lib/openHours";
import { buildCartItem, migrateLegacyCartItems } from "../../lib/cartModel";
import { menuItems } from "../../data/menuData";

export default function ProductAddToCart({ product }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(product.options?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!selectedOption) return;

    // Obtener carrito actual
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    const cart = migrateLegacyCartItems(saved, menuItems);
    
    // Crear ID único que coincida con el formato de la página principal
    const uniqueId = `${product.id}-${selectedOption.id}`;
    
    // Buscar si ya existe este item exacto usando el ID único
    const existingIndex = cart.findIndex((item) => item.id === uniqueId);
    
    if (existingIndex >= 0) {
      // Incrementar cantidad
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(buildCartItem(product, selectedOption, quantity));
    }

    // Guardar en localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    if (!isOpen) {
      localStorage.setItem("bj_preorder", JSON.stringify(true));
    }
    
    // Mostrar feedback
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // Disparar evento personalizado para actualizar el carrito en la página principal
    window.dispatchEvent(new Event("storage"));
  };

  const goToCartAndCheckout = () => {
    addToCart();
    setTimeout(() => {
      router.push("/?openCart=true");
    }, 300);
  };

  // Estado de apertura local para este componente (cliente)
  const [isOpen, setIsOpen] = useState(true);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const open = isOpenNow(now);
      setIsOpen(Boolean(open));
      const next = getNextOpenDate(now);
      if (next) setCountdown(formatMsToCountdown(next.getTime() - now.getTime()));
      else setCountdown(null);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Selector de opciones */}
      {product.options && product.options.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-white uppercase tracking-wider">
            Elige tu versión
          </p>
          <div className="grid gap-3">
            {product.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option)}
                className={`flex items-center justify-between rounded-2xl p-5 border-2 transition-all ${
                  selectedOption?.id === option.id
                    ? "border-[#d99133] bg-[#d99133]/10 text-white shadow-lg shadow-[#d99133]/20"
                    : "bg-neutral-900 border-neutral-700 text-white hover:border-[#d99133]/50"
                }`}
              >
                <div className="text-left">
                  <p className="font-black text-lg">{option.label}</p>
                  <p className={`text-xs ${selectedOption?.id === option.id ? "text-[#d99133]" : "text-neutral-500"}`}>
                    {option.id === 'simple' ? 'Hamburguesa + Papas' : 'Hamburguesa Doble + Papas + Gaseosa'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-black ${selectedOption?.id === option.id ? "text-[#d99133]" : "text-white"}`}>
                    S/ {option.price.toFixed(2)}
                  </span>
                  {selectedOption?.id === option.id && (
                    <div className="w-6 h-6 bg-[#d99133] rounded-full flex items-center justify-center">
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
        <p className="text-sm font-bold text-white uppercase tracking-wider mb-3">
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
          <span className="text-3xl font-black text-[#d99133]">{quantity}</span>
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
          <span className="text-3xl font-black text-[#d99133]">
            S/ {(selectedOption ? selectedOption.price * quantity : 0).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={goToCartAndCheckout}
            disabled={!selectedOption}
            className={`w-full min-h-[64px] rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              added
                ? "bg-green-600 text-white"
                : "bg-[#d99133] hover:bg-[#eeb055] text-black active:scale-[0.98]"
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
