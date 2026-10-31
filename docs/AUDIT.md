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
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades (resuelto en Fase 0, ver [SEC-01](#sec-01)). |
| Tests automatizados | ❌ No existen. |
| CI | ❌ No existe. |
| Secretos en historial git | ✅ No se encontraron credenciales reales. |

## Resuelto

### Fase 0 — Parches urgentes (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| SEC-01 | `next@16.4.3`, `eslint-config-next@16.4.3` y `nodemailer@10.2.1`; `npm audit --omit=dev` = 0. |
| SEC-08 | Eliminados `placehold.co` e `images.unsplash.com` de `images.remotePatterns`. |
| LEG-01 | `sendComplaint` devuelve `success:false` en producción sin canal de entrega; modo simulado solo fuera de producción. Se quitó el fallback `NEXT_PUBLIC_FORMSPREE_URL`. |
| LEG-03 | Eliminada la descripción hardcodeada de opciones; solo se muestra `option.description` si existe. |
| OPS-01 | El script PS1 apunta por defecto a `http://localhost:3000/api/online-orders` y advierte en su cabecera. |
| SEO-01 | Creada `public/images/og-bigjack.png` (1200×630, 269 KB). |
| DEAD-01 | Resuelta la parte de OG. |

### Fase 4 (parcial) — Assets (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| DEAD-01 | Generados `web-app-manifest-192x192.png` y `-512x512.png`; `restaurantInfo.logo` apunta a un archivo existente; manifest con `any maskable`. |

### Fase 3 — Carrito y checkout (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| BUG-01 | `ClientSearchParams` abre el carrito una sola vez y limpia `?openCart` con `router.replace("/")`. |
| BUG-02 | `cartModel.addItem` aplica tope por ítem y total; usado en home, modal, upsell y página de producto. |
| BUG-03 | Regla de complementos al quitar ítems y en la página de producto, con aviso al usuario. |
| BUG-04 | Corregido `"GUARNICION"` con la constante `SIDES_CATEGORY`. |
| BUG-05 | Horario calculado en `America/Lima` (UTC-5), independiente de la zona del dispositivo. |
| BUG-06 | `getNextOpenDate` devuelve `null` si está abierto y calcula la próxima apertura real. |
| BUG-08 | Instalado `tw-animate-css` e importado en `globals.css`. |
| BUG-10 | Nuevo `lib/safeStorage.js`; se eliminaron los `localStorage` sin protección en el flujo de compra. |

### Fase 5 (parcial) — Base de calidad (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| OPS-02 | CI en `.github/workflows/ci.yml` (lint, test, build, audit) y `npm test` con Vitest. |
| OPS-04 | `engines.node >=20.9.0` y `.nvmrc` con Node 24 LTS. |
| QLT-06 | 34 tests unitarios de `openHours`, `cartModel`, `cartRules` y `onlineOrders`; faltan los módulos de Fase 2. |

### Fase 6 (parcial) — Hooks y presupuesto (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| QLT-01 | `page.js` bajó de 996 a 5 líneas (Server Component) y el estado pasó a `HomeClient`; hooks y `checkout/orderMessages.js` extraídos. |
| QLT-11 | `SiteHeader` compartido entre home y producto; excepción de `max-lines` actualizada a `HomeClient.js`. |
| QLT-11 | Regla `max-lines` (300) activa con excepción explícita para los 5 archivos pendientes. |
| PERF-01 | El estado abierto/cerrado del home se refresca cada 30 s y al volver a la pestaña. |
| DEAD-06 | Eliminada la escritura de `bj_isOpen`; `useOpenStatus` no toca `localStorage`. |

### Fase 8 — Limpieza (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| DEAD-02 | Eliminadas clases inexistentes (`warning-border`, `tape-corner-tr`, `cuidado-badge`, `animate-pulse-slow`). |
| DEAD-03 | Borrados `MenuGridSkeleton` y `ProductCardSkeleton` (no se importaban). |
| DEAD-07 | Eliminados CSS sin uso y el `:focus-visible` duplicado. |
| DEAD-08 | Eliminados `deliveryAvailable`, la rama imposible de `normalizePhoneForDisplay`, `bj_isOpen`, `orderType` persistido e imports sin uso. |
| DEAD-09 | `sincomprimir/` movido a `design-assets/` (fuera de `public/` e ignorado); borrados `choripan.webp`, `grilljack.webp` y `bigjacklogotipo.png`. |
| DOC-01 | README y documentos históricos ya advierten su estado; se corrigió la versión del badge. |
| DOC-02 | Reemplazadas las rutas `file:///home/sjaquer/...` por rutas relativas. |

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
| Calidad / malas prácticas (QLT) | 0 | 0 | 7 | 4 | 11 |
| Rendimiento (PERF) | 0 | 0 | 2 | 2 | 4 |
| Accesibilidad (A11Y) | 0 | 0 | 3 | 1 | 4 |
| SEO | 0 | 1 | 2 | 1 | 4 |
| Operación / tooling (OPS) | 0 | 1 | 2 | 1 | 4 |
| Documentación (DOC) | 0 | 0 | 1 | 1 | 2 |

> Los conteos corresponden a la auditoría original; el estado actualizado está en [Resuelto](#resuelto).

---

## 1. Seguridad (SEC)

### SEC-01 — Next.js con vulnerabilidades críticas (RCE) · **Crítica** · ✅ Resuelto (Fase 0)
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

### SEC-08 — `remotePatterns` de imágenes innecesarios · **Media** · ✅ Resuelto (Fase 0)
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

### LEG-01 — Reclamos se "registran" con éxito aunque no se envíen a nadie · **Crítica** · ✅ Resuelto (Fase 0)
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

### LEG-03 — Información de producto engañosa en la página de detalle · **Alta** · ✅ Resuelto (Fase 0)
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

### BUG-01 — Con `?openCart=true` el carrito no se puede cerrar · **Alta** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/features/home/components/ClientSearchParams.js:8-14` + `app/page.js:838`.
- **Causa:** `onOpenCart={() => setIsCartOpen(true)}` crea una función nueva en cada render; el `useEffect` depende de ella, así que tras **cada** render (cerrar el carrito, escribir en un input, el timer de 1 s) vuelve a abrir el carrito. La página de producto navega a `/?openCart=true` (`ProductAddToCart.js:53`, `product/[slug]/page.js:67`).
- **Recomendación:** ejecutar una sola vez (ref de "ya abierto") y limpiar el parámetro con `router.replace("/")`.

### BUG-02 — Se puede exceder el máximo por producto y el pedido falla al final · **Alta** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/page.js:432-444` (`quantity: item.quantity + 1` sin tope), `ProductAddToCart.js:132` (sin tope), `handleConfirmSuggestions` (`page.js:546-579`).
- **Evidencia:** `MAX_QTY_PER_ITEM = 10` solo se respeta en el botón "+" del drawer. Agregando desde la tarjeta, la página de producto o el upsell se supera; luego `submitOnlineOrder` lanza "La cantidad máxima…" en el último paso.
- **Recomendación:** centralizar `addItem(cart, item, qty)` en `lib/cartModel.js` que aplique tope por ítem y total (`MAX_CART_ITEMS`).

### BUG-03 — Bebidas pueden quedar en el carrito sin hamburguesa (y desaparecer sin aviso) · **Alta** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/page.js:485-489` (`removeFromCart` no aplica `enforceComplementRules`), `ProductAddToCart.js:16-48` (no valida la regla), `page.js:214-222` (al cargar se filtran en silencio).
- **Evidencia:** (a) quitar la hamburguesa deja las bebidas y el pedido se envía igual (el servidor no valida, SEC-05). (b) Agregar una bebida desde `/product/coca-cola` la guarda; al volver a `/` se elimina sin mensaje.
- **Recomendación:** misma función de dominio en todos los puntos de entrada + aviso al usuario cuando se retire algo.

### BUG-04 — El upsell nunca detecta guarniciones en el carrito · **Media** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/page.js:456`.
- **Causa:** compara con `"GUARNICION"`, pero la categoría es `"GUARNICIONES"`. `willHaveFries` siempre es `false` → el modal de sugerencias aparece aunque ya haya papas.
- **Recomendación:** usar constante de categoría, no string literal.

### BUG-05 — Horario calculado con la zona horaria del dispositivo · **Media** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/lib/openHours.js:12-46` (`getDay()`, `setHours()` locales).
- **Impacto:** un usuario con el teléfono en otra zona horaria (turistas, VPN, equipos mal configurados) ve "abierto/cerrado" incorrecto y puede o no puede pedir indebidamente.
- **Recomendación:** calcular en `America/Lima` (`Intl.DateTimeFormat` con `timeZone`) y validar también en servidor (SEC-05).

### BUG-06 — `getNextOpenDate` devuelve próxima apertura estando abierto (madrugada) · **Media** · ✅ Resuelto (Fase 3)
- **Dónde:** `app/lib/openHours.js:66-71`.
- **Evidencia:** entre 00:00 y 01:00 `isOpenNow` = true, pero `getNextOpenDate` devuelve las 19:00 del mismo día. Hoy no se ve porque `ClosedNotice` no se muestra si está abierto, pero el valor se persiste en `bj_isOpen`.
- **Recomendación:** reutilizar `isOpenNow` dentro de `getNextOpenDate` + tests unitarios de bordes (00:30, 01:00, 18:59, 19:00).

### BUG-07 — El paso "Cliente" exige teléfono pero el envío no · **Media**
- **Dónde:** `CartDrawer.js:90-91` (≥ 9 dígitos para marcar el paso) vs. `submitOrder.js:66-68` (solo nombre).
- **Recomendación:** decidir si el teléfono es obligatorio (recomendado para delivery) y validar igual en UI, cliente y servidor.

### BUG-08 — Clases de animación sin plugin (`animate-in`, `zoom-in-95`, `slide-in-from-*`) · **Media** · ✅ Resuelto (Fase 3)
- **Dónde:** `OrderConfirmation.js:22`, `ProductModal.js:29`, `SuggestionModal.js:33,35`.
- **Evidencia:** son utilidades de `tailwindcss-animate`/`tw-animate-css`, que **no** están instaladas. No hacen nada.
- **Recomendación:** instalar `tw-animate-css` o reemplazar por las animaciones propias de `globals.css`.

### BUG-09 — Registro en el ranking del Reto Gamer inaccesible · **Baja**
- **Dónde:** `app/reto-gamer/page.js:1045-1052` y `:1503`.
- **Causa:** al terminar la partida se autoguarda y se hace `setSubmitSuccess(true)`; el botón "¡REGISTRAR EN RANKING!" solo aparece si `!submitSuccess` → nunca se muestra. El modal con nombre/WhatsApp queda inalcanzable.
- **Recomendación:** decidir el alcance del juego (ver PRD §Preguntas abiertas) y simplificar o arreglar.

### BUG-10 — `localStorage` sin `try/catch` en rutas críticas · **Baja** · ✅ Resuelto (Fase 3)
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
- ✅ `product/[slug]` ya no muestra un badge "Premium" fijo (Fase 6.6).
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
| DEAD-01 | ✅ Resuelto: OG (Fase 0), íconos PWA 192/512 y `restaurantInfo.logo` (Fase 4.4). | `manifest.json`, `menuData.js:19` | Media |
| DEAD-02 | ✅ Resuelto (Fases 8 y 6.6): detalle de producto unificado con Anton, `#FCC900`, clases de marca e iconos lucide, sin emojis. | — | Media |
| DEAD-03 | ✅ Resuelto (Fase 8): componentes eliminados. | — | Baja |
| DEAD-04 | Sistema de toasts a medias: prop `onToast` nunca se pasa (siempre cae a `alert`/`confirm`); CSS `.toast-*` sin uso. **Resuelto en Fase 6.4** con `useToast` + `Toast`. | `CartDrawer.js`, `globals.css` | Baja |
| DEAD-05 | `links/metadata.js` no se importa (Next no lee `metadata.js` por convención) → `/links` no tiene metadata propia. | `app/links/metadata.js` | Baja |
| DEAD-06 | ✅ Resuelto (Fase 6): `useOpenStatus` actualiza cada 30 s sin escribir `localStorage`. | `hooks/useOpenStatus.js` | Baja |
| DEAD-07 | ✅ Resuelto (Fase 8): CSS sin uso y `:focus-visible` duplicado eliminados. | `globals.css` | Baja |
| DEAD-08 | ✅ Resuelto (Fase 8): eliminados `deliveryAvailable`, `orderType` persistido, `bj_isOpen`, la rama imposible de `normalizePhoneForDisplay` y los imports sin uso. | varios | Baja |
| DEAD-09 | ✅ Resuelto (Fase 8): `sincomprimir/` movido a `design-assets/` (ignorado) y eliminadas las imágenes huérfanas. | `public/images/` | Baja |
| DEAD-10 | `app/reto-gamer/leaderboard.js`: "ranking" de un solo registro local; `generateHash`/checksum "anti-cheat" sin valor (todo es editable en el cliente). | `leaderboard.js`, `reto-gamer/page.js:1021-1041` | Baja |

---

## 6. Calidad de código / malas prácticas (QLT)

### QLT-01 — `app/page.js` es un "god component" · **Media** · ✅ Resuelto (Fase 6)
`app/page.js` quedó en 5 líneas como Server Component que compone `HomeClient`. El estado y el markup viven en `HomeClient` (711 líneas), pendiente de nuevas extracciones. `CartDrawer` ya no recibe props, consume `CartContext` (6.3) y se dividió en `components/cart/` (6.8).

### QLT-02 — Lógica duplicada · **Media**
- Catálogo de SKUs activos construido 3 veces (`route.js:27-46`, `submitOrder.js:5-24`, script PS1).
- Agregar al carrito: `page.js:409-474` vs. `ProductAddToCart.js:16-48`.
- Timer de apertura con `setInterval(1000)`: `page.js:246-260` y `ProductAddToCart.js:61-73`.
- Rango de precios: `seo.js:3-16`, `product/[slug]/page.js:41-49`, `ProductCard.js:27-30`.
- Etiquetas de métodos de pago: `page.js:41-46`, `page.js:101-106`, `CartDrawer.js:414-419`.
- `https://wa.me/${...}` armado en ≥ 8 lugares.
→ Un módulo de dominio por concepto (`catalog`, `cart`, `openHours`, `contact`).

### QLT-03 — `alert()`/`confirm()` como UX (13 usos) · **Media** · ✅ Resuelto en home (Fase 6)
Home y `CartDrawer` usan `useToast` + `Toast` (info/success/error/confirm accesible, autocierre a 5 s). Queda un `alert` en `reto-gamer/leaderboard.js`, bloqueado por D7.

### QLT-04 — Errores tragados en silencio (8 `catch {}` vacíos) · **Media**
`page.js:208,226,233,255,382,499`, `ClientSearchParams.js:13`, etc.
→ Al menos `console.warn` en desarrollo; wrapper `safeStorage`.

### QLT-05 — Todas las páginas son Client Components · **Media** · ⚠️ Parcial (Fase 6)
`/` ya es un Server Component que compone `HomeClient`; `/product/[slug]` también era server. `/links`, `/quienes`, `/libro-de-reclamaciones` y `/reto-gamer` siguen con `"use client"` en la raíz, sin `metadata` propia y con más JS al navegador.
→ Terminar 6.10, 6.11 y 6.12 (bloqueada por D7).

### QLT-06 — Sin tests ni tipos · **Media** · ⚠️ Parcial (Fase 5)
Reglas de negocio críticas (horario, carrito, payload, validación) sin pruebas. JS sin JSDoc ni TypeScript.
→ Vitest para `lib/` y `features/home/checkout/`; JSDoc o migración incremental a TS.
Hecho: 34 tests de `openHours`, `cartModel`, `cartRules` y `onlineOrders`. Pendiente: `orderRules`, `catalog` y validaciones del checkout.

### QLT-07 — Categorías como identificadores · **Baja**
Strings de UI ("LAS INTOCABLES", "TODOS") usados como claves lógicas; causa directa de BUG-04.
→ `id` estable + `label`.

### QLT-08 — Estilos con colores hex literales repetidos · **Baja**
`#FCC900` aparece cientos de veces; existen variables CSS (`--potencia-amarillo`, `--bj-accent`) que no se usan. Ver `DESIGN.md`.

### QLT-09 — `MenuGrid` renderiza dos árboles completos (móvil y desktop) · **Baja** · ✅ Resuelto (Fase 6)
`MenuGrid` usa un solo árbol de `CategoryCarousel` en todos los tamaños; se eliminó el grid móvil duplicado (doble DOM e imágenes).

### QLT-10 — Mezcla de idiomas y sin tildes en mensajes · **Baja**
Mensajes al usuario sin tildes ("presentacion", "exito", "Vacialo") junto a otros con tildes.

### QLT-11 — Monolitos: archivos que mezclan varias responsabilidades · **Media**
QLT-01 es el caso más visible, pero no el único. Archivos que juntan UI, estado, reglas de negocio y datos en una sola unidad:

| Archivo | Líneas | Qué mezcla |
| :--- | :-: | :--- |
| `app/reto-gamer/page.js` | 1.670 | Motor del juego (clases `Player`, `Boss`, `Bullet`, colisiones, oleadas, power-ups) dentro de un `useEffect` de ~1.180 líneas + HUD + 4 pantallas/modales + ranking. |
| `app/page.js` | 968 | Ver QLT-01: 32 `useState`, 8 `useEffect`, carrito, checkout, geolocalización, builders de WhatsApp y todo el markup del header. |
| ~~`app/features/home/components/CartDrawer.js`~~ | 90 | Resuelto en 6.8: divide en `components/cart/` (`CartItemList`, `CustomerStep`, `DeliveryStep`, `PaymentStep`, `CartSummary`, `ItemThumb`). |
| `app/libro-de-reclamaciones/page.js` | 315 | Página completa como Client Component; las 3 secciones del formulario y el estado de envío juntos. |
| `app/links/page.js` | 304 | 5 íconos SVG inline (duplicados en el footer), datos de enlaces, horarios y estado en un archivo cliente. |
| ~~`app/features/home/components/MenuGrid.js`~~ | 91 | Resuelto en 6.5: carrusel extraído a `CategoryCarousel.js`; ya no duplica árboles. |
| `app/api/online-orders/route.js` | 243 | Rate-limit, catálogo, validación de reglas, normalización del payload y cliente HTTP del ERP en un handler. |

Consecuencias: cambios pequeños tocan archivos enormes (conflictos de merge, revisiones difíciles), la lógica no se puede testear sin montar la UI, y la misma regla termina copiada en varios lugares (QLT-02).
→ Ver Fase 6 del plan: presupuesto de tamaño por archivo, separar dominio puro / hooks / componentes de presentación, y componentes compartidos en `app/components/`.

---

## 7. Rendimiento (PERF)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| PERF-01 | ✅ Resuelto (Fase 6): `/` y `/product/*` usan `useOpenStatus` (30 s + `visibilitychange`). | Media |
| PERF-02 | `burger_hero.png` de 862 KB como imagen LCP con `priority`. Convertir a WebP/AVIF. (El PNG de logo sin uso se eliminó en Fase 8.) | Media |
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
| SEO-01 | ✅ Resuelto (Fase 0): `/images/og-bigjack.png` (1200×630) ya existe. | Alta |
| SEO-02 | `/links`, `/quienes`, `/libro-de-reclamaciones`, `/reto-gamer` sin `title`/`description` propios (Client Components, ver QLT-05). | Media |
| SEO-03 | `verification.google: 'your-google-verification-code'` (placeholder en producción, `layout.js:92`). | Media |
| SEO-04 | Dirección/NAP inconsistente entre schema y contenido (DATA-02); `keywords` incluye "hamburguesas lince" y "centro de lima" a la vez. | Baja |

## 10. Operación / tooling (OPS)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| OPS-01 | ✅ Resuelto (Fase 0): el script apunta por defecto a localhost. Pendiente el script multiplataforma (5.4). | Alta |
| OPS-02 | ✅ Resuelto (Fase 5): CI en `.github/workflows/ci.yml`; tests con Vitest. | Media |
| OPS-03 | `.env.example` incompleto: falta `FORMSPREE_URL`, `NEXT_PUBLIC_BASE_URL`. | Media |
| OPS-04 | ✅ Resuelto (Fase 5): `engines.node >=20.9.0` y `.nvmrc` con Node 24 LTS. | Baja |

## 11. Documentación (DOC)

### DOC-01 — Documentos existentes con afirmaciones falsas · **Media** · ✅ Resuelto (Fase 8) <a id="doc-01"></a>
- `SECURITY_AND_TECH_DEBT.md §3.2`: "Verificación estricta de idempotencia mediante `eventId`" → el proxy solo verifica que exista; la idempotencia la aplica el ERP.
- `UI_UX_OVERHAUL_WALKTHROUGH.md`: "Skeleton Loaders creados e integrados" → no se usan (DEAD-03). "0 advertencias" es cierto, pero no implica ausencia de bugs.
- `README.md`: "real-time catalog management" → el catálogo es un archivo estático.
- `LINKS_PAGE.md`: describe "Programa de Lealtad" y un WhatsApp que no existen en la página actual.

### DOC-02 — Rutas absolutas `file:///home/sjaquer/...` en docs · **Baja** · ✅ Resuelto (Fase 8)
Los enlaces de `SECURITY_AND_TECH_DEBT.md` y `UI_UX_OVERHAUL_WALKTHROUGH.md` solo funcionan en una máquina.
