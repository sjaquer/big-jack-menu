// AQUÍ PUEDES EDITAR TODA LA INFORMACIÓN DE TU MENÚ
// Solo cambia los textos entre comillas.

export const restaurantInfo = {
  name: "BIG JACK",
  slogan: "No vendemos humo. Vendemos carne, fuego y barrio.",
  ruc: "15614908278",
  // Horarios por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  // Cada día define { open: "HH:MM", close: "HH:MM" } en horario local
  hours: {
    0: { open: "19:00", close: "01:00" }, // Domingo
    1: { open: "19:00", close: "01:00" }, // Lunes
    2: { open: "19:00", close: "01:00" }, // Martes
    3: { open: "19:00", close: "01:00" }, // Miércoles
    4: { open: "19:00", close: "01:00" }, // Jueves
    5: { open: "19:00", close: "01:00" }, // Viernes
    6: { open: "19:00", close: "01:00" }, // Sábado
  },
  logo: "/images/big-jack-logo.png", // opcional: coloca tu logo en public/images
  contact: {
    whatsapp: "51997722704",
    instagram: "@bigjackpe",
    tiktok: "https://www.tiktok.com/@bigjackpe",
    address: "Centro de Lima",
    googleMapsLink: "https://maps.app.goo.gl/RFkecMjMDjZhQcxG6"
  }
};

export const categories = [
  "LAS INTOCABLES",
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

