# Sistema de diseño — Big Jack Menu

**Fecha:** 2026-10-24 · Documenta el lenguaje visual **actual** y las reglas para mantenerlo coherente. Los desvíos detectados están al final y en [`AUDIT.md`](./AUDIT.md).

## 1. Concepto

> La identidad de marca (concepto, voz, fotografía, uso del logo) está en [`marca/MANUAL_DE_MARCA.md`](./marca/MANUAL_DE_MARCA.md) (v3, "el vecino que nunca falla"). Este documento cubre cómo se implementa en la web; ante conflicto de marca, manda el manual.

**"Potencia honesta" · Streetwear / brutalismo urbano.** Fondo casi negro con retícula sutil, amarillo de marca a plena saturación, tipografía condensada en mayúsculas, bordes gruesos y etiquetas tipo `[ CORCHETES ]`. Tono de voz directo, limeño y sin adornos ("al toque", "sin floro", "No vendemos humo").

Principios:
1. **Mobile-first y pulgar primero:** acciones principales abajo o a pantalla completa, objetivos táctiles ≥ 44 px.
2. **Producto protagonista:** foto grande, nombre en Anton, precio en bloque amarillo.
3. **Contraste alto:** amarillo sobre negro; texto negro sobre amarillo (nunca blanco sobre amarillo).
4. **Una acción primaria por vista** (amarillo); las secundarias en gris oscuro con borde.

## 2. Tokens

### 2.1 Color

Los tokens están declarados en `app/globals.css` (`:root`) pero **casi no se usan**: el código repite hex literales (`#FCC900` aparece 169 veces). Al tocar un componente, migrar a tokens (ver §6).

| Token propuesto | Hex | Uso | Variable actual |
| :--- | :--- | :--- | :--- |
| `--bj-yellow` | `#FCC900` | Primario: CTA, precios, acentos, foco | `--potencia-amarillo`, `--bj-accent` |
| `--bj-yellow-hover` | `#E2B500` | Hover de CTA amarillos | — |
| `--bj-red` | `#B22222` | Alertas, badge de cantidad, cerrado | `--potencia-rojo` |
| `--bj-silver` | `#C0C0C0` | Texto secundario sobre negro | `--potencia-aluminio` |
| `--bj-bg` | `#0F0F12` | Fondo de página, header, footer | — (`--background` = `#1E1E1E`) |
| `--bj-surface` | `#131317` | Tarjetas, inputs del filtro | — |
| `--bj-surface-2` | `#1F1F24` | Tags, botones secundarios | — |
| `--bj-border` | `neutral-800` (`#262626`) | Bordes de tarjetas | — |
| `--bj-success` | `green-600` / `#25D366` | Confirmar pedido / WhatsApp | — |

**Colores de terceros (solo en sus botones):** WhatsApp `#25D366`, PedidosYa `#FF0050`/`#EA004B`, Rappi `#FF441F`, Google `#4285F4`, Instagram (gradiente).

**Fuera de sistema (a eliminar):** `#D99133`, `#EEB055`, `#B07020` (dorado/ámbar, 54 usos, sobre todo en `/product/[slug]` y `/reto-gamer`), `yellow-500/400` de Tailwind en el Libro de Reclamaciones, fondos `#020204`/`#0A0A0C`.

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

`body`: `#1E1E1E` + retícula de 28 px con líneas blancas al 3% (`globals.css:18-30`). Los headers usan `bg-[#0F0F12]/95 backdrop-blur-md`.

## 3. Componentes de marca (`globals.css`)

| Clase | Aspecto | Uso |
| :--- | :--- | :--- |
| `.btn-streetwear` | Fondo amarillo, texto negro Anton, borde negro 3 px, hover blanco | CTA primario |
| `.block-yellow` | Bloque amarillo con texto negro Anton | Precios, badges ("HIT LIMEÑO") |
| `.tag-streetwear` | Fondo `#1F1F24`, borde `#33333D`, texto amarillo 11 px, tracking 0.12em | Etiquetas `[ LIMA CENTRO ]` |
| `.scrollbar-hide` | Oculta scrollbar | Carruseles y filtros |
| `.product-card-anim` | Reveal escalonado (0.6 s) | Tarjetas de producto |
| `.cart-drawer-*` / `.product-modal-*` | Transiciones de apertura/cierre | Drawer y modal |
| `.skeleton` | Pulso de carga | (sin uso hoy) |

## 4. Patrones de UI

| Patrón | Implementación de referencia |
| :--- | :--- |
| Header pegajoso con borde amarillo inferior | `app/page.js:742` |
| Filtro de categorías en píldoras con contador + búsqueda | `features/home/components/CategoryFilter.js` |
| Tarjeta de producto (imagen 4:3, nombre sobre degradado, precio en `block-yellow`, opciones como filas) | `ProductCard.js` |
| Drawer lateral derecho con pasos (Cliente · Entrega · Pago) y barra de progreso | `CartDrawer.js` |
| Selector segmentado (Recojo/Delivery, métodos de pago) — activo = fondo amarillo | `CartDrawer.js:299-315, 413-437` |
| Avisos: azul = información de pago, rojo = cerrado/error, verde = éxito | `CartDrawer.js`, `ClosedNotice.js` |
| Barra flotante móvil de carrito | `FloatingCartBar.js` |
| Modal de confirmación con CTA WhatsApp verde | `OrderConfirmation.js` |

## 5. Accesibilidad (mínimos obligatorios)

- Foco visible: `:focus-visible { outline: 2px solid #FCC900; outline-offset: 2px }` (está declarado dos veces, dejar una).
- Todo input con `<label>` asociado (puede ser `sr-only`); no usar solo `placeholder`.
- Diálogos: `role="dialog"`, `aria-modal`, `aria-labelledby`, *focus trap*, cierre con `Esc`, devolver foco al disparador.
- Botones solo-icono con `aria-label`.
- Contraste: amarillo `#FCC900` sobre `#0F0F12` ≈ 12:1 ✅; negro sobre amarillo ≈ 13:1 ✅; `neutral-500` sobre negro solo para texto ≥ 14 px no esencial.
- Respetar `prefers-reduced-motion` en animaciones de entrada (pendiente).

## 6. Reglas para cambios de UI

1. Usar los tokens de §2 (migrar a `@theme` de Tailwind v4 para obtener `bg-bj-yellow`, `text-bj-silver`, etc.).
2. No introducir nuevos tonos de amarillo/dorado; `#D99133` queda prohibido.
3. No usar clases que no existan (verificar en `globals.css` o en Tailwind). Las utilidades `animate-in`, `zoom-in-*`, `slide-in-from-*` vienen de `tw-animate-css`, instalado e importado en `globals.css`.
4. Reutilizar `.btn-streetwear`, `.block-yellow`, `.tag-streetwear` antes de crear estilos nuevos.
5. Mensajes al usuario en español con tildes; tono directo.
6. Probar en 360 px de ancho y en desktop.

## 7. Desvíos actuales del sistema

| Dónde | Desvío | Ref. |
| :--- | :--- | :--- |
| `/product/[slug]` | Paleta dorada `#D99133`, emojis como íconos, clases inexistentes (`warning-border`, `tape-corner-tr`, `cuidado-badge`), header/footer propios distintos al home. | DEAD-02 |
| `/libro-de-reclamaciones` | Mezcla `#FCC900` con `yellow-500`, fondo `#020204`. | — |
| `/reto-gamer` | Paleta neón/dorada propia (aceptable como "mundo" del juego, pero CTAs deberían usar el amarillo de marca). | — |
| `/links` | Spinner a pantalla completa al cargar. | QLT-05 |
| Footer | `animate-pulse-slow` inexistente; horario distinto al real. | DEAD-02, DATA-01 |
| Modales | Animaciones de entrada que no se ejecutan (falta plugin). | BUG-08 |
| `globals.css` | Tokens declarados sin uso; utilidades huérfanas (`glass-panel`, `gold-glow`, `toast-*`, `fade-in-stagger`…). | DEAD-07 |
