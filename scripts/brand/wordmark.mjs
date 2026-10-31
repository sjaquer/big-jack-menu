// Logotipo BIG JACK: letras gordas (Titan One como base), apretadas, con rebote y queso chorreando.
import { bottomAt, drip, groupBounds, scaleLetters, setWord, toPathData, translateLetters } from "./geometry.mjs";

const SIZE = 200;

// Personalidad: cada letra sube/baja y gira un poco (como rótulo pintado a mano).
const BIG = { text: "BIG", bounce: [0.0, -0.02, 0.008], tilt: [-2, 1.5, -1.5], tracking: -0.03 };
const JACK = { text: "JACK", bounce: [0.012, -0.018, 0.0, -0.012], tilt: [2, -2, 1.5, -2], tracking: -0.02 };

// Gotas: letra (índice global), posición relativa en su ancho, largo y grosor (en tamaños de letra).
// Siempre en palos con base plana (I, pata de la A, K): una gota bajo la C se leería "Ç".
const DRIPS_HORIZONTAL = [
  { word: "BIG", index: 1, at: 0.5, length: 0.22, width: 0.095 },
  { word: "JACK", index: 1, at: 0.8, length: 0.34, width: 0.105 },
  { word: "JACK", index: 3, at: 0.2, length: 0.15, width: 0.08 },
];

function word(spec, size = SIZE) {
  return setWord(spec.text, { size, tracking: spec.tracking, bounce: spec.bounce, tilt: spec.tilt });
}

function dripsFor(groups, specs, size) {
  return specs.map((spec) => {
    const letter = groups[spec.word][spec.index];
    const x = letter.box.minX + letter.box.width * spec.at;
    const top = bottomAt(letter.commands, x) - 0.5;
    const width = spec.width * size;
    return { d: drip(x, top, { length: spec.length * size, width }), bottom: top + spec.length * size + width / 2 };
  });
}

function pack(letters, drips, padding) {
  const box = groupBounds(letters);
  return { letters, drips, box, padding };
}

export function horizontalWordmark() {
  const big = word(BIG);
  const bigBox = groupBounds(big);
  const jack = translateLetters(word(JACK), bigBox.maxX + SIZE * 0.12, 0);
  const groups = { BIG: big, JACK: jack };
  return pack([...big, ...jack], dripsFor(groups, DRIPS_HORIZONTAL, SIZE), SIZE * 0.08);
}

export function stackedWordmark() {
  const jack = word(JACK);
  const jackBox = groupBounds(jack);
  let big = word(BIG);
  const bigBox = groupBounds(big);
  // BIG se agranda hasta el ancho de JACK y se centra encima.
  const s = jackBox.width / bigBox.width;
  big = scaleLetters(big, s, bigBox.minX, bigBox.maxY);
  const scaled = groupBounds(big);
  big = translateLetters(big, jackBox.minX - scaled.minX, jackBox.minY - SIZE * 0.06 - scaled.maxY);
  const groups = { BIG: big, JACK: jack };
  const specs = [
    { word: "JACK", index: 1, at: 0.16, length: 0.17, width: 0.085 },
    { word: "JACK", index: 1, at: 0.82, length: 0.36, width: 0.11 },
    { word: "JACK", index: 3, at: 0.2, length: 0.22, width: 0.09 },
  ];
  return pack([...big, ...jack], dripsFor(groups, specs, SIZE), SIZE * 0.08);
}

// SVG de una marca: `fill` para letras y gotas; viewBox ajustado con margen.
export function wordmarkSvg(mark, { fill = "#FCC900", title = "BIG JACK" } = {}) {
  const allY = Math.max(mark.box.maxY, ...mark.drips.map((d) => d.bottom)) + mark.padding;
  const x = mark.box.minX - mark.padding;
  const y = mark.box.minY - mark.padding;
  const w = mark.box.width + mark.padding * 2;
  const h = allY - y;
  const letters = mark.letters.map((l) => toPathData(l.commands)).join("");
  return {
    viewBox: `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`,
    width: w,
    height: h,
    body: `<path d="${letters}" fill="${fill}"/><path d="${mark.drips.map((d) => d.d).join("")}" fill="${fill}"/>`,
    svg(extra = "") {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${this.viewBox}" role="img" aria-label="${title}"><title>${title}</title>${extra}${this.body}</svg>`;
    },
  };
}

// Monograma: una "B" gorda con su gota. Para favicon (se lee incluso a 16 px).
export function monogram() {
  const letters = setWord("B", { size: SIZE, tilt: [-4] });
  const drips = dripsFor({ B: letters }, [{ word: "B", index: 0, at: 0.56, length: 0.24, width: 0.12 }], SIZE);
  return pack(letters, drips, SIZE * 0.06);
}

// SVG cuadrado (ícono) con el monograma centrado sobre `background`.
export function monogramSvg({ fill = "#0f0f12", background = "#FCC900", radius = 0.22, inset = 0.16 } = {}) {
  const mark = monogram();
  const box = mark.box;
  const bottom = Math.max(box.maxY, ...mark.drips.map((d) => d.bottom));
  const contentW = box.width;
  const contentH = bottom - box.minY;
  const side = Math.max(contentW, contentH) / (1 - inset * 2);
  const x = box.minX + contentW / 2 - side / 2;
  const y = box.minY + contentH / 2 - side / 2;
  const letters = mark.letters.map((l) => toPathData(l.commands)).join("");
  const bg = background
    ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" rx="${(side * radius).toFixed(1)}" fill="${background}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x.toFixed(1)} ${y.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}" role="img" aria-label="BIG JACK"><title>BIG JACK</title>${bg}<path d="${letters}" fill="${fill}"/><path d="${mark.drips.map((d) => d.d).join("")}" fill="${fill}"/></svg>`;
}
