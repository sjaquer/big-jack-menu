# Webhook de pedidos

Este proyecto envia los pedidos al webhook del ERP.

## Endpoint

- Metodo: POST
- URL: `/api/webhooks/orders`
- Header opcional: `x-webhook-secret` (solo si el ERP define `WEBHOOK_MENU_SECRET`)

## Payload recomendado

```json
{
  "eventId": "menu-20260419-0001",
  "orderDate": "2026-04-19T20:15:00.000Z",
  "source": "menu-web",
  "customer": {
    "name": "Juan Perez",
    "phone": "+51987654321"
  },
  "paymentMethod": "yape",
  "notes": "Entrega rapida",
  "items": [
    {
      "sku": "BURG-002",
      "quantity": 2,
      "notes": "Sin cebolla"
    },
    {
      "sku": "BEB-001",
      "quantity": 1
    }
  ],
  "metadata": {
    "origin": "menu-web"
  }
}
```

## Reglas operativas

1. Solo se procesa por SKU y cantidad.
2. El precio lo calcula el ERP usando `products.salePrice`.
3. Se registra venta normal en `sales` y `sale_items` como POS.
4. Se descuenta inventario automaticamente.
5. Se guarda en `online_orders` para seguimiento.
6. La idempotencia se aplica por `eventId`.

## Variables de entorno en este frontend

```env
ERP_BASE_URL=https://bigjack-rp.vercel.app
WEBHOOK_ORDERS_URL=https://bigjack-rp.vercel.app/api/webhooks/orders
WEBHOOK_MENU_SECRET=
```

`WEBHOOK_ORDERS_URL` tiene prioridad si esta definido. Si no existe, se construye con `ERP_BASE_URL + /api/webhooks/orders`.
