import { restaurantInfo } from "../../data/menuData";
import { FEATURES, formatPhone, whatsappUrl } from "../../lib/site";
import ComplaintForm from "./ComplaintForm";

const legalId = [restaurantInfo.legalName, restaurantInfo.ruc && `RUC ${restaurantInfo.ruc}`].filter(Boolean).join(", ");

export const metadata = {
  title: "Libro de Reclamaciones",
  description: `Libro de Reclamaciones virtual de ${restaurantInfo.name} (${legalId}), conforme al Código de Protección y Defensa del Consumidor.`,
  alternates: { canonical: "/libro-de-reclamaciones" },
  // Mientras esté desactivado no se indexa.
  ...(FEATURES.complaintsBook ? {} : { robots: { index: false, follow: true } }),
};

// Aviso mientras el libro virtual está desactivado (FEATURES.complaintsBook).
function UnavailableNotice() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24">
      <h1 className="font-anton text-5xl uppercase leading-none text-white">Libro de Reclamaciones</h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-300">
        El Libro de Reclamaciones virtual no está disponible por ahora.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-400">
        Si tienes un reclamo o una queja, escríbenos por WhatsApp al{" "}
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold text-bj-yellow underline underline-offset-4">
          {formatPhone()}
        </a>{" "}
        y te atendemos.
      </p>
    </section>
  );
}

export default function LibroDeReclamacionesPage() {
  return FEATURES.complaintsBook ? <ComplaintForm /> : <UnavailableNotice />;
}
