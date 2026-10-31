"use client";

// Campo con etiqueta visible (nunca solo placeholder). Superficie suave, sin borde duro.
export default function Field({ id, label, hint, multiline = false, icon: Icon, ...inputProps }) {
  const Control = multiline ? "textarea" : "input";
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-400">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className={`pointer-events-none absolute left-4 text-neutral-500 ${multiline ? "top-4" : "top-1/2 -translate-y-1/2"}`}
            aria-hidden="true"
          />
        )}
        <Control
          id={id}
          aria-describedby={hintId}
          rows={multiline ? 3 : undefined}
          className={`w-full rounded-2xl border border-transparent bg-white/[0.06] py-3.5 pr-4 text-base text-white outline-none transition-colors placeholder:text-neutral-600 hover:bg-white/[0.08] focus:border-bj-yellow/70 focus:bg-white/[0.08] ${Icon ? "pl-11" : "pl-4"} ${multiline ? "resize-none" : ""}`}
          {...inputProps}
        />
      </div>
      {hint && (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}
