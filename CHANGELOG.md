# Cambios

## Voz de marca, previsualizaciones y pulido para producción

Fecha: 2026-10-31

1. Preguntas frecuentes reescritas con la voz del Tío Jack (8 preguntas, datos desde `menuData.js`); se publican igual como FAQPage.
2. Textos de la web con la voz de la marca: errores ("Algo falló de nuestro lado, no del tuyo"), confirmación ("…y entra a la plancha"), subtítulos de la carta, ubicación, avisos del carrito y mensaje de WhatsApp.
3. Previsualización por producto: `public/images/og/<slug>.jpg` (1200×630, ~40–75 KB) con foto, nombre, precio y logo; se regeneran antes de cada build (`prebuild` → `npm run og`).
4. Páginas de error con la marca (`app/error.js`, `app/global-error.js`).
5. Íconos: se quitó la declaración duplicada; Next usa `favicon.ico`, `icon.svg` y `apple-icon.png` (180 px); `public/apple-touch-icon.png` también sale de `npm run brand`.
6. Kit de redes exportado a su tamaño real (antes salían a ~4× y pesaban mucho).
7. `opentype.js` se mantiene en 1.3.4: la 2.0 genera trazos inválidos en textos completos (rompía portadas y OG).

## Cloudflare Turnstile en el checkout

Fecha: 2026-10-31

1. Widget invisible (solo pide interacción si Cloudflare duda) que se carga en el paso "Entrega y pago"; el token viaja en la cabecera `x-turnstile-token`, sin cambiar el contrato con el ERP.
2. `/api/online-orders` valida el token con Cloudflare antes de enviar el pedido al ERP (de un solo uso, acción `checkout`, dominio); falla cerrado si Cloudflare no responde.
3. Contra pedidos masivos: además de 5 por IP cada 15 min, un pedido cada 20 s; los intentos que fallan en el ERP no cuentan.
4. CSP ampliada para `challenges.cloudflare.com`. Variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` (solo Vercel).

## Dependencias y seguridad

Fecha: 2026-10-31

1. Dependencias: React 19.3.1, Tailwind 4.3.3, nodemailer 10.3.1, lucide-react 1.66, ESLint 9.39.5, opentype.js 2.0 (scripts de marca adaptados a `opentype.parse`). Producción sin vulnerabilidades.
2. `/api/online-orders`: solo mismo origen, JSON, ≤ 16 KB; reglas de negocio y horario en el servidor (`lib/orderRules.js`, `lib/catalog.js`); pedido al ERP reconstruido con lista blanca (mismo contrato); respuesta normalizada sin filtrar datos del ERP.
3. Content-Security-Policy y Cross-Origin-Opener-Policy (compatibles con Google Tag Manager).
4. `eventId` con aleatoriedad criptográfica.
5. Analytics: evitado el doble conteo de eventos cuando se usa GTM.

## Horario, OG, RUC, PedidosYa y Libro de Reclamaciones

Fecha: 2026-10-31

1. Horario: lunes a sábado de 7:00 p. m. a 12:00 a. m.; domingo cerrado. El estado abierto/cerrado, el footer, `/links`, la FAQ, el JSON-LD y `llms.txt` se actualizan solos.
2. Imagen OG regenerada desde los datos: "Desde S/ 12.90", horario actual y dominio `bigjack.vercel.app` (`npm run og`).
3. RUC oculto en todo el sitio (`restaurantInfo.ruc = null`) hasta enero 2027.
4. PedidosYa retirado (carta, checkout, `/links`, FAQ, `llms.txt`).
5. Libro de Reclamaciones desactivado con `FEATURES.complaintsBook = false`: la ruta muestra un aviso con WhatsApp, sale del footer, `/links`, sitemap y `llms.txt`, y la Server Action no acepta reclamos. Reactivación en el plan de enero 2027.

## Logo v3: wordmark chorreante y sello "Central de Potencia"

Fecha: 2026-10-31

1. Nuevo wordmark BIG JACK con letras gordas y redondeadas, rebote de rótulo y queso que chorrea; versiones horizontal y apilada en amarillo, negro, blanco y rojo.
2. Isotipo: sello "Central de Potencia" (completo, simple y a una tinta) y monograma "B" para favicon.
3. Íconos del sitio regenerados (favicon.ico 16/32/48, icon.svg, apple-icon, manifest 192/512) y OG con el logo nuevo.
4. Piezas para redes: avatar, perfil de WhatsApp, portada de Facebook, cabecera de X y fondo de historia.
5. Todo se genera con `npm run brand` (`scripts/brand/`); fuente base Titan One (OFL) en `scripts/fonts/`.

## Google Search Console, Analytics, página de links y nuevo minijuego

Fecha: 2026-10-31

1. Meta `google-site-verification` de `bigjack.vercel.app` (en `lib/site.js`).
2. Google Analytics 4 con `@next/third-parties`; se activa con `NEXT_PUBLIC_GA_ID`. Eventos de e-commerce GA4 y del juego en `lib/analytics.js`.
3. `/links` con nueva jerarquía: CTA "Ver la carta y pedir", WhatsApp, "Pide por app" con los íconos oficiales de PedidosYa y Rappi, información en filas, redes y legal.
4. `/reto-gamer` ahora es "Arma tu burger": juego de un toque para la espera. Récord, partidas y últimas 5 puntuaciones en el dispositivo. Se eliminó el registro con nombre, WhatsApp y código de canje (D7).

## Nombres de producto normales y salchipapa retirada

Fecha: 2026-10-31

1. Nombres descriptivos: Hamburguesa con Tocino, Hamburguesa Royal, Hamburguesa a lo Pobre, Hamburguesa Clásica, Papas Fritas, Inca Kola, Coca-Cola, Agua Cielo. Presentaciones "Simple (1 carne)" / "Doble (2 carnes)".
2. Descripciones reescritas (ingredientes concretos, sin adornos).
3. Salchipapa retirada de la carta. Los carritos guardados la descartan al cargar.
4. Nuevos slugs con redirección 308 desde los anteriores (`legacySlugs`); `/product/salchipapa` → `/#acompanamientos`.
5. Categorías visibles: Hamburguesas, Acompañamientos, Bebidas (las claves internas no cambian).
6. **Sin cambios de SKU ni de precio.** Avisar al equipo del ERP: nombres nuevos y `PRD-SAL-CHIP` / `PRD-SAL-PERS` ya no se venden por la web.
7. El carrito usa los nombres y precios del catálogo al cargar (antes conservaba los guardados).

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
