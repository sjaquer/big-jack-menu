# Webhook de pedidos — contrato con el ERP

**Última revisión:** 2026-11-02

> **⚠️ DESACTIVADO por ahora.** El envío al webhook del ERP está apagado con el flag
> `FEATURES.erpOrders = false` (`app/lib/site.js`). Mientras tanto, **todos los pedidos se
> coordinan por WhatsApp**: el checkout valida y arma el pedido igual, pero no llama al ERP
> y abre WhatsApp con el detalle. El código del webhook (`/api/online-orders`,
> `app/lib/onlineOrders.js`, `app/lib/orderRules.js`) y Turnstile quedan intactos. Para
> reactivarlo basta con poner `erpOrders: true` y configurar las variables de entorno.
> A futuro se reemplazará por la API definitiva del ERP.

## Endpoint

- Método: `POST`
- URL: `/api/webhooks/orders` (o la que defina `WEBHOOK_ORDERS_URL`)
- Header opcional: `x-webhook-secret` (solo si el ERP define `WEBHOOK_MENU_SECRET`)
- Timeout desde el frontend: 15 s

## Flujo

```text
Navegador → POST /api/online-orders → validación + Turnstile → POST webhook del ERP
```

El navegador **nunca** llama directo al ERP ni conoce el secreto. El proxy:

1. exige mismo origen, `Content-Type: application/json` y cuerpo ≤ 16 KB;
2. aplica rate-limit por IP (5 pedidos / 15 min y 1 cada 20 s, en memoria);
3. valida reglas de negocio y reconstruye el pedido con lista blanca (`lib/orderRules.js`);
4. valida el token de Cloudflare Turnstile;
5. reenvía al ERP y normaliza la respuesta.

## Payload

```json
{
  "eventId": "menu-20261102-ab12cd",
  "orderDate": "2026-11-02T20:15:00.000Z",
  "source": "menu-web",
  "customerName": "Juan Pérez",
  "customerPhone": "+51987654321",
  "customer": {
    "name": "Juan Pérez",
    "phone": "+51987654321"
  },
  "paymentMethod": "yape",
  "notes": "Sin cebolla | Referencia: portón negro | Ubicación: https://www.google.com/maps?q=-12.04,-77.03",
  "items": [
    { "sku": "PRD-LAB-JFSY", "quantity": 2, "notes": "Simple (1 carne)" },
    { "sku": "PRD-INK-PXC0", "quantity": 1, "notes": "Botella 600 ml" }
  ],
  "metadata": {
    "origin": "menu-web",
    "channel": "menu-web",
    "orderType": "pickup",
    "pickupTime": "now",
    "scheduledTime": null,
    "isPreOrder": false,
    "locationLink": null,
    "deliveryAddress": null
  }
}
```

Campos relevantes:

| Campo | Reglas |
| :--- | :--- |
| `eventId` | Único por intento de pedido. Formato `menu-AAAAMMDD-xxxxxx`; el ERP aplica idempotencia. |
| `orderDate` | Lo genera el servidor; el cliente no puede imponerlo. |
| `items[]` | Solo `sku`, `quantity` y `notes`. La cantidad es entera, 1–10 por SKU y ≤ 30 en total. |
| `paymentMethod` | `efectivo`, `yape`, `plin` o `tarjeta`. Delivery no acepta efectivo. |
| `metadata.orderType` | `pickup` o `delivery`. |
| `metadata.isPreOrder` | Lo decide el servidor: `true` fuera de horario (solo recojo). |
| `metadata.locationLink` | Solo enlaces de Google Maps con coordenadas generados por la web. |

## Reglas operativas del lado ERP

1. Solo se procesa por SKU y cantidad.
2. El precio lo calcula el ERP usando `products.salePrice`.
3. Se registra venta normal en `sales` y `sale_items` como POS.
4. Se descuenta inventario automáticamente.
5. Se guarda en `online_orders` para seguimiento.
6. La idempotencia se aplica por `eventId`.

> **No cambies la forma del payload** sin actualizar este documento y coordinar con el equipo del ERP. `items` solo lleva `sku`, `quantity` y `notes`.

## Variables de entorno en este frontend

```env
ERP_BASE_URL=https://bigjack-rp.vercel.app
WEBHOOK_ORDERS_URL=https://bigjack-rp.vercel.app/api/webhooks/orders
WEBHOOK_MENU_SECRET=
```

`WEBHOOK_ORDERS_URL` tiene prioridad si está definido. Si no existe, se construye con `ERP_BASE_URL + /api/webhooks/orders`.

## Pruebas

`scripts/test-webhook-orders.ps1` existe para probar el endpoint, pero:

- **Nunca** lo ejecutes contra producción sin `-WebhookUrl` apuntando a un entorno de prueba o a `localhost`.
- El script solo cubre PowerShell; el reemplazo multiplataforma en Node está pendiente (OPS-01 / 5.4).
- Un pedido válido contra el ERP **crea una venta real y descuenta inventario**.

## Respuestas del proxy

| Status | Significado |
| :-: | :--- |
| 200 | `{ success: true, orderId, duplicated }`. |
| 400 | Regla de negocio o formato inválido. |
| 403 | Origen no permitido o Turnstile inválido. |
| 413 / 415 | Cuerpo demasiado grande / no es JSON. |
| 422 | El ERP rechazó el pedido. |
| 429 | Límite de pedidos. |
| 502 / 504 | Error del ERP o timeout. |

La respuesta cruda del ERP solo se registra en el servidor.
