/** @type {import('next').NextConfig} */
import { legacySlugs } from "./app/data/menuData.js";

// Política de seguridad de contenido (SEC-07). Si se agrega en GTM una etiqueta de otro
// proveedor (p. ej. Meta Pixel o TikTok), sumar aquí sus dominios o la etiqueta no cargará.
const isDev = process.env.NODE_ENV !== "production";
const GOOGLE_TAGS = [
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];
// Cloudflare Turnstile (anti-bots del checkout).
const TURNSTILE = "https://challenges.cloudflare.com";
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inserta scripts en línea al hidratar; en desarrollo además usa eval.
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}${GOOGLE_TAGS.join(" ")} ${TURNSTILE}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GOOGLE_TAGS.join(" ")}`,
  "font-src 'self'",
  `connect-src 'self' ${GOOGLE_TAGS.join(" ")} ${TURNSTILE}${isDev ? " ws:" : ""}`,
  `frame-src https://www.googletagmanager.com ${TURNSTILE}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    unoptimized: process.env.NODE_ENV === "development",
  },
  // URLs antiguas de productos (nombres anteriores o retirados) → ficha actual o carta.
  async redirects() {
    return Object.entries(legacySlugs).map(([from, to]) => ({
      source: `/product/${from}`,
      destination: to ? `/product/${to}` : "/#menu",
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
