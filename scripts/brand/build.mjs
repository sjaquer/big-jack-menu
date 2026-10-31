// Genera el kit de marca BIG JACK: `node scripts/brand/build.mjs`
// Salida: public/brand/ (SVG + PNG de redes), íconos en app/ y public/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

// Carga una fuente desde disco (API estable de opentype.js 1.x y 2.x).
const loadFont = (file) => {
  const data = fs.readFileSync(file);
  return opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
};
import sharp from "sharp";
import { horizontalWordmark, monogramSvg, stackedWordmark, wordmarkSvg } from "./wordmark.mjs";
import { sealSvg } from "./seal.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const OUT = path.join(ROOT, "public/brand");
const SOCIAL = path.join(OUT, "redes");
const COLORS = { yellow: "#FCC900", black: "#0F0F12", red: "#B22222", white: "#FFFFFF" };
const poppins = loadFont(path.join(ROOT, "scripts/fonts/Poppins-SemiBold.ttf"));

fs.mkdirSync(SOCIAL, { recursive: true });
const write = (file, content) => {
  fs.writeFileSync(file, content);
  console.log("✓", path.relative(ROOT, file));
};
const png = (svg, file, size) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(size).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(file).then(() => console.log("✓", path.relative(ROOT, file)));

// --- Logotipos -------------------------------------------------------------
const horizontal = horizontalWordmark();
const stacked = stackedWordmark();
const variants = { "": COLORS.yellow, "-negro": COLORS.black, "-blanco": COLORS.white };
for (const [suffix, fill] of Object.entries(variants)) {
  write(path.join(OUT, `logo-horizontal${suffix}.svg`), wordmarkSvg(horizontal, { fill }).svg());
  write(path.join(OUT, `logo-apilado${suffix}.svg`), wordmarkSvg(stacked, { fill }).svg());
}
write(path.join(OUT, "logo-apilado-rojo.svg"), wordmarkSvg(stacked, { fill: COLORS.red }).svg());

// --- Isotipo: sello y monograma -----------------------------------------------
write(path.join(OUT, "sello.svg"), sealSvg());
write(path.join(OUT, "sello-simple.svg"), sealSvg({ simple: true }));
write(path.join(OUT, "sello-negro.svg"), sealSvg({ ink: COLORS.black }));
write(path.join(OUT, "sello-blanco.svg"), sealSvg({ ink: COLORS.white }));
write(path.join(OUT, "monograma.svg"), monogramSvg());

// --- Íconos del sitio -----------------------------------------------------------
// Favicon: la "B" (legible a 16 px). Íconos de app: sello simple sobre amarillo.
const appIcon = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect width="1000" height="1000" fill="${COLORS.yellow}"/>` +
  `<g transform="translate(${500 - 500 * scale} ${500 - 500 * scale}) scale(${scale})">${sealSvg({ simple: true }).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`;

write(path.join(ROOT, "app/icon.svg"), monogramSvg());
await png(appIcon(0.86), path.join(ROOT, "app/apple-icon.png"), 180);
await png(appIcon(0.8), path.join(ROOT, "public/web-app-manifest-192x192.png"), 192);
await png(appIcon(0.8), path.join(ROOT, "public/web-app-manifest-512x512.png"), 512);

// favicon.ico con PNG de 16, 32 y 48 px embebidos.
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map((size) => sharp(Buffer.from(monogramSvg()), { density: 300 }).resize(size).png().toBuffer())
);
const header = Buffer.alloc(6 + icoSizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = header.length;
icoImages.forEach((img, i) => {
  const entry = 6 + i * 16;
  header.writeUInt8(icoSizes[i], entry);
  header.writeUInt8(icoSizes[i], entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(img.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += img.length;
});
write(path.join(ROOT, "app/favicon.ico"), Buffer.concat([header, ...icoImages]));

// --- Redes sociales -----------------------------------------------------------
const inner = (svg) => svg.replace(/^<svg[^>]*>|<\/svg>$/g, "");
const viewBoxOf = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);

// Inserta un SVG dentro de un rectángulo (x, y, ancho máx., alto máx.), centrado.
function place(svg, x, y, maxW, maxH) {
  const [vx, vy, vw, vh] = viewBoxOf(svg);
  const s = Math.min(maxW / vw, maxH / vh);
  const dx = x + (maxW - vw * s) / 2 - vx * s;
  const dy = y + (maxH - vh * s) / 2 - vy * s;
  return `<g transform="translate(${dx} ${dy}) scale(${s})">${inner(svg)}</g>`;
}

function line(text, x, y, size, fill, anchor = "middle") {
  const width = poppins.getAdvanceWidth(text, size);
  const left = anchor === "middle" ? x - width / 2 : x;
  return `<path d="${poppins.getPath(text, left, y, size).toPathData(2)}" fill="${fill}"/>`;
}

const canvas = (w, h, bg, content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${content}</svg>`;

const tagline = "Hamburguesas a la plancha · Pje. Larrabure 142, Centro de Lima";
const logoH = wordmarkSvg(horizontal, { fill: COLORS.yellow }).svg();
const logoS = wordmarkSvg(stacked, { fill: COLORS.yellow }).svg();

const social = [
  // Perfil (Instagram, TikTok, Facebook): se recorta en círculo; el sello encaja exacto.
  ["avatar-sello.png", canvas(1080, 1080, COLORS.yellow, place(sealSvg(), 20, 20, 1040, 1040))],
  ["avatar-logo.png", canvas(1080, 1080, COLORS.black, place(logoS, 190, 190, 700, 700))],
  ["perfil-whatsapp.png", canvas(640, 640, COLORS.yellow, place(sealSvg({ simple: true }), 24, 24, 592, 592))],
  // Portadas: contenido al centro (zona segura); en Facebook la foto de perfil tapa abajo a la izquierda.
  [
    "portada-facebook.png",
    canvas(1640, 624, COLORS.black, place(logoH, 420, 150, 800, 250) + line(tagline, 820, 470, 30, "#BDBDBD")),
  ],
  [
    "cabecera-x.png",
    canvas(1500, 500, COLORS.black, place(logoH, 400, 110, 700, 210) + line(tagline, 750, 380, 26, "#BDBDBD")),
  ],
  [
    "historia-fondo.png",
    canvas(1080, 1920, COLORS.yellow, place(sealSvg(), 240, 300, 600, 600) + place(wordmarkSvg(stacked, { fill: COLORS.black }).svg(), 190, 1050, 700, 500)),
  ],
];
for (const [file, svg] of social) await png(svg, path.join(SOCIAL, file));

console.log("\nKit de marca listo en public/brand/");
