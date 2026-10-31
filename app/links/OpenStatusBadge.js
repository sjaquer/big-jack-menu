"use client";

import useOpenStatus from "../features/shop/hooks/useOpenStatus";

// Estado real (hora de Lima). Antes de hidratar no muestra nada para no mentir.
export default function OpenStatusBadge() {
  const { ready, isOpen, statusLabel } = useOpenStatus();

  return (
    <p
      className="inline-flex min-h-8 items-center gap-2 rounded-full border-2 border-neutral-800 bg-bj-surface px-4 py-1.5 text-xs font-bold"
      aria-live="polite"
    >
      {ready && (
        <>
          <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-500" : "bg-bj-red"}`} aria-hidden="true" />
          {statusLabel}
        </>
      )}
    </p>
  );
}
