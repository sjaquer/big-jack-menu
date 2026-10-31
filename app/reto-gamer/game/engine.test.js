import { describe, expect, it } from "vitest";
import { BASE_WIDTH, createGame, drop, recordScore, step, WORLD_WIDTH } from "./engine.js";

function aligned(state, offset = 0) {
  const previous = state.layers[state.layers.length - 1];
  return { ...state, status: "playing", current: { ...state.current, x: previous.x + offset } };
}

describe("drop", () => {
  it("el primer toque empieza la partida y suelta la capa", () => {
    const next = drop(aligned(createGame()));
    expect(next.status).toBe("playing");
    expect(next.score).toBe(1);
  });

  it("una caída perfecta conserva el ancho y suma racha", () => {
    const next = drop(aligned(createGame(), 2));
    expect(next.lastDrop).toBe("perfect");
    expect(next.layers[1].w).toBe(BASE_WIDTH);
    expect(next.streak).toBe(1);
  });

  it("corta lo que sobresale y lo deja caer", () => {
    const next = drop(aligned(createGame(), 50));
    expect(next.lastDrop).toBe("cut");
    expect(next.layers[1].w).toBe(BASE_WIDTH - 50);
    expect(next.debris).toHaveLength(1);
    expect(next.debris[0].w).toBe(50);
  });

  it("si no se toca con la capa anterior, termina el juego", () => {
    const game = createGame();
    const missed = { ...game, status: "playing", current: { ...game.current, x: WORLD_WIDTH + 10 } };
    const next = drop(missed);
    expect(next.status).toBe("over");
    expect(next.score).toBe(0);
  });

  it("no hace nada si ya terminó", () => {
    const over = { ...createGame(), status: "over" };
    expect(drop(over)).toBe(over);
  });
});

describe("step", () => {
  it("mueve la capa y rebota en los bordes", () => {
    const game = { ...createGame(), status: "playing" };
    const far = step({ ...game, current: { ...game.current, x: WORLD_WIDTH, dir: 1 } }, 0.1);
    expect(far.current.dir).toBe(-1);
  });

  it("no mueve la capa antes de empezar", () => {
    const game = createGame();
    expect(step(game, 0.5).current.x).toBe(game.current.x);
  });
});

describe("recordScore", () => {
  it("guarda el mejor puntaje, partidas e historial", () => {
    const first = recordScore(null, 7);
    expect(first).toMatchObject({ best: 7, games: 1, history: [7], isRecord: true });
    const second = recordScore(first, 3);
    expect(second).toMatchObject({ best: 7, games: 2, history: [3, 7], isRecord: false });
  });
});
