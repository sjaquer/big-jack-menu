// URLs y enlaces del sitio derivados de `restaurantInfo`.
// Ningún componente debe armar a mano links de WhatsApp, Instagram o la URL base.
import { restaurantInfo } from "../data/menuData.js";

const FALLBACK_SITE_URL = "https://bigjack.vercel.app";

export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");

// Verificación de Google Search Console (es pública: va en una <meta>).
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || "";

// Funciones que se pueden apagar sin borrar código.
export const FEATURES = {
  // Libro de Reclamaciones desactivado hasta nuevo aviso (vuelve en enero 2027, ver REMEDIATION_PLAN.md).
  complaintsBook: false,
};

// ID de Google Tag Manager (GTM-XXXXXXX). Sin ID no se carga Tag Manager.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

// ID de medición de Google Analytics 4 (G-XXXXXXX).
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-WV556SXB8F";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

export function whatsappUrl(text, phone = restaurantInfo.contact.whatsapp) {
  const digits = String(phone || "").replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function formatPhone(phone = restaurantInfo.contact.whatsapp) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  // 51 + 9 dígitos → +51 997 722 704
  const match = digits.match(/^(51)(\d{3})(\d{3})(\d{3})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : `+${digits}`;
}

export function instagramUrl(handle = restaurantInfo.contact.instagram) {
  return `https://www.instagram.com/${String(handle || "").replace(/^@/, "")}`;
}

export function formatAddress(address = restaurantInfo.address, { full = false } = {}) {
  if (!address) return "";
  if (full) {
    return [address.street, address.area, `${address.locality} ${address.postalCode}`.trim()]
      .filter(Boolean)
      .join(", ");
  }
  return [address.street, address.area].filter(Boolean).join(", ");
}

// Embed de Google Maps por dirección (no requiere API key).
export function mapEmbedUrl(address = restaurantInfo.address) {
  const query = `${restaurantInfo.name}, ${formatAddress(address, { full: true })}, Perú`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
}

export const socialLinks = [
  { id: "instagram", label: "Instagram", href: instagramUrl() },
  { id: "tiktok", label: "TikTok", href: restaurantInfo.contact.tiktok },
  { id: "whatsapp", label: "WhatsApp", href: whatsappUrl() },
];
