// Utilidades geométricas para construir la marca como trazos SVG (sin depender de fuentes).
import fs from "node:fs";
import opentype from "opentype.js";

// Carga una fuente desde disco (API estable de opentype.js 1.x y 2.x).
const loadFont = (file) => {
  const data = fs.readFileSync(file);
  return opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
};
import { fileURLToPath } from "node:url";

const FONT_PATH = fileURLToPath(new URL("../fonts/TitanOne-Regular.ttf", import.meta.url));
export const font = loadFont(FONT_PATH);

const round = (n) => Math.round(n * 100) / 100;

// Aplica `fn(x, y) => [x, y]` a todos los puntos de una lista de comandos opentype.
export function mapCommands(commands, fn) {
  return commands.map((c) => {
    const out = { type: c.type };
    if ("x" in c) [out.x, out.y] = fn(c.x, c.y);
    if ("x1" in c) [out.x1, out.y1] = fn(c.x1, c.y1);
    if ("x2" in c) [out.x2, out.y2] = fn(c.x2, c.y2);
    return out;
  });
}

export function toPathData(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case "M":
        case "L":
          return `${c.type}${round(c.x)} ${round(c.y)}`;
        case "Q":
          return `Q${round(c.x1)} ${round(c.y1)} ${round(c.x)} ${round(c.y)}`;
        case "C":
          return `C${round(c.x1)} ${round(c.y1)} ${round(c.x2)} ${round(c.y2)} ${round(c.x)} ${round(c.y)}`;
        default:
          return "Z";
      }
    })
    .join("");
}

export function bounds(commands) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of commands) {
    for (const [x, y] of [[c.x, c.y], [c.x1, c.y1], [c.x2, c.y2]]) {
      if (x === undefined) continue;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

const rotateAround = (cx, cy, deg) => {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r), sin = Math.sin(r);
  return (x, y) => [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos];
};

/**
 * Compone una palabra letra por letra con interletrado, rebote vertical y giro por letra.
 * Devuelve una lista de letras { char, commands, box } con la línea base en y = 0.
 */
export function setWord(text, { size, tracking = 0, bounce = [], tilt = [], kern = {} }) {
  const letters = [];
  let x = 0;
  [...text].forEach((char, i) => {
    const glyph = font.charToGlyph(char);
    const scale = size / font.unitsPerEm;
    const raw = glyph.getPath(x, 0, size).commands;
    const box = bounds(raw);
    const cx = box.minX + box.width / 2;
    const cy = box.minY + box.height / 2;
    const dy = (bounce[i] || 0) * size;
    const commands = mapCommands(raw, (px, py) => rotateAround(cx, cy, tilt[i] || 0)(px, py + dy));
    letters.push({ char, commands, box: bounds(commands) });
    x += glyph.advanceWidth * scale + tracking * size + (kern[i] || 0) * size;
  });
  return letters;
}

export function translateLetters(letters, dx, dy) {
  return letters.map((l) => {
    const commands = mapCommands(l.commands, (x, y) => [x + dx, y + dy]);
    return { ...l, commands, box: bounds(commands) };
  });
}

export function scaleLetters(letters, s, ox = 0, oy = 0) {
  return letters.map((l) => {
    const commands = mapCommands(l.commands, (x, y) => [ox + (x - ox) * s, oy + (y - oy) * s]);
    return { ...l, commands, box: bounds(commands) };
  });
}

// Aproxima el contorno con segmentos rectos (para medir bordes).
function flatten(commands, steps = 12) {
  const segments = [];
  let start = null, prev = null;
  for (const c of commands) {
    if (c.type === "M") {
      start = prev = [c.x, c.y];
    } else if (c.type === "L") {
      segments.push([prev, [c.x, c.y]]);
      prev = [c.x, c.y];
    } else if (c.type === "Q" || c.type === "C") {
      for (let i = 1; i <= steps; i++) {
        const t = i / steps, u = 1 - t;
        const p = c.type === "Q"
          ? [u * u * prev[0] + 2 * u * t * c.x1 + t * t * c.x, u * u * prev[1] + 2 * u * t * c.y1 + t * t * c.y]
          : [
              u ** 3 * prev[0] + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t ** 3 * c.x,
              u ** 3 * prev[1] + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t ** 3 * c.y,
            ];
        segments.push([segments.length && i > 1 ? segments[segments.length - 1][1] : prev, p]);
      }
      prev = [c.x, c.y];
    } else if (c.type === "Z" && start && prev) {
      segments.push([prev, start]);
      prev = start;
    }
  }
  return segments;
}

// Punto más bajo del contorno de una letra en la vertical x.
export function bottomAt(commands, x) {
  let best = -Infinity;
  for (const [[x1, y1], [x2, y2]] of flatten(commands)) {
    if ((x1 - x) * (x2 - x) > 0 || x1 === x2) continue;
    const y = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
    best = Math.max(best, y);
  }
  return best;
}

export function groupBounds(letters) {
  return bounds(letters.flatMap((l) => l.commands));
}

/**
 * Gota de queso que cuelga desde `top` (y) en la posición x: se funde con la
 * letra con una curva suave y termina en punta redonda (cápsula).
 */
export function drip(x, top, { length, width }) {
  const w = width / 2;
  const neck = w * 0.84; // se adelgaza al caer
  const r = w * 1.06; // y termina en una gota un poco más gorda
  const flare = width * 0.8;
  const end = top + length - r;
  const k = 0.5523 * r;
  return [
    `M${round(x - w - flare)} ${round(top - flare)}`,
    `L${round(x + w + flare)} ${round(top - flare)}`,
    `L${round(x + w + flare)} ${round(top)}`,
    `Q${round(x + w)} ${round(top)} ${round(x + w)} ${round(top + flare)}`,
    `C${round(x + w)} ${round(top + flare + (end - top) * 0.35)} ${round(x + neck)} ${round(end - r * 1.6)} ${round(x + neck)} ${round(end - r * 0.9)}`,
    `C${round(x + neck)} ${round(end - r * 0.45)} ${round(x + r)} ${round(end - k * 0.7)} ${round(x + r)} ${round(end)}`,
    `C${round(x + r)} ${round(end + k)} ${round(x + k)} ${round(end + r)} ${round(x)} ${round(end + r)}`,
    `C${round(x - k)} ${round(end + r)} ${round(x - r)} ${round(end + k)} ${round(x - r)} ${round(end)}`,
    `C${round(x - r)} ${round(end - k * 0.7)} ${round(x - neck)} ${round(end - r * 0.45)} ${round(x - neck)} ${round(end - r * 0.9)}`,
    `C${round(x - neck)} ${round(end - r * 1.6)} ${round(x - w)} ${round(top + flare + (end - top) * 0.35)} ${round(x - w)} ${round(top + flare)}`,
    `Q${round(x - w)} ${round(top)} ${round(x - w - flare)} ${round(top)}`,
    "Z",
  ].join("");
}

// Estrella de 5 puntas centrada en (cx, cy).
export function star(cx, cy, r, rotation = 0) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2 + rotation;
    points.push(`${round(cx + radius * Math.cos(a))} ${round(cy + radius * Math.sin(a))}`);
  }
  return `M${points.join("L")}Z`;
}

/**
 * Texto sobre un círculo centrado en el ángulo `centerDeg` (0 = arriba, sentido horario).
 * `bottom: true` lo escribe derecho en la parte inferior (leyendo de izquierda a derecha,
 * con las letras apuntando al centro), como en un sello. `r` es el radio del borde interior
 * del texto en ambos casos, así arriba y abajo ocupan la misma banda.
 */
export function textOnCircle(text, { cx, cy, r, size, tracking = 0, centerDeg = 0, bottom = false }) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((char) => font.charToGlyph(char));
  const advances = glyphs.map((g) => g.advanceWidth * scale + tracking * size);
  const capHeight = (font.tables.os2.sCapHeight || font.unitsPerEm * 0.7) * scale;
  const baseR = bottom ? r + capHeight : r;
  const total = advances.reduce((a, b) => a + b, 0) - tracking * size;
  const dir = bottom ? -1 : 1;
  let angle = (centerDeg * Math.PI) / 180 - dir * (total / 2 / baseR);
  const commands = [];
  glyphs.forEach((glyph, i) => {
    const half = (advances[i] - tracking * size) / 2;
    const theta = angle + dir * (half / baseR);
    const raw = glyph.getPath(-half, 0, size).commands;
    const rot = bottom ? theta + Math.PI : theta;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    const px = cx + baseR * Math.sin(theta);
    const py = cy - baseR * Math.cos(theta);
    commands.push(...mapCommands(raw, (x, y) => [px + x * cos - y * sin, py + x * sin + y * cos]));
    angle += dir * (advances[i] / baseR);
  });
  return commands;
}

export function circlePath(cx, cy, r) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

export function textWidth(text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  return [...text].reduce((w, ch) => w + font.charToGlyph(ch).advanceWidth * scale + tracking * size, 0);
}
