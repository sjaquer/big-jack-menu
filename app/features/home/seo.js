import { DAY_NAMES } from "./constants";

export function getHeroPriceRange(menuItems) {
  const heroHighlight = menuItems[0];
  const raw = heroHighlight?.options?.length
    ? heroHighlight.options.reduce(
        (acc, opt) => [Math.min(acc[0], opt.price), Math.max(acc[1], opt.price)],
        [Infinity, -Infinity]
      )
    : [0, 0];

  return [
    raw[0] === Infinity ? 0 : raw[0],
    raw[1] === -Infinity ? raw[0] || 0 : raw[1],
  ];
}

export function getComputedPriceRange(menuItems) {
  const values = menuItems.flatMap((item) => {
    if (item.options?.length) return item.options.map((opt) => opt.price);
    if (item.price) return [item.price];
    return [];
  });

  if (!values.length) return "S/ 0";
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `S/ ${min.toFixed(2)} - S/ ${max.toFixed(2)}`;
}

export function buildOpeningHoursSpecification(hours) {
  return Object.entries(hours || {}).map(([day, data]) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: DAY_NAMES[Number(day)] || "Monday",
    opens: data.open,
    closes: data.close,
  }));
}

export function buildMenuSections(menuItems, categories) {
  return categories
    .map((cat) => ({
      "@type": "MenuSection",
      name: cat,
      hasMenuItem: menuItems
        .filter((item) => item.category === cat)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          image: item.image,
          offers: (item.options || []).map((opt) => ({
            "@type": "Offer",
            name: opt.label,
            price: opt.price,
            priceCurrency: "PEN",
            availability: "https://schema.org/InStock",
          })),
        })),
    }))
    .filter((section) => section.hasMenuItem.length > 0);
}

export function buildRestaurantSchema({
  restaurantInfo,
  siteUrl,
  marketingDescription,
  computedPriceRange,
  openingHoursSpecification,
  menuSections,
  areaServed,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": siteUrl,
    name: restaurantInfo.name,
    description: marketingDescription,
    image: ["/images/baconjack.webp", "/images/royaljack.webp", "/images/grilljack.webp"],
    logo: restaurantInfo.logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Centro de Lima",
      addressLocality: "Centro de Lima",
      addressRegion: "Lima",
      addressCountry: "PE",
      postalCode: "15046",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-12.081387",
      longitude: "-77.038263",
    },
    telephone: `+${restaurantInfo.contact.whatsapp}`,
    url: siteUrl,
    sameAs: [
      `https://instagram.com/${restaurantInfo.contact.instagram.replace("@", "")}`,
      restaurantInfo.contact.tiktok,
      `https://wa.me/${restaurantInfo.contact.whatsapp}`,
      restaurantInfo.contact.googleMapsLink,
    ],
    priceRange: computedPriceRange,
    servesCuisine: ["Hamburguesas", "Fast Food", "Comida peruana casual"],
    areaServed,
    openingHoursSpecification,
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: menuSections,
    },
    paymentAccepted: ["Efectivo", "Yape", "Plin"],
    acceptsReservations: false,
    delivery: true,
    takeaway: true,
  };
}

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Hacen smash burger?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No hacemos smash. Usamos medallones gruesos estilo fast food de barrio con salsas propias.",
        },
      },
      {
        "@type": "Question",
        name: "¿Tienen delivery en Centro de Lima?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Delivery rápido en zonas cercanas a Centro de Lima y recojo en tienda en 15-20 minutos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué medios de pago aceptan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aceptamos efectivo, Yape y Plin para pedidos directos.",
        },
      },
    ],
  };
}
