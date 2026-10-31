import { ArrowUpRight } from "lucide-react";
import { restaurantInfo } from "../../../data/menuData";
import { formatPrepTime, groupSchedule } from "../../../lib/schedule";

const LINKS = [
  { label: "Cómo llegar", href: restaurantInfo.contact.googleMapsLink, primary: true },
  { label: "Rappi", href: restaurantInfo.deliveryApps.rappi },
];

export default function LocationSection() {
  const { street, area, locality, postalCode } = restaurantInfo.address;

  return (
    <section id="ubicacion" aria-labelledby="ubicacion-title" className="mx-auto max-w-3xl px-5 py-32 sm:py-40">
      <p className="reveal text-sm text-neutral-500">Estamos en el {area}</p>
      <h2 id="ubicacion-title" className="reveal mt-4 font-anton text-[clamp(3rem,13vw,6.5rem)] uppercase leading-[0.9] text-white">
        {street}
      </h2>
      <p className="reveal mt-3 text-neutral-400">
        {locality} {postalCode}
      </p>

      <dl className="reveal mt-12 space-y-2 text-lg">
        {groupSchedule().map((row) => (
          <div key={row.days} className="flex flex-wrap gap-x-3">
            <dt className="text-neutral-500">{row.days}</dt>
            <dd className="font-semibold text-white">{row.hours}</dd>
          </div>
        ))}
        <div className="flex flex-wrap gap-x-3">
          <dt className="text-neutral-500">Recojo</dt>
          <dd className="font-semibold text-white">listo en {formatPrepTime()}</dd>
        </div>
      </dl>

      <ul className="reveal mt-12 flex flex-wrap gap-x-8 gap-y-4">
        {LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 border-b-2 pb-1 text-base font-semibold transition-colors ${
                link.primary
                  ? "border-bj-yellow text-bj-yellow"
                  : "border-neutral-700 text-neutral-300 hover:border-white hover:text-white"
              }`}
            >
              {link.label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
