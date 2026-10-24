"use client";

import { useEffect, useState } from "react";
import { getNextOpenDate, isOpenNow } from "../../../lib/openHours";

const DEFAULT_REFRESH_MS = 30000;

export default function useOpenStatus(refreshMs = DEFAULT_REFRESH_MS) {
  const [isOpen, setIsOpen] = useState(true);
  const [nextOpenMs, setNextOpenMs] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const update = () => {
      const now = new Date();
      if (cancelled) return;
      setIsOpen(Boolean(isOpenNow(now)));
      const next = getNextOpenDate(now);
      setNextOpenMs(next ? next.getTime() - now.getTime() : null);
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

  return { isOpen, nextOpenMs };
}
