import BurgerGame from "./BurgerGame";

import { restaurantInfo } from "../data/menuData";

export const metadata = {
  title: "Arma tu burger",
  description: "Un juego corto para la espera: apila carne, queso, tocino y huevo sin que se caiga. Tu récord se guarda en tu celular.",
  alternates: { canonical: "/reto-gamer" },
  openGraph: {
    title: `Arma tu burger | ${restaurantInfo.name}`,
    description: "El minijuego para la espera: apila carne, queso, tocino y huevo sin que se caiga. ¿Cuál es tu récord?",
    url: "/reto-gamer",
    siteName: restaurantInfo.name,
    locale: "es_PE",
    type: "website",
    images: [{ url: "/images/og-bigjack.jpg", width: 1200, height: 630, alt: "BIG JACK - Arma tu burger" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Arma tu burger | ${restaurantInfo.name}`,
    description: "El minijuego para la espera: apila ingredientes sin que se caigan.",
    images: ["/images/og-bigjack.jpg"],
  },
};

export default function RetoGamerPage() {
  return <BurgerGame />;
}
