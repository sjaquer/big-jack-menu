# PRD — Big Jack Menu

**Versión:** 1.1 (documenta el producto existente) · **Fecha:** 2026-11-02
**Estado:** vigente. Los requisitos marcados ⚠️ están implementados de forma parcial o dependen de una decisión pendiente; el detalle está en [`AUDIT.md`](./AUDIT.md) y [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md).

## 1. Contexto

**BIG JACK** es una hamburguesería en el Centro de Lima, Perú ("No vendemos humo. Vendemos carne, fuego y barrio."). Atiende de noche, con recojo en local y delivery coordinado por inDrive o por Rappi.

**Big Jack Menu** es su carta digital y canal de pedidos directo. Reemplaza el pedido manual por WhatsApp con un flujo que:
1. permite armar el pedido con precios y reglas de la casa, y
2. abre WhatsApp con el resumen para que el cliente confirme y coordine pago/entrega.

La integración con el ERP propio (`bigjack-rp`) vía webhook está implementada pero **desactivada** (`FEATURES.erpOrders = false`). Mientras esté apagada, el pedido no se registra automáticamente: la fuente operativa es WhatsApp. Cuando se reactive, el pedido se registrará en el ERP y el ERP seguirá calculando el precio final por SKU.

> **Libro de Reclamaciones:** desactivado temporalmente (`FEATURES.complaintsBook = false`). La ruta existe y muestra un aviso con WhatsApp. Reactivación prevista: enero 2027, después de completar la Fase 1 del plan de remediación. Ver riesgo legal en [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md#enero-2027--reactivaciones-pendientes).

## 2. Objetivos

| Objetivo | Indicador |
| :--- | :--- |
| Aumentar pedidos directos (sin comisión de apps) | Pedidos confirmados por WhatsApp / pedidos registrados en el ERP cuando se reactive |
| Reducir errores de toma de pedido | % de pedidos con SKU inválido o corregidos manualmente (meta: 0) |
| Subir ticket promedio con bebidas | % de pedidos con hamburguesa + bebida |
| Cumplir obligaciones legales (Indecopi) | Libro de Reclamaciones conforme y disponible; 100% de reclamos atendidos en plazo |
| Visibilidad local (SEO / redes) | Impresiones en Search Console, clics a reseñas desde `/links` |

La analítica está instalada (GA4 + GTM) con eventos de e-commerce, WhatsApp y juego. El detalle está en [`ARCHITECTURE.md`](./ARCHITECTURE.md#8-seo-e-ia).

## 3. Usuarios

| Persona | Necesidad | Contexto |
| :--- | :--- | :--- |
| **Cliente con hambre (móvil)** | Ver la carta con fotos y precios, armar su pedido en < 2 min, saber si está abierto. | 90%+ móvil; llega desde Instagram, TikTok, QR o Google. Datos móviles. |
| **Cliente recurrente** | Repetir pedido rápido; que recuerde sus datos. | Datos guardados en el navegador. |
| **Consumidor con un reclamo** | Registrar reclamo/queja con validez legal y recibir constancia. | Obligación legal del negocio. |
| **Operador del local** | Recibir pedidos completos y sin ambigüedad por WhatsApp (y por ERP cuando se reactive). | Usa WhatsApp Business y el ERP. |
| **Dueño** | Editar carta/precios sin programar; ver resultados. | Edita `app/data/menuData.js` (requiere deploy). |

## 4. Alcance

### Dentro del alcance
- Carta digital con categorías, navegación por secciones, fotos y precios "desde".
- Carrito persistente, sugerencia de bebidas y checkout recojo/delivery.
- Confirmación del pedido por WhatsApp con resumen y total.
- Estado abierto/cerrado con pre-órdenes (solo recojo).
- Páginas: enlaces (`/links`), quiénes somos (`/quienes`), privacidad (`/privacidad`), juego (`/reto-gamer`) y Libro de Reclamaciones (desactivado).
- SEO local (metadata, JSON-LD, sitemap, robots, `llms.txt`).
- Analítica GA4/GTM.

### Fuera del alcance (hoy)
- Pago en línea (Yape/Plin/tarjeta se coordinan por WhatsApp).
- Cuentas de usuario / historial de pedidos.
- Panel de administración de carta (la carta es un archivo en el repo).
- Seguimiento del estado del pedido.
- Cálculo de costo de delivery.
- Programa de lealtad.

## 5. Requisitos funcionales

### RF-1 Carta digital (`/`)

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-1.1 | Mostrar hamburguesas en formato grande y bebidas en filas compactas, con foto, descripción y precio "desde". | ✅ |
| RF-1.2 | Navegación por secciones con scroll-spy y anclas (`#hamburguesas`, `#bebidas`). | ✅ |
| RF-1.3 | Productos con `available: false` no se pueden agregar ni aparecen en el sitemap/`llms.txt`. | ✅ |
| RF-1.4 | Las hamburguesas abren una hoja para elegir versión (simple/doble); las bebidas se agregan directo. | ✅ |
| RF-1.5 | Hero animado por scroll, ubicación (mapa + Rappi) y footer con datos legales y enlace a privacidad. | ✅ |
| RF-1.6 | Papas fritas incluidas con cada hamburguesa; no se venden como acompañamiento separado. | ✅ |

### RF-2 Carrito

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-2.1 | El carrito persiste en `localStorage` y se sincroniza entre pestañas y con `/product/*`. | ✅ |
| RF-2.2 | Máximo **10 unidades por producto** y **30 unidades por pedido**. | ✅ |
| RF-2.3 | **Regla de complementos:** las bebidas solo pueden pedirse si hay al menos una hamburguesa. Si se retira la última hamburguesa, se retiran las bebidas **avisando al usuario**. | ✅ |
| RF-2.4 | Tras agregar una hamburguesa, sugerir bebidas que aún no estén en el carrito. | ✅ |
| RF-2.5 | Barra flotante en móvil con total y cantidad. | ✅ |

### RF-3 Checkout

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-3.1 | Datos del cliente: nombre (obligatorio) y teléfono (opcional). | ✅ (⚠️ obligatoriedad del teléfono: decisión D6) |
| RF-3.2 | Tipo de pedido: **Recojo** (15–20 min) o **Delivery** (vía inDrive, costo aparte). | ✅ |
| RF-3.3 | Delivery requiere dirección **o** ubicación GPS; permite referencia y detalles. | ✅ |
| RF-3.4 | Métodos de pago: Efectivo, Yape, Plin, Tarjeta. **Delivery no acepta efectivo.** Yape/Plin/tarjeta muestran recordatorio de pago. | ✅ |
| RF-3.5 | Datos del cliente se recuerdan entre visitas, con aviso y enlace a privacidad. | ✅ |
| RF-3.6 | Al confirmar: validar, mostrar confirmación con resumen y botón "Enviar por WhatsApp". Vaciar carrito. | ✅ |
| RF-3.7 | Errores se muestran en lenguaje claro, sin detalles técnicos, con toasts o mensajes inline. | ✅ |
| RF-3.8 | En modo ERP: Turnstile invisible, envío al proxy y confirmación con `orderId` cuando el ERP responde. | ✅ (inactivo por flag) |

### RF-4 Horario y pre-órdenes

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-4.1 | Calcular abierto/cerrado con el horario de `restaurantInfo.hours` **en hora de Lima**, incluyendo cierres después de medianoche. | ✅ |
| RF-4.2 | Cerrado: aviso discreto con cuenta regresiva; se puede ver la carta. | ✅ |
| RF-4.3 | Cerrado: el pedido se convierte en **pre-orden**, solo para **recojo**. | ✅ (cliente y servidor) |
| RF-4.4 | El servidor rechaza pedidos inmediatos fuera de horario. | ✅ |
| RF-4.5 | Todas las vistas muestran el mismo horario. | ✅ |

### RF-5 Integración ERP

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-5.1 | El navegador envía el pedido a `POST /api/online-orders` (proxy). El proxy valida y reenvía al webhook con `x-webhook-secret`. | ✅ (código listo; apagado por flag) |
| RF-5.2 | El pedido se identifica por **SKU**; el **precio lo calcula el ERP** (`salePrice`). | ✅ (contrato) |
| RF-5.3 | Idempotencia por `eventId` (el ERP no duplica reintentos). | ✅ (ERP) |
| RF-5.4 | El proxy solo reenvía campos conocidos y aplica las reglas de negocio. | ✅ |
| RF-5.5 | Protección contra abuso: mismo origen, límite de tamaño, Turnstile y rate-limit en memoria. | ⚠️ (SEC-04: rate-limit persistente pendiente) |

Contrato detallado: [`webhook-pedidos.md`](./webhook-pedidos.md) y [`ARCHITECTURE.md`](./ARCHITECTURE.md#6-api).

### RF-6 Página de producto (`/product/[slug]`)

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-6.1 | Página estática por producto con metadata propia, elección de versión y cantidad. | ✅ |
| RF-6.2 | Agregar al carrito respeta las mismas reglas que la carta. | ✅ |
| RF-6.3 | La información de cada versión es veraz y sale de `menuData.js`. | ✅ |

### RF-7 Libro de Reclamaciones (`/libro-de-reclamaciones`)

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-7.1 | Formulario con identificación del consumidor, bien contratado, monto, tipo, detalle y pedido. | ⚠️ desactivado; Fase 1 pendiente |
| RF-7.2 | Envío por Server Action con sanitización HTML y error visible si no hay canal de entrega. | ✅ |
| RF-7.3 | Número correlativo, constancia al consumidor por email y persistencia. | ❌ (Fase 1) |
| RF-7.4 | Nunca confirmar un reclamo que no se entregó. | ✅ |
| RF-7.5 | Datos del proveedor (razón social, RUC, dirección) correctos. | ⚠️ razón social/RUC pendientes (D2) |

### RF-8 Enlaces (`/links`)

Página tipo link-in-bio: CTA a la carta, WhatsApp, Rappi, estado abierto/cerrado real, información (cómo llegar, horario, reseña, juego, quiénes somos) y redes. ✅

### RF-9 Quiénes somos (`/quienes`)

Historia, filosofía y CTA a WhatsApp/la carta. ✅

### RF-10 Arma tu burger (`/reto-gamer`)

Juego de apilar ingredientes para la espera. Récord y últimas partidas en `localStorage`; sin nombre, WhatsApp, premios ni código de canje. ✅

### RF-11 SEO, PWA y analítica

| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-11.1 | Metadata global, Open Graph y Twitter con imagen 1200×630; OG por producto. | ✅ |
| RF-11.2 | JSON-LD `Restaurant`, `WebSite`, `Product`, `BreadcrumbList` y `FAQPage`. | ✅ |
| RF-11.3 | `sitemap.xml` (páginas + productos), `robots.txt` (bloquea `/api/`) y `llms.txt`. | ✅ |
| RF-11.4 | Metadata y canonical propios en todas las rutas. | ✅ |
| RF-11.5 | Manifest PWA instalable con íconos y atajos. | ✅ |
| RF-11.6 | GA4/GTM con eventos de e-commerce, WhatsApp y juego. | ✅ |

## 6. Reglas de negocio

| Regla | Valor | Definida en |
| :--- | :--- | :--- |
| Máx. unidades por producto | 10 | `features/shop/constants.js` |
| Máx. unidades por pedido | 30 | `features/shop/constants.js` |
| Rate-limit de pedidos | 5 por IP cada 15 min + 1 cada 20 s | `features/shop/constants.js`, `api/online-orders/route.js` |
| Categoría principal | `LAS INTOCABLES` | `PRIMARY_CATEGORIES` |
| Complementos que requieren principal | `BEBIDAS` | `COMPLEMENT_CATEGORIES` |
| Delivery | Sin efectivo; requiere dirección o GPS; no admite pre-orden | `lib/orderRules.js`, `checkout/submitOrder.js` |
| Pre-orden | Solo recojo, cuando está cerrado | `lib/orderRules.js`, `checkout/submitOrder.js` |
| Precio final | Referencial en el front; en modo ERP lo calcula el ERP por SKU | `docs/webhook-pedidos.md` |
| Moneda | PEN (S/) | — |
| Horario | Lunes a sábado, 19:00–00:00; domingo cerrado | `data/menuData.js` |
| Delivery alternativo | Rappi (PedidosYa retirado en 2026-10-31) | `data/menuData.js` |

## 7. Requisitos no funcionales

| Área | Requisito |
| :--- | :--- |
| Rendimiento | LCP < 2.5 s en 4G para `/`; JS inicial mínimo; imágenes WebP/AVIF. |
| Disponibilidad | Si un canal falla, el cliente recibe un mensaje claro y puede pedir por WhatsApp directo. |
| Seguridad | Dependencias sin vulnerabilidades altas/críticas; secretos solo en servidor; el servidor valida todo; cabeceras de seguridad y CSP. |
| Privacidad | Aviso de privacidad; datos mínimos; PII no se loguea. |
| Accesibilidad | WCAG 2.1 AA: labels, foco visible, diálogos accesibles, objetivos táctiles ≥ 44 px. |
| Compatibilidad | Últimas 2 versiones de Chrome/Safari iOS/Samsung Internet. Mobile-first. |
| Idioma | Español (Perú), con tildes correctas. |
| Mantenibilidad | Reglas de negocio en módulos puros con tests; un único origen para datos del negocio. |

## 8. Dependencias externas

| Servicio | Uso | Configuración |
| :--- | :--- | :--- |
| ERP Big Jack (`bigjack-rp.vercel.app`) | Registro de ventas e inventario (cuando se reactive) | `WEBHOOK_ORDERS_URL`, `ERP_BASE_URL`, `WEBHOOK_MENU_SECRET` |
| Gmail SMTP (Nodemailer) | Notificación de reclamos | `GMAIL_USER`, `GMAIL_PASS`, `RECIPIENT_EMAIL` |
| Formspree (opcional) | Canal alternativo de reclamos | `FORMSPREE_URL` |
| WhatsApp (`wa.me`) | Confirmación y coordinación | `restaurantInfo.contact.whatsapp` |
| Google Maps | Embed, enlaces y ubicación GPS del cliente | `restaurantInfo.contact` |
| Rappi / inDrive | Delivery alternativo | `restaurantInfo.deliveryApps`, textos del checkout |
| Cloudflare Turnstile | Anti-bots del checkout | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Google Analytics 4 / GTM | Medición | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID` |
| Vercel | Hosting | — |

## 9. Roadmap

1. Reactivar el Libro de Reclamaciones conforme (enero 2027).
2. Volver a publicar el RUC cuando esté confirmado.
3. Migrar los pedidos a la API definitiva del ERP y reactivar `FEATURES.erpOrders`.
4. Rate-limit persistente (Upstash/Vercel KV o Vercel Firewall).
5. Carta editable sin deploy (leer el catálogo del ERP con caché corta).
6. Estado del pedido (consulta por `orderId`).
7. Pago en línea (link de pago Yape/tarjeta).

## 10. Preguntas abiertas

Ver la tabla de **Decisiones pendientes** (D1–D8) en [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md#decisiones-pendientes).
