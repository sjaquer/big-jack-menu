// Dibuja la torre en el canvas. Solo lectura del estado del motor.
import { LAYER_HEIGHT, WORLD_WIDTH } from "./engine";

const COLORS = {
  "pan-base": "#d9963c",
  "pan-top": "#e2a24a",
  carne: "#4b2a1b",
  queso: "#fcc900",
  tocino: "#b4452d",
  huevo: "#f3eee1",
  jamon: "#e39a9a",
  platano: "#e7a23b",
  pepinillo: "#6f8f2d",
};

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function drawLayer(ctx, type, x, y, w, h) {
  if (w <= 0.5) return;
  ctx.fillStyle = COLORS[type] || COLORS.carne;

  if (type === "pan-top") {
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.bezierCurveTo(x, y - h * 1.6, x + w, y - h * 1.6, x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f6e7c8";
    for (let i = 1; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(x + (w * i) / 6, y + (i % 2 ? -h * 0.1 : h * 0.25), w * 0.018, h * 0.12, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (type === "pan-base") {
    // Pan de abajo: más alto y con base redondeada.
    ctx.beginPath();
    ctx.roundRect(x, y, w, h * 1.7, [h * 0.3, h * 0.3, h * 0.9, h * 0.9]);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x + 6, y + 3, Math.max(0, w - 12), 2);
    return;
  }

  roundRect(ctx, x, y, w, h, h * 0.35);

  if (type === "queso") {
    // Queso que chorrea.
    for (let i = 0; i < Math.floor(w / 28); i++) {
      const dx = x + 10 + i * 28 + (i % 2) * 6;
      ctx.beginPath();
      ctx.roundRect(dx, y + h * 0.6, 7, h * (0.9 + (i % 3) * 0.3), 4);
      ctx.fill();
    }
  } else if (type === "carne") {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (let gx = x + 12; gx < x + w - 8; gx += 22) ctx.fillRect(gx, y + h * 0.3, 10, 2);
  } else if (type === "tocino") {
    ctx.strokeStyle = "#e07b5f";
    ctx.lineWidth = Math.max(1.5, h * 0.12);
    ctx.beginPath();
    for (let gx = x + 4; gx < x + w - 4; gx += 6) ctx.lineTo(gx, y + h * 0.5 + Math.sin(gx / 6) * h * 0.18);
    ctx.stroke();
  } else if (type === "huevo") {
    ctx.fillStyle = "#f5a51c";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h * 0.45, Math.min(w * 0.18, h * 1.1), h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "pepinillo" || type === "platano") {
    ctx.fillStyle = type === "pepinillo" ? "#a9c45a" : "#b8741c";
    for (let gx = x + 10; gx < x + w - 6; gx += 18) {
      ctx.beginPath();
      ctx.arc(gx, y + h / 2, h * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Brillo superior.
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(x + 4, y + 2, Math.max(0, w - 8), 2);
}

/**
 * @param view { width, height, camera } en píxeles CSS; camera desplaza la torre hacia abajo.
 */
export function render(ctx, state, view) {
  const { width, height, camera } = view;
  const scale = Math.min(width / WORLD_WIDTH, 1.7);
  const offsetX = (width - WORLD_WIDTH * scale) / 2;
  const ground = height - 90;
  const h = LAYER_HEIGHT * scale;
  const sx = (x) => offsetX + x * scale;
  const layerTop = (index) => ground + camera - (index + 1) * h;

  ctx.clearRect(0, 0, width, height);

  // Halo cálido detrás de la torre.
  const glow = ctx.createRadialGradient(width / 2, height * 0.65, 10, width / 2, height * 0.65, width * 0.8);
  glow.addColorStop(0, "rgba(252,201,0,0.12)");
  glow.addColorStop(1, "rgba(252,201,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Plato.
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.ellipse(width / 2, ground + camera + 6, WORLD_WIDTH * scale * 0.48, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  state.layers.forEach((layer, index) => {
    drawLayer(ctx, layer.type, sx(layer.x), layerTop(index), layer.w * scale, h);
  });

  const top = state.layers.length;
  if (state.status === "over") {
    const last = state.layers[top - 1];
    drawLayer(ctx, "pan-top", sx(last.x), layerTop(top), last.w * scale, h);
  } else {
    const { current } = state;
    drawLayer(ctx, current.type, sx(current.x), layerTop(top), current.w * scale, h);
  }

  ctx.globalAlpha = 0.85;
  state.debris.forEach((piece) => {
    const bottom = ground + camera + piece.y * scale;
    drawLayer(ctx, piece.type, sx(piece.x), bottom - h, piece.w * scale, h);
  });
  ctx.globalAlpha = 1;

  return { stackHeight: (top + 1) * h };
}
