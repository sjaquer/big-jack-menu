"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { isOpenNow, getNextOpenDate, formatMsToCountdown } from "../../lib/openHours";

export default function ProductAddToCart({ product }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(product.options?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    // Bloquear si estamos cerrados
    if (!isOpen) {
      alert("Estamos cerrados ahora. No es posible agregar al carrito hasta la próxima apertura.");
      return;
    }
    if (!selectedOption) return;

    // Obtener carrito actual
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Buscar si ya existe este item exacto
    const existingIndex = cart.findIndex(
      (item) => item.id === product.id && item.selectedOption?.id === selectedOption.id
    );

    if (existingIndex >= 0) {
      // Incrementar cantidad
      cart[existingIndex].quantity += quantity;
    } else {
      // Agregar nuevo item
      cart.push({
        id: product.id,
        name: product.name,
        image: product.image,
        selectedOption,
        quantity,
        category: product.category
      });
    }

    // Guardar en localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    
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
                    ? "bg-yellow-500 border-yellow-500 text-black"
                    : "bg-neutral-900 border-neutral-700 text-white hover:border-yellow-500/50"
                }`}
              >
                <div className="text-left">
                  <p className="font-black text-lg">{option.label}</p>
                  <p className={`text-xs ${selectedOption?.id === option.id ? "text-black/70" : "text-neutral-500"}`}>
                    {option.id === 'simple' ? 'Hamburguesa + Papas' : 'Hamburguesa Doble + Papas + Gaseosa'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black">
                    S/ {option.price.toFixed(2)}
                  </span>
                  {selectedOption?.id === option.id && (
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                      <Check size={16} className="text-yellow-500" />
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
          <span className="text-3xl font-black text-yellow-500">{quantity}</span>
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
          <span className="text-3xl font-black text-yellow-500">
            S/ {(selectedOption ? selectedOption.price * quantity : 0).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={goToCartAndCheckout}
            disabled={!selectedOption || !isOpen}
            className={`w-full min-h-[64px] rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
              added
                ? "bg-green-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-400 text-black active:scale-[0.98]"
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
            disabled={!selectedOption || !isOpen}
            className="w-full min-h-[56px] bg-neutral-800 hover:bg-neutral-700 border-2 border-neutral-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Agregar al carrito
          </button>
        </div>
      </div>

      {!isOpen ? (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-3 text-center text-sm text-red-200">
          <p className="font-semibold">Ahora estamos cerrados.</p>
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
