# Política de seguridad

## Cómo reportar una vulnerabilidad

**No abras un issue público** si el problema implica credenciales, datos personales, pagos, pedidos falsos o una forma de saltarse las validaciones.

Usa uno de estos canales:

1. **GitHub Private Vulnerability Reporting** (recomendado): pestaña *Security* → *Report a vulnerability*.
2. Si no está disponible, contacta al mantenedor por GitHub: [@sjaquer](https://github.com/sjaquer).

Incluye:

- descripción del problema y su impacto;
- pasos para reproducirlo;
- versión o commit afectado;
- si es posible, una prueba de concepto mínima;
- tu nombre o alias para acreditar el reporte (opcional).

## Qué esperar

- Confirmación de recepción en un plazo razonable.
- Evaluación y plan de corrección según severidad.
- Coordinación de la divulgación después del arreglo.
- Crédito en el release si lo deseas.

## Alcance

Este repositorio cubre la web pública, el proxy de pedidos (`/api/online-orders`), la Server Action del Libro de Reclamaciones y los scripts de build. El ERP (`bigjack-rp`) y los servicios de terceros (Vercel, Cloudflare, Google, WhatsApp) quedan fuera del alcance; si el problema está en ellos, repórtalo a su proveedor.

## Prácticas del proyecto

- Los secretos se leen **solo en servidor** y nunca llevan prefijo `NEXT_PUBLIC_`.
- `.env.local` y cualquier `.env*` (salvo `.env.example`) están fuera de git.
- El servidor valida reglas de negocio, reconstruye el payload con lista blanca y aplica Turnstile.
- Las dependencias se revisan con `npm audit --omit=dev`; no se usa `npm audit fix --force`.
- El CI ejecuta lint, tests, build y auditoría en cada push a `master` y en cada PR.

## Si encuentras un secreto en el historial

No lo publiques. Reporta el hallazgo por el canal privado y rota la credencial afectada de inmediato.
