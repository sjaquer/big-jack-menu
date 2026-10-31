# Sistema de diseño — Big Jack Menu

**Fecha:** 2026-10-31 · Documenta el lenguaje visual **actual** y las reglas para mantenerlo coherente. Los desvíos detectados están al final y en [`AUDIT.md`](./AUDIT.md).

## 1. Concepto

> La identidad de marca (concepto, voz, fotografía, uso del logo) está en [`marca/MANUAL_DE_MARCA.md`](./marca/MANUAL_DE_MARCA.md). Este documento cubre cómo se implementa en la web; ante conflicto de marca, manda el manual.

**Menos es más.** La comida es la protagonista; la interfaz se aparta. Fondo casi negro, amarillo de marca solo para lo que importa (precio destacado, acción principal), tipografía Anton enorme para crear jerarquía y mucho aire entre bloques. Desde el rediseño del 2026-10-31 la web es **una sola columna vertical** (`max-w-3xl`) también en desktop.

Principios:
1. **Una idea por pantalla.** Nada de pastillas, etiquetas `[ CORCHETES ]`, contadores, badges ni subtítulos de relleno. Si un elemento no ayuda a pedir, no va.
2. **Jerarquía por tamaño, no por cajas.** Titulares en Anton de 4–15 rem (`clamp()`), cuerpo en Poppins 16–18 px, rótulos en 12 px con `tracking` amplio y gris. Evitar tarjetas con borde para agrupar: separar con espacio (`py-24`/`py-32`) o una línea fina.
3. **Variación de ritmo.** Las hamburguesas se muestran grandes (foto a todo el ancho, alternando formato 4:5 / 1:1); papas y bebidas en filas compactas. El cambio de tamaño guía la vista.
4. **Movimiento con propósito.** El hero se cuenta con el scroll; las secciones aparecen con un fundido (`.reveal`). Siempre con alternativa en `prefers-reduced-motion`.
5. **Pulgar primero.** Objetivos táctiles ≥ 44 px, acción principal abajo en móvil (barra "Ver pedido").
6. **Contraste alto:** amarillo sobre negro; texto negro sobre amarillo (nunca blanco sobre amarillo).

## 2. Tokens

### 2.1 Color

Definidos en `@theme` de `app/globals.css`; Tailwind genera las utilidades (`bg-bj-yellow`, `text-bj-yellow/60`, `border-bj-surface-2`…). En 2026-10-31 se migraron todas las clases con hex de marca a tokens.

| Token (`--color-…`) | Hex | Uso |
| :--- | :--- | :--- |
| `bj-yellow` | `#FCC900` | Primario: CTA, precio destacado, foco |
| `bj-yellow-hover` | `#E2B500` | Hover de CTA amarillos |
| `bj-red` | `#B22222` | Cerrado, alertas |
| `bj-silver` | `#C0C0C0` | Texto secundario |
| `bj-bg` | `#0F0F12` | Fondo de página |
| `bj-surface` / `bj-surface-2` | `#131317` / `#1F1F24` | Superficies (drawer, campos) |
| `whatsapp` | `#25D366` | Solo acciones de WhatsApp |

**Prohibidos:** `#D99133`, `#EEB055`, `#B07020`, `yellow-400/500` de Tailwind, nuevos dorados. Colores de terceros (PedidosYa, Rappi, Instagram) ya no se usan como fondos.

### 2.2 Tipografía

| Rol | Fuente | Clase | Estilo |
| :--- | :--- | :--- | :--- |
| Display / títulos | **Anton** | `.font-anton` | MAYÚSCULAS, `tracking-wide`, `leading-[0.9]` |
| Cuerpo y UI | **Poppins** 400–800 | por defecto (`body`) | Etiquetas en `font-black` + `uppercase` + `tracking-widest` |
| Firma (sin uso) | Parkinsans 700–800 | `.font-signature` | — |

Escala habitual: H1 hero `text-4xl → sm:text-7xl → md:text-8xl`; títulos de sección `text-3xl/4xl`; nombre de producto `text-3xl/4xl`; microetiquetas `text-[10px]–text-xs`.

### 2.3 Forma y espaciado

| Elemento | Valor |
| :--- | :--- |
| Radio botones/inputs | `rounded-xl` (12 px) |
| Radio tarjetas/paneles | `rounded-2xl` / `rounded-3xl` |
| Píldoras/badges | `rounded-full` |
| Bordes de marca | 2–3 px (`border-2`, `border-3`) |
| Contenedor | `max-w-6xl` / `max-w-7xl`, `px-4 sm:px-6` |
| Táctil mínimo | 44 px (`min-h-[44px]`); CTAs principales 56–72 px |

### 2.4 Fondo

`body` usa `bg-bj-bg` liso. La retícula (`.bg-grid`) queda solo como recurso decorativo puntual (404); nunca detrás de texto, precios o formularios.

## 3. Componentes de marca (`globals.css`)

| Clase / componente | Uso |
| :--- | :--- |
| `@theme` → `bg-bj-yellow`, `bg-bj-bg`, `text-bj-silver`, `bg-bj-surface`, `bg-whatsapp`… | Tokens de color. No usar hex sueltos en clases. |
| `.btn-streetwear` | CTA primario (con `rounded-full` en el rediseño). |
| `.scroll-hero` + `.hero-*` | Hero animado por scroll (`--p` de 0 a 1, lo escribe `useScrollProgress`). |
| `.reveal` | Aparición al entrar en pantalla (CSS `animation-timeline: view()`; sin soporte, se muestra directo). |
| `Dialog` (`app/components/Dialog.js`) | Drawer y hojas: foco atrapado, `Esc`, devuelve el foco, bloquea scroll. |
| `.block-yellow`, `.tag-streetwear` | Heredadas; usar solo en piezas puntuales (no en la carta). |

## 4. Patrones de UI

| Patrón | Implementación |
| :--- | :--- |
| Header mínimo: logo + bolsa con contador | `app/components/SiteHeader.js` |
| Hero en scroll: titular → fundido a pantalla completa de la hamburguesa que crece → frases → un CTA | `features/shop/components/hero/ScrollHero.js` |
| Navegación de la carta: texto con subrayado amarillo en la sección visible (scroll-spy), fija bajo el header | `menu/CategoryNav.js` |
| Plato estrella: foto grande, nombre enorme, precio y botón circular "+" | `menu/FeatureItem.js` |
| Complemento: fila con miniatura, nombre, precio y "+" con borde | `menu/CompactItem.js` |
| Hoja de producto (bottom sheet en móvil) con radios nativos y cantidad | `overlays/ProductSheet.js` |
| Carrito en dos pasos ("Tu pedido" → "Entrega y pago") con barra de progreso; filas sin cajas, "−" que pasa a papelera en 1 unidad, sugerencias en carrusel, CTA amarillo `rounded-full` | `CartDrawer.js`, `cart/` |
| Campos: superficie `bg-white/[0.06]` sin borde, etiqueta visible; selecciones con control segmentado en cápsula | `cart/Field.js`, `cart/SegmentedChoice.js` |
| Barra flotante "Ver pedido · N · S/ total" (píldora amarilla, solo móvil) | `FloatingCartBar.js` |
| Aviso de cerrado: una línea discreta, no bloquea | `ClosedBanner.js` |
| Ubicación: dirección como titular gigante + links subrayados | `LocationSection.js` |

## 5. Accesibilidad (mínimos obligatorios)

- Foco visible: `:focus-visible { outline: 3px solid var(--color-bj-yellow) }`.
- Todo input con `<label>` asociado (puede ser `sr-only`); no usar solo `placeholder`.
- Diálogos: `role="dialog"`, `aria-modal`, `aria-labelledby`, *focus trap*, cierre con `Esc`, devolver foco al disparador.
- Botones solo-icono con `aria-label`.
- Contraste: amarillo `#FCC900` sobre `#0F0F12` ≈ 12:1 ✅; negro sobre amarillo ≈ 13:1 ✅; `neutral-500` sobre negro solo para texto ≥ 14 px no esencial.
- `prefers-reduced-motion`: implementado en `globals.css` (hero estático, sin `.reveal`, transiciones mínimas).
- Enlace "Saltar al contenido" en el layout de `(shop)`.

## 6. Reglas para cambios de UI

1. Usar los tokens de §2 (`bg-bj-yellow`, `text-bj-silver`…); nada de hex sueltos.
2. No introducir nuevos tonos de amarillo/dorado; `#D99133` queda prohibido.
3. No usar clases que no existan (verificar en `globals.css` o en Tailwind). Las utilidades `animate-in`, `zoom-in-*`, `slide-in-from-*` vienen de `tw-animate-css`, instalado e importado en `globals.css`.
4. Antes de agregar un elemento, preguntarse si ayuda a pedir. Reutilizar `Dialog`, `btn-streetwear` y los ítems de la carta antes de crear estilos nuevos.
5. Mensajes al usuario en español con tildes; tono directo.
6. Probar en 360 px de ancho y en desktop.

## 7. Desvíos actuales del sistema

| Dónde | Desvío |
| :--- | :--- |
| `/libro-de-reclamaciones` | Formulario largo con bloques numerados y bordes: se mantiene por claridad legal (tono neutro). Pendiente de Fase 1. |
| `/reto-gamer` | Paleta neón propia del juego (D7 pendiente). |
| `/links` | Lista de botones (formato link-in-bio); ya sin colores de terceros ni etiquetas. |
