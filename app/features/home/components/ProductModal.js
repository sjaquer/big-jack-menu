"use client";

import { X, ShoppingCart } from "lucide-react";

export default function ProductModal({
  product,
  selectedOptionId,
  onClose,
  onSelectOption,
  onConfirm,
  selectedOption,
}) {
  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 product-modal-container"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer product-modal-backdrop"
        onClick={onClose}
        aria-label="Cerrar modal"
      ></div>
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 product-modal-panel animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex items-start gap-4 border-b border-neutral-800">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-800 flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full grid place-content-center text-neutral-500 text-sm">
                Sin imagen
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#FCC900] mb-1">
              {product.category}
            </p>
            <h3 id="modal-product-title" className="text-2xl font-bold text-white leading-tight mb-2">
              {product.name}
            </h3>
            <p className="text-sm text-neutral-400 line-clamp-3">
              {product.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
            Elige la versión
          </p>
          <div className="grid gap-2">
            {product.options?.map((option) => {
              const isActive = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option.id)}
                  className={`w-full min-h-[68px] rounded-2xl border-2 px-5 py-4 text-left transition-all active:scale-95 ${
                    isActive
                      ? "border-[#FCC900] bg-[#FCC900]/10 text-white shadow-lg shadow-[#FCC900]/20"
                      : "border-neutral-800 bg-neutral-900/70 text-neutral-200 hover:border-[#FCC900]/50 hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold">{option.label}</p>
                      <p className="text-xs text-neutral-400">
                        Recomendada: {option.label.toLowerCase()}
                      </p>
                    </div>
                    <span className="text-[#FCC900] font-black text-xl">
                      S/ {option.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-5 flex items-center justify-between">
            <span className="text-neutral-400 font-semibold">Subtotal</span>
            <span className="text-2xl font-black text-[#FCC900]">
              {selectedOption ? `S/ ${selectedOption.price.toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="min-h-[56px] rounded-2xl border-2 border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-700 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!selectedOption}
              className="min-h-[56px] rounded-2xl bg-[#FCC900] text-black font-black disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingCart size={20} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
