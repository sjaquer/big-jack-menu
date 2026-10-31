"use client";

import { useEffect, useRef } from "react";
import { mountTurnstile, unmountTurnstile } from "../../../../lib/turnstileClient";

// Contenedor del widget anti-bots. Normalmente no se ve; solo aparece si Cloudflare
// necesita que el cliente marque una casilla.
export default function TurnstileWidget() {
  const ref = useRef(null);

  useEffect(() => {
    mountTurnstile(ref.current);
    return () => unmountTurnstile();
  }, []);

  return <div ref={ref} className="flex justify-center empty:hidden [&:not(:empty)]:mt-4" />;
}
