import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, Gamepad2, MapPin, Star, Users } from "lucide-react";
import { restaurantInfo } from "../data/menuData";
import { formatScheduleSummary } from "../lib/schedule";
import { formatAddress, instagramUrl, whatsappUrl } from "../lib/site";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "../components/icons/BrandIcons";
import OpenStatusBadge from "./OpenStatusBadge";

export const metadata = {
  title: "Enlaces",
  description: `Enlaces oficiales de ${restaurantInfo.name}: carta online, WhatsApp, PedidosYa, Rappi, ubicación en el ${restaurantInfo.address.area} y redes.`,
  alternates: { canonical: "/links" },
};

const DELIVERY_APPS = [
  { name: "PedidosYa", href: restaurantInfo.deliveryApps.pedidosYa, icon: "/images/brands/pedidosya.webp" },
  { name: "Rappi", href: restaurantInfo.deliveryApps.rappi, icon: "/images/brands/rappi.webp" },
];

const SOCIAL = [
  { label: "Instagram", href: instagramUrl(), Icon: InstagramIcon },
  { label: "TikTok", href: restaurantInfo.contact.tiktok, Icon: TikTokIcon },
];

const INFO = [
  { label: "Cómo llegar", detail: formatAddress(), href: restaurantInfo.contact.googleMapsLink, icon: MapPin },
  { label: "Horario", detail: formatScheduleSummary(), icon: Clock },
  { label: "Déjanos tu reseña", detail: "En Google", href: restaurantInfo.contact.googleReviewLink, icon: Star },
  { label: "Arma tu burger", detail: "Un juego para la espera", href: "/reto-gamer", icon: Gamepad2 },
  { label: "Quiénes somos", detail: "La caleta del Centro", href: "/quienes", icon: Users },
];

function SmartLink({ href, className, children, ...props }) {
  if (!href) return <div className={className}>{children}</div>;
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

export default function LinksPage() {
  return (
    <main className="min-h-dvh text-white">
      <div className="mx-auto flex max-w-md flex-col px-5 pb-12 pt-14">
        <header className="flex flex-col items-center text-center">
          <Link href="/" className="relative h-14 w-60" aria-label={`${restaurantInfo.name}, ir a la carta`}>
            <Image src={restaurantInfo.logo} alt="" fill priority sizes="240px" className="object-contain" />
          </Link>
          <p className="mt-4 text-sm text-neutral-400">
            Hamburguesas a la plancha · {restaurantInfo.address.area}
          </p>
          <div className="mt-4">
            <OpenStatusBadge />
          </div>
        </header>

        <Link
          href="/"
          className="btn-streetwear mt-12 flex h-16 items-center justify-between rounded-full pl-8 pr-3 text-xl"
        >
          Ver la carta y pedir
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-bj-yellow">
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </Link>

        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex h-14 items-center justify-center gap-3 rounded-full border border-white/15 font-semibold text-white transition-colors hover:border-whatsapp"
        >
          <WhatsAppIcon size={20} className="text-whatsapp" />
          Pedir por WhatsApp
        </a>

        <section aria-labelledby="links-apps" className="mt-12">
          <h2 id="links-apps" className="mb-4 text-sm font-medium text-neutral-500">
            Pide por app
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {DELIVERY_APPS.map((app) => (
              <li key={app.name}>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-start gap-4 rounded-3xl bg-white/[0.05] p-5 transition-colors hover:bg-white/[0.09]"
                >
                  <Image src={app.icon} alt="" width={48} height={48} className="rounded-2xl" />
                  <span>
                    <span className="block text-lg font-bold text-white">{app.name}</span>
                    <span className="text-xs text-neutral-500">Delivery a tu puerta</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="links-info" className="mt-12">
          <h2 id="links-info" className="sr-only">
            Información
          </h2>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {INFO.map(({ label, detail, href, icon: Icon }) => (
              <li key={label}>
                <SmartLink href={href} className="group flex items-center gap-4 py-4">
                  <Icon size={20} className="shrink-0 text-bj-yellow" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{label}</span>
                    <span className="block truncate text-sm text-neutral-500">{detail}</span>
                  </span>
                  {href && (
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-neutral-600 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                      aria-hidden="true"
                    />
                  )}
                </SmartLink>
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-10 flex justify-center gap-3" aria-label="Redes sociales">
          {SOCIAL.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon size={20} />
              </a>
            </li>
          ))}
        </ul>

        <footer className="mt-12 space-y-2 text-center text-xs text-neutral-600">
          <p>
            {restaurantInfo.legalName} · RUC {restaurantInfo.ruc}
          </p>
          <Link href="/libro-de-reclamaciones" className="font-semibold text-neutral-400 underline underline-offset-4 hover:text-white">
            Libro de Reclamaciones
          </Link>
        </footer>
      </div>
    </main>
  );
}
