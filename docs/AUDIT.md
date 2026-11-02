# Auditoría técnica — Big Jack Menu

**Fecha original:** 2026-10-24 · **Última actualización:** 2026-11-02
**Alcance:** todo el repositorio (`app/`, `public/`, `scripts/`, `docs/`, configuración y dependencias). La auditoría original se hizo sobre el commit `cff53d7`; el estado actual se verificó sobre `master`.
**Método:** lectura completa del código fuente, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev`, `npm outdated`, búsqueda de símbolos/clases sin uso y de secretos en el historial de git.

> Este documento **reemplaza** como fuente de verdad a `docs/SECURITY_AND_TECH_DEBT.md` y `docs/UI_UX_OVERHAUL_WALKTHROUGH.md`, que contienen afirmaciones que no se cumplen en el código actual (ver [DOC-01](#doc-01)).
> El plan para corregir cada hallazgo está en [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md). Las fichas de abajo conservan el diagnóstico original; el estado ✅/⚠️/❌ refleja la verificación del **2026-11-02**.

## Estado de verificación

| Chequeo | Resultado |
| :--- | :--- |
| `npm run build` | ✅ Compila (rutas estáticas + `/api/online-orders` dinámica). |
| `npm run lint` | ✅ 0 errores, 0 advertencias. |
| `npm test` | ✅ 94 tests en 12 archivos (Vitest). |
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades. Quedan avisos moderados de desarrollo en la cadena de ESLint (riesgo aceptado). |
| CI | ✅ `.github/workflows/ci.yml` (lint, test, build, audit). |
| Secretos en historial git | ✅ No se encontraron credenciales reales. |

## Estado actual de hallazgos (2026-11-02)

### Cerrados

| Área | IDs cerrados |
| :--- | :--- |
| Seguridad | SEC-01, SEC-02, SEC-03, SEC-05, SEC-07, SEC-08, SEC-09, SEC-10, SEC-12 |
| Legal | LEG-01, LEG-03, LEG-04 |
| Bugs | BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-08, BUG-09, BUG-10 |
| Datos | DATA-01, DATA-03, DATA-04, DATA-05, DATA-06 |
| Código muerto | DEAD-01 … DEAD-10 |
| Calidad | QLT-01, QLT-02, QLT-03, QLT-05, QLT-06, QLT-08, QLT-09 |
| Rendimiento | PERF-01, PERF-02, PERF-03, PERF-04 |
| Accesibilidad | A11Y-01, A11Y-02, A11Y-03, A11Y-04 |
| SEO | SEO-01, SEO-02, SEO-03, SEO-04 |
| Operación | OPS-02, OPS-03, OPS-04 |
| Documentación | DOC-01, DOC-02 |

### Abiertos o parciales

| ID | Estado | Qué falta |
| :--- | :-: | :--- |
| SEC-04 | ⚠️ | Rate-limit persistente (Upstash/Vercel KV o Vercel Firewall). Hoy es un `Map` en memoria por instancia. |
| SEC-06 | ⚠️ | Turnstile, rate-limit y validación de longitudes en el Libro de Reclamaciones. Se resuelve al reactivarlo (enero 2027). |
| SEC-11 | ⚠️ | Dejar un solo nombre por variable secreta cuando se confirme el usado en Vercel. |
| LEG-02 | ⚠️ | Libro conforme: número correlativo, copia al consumidor, fecha del incidente, campos del reglamento y persistencia (Fase 1). |
| BUG-07 | ⚠️ | Decidir si el teléfono es obligatorio (D6). Hoy es opcional en UI, cliente y servidor. |
| DATA-02 | ⚠️ | Confirmar razón social y RUC (D2). La dirección ya está centralizada. |
| DATA-07 | ⚠️ | Quedan textos/comentarios sin tildes en mensajes internos (p. ej. "Vacialo", "menu" en `submitOrder.js`). |
| QLT-04 | ⚠️ | Quedan algunos `catch` silenciosos fuera de las rutas críticas. |
| QLT-10 | ⚠️ | Mezcla de idioma/tildes en mensajes internos del payload y del juego. |
| QLT-07 | ⚠️ | Las categorías internas siguen siendo strings estables; migrar a `id` + `label` es opcional. |
| QLT-11 | ⚠️ | Solo `ComplaintForm.js` (302 líneas) supera el presupuesto de 300; tiene excepción explícita en ESLint hasta la Fase 1. |
| OPS-01 | ⚠️ | El script de prueba del webhook sigue siendo PowerShell; falta la versión Node multiplataforma. |
| E.1–E.3 | ⚠️ | RUC, Libro de Reclamaciones y posible retorno de PedidosYa: enero 2027. |

## Resuelto

### Fase 0 — Parches urgentes (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| SEC-01 | `next@16.4.3`, `eslint-config-next@16.4.3` y `nodemailer@10.3.1`; `npm audit --omit=dev` = 0. |
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
| QLT-06 | 94 tests unitarios en 12 archivos (dominio, checkout, analítica, Turnstile y juego); CI en verde. |

### Fase 6 (parcial) — Hooks y presupuesto (2026-10-24)

| ID | Cambio |
| :--- | :--- |
| QLT-01 | `app/(shop)/page.js` quedó como Server Component de 22 líneas; el estado vive en `ShopProvider` y hooks pequeños. |
| QLT-11 | `SiteHeader` compartido vía layout `(shop)`; `max-lines` (300) activa con una sola excepción (`ComplaintForm.js`). |
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

### Rediseño y SEO/IA (2026-10-31)

| ID | Cambio |
| :--- | :--- |
| DATA-01 | Horario único: footer, ubicación, `/links`, FAQ, `llms.txt` y JSON-LD leen `restaurantInfo.hours` vía `lib/schedule.js`. |
| DATA-02 | Dirección confirmada (manual B5, Pje. Larrabure 142) en `restaurantInfo.address`; JSON-LD sin Lince ni coordenadas antiguas. Razón social/RUC siguen pendientes (D2). |
| DATA-03 | WhatsApp solo desde `restaurantInfo` (`lib/site.js`). |
| DATA-04 | Tiempo de recojo único: `prepTimeMinutes` (15–20 min). |
| DATA-05 | Eliminados "4.9", "ABIERTO" fijo y badge de `/links`; estado real. |
| DATA-06 | URL del sitio solo en `lib/site.js` (`SITE_URL`). |
| SEO-02 | Metadata y canonical propios en todas las rutas. |
| SEO-03 | `verification` solo con `GOOGLE_SITE_VERIFICATION`. |
| SEO-04 | Keywords sin "lince"; NAP consistente. |
| SEC-07 | Cabeceras de seguridad (sin CSP todavía). |
| SEC-12 / A11Y-03 | `SecureMap` eliminado; íconos con `aria-label`. |
| A11Y-01 | `Dialog` con focus trap, `Esc` y retorno de foco. |
| A11Y-02 | `<label>` en checkout y Libro de Reclamaciones. |
| A11Y-04 | Header de altura fija y barra de secciones alineada. |
| PERF-02 | Hero 862 KB → 99 KB (WebP); OG 275 KB → 101 KB (JPEG). |
| PERF-03 | Diálogos con `next/dynamic`; secciones estáticas como Server Components. |
| QLT-05 | `/links`, `/quienes`, `/libro-de-reclamaciones` con página server. |
| QLT-08 | Colores como tokens `@theme` (316 clases migradas). |
| DEAD-05 | Borrado `links/metadata.js`. |
| BUG-03 | La regla de bebidas se explica antes de fallar ("Va con hamburguesa"). |
| BUG-09 / DEAD-10 / PERF-04 | Reto Gamer reemplazado por "Arma tu burger" (motor puro con tests, ~400 líneas en total); sin ranking falso ni datos personales. |
| SEO-03 | Search Console verificado con la meta oficial de `bigjack.vercel.app`. |

### Seguridad y dependencias (2026-10-31)

| ID | Cambio |
| :--- | :--- |
| SEC-03 | El proxy reconstruye el pedido con lista blanca (`lib/orderRules.js`); ya no hace spread del body. |
| SEC-05 | Reglas de negocio en el servidor: horario (Lima), pre-orden solo recojo, delivery sin efectivo, bebidas con hamburguesa, máximos y longitudes. |
| SEC-02 | Mismo origen, `Content-Type`, límite de 16 KB, Cloudflare Turnstile (token de un solo uso validado en servidor) y un pedido cada 20 s por IP. |
| SEC-07 | CSP + COOP además de las cabeceras previas. |
| SEC-09 | Respuesta normalizada al cliente; la del ERP solo en el log del servidor. |
| SEC-10 | `eventId` con aleatoriedad criptográfica. |
| — | Analytics: con GTM los eventos ya no se envían dos veces (dataLayer + gtag). |
| — | Dependencias: React 19.3.1, Tailwind 4.3.3, nodemailer 10.3.1, lucide-react 1.66, ESLint 9.39.5. `opentype.js` se queda en 1.3.4 (la 2.0 genera trazos con `NaN` en textos completos). `npm audit --omit=dev` = 0. Quedan 16 avisos **moderados solo de desarrollo** (`minimatch` < 11 en la cadena de ESLint, ReDoS con patrones controlados por nosotros); ESLint 10 no los resuelve. Riesgo aceptado. |

**Pendientes de seguridad:** SEC-04 (rate-limit persistente: Upstash/Vercel KV o Vercel Firewall), Turnstile en el Libro (SEC-06, al reactivarlo), SEC-06 y validación de longitudes del Libro al reactivarlo (enero), SEC-11 (dejar solo `WEBHOOK_MENU_SECRET` cuando se confirme el nombre usado en Vercel). LEG-04 resuelto con `/privacidad`.

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

### SEC-02 — `/api/online-orders` acepta pedidos de cualquiera, sin protección anti-abuso real · **Alta** · ✅ Resuelto (mismo origen + Turnstile; rate-limit persistente en SEC-04)
- **Dónde:** `app/api/online-orders/route.js:92-243`.
- **Evidencia:** no hay verificación de `Origin`, CAPTCHA, token ni firma. Cualquiera puede hacer `POST` con SKUs válidos. El ERP **registra la venta y descuenta inventario** por cada pedido (`docs/webhook-pedidos.md`, reglas 3-4).
- **Impacto:** pedidos falsos que ensucian ventas e inventario del ERP.
- **Recomendación:** verificar `Origin`/`Referer`, añadir Cloudflare Turnstile (o similar) en el checkout, honeypot, y rate-limit persistente (ver SEC-04).

### SEC-03 — El proxy reenvía campos arbitrarios del cliente al ERP (mass assignment) · **Alta** · ✅ Resuelto (`lib/orderRules.js` reconstruye con lista blanca)
- **Dónde:** `app/api/online-orders/route.js:65-90` (`...payload`), `:211-216`.
- **Evidencia:** `normalizePayloadForWebhook` hace spread del body completo. Los `items` también se reenvían con cualquier campo extra. Un atacante puede inyectar `source`, `metadata`, `orderDate`, `status`, `totalAmount`, `unitPrice`, `useCatalogPrice:false`, etc. La API legacy del ERP aceptaba `useCatalogPrice=false` + `unitPrice` (`docs/legacy/online-orders-api.md` §3).
- **Impacto:** si el webhook del ERP honra alguno de esos campos → manipulación de precio/estado. Aunque no los honre hoy, el contrato queda abierto.
- **Recomendación:** construir el payload saliente **en el servidor** con lista blanca de campos (`eventId`, `orderDate` generado en servidor, `customer`, `paymentMethod` de un enum, `notes` truncado, `items: [{sku, quantity, notes}]`, `metadata` con claves conocidas). Confirmar con el equipo ERP qué campos lee el webhook.

### SEC-04 — Rate-limit en memoria, inefectivo en serverless · **Media**
- **Dónde:** `app/api/online-orders/route.js:14-25, 93-112, 194-195`.
- **Evidencia:** `ipCache` es un `Map` del proceso. En Vercel cada instancia/cold start tiene su propio mapa. La IP se toma del primer valor de `x-forwarded-for`, que es falsificable si el proxy no lo sobrescribe. Solo se cuentan pedidos que pasan validación.
- **Recomendación:** rate-limit en store compartido (Upstash Redis / Vercel KV) o en el edge (Vercel Firewall). Usar `request.ip`/cabecera confiable de la plataforma.

### SEC-05 — Reglas de negocio solo en el cliente · **Media** · ✅ Resuelto (`lib/orderRules.js` se ejecuta en servidor)
- **Dónde:** `app/features/home/checkout/submitOrder.js:58-76` vs. `route.js`.
- **Evidencia:** horario de atención, "pre-orden solo recojo", "delivery no acepta efectivo", "bebidas solo con hamburguesa" y longitud de campos **no** se validan en el servidor.
- **Recomendación:** mover la validación a un módulo compartido (`lib/orderRules.js`) y ejecutarlo en el route handler. El cliente solo da feedback temprano.

### SEC-06 — Server Action del Libro de Reclamaciones sin anti-spam · **Media**
- **Dónde:** `app/actions.js:14-116`.
- **Evidencia:** cada envío dispara un correo SMTP. Sin rate-limit, CAPTCHA ni límite de longitud. El email no se valida en servidor.
- **Impacto:** email bombing a la cuenta del negocio y consumo de cuota de Gmail.
- **Recomendación:** Turnstile + rate-limit + validación de formato/longitud (DNI 8 dígitos o CE, email, teléfono).

### SEC-07 — Sin cabeceras de seguridad HTTP · **Media** · ✅ Resuelto (CSP + COOP + HSTS + resto en `next.config.mjs`)
- **Dónde:** `next.config.mjs` (no define `headers()`).
- **Recomendación:** `Content-Security-Policy` (permitiendo Google Maps embed), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (geolocation=self), `frame-ancestors 'none'`.

### SEC-08 — `remotePatterns` de imágenes innecesarios · **Media** · ✅ Resuelto (Fase 0)
- **Dónde:** `next.config.mjs:4-13`.
- **Evidencia:** se permiten `placehold.co` e `images.unsplash.com`, pero **todas** las imágenes son locales. Amplía la superficie del optimizador de imágenes (ligado a SEC-01: SSRF/RCE en Image Optimization).
- **Recomendación:** eliminar ambos patrones.

### SEC-09 — Respuesta del ERP reenviada tal cual al navegador · **Baja** · ✅ Resuelto
- **Dónde:** `app/api/online-orders/route.js:218-227`.
- **Impacto:** puede filtrar mensajes internos/estructura del ERP.
- **Recomendación:** mapear a `{ success, orderId, duplicated, message }` y loguear el resto en servidor.

### SEC-10 — `eventId` generado en el cliente con `Math.random` · **Baja** · ✅ Resuelto (`crypto.getRandomValues`)
- **Dónde:** `app/lib/onlineOrders.js:8-13`.
- **Recomendación:** generar con `crypto.randomUUID()`; idealmente en servidor a partir de un id de intento enviado por el cliente (para conservar idempotencia en reintentos).

### SEC-11 — Variables de secreto con 3 nombres alternativos y fallback `NEXT_PUBLIC_` · **Baja** · ⚠️ Parcial (se quitó el fallback público; quedan alias del webhook)
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

### LEG-02 — Libro de Reclamaciones incompleto respecto al reglamento · **Alta** · ⚠️ Pendiente (Fase 1; ruta desactivada mientras tanto)
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

### LEG-04 — Sin aviso de privacidad para datos personales · **Media** · ✅ Resuelto
- **Dónde:** checkout (`CartDrawer.js`), Libro de Reclamaciones, Reto Gamer (nombre + WhatsApp).
- **Evidencia:** se recolectan nombre, teléfono, dirección, ubicación GPS, DNI, email. No hay política de privacidad ni consentimiento. Además nombre/teléfono/dirección se guardan en `localStorage` (`page.js:263-278`).
- **Resolución:** página `/privacidad` creada conforme a la Ley N.° 29733 de Protección de Datos Personales de Perú; consentimiento y enlace directo agregados en checkout (`CartFooter.js`) y enlace en pie de página (`SiteFooter.js`); aviso legal de imágenes referenciales integrado en vistas y pie de página.

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

### BUG-07 — El paso "Cliente" exige teléfono pero el envío no · **Media** · ⚠️ Decisión D6 pendiente (hoy opcional en todos los puntos)
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

### DATA-01 — Cuatro horarios distintos publicados · **Alta** · ✅ Resuelto (una sola fuente: `restaurantInfo.hours`)
| Fuente | Horario mostrado |
| :--- | :--- |
| `app/data/menuData.js:10-18` (**lógica real** de abierto/cerrado y schema SEO) | Todos los días 19:00 – 01:00 |
| `app/page.js:769-770` (header desktop) | Lun–Jue 4:30–11 PM · Vie–Dom 5 PM–1 AM |
| `app/links/page.js:279-287` | Lun–Jue 4 PM–1 AM · Vie–Dom 5 PM–1 AM |
| `app/features/home/components/FooterSection.js:125-131` | Todos los días 18:00 – 01:00 |
- **Recomendación:** el dueño confirma el horario real; todas las vistas leen de `restaurantInfo.hours` con un formateador común.

### DATA-02 — Identidad legal y dirección contradictorias · **Alta** · ⚠️ Parcial (dirección centralizada; razón social y RUC pendientes de D2)
- Razón social: "Big Jack Perú S.A.C." (`FooterSection.js:152`, `layout.js:51`) vs. "BIG JACK" (`libro-de-reclamaciones/page.js:67`). El RUC `15614908278` (`menuData.js:7`) empieza con `15`, prefijo que **no** corresponde a una S.A.C. (las personas jurídicas usan `20`).
- Dirección: "Centro de Lima" (`menuData.js:24`, hero, footer, textos SEO) vs. "Jr. Bartolomé Herrera 133, **Lince**" (`seo.js:88-89`, `links/page.js:125`). Lince no es Centro de Lima.
- **Recomendación:** confirmar con el dueño y centralizar en `restaurantInfo` (`legalName`, `ruc`, `address.street`, `address.district`).

### DATA-03 — Números de WhatsApp distintos · **Media** · ✅ Resuelto (`lib/site.js`)
- `menuData.js:21` → `51997722704` (el que usa la app). `docs/LINKS_PAGE.md` → `51970513912`. Placeholder del libro (`page.js:115`) → `970513912`.
- **Recomendación:** confirmar número oficial; actualizar docs y placeholder.

### DATA-04 — Tiempos de preparación distintos · **Media** · ✅ Resuelto (`prepTimeMinutes`)
- "15 min" (`HeroSection.js:87`) vs. "15-20 min" (`CartDrawer.js:397`, `onlineOrders.js:23`, `ProductAddToCart.js:192`, FAQ).

### DATA-05 — Textos y métricas fijas que pueden ser falsos · **Media** · ✅ Resuelto (estado real, sin rating ni badge fijo)
- `links/page.js:196` muestra **"ABIERTO"** siempre, aunque esté cerrado.
- `links/page.js:222` muestra rating **"4.9"** fijo.
- ✅ `product/[slug]` ya no muestra un badge "Premium" fijo (Fase 6.6).
- Placeholder del buscador "smash, tocino" (`CategoryFilter.js:62`) contradice la FAQ ("no smash") y el menú usa "bacon".
- **Recomendación:** derivar de datos reales o eliminar.

### DATA-06 — URL del sitio definida en 4 lugares · **Baja** · ✅ Resuelto (`SITE_URL` en `lib/site.js`)
- `DEFAULT_SITE_URL` (`constants.js:20`), `NEXT_PUBLIC_BASE_URL` (`layout.js:34`, `robots.js:2`, `sitemap.js:4`) y literal en `layout.js:61`. El schema JSON-LD usa la constante y ignora la variable de entorno.

### DATA-07 — Comentarios desactualizados · **Baja** · ⚠️ Parcial (quedan textos sin tildes en mensajes internos)
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
| DEAD-05 | ✅ Resuelto: `/links` define `metadata` propia; el archivo `metadata.js` fue eliminado. | — | Baja |
| DEAD-06 | ✅ Resuelto (Fase 6): `useOpenStatus` actualiza cada 30 s sin escribir `localStorage`. | `hooks/useOpenStatus.js` | Baja |
| DEAD-07 | ✅ Resuelto (Fase 8): CSS sin uso y `:focus-visible` duplicado eliminados. | `globals.css` | Baja |
| DEAD-08 | ✅ Resuelto (Fase 8): eliminados `deliveryAvailable`, `orderType` persistido, `bj_isOpen`, la rama imposible de `normalizePhoneForDisplay` y los imports sin uso. | varios | Baja |
| DEAD-09 | ✅ Resuelto (Fase 8): `sincomprimir/` movido a `design-assets/` (ignorado) y eliminadas las imágenes huérfanas. | `public/images/` | Baja |
| DEAD-10 | ✅ Resuelto: el juego se reemplazó por "Arma tu burger"; no hay ranking, nombre ni código de canje. | — | Baja |

---

## 6. Calidad de código / malas prácticas (QLT)

### QLT-01 — `app/page.js` es un "god component" · **Media** · ✅ Resuelto (Fase 6)
`app/(shop)/page.js` es un Server Component de 22 líneas que compone hero, carta, ubicación y FAQ. El estado vive en `ShopProvider` y en hooks pequeños (`useCart`, `useCheckoutForm`, `useOrderSubmit`…). `CartDrawer` consume el contexto y se divide en `components/cart/`.

### QLT-02 — Lógica duplicada · **Media** · ✅ Resuelto (`catalog`, `cartModel`, `orderRules`, `format`, `site`, `schedule`)
La construcción de SKUs, los topes del carrito, las reglas del pedido, el rango de precios, las URLs de WhatsApp/Instagram y el horario viven ahora en módulos de dominio compartidos. El diagnóstico original detectó duplicación en `page.js`, `ProductAddToCart`, `seo.js` y varios builders; esos puntos se consolidaron en las Fases 2, 3, 4 y 6.

### QLT-03 — `alert()`/`confirm()` como UX (13 usos) · **Media** · ✅ Resuelto (Fase 6)
La tienda usa `useToast` + `Toast` (info/success/error/confirm accesible, autocierre a 5 s). El juego actual no usa `alert` ni `confirm`.

### QLT-04 — Errores tragados en silencio (8 `catch {}` vacíos) · **Media** · ⚠️ Parcial (`safeStorage` cubre lo crítico; quedan catches menores)
`page.js:208,226,233,255,382,499`, `ClientSearchParams.js:13`, etc.
→ Al menos `console.warn` en desarrollo; wrapper `safeStorage`.

### QLT-05 — Todas las páginas son Client Components · **Media** · ✅ Resuelto
Todas las rutas tienen `page.js` como Server Component con `metadata`/canonical propios; el estado está en islas cliente (`ShopProvider`, `OpenStatusBadge`, `BurgerGame`, `ComplaintForm`).

### QLT-06 — Sin tests ni tipos · **Media** · ✅ Resuelto (94 tests; JS sin tipos sigue siendo decisión de stack)
`npm test` cubre `openHours`, `cartModel`, `cartRules`, `onlineOrders`, `orderRules`, `analytics`, `format`, `schedule`, `site`, `turnstile`, mensajes del checkout y el motor del juego. JS sin JSDoc ni TypeScript se mantiene como decisión de stack; si se migra, será incremental.

### QLT-07 — Categorías como identificadores · **Baja** · ⚠️ Parcial
Las claves internas (`LAS INTOCABLES`, `BEBIDAS`) siguen siendo strings estables documentados en `categoryInfo`. Funciona y está cubierto por tests; migrar a `id` + `label` queda como mejora opcional.

### QLT-08 — Estilos con colores hex literales repetidos · **Baja** · ✅ Resuelto (tokens `@theme`)
`#FCC900` aparece cientos de veces; existen variables CSS (`--potencia-amarillo`, `--bj-accent`) que no se usan. Ver `DESIGN.md`.

### QLT-09 — `MenuGrid` renderiza dos árboles completos (móvil y desktop) · **Baja** · ✅ Resuelto (Fase 6)
`MenuGrid` usa un solo árbol de `CategoryCarousel` en todos los tamaños; se eliminó el grid móvil duplicado (doble DOM e imágenes).

### QLT-10 — Mezcla de idiomas y sin tildes en mensajes · **Baja** · ⚠️ Parcial (quedan "Vacialo"/"menu" en mensajes internos y "Ubicacion" en notas del payload)
Mensajes al usuario sin tildes ("presentacion", "exito", "Vacialo") junto a otros con tildes.

### QLT-11 — Monolitos: archivos que mezclan varias responsabilidades · **Media** · ⚠️ Casi resuelto (solo `ComplaintForm.js`, 302 líneas, con excepción de lint)
QLT-01 es el caso más visible, pero no el único. Archivos que juntan UI, estado, reglas de negocio y datos en una sola unidad:

| Archivo | Líneas | Estado |
| :--- | :-: | :--- |
| `app/(shop)/libro-de-reclamaciones/ComplaintForm.js` | 302 | Único archivo sobre 300; tiene excepción de `max-lines` y se dividirá al completar la Fase 1. |
| `app/features/shop/seo.js` | 213 | Dentro del presupuesto; builders de JSON-LD y FAQ. |
| `app/data/menuData.js` | 188 | Datos del negocio y catálogo (fuente única, sin lógica de UI). |
| `app/links/page.js` | 182 | Server Component con datos e íconos compartidos. |
| `app/api/online-orders/route.js` | 166 | Orquesta; reglas y catálogo están en `lib/`. |
| `app/reto-gamer/BurgerGame.js` | 171 | UI del juego; el motor puro está en `game/engine.js` (133) y el render en `game/render.js` (138). |

Los antiguos monolitos (`page.js`, `CartDrawer.js`, `MenuGrid.js`, `links/page.js`, `libro-de-reclamaciones/page.js`, `reto-gamer/page.js`) se dividieron en las Fases 6 y 9.

Consecuencias: cambios pequeños tocan archivos enormes (conflictos de merge, revisiones difíciles), la lógica no se puede testear sin montar la UI, y la misma regla termina copiada en varios lugares (QLT-02).
→ Ver Fase 6 del plan: presupuesto de tamaño por archivo, separar dominio puro / hooks / componentes de presentación, y componentes compartidos en `app/components/`.

---

## 7. Rendimiento (PERF)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| PERF-01 | ✅ Resuelto (Fase 6): `/` y `/product/*` usan `useOpenStatus` (30 s + `visibilitychange`). | Media |
| PERF-02 | ✅ Resuelto: `burger-hero.webp` (99 KB) y `og-bigjack.jpg` (101 KB). | Media |
| PERF-03 | ✅ Resuelto: drawer, hojas y confirmación con `next/dynamic`; secciones estáticas server. | Baja |
| PERF-04 | ✅ Resuelto: "Arma tu burger" separa motor puro (`game/engine.js`), render y UI; ~440 líneas en total. | Baja |

## 8. Accesibilidad (A11Y)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| A11Y-01 | ✅ Resuelto: `Dialog` con focus trap, `Esc` y retorno de foco. | Media |
| A11Y-02 | ✅ Resuelto: `Field` con `<label>` visible en checkout y Libro. | Media |
| A11Y-03 | ✅ Resuelto: `SecureMap` eliminado; enlaces solo-icono con `aria-label`. | Media |
| A11Y-04 | ✅ Resuelto: header de altura fija (`--header-h`) y barra de secciones alineada. | Baja |

## 9. SEO

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| SEO-01 | ✅ Resuelto (Fase 0): `/images/og-bigjack.png` (1200×630) ya existe. | Alta |
| SEO-02 | ✅ Resuelto: metadata y canonical propios en todas las rutas. | Media |
| SEO-03 | ✅ Resuelto: la verificación solo se publica si existe `GOOGLE_SITE_VERIFICATION`. | Media |
| SEO-04 | ✅ Resuelto: NAP consistente en Centro de Lima; keywords actualizados. | Baja |

## 10. Operación / tooling (OPS)

| ID | Hallazgo | Severidad |
| :--- | :--- | :-: |
| OPS-01 | ⚠️ Parcial: el script apunta por defecto a localhost, pero sigue siendo PowerShell. Falta la versión Node multiplataforma (5.4). | Alta |
| OPS-02 | ✅ Resuelto (Fase 5): CI en `.github/workflows/ci.yml`; tests con Vitest. | Media |
| OPS-03 | ✅ Resuelto: `.env.example` incluye webhook, correo, Formspree, URL pública, GTM, GA y Turnstile. | Media |
| OPS-04 | ✅ Resuelto (Fase 5): `engines.node >=20.9.0` y `.nvmrc` con Node 24 LTS. | Baja |

## 11. Documentación (DOC)

### DOC-01 — Documentos existentes con afirmaciones falsas · **Media** · ✅ Resuelto (Fase 8) <a id="doc-01"></a>
- `SECURITY_AND_TECH_DEBT.md §3.2`: "Verificación estricta de idempotencia mediante `eventId`" → el proxy solo verifica que exista; la idempotencia la aplica el ERP.
- `UI_UX_OVERHAUL_WALKTHROUGH.md`: "Skeleton Loaders creados e integrados" → no se usan (DEAD-03). "0 advertencias" es cierto, pero no implica ausencia de bugs.
- `README.md`: "real-time catalog management" → el catálogo es un archivo estático.
- `LINKS_PAGE.md`: describe "Programa de Lealtad" y un WhatsApp que no existen en la página actual.

### DOC-02 — Rutas absolutas `file:///home/sjaquer/...` en docs · **Baja** · ✅ Resuelto (Fase 8)
Los enlaces de `SECURITY_AND_TECH_DEBT.md` y `UI_UX_OVERHAUL_WALKTHROUGH.md` solo funcionan en una máquina.
