# Auditoría técnica — Big Jack Menu

**Fecha:** 2026-10-24
**Alcance:** todo el repositorio (`app/`, `public/`, `scripts/`, `docs/`, configuración y dependencias) en el commit `cff53d7`.
**Método:** lectura completa del código fuente (≈7.3k líneas), `npm run lint`, `npm run build`, `npm audit --omit=dev`, `npm outdated`, búsqueda de símbolos/clases sin uso y de secretos en el historial de git.

> Este documento **reemplaza** como fuente de verdad a `docs/SECURITY_AND_TECH_DEBT.md` y `docs/UI_UX_OVERHAUL_WALKTHROUGH.md`, que contienen afirmaciones que no se cumplen en el código actual (ver [DOC-01](#doc-01)).
> El plan para corregir cada hallazgo está en [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md).

## Estado de verificación

| Chequeo | Resultado |
| :--- | :--- |
| `npm run build` | ✅ Compila (24 rutas, 1 dinámica: `/api/online-orders`). |
| `npm run lint` | ✅ 0 errores, 0 advertencias. |
| `npm audit --omit=dev` | ❌ **6 vulnerabilidades (1 crítica, 5 altas)** — ver [SEC-01](#sec-01). |
| Tests automatizados | ❌ No existen. |
| CI | ❌ No existe. |
| Secretos en historial git | ✅ No se encontraron credenciales reales. |

## Escala de severidad

| Nivel | Significado |
| :--- | :--- |
| **Crítica** | Explotable hoy o con impacto legal/económico directo. Corregir antes de cualquier otro cambio. |
| **Alta** | Pérdida de datos, pedidos falsos, información engañosa al cliente o funcionalidad rota visible. |
| **Media** | Bug o riesgo con impacto acotado, o deuda que bloquea cambios futuros. |
| **Baja** | Higiene, consistencia, limpieza. |

## Resumen

| Categoría | Crítica | Alta | Media | Baja | Total |
| :--- | :-: | :-: | :-: | :-: | :-: |
| Seguridad (SEC) | 1 | 2 | 5 | 4 | 12 |
| Legal / cumplimiento (LEG) | 1 | 2 | 1 | 0 | 4 |
| Bugs funcionales (BUG) | 0 | 3 | 5 | 2 | 10 |
| Datos inconsistentes (DATA) | 0 | 2 | 3 | 2 | 7 |
| Código muerto / olvidado (DEAD) | 0 | 0 | 2 | 8 | 10 |
| Calidad / malas prácticas (QLT) | 0 | 0 | 6 | 4 | 10 |
| Rendimiento (PERF) | 0 | 0 | 2 | 2 | 4 |
| Accesibilidad (A11Y) | 0 | 0 | 3 | 1 | 4 |
| SEO | 0 | 1 | 2 | 1 | 4 |
| Operación / tooling (OPS) | 0 | 1 | 2 | 1 | 4 |
| Documentación (DOC) | 0 | 0 | 1 | 1 | 2 |

---

## 1. Seguridad (SEC)

### SEC-01 — Next.js con vulnerabilidades críticas (RCE) · **Crítica**
- **Dónde:** `package.json` (`next@16.2.12`), `next.config.mjs:14`.
- **Evidencia:** `npm audit` reporta para `next 9.3.4-canary.0 – 16.4.0`, entre otras: *RCE en Image Optimization API con archivos AVIF* (GHSA-2xp9-vwfh-vxw4), *RCE con SVG* (GHSA-2464-fhr4-w9xw), *SSRF en Image Optimization* (GHSA-cjq9-62q9-8jv4), *DoS con Server Actions* (GHSA-p3m5-59mp-jv5r). El proyecto **habilita AVIF** (`formats: ["image/webp", "image/avif"]`) y **usa Server Actions** (`app/actions.js`). Además: `sharp` (alta, libvips), `postcss`, `nanoid`, `source-map-js`.
- **Impacto:** ejecución remota de código / denegación de servicio en producción.
- **Recomendación:** actualizar `next` y `eslint-config-next` a `^16.4.3` y correr `npm audit fix` (**sin** `--force`, ver regla en AGENTS.md). Verificar con `npm audit --omit=dev` = 0.

### SEC-02 — `/api/online-orders` acepta pedidos de cualquiera, sin protección anti-abuso real · **Alta**
- **Dónde:** `app/api/online-orders/route.js:92-243`.
- **Evidencia:** no hay verificación de `Origin`, CAPTCHA, token ni firma. Cualquiera puede hacer `POST` con SKUs válidos. El ERP **registra la venta y descuenta inventario** por cada pedido (`docs/webhook-pedidos.md`, reglas 3-4).
- **Impacto:** pedidos falsos que ensucian ventas e inventario del ERP.
- **Recomendación:** verificar `Origin`/`Referer`, añadir Cloudflare Turnstile (o similar) en el checkout, honeypot, y rate-limit persistente (ver SEC-04).

### SEC-03 — El proxy reenvía campos arbitrarios del cliente al ERP (mass assignment) · **Alta**
- **Dónde:** `app/api/online-orders/route.js:65-90` (`...payload`), `:211-216`.
- **Evidencia:** `normalizePayloadForWebhook` hace spread del body completo. Los `items` también se reenvían con cualquier campo extra. Un atacante puede inyectar `source`, `metadata`, `orderDate`, `status`, `totalAmount`, `unitPrice`, `useCatalogPrice:false`, etc. La API legacy del ERP aceptaba `useCatalogPrice=false` + `unitPrice` (`docs/legacy/online-orders-api.md` §3).
- **Impacto:** si el webhook del ERP honra alguno de esos campos → manipulación de precio/estado. Aunque no los honre hoy, el contrato queda abierto.
- **Recomendación:** construir el payload saliente **en el servidor** con lista blanca de campos (`eventId`, `orderDate` generado en servidor, `customer`, `paymentMethod` de un enum, `notes` truncado, `items: [{sku, quantity, notes}]`, `metadata` con claves conocidas). Confirmar con el equipo ERP qué campos lee el webhook.

### SEC-04 — Rate-limit en memoria, inefectivo en serverless · **Media**
- **Dónde:** `app/api/online-orders/route.js:14-25, 93-112, 194-195`.
- **Evidencia:** `ipCache` es un `Map` del proceso. En Vercel cada instancia/cold start tiene su propio mapa. La IP se toma del primer valor de `x-forwarded-for`, que es falsificable si el proxy no lo sobrescribe. Solo se cuentan pedidos que pasan validación.
- **Recomendación:** rate-limit en store compartido (Upstash Redis / Vercel KV) o en el edge (Vercel Firewall). Usar `request.ip`/cabecera confiable de la plataforma.

### SEC-05 — Reglas de negocio solo en el cliente · **Media**
- **Dónde:** `app/features/home/checkout/submitOrder.js:58-76` vs. `route.js`.
- **Evidencia:** horario de atención, "pre-orden solo recojo", "delivery no acepta efectivo", "bebidas solo con hamburguesa" y longitud de campos **no** se validan en el servidor.
- **Recomendación:** mover la validación a un módulo compartido (`lib/orderRules.js`) y ejecutarlo en el route handler. El cliente solo da feedback temprano.

### SEC-06 — Server Action del Libro de Reclamaciones sin anti-spam · **Media**
- **Dónde:** `app/actions.js:14-116`.
- **Evidencia:** cada envío dispara un correo SMTP. Sin rate-limit, CAPTCHA ni límite de longitud. El email no se valida en servidor.
- **Impacto:** email bombing a la cuenta del negocio y consumo de cuota de Gmail.
- **Recomendación:** Turnstile + rate-limit + validación de formato/longitud (DNI 8 dígitos o CE, email, teléfono).

### SEC-07 — Sin cabeceras de seguridad HTTP · **Media**
- **Dónde:** `next.config.mjs` (no define `headers()`).
- **Recomendación:** `Content-Security-Policy` (permitiendo Google Maps embed), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (geolocation=self), `frame-ancestors 'none'`.

### SEC-08 — `remotePatterns` de imágenes innecesarios · **Media**
- **Dónde:** `next.config.mjs:4-13`.
- **Evidencia:** se permiten `placehold.co` e `images.unsplash.com`, pero **todas** las imágenes son locales. Amplía la superficie del optimizador de imágenes (ligado a SEC-01: SSRF/RCE en Image Optimization).
- **Recomendación:** eliminar ambos patrones.

### SEC-09 — Respuesta del ERP reenviada tal cual al navegador · **Baja**
- **Dónde:** `app/api/online-orders/route.js:218-227`.
- **Impacto:** puede filtrar mensajes internos/estructura del ERP.
- **Recomendación:** mapear a `{ success, orderId, duplicated, message }` y loguear el resto en servidor.

### SEC-10 — `eventId` generado en el cliente con `Math.random` · **Baja**
- **Dónde:** `app/lib/onlineOrders.js:8-13`.
- **Recomendación:** generar con `crypto.randomUUID()`; idealmente en servidor a partir de un id de intento enviado por el cliente (para conservar idempotencia en reintentos).

### SEC-11 — Variables de secreto con 3 nombres alternativos y fallback `NEXT_PUBLIC_` · **Baja**
- **Dónde:** `route.js:56-63` (`WEBHOOK_MENU_SECRET || WEBHOOK_SECRET || ERP_WEBHOOK_SECRET`), `actions.js:51` (`FORMSPREE_URL || NEXT_PUBLIC_FORMSPREE_URL`).
- **Impacto:** confusión de configuración; `NEXT_PUBLIC_*` se expone al bundle del navegador.
- **Recomendación:** un solo nombre por variable, validado al arrancar (`lib/env.js`).

### SEC-12 — "SecureMap": ofuscación sin valor de seguridad · **Baja**
- **Dónde:** `app/features/home/components/SecureMap.js:11-35`.
- **Evidencia:** la URL pública del embed de Google Maps se esconde en base64 y se bloquea el clic derecho. No protege nada (la URL es visible en DevTools/red) y bloquear `contextmenu`/`copy` perjudica accesibilidad.
- **Recomendación:** `<iframe>` normal con `loading="lazy"` y `title`; o enlace estático + imagen para ahorrar JS.

---

## 2. Legal / cumplimiento (LEG)

> Perú: Código de Protección y Defensa del Consumidor (Ley 29571), Reglamento del Libro de Reclamaciones (D.S. 011-2011-PCM y modificatorias) y Ley de Protección de Datos Personales (Ley 29733). **Validar cada punto con asesoría legal**; esto es un diagnóstico técnico, no legal.

### LEG-01 — Reclamos se "registran" con éxito aunque no se envíen a nadie · **Crítica**
- **Dónde:** `app/actions.js:105-109`.
- **Evidencia:** si faltan `GMAIL_USER`/`GMAIL_PASS`, la acción devuelve `{ success: true, message: "Reclamo registrado correctamente." }` y solo hace `console.warn`. Si Formspree falla y no hay SMTP, el reclamo **se pierde** y el consumidor ve confirmación.
- **Impacto:** incumplimiento del deber de atender reclamos; riesgo de multa.
- **Recomendación:** en producción, fallar con error visible si no hay canal de entrega configurado; persistir el reclamo (DB/ERP) antes de notificar.

### LEG-02 — Libro de Reclamaciones incompleto respecto al reglamento · **Alta**
- **Dónde:** `app/libro-de-reclamaciones/page.js`, `app/actions.js`.
- **Evidencia:**
  - No se genera **número correlativo** ni fecha de registro.
  - No se envía **copia al consumidor** (aunque la UI dice "Se ha enviado una copia…", `page.js:279`).
  - El campo **Fecha del incidente** (`incident_date`, `page.js:192`) se pide pero `actions.js` **no lo lee** → se descarta.
  - "Razón Social" muestra `BIG JACK` (`page.js:67`), no la razón social legal.
  - Faltan: datos del padre/madre/apoderado para menores, textos legales obligatorios (p. ej. que el reclamo no impide acudir a otras vías), sección de "acciones adoptadas por el proveedor".
- **Recomendación:** ver Fase 1 del plan. Persistir, numerar, enviar copia por email al consumidor, completar campos.

### LEG-03 — Información de producto engañosa en la página de detalle · **Alta**
- **Dónde:** `app/product/[slug]/ProductAddToCart.js:97`.
- **Evidencia:** la descripción de cada opción está *hardcodeada*: `'simple'` → "Hamburguesa + Papas"; cualquier otra → "Hamburguesa Doble + Papas + Gaseosa". Ninguna hamburguesa incluye papas ni gaseosa según `menuData.js`, y para bebidas/guarniciones (opciones `botella`, `personal`, `familiar`) muestra "Hamburguesa Doble + Papas + Gaseosa".
- **Impacto:** publicidad engañosa (Ley 29571); reclamos de clientes.
- **Recomendación:** eliminar el texto o derivarlo de un campo `option.description` en `menuData.js`.

### LEG-04 — Sin aviso de privacidad para datos personales · **Media**
- **Dónde:** checkout (`CartDrawer.js`), Libro de Reclamaciones, Reto Gamer (nombre + WhatsApp).
- **Evidencia:** se recolectan nombre, teléfono, dirección, ubicación GPS, DNI, email. No hay política de privacidad ni consentimiento. Además nombre/teléfono/dirección se guardan en `localStorage` (`page.js:263-278`).
- **Recomendación:** página `/privacidad`, texto de consentimiento en formularios, documentar retención.

---

## 3. Bugs funcionales (BUG)

### BUG-01 — Con `?openCart=true` el carrito no se puede cerrar · **Alta**
- **Dónde:** `app/features/home/components/ClientSearchParams.js:8-14` + `app/page.js:838`.
- **Causa:** `onOpenCart={() => setIsCartOpen(true)}` crea una función nueva en cada render; el `useEffect` depende de ella, así que tras **cada** render (cerrar el carrito, escribir en un input, el timer de 1 s) vuelve a abrir el carrito. La página de producto navega a `/?openCart=true` (`ProductAddToCart.js:53`, `product/[slug]/page.js:67`).
- **Recomendación:** ejecutar una sola vez (ref de "ya abierto") y limpiar el parámetro con `router.replace("/")`.

### BUG-02 — Se puede exceder el máximo por producto y el pedido falla al final · **Alta**
- **Dónde:** `app/page.js:432-444` (`quantity: item.quantity + 1` sin tope), `ProductAddToCart.js:132` (sin tope), `handleConfirmSuggestions` (`page.js:546-579`).
- **Evidencia:** `MAX_QTY_PER_ITEM = 10` solo se respeta en el botón "+" del drawer. Agregando desde la tarjeta, la página de producto o el upsell se supera; luego `submitOnlineOrder` lanza "La cantidad máxima…" en el último paso.
- **Recomendación:** centralizar `addItem(cart, item, qty)` en `lib/cartModel.js` que aplique tope por ítem y total (`MAX_CART_ITEMS`).

### BUG-03 — Bebidas pueden quedar en el carrito sin hamburguesa (y desaparecer sin aviso) · **Alta**
- **Dónde:** `app/page.js:485-489` (`removeFromCart` no aplica `enforceComplementRules`), `ProductAddToCart.js:16-48` (no valida la regla), `page.js:214-222` (al cargar se filtran en silencio).
- **Evidencia:** (a) quitar la hamburguesa deja las bebidas y el pedido se envía igual (el servidor no valida, SEC-05). (b) Agregar una bebida desde `/product/coca-cola` la guarda; al volver a `/` se elimina sin mensaje.
- **Recomendación:** misma función de dominio en todos los puntos de entrada + aviso al usuario cuando se retire algo.

### BUG-04 — El upsell nunca detecta guarniciones en el carrito · **Media**
- **Dónde:** `app/page.js:456`.
- **Causa:** compara con `"GUARNICION"`, pero la categoría es `"GUARNICIONES"`. `willHaveFries` siempre es `false` → el modal de sugerencias aparece aunque ya haya papas.
- **Recomendación:** usar constante de categoría, no string literal.

### BUG-05 — Horario calculado con la zona horaria del dispositivo · **Media**
- **Dónde:** `app/lib/openHours.js:12-46` (`getDay()`, `setHours()` locales).
- **Impacto:** un usuario con el teléfono en otra zona horaria (turistas, VPN, equipos mal configurados) ve "abierto/cerrado" incorrecto y puede o no puede pedir indebidamente.
- **Recomendación:** calcular en `America/Lima` (`Intl.DateTimeFormat` con `timeZone`) y validar también en servidor (SEC-05).

### BUG-06 — `getNextOpenDate` devuelve próxima apertura estando abierto (madrugada) · **Media**
- **Dónde:** `app/lib/openHours.js:66-71`.
- **Evidencia:** entre 00:00 y 01:00 `isOpenNow` = true, pero `getNextOpenDate` devuelve las 19:00 del mismo día. Hoy no se ve porque `ClosedNotice` no se muestra si está abierto, pero el valor se persiste en `bj_isOpen`.
- **Recomendación:** reutilizar `isOpenNow` dentro de `getNextOpenDate` + tests unitarios de bordes (00:30, 01:00, 18:59, 19:00).

### BUG-07 — El paso "Cliente" exige teléfono pero el envío no · **Media**
- **Dónde:** `CartDrawer.js:90-91` (≥ 9 dígitos para marcar el paso) vs. `submitOrder.js:66-68` (solo nombre).
- **Recomendación:** decidir si el teléfono es obligatorio (recomendado para delivery) y validar igual en UI, cliente y servidor.

### BUG-08 — Clases de animación sin plugin (`animate-in`, `zoom-in-95`, `slide-in-from-*`) · **Media**
- **Dónde:** `OrderConfirmation.js:22`, `ProductModal.js:29`, `SuggestionModal.js:33,35`.
- **Evidencia:** son utilidades de `tailwindcss-animate`/`tw-animate-css`, que **no** están instaladas. No hacen nada.
- **Recomendación:** instalar `tw-animate-css` o reemplazar por las animaciones propias de `globals.css`.

### BUG-09 — Registro en el ranking del Reto Gamer inaccesible · **Baja**
- **Dónde:** `app/reto-gamer/page.js:1045-1052` y `:1503`.
- **Causa:** al terminar la partida se autoguarda y se hace `setSubmitSuccess(true)`; el botón "¡REGISTRAR EN RANKING!" solo aparece si `!submitSuccess` → nunca se muestra. El modal con nombre/WhatsApp queda inalcanzable.
- **Recomendación:** decidir el alcance del juego (ver PRD §Preguntas abiertas) y simplificar o arreglar.

### BUG-10 — `localStorage` sin `try/catch` en rutas críticas · **Baja**
- **Dónde:** `page.js:275, 723-724`; `ProductAddToCart.js:20, 37-40`.
- **Impacto:** en Safari privado / cuota llena, lanza excepción; en `page.js:723` ocurre **después** de registrar el pedido (el pedido se crea pero la UI cae al `catch` y muestra error → el cliente reintenta → posible duplicado con otro `eventId`).
- **Recomendación:** wrapper `safeStorage` en `lib/`.

---

## 4. Datos inconsistentes (DATA)

### DATA-01 — Cuatro horarios distintos publicados · **Alta**
| Fuente | Horario mostrado |
| :--- | :--- |
| `app/data/menuData.js:10-18` (**lógica real** de abierto/cerrado y schema SEO) | Todos los días 19:00 – 01:00 |
| `app/page.js:769-770` (header desktop) | Lun–Jue 4:30–11 PM · Vie–Dom 5 PM–1 AM |
| `app/links/page.js:279-287` | Lun–Jue 4 PM–1 AM · Vie–Dom 5 PM–1 AM |
| `app/features/home/components/FooterSection.js:125-131` | Todos los días 18:00 – 01:00 |
- **Recomendación:** el dueño confirma el horario real; todas las vistas leen de `restaurantInfo.hours` con un formateador común.

### DATA-02 — Identidad legal y dirección contradictorias · **Alta**
- Razón social: "Big Jack Perú S.A.C." (`FooterSection.js:152`, `layout.js:51`) vs. "BIG JACK" (`libro-de-reclamaciones/page.js:67`). El RUC `15614908278` (`menuData.js:7`) empieza con `15`, prefijo que **no** corresponde a una S.A.C. (las personas jurídicas usan `20`).
- Dirección: "Centro de Lima" (`menuData.js:24`, hero, footer, textos SEO) vs. "Jr. Bartolomé Herrera 133, **Lince**" (`seo.js:88-89`, `links/page.js:125`). Lince no es Centro de Lima.
- **Recomendación:** confirmar con el dueño y centralizar en `restaurantInfo` (`legalName`, `ruc`, `address.street`, `address.district`).

### DATA-03 — Números de WhatsApp distintos · **Media**
- `menuData.js:21` → `51997722704` (el que usa la app). `docs/LINKS_PAGE.md` → `51970513912`. Placeholder del libro (`page.js:115`) → `970513912`.
- **Recomendación:** confirmar número oficial; actualizar docs y placeholder.

### DATA-04 — Tiempos de preparación distintos · **Media**
- "15 min" (`HeroSection.js:87`) vs. "15-20 min" (`CartDrawer.js:397`, `onlineOrders.js:23`, `ProductAddToCart.js:192`, FAQ).

### DATA-05 — Textos y métricas fijas que pueden ser falsos · **Media**
- `links/page.js:196` muestra **"ABIERTO"** siempre, aunque esté cerrado.
- `links/page.js:222` muestra rating **"4.9"** fijo.
- `product/[slug]/page.js:111-114` badge "Premium" en todos los productos (incluida el agua).
- Placeholder del buscador "smash, tocino" (`CategoryFilter.js:62`) contradice la FAQ ("no smash") y el menú usa "bacon".
- **Recomendación:** derivar de datos reales o eliminar.

### DATA-06 — URL del sitio definida en 4 lugares · **Baja**
- `DEFAULT_SITE_URL` (`constants.js:20`), `NEXT_PUBLIC_BASE_URL` (`layout.js:34`, `robots.js:2`, `sitemap.js:4`) y literal en `layout.js:61`. El schema JSON-LD usa la constante y ignora la variable de entorno.

### DATA-07 — Comentarios desactualizados · **Baja**
- `page.js:166`: "tarjeta deshabilitada" — la tarjeta está habilitada.
- `menuData.js:1-2`: "Solo cambia los textos entre comillas" — también hay SKUs/precios que deben coincidir con el ERP.

---

## 5. Código muerto u olvidado (DEAD)

| ID | Qué | Dónde | Severidad |
| :--- | :--- | :--- | :-: |
| DEAD-01 | Assets referenciados **que no existen**: `/images/og-bigjack.png` (OG/Twitter/schema), `/web-app-manifest-192x192.png` y `-512x512.png` (PWA), `/images/big-jack-logo.png` (`restaurantInfo.logo`). Solo existe `public/images/sincomprimir/og-bigjack.png`. | `layout.js:67,78`, `seo.js:80`, `manifest.json`, `menuData.js:19` | Media |
| DEAD-02 | Clases CSS usadas que **no existen**: `warning-border`, `tape-corner-tr`, `cuidado-badge` (detalle de producto), `animate-pulse-slow` (footer). | `product/[slug]/page.js:81,82,92`, `FooterSection.js:106` | Media |
| DEAD-03 | `MenuGridSkeleton` y `ProductCardSkeleton` nunca se importan (la doc dice que están integrados). | `features/home/components/` | Baja |
| DEAD-04 | Sistema de toasts a medias: prop `onToast` nunca se pasa (siempre cae a `alert`/`confirm`); CSS `.toast-*` sin uso. | `CartDrawer.js:88-127`, `globals.css:232-249` | Baja |
| DEAD-05 | `links/metadata.js` no se importa (Next no lee `metadata.js` por convención) → `/links` no tiene metadata propia. | `app/links/metadata.js` | Baja |
| DEAD-06 | `localStorage.bj_isOpen` se escribe cada segundo y nadie lo lee. | `page.js:255` | Baja |
| DEAD-07 | CSS sin uso: `.glass-panel`, `.gold-glow`, `.fade-in-stagger`, `.border-streetwear(-gold)`, `.font-signature`, `header.scrolled`, `@keyframes shrink-header-padding`; `:focus-visible` duplicado. | `globals.css` | Baja |
| DEAD-08 | Lógica muerta: `deliveryAvailable` siempre `true` (`page.js:311,630`); `orderType` persistido siempre vuelve a `pickup` (`page.js:197-201`); rama `startsWith("+")` imposible (`page.js:51`); imports sin uso (`Flame`, `useState`/`imgError` en `HeroSection.js`, `Flame` en `CategoryFilter.js`, `getPlayerRank`/`CATEGORIES` en `reto-gamer/page.js:5`). | varios | Baja |
| DEAD-09 | Imágenes sin uso o duplicadas: `public/images/sincomprimir/` (**7.1 MB servidos públicamente**), `choripan.webp`; `grilljack.webp` solo aparece en el schema SEO pero no es un producto. | `public/images/` | Baja |
| DEAD-10 | `app/reto-gamer/leaderboard.js`: "ranking" de un solo registro local; `generateHash`/checksum "anti-cheat" sin valor (todo es editable en el cliente). | `leaderboard.js`, `reto-gamer/page.js:1021-1041` | Baja |

---

## 6. Calidad de código / malas prácticas (QLT)

### QLT-01 — `app/page.js` es un "god component" · **Media**
968 líneas, ~35 `useState`, helpers de dominio (mensaje de WhatsApp, recordatorios de pago, errores) definidos **dentro** del componente y recreados en cada render. `CartDrawer` recibe **40 props**. Constantes importables (`PRIMARY_CATEGORIES`, `PEDIDOSYA_LINK`…) se pasan como props.
→ Extraer `useCart`, `useCheckoutForm`, `useOpenStatus`; mover builders puros a `features/home/checkout/`.

### QLT-02 — Lógica duplicada · **Media**
- Catálogo de SKUs activos construido 3 veces (`route.js:27-46`, `submitOrder.js:5-24`, script PS1).
- Agregar al carrito: `page.js:409-474` vs. `ProductAddToCart.js:16-48`.
- Timer de apertura con `setInterval(1000)`: `page.js:246-260` y `ProductAddToCart.js:61-73`.
- Rango de precios: `seo.js:3-16`, `product/[slug]/page.js:41-49`, `ProductCard.js:27-30`.
- Etiquetas de métodos de pago: `page.js:41-46`, `page.js:101-106`, `CartDrawer.js:414-419`.
- `https://wa.me/${...}` armado en ≥ 8 lugares.
→ Un módulo de dominio por concepto (`catalog`, `cart`, `openHours`, `contact`).

### QLT-03 — `alert()`/`confirm()` como UX (13 usos) · **Media**
Bloquean el hilo, no son accesibles ni personalizables, y rompen automatización de navegador.
→ Toast/inline errors (retomar DEAD-04).

### QLT-04 — Errores tragados en silencio (8 `catch {}` vacíos) · **Media**
`page.js:208,226,233,255,382,499`, `ClientSearchParams.js:13`, etc.
→ Al menos `console.warn` en desarrollo; wrapper `safeStorage`.

### QLT-05 — Todas las páginas son Client Components · **Media**
`/`, `/links`, `/quienes`, `/libro-de-reclamaciones`, `/reto-gamer` usan `"use client"` en la raíz. Consecuencias: no pueden exportar `metadata` (SEO-02), más JS al navegador; `/links` muestra un spinner hasta montar (`links/page.js:53-58,164-170`) → el HTML servido es solo un spinner.
→ Página server + islas cliente solo donde haya interactividad.

### QLT-06 — Sin tests ni tipos · **Media**
Reglas de negocio críticas (horario, carrito, payload, validación) sin pruebas. JS sin JSDoc ni TypeScript.
→ Vitest para `lib/` y `features/home/checkout/`; JSDoc o migración incremental a TS.

### QLT-07 — Categorías como identificadores · **Baja**
Strings de UI ("LAS INTOCABLES", "TODOS") usados como claves lógicas; causa directa de BUG-04.
→ `id` estable + `label`.

### QLT-08 — Estilos con colores hex literales repetidos · **Baja**
`#FCC900` aparece cientos de veces; existen variables CSS (`--potencia-amarillo`, `--bj-accent`) que no se usan. Ver `DESIGN.md`.

### QLT-09 — `MenuGrid` renderiza dos árboles completos (móvil y desktop) · **Baja**
`MenuGrid.js:206-252`: ambos se montan y se ocultan con CSS → doble DOM, doble `<Image>`, contenido duplicado para buscadores.

### QLT-10 — Mezcla de idiomas y sin tildes en mensajes · **Baja**
Mensajes al usuario sin tildes ("presentacion", "exito", "Vacialo") junto a otros con tildes.

---

## 7. Rendimiento (PERF)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| PERF-01 | `setInterval` de 1 s en `/` re-renderiza todo el árbol del menú (y escribe `localStorage`) cada segundo; también en `/product/*`. Basta 30–60 s o calcular el próximo cambio de estado. | Media |
| PERF-02 | `burger_hero.png` de 862 KB como imagen LCP con `priority`; `bigjacklogotipo.png` 202 KB sin uso aparente. Convertir a WebP/AVIF. | Media |
| PERF-03 | Ruta `/` completamente cliente: el JS de toda la página (modales, drawer, mapa) se descarga de entrada. Usar `next/dynamic` para modales/drawer/mapa. | Baja |
| PERF-04 | `/reto-gamer` (1.670 líneas) es una sola unidad; aceptable al ser ruta aislada, pero cualquier cambio es costoso. | Baja |

## 8. Accesibilidad (A11Y)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| A11Y-01 | Modales/drawer sin *focus trap*, sin cerrar con `Esc`, sin devolver el foco (`CartDrawer`, `ProductModal`, `SuggestionModal`, `OrderConfirmation`, `ClosedNotice`). | Media |
| A11Y-02 | Inputs sin `<label>` asociado: checkout usa solo `placeholder`; en el Libro de Reclamaciones los `<label>` no tienen `htmlFor` (0 usos en el repo). | Media |
| A11Y-03 | `SecureMap` bloquea clic derecho y copiar; enlaces solo-icono del footer usan `title` en vez de `aria-label`. | Media |
| A11Y-04 | `CategoryFilter` usa `sticky top-[73px]` fijo, pero el header móvil es más alto (tiene una fila extra de acciones) → la barra puede quedar tapada. **Verificar en dispositivo.** | Baja |

## 9. SEO

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| SEO-01 | Imagen OG/Twitter rota (`/images/og-bigjack.png` no existe) → previews sin imagen en WhatsApp/redes. | Alta |
| SEO-02 | `/links`, `/quienes`, `/libro-de-reclamaciones`, `/reto-gamer` sin `title`/`description` propios (Client Components, ver QLT-05). | Media |
| SEO-03 | `verification.google: 'your-google-verification-code'` (placeholder en producción, `layout.js:92`). | Media |
| SEO-04 | Dirección/NAP inconsistente entre schema y contenido (DATA-02); `keywords` incluye "hamburguesas lince" y "centro de lima" a la vez. | Baja |

## 10. Operación / tooling (OPS)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| OPS-01 | `scripts/test-webhook-orders.ps1` apunta por defecto al **ERP de producción** (`:28`) y su caso 1 crea una **venta real** y descuenta inventario. Solo PowerShell. | Alta |
| OPS-02 | Sin CI (lint/build/audit en cada PR) ni tests. | Media |
| OPS-03 | `.env.example` incompleto: falta `FORMSPREE_URL`, `NEXT_PUBLIC_BASE_URL`. | Media |
| OPS-04 | Sin `engines` en `package.json` ni `.nvmrc`; el entorno local usa Node 26 (`module.register()` deprecation warning en build). | Baja |

## 11. Documentación (DOC)

### DOC-01 — Documentos existentes con afirmaciones falsas · **Media** <a id="doc-01"></a>
- `SECURITY_AND_TECH_DEBT.md §3.2`: "Verificación estricta de idempotencia mediante `eventId`" → el proxy solo verifica que exista; la idempotencia la aplica el ERP.
- `UI_UX_OVERHAUL_WALKTHROUGH.md`: "Skeleton Loaders creados e integrados" → no se usan (DEAD-03). "0 advertencias" es cierto, pero no implica ausencia de bugs.
- `README.md`: "real-time catalog management" → el catálogo es un archivo estático.
- `LINKS_PAGE.md`: describe "Programa de Lealtad" y un WhatsApp que no existen en la página actual.

### DOC-02 — Rutas absolutas `file:///home/sjaquer/...` en docs · **Baja**
Los enlaces de `SECURITY_AND_TECH_DEBT.md` y `UI_UX_OVERHAUL_WALKTHROUGH.md` solo funcionan en una máquina.
