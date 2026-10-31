"use client";

import { useCallback, useState } from "react";

const GEO_OPTIONS = { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 };

// Obtiene la ubicación del cliente y la entrega como link de Google Maps.
export default function useGeolocation({ onLocated, onError } = {}) {
  const [isLocating, setIsLocating] = useState(false);

  const locate = useCallback(
    ({ silent = false } = {}) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        if (!silent) onError?.("Tu navegador no permite compartir la ubicación. Escribe tu dirección.");
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setIsLocating(false);
          onLocated?.(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`, { silent });
        },
        () => {
          setIsLocating(false);
          if (!silent) {
            onError?.(
              "No pudimos obtener tu ubicación. Escribe tu dirección o pega un enlace de Google Maps."
            );
          }
        },
        GEO_OPTIONS
      );
    },
    [onError, onLocated]
  );

  return { isLocating, locate };
}
