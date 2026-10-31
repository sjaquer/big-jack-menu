import Link from "next/link";
import { restaurantInfo } from "../data/menuData";
import { formatPhone, instagramUrl, whatsappUrl } from "../lib/site";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "./icons/BrandIcons";

const SOCIAL = [
  { label: "WhatsApp", href: whatsappUrl(), Icon: WhatsAppIcon },
  { label: "Instagram", href: instagramUrl(), Icon: InstagramIcon },
  { label: "TikTok", href: restaurantInfo.contact.tiktok, Icon: TikTokIcon },
];

const LINKS = [
  { href: "/quienes", label: "Quiénes somos" },
  { href: "/links", label: "Enlaces" },
  { href: "/reto-gamer", label: "Reto Gamer" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-neutral-800">
      <div className="mx-auto max-w-3xl space-y-10 px-5 pb-32 pt-16 lg:pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-xs font-anton text-3xl uppercase leading-none text-white">{restaurantInfo.slogan}</p>
          <ul className="flex gap-2">
            {SOCIAL.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-bj-yellow"
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-400">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/libro-de-reclamaciones" className="font-semibold text-white underline underline-offset-4 hover:text-bj-yellow">
                Libro de Reclamaciones
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-xs leading-relaxed text-neutral-600">
          © {new Date().getFullYear()} {restaurantInfo.legalName} · RUC {restaurantInfo.ruc} · WhatsApp {formatPhone()}
        </p>
      </div>
    </footer>
  );
}
