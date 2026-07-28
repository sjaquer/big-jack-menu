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
    "@type": ["Restaurant", "FastFoodRestaurant"],
    "@id": siteUrl,
    name: restaurantInfo.name,
    description: "Hamburguesas artesanales gruesas en Centro de Lima. Carne 100% de res, pan suave artesanal y salsas caseras. Pide online con delivery rápido o recojo al toque.",
    image: [
      `${siteUrl}/images/og-bigjack.png`,
      `${siteUrl}/images/baconjack.webp`,
      `${siteUrl}/images/royaljack.webp`,
      `${siteUrl}/images/grilljack.webp`
    ],
    logo: `${siteUrl}/images/bigjacktitle.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jr. Bartolomé Herrera 133",
      addressLocality: "Lince",
      addressRegion: "Lima",
      addressCountry: "PE",
      postalCode: "15046",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-12.081387",
      longitude: "-77.038263",
    },
    hasMap: restaurantInfo.contact.googleMapsLink,
    telephone: `+${restaurantInfo.contact.whatsapp}`,
    url: siteUrl,
    sameAs: [
      `https://instagram.com/${restaurantInfo.contact.instagram.replace("@", "")}`,
      restaurantInfo.contact.tiktok,
      `https://wa.me/${restaurantInfo.contact.whatsapp}`,
      restaurantInfo.contact.googleMapsLink,
    ],
    priceRange: computedPriceRange,
    servesCuisine: ["Hamburguesas Artesanales", "Fast Food", "Comida Rápida Peruana"],
    areaServed,
    openingHoursSpecification,
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: menuSections,
    },
    paymentAccepted: ["Efectivo", "Yape", "Plin", "Tarjeta"],
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
        name: "¿Dónde comer buenas hamburguesas en Centro de Lima y Lince?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Big Jack sirve hamburguesas artesanales y gruesas con carne 100% de res, queso derretido y salsas de la casa en Centro de Lima. Puedes pedir por WhatsApp o recoger en tienda.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hacen smash burger o hamburguesas gruesas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En Big Jack preparamos hamburguesas gruesas y jugosas (no smash), con buena carne a la plancha, insumos frescos y papas crujientes.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cómo pedir delivery o recojo en tienda?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Puedes pedir directamente a través de nuestro menú web o WhatsApp con delivery cercano y recojo listo en 15 a 20 minutos.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué medios de pago aceptan en Big Jack?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aceptamos Yape, Plin, tarjetas de crédito/débito y efectivo.",
        },
      },
    ],
  };
}
