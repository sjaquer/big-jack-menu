import { menuItems } from "./data/menuData";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bigjack.vercel.app";

  const staticRoutes = [
    "",
    "/quienes",
    "/links",
    "/libro-de-reclamaciones",
    "/reto-gamer",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const productRoutes = menuItems.map((item) => ({
    url: `${baseUrl}/product/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
