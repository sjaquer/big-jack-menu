"use client";

// Control segmentado (radio accesible): una sola cápsula, la opción activa en amarillo.
export default function SegmentedChoice({ name, label, options, value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1 rounded-full bg-white/[0.06] p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const checked = option.id === value;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            name={name}
            disabled={option.disabled}
            onClick={() => onChange(option.id)}
            className={`flex h-11 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
              checked ? "bg-bj-yellow text-black shadow-md" : "text-neutral-300 hover:text-white"
            }`}
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
