# Big Jack Menu

Sitio web del menú y checkout de Big Jack, integrado con el ERP para registrar pedidos en línea.

## Configuración rápida

1. Instala dependencias:

```bash
npm install
```

1. Crea `.env.local` con estas variables:

```env
ERP_BASE_URL=https://bigjack-rp.vercel.app
WEBHOOK_ORDERS_URL=https://bigjack-rp.vercel.app/api/webhooks/orders
WEBHOOK_MENU_SECRET=tu_secret_opcional
```

1. Ejecuta el proyecto:

```bash
npm run dev
```

## Flujo de pedidos online

1. El cliente arma carrito en frontend con SKU por variante.
2. El checkout construye payload webhook con `eventId` idempotente.
3. Frontend envía `POST /api/online-orders`.
4. La API de Next.js reenvía al webhook en `${WEBHOOK_ORDERS_URL}`.
5. Si existe `WEBHOOK_MENU_SECRET`, se envía en header `x-webhook-secret`.

## Estructura clave

- `app/data/menuData.js`: catálogo con SKU en producto y opciones.
- `app/lib/cartModel.js`: modelo de carrito y migración de carritos legacy.
- `app/lib/onlineOrders.js`: armado de payload webhook + cliente de pedidos online.
- `app/api/online-orders/route.js`: proxy seguro al webhook del ERP.
- `app/page.js`: checkout y envío del pedido al sistema.
- `webhook-pedidos.md`: contrato técnico actualizado del webhook.

## Notas técnicas

- Si faltan SKUs válidos, el pedido no se envía.
- En horario cerrado se permite pre-orden para recojo.
- El webhook procesa por SKU y cantidad; el precio final lo calcula el ERP.
