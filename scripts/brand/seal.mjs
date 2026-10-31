// Isotipo: sello "Central de Potencia". Aro negro con texto, centro amarillo con el logotipo apilado.
import { circlePath, groupBounds, mapCommands, star, textOnCircle, toPathData } from "./geometry.mjs";
import { stackedWordmark } from "./wordmark.mjs";

export const SEAL_SIZE = 1000;
const C = SEAL_SIZE / 2;
const R_OUTER = 500;
const R_INNER = 340;
const RING_TEXT = ["PJE. LARRABURE 142", "CENTRAL DE POTENCIA"];
const TEXT_SIZE = 82;
const TEXT_R = 366; // borde interior del texto del aro

function ringText() {
  // Arriba la dirección (se lee en sentido horario), abajo el lema derecho; estrellas a los lados.
  const top = textOnCircle(RING_TEXT[0], { cx: C, cy: C, r: TEXT_R, size: TEXT_SIZE, tracking: 0.1, centerDeg: 0 });
  const bottom = textOnCircle(RING_TEXT[1], { cx: C, cy: C, r: TEXT_R, size: TEXT_SIZE, tracking: 0.1, centerDeg: 180, bottom: true });
  const sr = TEXT_R + TEXT_SIZE * 0.36;
  const stars = [star(C - sr, C, 30, -Math.PI / 2), star(C + sr, C, 30, Math.PI / 2)].join("");
  return { text: toPathData([...top, ...bottom]), stars };
}

function centerMark(maxWidth, centerY) {
  const mark = stackedWordmark();
  const box = groupBounds(mark.letters);
  const bottom = Math.max(box.maxY, ...mark.drips.map((d) => d.bottom));
  const s = maxWidth / box.width;
  const ox = C - (box.minX + box.width / 2) * s;
  const oy = centerY - (box.minY + (bottom - box.minY) / 2) * s;
  const fit = (x, y) => [ox + x * s, oy + y * s];
  const letters = mark.letters.map((l) => toPathData(mapCommands(l.commands, fit))).join("");
  // Las gotas son strings SVG: se escalan con un transform.
  return { letters, drips: mark.drips.map((d) => d.d).join(""), dripTransform: `matrix(${s} 0 0 ${s} ${ox} ${oy})` };
}

/**
 * colors: { ring, ringText, center, mark } — o `ink` para una sola tinta (texto calado).
 */
export function sealSvg({ ring = "#0f0f12", ringText: ringTextColor = "#FCC900", center = "#FCC900", mark = "#B22222", ink, simple = false } = {}) {
  // `simple`: sin texto en el aro, con el centro más grande (íconos de app y avatar pequeño).
  const { text, stars } = simple ? { text: "", stars: "" } : ringText();
  const innerR = simple ? 405 : R_INNER;
  const m = centerMark(simple ? 560 : 470, C + 6);
  const title = "BIG JACK · Central de Potencia · Pje. Larrabure 142";
  let body;
  if (ink) {
    // Una tinta: aro sólido con el texto calado (evenodd) + línea interior + logotipo.
    body = [
      `<path fill-rule="evenodd" d="${circlePath(C, C, R_OUTER)}${circlePath(C, C, innerR)}${text}${stars}" fill="${ink}"/>`,
      `<path fill-rule="evenodd" d="${circlePath(C, C, innerR - 18)}${circlePath(C, C, innerR - 28)}" fill="${ink}"/>`,
      `<path d="${m.letters}" fill="${ink}"/><path d="${m.drips}" transform="${m.dripTransform}" fill="${ink}"/>`,
    ].join("");
  } else {
    body = [
      `<circle cx="${C}" cy="${C}" r="${R_OUTER}" fill="${ring}"/>`,
      `<path d="${text}${stars}" fill="${ringTextColor}"/>`,
      `<circle cx="${C}" cy="${C}" r="${innerR}" fill="${center}"/>`,
      `<path fill-rule="evenodd" d="${circlePath(C, C, innerR - 18)}${circlePath(C, C, innerR - 28)}" fill="${ring}"/>`,
      `<path d="${m.letters}" fill="${mark}"/><path d="${m.drips}" transform="${m.dripTransform}" fill="${mark}"/>`,
    ].join("");
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SEAL_SIZE} ${SEAL_SIZE}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;
}
