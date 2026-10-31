"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

// Contador de cantidad. `sm`: versión discreta (círculos con borde) para listas.
// Con `onRemove`, al llegar al mínimo el "−" se convierte en "quitar".
export default function QuantityStepper({ value, onChange, onRemove, min = 1, max, label = "Cantidad", size = "md" }) {
  const canRemove = Boolean(onRemove) && value <= min;
  const small = size === "sm";
  const button = small
    ? "h-9 w-9 rounded-full border border-white/15 text-white hover:border-bj-yellow hover:text-bj-yellow disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:text-white"
    : "h-11 w-11 rounded-full bg-white/10 text-white hover:bg-white/15 disabled:opacity-30";

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => (canRemove ? onRemove() : onChange(value - 1))}
        disabled={value <= min && !canRemove}
        className={`flex items-center justify-center transition-colors ${button} ${canRemove ? "hover:!border-red-400 hover:!text-red-300" : ""}`}
        aria-label={canRemove ? "Quitar del pedido" : "Quitar uno"}
      >
        {canRemove ? <Trash2 size={small ? 14 : 16} /> : <Minus size={small ? 14 : 16} />}
      </button>
      <span className={`text-center font-bold tabular-nums text-white ${small ? "w-7 text-sm" : "w-9 text-lg"}`} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={max != null && value >= max}
        className={`flex items-center justify-center transition-colors ${
          small ? button : "h-11 w-11 rounded-full bg-bj-yellow text-black hover:bg-bj-yellow-hover disabled:opacity-30"
        }`}
        aria-label="Agregar uno"
      >
        <Plus size={small ? 14 : 16} />
      </button>
    </div>
  );
}
