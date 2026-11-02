# Contribuir a Big Jack Menu

Gracias por querer mejorar la carta digital de BIG JACK. Este documento explica cómo proponer cambios sin romper el checkout, el contrato con el ERP ni la operación del local.

## Antes de empezar

1. Lee [`AGENTS.md`](AGENTS.md) y [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
2. Revisa si tu idea ya está en [`docs/REMEDIATION_PLAN.md`](docs/REMEDIATION_PLAN.md) o en los issues.
3. Para cambios de producto, abre un issue primero y espera confirmación del dueño.
4. No cambies **SKUs ni precios** sin coordinación con el equipo del ERP.

## Entorno local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Necesitas Node.js ≥ 20.9. El proyecto usa JavaScript (sin TypeScript), Next.js 16 (App Router) y Tailwind CSS v4.

## Flujo de trabajo

1. Crea una rama desde `master`:
   - `feat/descripcion-corta`
   - `fix/descripcion-corta`
   - `docs/descripcion-corta`
   - `refactor/descripcion-corta`
2. Haz cambios pequeños y enfocados: **un tema por PR**.
3. Agrega o actualiza tests si tocas lógica en `app/lib/` o `app/features/shop/`.
4. Verifica antes de abrir el PR:

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

5. Prueba el flujo afectado en `npm run dev` a **360 px** y en desktop.
6. Actualiza la documentación afectada (`PRD`, `ARCHITECTURE`, `AUDIT`, `REMEDIATION_PLAN`, `CHANGELOG`).

## Convenciones de código

- Español con tildes en textos visibles al usuario y en comentarios.
- Componentes en PascalCase, un componente por archivo, `export default`.
- Lógica pura en `app/lib/` o `app/features/<feature>/`; nada de reglas de negocio dentro de componentes de presentación.
- Imágenes con `next/image`; assets en `public/images/` en WebP.
- Estilos con utilidades Tailwind y tokens de marca (`bg-bj-yellow`, `text-bj-silver`, `bg-bj-bg`…). No escribas hex sueltos nuevos.
- Prefiere Server Components; usa `"use client"` solo donde haga falta estado o efectos.
- Respeta el presupuesto: componente ≤ 250 líneas, página ≤ 150, hook ≤ 150. Si te pasas, divide.
- No agregues `alert()` ni `confirm()` nuevos: usa `useToast` o UI en página.
- No agregues comentarios que expliquen lo obvio; documenta decisiones no evidentes.

## Commits

Usa mensajes convencionales en inglés, como el historial del repo:

```text
feat: add pickup time estimate to confirmation
fix: prevent drinks without a burger
docs: update ERP webhook contract
refactor: extract cart totals into lib
test: cover closed-hours edge cases
chore: bump next to 16.4.3
```

## Pull requests

- Título claro y en el mismo estilo de commits.
- Describe **qué** cambia, **por qué** y **cómo lo probaste**.
- Enlaza el issue o el ID de auditoría (`BUG-03`, `SEC-04`…).
- Incluye capturas o un GIF si cambia la UI.
- Marca los cambios que afectan SKUs, precios o el contrato del ERP.
- El CI debe quedar en verde (`lint`, `test`, `build`, `audit`).

## Reglas de negocio que no debes romper

- Máximo 10 unidades por producto y 30 por pedido.
- Las bebidas solo se venden con al menos una hamburguesa.
- Delivery no acepta efectivo y requiere dirección o ubicación.
- Fuera de horario solo hay pre-orden para recojo.
- El Servidor es la fuente de verdad de las validaciones.
- `items` del webhook solo lleva `sku`, `quantity` y `notes`.
- El Libro de Reclamaciones nunca debe confirmar un reclamo que no se entregó.

## Seguridad

No abras issues públicos con credenciales, tokens, datos personales ni detalles explotables. Sigue [`SECURITY.md`](SECURITY.md).

## ¿Dudas?

Abre un issue con la etiqueta `question` o escribe al WhatsApp del negocio que aparece en la web. Para temas de marca, consulta [`docs/marca/`](docs/marca/README.md).
