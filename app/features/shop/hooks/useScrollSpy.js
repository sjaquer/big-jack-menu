"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve el id de la sección visible bajo la barra fija.
 * Usa IntersectionObserver: no escucha `scroll` en cada frame.
 */
export default function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(ids[0]);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!elements.length) return undefined;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const current = ids.find((id) => visible.get(id));
        if (current) setActiveId(current);
      },
      // Franja horizontal debajo del header + barra de categorías.
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return { activeId, setActiveId };
}
