import Image from "next/image";
import { X, ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function ProductModal({
  product,
  selectedOptionId,
  onClose,
  onSelectOption,
  onConfirm,
  selectedOption,
}) {
  const [imgErr, setImgErr] = useState(false);

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
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-800 flex-shrink-0">
            {product.image && !imgErr ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="96px"
                className="object-cover"
                onError={() => setImgErr(true)}
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex-shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold">
            Elige la versión
          </p>
          <div className="grid gap-2.5">
            {product.options?.map((option) => {
              const isActive = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option.id)}
                  className={`w-full min-h-[64px] rounded-2xl border-2 px-5 py-3.5 text-left transition-all active:scale-95 flex items-center justify-between ${
                    isActive
                      ? "border-[#FCC900] bg-[#FCC900] text-black shadow-lg shadow-[#FCC900]/20 font-black"
                      : "border-neutral-800 bg-neutral-900/90 text-neutral-200 hover:border-[#FCC900]/50 hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isActive ? "border-black bg-black text-[#FCC900]" : "border-neutral-600"
                      }`}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-[#FCC900]" />}
                    </div>
                    <div>
                      <p className="text-base font-bold leading-tight">{option.label}</p>
                      <p className={`text-xs ${isActive ? "text-black/70 font-semibold" : "text-neutral-400"}`}>
                        Presentación: {option.label.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-black text-xl ${isActive ? "text-black" : "text-[#FCC900]"}`}>
                    S/ {option.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="bg-neutral-950 border-2 border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-neutral-400 font-bold text-sm">Subtotal de esta versión</span>
            <span className="text-2xl font-black text-[#FCC900]">
              {selectedOption ? `S/ ${selectedOption.price.toFixed(2)}` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="min-h-[56px] rounded-2xl border-2 border-neutral-700 bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all active:scale-95 text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedOption}
              className="min-h-[56px] rounded-2xl bg-[#FCC900] text-black font-black text-base disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-[#FCC900]/20 hover:bg-[#e2b500]"
            >
              <ShoppingCart size={20} />
              Agregar al pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
