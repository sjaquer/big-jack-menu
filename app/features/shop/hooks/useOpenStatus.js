"use client";

import { useEffect, useState } from "react";
import { getNextOpenDate, getOpenStatusLabel } from "../../../lib/openHours";

const DEFAULT_REFRESH_MS = 30000;

export default function useOpenStatus(refreshMs = DEFAULT_REFRESH_MS) {
  // `ready` es false hasta el primer cálculo en el cliente (evita mostrar
  // "abierto" o "cerrado" con el reloj del servidor durante el SSR).
  const [status, setStatus] = useState({
    isOpen: true,
    nextOpenMs: null,
    statusLabel: "",
    nextOpenLabel: "",
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;

    const update = () => {
      const now = new Date();
      if (cancelled) return;
      const next = getNextOpenDate(now);
      const { isOpen, label, nextOpenLabel = "" } = getOpenStatusLabel(now);
      setStatus({
        isOpen,
        nextOpenMs: next ? next.getTime() - now.getTime() : null,
        statusLabel: label,
        nextOpenLabel,
        ready: true,
      });
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") update();
    };

    update();
    const timer = setInterval(update, refreshMs);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshMs]);

  return status;
}
