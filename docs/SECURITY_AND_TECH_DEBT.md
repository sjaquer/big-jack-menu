# Reporte de Auditoría de Seguridad, Dependencias y Deuda Técnica
**Proyecto:** Big Jack Menu (Sistema de Menú Digital y Checkout)  
**Fecha de actualización:** 28 de Julio, 2026  
**Autor:** Antigravity AI & Equipo de Desarrollo  

---

## 1. Resumen Ejecutivo
Este documento recopila la auditoría completa de seguridad, las lecciones aprendidas de dependencias, las deudas técnicas resueltas y la arquitectura de integración con sistemas externos (ERP/Webhooks/Libro de Reclamaciones) para la plataforma web de Big Jack.

---

## 2. Auditoría y Actualización de Dependencias (`package.json`)

### 2.1 Diagnóstico de Vulnerabilidades e Incidentes
- **Incidente con `npm audit fix --force`**: El uso del parámetro `--force` en auditorías automáticas provocó el *downgrade* involuntario del framework central de `next@16.0.10` a `next@9.3.3` (una versión del año 2020 sin soporte para Next.js App Router), lo que causó fallos críticos en el comando `npm run build` y rompió la compatibilidad con `react@19.2.1`.
- **Vulnerabilidades en Nodemailer**: Versiones anteriores de `nodemailer` contención 6 avisos de alta severidad relacionados con inyección de comandos SMTP, evasión de validación de certificados TLS y restricciones de archivos mediante caracteres CRLF.

### 2.2 Solución Aplicada
- Se actualizaron las dependencias directas en [package.json](file:///home/sjaquer/Proyects/big-jack-menu/package.json):
  - `next`: `^16.2.12` (mantiene compatibilidad completa con App Router y React 19).
  - `eslint-config-next`: `^16.2.12`.
  - `nodemailer`: `^9.0.3` (elimina todas las vulnerabilidades severas de transporte SMTP).
- **Regla Operativa**: No ejecutar `npm audit fix --force` en proyectos Next.js 16 / React 19 sin revisar previamente las incompatibilidades de versiones SemVer mayores.

---

## 3. Auditoría y Corrección de Seguridad

### 3.1 Libro de Reclamaciones (`app/actions.js` y `app/libro-de-reclamaciones/page.js`)
- **Problema previo**: La interfaz del Libro de Reclamaciones realizaba una llamada `fetch` directamente desde el navegador cliente a un endpoint externo de Formspree (`https://formspree.io/f/xeodbbvl`), exponiendo URLs sensibles y enviando datos personales (Nombre, DNI, Teléfono, Correo, Dirección) sin validación ni sanitización en backend. El Server Action `sendComplaint` carecía de sanitización de cadenas HTML, siendo vulnerable a XSS e inyección en plantillas de correo.
- **Solución implementada**:
  1. Se migró el envío del formulario cliente para utilizar exclusivamente el Server Action `sendComplaint(formData)` en [actions.js](file:///home/sjaquer/Proyects/big-jack-menu/app/actions.js).
  2. Se añadió la función helper `escapeHtml` para sanitizar todos los campos de texto contra inyección HTML y XSS antes de armar la plantilla de correo.
  3. Se incorporó validación de servidor para asegurar que los campos requeridos no estén vacíos.
  4. Se habilitó el soporte dual: si existe `FORMSPREE_URL` en las variables de entorno, se reenvía servidor-a-servidor de forma segura; en caso contrario, se envía por transporte SMTP seguro con Nodemailer.

### 3.2 API de Pedidos Online (`/api/online-orders/route.js`)
- **Arquitectura y Protección**:
  - Control de Rate Limiting por IP (máximo 5 pedidos en una ventana de 15 minutos).
  - Verificación estricta de idempotencia mediante `eventId` (prefijo `menu-YYYYMMDD-nonce`).
  - Validación de SKU y precios contra el catálogo estático en servidor antes de transmitir la solicitud al webhook del ERP.
  - Firma opcional de seguridad HTTP vía encabezado `x-webhook-secret`.

---

## 4. Deuda Técnica y Calidad de Código Resuelta

| Componente | Problema Detectado | Solución Aplicada |
| :--- | :--- | :--- |
| `app/reto-gamer/page.js` | Declaraciones `class` inline (`Star`, `PowerUp`, `Player`, `Boss`, `Bullet`, `Particle`) dentro de un hook `useEffect`, cancelando la optimización del React Compiler. | Convertidas a funciones constructoras y prototipos compatibles (`function Star()`, `Star.prototype.update`), manteniendo la lógica de Canvas 100% funcional y eliminando 6 advertencias de React Compiler. |
| `app/reto-gamer/page.js` | Advertencia de dependencia faltante en `useEffect` (`goToMenu`). | Se envolvió `goToMenu` en `useCallback` y se incluyó en la lista de dependencias del efecto de juego. |
| `app/features/home/components/SecureMap.js` | Advertencia de mutación de `ref` en la función de limpieza (`containerRef.current`). | Se asignó una variable local `const container = containerRef.current` dentro de `useEffect` para su uso seguro en el cleanup. |
| `app/page.js` | Advertencia de dependencia faltante (`getUserLocation`). | Se envolvió `getUserLocation` en `useCallback` y se integró correctamente al array de dependencias. |
| `app/lib/openHours.js` | Exportación anónima por defecto (`import/no-anonymous-default-export`). | Se asignó el objeto utilitario a la constante `openHoursUtils` antes de su exportación. |

---

## 5. Configuración de Variables de Entorno

Crear o modificar el archivo `.env.local` en la raíz del proyecto con las siguientes claves:

```bash
# ERP & Webhook de Pedidos
ERP_BASE_URL="https://bigjack-rp.vercel.app"
WEBHOOK_ORDERS_URL="https://bigjack-rp.vercel.app/api/webhooks/orders"
WEBHOOK_MENU_SECRET="tu_secreto_webhook_aqui"

# Libro de Reclamaciones (SMTP / Gmail)
GMAIL_USER="bigjackpe@gmail.com"
GMAIL_PASS="tu_contraseña_de_aplicacion_gmail"
RECIPIENT_EMAIL="bigjackpe@gmail.com"

# Libro de Reclamaciones (Formspree alternativo servidor-a-servidor)
FORMSPREE_URL="https://formspree.io/f/xeodbbvl"
```

---

## 6. Verificación de Compilación y Calidad
Para validar el estado del código en cualquier momento:

```bash
# Validar compilación de producción con Next.js 16 App Router
npm run build

# Validar reglas de linter y React Compiler
npm run lint

# Iniciar servidor de desarrollo
npm run dev
```
