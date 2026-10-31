import Link from "next/link";
import { ChevronRight, Gamepad2, MapPin, Navigation, UtensilsCrossed, Users } from "lucide-react";
import { restaurantInfo } from "../data/menuData";
import { groupSchedule } from "../lib/schedule";
import { formatAddress, instagramUrl, whatsappUrl } from "../lib/site";
import { GoogleIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "../components/icons/BrandIcons";
import OpenStatusBadge from "./OpenStatusBadge";

export const metadata = {
  title: "Enlaces",
  description: `Enlaces oficiales de ${restaurantInfo.name}: carta online, WhatsApp, ubicación en el ${restaurantInfo.address.area}, PedidosYa, Rappi y redes.`,
  alternates: { canonical: "/links" },
};

const STYLES = {
  primary: "bg-bj-yellow text-black hover:bg-bj-yellow-hover",
  default: "border-neutral-800 bg-bj-surface text-white hover:border-neutral-600",
};

const GROUPS = [
  {
    title: "Pedir",
    links: [
      { title: "Ver la carta", subtitle: "Arma tu pedido online", href: "/", icon: UtensilsCrossed, style: "primary" },
      { title: "WhatsApp", subtitle: "Pide directo", href: whatsappUrl(), icon: WhatsAppIcon, style: "default" },
      { title: "PedidosYa", subtitle: "Delivery por app", href: restaurantInfo.deliveryApps.pedidosYa, style: "default" },
      { title: "Rappi", subtitle: "Delivery por app", href: restaurantInfo.deliveryApps.rappi, style: "default" },
    ],
  },
  {
    title: "Redes",
    links: [
      { title: "Instagram", subtitle: restaurantInfo.contact.instagram, href: instagramUrl(), icon: InstagramIcon, style: "default" },
      { title: "TikTok", subtitle: restaurantInfo.contact.instagram, href: restaurantInfo.contact.tiktok, icon: TikTokIcon, style: "default" },
    ],
  },
  {
    title: "Información",
    links: [
      { title: "Cómo llegar", subtitle: formatAddress(), href: restaurantInfo.contact.googleMapsLink, icon: Navigation, style: "default" },
      { title: "Déjanos tu reseña", subtitle: "En Google", href: restaurantInfo.contact.googleReviewLink, icon: GoogleIcon, style: "default" },
      { title: "Quiénes somos", subtitle: "La caleta del Centro", href: "/quienes", icon: Users, style: "default" },
      { title: "Reto Gamer", subtitle: "Juega Neon Burger Hell", href: "/reto-gamer", icon: Gamepad2, style: "default" },
    ],
  },
];

function LinkButton({ link }) {
  const Icon = link.icon;
  const isExternal = link.href.startsWith("http");
  const className = `group flex min-h-16 w-full items-center gap-3.5 rounded-2xl border-2 border-transparent p-3.5 shadow-md transition-all active:scale-[0.98] ${STYLES[link.style]}`;
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {Icon ? <Icon size={20} /> : <span className="font-black">{link.title[0]}</span>}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-black uppercase tracking-wide">{link.title}</span>
        <span className="block truncate text-xs font-medium opacity-80">{link.subtitle}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </>
  );

  return isExternal ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}

export default function LinksPage() {
  return (
    <main className="min-h-dvh text-white">
      <div className="mx-auto max-w-md space-y-6 px-4 py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="font-anton text-5xl uppercase tracking-wider text-white">
            Big <span className="text-bj-yellow">Jack</span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Hamburguesas a la plancha</p>
          <OpenStatusBadge />
          <p className="flex items-center gap-1.5 text-xs text-neutral-400">
            <MapPin size={13} className="text-bj-yellow" aria-hidden="true" />
            {formatAddress()}
          </p>
        </header>

        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={`links-${group.title}`} className="space-y-2">
            <h2 id={`links-${group.title}`} className="px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.title}>
                  <LinkButton link={link} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="links-horario" className="space-y-2 rounded-2xl border-2 border-neutral-800 bg-bj-surface p-4">
          <h2 id="links-horario" className="font-anton text-lg uppercase tracking-wide">Horario</h2>
          <dl className="space-y-1 text-sm">
            {groupSchedule().map((row) => (
              <div key={row.days} className="flex justify-between gap-3">
                <dt className="text-neutral-400">{row.days}</dt>
                <dd className="font-bold text-white">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="space-y-1 border-t border-neutral-800 pt-4 text-center text-[11px] text-neutral-500">
          <p>
            {restaurantInfo.legalName} · RUC {restaurantInfo.ruc}
          </p>
          <Link href="/libro-de-reclamaciones" className="font-bold text-neutral-300 hover:text-bj-yellow">
            Libro de Reclamaciones
          </Link>
        </footer>
      </div>
    </main>
  );
}
