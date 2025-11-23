// AQUÍ PUEDES EDITAR TODA LA INFORMACIÓN DE TU MENÚ
// Solo cambia los textos entre comillas.

export const restaurantInfo = {
  name: "BIG JACK",
  slogan: "Hamburguesas brutales — Sabor que prende fuego",
  ruc: "15614908278",
  // Horarios por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  // Cada día define { open: "HH:MM", close: "HH:MM" } en horario local
  hours: {
    0: { open: "12:00", close: "23:00" }, // Domingo
    1: { open: "16:00", close: "23:00" }, // Lunes
    2: { open: "16:00", close: "23:00" }, // Martes
    3: { open: "16:00", close: "23:00" }, // Miércoles
    4: { open: "16:00", close: "23:00" }, // Jueves
    5: { open: "12:00", close: "23:00" }, // Viernes
    6: { open: "12:00", close: "23:00" }, // Sábado
  },
  logo: "/images/big-jack-logo.png", // opcional: coloca tu logo en public/images
  contact: {
    whatsapp: "51970513912",
    instagram: "@bigjackpe",
    tiktok: "https://www.tiktok.com/@bigjackpe",
    address: "Jirón Bartolomé Herrera 133, Lince",
    googleMapsLink: "https://maps.app.goo.gl/RFkecMjMDjZhQcxG6"
  }
};

export const categories = [
  "LAS INTOCABLES",
  "GUARNICION",
  "BEBIDAS"
];

export const menuItems = [
  {
    id: 1,
    slug: "bacon-jack",
    category: "LAS INTOCABLES",
    name: "Bacon Jack",
    description: "Carne jugosa, queso cheddar, tiras de tocino crocante y salsa especial.",
    image: "/images/baconjack.webp",
    popular: true,
    options: [
      { id: "simple", label: "Simple (1 carne)", price: 14.0 },
      { id: "doble", label: "Doble (2 carnes)", price: 22.0 }
    ]
  },
  {
    id: 2,
    slug: "royal-jack",
    category: "LAS INTOCABLES",
    name: "Royal Jack",
    description: "Carne jugosa, queso cheddar, jamón inglés y huevo frito en su punto.",
    image: "/images/royaljack.webp",
    popular: false,
    options: [
      { id: "simple", label: "Simple (1 carne)", price: 14.0 },
      { id: "doble", label: "Doble (2 carnes)", price: 22.0 }
    ]
  },
  {
    id: 3,
    slug: "grill-jack",
    category: "LAS INTOCABLES",
    name: "Grill Jack",
    description: "Carne, chorizo parrillero, queso cheddar, chimichurri y un toque de mostaza.",
    image: "/images/grilljack.webp",
    popular: false,
    options: [
      { id: "simple", label: "Simple (1 carne)", price: 20.0 },
      { id: "doble", label: "Doble (2 carnes)", price: 24.0 }
    ]
  },
  {
    id: 4,
    slug: "jack-a-lo-pobre",
    category: "LAS INTOCABLES",
    name: "Jack a lo Pobre",
    description: "Carne, queso cheddar, huevo frito y el toque dulce del plátano maduro.",
    image: "/images/jackpobre.webp",
    popular: false,
    options: [
      { id: "simple", label: "Simple (1 carne)", price: 14.0 },
      { id: "doble", label: "Doble (2 carnes)", price: 22.0 }
    ]
  },
  {
    id: 20,
    slug: "papas-fritas",
    category: "GUARNICION",
    name: "Papas Fritas",
    description: "Papas fritas crujientes.",
    image: "/images/papas-fritas.webp",
    popular: false,
    options: [{ id: "regular", label: "Porción individual", price: 2.0 }]
  },
  {
    id: 30,
    slug: "inka-cola",
    category: "BEBIDAS",
    name: "Inka Cola",
    description: "Refresco frío.",
    image: "/images/inka-cola.webp",
    popular: false,
    options: [{ id: "botella", label: "Botella 500 ml", price: 3.5 }]
  },
  {
    id: 31,
    slug: "coca-cola",
    category: "BEBIDAS",
    name: "Coca Cola",
    description: "Refresco clásico frío.",
    image: "/images/coca-cola.webp",
    popular: false,
    options: [{ id: "botella", label: "Botella 500 ml", price: 3.5 }]
  }
];
