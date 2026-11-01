"use client";

// Último recurso si falla el layout raíz: HTML mínimo sin depender de estilos.
export default function GlobalError({ reset }) {
  return (
    <html lang="es-PE">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0f0f12", color: "#fff", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 40, margin: 0 }}>Algo se quemó</h1>
          <p style={{ color: "#bdbdbd" }}>Falló de nuestro lado, no del tuyo. Inténtalo otra vez.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, padding: "14px 32px", borderRadius: 999, border: 0, background: "#fcc900", fontWeight: 800, cursor: "pointer" }}>
            Intentar otra vez
          </button>
        </div>
      </body>
    </html>
  );
}
