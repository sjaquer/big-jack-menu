# Big Jack Menu

Sitio web del menú y checkout de Big Jack, integrado con el ERP para registrar pedidos en línea.

## Configuración rápida

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` con estas variables:

```env
ERP_BASE_URL=https://bigjack-rp.vercel.app
ERP_ONLINE_ORDERS_KEY=tu_api_key
```

También puedes usar `ONLINE_ORDERS_API_KEY` en lugar de `ERP_ONLINE_ORDERS_KEY`.

3. Ejecuta el proyecto:

```bash
npm run dev
```

## Flujo de pedidos online

1. El cliente arma carrito en frontend con SKU por variante.
2. El checkout construye payload ERP con `externalOrderId` idempotente.
3. Frontend envía `POST /api/online-orders`.
4. La API de Next.js reenvía al ERP en `${ERP_BASE_URL}/api/online-orders` con header `x-online-orders-key`.

## Estructura clave

- `app/data/menuData.js`: catálogo con SKU en producto y opciones.
- `app/lib/cartModel.js`: modelo de carrito y migración de carritos legacy.
- `app/lib/onlineOrders.js`: armado de payload + cliente de pedidos online.
- `app/api/online-orders/route.js`: proxy seguro al ERP.
- `app/page.js`: checkout y envío del pedido al sistema.

## Notas técnicas

- Si faltan SKUs válidos, el pedido no se envía.
- En horario cerrado se permite pre-orden para recojo.
- El endpoint devuelve `orderId` y `saleId` cuando aplica, y se muestran en UI.
