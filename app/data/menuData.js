// AQUÍ PUEDES EDITAR TODA LA INFORMACIÓN DE TU MENÚ
// Solo cambia los textos entre comillas.

export const restaurantInfo = {
  name: "BIG JACK",
  slogan: "No vendemos humo. Vendemos carne, fuego y barrio.",
  ruc: "15614908278",
  // Horarios por día (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  // Cada día define { open: "HH:MM", close: "HH:MM" } en horario local
  hours: {
    0: { open: "17:00", close: "01:00" }, // Domingo
    1: { open: "16:30", close: "23:00" }, // Lunes
    2: { open: "16:30", close: "23:00" }, // Martes
    3: { open: "16:30", close: "23:00" }, // Miércoles
    4: { open: "16:30", close: "23:00" }, // Jueves
    5: { open: "17:00", close: "01:00" }, // Viernes
    6: { open: "17:00", close: "01:00" }, // Sábado
  },
  logo: "/images/big-jack-logo.png", // opcional: coloca tu logo en public/images
  contact: {
    whatsapp: "51970513912",
    instagram: "@bigjackpe",
    tiktok: "https://www.tiktok.com/@bigjackpe",
    address: "Centro de Lima",
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
    sku: "PRD-BIG-A0R4",
    slug: "bacon-jack",
    category: "LAS INTOCABLES",
    name: "Bacon Jack",
    description: "Pan brillante, medallón grueso de carne, queso derretido, tira de bacon crocante, pepinillos y salsa Big Jack.",
    image: "/images/baconjack.webp",
    popular: true,
    options: [
      { id: "simple", sku: "PRD-BIG-A0R4", label: "Clásica (1 carne) - la de siempre", price: 14.0 },
      { id: "doble", sku: "PRD-BIG-BE7B", label: "Doble (2 carnes) - para llenarse", price: 22.0 }
    ]
  },
  {
    id: 2,
    sku: "BURG-003",
    slug: "royal-jack",
    category: "LAS INTOCABLES",
    name: "La Real con Huevo",
    description: "Medallón de carne a la plancha, queso fundido, jamón inglés sellado y huevo de yema cremosa con nuestra salsa especial.",
    image: "/images/royaljack.webp",
    popular: false,
    options: [
      { id: "simple", sku: "BURG-003", label: "Clásica (1 carne) - para el antojo", price: 14.0 },
      { id: "doble", sku: "BURG-004", label: "Doble (2 carnes) - full power", price: 22.0 }
    ]
  },
  {
    id: 3,
    sku: "BURG-005",
    slug: "grill-jack",
    category: "LAS INTOCABLES",
    name: "La Parrillera",
    description: "Burger gruesa con chorizo parrillero, cheddar, chimichurri casero y crema especial Big Jack.",
    image: "/images/grilljack.webp",
    popular: false,
    options: [
      { id: "simple", sku: "BURG-005", label: "Clásica (1 carne) - intensa", price: 16.0 },
      { id: "doble", sku: "BURG-006", label: "Doble (2 carnes) - bestial", price: 24.0 }
    ]
  },
  {
    id: 4,
    sku: "BURG-007",
    slug: "jack-a-lo-pobre",
    category: "LAS INTOCABLES",
    name: "La Pobre pero Fina",
    description: "Medallón de carne jugosa, cheddar, huevo frito y plátano maduro caramelizado que combina dulce y salado.",
    image: "/images/jackpobre.webp",
    popular: false,
    options: [
      { id: "simple", sku: "BURG-007", label: "Clásica (1 carne) - comfort", price: 14.0 },
      { id: "doble", sku: "BURG-008", label: "Doble (2 carnes) - contundente", price: 22.0 }
    ]
  },
  {
    id: 5,
    sku: "SNACK-001",
    slug: "choripan",
    category: "LAS INTOCABLES",
    name: "Choripan",
    description: "Chorizo parrillero jugoso en pan con chimichurri casero, cebolla caramelizada y un toque de mostaza.",
    image: "/images/choripan.webp",
    popular: false,
    options: [{ id: "simple", sku: "SNACK-001", label: "Clásico - sabor auténtico", price: 6.50 }]
  },
  {
    id: 6,
    sku: "SNACK-002",
    slug: "salchipapa",
    category: "LAS INTOCABLES",
    name: "Salchipapa",
    description: "Papas fritas doradas con salchicha cortada, bañadas en salsas de la casa. La opción 'Especial' incluye chorizo, queso y huevo.",
    image: "/images/salchipapa.webp",
    popular: false,
    options: [
      { id: "clasica", sku: "SNACK-002", label: "Clásica - con salchicha", price: 10.0 },
      { id: "chorizo", sku: "SNACK-003", label: "Con Chorizo - más intenso", price: 12.0 },
      { id: "especial", sku: "SNACK-004", label: "Especial - chorizo, queso y huevo", price: 14.0 }
    ]
  },
  {
    id: 20,
    sku: "SIDE-001",
    slug: "papas-fritas",
    category: "GUARNICION",
    name: "Papas Fritas",
    description: "Corte rápidos, fritas al momento y terminadas con sal al punto.",
    image: "/images/papas-fritas.webp",
    popular: false,
    options: [{ id: "regular", sku: "SIDE-001", label: "Porción personal - para picar", price: 2.0 }]
  },
  {
    id: 30,
    sku: "DRINK-001",
    slug: "inka-cola",
    category: "BEBIDAS",
    name: "Inka Cola",
    description: "Botella helada de 500 ml, dulzona y chispeante.",
    image: "/images/inkacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "DRINK-001", label: "Botella helada 500 ml", price: 3.5 }]
  },
  {
    id: 31,
    sku: "DRINK-002",
    slug: "coca-cola",
    category: "BEBIDAS",
    name: "Coca Cola",
    description: "Clásica cola helada de 500 ml con burbujas intensas.",
    image: "/images/cocacola.webp",
    popular: false,
    options: [{ id: "botella", sku: "DRINK-002", label: "Botella helada 500 ml", price: 3.5 }]
  }
];
