# Identidad Visual — BIG JACK

**Versión:** 1.0 · **Fecha:** 2026-10-24 · Parte del [Manual de Marca](./MANUAL_DE_MARCA.md).
**Referencias:** tableros de Pinterest "BIG JACK – REF Fotografía" y "BIG JACK – REF Gráficos"; Manual de Identidad v2.0 (PDF).
**Implementación web:** [`docs/DESIGN.md`](../DESIGN.md). Este archivo manda sobre la marca; `DESIGN.md` manda sobre cómo se codifica.

> **Principio:** el contenido es impredecible; la firma es fija. Cada pieza puede ser un meme, un cartel o una foto de calle, pero siempre se reconoce por cuatro cosas: **amarillo Jack, negro asfalto, Anton y flash duro.**

---

## 1. Los dos modos

Toda pieza de BIG JACK está en uno de dos modos. En el feed se **alternan**, para que la grilla juegue entre contrastes.

| | **Modo Amarillo (cartel)** | **Modo Noche (flash)** |
| :--- | :--- | :--- |
| Qué es | Color plano, producto recortado, tipografía gigante. | Foto de flash directo, de noche, fondo oscuro. |
| Fondo | Amarillo Jack dominante (o rojo, en campaña). | Negro / la calle. |
| Tipografía | Anton enorme, el producto rompe el titular. | Titular corto en zona segura, o sin texto. |
| Producto | Recortado, foto real del look Recorte. | Dentro de la escena: en la mano, en la boca, en la calle. |
| Para qué | Producto, precios, carta, fechas, anuncios, memes con producto. | Cochinada, universo peruano, la caleta, actualidad. |
| Referencia del tablero | DOMINGO, STREET BURGER, CRUNCH, OBSESIÓN, JR10 BURGER. | Los 32 pines de fotografía. |
| Proporción en el feed | ~40 % | ~60 % |

**Amarillo dominante, negro como base:** el amarillo es el color que se recuerda; el negro es el que sostiene todo. Nunca una pieza sin uno de los dos.

---

## 2. Logotipo ✅ (v3, 2026-10-31)

**Wordmark "BIG JACK"**: letras gordas y redondeadas (base: Titan One, licencia OFL, convertida a trazos y modificada), apretadas, con un leve rebote y giro por letra (como rótulo pintado a mano) y **queso que chorrea** de los palos de la I, la A y la K. Nunca una gota bajo la C (se leería "Ç"). Reemplaza al wordmark anterior en Parkinsans, que era rígido y tenía letras fundidas.

Todos los archivos están en [`public/brand/`](../../public/brand/) (también en `https://bigjack.vercel.app/brand/…`) y se regeneran con `npm run brand` (código en `scripts/brand/`). No editar los SVG a mano: cambiar el script.

| Versión | Archivo | Uso |
| :--- | :--- | :--- |
| **Horizontal** | `logo-horizontal.svg` (amarillo) · `-negro` · `-blanco` | Header web, banners, portadas. |
| **Apilada** | `logo-apilado.svg` (amarillo) · `-negro` · `-blanco` · `-rojo` | Avatar, empaque, piezas verticales. Rojo solo sobre amarillo. |
| **Isotipo: sello "Central de Potencia"** | `sello.svg` | Aro negro con "PJE. LARRABURE 142 ★ CENTRAL DE POTENCIA", centro amarillo con el apilado en rojo. Avatar de redes, stickers, empaque. |
| **Sello simple** | `sello-simple.svg` | Sin texto en el aro: íconos de app y tamaños menores a ~200 px. |
| **Sello a una tinta** | `sello-negro.svg` · `sello-blanco.svg` | Sello de goma, bolsa kraft, aluminio (texto calado). |
| **Monograma "B"** | `monograma.svg` | Solo favicon (16–48 px). |
| **Redes** | `redes/avatar-sello.png` (1080), `avatar-logo.png`, `perfil-whatsapp.png` (640), `portada-facebook.png` (1640×624), `cabecera-x.png` (1500×500), `historia-fondo.png` (1080×1920) | Listos para subir. |

**Color:** amarillo `#FCC900` y negro `#0F0F12` como base; rojo `#B22222` como acento (centro del sello, apilado sobre amarillo).

**Combinaciones permitidas:** amarillo sobre negro · negro sobre amarillo · rojo sobre amarillo · blanco sobre negro o foto oscura · una tinta negra sobre kraft/aluminio.

**Área de reserva:** margen libre igual al grosor del palo de la "I".
**Tamaño mínimo:** horizontal 96 px / 25 mm; apilada 64 px / 18 mm; sello completo 200 px / 30 mm (debajo, usar sello simple).

**El logo no se ensucia.** Puede ir sobre una foto sucia, pero nunca con texturas encima, sombras, degradados, 3D, contornos ni neón. Tampoco blanco sobre amarillo ni rojo sobre negro. Las gotas son parte del logo: no se quitan ni se alargan.

---

## 3. Color ✅

| Nombre | HEX | RGB | Rol |
| :--- | :--- | :--- | :--- |
| **Amarillo Jack** | `#FCC900` | 252 201 0 | Color dominante. Queso, luz de poste, la marca. |
| **Negro Asfalto** | `#1E1E1E` | 30 30 30 | Base. Noche, calle, texto. |
| **Rojo Potencia** | `#B22222` | 178 34 34 | Acento: cuernos, precios, alertas. Fondo solo en campaña. |
| **Aluminio Crudo** | `#C0C0C0` | 192 192 192 | Metal, empaque, textos secundarios sobre negro. |
| Blanco | `#FFFFFF` | 255 255 255 | Texto sobre negro y rojo; garabatos. |

**CMYK y Pantone:** pedir prueba de color a la imprenta y definir Pantone 🔒 [B12](./MANUAL_DE_MARCA.md#12-decisiones-pendientes). Conversiones directas de partida: Amarillo 0·20·100·1 · Rojo 0·81·81·30 · Negro 0·0·0·88 · Aluminio 0·0·0·25.

**Proporción por modo:**

| | Amarillo | Negro | Rojo | Blanco/Aluminio |
| :--- | :-: | :-: | :-: | :-: |
| Modo Amarillo | 60 % | 25 % | 10 % | 5 % |
| Modo Noche | 15 % | 65 % | 5 % | 15 % |

### 3.1 Apoyo

| Nombre | HEX | Uso | Estado |
| :--- | :--- | :--- | :--- |
| Kraft | `#B08A5E` | Bolsa, piezas "de empaque". | 🔒 [B7](./MANUAL_DE_MARCA.md#12-decisiones-pendientes) |
| Papel periódico | `#F2EBDD` | Fondos tipo diario popular. Reemplaza al crema que usan hoy algunos posts. | 🔒 [B7](./MANUAL_DE_MARCA.md#12-decisiones-pendientes) |
| Chicha | `#FF2E88` · `#FF7A00` · `#2BD94A` | **Solo campañas** (Fiestas Patrias, fechas especiales). Nunca en logo ni web. | ✅ |

### 3.2 Contraste de texto

| Combinación | Ratio | Uso |
| :--- | :-: | :--- |
| Negro sobre Amarillo | 10.7 : 1 | ✅ Todo tamaño. |
| Aluminio sobre Negro | 9.2 : 1 | ✅ Todo tamaño. |
| Blanco sobre Rojo | 6.7 : 1 | ✅ Todo tamaño. |
| Amarillo sobre Rojo | 4.3 : 1 | ⚠️ Solo titulares grandes. |
| Rojo sobre Negro | 2.5 : 1 | ❌ Nunca como texto. |
| Blanco sobre Amarillo | 1.6 : 1 | ❌ Nunca. |

---

## 4. Tipografía ✅

| Rol | Fuente | Reglas |
| :--- | :--- | :--- |
| **Logotipo** | Trazos propios (base Titan One, OFL) | Solo el wordmark; no se escribe con la fuente, se usa el SVG. |
| **Titulares** | **Anton** | MAYÚSCULAS, tracking −2 % a −5 %, interlineado 0.85–0.9. |
| **Texto y etiquetas** | **Poppins** 400–800 | Cuerpo en tipo oración. Etiquetas en 800 + MAYÚSCULAS + tracking +10 %. |
| **Garabato** | A mano (plumón blanco o negro) | Flechas, círculos, contornos sobre la burger, notas del tío. Se dibuja, no se tipea. |
| **Rotulado** | Lettering chicha / rótulo pintado | Solo campañas, hecho por un rotulista o ilustrador. |

### 4.1 Jerarquía en un lienzo de 1080 px de ancho

| Elemento | Tamaño | Fuente |
| :--- | :--- | :--- |
| Titular gigante (detrás del producto) | 260–420 px | Anton |
| Titular normal | 120–180 px | Anton |
| Bajada | 40–56 px | Poppins 600 |
| Etiqueta / sticker | 26–34 px | Poppins 800, mayúsculas |
| Precio | 90–140 px | Anton (en badge) |
| Créditos / dirección | 24–28 px | Poppins 500 |

Máximo **tres niveles** de texto por pieza.

---

## 5. Sistema de plantillas

Ocho plantillas que cubren casi todo. Salen de los tableros de referencia, adaptadas a nuestros colores, español y tono. Todas en 1080 × 1350 (4:5) y 1080 × 1920 (9:16).

| ID | Nombre | Modo | Cómo es | Para qué | Referencia del tablero |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **T1** | **Cartel** | Amarillo | Fondo plano, titular Anton gigante (1–2 palabras), la burger recortada encima **rompiendo** las letras. Logo en una esquina. | Producto, fechas ("DOMINGO", "VIERNES"), lanzamientos. | DOMINGO, STREET BURGER |
| **T2** | **La mano** | Amarillo / Rojo | Una mano entra desde un borde sosteniendo la burger. Titular grande del otro lado. | Producto con personalidad, anuncios. | CRUNCH, OBSESIÓN |
| **T3** | **Ingredientes** | Amarillo / Negro | Burger "desarmada" en capas reales al centro; los ingredientes escritos en Anton gigante vertical a los lados. | Explicar qué lleva cada burger. | Los posts actuales de JAMÓN/TOCINO (rehechos en nuestros colores y con foto real) |
| **T4** | **Garabato** | Noche | Foto real; encima, contornos, flechas y notas a mano en blanco ("esto chorrea →"). Titular rojo o amarillo abajo. | Cochinada, notas del tío. | CRAVE |
| **T5** | **Arco** | Noche | Foto de flash de una persona; titular en curva rodeándola. | Universo peruano, campañas. | YOU DESERVE A TREAT (en español: "TE LO GANASTE, VECINO") |
| **T6** | **Flash + titular** | Noche | Foto a sangre, titular corto en la zona segura, logo pequeño. | El caballo de batalla del feed. | Tablero de fotografía |
| **T7** | **Precio** | Amarillo | Burger recortada + nombre en Anton + precio en badge redondo o rectangular + una línea de bajada. | Carta, combos, delivery. | JR10 BURGER |
| **T8** | **Diario popular** | Papel periódico / Amarillo | Portada de diario inventado: titular enorme con exclamaciones, foto en recuadro, subtítulos en columnas. | Actualidad, sátira, memes. | Prensa popular limeña |

**Cómo se usan:** el CM elige la plantilla en el brief (`T1`–`T8`). Las plantillas maestras viven en el archivo de diseño del equipo (🔒 definir herramienta: Figma, Canva, otra).

### 5.1 Capa de suciedad

El tablero de gráficos es limpio y pop. Para que sea BIG JACK, toda plantilla del Modo Amarillo lleva **al menos uno** de estos, sin tapar texto ni precio:

- Grano de fotocopia (10–15 %).
- Un sticker torcido ("SELLADO", "HAY", "CHORREA").
- Una mancha de grasa en una esquina.
- Un garabato a mano.
- Una cinta de embalaje o de peligro.

---

## 6. Recursos gráficos

| Recurso | Uso |
| :--- | :--- |
| **Cinta de peligro** | "¡CUIDADO! CHORREA" / "¡CUIDADO! QUEMA". Esquinas, lanzamientos. |
| **Tachado del tío** | Se tacha la palabra pretenciosa y se escribe la nuestra encima: ~~Experiencia gourmet~~ **Está brava**. |
| **Sello "Central de Potencia"** | Aro: **"PJE. LARRABURE 142 · CENTRAL DE POTENCIA"**; centro: **"LIMA · BIG JACK · LIMA"**. Una tinta, con la imperfección del sello de goma. Empaque y redes. |
| **Sticker "SELLADO"** | Amarillo vertical en aluminio y bolsa. |
| **Corchetes** | `[ LIMA CENTRO ]`, `[ LA CALETA ]`, `[ HIT LIMEÑO ]`. |
| **Badge de precio** | Círculo o rectángulo negro con precio en Anton amarillo, o rojo con blanco. |
| **Garabatos** | Contornos, flechas, círculos, "→ esto", a plumón. |
| **Rótulos "HAY / NO HAY"** | Estilo pizarra o cartulina escrita a plumón. |
| **Texturas** | Fotocopia, papel periódico, aluminio arrugado, kraft con grasa. Siempre detrás del texto. |

---

## 7. Mascota: el Tío Jack ilustrado

El Tío Jack es solo voz en el contenido. Visualmente existe **solo como ilustración**: firma, sticker, cameo y cierre.

**Vigente hasta tener la nueva:** la ilustración v2 (busto, barba, gorra negra, polo negro, cuernos rojos, trazo grueso negro y blanco con acento rojo, sobre amarillo).

### 7.1 Brief para el ilustrador 🆕

```text
Cliente: BIG JACK, hamburguesería del Centro de Lima.
Personaje: el Tío Jack. Tío limeño de unos 45 que se cree de 35. Buena onda, alzado,
nostálgico. Usa jerga de chibolo mal y tarde. Diablo bonachón, no malvado.
Mantener (reconocimiento ganado): cara barbada, gorra de trabajo negra, polo negro, cuernos
rojos saliendo de la gorra.
Agregar: algunas canas en la barba, sonrisa de lado, ceja levantada, reloj Casio,
celular con la pantalla rajada.
Estilo: trazo grueso negro, plano, acento rojo #B22222, se lee sobre amarillo #FCC900
y sobre negro #1E1E1E. Debe funcionar a 64 px (avatar/sticker) y en un mural.
Referencias de espíritu: rótulos pintados a mano, caricatura de diario popular, cartel chicha.
Entregables:
  1. Busto principal (frente).
  2. 8 gestos: mordiendo, indignado, nostálgico mirando un balcón, celebrando un gol,
     hablando por un celular viejo, con servilleta al cuello, guiñando, durmiendo en la
     plancha.
  3. 6 stickers para historias y WhatsApp (con frases cortas del tío).
  4. Versión una tinta para sello y empaque.
Formatos: vectorial (AI/SVG) + PNG transparente.
Derechos: cesión total de derechos patrimoniales a BIG JACK, por escrito.
```

---

## 8. Composición

- **Una idea por pieza.** Un titular, una foto, un remate.
- **Producto grande:** al menos un tercio de la pieza.
- **Vertical primero** (4:5 y 9:16).
- **Zonas seguras en 9:16 (1080 × 1920):** sin texto ni logo en los ~250 px superiores ni en los ~350 px inferiores.
- **En la grilla 4:5:** Instagram recorta la vista de perfil a 3:4; el titular va centrado verticalmente.
- **Desorden controlado:** stickers torcidos y garabatos, pero titular, precio y logo siempre legibles y alineados.

---

## 9. Arte peruano para fechas especiales

En fechas y campañas, el Modo Amarillo se cruza con una estética peruana. Se encarga a un artista y se le da crédito.

| Fecha / campaña | Estética |
| :--- | :--- |
| Fiestas Patrias | Cartel chicha (fluorescentes, letra rotulada). |
| Día de la Canción Criolla | Afiche de peña / carátula de disco de vinilo de los 60. |
| Aniversario de Lima | Postal antigua del Centro, grabado, foto en blanco y negro coloreada. |
| Día del Padre | Foto de álbum familiar de los 90 (borde blanco, fecha naranja en la esquina). |
| Año Nuevo | Horóscopo de diario popular. |
| Partidos de la selección | Portada de diario deportivo. |
| Halloween | No existe: el tío elige criollo (ver Canción Criolla). |
| Campañas especiales | Retablo ayacuchano, tablas de Sarhua, rótulo de combi, mate burilado. |

---

## 10. Lo que hay hoy en Instagram

Auditoría visual de los 4 posts actuales (detalle de bio y estrategia en [GUIA_REDES.md](./GUIA_REDES.md)):

| Post | Qué funciona | Qué cambiar |
| :--- | :--- | :--- |
| "EL ANTOJO DEL DOMINGO" (persona con cuernos, fondo amarillo) | Modo Amarillo bien logrado, persona real, actitud. | Nada grave. Es la mejor pieza actual. |
| Queso derritiéndose en la plancha | Pura cochinada. | Falta el flash duro y el grano del look Noche. |
| "JAMÓN QUESO HUEVO TOMATE" (burger flotando en capas) | La idea de ingredientes como titular (es la plantilla T3). | Fondo crema y naranja fuera de paleta; burger de estudio perfecta. Si no es nuestro producto real, se retira. Rehacer con foto real y amarillo/negro. |
| "TOCINO QUESO CARNE" (igual) | Mismo concepto. | Mismo problema. Además dice "TOCINO" y el producto se llama "La Bacon" ([B4](./MANUAL_DE_MARCA.md#12-decisiones-pendientes)). |

---

## 11. Usos incorrectos

- Fondos o paletas fuera del sistema (crema, naranja, azul) salvo campaña aprobada.
- Producto de banco de imágenes o IA.
- Más de tres niveles de texto.
- Texto en las zonas seguras de 9:16.
- Texturas encima del texto, el precio o el logo.
- Logo deformado, con efectos o "ensuciado".
- Plantillas del tablero copiadas tal cual (con su texto en inglés o el logo de otra marca).
