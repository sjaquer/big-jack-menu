# Documentación — Big Jack Menu

Índice de la documentación técnica y de producto. **Última revisión:** 2026-11-02.

## Vigente

| Documento | Contenido | Actualizado |
| :--- | :--- | :--- |
| [PRD.md](./PRD.md) | Producto: contexto, objetivos, usuarios, alcance, requisitos funcionales, reglas de negocio y roadmap. | 2026-11-02 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, mapa del repo, rutas, modelo de datos, flujo de pedido, API, variables de entorno y despliegue. | 2026-11-02 |
| [DESIGN.md](./DESIGN.md) | Sistema de diseño: conceptos, tokens, tipografía, componentes de marca, patrones y accesibilidad. | 2026-11-02 |
| [AUDIT.md](./AUDIT.md) | Auditoría técnica con IDs, severidad y estado actualizado de cada hallazgo. | 2026-11-02 |
| [REMEDIATION_PLAN.md](./REMEDIATION_PLAN.md) | Plan por fases para cerrar la auditoría + decisiones de negocio pendientes. | 2026-11-02 |
| [webhook-pedidos.md](./webhook-pedidos.md) | Contrato del webhook de pedidos con el ERP (hoy desactivado por flag). | 2026-11-02 |
| [LINKS_PAGE.md](./LINKS_PAGE.md) | Página `/links`: objetivo, secciones, datos y personalización. | 2026-11-02 |
| [marca/MANUAL_DE_MARCA.md](./marca/MANUAL_DE_MARCA.md) | Manual de marca v3: identidad, voz y tono, visual, redes, atención y empaque. Índice en [`marca/`](./marca/README.md). | 2026-10-31 |
| [../AGENTS.md](../AGENTS.md) | Reglas operativas para agentes de IA y colaboradores. | 2026-11-02 |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Flujo de ramas, PRs, commits y verificación. | 2026-11-02 |
| [../SECURITY.md](../SECURITY.md) | Reporte responsable de vulnerabilidades. | 2026-11-02 |
| [../.github/GITHUB_SETUP.md](../.github/GITHUB_SETUP.md) | Textos listos para pegar en GitHub: descripción, topics, labels, plantillas y release. | 2026-11-02 |

## Histórico (no usar como fuente de verdad)

| Documento | Nota |
| :--- | :--- |
| [SECURITY_AND_TECH_DEBT.md](./SECURITY_AND_TECH_DEBT.md) | Auditoría de julio 2026. Varias afirmaciones ya no son ciertas; reemplazada por `AUDIT.md`. |
| [UI_UX_OVERHAUL_WALKTHROUGH.md](./UI_UX_OVERHAUL_WALKTHROUGH.md) | Resumen del rediseño de julio 2026. |
| [legacy/online-orders-api.md](./legacy/online-orders-api.md) | API de pedidos anterior al webhook (deprecada). |

## Convenciones

- Español con tildes.
- Fechas en formato `AAAA-MM-DD`.
- Hallazgos y tareas con IDs (`SEC-01`, `BUG-03`, `QLT-11`…).
- Los datos del negocio siempre salen de `restaurantInfo` en `app/data/menuData.js`.
