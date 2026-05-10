# Big Jack Menu 🍔

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)

**Big Jack Menu** is a modern, responsive digital menu and checkout system designed for Big Jack. It integrates seamlessly with an ERP system via webhooks to handle online orders, real-time catalog management, and customer interactions.

---

## 🇪🇸 Español

### Características Principales
- **Menú Digital Interactivo**: Catálogo de productos con variantes y opciones personalizables.
- **Checkout Inteligente**: Flujo de pedido optimizado con soporte para delivery y recojo.
- **Integración con ERP**: Envío de pedidos mediante webhooks seguros con soporte para idempotencia.
- **Página de Enlaces (Linktree Style)**: Centralización de redes sociales y CTAs (Reviews, WhatsApp, etc.).
- **Libro de Reclamaciones**: Cumplimiento legal con envío automatizado de reclamos por correo.

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
- **Complaints Book**: Legal compliance with automated email notifications for customer claims.

### Quick Start
1. **Install dependencies**: `npm install`
2. **Environment Variables**: Copy `.env.example` to `.env.local` and configure your credentials.
3. **Development**: `npm run dev`

---

## 🛠️ Technical Details / Detalles Técnicos

### Environment Variables / Variables de Entorno
Required variables for full functionality:
- `ERP_BASE_URL`: Base URL of the ERP system.
- `WEBHOOK_ORDERS_URL`: Specific endpoint for order webhooks.
- `WEBHOOK_MENU_SECRET`: Secret key for webhook authentication.
- `GMAIL_USER` & `GMAIL_PASS`: SMTP credentials for the Complaints Book.
- `RECIPIENT_EMAIL`: Target email for complaint notifications.

### Project Structure / Estructura del Proyecto
- `app/data/menuData.js`: Centralized product catalog (SKUs are critical).
- `app/lib/onlineOrders.js`: Payload builder and checkout logic.
- `app/api/online-orders/route.js`: Secure proxy for ERP communication.
- `app/links/page.js`: High-conversion links landing page.
- `docs/`: Technical documentation and integration guides.

### Documentation / Documentación
For more details, check the `docs/` folder:
- [Webhook Integration](docs/webhook-pedidos.md)
- [Links Page Design](docs/LINKS_PAGE.md)
- [Legacy API Reference](docs/legacy/online-orders-api.md)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for Big Jack.
