import Link from "next/link";

export const metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="bg-grid flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="tag-streetwear">[ Error 404 ]</p>
      <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-7xl">
        Esta calle <span className="text-bj-yellow">no existe</span>
      </h1>
      <p className="max-w-sm text-neutral-300">Ni en el Centro. Vuelve a la carta.</p>
      <Link href="/" className="btn-streetwear flex h-14 items-center rounded-xl px-8 text-lg">
        Ver la carta
      </Link>
    </main>
  );
}
