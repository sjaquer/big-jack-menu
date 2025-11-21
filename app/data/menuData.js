// AQUÍ PUEDES EDITAR TODA LA INFORMACIÓN DE TU MENÚ
// Solo cambia los textos entre comillas.

export const restaurantInfo = {
  name: "BIG JACK",
  slogan: "Las mejores smash burgers de la ciudad",
  logo: "/images/logo.png", // Ruta a tu logo si tienes uno
  contact: {
    whatsapp: "51970513912", // Tu número para pedidos
    instagram: "@bigjack.pe",
    tiktok: "https://www.tiktok.com/@bigjack.pe",
    address: "Jirón Bartolomé Herrera 133, Lince",
    googleMapsLink: "https://maps.app.goo.gl/RFkecMjMDjZhQcxG6" // Reemplaza con tu link real de Google Maps
  }
};

export const categories = [
  "LAS INTOCABLES",
  "EXTRAS",
  "BEBIDAS"
];

export const menuItems = [
  {
    id: 1,
    category: "LAS INTOCABLES",
    name: "La Big Jack (Clásica)",
    description: "Doble carne smash, doble cheddar fundido, pickles artesanales y nuestra salsa secreta Big Jack.",
    price: 24.90,
    image: "/images/burger-clasica.jpg", 
    popular: true // Poner en true si quieres que salga destacado
  },
  {
    id: 2,
    category: "LAS INTOCABLES",
    name: "Bacon Jack (Doble Carne)",
    description: "Doble carne jugosa, mermelada de tocino ahumado, aros de cebolla crujientes y salsa BBQ.",
    price: 26.90,
    image: "/images/burger-bacon.jpg",
    popular: false
  },
  {
    id: 3,
    category: "LAS INTOCABLES",
    name: "La Bajona (Monstruosa)",
    description: "Triple carne, huevo frito, chorizo parrillero. Una hamburguesa solo para valientes.",
    price: 29.90,
    image: "/images/burger-bajona.jpg",
    popular: false
  },
  {
    id: 4,
    category: "EXTRAS",
    name: "Papas Tumbadas",
    description: "Papas nativas fritas bañadas en cheddar fundido y trocitos de tocino crocante.",
    price: 14.00,
    image: "/images/papas.jpg",
    popular: true
  },
  {
    id: 5,
    category: "BEBIDAS",
    name: "Coca Cola 500ml",
    description: "Helada, perfecta para acompañar.",
    price: 5.00,
    image: "/images/coca.jpg",
    popular: false
  },
  {
    id: 6,
    category: "BEBIDAS",
    name: "Inca Kola 500ml",
    description: "El sabor nuestro.",
    price: 5.00,
    image: "/images/inca.jpg",
    popular: false
  }
];
