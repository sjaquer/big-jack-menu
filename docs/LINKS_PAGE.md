# Página de enlaces (`/links`) — Big Jack

**Última revisión:** 2026-11-02

## Propósito

Página tipo link-in-bio para centralizar los enlaces y CTAs de BIG JACK. Es el destino de la bio de Instagram/TikTok, los QR del local y los mensajes de WhatsApp. Es un **Server Component** con una sola isla cliente (`OpenStatusBadge`) para mostrar el estado abierto/cerrado real.

## Contenido actual

| Sección | Qué muestra |
| :--- | :--- |
| **Cabecera** | Logo, "Hamburguesas a la plancha · Centro de Lima" y estado abierto/cerrado real. |
| **CTA principal** | "Ver la carta y pedir" → `/`. |
| **WhatsApp** | "Pedir por WhatsApp" con el número de `restaurantInfo.contact.whatsapp`. |
| **Pide por app** | Rappi (`restaurantInfo.deliveryApps.rappi`). PedidosYa se retiró el 2026-10-31. |
| **Información** | Cómo llegar (Google Maps), horario, dejar reseña, "Arma tu burger" (`/reto-gamer`) y quiénes somos (`/quienes`). |
| **Redes** | Instagram y TikTok. |
| **Pie** | Razón social (y RUC cuando esté confirmado) y enlace al Libro de Reclamaciones solo si `FEATURES.complaintsBook` está activo. |

## Datos y personalización

Todos los datos salen de `app/data/menuData.js` y `app/lib/site.js`; no se escriben URLs ni teléfonos a mano.

| Qué cambiar | Dónde |
| :--- | :--- |
| WhatsApp, Instagram, TikTok, Maps, reseña, Rappi | `restaurantInfo` en `app/data/menuData.js` |
| Horario | `restaurantInfo.hours` (se formatea con `lib/schedule.js`) |
| Orden o textos de las filas de información | Arreglo `INFO` en `app/links/page.js` |
| Apps de delivery | Arreglo `DELIVERY_APPS` y `restaurantInfo.deliveryApps` |
| Redes | Arreglo `SOCIAL` y `lib/site.js` |

## Metadata y SEO

La página define `title`, `description`, `canonical` y Open Graph propios. No está pensada para competir en búsquedas: su función es convertir tráfico de redes y QR en pedidos.

## Analítica

Los clics salientes (WhatsApp, Rappi, Instagram, TikTok, Maps) se miden con la **medición mejorada** de GA4. No hay eventos personalizados en esta ruta.

## Notas de diseño

- Formato link-in-bio: una columna `max-w-md`, botones grandes y objetivos táctiles ≥ 44 px.
- Sin spinner ni estado de carga: la página es estática y el estado abierto/cerrado se hidrata.
- Sin "Programa de Lealtad", rating fijo ni badge "Premium" (eliminados en la auditoría DATA-05).
- El enlace de reseñas usa `restaurantInfo.contact.googleReviewLink`.
