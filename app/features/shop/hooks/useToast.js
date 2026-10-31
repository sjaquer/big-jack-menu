"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 5000;

export default function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = useCallback(
    (options) => {
      const config = typeof options === "string" ? { message: options } : options;
      if (!config?.message) return;

      clearTimer();
      const id = Date.now();
      const type = config.type || "info";
      setToast({
        id,
        type,
        message: config.message,
        onConfirm: config.onConfirm,
      });

      if (type !== "confirm") {
        timerRef.current = setTimeout(() => {
          setToast((current) => (current?.id === id ? null : current));
        }, config.duration ?? DEFAULT_DURATION);
      }
    },
    [clearTimer]
  );

  const confirm = useCallback(() => {
    const action = toast?.onConfirm;
    dismiss();
    if (action) action();
  }, [dismiss, toast]);

  useEffect(() => clearTimer, [clearTimer]);

  return { toast, showToast, dismissToast: dismiss, confirmToast: confirm };
}
