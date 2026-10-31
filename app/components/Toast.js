"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const STYLES = {
  info: {
    icon: Info,
    border: "border-bj-yellow/50",
    iconColor: "text-bj-yellow",
  },
  success: {
    icon: CheckCircle2,
    border: "border-green-500/60",
    iconColor: "text-green-400",
  },
  error: {
    icon: AlertTriangle,
    border: "border-red-500/60",
    iconColor: "text-red-400",
  },
  confirm: {
    icon: AlertTriangle,
    border: "border-bj-yellow/60",
    iconColor: "text-bj-yellow",
  },
};

export default function Toast({ toast, onDismiss, onConfirm }) {
  if (!toast) return null;

  const style = STYLES[toast.type] || STYLES.info;
  const Icon = style.icon;
  const isConfirm = toast.type === "confirm";

  return (
    <div className="fixed top-[calc(var(--header-h)+0.75rem)] right-4 left-4 sm:left-auto sm:w-96 z-[70]">
      <div
        role={isConfirm ? "alertdialog" : "status"}
        aria-live={isConfirm ? undefined : "polite"}
        key={toast.id}
        className={`toast-enter rounded-2xl border-2 ${style.border} bg-neutral-900/95 backdrop-blur-md p-4 shadow-2xl`}
      >
        <div className="flex items-start gap-3">
          <Icon size={18} className={`${style.iconColor} mt-0.5 shrink-0`} />
          <p className="flex-1 text-sm text-white leading-relaxed">{toast.message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isConfirm && (
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-3 py-2 rounded-xl bg-bj-yellow hover:bg-bj-yellow-hover text-black text-sm font-black transition-colors"
            >
              Aceptar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
