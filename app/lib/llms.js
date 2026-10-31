// Contenido de /llms.txt generado desde `menuData.js` (sin datos escritos a mano).
import { categories, categoryInfo, menuItems, restaurantInfo } from "../data/menuData";
import { PAYMENT_METHODS } from "../features/shop/constants";
import { getFaqItems } from "../features/shop/seo";
import { formatPrice } from "./format";
import { formatPrepTime, formatScheduleSummary } from "./schedule";
import { absoluteUrl, formatAddress, formatPhone, instagramUrl, whatsappUrl } from "./site";

function menuLines() {
  return categories.flatMap((category) => {
    const items = menuItems.filter((item) => item.category === category && item.available !== false);
    if (!items.length) return [];
    const info = categoryInfo[category];
    return [
      `### ${info?.title || category}`,
      "",
      ...(info?.subtitle ? [info.subtitle, ""] : []),
      ...items.map((item) => {
        const options = item.options.map((option) => `${option.label}: ${formatPrice(option.price)}`).join("; ");
        return `- [${item.name}](${absoluteUrl(`/product/${item.slug}`)}): ${item.description} ${options}.`;
      }),
      "",
    ];
  });
}

export function buildLlmsTxt() {
  const { name, description, contact, deliveryApps } = restaurantInfo;

  return [
    `# ${name}`,
    "",
    `> ${description}`,
    "",
    "## Datos del local",
    "",
    `- Dirección: ${formatAddress(restaurantInfo.address, { full: true })}, Perú`,
    `- Horario (hora de Lima): ${formatScheduleSummary()}`,
    `- Recojo listo en ${formatPrepTime()}. Delivery en zonas cercanas.`,
    `- Pagos: ${PAYMENT_METHODS.map((method) => method.label).join(", ")}. Delivery solo con ${PAYMENT_METHODS.filter((method) => method.delivery).map((method) => method.label).join(", ")}.`,
    `- WhatsApp: ${formatPhone()} (${whatsappUrl()})`,
    `- Instagram: ${instagramUrl()} · TikTok: ${contact.tiktok}`,
    `- Google Maps: ${contact.googleMapsLink}`,
    `- Apps de delivery: [PedidosYa](${deliveryApps.pedidosYa}), [Rappi](${deliveryApps.rappi})`,
    "",
    "## Carta (precios en soles, referenciales)",
    "",
    ...menuLines(),
    "Las bebidas se venden solo junto con una hamburguesa.",
    "",
    "## Cómo pedir",
    "",
    `- [Carta y pedido online](${absoluteUrl("/")}): se arma el pedido y se confirma por WhatsApp.`,
    `- [Quiénes somos](${absoluteUrl("/quienes")})`,
    `- [Libro de Reclamaciones](${absoluteUrl("/libro-de-reclamaciones")})`,
    "",
    "## Preguntas frecuentes",
    "",
    ...getFaqItems().flatMap((item) => [`- **${item.question}** ${item.answer}`]),
    "",
  ].join("\n");
}
