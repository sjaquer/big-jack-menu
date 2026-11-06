# AGENTS.md — Guía para agentes de IA y colaboradores

Instrucciones operativas para trabajar en **Big Jack Menu** (carta digital + checkout de la hamburguesería BIG JACK, Lima). Léelas antes de modificar código.

## Documentación de referencia

| Necesitas… | Lee |
| :--- | :--- |
| Qué hace el producto y sus reglas de negocio | [`docs/PRD.md`](docs/PRD.md) |
| Cómo está construido (rutas, datos, flujo, API, env) | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Identidad de marca, voz y tono, textos al cliente, redes | `bigjack/marca/MANUAL_DE_MARCA.md` (carpeta local, fuera de git; índice en `bigjack/README.md`) |
| Colores, tipografía, componentes de marca (en código) | [`docs/DESIGN.md`](docs/DESIGN.md) |
| Problemas conocidos (con IDs `SEC-01`, `BUG-03`…) | [`docs/AUDIT.md`](docs/AUDIT.md) |
| Qué arreglar y en qué orden | [`docs/REMEDIATION_PLAN.md`](docs/REMEDIATION_PLAN.md) |
| Contrato con el ERP | [`docs/webhook-pedidos.md`](docs/webhook-pedidos.md) |
| Cómo contribuir y verificar un cambio | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Textos para configuración del repo en GitHub | [`.github/GITHUB_SETUP.md`](.github/GITHUB_SETUP.md) |

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # debe quedar en 0 errores / 0 warnings
npm test           # Vitest (unitarios de dominio)
npm run build      # debe compilar antes de dar por terminado un cambio
npm audit --omit=dev
```

Hay tests con Vitest (`*.test.js` junto al módulo). Si agregas lógica en `app/lib/` o `app/features/shop/`, agrega o actualiza los tests correspondientes.

## Stack y convenciones

- Next.js 16 App Router · React 19 · Tailwind CSS v4 · JavaScript (sin TypeScript) · `lucide-react` para íconos.
- Idioma del producto y de los comentarios: **español**, con tildes en textos visibles al usuario.
- Componentes en PascalCase, un componente por archivo, `export default`. Utilidades puras en `app/lib/` o `app/features/<feature>/`.
- Estilos con utilidades Tailwind y tokens de marca (`bg-bj-yellow`, `text-bj-silver`, `bg-bj-bg`…, definidos en `@theme` de `app/globals.css`); no escribas hex sueltos. Dirección visual: **menos es más** (ver `docs/DESIGN.md`). Amarillo `#FCC900`, **no** `#D99133`.
- Imágenes con `next/image`; assets en `public/images/` en WebP.
- Prefiere Server Components; usa `"use client"` solo en el componente que necesita estado/efectos.
- **Nada de monolitos:** separa dominio puro (`lib/`), hooks, componentes de presentación y página. Presupuesto orientativo: componente ≤ 250 líneas, página ≤ 150. No agregues lógica a los archivos grandes listados en `AUDIT.md` QLT-11; extrae primero (ver Fase 6 del plan).
- Textos visibles al usuario con la voz de marca de `bigjack/marca/MANUAL_DE_MARCA.md` (§5 y §11), sin sacrificar claridad.

## Invariantes — no romper

1. **SKUs:** cada `option.sku` de `app/data/menuData.js` debe existir en el ERP. **No cambies, inventes ni elimines SKUs** sin confirmación del dueño. El ERP rechaza SKUs desconocidos.
2. **Precios:** el ERP calcula el precio final por SKU. Los precios del front son referenciales; si cambias uno, avisa que debe cambiarse también en el ERP.
3. **Secretos:** `WEBHOOK_MENU_SECRET`, `GMAIL_PASS`, etc. solo se leen en servidor (`route.js`, `actions.js`). Nunca con prefijo `NEXT_PUBLIC_`. Nunca en el repo.
4. **Contrato del webhook:** `items` solo con `sku`, `quantity`, `notes`; `eventId` único por intento de pedido (idempotencia). No cambies la forma del payload sin actualizar `docs/webhook-pedidos.md` y coordinar con el ERP.
5. **Reglas de negocio** (máximos 10/30, bebidas solo con hamburguesa, delivery sin efectivo, pre-orden solo recojo): si las cambias, cámbialas en **todos** los puntos. El servidor ya usa el módulo compartido `lib/orderRules.js`; el cliente todavía valida en `features/shop/constants.js`, `cartRules.js`, `checkout/submitOrder.js`, `hooks/useCartActions.js`, `components/cart/DeliveryStep.js` y `PaymentStep.js`. No dejes una regla solo en el cliente.
6. **Libro de Reclamaciones:** nunca devolver éxito si el reclamo no se entregó/persistió (obligación legal).
7. **Datos del negocio** (horario, RUC, razón social, dirección, WhatsApp, links de apps): la fuente es `restaurantInfo` en `menuData.js`. Para mostrarlos usa `lib/site.js` (URLs, teléfono, dirección) y `lib/schedule.js` (horario). No escribas horarios, teléfonos ni URLs a mano en componentes.

## Prohibido

- `npm audit fix --force` — ya bajó Next de v16 a v9 una vez y rompió el build. Actualiza versiones mayores a mano.
- Ejecutar `scripts/test-webhook-orders.ps1` sin `-WebhookUrl` apuntando a un entorno de prueba: por defecto golpea el **ERP de producción** y crea ventas reales.
- Enviar pedidos reales al ERP de producción para "probar".
- Agregar dominios a `images.remotePatterns` sin necesidad.
- Agregar `alert()`/`confirm()` nuevos (usar UI en página; ver QLT-03).
- Commits con `.env*` (salvo `.env.example`).
- Copiar contenido de `bigjack/` (recetas, costos, proveedores) a archivos versionados: el repo es público y esa carpeta está en `.gitignore` a propósito.

## Cómo trabajar un cambio

1. Ubica el hallazgo/tarea en `docs/REMEDIATION_PLAN.md` y su detalle en `docs/AUDIT.md`. Si la tarea tiene 🔒, la decisión de negocio debe estar resuelta.
2. Rama `fix/<ID>-descripcion` o `feat/<descripcion>`; un tema por PR.
3. Cambios mínimos y enfocados; respeta el estilo del archivo que tocas.
4. Verifica: `npm run lint`, `npm run build` y prueba manual del flujo afectado en `npm run dev` (móvil 360 px y desktop).
5. Actualiza la documentación afectada (PRD/ARCHITECTURE/AUDIT) y marca la casilla del plan.
6. Mensajes de commit en estilo convencional (`fix:`, `feat:`, `refactor:`, `docs:`, `style:`), en inglés como el historial existente.

## Mapa rápido

| Quiero cambiar… | Archivo |
| :--- | :--- |
| Productos, precios, horario, dirección, contacto, links de apps | `app/data/menuData.js` |
| Textos de categorías de la carta | `categoryInfo` en `app/data/menuData.js` |
| Límites, categorías principales/complementos, métodos de pago, upsell | `app/features/shop/constants.js` |
| Validaciones del checkout (cliente) | `app/features/shop/checkout/submitOrder.js` |
| Mensajes al cliente al agregar/quitar | `app/features/shop/hooks/useCartActions.js` |
| Payload hacia el ERP | `app/lib/onlineOrders.js` |
| Validación y proxy al ERP (servidor) | `app/api/online-orders/route.js` |
| Cálculo abierto/cerrado | `app/lib/openHours.js` |
| Libro de Reclamaciones | `app/(shop)/libro-de-reclamaciones/` + `app/actions.js` |
| Metadata, JSON-LD, FAQ, `llms.txt` | `app/layout.js`, `app/features/shop/seo.js`, `app/lib/llms.js` |
| Hero animado | `app/features/shop/components/hero/` + `.scroll-hero` en `app/globals.css` |
| Estilos y tokens de marca | `app/globals.css` (`@theme`: `bj-yellow`, `bj-bg`…) |
