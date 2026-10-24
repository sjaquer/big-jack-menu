# Big Jack Menu 🍔

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)

**Big Jack Menu** is a modern, responsive digital menu and checkout system designed for Big Jack. It registers online orders in the Big Jack ERP via a webhook and hands the order off to WhatsApp. The catalog is a static file (`app/data/menuData.js`).

---

## 🇪🇸 Español

### Características Principales
- **Menú Digital Interactivo**: Catálogo de productos con variantes y opciones personalizables.
- **Checkout Inteligente**: Flujo de pedido optimizado con soporte para delivery y recojo.
- **Integración con ERP**: Envío de pedidos mediante webhooks seguros con soporte para idempotencia.
- **Página de Enlaces (Linktree Style)**: Centralización de redes sociales y CTAs (Reviews, WhatsApp, etc.).
- **Libro de Reclamaciones**: Cumplimiento legal con envío automatizado mediante Server Action y sanitización de datos (XSS).

### Configuración Rápida
1. **Instalar dependencias**: `npm install`
2. **Variables de Entorno**: Copia `.env.example` a `.env.local` y configura las credenciales.
3. **Desarrollo**: `npm run dev`

---

## 🇺🇸 English

### Key Features
- **Interactive Digital Menu**: Product catalog with variants and customizable options.
- **Smart Checkout**: Optimized order flow supporting both delivery and pickup.
- **ERP Integration**: Order submission via secure webhooks with idempotency support.
- **Links Page (Linktree Style)**: Centralized social media and CTAs (Reviews, WhatsApp, etc.).
- **Complaints Book**: Legal compliance with Server Action automated email notifications and XSS sanitization.

### Quick Start
1. **Install dependencies**: `npm install`
2. **Environment Variables**: Copy `.env.example` to `.env.local` and configure your credentials.
3. **Development**: `npm run dev`

---

## 🛠️ Technical Details / Detalles Técnicos

### Environment Variables / Variables de Entorno
See `.env.example` and [docs/ARCHITECTURE.md §7](docs/ARCHITECTURE.md#7-variables-de-entorno):
- `WEBHOOK_ORDERS_URL` (or `ERP_BASE_URL`): ERP order webhook.
- `WEBHOOK_MENU_SECRET`: sent as `x-webhook-secret`.
- `GMAIL_USER` & `GMAIL_PASS`, `RECIPIENT_EMAIL`: SMTP for the Complaints Book.
- `FORMSPREE_URL`: optional server-to-server Formspree endpoint.
- `NEXT_PUBLIC_BASE_URL`: public site URL (metadata, sitemap, robots).

### Project Structure / Estructura del Proyecto
- `app/data/menuData.js`: Centralized product catalog (SKUs are critical).
- `app/lib/onlineOrders.js`: Payload builder and checkout logic.
- `app/api/online-orders/route.js`: Secure proxy for ERP communication.
- `app/actions.js`: Server Action for Complaints Book processing with HTML sanitization.
- `app/links/page.js`: High-conversion links landing page.
- `docs/`: Technical documentation and integration guides.

### Documentation / Documentación
Start at [docs/README.md](docs/README.md). Key documents:
- [PRD](docs/PRD.md) — product requirements and business rules.
- [Architecture](docs/ARCHITECTURE.md) — routes, data model, order flow, API, env vars.
- [Design System](docs/DESIGN.md) — tokens, typography, brand components.
- [Audit](docs/AUDIT.md) — vulnerabilities, bugs, tech debt (2026-10-24).
- [Remediation Plan](docs/REMEDIATION_PLAN.md) — phased fixes and pending business decisions.
- [Webhook Integration](docs/webhook-pedidos.md) — ERP contract.
- [AGENTS.md](AGENTS.md) — rules for AI agents and contributors.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for Big Jack.
