# Configuración del repositorio en GitHub

Textos listos para copiar y pegar en la configuración de `sjaquer/big-jack-menu`. No necesitas escribir nada desde cero.

> Repositorio: `https://github.com/sjaquer/big-jack-menu`
> Rama principal: `master`
> Sitio: `https://bigjack.vercel.app`

---

## 1. About (descripción del repositorio)

**Description (pegar en el campo “Description”):**

```text
Carta digital y checkout de BIG JACK (Centro de Lima). Next.js 16, React 19 y Tailwind 4. Pedidos por WhatsApp con integración ERP lista para activarse.
```

Versión corta (si prefieres algo más breve):

```text
Carta digital y checkout de BIG JACK: Next.js 16, React 19, Tailwind 4 y pedidos por WhatsApp.
```

**Website:**

```text
https://bigjack.vercel.app
```

**Topics (pegar uno por uno en “Topics”):**

```text
nextjs
react
tailwindcss
restaurant
digital-menu
food-ordering
whatsapp
ecommerce
peruvian-food
lima
peru
javascript
vercel
pwa
seo
accessibility
webhook
erp
small-business
mobile-first
```

> GitHub permite hasta 20 topics. Estos 20 están pensados para búsqueda y descubrimiento; no incluyas mayúsculas ni espacios.

**Social preview:** sube `public/images/og-bigjack.jpg` (1200×630) en *Settings → General → Social preview*.

---

## 2. Labels (etiquetas)

Crea estas etiquetas en *Issues → Labels → New label*. Los colores son hexadecimales sin `#`.

### Tipo de trabajo

| Label | Color | Descripción |
| :--- | :--- | :--- |
| `type: feat` | `0E8A16` | Nueva funcionalidad o mejora de producto. |
| `type: fix` | `D73A4A` | Corrección de un bug o comportamiento incorrecto. |
| `type: docs` | `0075CA` | Documentación, README o comentarios. |
| `type: refactor` | `5319E7` | Cambio interno sin cambiar comportamiento visible. |
| `type: test` | `BFD4F2` | Tests, CI o cobertura. |
| `type: perf` | `FBCA04` | Rendimiento, bundle o imágenes. |
| `type: chore` | `D4C5F9` | Mantenimiento, dependencias o tooling. |
| `type: security` | `B60205` | Vulnerabilidad, privacidad o endurecimiento. |
| `type: design` | `F9D0C4` | UI, UX, marca o sistema de diseño. |

### Área

| Label | Color | Descripción |
| :--- | :--- | :--- |
| `area: menu` | `FEF2C0` | Carta, categorías, productos y precios. |
| `area: checkout` | `FEF2C0` | Carrito, entrega, pago y confirmación. |
| `area: api` | `FEF2C0` | `/api/online-orders`, reglas de servidor y webhook. |
| `area: erp` | `FEF2C0` | Integración con `bigjack-rp` y contrato del webhook. |
| `area: seo` | `FEF2C0` | Metadata, JSON-LD, sitemap, robots y `llms.txt`. |
| `area: a11y` | `FEF2C0` | Accesibilidad, teclado, foco y contraste. |
| `area: analytics` | `FEF2C0` | GA4, GTM y eventos. |
| `area: design-system` | `FEF2C0` | Tokens, tipografía y componentes de marca. |
| `area: infra` | `FEF2C0` | Vercel, CI, variables de entorno y despliegue. |
| `area: docs` | `FEF2C0` | PRD, arquitectura, auditoría y guías. |

### Prioridad y estado

| Label | Color | Descripción |
| :--- | :--- | :--- |
| `priority: critical` | `B60205` | Bloquea producción, seguridad o cumplimiento legal. |
| `priority: high` | `D93F0B` | Debe resolverse en el ciclo actual. |
| `priority: medium` | `FBCA04` | Importante, pero no urgente. |
| `priority: low` | `0E8A16` | Mejora deseable. |
| `status: blocked` | `000000` | Espera una decisión o un tercero. |
| `status: needs-decision` | `5319E7` | Requiere decisión del dueño o del equipo ERP. |
| `status: needs-info` | `D4C5F9` | Falta información para avanzar. |
| `status: in-progress` | `1D76DB` | Alguien está trabajando en ello. |
| `status: review` | `0075CA` | Listo para revisión. |

### Comunidad

| Label | Color | Descripción |
| :--- | :--- | :--- |
| `good first issue` | `7057FF` | Tarea acotada para empezar a contribuir. |
| `help wanted` | `008672` | Se acepta ayuda de la comunidad. |
| `question` | `D876E3` | Duda o consulta. |
| `duplicate` | `CFD3D7` | Ya existe un issue igual. |
| `wontfix` | `FFFFFF` | No se va a resolver. |

### Comandos rápidos con GitHub CLI

Si tienes `gh` autenticado, puedes crear todas las etiquetas de una vez:

```bash
gh label create "type: feat" --color 0E8A16 --description "Nueva funcionalidad o mejora de producto."
gh label create "type: fix" --color D73A4A --description "Corrección de un bug o comportamiento incorrecto."
gh label create "type: docs" --color 0075CA --description "Documentación, README o comentarios."
gh label create "type: refactor" --color 5319E7 --description "Cambio interno sin cambiar comportamiento visible."
gh label create "type: test" --color BFD4F2 --description "Tests, CI o cobertura."
gh label create "type: perf" --color FBCA04 --description "Rendimiento, bundle o imágenes."
gh label create "type: chore" --color D4C5F9 --description "Mantenimiento, dependencias o tooling."
gh label create "type: security" --color B60205 --description "Vulnerabilidad, privacidad o endurecimiento."
gh label create "type: design" --color F9D0C4 --description "UI, UX, marca o sistema de diseño."

gh label create "area: menu" --color FEF2C0 --description "Carta, categorías, productos y precios."
gh label create "area: checkout" --color FEF2C0 --description "Carrito, entrega, pago y confirmación."
gh label create "area: api" --color FEF2C0 --description "/api/online-orders, reglas de servidor y webhook."
gh label create "area: erp" --color FEF2C0 --description "Integración con bigjack-rp y contrato del webhook."
gh label create "area: seo" --color FEF2C0 --description "Metadata, JSON-LD, sitemap, robots y llms.txt."
gh label create "area: a11y" --color FEF2C0 --description "Accesibilidad, teclado, foco y contraste."
gh label create "area: analytics" --color FEF2C0 --description "GA4, GTM y eventos."
gh label create "area: design-system" --color FEF2C0 --description "Tokens, tipografía y componentes de marca."
gh label create "area: infra" --color FEF2C0 --description "Vercel, CI, variables de entorno y despliegue."
gh label create "area: docs" --color FEF2C0 --description "PRD, arquitectura, auditoría y guías."

gh label create "priority: critical" --color B60205 --description "Bloquea producción, seguridad o cumplimiento legal."
gh label create "priority: high" --color D93F0B --description "Debe resolverse en el ciclo actual."
gh label create "priority: medium" --color FBCA04 --description "Importante, pero no urgente."
gh label create "priority: low" --color 0E8A16 --description "Mejora deseable."
gh label create "status: blocked" --color 000000 --description "Espera una decisión o un tercero."
gh label create "status: needs-decision" --color 5319E7 --description "Requiere decisión del dueño o del equipo ERP."
gh label create "status: needs-info" --color D4C5F9 --description "Falta información para avanzar."
gh label create "status: in-progress" --color 1D76DB --description "Alguien está trabajando en ello."
gh label create "status: review" --color 0075CA --description "Listo para revisión."

gh label create "good first issue" --color 7057FF --description "Tarea acotada para empezar a contribuir."
gh label create "help wanted" --color 008672 --description "Se acepta ayuda de la comunidad."
gh label create "question" --color D876E3 --description "Duda o consulta."
gh label create "duplicate" --color CFD3D7 --description "Ya existe un issue igual."
gh label create "wontfix" --color FFFFFF --description "No se va a resolver."
```

> Si una etiqueta ya existe, `gh` dará error; puedes ignorarlo o usar `gh label edit`.

---

## 3. Milestones

Crea estos hitos en *Issues → Milestones*:

| Milestone | Descripción | Fecha sugerida |
| :--- | :--- | :--- |
| `v1.0.0 — Producción` | Carta, checkout y pedidos por WhatsApp estables. | 2026-11-02 |
| `Enero 2027 — Reactivaciones` | RUC, Libro de Reclamaciones y posible retorno de PedidosYa. | 2027-01-31 |
| `ERP — Integración definitiva` | Migrar el webhook a la API del ERP y reactivar `FEATURES.erpOrders`. | 2027-03-31 |
| `Calidad y accesibilidad` | Rate-limit persistente, tests restantes y auditoría continua. | 2027-06-30 |

---

## 4. Release v1.0.0

**Tag:** `v1.0.0`
**Título:** `v1.0.0 — Carta digital y pedidos por WhatsApp`

**Notas (pegar en el release):**

```markdown
Primera versión estable de la carta digital y checkout de BIG JACK.

## Incluye

- Carta responsive con hamburguesas, bebidas y precios "desde".
- Carrito persistente con máximos de 10 por producto y 30 por pedido.
- Checkout de recojo o delivery con geolocalización opcional y métodos de pago.
- Regla de bebidas solo con hamburguesa y delivery sin efectivo.
- Horario real en hora de Lima, aviso de cerrado y pre-órdenes solo para recojo.
- Confirmación del pedido por WhatsApp con resumen y total.
- Páginas `/links`, `/quienes`, `/privacidad` y `/reto-gamer`.
- SEO local: metadata, JSON-LD, sitemap, robots y `llms.txt`.
- PWA instalable, analítica GA4/GTM y cabeceras de seguridad.
- 94 tests de dominio, lint en 0 y CI con build + auditoría.

## Notas

- La integración con el ERP está implementada pero desactivada (`FEATURES.erpOrders = false`).
- El Libro de Reclamaciones está desactivado hasta enero 2027; la ruta muestra un aviso con WhatsApp.
- Los pedidos se confirman y coordinan por WhatsApp.

**Full Changelog:** https://github.com/sjaquer/big-jack-menu/commits/v1.0.0
```

---

## 5. Plantillas de issues y PR

Ya están creadas en el repositorio:

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`

No tienes que pegar nada: aparecen al abrir un issue o un pull request. Si quieres desactivar los issues en blanco, la configuración `blank_issues_enabled: false` ya está puesta.

---

## 6. Settings recomendados

En *Settings → General*:

- **Default branch:** `master`.
- **Features:** Issues ✅ · Discussions ✅ (opcional) · Projects ✅ (opcional) · Wiki ❌ · Sponsorships ❌.
- **Pull requests:** permite *Squash merging* y *Rebase merging*; desactiva *Merge commits* si quieres historial lineal. Activa **Automatically delete head branches**.
- **Social preview:** `public/images/og-bigjack.jpg`.

En *Settings → Branches* (regla para `master`):

- Require a pull request before merging.
- Require status checks to pass: `quality` (workflow CI).
- Require branches to be up to date before merging.
- Do not allow force pushes.
- Do not allow deletions.

En *Settings → Code security*:

- Activa **Dependabot alerts** y **Dependabot security updates**.
- Activa **Secret scanning** y **Push protection** (si el plan lo permite).
- Activa **Private vulnerability reporting** para que `SECURITY.md` tenga un canal real.

En *Settings → Actions → General*:

- Permissions: *Read repository contents*.
- No permitas workflows sin revisión desde forks.

---

## 7. Variables y secretos

El CI **no necesita secretos**: usa las claves de prueba de Cloudflare y no llama al ERP.

Configura estas variables en **Vercel → Project → Settings → Environment Variables** (nunca en el repo):

```text
WEBHOOK_ORDERS_URL
WEBHOOK_MENU_SECRET
GMAIL_USER
GMAIL_PASS
RECIPIENT_EMAIL
FORMSPREE_URL
NEXT_PUBLIC_BASE_URL
GOOGLE_SITE_VERIFICATION
NEXT_PUBLIC_GTM_ID
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

Si algún día agregas un workflow que publique o comente, usa *Settings → Secrets and variables → Actions* y nombres en mayúsculas (`VERCEL_TOKEN`, etc.). No subas `.env.local`.

---

## 8. Primer issues sugeridos

Puedes crear estos issues y etiquetarlos para arrancar el tablero:

| Título | Labels |
| :--- | :--- |
| Rate-limit persistente para `/api/online-orders` | `type: security`, `area: api`, `priority: high` |
| Completar Libro de Reclamaciones conforme (Fase 1) | `type: feat`, `area: docs`, `priority: critical`, `status: needs-decision` |
| Confirmar razón social y RUC | `type: docs`, `area: docs`, `priority: high`, `status: needs-decision` |
| Test directo de `lib/catalog.js` | `type: test`, `area: api`, `good first issue` |
| Script Node multiplataforma para probar el webhook | `type: chore`, `area: erp`, `good first issue` |
| Revisar tildes en mensajes internos del checkout | `type: fix`, `area: checkout`, `good first issue` |
| Evaluar retorno de PedidosYa | `type: feat`, `area: menu`, `status: needs-decision` |

---

## 9. Descripción para redes / portafolio

Si compartes el proyecto fuera de GitHub:

```text
Carta digital y checkout para BIG JACK, hamburguesería del Centro de Lima. Next.js 16, React 19, Tailwind 4, pedidos por WhatsApp, SEO local, PWA y 94 tests. La integración con el ERP queda lista detrás de un flag.
```

**Hashtags sugeridos:** `#NextJS #React #TailwindCSS #Lima #Perú #WebDevelopment #RestaurantTech`
