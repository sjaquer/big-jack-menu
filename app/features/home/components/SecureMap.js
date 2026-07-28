"use client";
import { useEffect, useRef } from "react";

export default function SecureMap() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ofuscar el iframe del mapa
    const mapData = atob("aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS9tYXBzL2VtYmVkP3BiPSExbTE4ITFtMTIhMW0zITFkMzkwMS40NDg5NTk2Mjg3MjUzITJkLTc3LjAzODI2MzAyNTE0MzQ1ITNkLTEyLjA4MTM4Njg0MjU0NTk1MyEybTMhMWYwITJmMCEzZjAhM20yITFpMTAyNCEyaTc2OCE0ZjEzLjEhM20zITFtMiExczB4OTEwNWM5ZGQwMzIyYjI5MSUzQTB4YTlkOTY5NWZkNzQ2YTQxYiEyc0hhbWJ1cmd1ZXNlciVDMyVBRGElMjAtJTIwQmlnJTIwSmFjayE1ZTAhM20yITFzZXMtNDE5ITJzcGUhNHYxNzYzNjgzMjU3NzI4ITVtMiExc2VzLTQxOSEyc3Bl");

    const iframe = document.createElement("iframe");
    iframe.src = mapData;
    iframe.className = "w-full h-full";
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";

    // Deshabilitar inspección de elementos y click derecho en el iframe
    iframe.addEventListener("contextmenu", (e) => e.preventDefault());
    iframe.addEventListener("load", () => {
      try {
        // Intentar ofuscar aún más
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.addEventListener("contextmenu", (e) => e.preventDefault());
        }
      } catch (e) {
        // Cross-origin, ignorar
      }
    });

    container.appendChild(iframe);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    />
  );
}
