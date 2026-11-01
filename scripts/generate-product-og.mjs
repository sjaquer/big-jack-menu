// Imagen de previsualización (Open Graph) por producto: public/images/og/<slug>.jpg
// 1200×630 JPG liviano (WhatsApp, Facebook, X). Se ejecuta con `npm run og` y antes de cada build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";
import { categoryInfo, menuItems, restaurantInfo } from "../app/data/menuData.js";
import { SITE_URL } from "../app/lib/site.js";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "public/images/og");
const W = 1200;
const H = 630;
const LEFT = 64;
const TEXT_MAX = 560;
const YELLOW = "#FCC900";

const loadFont = (file) => {
  const data = fs.readFileSync(path.join(ROOT, "scripts/fonts", file));
  return opentype.parse(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
};
const anton = loadFont("Anton-Regular.ttf");
const poppins = loadFont("Poppins-SemiBold.ttf");

const textPath = (font, text, x, y, size, fill) =>
  `<path d="${font.getPath(text, x, y, size).toPathData(2)}" fill="${fill}"/>`;

// Parte el nombre en líneas que entren en el ancho; achica la letra si hace falta (máx. 2 líneas).
function fitLines(text, maxWidth, startSize) {
  for (let size = startSize; size >= 48; size -= 4) {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (anton.getAdvanceWidth(candidate, size) <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
    if (lines.length <= 2 && lines.every((l) => anton.getAdvanceWidth(l, size) <= maxWidth)) return { lines, size };
  }
  return { lines: [text], size: 48 };
}

function logoMarkup() {
  const svg = fs.readFileSync(path.join(ROOT, "public/brand/logo-horizontal.svg"), "utf8");
  const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const s = Math.min(230 / vw, 70 / vh);
  const inner = svg.replace(/^<svg[^>]*>|<\/svg>$/g, "").replace(/<title>.*?<\/title>/, "");
  return `<g transform="translate(${LEFT - vx * s} ${52 - vy * s}) scale(${s})">${inner}</g>`;
}

async function photo(item) {
  const buffer = await sharp(path.join(ROOT, "public", item.image)).resize(660, H, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

async function render(item, logo) {
  const isBurger = item.name.startsWith("Hamburguesa ");
  const eyebrow = isBurger ? "HAMBURGUESA" : (categoryInfo[item.category]?.title || "").toUpperCase();
  const name = (isBurger ? item.name.slice("Hamburguesa ".length) : item.name).toUpperCase();
  const { lines, size } = fitLines(name, TEXT_MAX, 120);
  const min = Math.min(...item.options.map((o) => o.price));
  const price = `${item.options.length > 1 ? "DESDE " : ""}S/ ${min.toFixed(2)}`;
  const priceSize = 40;
  const priceW = anton.getAdvanceWidth(price, priceSize) + 48;

  const nameTop = 236;
  const nameMarkup = lines
    .map((line, i) => textPath(anton, line, LEFT, nameTop + size * 0.95 * (i + 1), size, i === lines.length - 1 ? YELLOW : "#FFFFFF"))
    .join("");
  const priceY = nameTop + size * 0.95 * lines.length + 44;
  const footer = `${restaurantInfo.address.street} · ${restaurantInfo.address.area}   ·   ${new URL(SITE_URL).host}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#0f0f12" stop-opacity="1"/>
      <stop offset="0.45" stop-color="#0f0f12" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0f0f12"/>
  <image href="${await photo(item)}" x="${W - 660}" y="0" width="660" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${W - 660}" y="0" width="660" height="${H}" fill="url(#fade)"/>
  ${logo}
  ${textPath(poppins, eyebrow, LEFT, nameTop - 8, 22, "#9CA3AF")}
  ${nameMarkup}
  <rect x="${LEFT}" y="${priceY}" width="${priceW}" height="64" rx="8" fill="${YELLOW}"/>
  ${textPath(anton, price, LEFT + 24, priceY + 47, priceSize, "#0f0f12")}
  ${textPath(poppins, footer, LEFT, H - 44, 20, "#8B8B95")}
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${YELLOW}"/>
</svg>`;

  return sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const logo = logoMarkup();
  for (const item of menuItems) {
    const jpg = await render(item, logo);
    fs.writeFileSync(path.join(OUT, `${item.slug}.jpg`), jpg);
    console.log(`✓ public/images/og/${item.slug}.jpg (${Math.round(jpg.length / 1024)} KB)`);
  }
}

// Si falla, se avisa pero no se corta el build: quedan las imágenes ya commiteadas.
main().catch((error) => console.error("No se pudieron generar las imágenes OG de producto:", error));
