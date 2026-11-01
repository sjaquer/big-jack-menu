import Link from "next/link";
import { restaurantInfo } from "../../data/menuData";
import { whatsappUrl } from "../../lib/site";

export const metadata = {
  title: "Quiénes somos",
  description: `${restaurantInfo.name}: hamburguesas gruesas a la plancha en el ${restaurantInfo.address.area}. Carne de res, queso derretido y trato directo, sin floro.`,
  alternates: { canonical: "/quienes" },
  openGraph: {
    title: `Quiénes somos | ${restaurantInfo.name}`,
    description: `La caleta del Centro: hamburguesas gruesas a la plancha, carne 100% de res y salsas de la casa en el ${restaurantInfo.address.area}.`,
    url: "/quienes",
    siteName: restaurantInfo.name,
    locale: "es_PE",
    type: "website",
    images: [{ url: "/images/og-bigjack.jpg", width: 1200, height: 630, alt: `${restaurantInfo.name} - Quiénes somos` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Quiénes somos | ${restaurantInfo.name}`,
    description: `La caleta del Centro: hamburguesas gruesas a la plancha en el ${restaurantInfo.address.area}.`,
    images: ["/images/og-bigjack.jpg"],
  },
};

const PRINCIPLES = [
  { title: "Respeto por el cliente", text: "Cada pedido sale como si fuera para la casa." },
  { title: "Calidad sin maquillaje", text: "Fotos reales, producto real y punto real." },
  { title: "Operación rápida", text: "Recojo al toque y pedidos grandes sin enredos." },
  { title: restaurantInfo.address.area, text: "Despachamos cerca, desde el corazón de Lima." },
];

export default function QuienesPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
      <h1 className="text-xs font-semibold uppercase tracking-[0.4em] text-neutral-500">Quiénes somos</h1>
      <p className="reveal mt-8 font-anton text-[clamp(3rem,12vw,6.5rem)] uppercase leading-[0.9] text-white">
        Aquí no hay <span className="text-bj-yellow">misterio.</span>
      </p>
      <p className="reveal mt-10 max-w-xl text-lg leading-relaxed text-neutral-300">
        Hacemos hamburguesas con carne de res a la plancha, queso derretido en su punto y salsas de la
        casa. Desde el {restaurantInfo.address.area}, para el que quiere comer rico, lleno y sin floro.
      </p>

      <p className="reveal mt-24 font-anton text-4xl uppercase leading-none text-white sm:text-5xl">
        Menos cajas bonitas vacías. <span className="text-neutral-500">Más sabor real.</span>
      </p>

      <ol className="mt-20 space-y-12">
        {PRINCIPLES.map((item, index) => (
          <li key={item.title} className="reveal flex gap-6">
            <span className="font-anton text-5xl leading-none text-bj-yellow">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{item.title}</h2>
              <p className="mt-1 text-neutral-400">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="reveal mt-24 flex flex-wrap items-center gap-6">
        <Link href="/#menu" className="btn-streetwear flex h-14 items-center rounded-full px-10 text-lg">
          Ver la carta
        </Link>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b-2 border-neutral-700 pb-1 font-semibold text-neutral-300 hover:border-white hover:text-white"
        >
          Pedidos para oficina o evento por WhatsApp
        </a>
      </div>
    </article>
  );
}
