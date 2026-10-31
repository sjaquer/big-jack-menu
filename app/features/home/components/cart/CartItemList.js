"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { MAX_QTY_PER_ITEM } from "../../constants";
import { useCartDrawer } from "../../context/CartContext";
import ItemThumb from "./ItemThumb";

export default function CartItemList() {
  const {
    cart,
    menuItems,
    openProductModal,
    updateQuantity,
    removeFromCart,
    clearCart,
    onToast,
  } = useCartDrawer();

  const handleClearCart = () => {
    if (cart.length === 0) return;
    onToast?.({
      type: "confirm",
      message: "¿Seguro que quieres vaciar todo el carrito?",
      onConfirm: clearCart,
    });
  };

  const handleQuantityUp = (item) => {
    if (item.quantity < MAX_QTY_PER_ITEM) {
      updateQuantity(item.id, 1);
      return;
    }

    onToast?.({
      type: "info",
      message: `La cantidad máxima por producto es de ${MAX_QTY_PER_ITEM} unidades.`,
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={40} className="text-neutral-600" />
          </div>
          <p className="text-xl font-black text-white">Tu carrito está vacío</p>
          <p className="text-sm text-neutral-400 max-w-[200px] mx-auto">
            ¿No sabes qué pedir? Aquí tienes nuestros favoritos:
          </p>
        </div>

        <div className="w-full space-y-3">
          {menuItems
            .filter((i) => i.popular)
            .slice(0, 2)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => openProductModal(item)}
                className="w-full flex items-center gap-4 bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 hover:border-[#FCC900]/50 p-3 rounded-2xl transition-all group text-left"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-700 flex-shrink-0 border border-neutral-600 relative">
                  <ItemThumb src={item.image} name={item.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-[#FCC900] transition-colors truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-1">{item.description}</p>
                  <p className="text-[#FCC900] font-black text-sm mt-1">
                    S/ {item.options?.[0]?.price.toFixed(2)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FCC900] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-lg shadow-[#FCC900]/20">
                  <Plus size={18} />
                </div>
              </button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
          Productos ({cart.length})
        </p>
        <button
          onClick={handleClearCart}
          className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border border-red-600/50 bg-red-600/10 px-3 text-xs font-semibold text-red-300 transition-colors hover:bg-red-600/20"
        >
          <Trash2 size={14} />
          Vaciar carrito
        </button>
      </div>

      {cart.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 bg-neutral-800/50 p-3 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-colors"
        >
          <div className="w-16 h-16 bg-neutral-700 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-700 relative">
            <ItemThumb src={item.image} name={item.name} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm mb-1 text-white truncate">{item.name}</h4>
            <p className="text-xs text-neutral-400 mb-2">{item.optionLabel}</p>
            <div className="flex items-center justify-between">
              <p className="text-[#FCC900] font-black text-sm">
                S/ {(item.price * item.quantity).toFixed(2)}
              </p>
              <div className="flex items-center gap-3 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-white transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityUp(item)}
                  disabled={item.quantity >= MAX_QTY_PER_ITEM}
                  className="w-6 h-6 flex items-center justify-center bg-[#FCC900] hover:bg-[#e2b500] disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-neutral-500 hover:text-red-500 self-start p-1 transition-colors"
            aria-label="Eliminar del carrito"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
