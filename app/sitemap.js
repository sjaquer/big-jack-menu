import { menuItems } from "./data/menuData";
import { FEATURES, absoluteUrl } from "./lib/site";

// Fecha de la última publicación del sitio (se fija al compilar).
const lastModified = new Date();

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/quienes", priority: 0.6, changeFrequency: "monthly" },
  { path: "/links", priority: 0.5, changeFrequency: "monthly" },
  ...(FEATURES.complaintsBook ? [{ path: "/libro-de-reclamaciones", priority: 0.3, changeFrequency: "yearly" }] : []),
  { path: "/reto-gamer", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap() {
  const pages = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.path === "/" ? { images: [absoluteUrl("/images/og-bigjack.jpg")] } : {}),
  }));

  const products = menuItems
    .filter((item) => item.available !== false)
    .map((item) => ({
      url: absoluteUrl(`/product/${item.slug}`),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      images: [absoluteUrl(item.image)],
    }));

  return [...pages, ...products];
}
