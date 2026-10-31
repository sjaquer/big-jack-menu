# Cambios

## Rediseño "menos es más", refactor de la tienda y SEO/IA

Fecha: 2026-10-31

### UX / UI

1. Carta vertical en una sola columna: hamburguesas en grande y complementos en filas compactas; navegación por secciones que resalta dónde estás.
2. Hero animado con el scroll: el titular se desvanece y la hamburguesa aparece a pantalla completa y crece; versión estática con `prefers-reduced-motion`.
3. Header mínimo, sin pastillas ni etiquetas; aviso de cerrado de una línea (ya no bloquea la pantalla).
4. El carrito funciona igual en la carta y en la ficha de producto (no redirige a `/?openCart=true`).
5. Hoja de producto, sugerencia de papas/bebida (una vez por visita) y confirmación en diálogos accesibles.

### Código

1. Grupo de rutas `app/(shop)` con `ShopProvider`; `HomeClient` (711 líneas) reemplazado por hooks pequeños.
2. `features/home` → `features/shop`.
3. Datos del negocio centralizados en `restaurantInfo` + `lib/site.js`, `lib/schedule.js`, `lib/format.js` (con tests).
4. Tokens de color en `@theme`.

### SEO / IA / rendimiento

1. `/llms.txt`, robots para asistentes de IA, sitemap con imágenes, `manifest.js`, 404 de marca.
2. JSON-LD `WebSite`, `Restaurant` (dirección corregida), `Product`, `BreadcrumbList` y `FAQPage` igual a la FAQ visible.
3. Imágenes: hero 862 KB → 99 KB, OG 275 KB → 101 KB.
4. Cabeceras de seguridad.


## Migracion a webhook de pedidos

Fecha: 2026-04-19

### Cambios aplicados

1. Se reemplazo el envio al endpoint antiguo del ERP por el webhook unico `/api/webhooks/orders`.
2. El proxy interno `POST /api/online-orders` ahora reenvia al webhook y usa `x-webhook-secret` solo si existe `WEBHOOK_MENU_SECRET`.
3. El payload de checkout se migro a estructura webhook:
   - `eventId` (idempotencia)
   - `customer` anidado (`name`, `phone` opcional)
   - `items` solo con `sku`, `quantity` y `notes` opcional
4. Se actualizaron variables de entorno para webhook.
5. Se agrego documentacion tecnica en `webhook-pedidos.md`.

### Impacto esperado

- Evita dependencias del endpoint antiguo eliminado.
- Mantiene la validacion de SKU en frontend.
- Reduce riesgo de inconsistencias de precio, ya que ERP calcula por `salePrice`.
