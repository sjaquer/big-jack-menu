/** @type {import('next').NextConfig} */
import { legacySlugs } from "./app/data/menuData.js";

// Cabeceras de seguridad básicas (SEC-07). La CSP queda pendiente: el mapa
// de Google y los scripts de Next requieren una política probada aparte.
const securityHeaders = [
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
      destination: to ? `/product/${to}` : "/#acompanamientos",
      permanent: true,
    }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
