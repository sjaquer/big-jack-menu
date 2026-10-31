"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const VARIANTS = {
  // Panel lateral derecho (carrito).
  drawer: {
    container: "justify-end",
    panel: "cart-drawer-panel h-full w-full max-w-md border-l border-white/10 bg-bj-bg sm:rounded-l-[2rem]",
  },
  // Hoja inferior en móvil, modal centrado desde `sm`.
  sheet: {
    container: "items-end sm:items-center justify-center sm:p-4",
    panel:
      "sheet-panel w-full sm:max-w-lg max-h-[92dvh] rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 bg-neutral-900",
  },
};

/**
 * Diálogo modal accesible: foco atrapado, cierre con Esc o clic afuera,
 * devuelve el foco al disparador y bloquea el scroll de la página.
 */
export default function Dialog({
  open,
  onClose,
  labelledBy,
  label,
  variant = "sheet",
  zIndex = "z-[60]",
  className = "",
  children,
}) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Foco en el panel (o en el elemento marcado) para no mostrar un anillo en "Cerrar" al abrir.
    (panel?.querySelector("[data-autofocus]") || panel)?.focus({ preventScroll: true });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const styles = VARIANTS[variant] || VARIANTS.sheet;

  return (
    <div className={`fixed inset-0 ${zIndex} flex ${styles.container}`}>
      <div
        className="fade-in absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        className={`relative z-10 flex flex-col overflow-hidden shadow-2xl outline-none ${styles.panel} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
