"use client";

import Link from "next/link";
import { useEffect } from "react";

// Error inesperado en una página: mensaje claro, sin chistes (manual §6.2) y una salida.
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-5 text-center">
      <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-7xl">
        Algo se <span className="text-bj-yellow">quemó</span>
      </h1>
      <p className="max-w-sm text-neutral-300">
        Falló de nuestro lado, no del tuyo. Inténtalo otra vez; si sigue, escríbenos al WhatsApp.
      </p>
      <div className="flex flex-col items-center gap-3">
        <button type="button" onClick={reset} className="btn-streetwear h-14 rounded-full px-10 text-lg">
          Intentar otra vez
        </button>
        <Link href="/" className="text-sm font-semibold text-neutral-400 underline-offset-4 hover:text-white hover:underline">
          Volver a la carta
        </Link>
      </div>
    </main>
  );
}
