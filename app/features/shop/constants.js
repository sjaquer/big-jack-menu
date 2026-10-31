// Reglas y listas de la tienda. Los datos del negocio viven en `app/data/menuData.js`.

export const PRIMARY_CATEGORIES = ["LAS INTOCABLES"];
export const COMPLEMENT_CATEGORIES = ["BEBIDAS"];
export const SIDES_CATEGORY = "GUARNICIONES";

export const MAX_QTY_PER_ITEM = 10;
export const MAX_CART_ITEMS = 30;
export const RATE_LIMIT_WINDOW_MS = 900000; // 15 minutos
export const RATE_LIMIT_MAX_REQUESTS = 5;

// Métodos de pago. `delivery: false` = no se acepta en delivery (regla de negocio).
export const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo", delivery: false },
  { id: "yape", label: "Yape", delivery: true },
  { id: "plin", label: "Plin", delivery: true },
  { id: "tarjeta", label: "Tarjeta", delivery: true },
];

// Productos que se ofrecen en el upsell después de agregar una hamburguesa.
export const UPSELL_SLUGS = ["papas-fritas", "inca-kola", "coca-cola"];

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
