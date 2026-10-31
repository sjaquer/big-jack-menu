import { restaurantInfo } from "./data/menuData";

export default function manifest() {
  return {
    name: `${restaurantInfo.name} | Hamburguesas en el Centro de Lima`,
    short_name: restaurantInfo.name,
    description: restaurantInfo.description,
    lang: "es-PE",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#0f0f12",
    background_color: "#0f0f12",
    categories: ["food", "shopping"],
    icons: [
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ver la carta", url: "/#menu" },
      { name: "Cómo llegar", url: "/#ubicacion" },
    ],
  };
}
