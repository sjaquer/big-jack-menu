# Nuevas funcionalidades

## Migracion a webhook de pedidos

Fecha: 2026-04-19

### Cambios aplicados

1. Se reemplazo el envio al endpoint antiguo del ERP por el webhook unico `/api/webhooks/orders`.
2. El proxy interno `POST /api/online-orders` ahora reenvia al webhook y usa `x-webhook-secret` solo si existe `WEBHOOK_MENU_SECRET`.
3. El payload de checkout se migro a estructura webhook:
   - `eventId` (idempotencia)
   - `customer` anidado (`name`, `phone` opcional)
   - `items` solo con `sku`, `quantity` y `notes` opcional
4. Se actualizaron variables de entorno para webhook.
5. Se agrego documentacion tecnica en `webhook-pedidos.md`.

### Impacto esperado

- Evita dependencias del endpoint antiguo eliminado.
- Mantiene la validacion de SKU en frontend.
- Reduce riesgo de inconsistencias de precio, ya que ERP calcula por `salePrice`.
