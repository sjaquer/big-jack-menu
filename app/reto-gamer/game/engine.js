// Motor de "Arma tu burger": funciones puras (sin DOM) para poder testearlas.
// Coordenadas en un mundo de WORLD_WIDTH unidades; el render lo escala al canvas.

export const WORLD_WIDTH = 320;
export const LAYER_HEIGHT = 18;
export const BASE_WIDTH = 210;
export const PERFECT_TOLERANCE = 4;
export const BASE_SPEED = 140; // unidades por segundo
export const MAX_SPEED = 420;
export const SPEED_STEP = 9;
export const PERFECT_GROWTH = 8;
const GRAVITY = 1400;

// Capas que se van apilando (ingredientes de la carta).
export const INGREDIENTS = ["carne", "queso", "tocino", "carne", "huevo", "queso", "jamon", "platano", "carne", "pepinillo"];

export function ingredientFor(index) {
  return INGREDIENTS[index % INGREDIENTS.length];
}

function spawnLayer(previous, index, speed) {
  const dir = index % 2 === 0 ? 1 : -1;
  const x = dir > 0 ? -previous.w * 0.4 : WORLD_WIDTH - previous.w * 0.6;
  return { x, w: previous.w, type: ingredientFor(index), dir, speed };
}

export function createGame() {
  const base = { x: (WORLD_WIDTH - BASE_WIDTH) / 2, w: BASE_WIDTH, type: "pan-base" };
  return {
    status: "ready",
    layers: [base],
    current: spawnLayer(base, 0, BASE_SPEED),
    debris: [],
    score: 0,
    streak: 0,
    lastDrop: null, // "perfect" | "cut" | "miss"
  };
}

export function start(state) {
  return state.status === "ready" ? { ...state, status: "playing" } : state;
}

// Avanza la animación `dt` segundos: capa en movimiento y trozos que caen.
export function step(state, dt) {
  const debris = state.debris
    .map((piece) => ({ ...piece, vy: piece.vy + GRAVITY * dt, y: piece.y + piece.vy * dt }))
    .filter((piece) => piece.y < 2000);

  if (state.status !== "playing") return { ...state, debris };

  const current = state.current;
  const min = -current.w * 0.4;
  const max = WORLD_WIDTH - current.w * 0.6;
  let x = current.x + current.dir * current.speed * dt;
  let dir = current.dir;
  if (x > max) {
    x = max;
    dir = -1;
  } else if (x < min) {
    x = min;
    dir = 1;
  }

  return { ...state, debris, current: { ...current, x, dir } };
}

function fallingPiece(x, w, type, layerIndex) {
  return { x, w, type, y: -layerIndex * LAYER_HEIGHT, vy: 0 };
}

// Suelta la capa actual sobre la anterior.
export function drop(state) {
  if (state.status === "ready") return drop(start(state));
  if (state.status !== "playing") return state;

  const previous = state.layers[state.layers.length - 1];
  const current = state.current;
  const index = state.layers.length;
  const left = Math.max(previous.x, current.x);
  const right = Math.min(previous.x + previous.w, current.x + current.w);
  const overlap = right - left;

  if (overlap <= 0) {
    return {
      ...state,
      status: "over",
      lastDrop: "miss",
      debris: [...state.debris, fallingPiece(current.x, current.w, current.type, index)],
    };
  }

  let placed;
  let debris = state.debris;
  let streak;

  if (Math.abs(current.x - previous.x) <= PERFECT_TOLERANCE) {
    streak = state.streak + 1;
    // Cada 3 perfectas seguidas la capa crece un poco (premio).
    const grow = streak % 3 === 0 ? Math.min(PERFECT_GROWTH, BASE_WIDTH - previous.w) : 0;
    placed = { x: previous.x - grow / 2, w: previous.w + grow, type: current.type };
  } else {
    streak = 0;
    placed = { x: left, w: overlap, type: current.type };
    const cutX = current.x < previous.x ? current.x : right;
    debris = [...debris, fallingPiece(cutX, current.w - overlap, current.type, index)];
  }

  const score = state.score + 1;
  const speed = Math.min(BASE_SPEED + score * SPEED_STEP, MAX_SPEED);

  return {
    ...state,
    layers: [...state.layers, placed],
    current: spawnLayer(placed, score, speed),
    debris,
    score,
    streak,
    lastDrop: streak > 0 ? "perfect" : "cut",
  };
}

// Récord local: { best, games, history: [últimos puntajes] }.
export function recordScore(stats, score) {
  const safe = stats && typeof stats === "object" ? stats : {};
  const best = Math.max(Number(safe.best) || 0, score);
  return {
    best,
    games: (Number(safe.games) || 0) + 1,
    history: [score, ...(Array.isArray(safe.history) ? safe.history : [])].slice(0, 5),
    isRecord: score > 0 && score > (Number(safe.best) || 0),
  };
}
