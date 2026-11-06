# Big Jack Menu 🍔

[![CI](https://github.com/sjaquer/big-jack-menu/actions/workflows/ci.yml/badge.svg)](https://github.com/sjaquer/big-jack-menu/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-94%20passing-2ea44f)](#calidad)
[![License: MIT](https://img.shields.io/badge/License-MIT-FCC900.svg)](LICENSE)

Carta digital y checkout de **BIG JACK**, hamburguesería del Centro de Lima. El cliente arma su pedido, elige recojo o delivery y lo confirma por WhatsApp. El catálogo vive en un archivo estático; no hay base de datos ni panel de administración.

> **Sitio:** https://bigjack.vercel.app
> **Estado:** producción. Los pedidos se coordinan por WhatsApp. La integración con el ERP vía webhook está implementada pero **desactivada** con el flag `FEATURES.erpOrders` hasta que exista la API definitiva del ERP.

---

## Características

- **Carta digital responsive** con hamburguesas en formato grande, bebidas en filas compactas, precios "desde" y detalle por producto.
- **Carrito persistente** en `localStorage`, sincronizado entre pestañas y entre la carta y las fichas de producto.
- **Checkout en dos pasos** (pedido → entrega y pago) con recojo o delivery, geolocalización opcional, métodos de pago y aviso de privacidad.
- **Reglas de negocio compartidas** entre cliente y servidor: máximos de 10 por producto / 30 por pedido, bebidas solo con hamburguesa, delivery sin efectivo y pre-órdenes solo para recojo.
- **Horario real** calculado en `America/Lima`, con cuenta regresiva y pre-órdenes fuera de horario.
- **Confirmación por WhatsApp** con el resumen del pedido y el total.
- **SEO local e IA**: metadata por ruta, JSON-LD (`Restaurant`, `Product`, `BreadcrumbList`, `FAQPage`), sitemap con imágenes, `robots.txt` y `llms.txt`.
- **PWA instalable**: manifest, íconos y atajos.
- **Páginas de marca**: `/links`, `/quienes`, `/privacidad`, `/reto-gamer` (minijuego "Arma tu burger") y `/libro-de-reclamaciones` (desactivado temporalmente).
- **Analítica** con Google Analytics 4 y Google Tag Manager (eventos de e-commerce y del juego).
- **Anti-abuso listo para producción**: CSP, cabeceras de seguridad, Turnstile y rate-limit en el proxy de pedidos.

## Stack

| Capa | Tecnología |
| :--- | :--- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, `lucide-react` |
| Fuentes | `next/font/google` — Poppins y Anton |
| Datos | Catálogo estático en `app/data/menuData.js`; estado del usuario en `localStorage` |
| Servidor | Route Handler (`/api/online-orders`) + Server Action (`sendComplaint`) |
| Email | Nodemailer (Gmail SMTP) o Formspree opcional |
| Tests | Vitest |
| Hosting | Vercel |

## Inicio rápido

Requisitos: **Node.js ≥ 20.9** (el repo usa Node 24 LTS en `.nvmrc`).

```bash
git clone git@github.com:sjaquer/big-jack-menu.git
cd big-jack-menu
npm install

cp .env.example .env.local   # completa solo lo que necesites
npm run dev                  # http://localhost:3000
```

Sin variables de entorno la app funciona en local para navegar la carta y probar el checkout (los pedidos se confirman por WhatsApp). Para correos del Libro de Reclamaciones o el webhook del ERP sí necesitas credenciales.

## Scripts

| Comando | Qué hace |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000`. |
| `npm run build` | Build de producción. Antes ejecuta `npm run og` (`prebuild`). |
| `npm start` | Sirve el build de producción. |
| `npm run lint` | ESLint. Debe quedar en 0 errores y 0 warnings. |
| `npm test` | Vitest (94 tests de dominio). |
| `npm run brand` | Regenera logos, íconos y piezas de marca desde `scripts/brand/`. |
| `npm run og` | Regenera la imagen Open Graph general y las de cada producto. |

## Estructura del proyecto

```text
app/
├── (shop)/                  # Rutas con header, carrito y footer compartidos
│   ├── page.js              # Carta (/)
│   ├── product/[slug]/      # Ficha de producto (SSG)
│   ├── quienes/             # Quiénes somos
│   ├── privacidad/          # Política de privacidad
│   └── libro-de-reclamaciones/
├── api/online-orders/       # Proxy de pedidos al ERP (desactivado por flag)
├── links/                   # Página de enlaces (link-in-bio)
├── reto-gamer/              # Minijuego "Arma tu burger"
├── components/              # Header, footer, diálogos, toasts, íconos
├── data/menuData.js         # ⭐ Fuente única: negocio, categorías, productos y SKUs
├── features/shop/           # Dominio, hooks, contexto y componentes de la tienda
├── lib/                     # Utilidades puras con tests (horario, carrito, reglas, SEO)
├── actions.js               # Server Action del Libro de Reclamaciones
└── globals.css              # Tokens de marca y estilos base

docs/                        # PRD, arquitectura, diseño, auditoría y plan
scripts/                     # Marca, Open Graph y prueba del webhook
public/                      # Imágenes WebP, logos SVG e íconos PWA
```

## Reglas de negocio

| Regla | Valor |
| :--- | :--- |
| Máximo por producto | 10 unidades |
| Máximo por pedido | 30 unidades |
| Bebidas | Solo se venden junto con al menos una hamburguesa |
| Delivery | Sin efectivo; requiere dirección o ubicación GPS; no admite pre-orden |
| Pre-orden | Solo recojo, fuera de horario |
| Precio final | Referencial en el front; en modo ERP lo calcula el ERP por SKU |
| Horario | Lunes a sábado, 7:00 p. m. a 12:00 a. m. (hora de Lima). Domingo cerrado |
| Moneda | PEN (S/) |

Las reglas viven en `app/features/shop/constants.js`, `app/lib/orderRules.js` y `app/lib/cartModel.js`. Los datos del negocio (horario, dirección, WhatsApp, redes) se editan **solo** en `restaurantInfo` dentro de `app/data/menuData.js`.

> **No cambies SKUs ni precios sin coordinar con el ERP.** Cada `option.sku` debe existir en el ERP; el webhook rechaza SKUs desconocidos.

## Variables de entorno

Copia `.env.example` a `.env.local` (nunca commitees `.env.local`). Los secretos se leen solo en servidor.

| Variable | Uso |
| :--- | :--- |
| `WEBHOOK_ORDERS_URL` | URL completa del webhook del ERP. Tiene prioridad. |
| `ERP_BASE_URL` | Base del ERP; se le agrega `/api/webhooks/orders`. |
| `WEBHOOK_MENU_SECRET` | Header `x-webhook-secret` para el ERP. |
| `GMAIL_USER`, `GMAIL_PASS` | SMTP para el Libro de Reclamaciones. |
| `RECIPIENT_EMAIL` | Destino de los reclamos. |
| `FORMSPREE_URL` | Canal alternativo de reclamos (opcional). |
| `NEXT_PUBLIC_BASE_URL` | URL pública para metadata, sitemap, robots y JSON-LD. |
| `GOOGLE_SITE_VERIFICATION` | Verificación de Search Console para otro dominio. |
| `NEXT_PUBLIC_GTM_ID` | Contenedor de Google Tag Manager (vacío = no se carga). |
| `NEXT_PUBLIC_GA_ID` | ID de medición de GA4 (si falta, se usa el de `lib/site.js`). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clave pública de Cloudflare Turnstile. |
| `TURNSTILE_SECRET_KEY` | Clave secreta de Turnstile (solo servidor). |

Detalle completo en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#7-variables-de-entorno).

## Flujo de pedido

1. El cliente agrega productos al carrito (persistido en `localStorage`).
2. Completa nombre, teléfono, tipo de entrega y método de pago.
3. El cliente valida las reglas y arma el mensaje de WhatsApp.
4. **Modo actual:** se muestra la confirmación y el botón **Enviar por WhatsApp** con el resumen.
5. **Modo ERP** (`FEATURES.erpOrders = true`): el pedido se envía a `/api/online-orders`, se valida con Turnstile y se reenvía al webhook del ERP con lista blanca de campos.

Contrato del webhook: [`docs/webhook-pedidos.md`](docs/webhook-pedidos.md).

## Calidad

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

El CI de GitHub Actions (`.github/workflows/ci.yml`) ejecuta lint, tests, build y auditoría de dependencias en cada push a `master` y en cada pull request.

## Documentación

Empieza por [`docs/README.md`](docs/README.md).

| Documento | Contenido |
| :--- | :--- |
| [`docs/PRD.md`](docs/PRD.md) | Producto, usuarios, alcance, requisitos y reglas de negocio. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Stack, rutas, modelo de datos, flujo, API y variables de entorno. |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Sistema de diseño, tokens, tipografía y patrones de UI. |
| [`docs/AUDIT.md`](docs/AUDIT.md) | Auditoría técnica con IDs y estado de cada hallazgo. |
| [`docs/REMEDIATION_PLAN.md`](docs/REMEDIATION_PLAN.md) | Plan por fases y decisiones pendientes. |
| [`docs/webhook-pedidos.md`](docs/webhook-pedidos.md) | Contrato con el ERP. |
| `bigjack/` | Base de conocimiento de la marca (manuales, recetas, fotos). Carpeta local, fuera de git. |
| [`AGENTS.md`](AGENTS.md) | Reglas para agentes de IA y colaboradores. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo proponer cambios, ramas y PRs. |
| [`SECURITY.md`](SECURITY.md) | Cómo reportar vulnerabilidades. |

## Despliegue

El proyecto está pensado para **Vercel**: importa el repositorio, configura las variables de entorno del proyecto y despliega. El `prebuild` regenera las imágenes Open Graph antes de compilar.

## Roadmap

- Reactivar el Libro de Reclamaciones conforme al reglamento (enero 2027).
- Volver a publicar el RUC cuando esté confirmado.
- Migrar los pedidos a la API definitiva del ERP.
- Rate-limit persistente (Upstash/Vercel KV o Vercel Firewall).
- Evaluar el retorno de PedidosYa.

## Contribuir

Lee [`CONTRIBUTING.md`](CONTRIBUTING.md). Usa ramas `feat/…`, `fix/…` o `docs/…`, un tema por PR y mensajes de commit convencionales en inglés.

## Seguridad

No abras issues públicos con credenciales ni datos personales. Sigue el proceso de [`SECURITY.md`](SECURITY.md).

## Licencia

[MIT](LICENSE) © Sebastián Jaque. Desarrollado con ❤️ para BIG JACK.

---

## English summary

**Big Jack Menu** is a digital menu and checkout for BIG JACK, a burger restaurant in Lima, Peru. Customers build an order, choose pickup or delivery, and confirm it on WhatsApp. The catalog is a static file, the UI is mobile-first, and orders follow shared business rules on both client and server.

Production currently uses WhatsApp checkout. The ERP webhook integration is implemented but disabled behind the `FEATURES.erpOrders` flag. Technical docs are in Spanish; see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the API and data model.
