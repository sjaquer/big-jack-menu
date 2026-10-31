import BurgerGame from "./BurgerGame";

export const metadata = {
  title: "Arma tu burger",
  description: "Un juego corto para la espera: apila carne, queso, tocino y huevo sin que se caiga. Tu récord se guarda en tu celular.",
  alternates: { canonical: "/reto-gamer" },
};

export default function RetoGamerPage() {
  return <BurgerGame />;
}
