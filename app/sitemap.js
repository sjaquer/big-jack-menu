import { menuItems, restaurantInfo } from "./data/menuData";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bigjack.vercel.app";

  // Páginas estáticas
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/libro-de-reclamaciones`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Páginas de productos dinámicas
  const productPages = menuItems.map((item) => ({
    url: `${baseUrl}/product/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...routes, ...productPages];
}
