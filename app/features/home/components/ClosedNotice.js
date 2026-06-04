"use client";

export default function ClosedNotice({
  isOpen,
  closedNoticeHidden,
  nextOpenMs,
  onShowAviso,
  onCloseAviso,
  formatMsToCountdown,
}) {
  if (isOpen) return null;

  return (
    <>
      {/* Barra informativa cuando se oculta el aviso de cerrado (pre-orden) */}
      {closedNoticeHidden && (
        <div className="bg-red-800/90 border-t-2 border-red-600 text-white text-center py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="text-sm">
              Estamos cerrados — Abrimos en{" "}
              {nextOpenMs ? formatMsToCountdown(nextOpenMs) : "Pronto"}. Cualquier pedido sería
              una pre-orden y se procesará cuando abramos.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onShowAviso}
                className="text-sm bg-transparent border border-white/20 px-3 py-2 rounded text-white active:scale-95"
              >
                Mostrar aviso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de CERRADO (bloqueo) */}
      {!closedNoticeHidden && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="closed-notice-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4"
        >
          <div className="max-w-md w-full bg-neutral-900 border-2 border-red-600 rounded-3xl p-6 text-center">
            <h2 id="closed-notice-title" className="text-2xl font-black text-red-400 mb-2">
              Estamos cerrados
            </h2>
            <p className="text-sm text-neutral-300 mb-4">
              Ahora no estamos disponibles para recibir pedidos. Puedes ver el menú, pero el pedido
              estará deshabilitado hasta la próxima apertura.
            </p>
            <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 mb-4">
              <p className="text-xs text-neutral-400">Abrimos en</p>
              <p className="text-lg font-bold text-white">
                {nextOpenMs ? formatMsToCountdown(nextOpenMs) : "Pronto"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCloseAviso}
                className="flex-1 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold active:scale-95"
              >
                Ver Menú
              </button>
              <button
                onClick={() => {
                  window.location.href = "/libro-de-reclamaciones";
                }}
                className="px-4 py-3 rounded-2xl bg-[#FCC900] hover:bg-[#e2b500] text-black font-black active:scale-95"
              >
                Libro de Reclamaciones
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
