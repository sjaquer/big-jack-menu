"use client";

import { useShop } from "../context/ShopContext";

// Una línea discreta: se puede ver la carta y dejar pre-orden para recojo.
export default function ClosedBanner() {
  const { ready, isOpen, nextOpenLabel } = useShop();
  if (!ready || isOpen) return null;

  return (
    <p role="status" className="bg-bj-red/20 px-5 py-2 text-center text-xs text-neutral-200">
      Ya cerramos, vecino. Volvemos {nextOpenLabel || "pronto"}. Puedes dejar tu pre-orden para recojo.
    </p>
  );
}
