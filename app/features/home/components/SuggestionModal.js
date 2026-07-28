import Image from "next/image";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";

export default function SuggestionModal({
  isOpen,
  suggestionCards = [],
  getSuggestedQty,
  changeSuggestedQty,
  onConfirm,
  onClose,
  onSkip,
  suggestedGuarn,
  suggestedInka,
  suggestedCoca,
}) {
  if (!isOpen) return null;

  const totalComplementsPrice =
    (suggestedGuarn?.options?.[0]?.price || 0) * getSuggestedQty("papas") +
    (suggestedInka?.options?.[0]?.price || 0) * getSuggestedQty("inka") +
    (suggestedCoca?.options?.[0]?.price || 0) * getSuggestedQty("coca");

  const hasAnySelected =
    getSuggestedQty("papas") > 0 ||
    getSuggestedQty("inka") > 0 ||
    getSuggestedQty("coca") > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suggestion-modal-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="max-w-lg w-full bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-[#FCC900]/30 rounded-3xl shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-b from-neutral-900 to-neutral-900/95 backdrop-blur-sm p-5 pb-4 border-b border-neutral-800 rounded-t-3xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p id="suggestion-modal-title" className="font-black text-white text-xl flex items-center gap-2">
                <span className="text-green-500 text-2xl">✓</span> ¡Agregado!
              </p>
              <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                ¿Quieres completar tu combo? Agrega las cantidades que necesites
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white hover:bg-neutral-800 p-2 rounded-full transition-all ml-2"
              aria-label="Cerrar modal"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-neutral-300 font-semibold">
            Recomendaciones para completar tu pedido:
          </p>
          <div className="space-y-3">
            {suggestionCards.map(({ type, item, badge, accent }) => {
              const qty = getSuggestedQty(type);
              const price = item?.options?.[0]?.price || 0;
              const subtotal = price * qty;

              return (
                <div
                  key={type}
                  className="bg-neutral-800/50 border-2 border-neutral-700 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700 flex-shrink-0">
                      {item?.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-content-center text-xs text-neutral-400">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${accent}`}>
                        {badge}
                      </p>
                      <p className="text-white font-bold text-base leading-tight truncate">
                        {item?.name}
                      </p>
                      <p className="text-neutral-400 text-xs mt-0.5 line-clamp-2">
                        {item?.options?.[0]?.label}
                      </p>
                      <p className="text-[#FCC900] text-xs font-black mt-1">
                        S/ {price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-neutral-400">Cantidad:</span>
                    <div className="flex items-center gap-3 bg-neutral-900 rounded-xl p-1.5 border border-neutral-700">
                      <button
                        onClick={() => changeSuggestedQty(type, -1)}
                        disabled={qty === 0}
                        aria-label={`Disminuir cantidad de ${item?.name}`}
                        className="w-8 h-8 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-lg font-bold w-8 text-center">{qty}</span>
                      <button
                        onClick={() => changeSuggestedQty(type, 1)}
                        disabled={qty >= 10}
                        aria-label={`Aumentar cantidad de ${item?.name}`}
                        className="w-8 h-8 flex items-center justify-center bg-[#FCC900] hover:bg-[#e2b500] disabled:opacity-30 disabled:cursor-not-allowed text-black rounded transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {qty > 0 && (
                    <div className="text-right text-xs text-[#FCC900] font-bold">
                      Subtotal: S/ {subtotal.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gradient-to-t from-neutral-950 to-neutral-950/95 backdrop-blur-sm p-5 pt-4 border-t border-neutral-800 rounded-b-3xl space-y-3 z-10">
          {hasAnySelected && (
            <div className="bg-[#FCC900]/10 border border-[#FCC900]/30 rounded-xl p-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-300">Total complementos:</span>
                <span className="text-[#FCC900] font-black text-xl">
                  S/ {totalComplementsPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={onConfirm}
            disabled={!hasAnySelected}
            className={`w-full min-h-[60px] rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-lg ${
              hasAnySelected
                ? "bg-gradient-to-r from-[#FCC900] to-[#b07020] hover:from-[#eeb055] hover:to-[#FCC900] text-black active:scale-[0.98]"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={20} />
            {hasAnySelected ? "Agregar al carrito" : "Selecciona al menos uno"}
          </button>
          <button
            onClick={onSkip}
            className="w-full min-h-[52px] bg-transparent hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl font-bold transition-all border-2 border-neutral-700 hover:border-neutral-600"
          >
            No, gracias
          </button>
        </div>
      </div>
    </div>
  );
}
