// Datos estructurados (schema.org) y FAQ. Todo sale de `menuData.js`:
// si cambia un dato del negocio, el JSON-LD, la FAQ visible y llms.txt cambian solos.
import { categories, categoryInfo, menuItems, restaurantInfo } from "../../data/menuData";
import { formatPrice, getMenuPriceRange, getPriceRange } from "../../lib/format";
import { formatPrepTime, formatScheduleSummary } from "../../lib/schedule";
import { SITE_URL, absoluteUrl, formatAddress, formatPhone, instagramUrl, whatsappUrl } from "../../lib/site";
import { DAY_NAMES, PAYMENT_METHODS } from "./constants";

const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

export function productUrl(item) {
  return absoluteUrl(`/product/${item.slug}`);
}

export function buildOpeningHoursSpecification(hours = restaurantInfo.hours) {
  return Object.entries(hours || {})
    .filter(([, data]) => data?.open && data?.close)
    .map(([day, data]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES[Number(day)],
      opens: data.open,
      closes: data.close,
    }));
}

function buildOffers(item) {
  return (item.options || []).map((option) => ({
    "@type": "Offer",
    name: option.label,
    price: option.price.toFixed(2),
    priceCurrency: "PEN",
    availability:
      item.available === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
  }));
}

export function buildMenuSections(items = menuItems, categoryList = categories) {
  return categoryList
    .map((category) => ({
      "@type": "MenuSection",
      name: categoryInfo[category]?.title || category,
      hasMenuItem: items
        .filter((item) => item.category === category)
        .map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          description: item.description,
          url: productUrl(item),
          image: absoluteUrl(item.image),
          offers: buildOffers(item),
        })),
    }))
    .filter((section) => section.hasMenuItem.length > 0);
}

function buildPostalAddress(address = restaurantInfo.address) {
  return {
    "@type": "PostalAddress",
    streetAddress: address.street,
    addressLocality: address.locality,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressCountry: address.country,
  };
}

export function buildRestaurantSchema() {
  const { min, max } = getMenuPriceRange(menuItems);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: restaurantInfo.name,
        inLanguage: "es-PE",
        publisher: { "@id": RESTAURANT_ID },
      },
      {
        "@type": ["Restaurant", "FastFoodRestaurant"],
        "@id": RESTAURANT_ID,
        name: restaurantInfo.name,
        description: restaurantInfo.description,
        slogan: restaurantInfo.slogan,
        url: SITE_URL,
        image: [
          absoluteUrl("/images/og-bigjack.jpg"),
          ...menuItems.filter((item) => item.popular).map((item) => absoluteUrl(item.image)),
        ],
        logo: absoluteUrl(restaurantInfo.logo),
        address: buildPostalAddress(),
        hasMap: restaurantInfo.contact.googleMapsLink,
        telephone: formatPhone(),
        sameAs: [instagramUrl(), restaurantInfo.contact.tiktok, whatsappUrl()],
        priceRange: `${formatPrice(min)} - ${formatPrice(max)}`,
        currenciesAccepted: "PEN",
        paymentAccepted: PAYMENT_METHODS.map((method) => method.label).join(", "),
        servesCuisine: ["Hamburguesas", "Comida rápida"],
        areaServed: restaurantInfo.address.area,
        openingHoursSpecification: buildOpeningHoursSpecification(),
        acceptsReservations: false,
        hasMenu: {
          "@type": "Menu",
          url: absoluteUrl("/#menu"),
          inLanguage: "es-PE",
          hasMenuSection: buildMenuSections(),
        },
      },
    ],
  };
}

export function buildProductSchema(item) {
  const { min, max } = getPriceRange(item);
  const url = productUrl(item);
  const category = categoryInfo[item.category]?.title || item.category;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: item.name,
        description: item.description,
        image: absoluteUrl(item.image),
        url,
        category,
        brand: { "@type": "Brand", name: restaurantInfo.name },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "PEN",
          lowPrice: min.toFixed(2),
          highPrice: max.toFixed(2),
          offerCount: item.options?.length || 1,
          availability:
            item.available === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          seller: { "@id": RESTAURANT_ID },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Carta", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: category, item: absoluteUrl(`/#${categoryInfo[item.category]?.id || ""}`) },
          { "@type": "ListItem", position: 3, name: item.name, item: url },
        ],
      },
    ],
  };
}

// Preguntas frecuentes: se muestran en la home y se publican como FAQPage.
// Voz del Tío Jack (picante nivel 1): directo, de barrio y sin inventar nada:
// horario, pagos y tiempos salen de menuData.js.
export function getFaqItems() {
  const deliveryMethods = PAYMENT_METHODS.filter((method) => method.delivery).map((method) => method.label);
  const allMethods = PAYMENT_METHODS.map((method) => method.label);
  const list = (items) => `${items.slice(0, -1).join(", ")} o ${items[items.length - 1]}`;

  return [
    {
      question: "¿Dónde queda la caleta?",
      answer: `En ${formatAddress(restaurantInfo.address, { full: true })}. Puedes venir a recoger o pedir delivery. Si te pierdes, el botón «Cómo llegar» no falla.`,
    },
    {
      question: "¿A qué hora atienden?",
      answer: `${formatScheduleSummary()} (hora de Lima). ¿Te agarró el hambre fuera de horario? Deja tu pre-orden y la recoges cuando abramos.`,
    },
    {
      question: "¿Cómo hago mi pedido?",
      answer: `Arma tu pedido en esta carta, confírmalo y te pasamos a WhatsApp con todo el detalle. Si recoges, está listo en ${formatPrepTime()}. También nos encuentras en Rappi.`,
    },
    {
      question: "¿Hacen delivery?",
      answer: "Sí, a zonas cercanas del Centro. El envío lo coordinamos por inDrive y se paga aparte: el total de la web es solo la comida.",
    },
    {
      question: "¿Cómo pago?",
      answer: `Con ${list(allMethods)}. Para delivery: ${list(deliveryMethods)}. El efectivo queda para cuando vienes a recoger.`,
    },
    {
      question: "¿Las hamburguesas son smash?",
      answer: "No. Acá la carne es gruesa y se hace a la plancha, con todo su jugo. La smash es otra película.",
    },
    {
      question: "¿La hamburguesa viene con papas?",
      answer: "Sí, todas salen con su porción de papas fritas amarillas doradas incluidas. No tienes que agregarlas aparte.",
    },
    {
      question: "¿Puedo pedir solo una gaseosa?",
      answer: "Las bebidas van con hamburguesa. Así es la casa.",
    },
    {
      question: "¿Atienden pedidos grandes, para la oficina o un evento?",
      answer: "Claro. Para pedidos grandes escríbenos por WhatsApp y lo coordinamos de frente.",
    },
  ];
}

export function buildFaqSchema(faqItems = getFaqItems()) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
