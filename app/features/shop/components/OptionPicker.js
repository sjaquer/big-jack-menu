"use client";

import { formatPrice } from "../../../lib/format";

// Selector de presentación con radios nativos (accesible con teclado y lector de pantalla).
export default function OptionPicker({ name, options = [], value, onChange }) {
  if (options.length <= 1) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-xs font-black uppercase tracking-widest text-neutral-400">
        Elige tu versión
      </legend>
      {options.map((option) => {
        const checked = option.id === value;
        return (
          <label
            key={option.id}
            className={`flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
              checked ? "border-bj-yellow bg-bj-yellow/10" : "border-neutral-800 bg-neutral-950 hover:border-neutral-600"
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="h-5 w-5 accent-bj-yellow"
              />
              <span className="font-bold text-white">{option.label}</span>
            </span>
            <span className={`shrink-0 whitespace-nowrap font-anton text-xl ${checked ? "text-bj-yellow" : "text-white"}`}>
              {formatPrice(option.price)}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
