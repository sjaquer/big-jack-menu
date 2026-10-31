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

// Textos de cada categoría para la carta (las claves son los valores de `item.category`,
// que funcionan como identificadores internos: no cambiarlas).
export const categoryInfo = {
  "LAS INTOCABLES": {
    id: "hamburguesas",
    title: "Hamburguesas",
    navLabel: "Hamburguesas",
    subtitle: "Medallón grueso de carne a la plancha. Simple o doble.",
  },
  GUARNICIONES: {
    id: "acompanamientos",
    title: "Acompañamientos",
    navLabel: "Papas",
    subtitle: "Para acompañar o para compartir.",
  },
  BEBIDAS: {
    id: "bebidas",
    title: "Bebidas",
    navLabel: "Bebidas",
    subtitle: "Heladas. Van con tu hamburguesa.",
  },
};

export const categories = ["LAS INTOCABLES", "GUARNICIONES", "BEBIDAS"];

// Los SKU deben existir en el ERP. Cambiar `name` o `description` no afecta al ERP;
// cambiar `slug` exige agregar una redirección en next.config.mjs.
export const menuItems = [
  {
    id: 1,
    sku: "PRD-LAB-JFSY",
    slug: "hamburguesa-con-tocino",
    category: "LAS INTOCABLES",
    name: "Hamburguesa con Tocino",
    description: "Medallón grueso de carne, queso derretido, tocino crocante, pepinillos y salsa de la casa.",
    image: "/images/baconjack.webp",
    popular: true,
    options: [
      { id: "simple", sku: "PRD-LAB-JFSY", label: "Simple (1 carne)", price: 17.90 },
      { id: "doble", sku: "PRD-LAB-JXVH", label: "Doble (2 carnes)", price: 26.90 },
    ],
  },
  {
    id: 2,
    sku: "PRD-LAR-LUS0",
    slug: "hamburguesa-royal",
    category: "LAS INTOCABLES",
    name: "Hamburguesa Royal",
    description: "Medallón de carne, queso fundido, jamón y huevo frito con la yema cremosa.",
    image: "/images/royaljack.webp",
    popular: false,
    options: [
      { id: "simple", sku: "PRD-LAR-LUS0", label: "Simple (1 carne)", price: 15.90 },
      { id: "doble", sku: "PRD-LAR-N4R4", label: "Doble (2 carnes)", price: 22.90 },
    ],
  },
  {
    id: 4,
    sku: "PRD-ALO-KC88",
    slug: "hamburguesa-a-lo-pobre",
    category: "LAS INTOCABLES",
    name: "Hamburguesa a lo Pobre",
    description: "Medallón de carne, queso cheddar, huevo frito y plátano maduro. Dulce y salado a la vez.",
    image: "/images/jackpobre.webp",
    popular: false,
    options: [
      { id: "simple", sku: "PRD-ALO-KC88", label: "Simple (1 carne)", price: 16.90 },
      { id: "doble", sku: "PRD-ALO-LA72", label: "Doble (2 carnes)", price: 24.90 },
    ],
  },
  {
    id: 7,
    sku: "PRD-LAM-IPH3",
    slug: "hamburguesa-clasica",
    category: "LAS INTOCABLES",
    name: "Hamburguesa Clásica",
    description: "Medallón de carne a la plancha en pan suave. La de siempre, sin vueltas.",
    image: "/images/lamisia.webp",
    popular: false,
    options: [{ id: "simple", sku: "PRD-LAM-IPH3", label: "Simple (1 carne)", price: 12.90 }],
  },
  {
    id: 20,
    sku: "PRD-PAP-FRIT",
    slug: "papas-fritas",
    category: "GUARNICIONES",
    name: "Papas Fritas",
    description: "Papas amarillas crocantes por fuera y suaves por dentro, con sal y especias.",
    image: "/images/papas-fritas.webp",
    popular: true,
    options: [
      { id: "personal", sku: "PRD-PAP-PERS", label: "Personal", price: 7.00 },
      { id: "familiar", sku: "PRD-PAP-FAMI", label: "Familiar", price: 12.00 },
    ],
  },
  {
    id: 30,
    sku: "PRD-INK-PXC0",
    slug: "inca-kola",
    category: "BEBIDAS",
    name: "Inca Kola",
    description: "Botella de 600 ml, bien helada.",
    image: "/images/inkacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "PRD-INK-PXC0", label: "Botella 600 ml", price: 4.0 }],
  },
  {
    id: 31,
    sku: "PRD-COC-QLER",
    slug: "coca-cola",
    category: "BEBIDAS",
    name: "Coca-Cola",
    description: "Botella de 600 ml, bien helada.",
    image: "/images/cocacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "PRD-COC-QLER", label: "Botella 600 ml", price: 4.0 }],
  },
  {
    id: 32,
    sku: "PRD-AGU-RC7G",
    slug: "agua-cielo",
    category: "BEBIDAS",
    name: "Agua Cielo",
    description: "Agua de mesa en botella personal.",
    image: "/images/agua-cielo.webp",
    popular: false,
    options: [{ id: "personal", sku: "PRD-AGU-RC7G", label: "Personal", price: 2.0 }],
  },
];

// Slugs anteriores → nuevos (redirecciones 308 en next.config.mjs).
export const legacySlugs = {
  salchipapa: null, // retirada de la carta: redirige a la sección de acompañamientos
  "la-misia": "hamburguesa-clasica",
  "la-bacon": "hamburguesa-con-tocino",
  "la-royal-con-huevo": "hamburguesa-royal",
  "la-pobre-pero-fina": "hamburguesa-a-lo-pobre",
  "inka-cola": "inca-kola",
  "agua-cielo-personal": "agua-cielo",
};
