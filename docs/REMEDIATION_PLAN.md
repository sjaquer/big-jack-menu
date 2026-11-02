# Plan de remediación

**Fecha:** 2026-10-24 · **Basado en:** [`AUDIT.md`](./AUDIT.md) (IDs entre corchetes).

Objetivo: corregir vulnerabilidades, bugs, riesgos legales y deuda técnica **en fases pequeñas, verificables y reversibles**, sin rediseñar el producto. Cada fase termina con `npm run lint`, `npm run build` y la verificación manual indicada.

## Reglas para ejecutar el plan

1. **Una rama y un PR por tarea** (o grupo pequeño de tareas de la misma fase). Nombre: `fix/<ID>-descripcion-corta`.
2. Ninguna tarea cambia SKUs, precios ni el contrato con el ERP sin confirmación explícita del dueño/equipo ERP.
3. Las tareas marcadas con 🔒 requieren una **decisión del negocio** (sección [Decisiones pendientes](#decisiones-pendientes)) antes de empezar.
4. Nunca usar `npm audit fix --force` (ver incidente en `SECURITY_AND_TECH_DEBT.md`).
5. Nunca correr `scripts/test-webhook-orders.ps1` contra producción [OPS-01].
6. Al cerrar una tarea, marcar la casilla aquí y mover el hallazgo a "Resuelto" en `AUDIT.md` con el hash del commit.

## Vista general

| Fase | Tema | Esfuerzo estimado | Bloqueado por |
| :-: | :--- | :-: | :--- |
| 0 | Parches urgentes de seguridad y cumplimiento | 0.5–1 día | — |
| 1 | Libro de Reclamaciones conforme | 1–2 días | Decisiones D2, D5 |
| 2 | Endurecer API de pedidos (servidor como fuente de verdad) | 2–3 días | Decisión D4 (equipo ERP) |
| 3 | Bugs de carrito y checkout | 1–2 días | Fase 2 (módulo de reglas compartido) |
| 4 | Datos únicos y consistentes (horario, legal, contacto, assets) | 1 día | Decisiones D1, D2, D3 |
| 5 | Base de calidad: tests, CI, tooling | 1–2 días | — (puede ir en paralelo desde Fase 1) |
| 6 | Romper monolitos (refactor de arquitectura) | 5–8 días | Fase 5 (tests como red); 6.12 bloqueada por D7 |
| 7 | Accesibilidad, SEO y rendimiento | 2–3 días | Fase 6 recomendable |
| 8 | Limpieza de código muerto y documentación | 0.5–1 día | Al final de cada fase anterior |

---

## Fase 0 — Parches urgentes (hacer ya)

- [x] **0.1** Actualizar `next` y `eslint-config-next` a `^16.4.3`; `npm audit fix` (sin `--force`). [SEC-01]
  - *Aceptación:* `npm audit --omit=dev` sin críticas/altas; `npm run build` OK; navegar `/`, `/product/la-bacon`, enviar un reclamo de prueba en local.
  - *Hecho:* `next@16.4.3`, `eslint-config-next@16.4.3`, `nodemailer@10.2.1`; `npm audit --omit=dev` = 0 vulnerabilidades. La regla nueva `react-hooks/set-state-in-effect` se desactiva temporalmente hasta extraer los hooks (Fase 6).
- [x] **0.2** Quitar `placehold.co` e `images.unsplash.com` de `remotePatterns`. [SEC-08]
- [x] **0.3** `sendComplaint`: en producción, si no hay canal de entrega (SMTP ni Formspree) devolver `success:false` y loguear error. Mantener modo simulado **solo** con `NODE_ENV !== "production"`. [LEG-01]
  - También se eliminó el fallback `NEXT_PUBLIC_FORMSPREE_URL`.
- [x] **0.4** Eliminar la descripción hardcodeada de opciones en `ProductAddToCart.js:97` (mostrar nada o `option.description` si existe). [LEG-03]
- [x] **0.5** Cambiar la URL por defecto del script PS1 a `http://localhost:3000/api/online-orders` o exigir `-WebhookUrl` explícito; advertencia en cabecera del script. [OPS-01]
- [x] **0.6** Copiar `public/images/sincomprimir/og-bigjack.png` (optimizada, 1200×630) a `public/images/og-bigjack.png`. [SEO-01, DEAD-01]
  - Generada a 1200×630 (269 KB) con fondo desenfocado; reemplaza el archivo inexistente.

## Fase 1 — Libro de Reclamaciones conforme 🔒 (D2, D5)

- [ ] **1.1** Leer y enviar `incident_date` en `actions.js`. [LEG-02]
- [ ] **1.2** Generar número correlativo + fecha de registro (persistencia: ver D5 — ERP, base de datos o hoja). [LEG-02]
- [ ] **1.3** Enviar copia al email del consumidor con el número de reclamo. Ajustar el texto de éxito para que diga exactamente lo que ocurre. [LEG-02]
- [ ] **1.4** Mostrar razón social legal y dirección fiscal desde `restaurantInfo`. [LEG-02, DATA-02]
  - Parcial (Hecho 2026-10-31): el libro muestra `legalName` y la dirección de `restaurantInfo.address`. Falta confirmar razón social y RUC (D2).
- [ ] **1.5** Agregar campos/textos faltantes del reglamento (apoderado para menores, avisos legales). Validar redacción con asesoría legal. [LEG-02]
- [ ] **1.6** Validación de servidor (DNI/CE, email, teléfono, longitudes máximas) + Turnstile + rate-limit. [SEC-06]
- [x] **1.7** `<label htmlFor>` en todos los campos. [A11Y-02]
  - Hecho 2026-10-31: `htmlFor`/`id` en todos los campos y `radiogroup` en tipo de registro.
- [x] **1.8** Página `/privacidad` y texto de consentimiento en checkout, libro y juego. [LEG-04]
  - Hecho 2026-11-01: página `/privacidad` creada conforme a la Ley N.° 29733 (responsable, datos, localStorage, finalidades y derechos ARCO), enlace y aviso de fotos referenciales en el pie de página, aviso de consentimiento en checkout y ruta en `sitemap.js`.
- *Aceptación:* enviar reclamo → llega correo al negocio **y** al consumidor con el mismo número; sin credenciales en prod → error visible.

## Fase 2 — API de pedidos: el servidor manda 🔒 (D4)

- [x] **2.1** Crear `app/lib/catalog.js` (índice de SKUs activos con precio y nombre) y usarlo en `route.js` y `submitOrder.js`. [QLT-02]
- [x] **2.2** Crear `app/lib/orderRules.js` con las reglas de negocio (horario en `America/Lima`, pre-orden solo recojo, delivery sin efectivo, complementos, máximos, longitudes). Usarlo en cliente **y** servidor. [SEC-05, BUG-05]
- [x] **2.3** Construir en servidor el payload saliente con lista blanca de campos (no hacer spread del body). [SEC-03]
- [x] **2.4** Normalizar la respuesta al cliente (`{ success, orderId, duplicated, message }`) y loguear la respuesta cruda del ERP en servidor. [SEC-09]
- [x] **2.5** `eventId` con `crypto.randomUUID()`; mantener el mismo id en reintentos del mismo intento de compra. [SEC-10]
  - Hecho 2026-10-31 (2.1–2.5): `lib/catalog.js` y `lib/orderRules.js` (con tests) usados por `route.js`; pedido saliente con lista blanca y la misma forma (contrato intacto); horario y pre-orden decididos en el servidor; respuesta normalizada `{ success, orderId, duplicated }` y log del ERP en servidor; `eventId` con `crypto.getRandomValues` (mismo formato `menu-AAAAMMDD-xxxxxx`). Pendiente: que `submitOrder.js` (cliente) también use `orderRules` para no duplicar reglas.
- [x] **2.6** Verificación de `Origin` + Turnstile en el checkout. [SEC-02]
  - Hecho 2026-10-31: `Origin`/`Sec-Fetch-Site`, `Content-Type`, tamaño del cuerpo y Cloudflare Turnstile invisible (token de un solo uso validado en el servidor antes del ERP) + freno de 20 s entre pedidos por IP.
- [ ] **2.7** Rate-limit persistente (Upstash/Vercel KV o Vercel Firewall). [SEC-04]
- [ ] **2.8** `app/lib/env.js`: un nombre por variable, validación al arranque, sin fallbacks `NEXT_PUBLIC_` para secretos. Actualizar `.env.example`. [SEC-11, OPS-03]
- [x] **2.9** Cabeceras de seguridad en `next.config.mjs`. [SEC-07]
  - 2026-10-31: CSP agregada (permite Google Tag Manager/Analytics; probada en build de producción con GTM sin violaciones) + `Cross-Origin-Opener-Policy`. Si se agregan en GTM etiquetas de otros proveedores, sumar sus dominios en `next.config.mjs`.
  - Hecho 2026-10-31: `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS y `poweredByHeader: false`. CSP pendiente (requiere probar el embed de Maps y scripts de Next).
- *Aceptación:* `curl` directo al endpoint con campos extra, fuera de horario, con delivery+efectivo o solo bebidas → `400`; con origen ajeno → `403`; pedido válido desde la UI → `200` y llega al ERP de **staging**.

## Fase 3 — Bugs de carrito y checkout

- [x] **3.1** `ClientSearchParams`: abrir el carrito una sola vez y limpiar `?openCart` con `router.replace`. [BUG-01]
- [x] **3.2** `lib/cartModel.js#addItem` con tope por ítem y total; usarlo en tarjeta, modal, upsell y página de producto. [BUG-02, QLT-02]
- [x] **3.3** Aplicar reglas de complementos al **quitar** ítems y en la página de producto, con mensaje al usuario cuando se retire algo. [BUG-03]
- [x] **3.4** Constantes de categoría (corrige `"GUARNICION"`). [BUG-04, QLT-07]
- [x] **3.5** `getNextOpenDate` coherente con `isOpenNow` + tests de bordes horarios. [BUG-06]
  - Cálculo migrado a hora de Lima; casos 18:59/19:00/23:59/00:30/01:00 verificados. Tests automatizados quedan en 5.1.
- [ ] **3.6** Definir obligatoriedad del teléfono (D6) y alinear UI/cliente/servidor. [BUG-07]
- [x] **3.7** `safeStorage` (try/catch) y limpiar el carrito **antes** de cualquier operación que pueda lanzar tras un pedido exitoso. [BUG-10, QLT-04]
- [x] **3.8** Instalar `tw-animate-css` o reemplazar clases `animate-in/*`. [BUG-08]
- *Aceptación:* tests de `cartModel`/`orderRules` verdes; flujo manual: producto → `/?openCart=true` → cerrar carrito funciona; no se puede pasar de 10 unidades por ninguna vía.

## Fase 4 — Datos únicos y consistentes 🔒 (D1, D2, D3)

- [x] **4.1** `restaurantInfo` como única fuente: `hours`, `legalName`, `ruc`, `address{street,district,city}`, `geo`, `whatsapp`, `prepTimeMinutes`, `siteUrl`. [DATA-01..06]
  - Hecho 2026-10-31: `legalName`, `address{street,area,locality,region,postalCode,country}` (dirección confirmada en el manual, B5), `prepTimeMinutes`, `deliveryApps`, `googleReviewLink`; URL del sitio en `lib/site.js`. Sin `geo`: las coordenadas antiguas eran de Lince y no se inventan nuevas.
- [x] **4.2** Formateador `formatSchedule(hours)` usado por header, footer, `/links` y JSON-LD. [DATA-01]
  - Hecho 2026-10-31: `lib/schedule.js` (`groupSchedule`, `formatScheduleSummary`) usado en footer, ubicación, `/links`, FAQ y `llms.txt`; JSON-LD usa `restaurantInfo.hours`.
- [x] **4.3** Estado "ABIERTO/CERRADO" real en `/links`; quitar o justificar rating "4.9" y badge "Premium". [DATA-05]
  - Hecho 2026-10-31: `/links` muestra el estado real (`OpenStatusBadge`); eliminados el "4.9" y el "ABIERTO" fijo.
- [x] **4.4** Generar íconos PWA (192/512) y logo; corregir `manifest.json` y `restaurantInfo.logo`. [DEAD-01]
  - Íconos generados desde `app/icon0.svg` sobre fondo `#FCC900`; `purpose: "any maskable"`; logo apunta a `bigjacktitle.svg`.
- [x] **4.5** Código real de Google Search Console o quitar `verification`. [SEO-03]
  - Hecho 2026-10-31: la meta solo se publica si existe `GOOGLE_SITE_VERIFICATION`.
- [ ] **4.6** Corregir comentarios y textos sin tildes. [DATA-07, QLT-10]

## Fase 5 — Base de calidad (puede empezar en paralelo)

- [ ] **5.1** Vitest + tests unitarios de `openHours`, `cartModel`, `cartRules`, `onlineOrders`, `orderRules`, `catalog`. [QLT-06]
  - Hecho: Vitest instalado, `npm test` con 34 tests de `openHours`, `cartModel`, `cartRules` y `onlineOrders`. Pendiente: `orderRules` y `catalog`, que aún no existen.
- [x] **5.2** GitHub Actions: `npm ci`, `lint`, `test`, `build`, `npm audit --omit=dev --audit-level=high`. [OPS-02]
- [x] **5.3** `engines.node` + `.nvmrc` (LTS). [OPS-04]
- [ ] **5.4** Script de prueba del webhook en Node (multiplataforma) contra staging/mock. [OPS-01]
- [ ] **5.5** (Opcional) JSDoc con `// @ts-check` en `lib/`, o migración incremental a TypeScript.

## Fase 6 — Romper monolitos (refactor de arquitectura) [QLT-01, QLT-11]

Objetivo: que ningún archivo junte UI, estado, reglas de negocio y datos. Cada pieza se puede leer, testear y cambiar sola. Hacerlo **por archivo, un PR cada uno**, sin cambiar comportamiento visible (refactor puro: mismo HTML resultante, mismos textos).

**Regla de capas** (aplica a todo el repo a partir de esta fase):

| Capa | Dónde | Contiene | No contiene |
| :--- | :--- | :--- | :--- |
| Dominio puro | `app/lib/`, `app/features/<f>/*.js` | Reglas, cálculos, builders de mensajes, formateadores. Funciones puras con tests. | React, `window`, `fetch` |
| Estado | `app/features/<f>/hooks/` | Hooks (`useCart`, `useCheckoutForm`…) que usan el dominio. | Markup |
| Presentación | `app/features/<f>/components/` | Componentes que reciben datos y callbacks. | Reglas de negocio, `localStorage` |
| Compartido | `app/components/` | UI usada por varias rutas: íconos, `Dialog`, `Toast`, `SiteHeader`, `SiteFooter`. | Lógica de una feature concreta |
| Página | `app/**/page.js` | Composición + `metadata`. Server Component siempre que se pueda. | Lógica de negocio |

**Presupuesto de tamaño:** componente ≤ 250 líneas, página ≤ 150, hook ≤ 150, módulo de dominio ≤ 200. Pasarse es señal de que hay que dividir, no una prohibición absoluta (justificar en el PR).

- [x] **6.0** Agregar regla ESLint `max-lines` (300, `skipBlankLines`, `skipComments`) como **error**, con un override temporal que lista los archivos pendientes de esta fase. Cada PR de la fase saca su archivo de la lista; la fase termina cuando la lista está vacía. (Así `npm run lint` sigue en 0 errores/0 warnings durante la transición.)
  - Excepción actual: `reto-gamer/page.js`, `HomeClient.js`, `CartDrawer.js`, `libro-de-reclamaciones/page.js` y `links/page.js`.
- [x] **6.1** Extraer hooks: `useCart`, `useCheckoutForm`, `useOpenStatus` (intervalo de 30–60 s, sin escribir `localStorage`). [QLT-01, PERF-01, DEAD-06]
  - Estado de carrito, checkout y horario extraído a hooks; el intervalo de apertura pasó de 1 s a 30 s y se actualiza al volver a la pestaña.
- [x] **6.2** Mover builders puros (mensaje WhatsApp, recordatorio de pago, errores amigables, `normalizePhoneForDisplay`) a `features/home/checkout/`. [QLT-01]
  - En `checkout/orderMessages.js`, con 9 tests nuevos. `page.js`: 784 líneas.
- [x] **6.3** Contexto o store para el carrito; `CartDrawer` con < 10 props. [QLT-01]
  - `context/CartContext.js` + `CartProvider`; `CartDrawer` pasó de ~40 props a 0 y consume `useCartDrawer()`.
- [x] **6.4** Reemplazar `alert/confirm` por sistema de toasts en `app/components/Toast` (reutilizar CSS existente). [QLT-03, DEAD-04]
  - `useToast` + `Toast` con variantes info/success/error/confirm; `CartDrawer` recibe `onToast`. Queda un `alert` en `reto-gamer/leaderboard.js` (bloqueado por D7).
- [x] **6.5** `MenuGrid`: un solo árbol responsive; `CategoryCarousel` a su propio archivo. [QLT-09, QLT-11]
  - `MenuGrid.js`: 283 → 91 líneas. `CategoryCarousel.js`: 151. El carrusel se usa en móvil y desktop; se eliminó el grid duplicado y se corrigió el desborde con `min-w-0`.
- [x] **6.6** Unificar diseño de `/product/[slug]` con el sistema (dorado `#FCC900`, sin clases inexistentes). [DEAD-02, ver `DESIGN.md`]
  - Anton, `.btn-streetwear`, `.block-yellow`, `.tag-streetwear`, iconos lucide sin emojis y fondo `#0F0F12`. `ProductAddToCart` reutiliza `useOpenStatus` (30 s) en vez de su intervalo de 1 s.
- [x] **6.7** `app/page.js` (968 → ≤ 150 líneas): página server que compone `HomeClient`; el header pasa a `SiteHeader` (compartido con `/product/[slug]`), y lo que quede de estado vive en los hooks de 6.1. [QLT-01, QLT-11]
  - `app/page.js`: 5 líneas (Server Component). `HomeClient.js`: 686 líneas. `SiteHeader` compartido en home y producto.
- [x] **6.8** `CartDrawer.js` (494): dividir en `CartItemList`, `CustomerStep`, `DeliveryStep`, `PaymentStep`, `CartSummary`, `ItemThumb`; el drawer solo orquesta el paso actual. [QLT-11]
  - `CartDrawer.js`: 508 → 90 líneas. Componentes en `components/cart/` (146, 120, 163, 79, 58 y 27 líneas).
- [ ] **6.9** `api/online-orders/route.js` (243): el handler solo orquesta; mover rate-limit a `lib/rateLimit.js`, cliente del ERP a `lib/erpClient.js` y validación a `lib/orderRules.js` (se apoya en 2.1–2.3 y 2.7). [QLT-11]
- [x] **6.10** `links/page.js` (304): íconos de marca a `app/components/icons/` (compartidos con `FooterSection`), datos desde `restaurantInfo`, página server + isla cliente para el estado abierto/cerrado (se combina con 7.4). [QLT-11, QLT-05]
  - Hecho 2026-10-31: `links/page.js` es Server Component; íconos en `app/components/icons/BrandIcons.js`; datos desde `restaurantInfo`.
- [ ] **6.11** `libro-de-reclamaciones/page.js` (315): página server con `metadata` + `ComplaintForm` cliente dividido por secciones (`ConsumerFieldset`, `ProductFieldset`, `ClaimFieldset`). Coordinar con Fase 1 para no hacer el trabajo dos veces. [QLT-11, QLT-05]
  - Parcial (Hecho 2026-10-31): `page.js` server con metadata + `ComplaintForm.js` cliente dentro del layout común. Falta dividir por fieldsets junto con la Fase 1.
- [x] **6.12** 🔒 `reto-gamer/page.js` (1.670): **primero resolver D7** — si el juego se simplifica o se quita, no refactorizar código que se va a borrar. Si se queda: motor en `app/reto-gamer/game/` (módulos puros `player.js`, `boss.js`, `bullets.js`, `collisions.js`, `waves.js`, `powerUps.js`, `loop.js`) y UI en `components/` (`Hud`, `MenuScreen`, `GameOverScreen`, `RegisterModal`, `LeaderboardModal`). [QLT-11, PERF-04, DEAD-10]
- [x] **6.13** `SiteHeader`/`SiteFooter` compartidos (o layout de grupo de rutas) para que home, producto, `/quienes` y `/links` no tengan cada uno su propio header/footer. [QLT-11, DEAD-02]
  - Hecho 2026-10-31: grupo de rutas `app/(shop)` con `SiteHeader`, `SiteFooter`, carrito y overlays compartidos para `/`, `/product/*`, `/quienes` y `/libro-de-reclamaciones`.
  - Hecho: `SiteHeader` compartido entre home y producto (modo `compact`). Pendiente: footer y rutas `/quienes`, `/links`.
- *Aceptación:* lista de excepciones de `max-lines` vacía; `npm run lint` y `npm run build` OK; flujo completo (agregar → carrito → 3 pasos → confirmación) igual que antes en 360 px y desktop; tests de Fase 5 verdes sin modificarlos.

## Fase 7 — Accesibilidad, SEO y rendimiento

- [x] **7.1** Componente `Dialog` reutilizable (focus trap, `Esc`, retorno de foco) para drawer y modales. [A11Y-01]
  - Hecho 2026-10-31: `app/components/Dialog.js`, usado por drawer, hoja de producto, sugerencias y confirmación.
- [x] **7.2** Labels en checkout. [A11Y-02]
  - Hecho 2026-10-31: componente `Field` con `<label>` visible en todo el checkout.
- [x] **7.3** `SecureMap` → iframe simple sin bloqueo de interacción; `aria-label` en enlaces solo-icono. [SEC-12, A11Y-03]
  - Hecho 2026-10-31: `SecureMap` eliminado; la ubicación usa enlaces directos a Google Maps. Íconos sociales con `aria-label`.
- [x] **7.4** Convertir `/links`, `/quienes`, `/libro-de-reclamaciones` a Server Components con islas cliente y `metadata` propia; eliminar spinner de `/links`. [QLT-05, SEO-02, DEAD-05]
  - Hecho 2026-10-31: `/links`, `/quienes`, `/libro-de-reclamaciones` y `/reto-gamer` con metadata y canonical propios; sin spinner.
- [x] **7.5** Optimizar `burger_hero.png` (WebP/AVIF ≤ 150 KB). [PERF-02]
  - Hecho 2026-10-31: `burger-hero.webp` (99 KB, antes 862 KB) y `og-bigjack.jpg` (101 KB, antes 275 KB).
- [x] **7.6** `next/dynamic` para drawer, modales y mapa. [PERF-03]
  - Hecho 2026-10-31: drawer, hojas y confirmación con `next/dynamic` (se cargan al abrirse).
- [x] **7.7** Revisar sticky del filtro en móvil. [A11Y-04]
  - Hecho 2026-10-31: header de altura fija (`--header-h`) y barra de secciones `sticky top-[var(--header-h)]`.

## Fase 8 — Limpieza

- [x] **8.1** Borrar `MenuGridSkeleton`/`ProductCardSkeleton` (o usarlos de verdad). [DEAD-03]
- [x] **8.2** Borrar CSS sin uso y `:focus-visible` duplicado. [DEAD-07]
- [x] **8.3** Borrar lógica muerta e imports sin uso. [DEAD-08]
- [x] **8.4** Sacar `public/images/sincomprimir/` del directorio público (mover a `design-assets/` o fuera del repo); quitar `choripan.webp`/`grilljack.webp` si no se usarán. [DEAD-09]
  - `sincomprimir/` movido a `design-assets/` (ignorado por git); eliminados `choripan.webp`, `grilljack.webp` y `bigjacklogotipo.png`. El schema usa `lamisia.webp`.
- [x] **8.5** Simplificar Reto Gamer según D7. [BUG-09, DEAD-10]
  - Hecho 2026-10-31: D7 resuelto por el dueño (sin premios; el juego es para la espera). El shooter de 1.670 líneas se reemplazó por "Arma tu burger" (`BurgerGame.js` + `game/engine.js` con tests). Sin nombre, WhatsApp ni código de canje; récord local en `bj_burger_stats` y se borran las claves antiguas.
- [x] **8.6** Marcar docs históricos y corregir rutas absolutas. [DOC-01, DOC-02]

---

## Fase 9 — Rediseño UX "menos es más" y SEO/IA (2026-10-31)

- [x] **9.1** Carta vertical en una columna: hamburguesas grandes (`FeatureItem`), complementos en filas (`CompactItem`), navegación por secciones con scroll-spy.
- [x] **9.2** Hero animado por scroll (fundido a pantalla completa de la hamburguesa) con alternativa `prefers-reduced-motion`.
- [x] **9.3** Header mínimo, aviso de cerrado no bloqueante, barra flotante "Ver pedido".
- [x] **9.4** Un solo carrito en carta y ficha de producto (layout `(shop)` + `ShopProvider`); ya no se redirige a `/?openCart=true`.
- [x] **9.5** `llms.txt`, robots para asistentes de IA, sitemap con imágenes, JSON-LD `Product`/`BreadcrumbList`/`WebSite`, FAQ visible = FAQPage, 404 de marca, `manifest.js`.
- [x] **9.6** Tokens de color en `@theme` y migración de clases hex.

## Enero 2027 — Reactivaciones pendientes

Decisiones del dueño del 2026-10-31. Cada tarea es un cambio pequeño y ya está preparado en el código.

- [ ] **E.1** Volver a publicar el **RUC** nuevo: poner el valor en `restaurantInfo.ruc` (`app/data/menuData.js`). Con eso aparece solo en el footer, `/links` y el Libro de Reclamaciones.
- [ ] **E.2** Reactivar el **Libro de Reclamaciones**: `FEATURES.complaintsBook = true` en `app/lib/site.js`. Vuelve el formulario, el link del footer y de `/links`, el sitemap y `llms.txt`; la Server Action vuelve a aceptar reclamos.
  - Al reactivarlo, proteger también `sendComplaint` con Turnstile (`verifyTurnstile` de `lib/turnstile.js`, acción propia) y límites de longitud (SEC-06).
  - Antes de reactivar, completar la Fase 1 (número correlativo, copia al consumidor, campos del reglamento, razón social y RUC correctos) para que el libro sea conforme.
  - ⚠️ **Riesgo legal mientras esté apagado:** el Código de Protección y Defensa del Consumidor y su reglamento (DS 011-2011-PCM) exigen que el establecimiento tenga un Libro de Reclamaciones disponible (físico o virtual) y avisado. No tenerlo puede generar multas de INDECOPI. Mientras tanto la ruta muestra un aviso con WhatsApp como vía de contacto; confirmar con asesoría legal si basta con un libro físico en el local.
- [ ] **E.3** Revisar si PedidosYa vuelve (se quitó el 2026-10-31 por malos tratos de la plataforma). Si vuelve: agregar `deliveryApps.pedidosYa` en `menuData.js` y su ícono en `public/images/brands/`.

## Decisiones pendientes

Necesarias del dueño del negocio / equipo ERP antes de las tareas marcadas con 🔒.

| ID | Pregunta | Afecta |
| :-: | :--- | :--- |
| D1 | ¿Cuál es el horario real por día? (hoy hay 4 versiones, ver DATA-01) | Fase 4, cálculo de abierto/cerrado |
| D2 | Razón social legal, RUC correcto y dirección fiscal/local (¿Centro de Lima o Lince?) | Fases 1 y 4, SEO |
| D3 | Número oficial de WhatsApp | Fase 4 |
| D4 | ¿Qué campos lee hoy el webhook del ERP? ¿Ignora `unitPrice`/`useCatalogPrice`/`status`? ¿Existe entorno de staging? | Fase 2 |
| D5 | ¿Dónde se persisten los reclamos (ERP, base de datos, Google Sheet)? ¿Quién responde y en qué plazo? | Fase 1 |
| D6 | ¿Teléfono obligatorio en todos los pedidos o solo en delivery? | Fase 3 |
| D7 | ✅ Resuelto (2026-10-31): sin premios. Juego casual para la espera, récord solo local. | Fase 8 |
| D8 | ¿Se cobra delivery? La UI dice que lo coordina inDrive y el mensaje dice "sin costo de envío". | Copy del checkout |
