# PRD — Big Jack Menu

**Versión:** 1.0 (documenta el producto existente) · **Fecha:** 2026-10-24
**Estado:** vigente. Los requisitos marcados ⚠️ están implementados de forma parcial o incorrecta; el detalle está en [`AUDIT.md`](./AUDIT.md).

## 1. Contexto

**BIG JACK** es una hamburguesería en Lima, Perú ("Potencia honesta. No vendemos humo. Vendemos carne, fuego y barrio."). Atiende en horario nocturno, con recojo en local y delivery coordinado por inDrive o por apps (PedidosYa, Rappi).

**Big Jack Menu** es su carta digital y canal de pedidos directo. Reemplaza el pedido manual por WhatsApp con un flujo que:
1. registra el pedido en el ERP propio del negocio (`bigjack-rp`) vía webhook, y
2. abre WhatsApp con el resumen para que el cliente confirme y coordine pago/entrega.

## 2. Objetivos

| Objetivo | Indicador sugerido |
| :--- | :--- |
| Aumentar pedidos directos (sin comisión de apps) | Pedidos registrados vía `/api/online-orders` por semana |
| Reducir errores de toma de pedido | % de pedidos con SKU inválido o corregidos manualmente (meta: 0) |
| Subir ticket promedio con complementos | % de pedidos con hamburguesa + guarnición/bebida |
| Cumplir obligaciones legales (Indecopi) | Libro de Reclamaciones conforme; 100% de reclamos entregados y respondidos en plazo |
| Visibilidad local (SEO / redes) | Impresiones en Google Search Console, clics a reseñas desde `/links` |

> Hoy **no hay analítica instalada**; estos indicadores requieren instrumentación (ver §9).

## 3. Usuarios

| Persona | Necesidad | Contexto |
| :--- | :--- | :--- |
| **Cliente con hambre (móvil)** | Ver la carta con fotos y precios, armar su pedido en < 2 min, saber si está abierto. | 90%+ móvil, llega desde Instagram/TikTok/QR/Google. Datos móviles. |
| **Cliente recurrente** | Repetir pedido rápido; que recuerde sus datos. | Datos guardados en el navegador. |
| **Consumidor con un reclamo** | Registrar reclamo/queja con validez legal y recibir constancia. | Obligación legal del negocio. |
| **Operador del local** | Recibir pedidos completos y sin ambigüedad en ERP + WhatsApp. | Usa el ERP y WhatsApp Business. |
| **Dueño** | Editar carta/precios sin programar; ver resultados. | Edita `app/data/menuData.js` (requiere deploy). |

## 4. Alcance

### Dentro del alcance
- Carta digital con categorías, búsqueda y detalle de producto.
- Carrito persistente, upsell de complementos, checkout recojo/delivery.
- Registro de pedido en ERP + derivación a WhatsApp.
- Estado abierto/cerrado con pre-órdenes (solo recojo).
- Páginas: enlaces (`/links`), quiénes somos, Libro de Reclamaciones, juego promocional.
- SEO local (metadata, JSON-LD, sitemap, robots).

### Fuera del alcance (hoy)
- Pago en línea (Yape/Plin/tarjeta se coordinan por WhatsApp).
- Cuentas de usuario / historial de pedidos.
- Panel de administración de carta (la carta es un archivo en el repo).
- Seguimiento del estado del pedido.
- Cálculo de costo de delivery.

## 5. Requisitos funcionales

### RF-1 Carta digital (`/`)
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-1.1 | Mostrar productos por categoría (LAS INTOCABLES, GUARNICIONES, BEBIDAS) con foto, descripción y precio "desde". | ✅ |
| RF-1.2 | Filtro por categoría con contador y búsqueda por nombre/descripción/categoría. | ✅ (sin normalizar tildes) |
| RF-1.3 | Productos con `available: false` se muestran deshabilitados y no se pueden agregar. | ✅ |
| RF-1.4 | Hamburguesas abren un modal para elegir versión (simple/doble); el resto se agrega directo por opción. | ✅ |
| RF-1.5 | Hero, ubicación (mapa + apps de delivery), footer con datos legales y enlace al Libro de Reclamaciones. | ✅ ⚠️ datos inconsistentes (DATA-01/02) |

### RF-2 Carrito
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-2.1 | El carrito persiste en `localStorage` y se sincroniza entre pestañas y con `/product/*`. | ✅ |
| RF-2.2 | Máximo **10 unidades por producto** y **30 unidades por pedido**. | ⚠️ solo se aplica en el drawer (BUG-02) |
| RF-2.3 | **Regla de complementos:** las BEBIDAS solo pueden pedirse si hay al menos una hamburguesa. Si se retira la última hamburguesa, se retiran las bebidas **avisando al usuario**. | ⚠️ (BUG-03) |
| RF-2.4 | Tras agregar una hamburguesa, sugerir guarnición y bebidas que aún no estén en el carrito. | ⚠️ siempre sugiere guarnición (BUG-04) |
| RF-2.5 | Barra flotante en móvil con total y cantidad. | ✅ |

### RF-3 Checkout
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-3.1 | Datos del cliente: nombre (obligatorio), teléfono. | ⚠️ obligatoriedad del teléfono indefinida (BUG-07, D6) |
| RF-3.2 | Tipo de pedido: **Recojo** (15–20 min) o **Delivery** (vía inDrive, costo aparte). | ✅ |
| RF-3.3 | Delivery requiere dirección **o** ubicación GPS; permite referencia y detalles. | ✅ |
| RF-3.4 | Métodos de pago: Efectivo, Yape, Plin, Tarjeta. **Delivery no acepta efectivo.** Yape/Plin/tarjeta muestran recordatorio de pago. | ✅ (solo cliente, SEC-05) |
| RF-3.5 | Datos del cliente se recuerdan entre visitas. | ✅ (sin aviso de privacidad, LEG-04) |
| RF-3.6 | Al confirmar: validar, registrar en ERP, mostrar confirmación con código de pedido y botón "Enviar por WhatsApp" con el resumen. Vaciar carrito. | ✅ |
| RF-3.7 | Errores se muestran en lenguaje claro, sin detalles técnicos. | ✅ (con `alert`, QLT-03) |

### RF-4 Horario y pre-órdenes
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-4.1 | Calcular abierto/cerrado con el horario de `restaurantInfo.hours` **en hora de Lima**, incluyendo cierres después de medianoche. | ⚠️ usa hora del dispositivo (BUG-05) |
| RF-4.2 | Cerrado: aviso con cuenta regresiva; se puede ver la carta. | ✅ |
| RF-4.3 | Cerrado: agregar productos convierte el pedido en **pre-orden**, solo para **recojo**. | ✅ (solo cliente) |
| RF-4.4 | El servidor rechaza pedidos inmediatos fuera de horario. | ❌ (SEC-05) |
| RF-4.5 | Todas las vistas muestran **el mismo** horario. | ❌ (DATA-01) |

### RF-5 Integración ERP
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-5.1 | El navegador envía el pedido a `POST /api/online-orders` (proxy). El proxy valida y reenvía al webhook `WEBHOOK_ORDERS_URL` con `x-webhook-secret`. | ✅ |
| RF-5.2 | El pedido se identifica por **SKU**; el **precio lo calcula el ERP** (`salePrice`). | ✅ |
| RF-5.3 | Idempotencia por `eventId` (el ERP no duplica reintentos). | ✅ (ERP) |
| RF-5.4 | El proxy solo reenvía campos conocidos y aplica las reglas de negocio. | ❌ (SEC-03, SEC-05) |
| RF-5.5 | Protección contra abuso (rate-limit efectivo, origen, anti-bot). | ⚠️ (SEC-02, SEC-04) |

Contrato detallado: [`webhook-pedidos.md`](./webhook-pedidos.md) y [`ARCHITECTURE.md`](./ARCHITECTURE.md#6-api).

### RF-6 Página de producto (`/product/[slug]`)
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-6.1 | Página estática por producto con metadata propia (SEO), elección de versión y cantidad. | ✅ |
| RF-6.2 | Agregar al carrito respetando las mismas reglas que el home. | ⚠️ (BUG-02, BUG-03) |
| RF-6.3 | La información mostrada de cada versión debe ser veraz. | ❌ (LEG-03) |

### RF-7 Libro de Reclamaciones (`/libro-de-reclamaciones`)
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-7.1 | Formulario con identificación del consumidor, bien contratado, monto, fecha del incidente, tipo (reclamo/queja), detalle y pedido. | ⚠️ fecha se descarta (LEG-02) |
| RF-7.2 | Envío por Server Action, con sanitización HTML. | ✅ |
| RF-7.3 | Número correlativo, constancia al consumidor por email, persistencia. | ❌ (LEG-02) |
| RF-7.4 | Nunca confirmar un reclamo que no se entregó. | ❌ (LEG-01) |
| RF-7.5 | Datos del proveedor (razón social, RUC, dirección) correctos. | ❌ (DATA-02) |

### RF-8 Enlaces (`/links`)
Página tipo Linktree: CTA de reseña en Google, menú, WhatsApp, PedidosYa, redes, ubicación, quiénes somos, juego, horario. ⚠️ estado "ABIERTO" y rating fijos (DATA-05). Ver [`LINKS_PAGE.md`](./LINKS_PAGE.md).

### RF-9 Quiénes somos (`/quienes`)
Misión, visión, filosofía, CTA a WhatsApp y menú. ✅

### RF-10 Reto Gamer (`/reto-gamer`)
Juego canvas "Neon Burger Hell" (shooter con oleadas y jefe) como gancho de marca. Récord local en el navegador y "código de participación". ⚠️ registro con nombre/WhatsApp inalcanzable (BUG-09); el código no es verificable (DEAD-10). Alcance a decidir (D7).

### RF-11 SEO y PWA
| ID | Requisito | Estado |
| :--- | :--- | :-: |
| RF-11.1 | Metadata global, Open Graph y Twitter con imagen 1200×630. | ⚠️ imagen inexistente (SEO-01) |
| RF-11.2 | JSON-LD `Restaurant` (menú, horario, dirección, geo) y `FAQPage`. | ✅ ⚠️ datos inconsistentes |
| RF-11.3 | `sitemap.xml` (páginas + productos) y `robots.txt` (bloquea `/api/`). | ✅ |
| RF-11.4 | Metadata propia por página. | ⚠️ solo home y productos (SEO-02) |
| RF-11.5 | Manifest PWA instalable. | ❌ íconos inexistentes (DEAD-01) |

## 6. Reglas de negocio (fuente: código actual)

| Regla | Valor | Definida en |
| :--- | :--- | :--- |
| Máx. unidades por producto | 10 | `features/home/constants.js` |
| Máx. unidades por pedido | 30 | `features/home/constants.js` |
| Rate-limit pedidos | 5 por IP cada 15 min | `features/home/constants.js` |
| Categoría principal | `LAS INTOCABLES` | `PRIMARY_CATEGORIES` |
| Complementos que requieren principal | `BEBIDAS` (las GUARNICIONES no) | `COMPLEMENT_CATEGORIES` |
| Delivery | Sin efectivo; requiere dirección o GPS; no admite pre-orden | `checkout/submitOrder.js` |
| Pre-orden | Solo recojo, cuando está cerrado | `checkout/submitOrder.js` |
| Precio final | Lo calcula el ERP por SKU | `docs/webhook-pedidos.md` |
| Moneda | PEN (S/) | — |
| Horario | ver D1 en el plan (hoy 4 versiones) | `data/menuData.js` |

## 7. Requisitos no funcionales

| Área | Requisito |
| :--- | :--- |
| Rendimiento | LCP < 2.5 s en 4G para `/`; JS inicial mínimo; imágenes WebP/AVIF. |
| Disponibilidad | Si el ERP falla, el cliente recibe mensaje claro y puede pedir por WhatsApp directo. |
| Seguridad | Dependencias sin vulnerabilidades altas/críticas; secretos solo en servidor; el servidor valida todo; cabeceras de seguridad. |
| Privacidad | Aviso de privacidad; datos mínimos; PII no se loguea. |
| Accesibilidad | WCAG 2.1 AA: labels, foco visible, diálogos accesibles, objetivos táctiles ≥ 44 px. |
| Compatibilidad | Últimas 2 versiones de Chrome/Safari iOS/Samsung Internet. Mobile-first. |
| Idioma | Español (Perú), con tildes correctas. |
| Mantenibilidad | Reglas de negocio en módulos puros con tests; un único origen para datos del negocio. |

## 8. Dependencias externas

| Servicio | Uso | Configuración |
| :--- | :--- | :--- |
| ERP Big Jack (`bigjack-rp.vercel.app`) | Registro de ventas e inventario | `WEBHOOK_ORDERS_URL`, `ERP_BASE_URL`, `WEBHOOK_MENU_SECRET` |
| Gmail SMTP (Nodemailer) | Notificación de reclamos | `GMAIL_USER`, `GMAIL_PASS`, `RECIPIENT_EMAIL` |
| Formspree (opcional) | Canal alternativo de reclamos | `FORMSPREE_URL` |
| WhatsApp (`wa.me`) | Confirmación y coordinación | `restaurantInfo.contact.whatsapp` |
| Google Maps | Embed, enlaces, ubicación GPS del cliente | URLs en código |
| PedidosYa / Rappi / inDrive | Delivery alternativo | Constantes en `constants.js` |
| Vercel | Hosting | — |

## 9. Roadmap sugerido (después de la remediación)

1. Analítica respetuosa (Vercel Analytics o Plausible) + eventos: `add_to_cart`, `begin_checkout`, `order_registered`, `whatsapp_opened`.
2. Carta editable sin deploy (leer catálogo desde el ERP con caché corta).
3. Estado del pedido (consulta por `orderId`).
4. Pago en línea (link de pago Yape/tarjeta).
5. Programa de lealtad real (hoy solo mencionado en docs).

## 10. Preguntas abiertas

Ver la tabla de **Decisiones pendientes** (D1–D8) en [`REMEDIATION_PLAN.md`](./REMEDIATION_PLAN.md#decisiones-pendientes).
