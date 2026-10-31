import { restaurantInfo } from "../../data/menuData";
import ComplaintForm from "./ComplaintForm";

export const metadata = {
  title: "Libro de Reclamaciones",
  description: `Libro de Reclamaciones virtual de ${restaurantInfo.name} (${restaurantInfo.legalName}, RUC ${restaurantInfo.ruc}), conforme al Código de Protección y Defensa del Consumidor.`,
  alternates: { canonical: "/libro-de-reclamaciones" },
};

export default function LibroDeReclamacionesPage() {
  return <ComplaintForm />;
}
