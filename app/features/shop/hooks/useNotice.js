"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 6000;

// Aviso temporal dentro del carrito (límites, bebidas retiradas, etc.).
export default function useNotice(duration = DEFAULT_DURATION) {
  const [notice, setNotice] = useState("");
  const timerRef = useRef(null);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setNotice("");
  }, []);

  const show = useCallback(
    (message) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setNotice(message);
      timerRef.current = setTimeout(() => setNotice(""), duration);
    },
    [duration]
  );

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return { notice, showNotice: show, clearNotice: clear };
}
