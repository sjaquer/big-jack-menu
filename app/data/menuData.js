// Fuente única de datos del negocio y de la carta.
// Horario, dirección, contacto y links se leen SOLO desde aquí (ver AGENTS.md, invariante 7).
// Los SKU deben existir en el ERP: no los cambies sin confirmar con el equipo del ERP.

export const restaurantInfo = {
  name: "BIG JACK",
  // 🔒 D2: razón social y RUC pendientes de confirmación del dueño.
  legalName: "Big Jack Perú S.A.C.",
  ruc: "15614908278",
  slogan: "No vendemos humo. Vendemos carne, fuego y barrio.",
  description:
    "Hamburguesas gruesas a la plancha en el Centro de Lima. Carne de res, queso derretido y salsas de la casa. Pide por la web para recojo o delivery.",
  // Horarios por día (0 = domingo … 6 = sábado), hora de Lima.
  // Si `close` es menor que `open`, el turno termina pasada la medianoche.
  hours: {
    0: { open: "19:00", close: "01:00" }, // Domingo
    1: { open: "19:00", close: "01:00" }, // Lunes
    2: { open: "19:00", close: "01:00" }, // Martes
    3: { open: "19:00", close: "01:00" }, // Miércoles
    4: { open: "19:00", close: "01:00" }, // Jueves
    5: { open: "19:00", close: "01:00" }, // Viernes
    6: { open: "19:00", close: "01:00" }, // Sábado
  },
  // Tiempo estimado de preparación para recojo.
  prepTimeMinutes: { min: 15, max: 20 },
  logo: "/images/bigjacktitle.svg",
  // Dirección confirmada en el manual de marca (B5).
  address: {
    street: "Pje. Larrabure 142",
    area: "Centro de Lima",
    locality: "Lima",
    region: "Lima",
    postalCode: "15001",
    country: "PE",
  },
  contact: {
    whatsapp: "51997722704",
    instagram: "@bigjackpe",
    tiktok: "https://www.tiktok.com/@bigjackpe",
    googleMapsLink: "https://maps.app.goo.gl/RFkecMjMDjZhQcxG6",
    googleReviewLink: "https://g.page/r/CRukRtdfadmpEAE/review",
  },
  deliveryApps: {
    pedidosYa:
      "https://www.pedidosya.com.pe/restaurantes/lima/hamburguesas-bigjack-1256afaf-58b6-47bf-8798-54e46d82dc82-menu",
    rappi:
      "https://www.rappi.com.pe/restaurantes/delivery/72151-hamburguesas-big-jack?utm_source=app&utm_medium=deeplink&utm_campaign=share",
  },
};

// Textos de cada categoría para la carta (las claves son los valores de `item.category`).
export const categoryInfo = {
  "LAS INTOCABLES": {
    id: "hamburguesas",
    title: "Las Intocables",
    navLabel: "Hamburguesas",
    subtitle: "Hamburguesas gruesas a la plancha.",
  },
  GUARNICIONES: {
    id: "guarniciones",
    title: "Guarniciones",
    navLabel: "Papas",
    subtitle: "Papas para acompañar o para compartir.",
  },
  BEBIDAS: {
    id: "bebidas",
    title: "Bebidas",
    navLabel: "Bebidas",
    subtitle: "Heladas. Van con tu hamburguesa.",
  },
};

export const categories = [
  "LAS INTOCABLES",
  "GUARNICIONES",
  "BEBIDAS"
];

export const menuItems = [
  {
    id: 1,
    sku: "PRD-LAB-JFSY",
    slug: "la-bacon",
    category: "LAS INTOCABLES",
    name: "La Bacon",
    description: "Pan brillante, medallón grueso de carne, queso derretido, tira de bacon crocante, pepinillos y salsa Big Jack.",
    image: "/images/baconjack.webp",
    popular: true,
    options: [
      { id: "simple", sku: "PRD-LAB-JFSY", label: "Clásica (1 carne) - la de siempre", price: 17.90 },
      { id: "doble", sku: "PRD-LAB-JXVH", label: "Doble (2 carnes) - para llenarse", price: 26.90 }
    ]
  },
  {
    id: 2,
    sku: "PRD-LAR-LUS0",
    slug: "la-royal-con-huevo",
    category: "LAS INTOCABLES",
    name: "La Real con Huevo",
    description: "Medallón de carne a la plancha, queso fundido, jamón inglés sellado y huevo de yema cremosa con nuestra salsa especial.",
    image: "/images/royaljack.webp",
    popular: false,
    options: [
      { id: "simple", sku: "PRD-LAR-LUS0", label: "Clásica (1 carne) - para el antojo", price: 15.90 },
      { id: "doble", sku: "PRD-LAR-N4R4", label: "Doble (2 carnes) - full power", price: 22.90 }
    ]
  },
  {
    id: 4,
    sku: "PRD-ALO-KC88",
    slug: "la-pobre-pero-fina",
    category: "LAS INTOCABLES",
    name: "La Pobre pero Fina",
    description: "Medallón de carne jugosa, cheddar, huevo frito y plátano maduro caramelizado que combina dulce y salado.",
    image: "/images/jackpobre.webp",
    popular: false,
    options: [
      { id: "simple", sku: "PRD-ALO-KC88", label: "Clásica (1 carne) - comfort", price: 16.90 },
      { id: "doble", sku: "PRD-ALO-LA72", label: "Doble (2 carnes) - contundente", price: 24.90 }
    ]
  },
  {
    id: 7,
    sku: "PRD-LAM-IPH3",
    slug: "la-misia",
    category: "LAS INTOCABLES",
    name: "La Misia",
    description: "Hamburguesa clásica con su punto de sabor, sencilla y directa.",
    image: "/images/lamisia.webp",
    popular: false,
    options: [{ id: "simple", sku: "PRD-LAM-IPH3", label: "Clásica (1 carne)", price: 12.90 }]
  },
  {
    id: 20,
    sku: "PRD-PAP-FRIT",
    slug: "papas-fritas",
    category: "GUARNICIONES",
    name: "Papas Fritas Crocantes",
    description: "Papas amarillas crocantes por fuera y suaves por dentro, sazonadas con sal de mar y especias.",
    image: "/images/papas-fritas.webp",
    popular: true,
    options: [
      { id: "personal", sku: "PRD-PAP-PERS", label: "Porción Personal", price: 7.00 },
      { id: "familiar", sku: "PRD-PAP-FAMI", label: "Porción Familiar", price: 12.00 }
    ]
  },
  {
    id: 21,
    sku: "PRD-SAL-CHIP",
    slug: "salchipapa",
    category: "GUARNICIONES",
    name: "Salchipapa Clásica",
    description: "Abundante porción de papas crocantes acompañadas de salchicha frankfurt dorada y cremas de la casa.",
    image: "/images/salchipapa.webp",
    popular: false,
    options: [
      { id: "personal", sku: "PRD-SAL-PERS", label: "Personal", price: 10.00 }
    ]
  },
  {
    id: 30,
    sku: "PRD-INK-PXC0",
    slug: "inka-cola",
    category: "BEBIDAS",
    name: "Inka Cola 600ml",
    description: "Botella helada 600 ml, dulzona y chispeante.",
    image: "/images/inkacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "PRD-INK-PXC0", label: "Botella 600 ml", price: 4.0 }]
  },
  {
    id: 31,
    sku: "PRD-COC-QLER",
    slug: "coca-cola",
    category: "BEBIDAS",
    name: "Coca Cola 600ml",
    description: "Botella helada 600 ml con burbujas intensas.",
    image: "/images/cocacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "PRD-COC-QLER", label: "Botella 600 ml", price: 4.0 }]
  },
  {
    id: 32,
    sku: "PRD-AGU-RC7G",
    slug: "agua-cielo-personal",
    category: "BEBIDAS",
    name: "Agua Cielo Personal",
    description: "Agua embotellada personal.",
    image: "/images/agua-cielo.webp",
    popular: false,
    options: [{ id: "personal", sku: "PRD-AGU-RC7G", label: "Personal", price: 2.0 }]
  }
];

