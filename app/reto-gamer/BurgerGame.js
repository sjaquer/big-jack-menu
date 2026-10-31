"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { analytics } from "../lib/analytics";
import { readJson, removeItem, writeJson } from "../lib/safeStorage";
import { createGame, drop, recordScore, start, step } from "./game/engine";
import { render } from "./game/render";

const STATS_KEY = "bj_burger_stats";
const EMPTY_STATS = { best: 0, games: 0, history: [] };
// Claves del juego anterior (guardaban nombre y WhatsApp): se borran del dispositivo.
const LEGACY_KEYS = ["bj_game_data", "bj_local_record_v1"];

export default function BurgerGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createGame());
  const cameraRef = useRef(0);
  const statsRef = useRef(EMPTY_STATS);
  const [ui, setUi] = useState({ status: "ready", score: 0, lastDrop: null, isRecord: false });
  const [stats, setStats] = useState(EMPTY_STATS);

  useEffect(() => {
    LEGACY_KEYS.forEach(removeItem);
    const saved = readJson(STATS_KEY, EMPTY_STATS);
    statsRef.current = saved;
    setStats(saved);
  }, []);

  // Bucle de animación: el motor avanza y el canvas se redibuja sin re-renderizar React.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      gameRef.current = step(gameRef.current, dt);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const { stackHeight } = render(ctx, gameRef.current, { width, height, camera: cameraRef.current });
      // La cámara sube para que la capa activa quede siempre a la vista.
      const target = Math.max(0, stackHeight - height * 0.5);
      cameraRef.current += (target - cameraRef.current) * Math.min(1, dt * 6);
      frame = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const finish = useCallback((score) => {
    const next = recordScore(statsRef.current, score);
    const saved = { best: next.best, games: next.games, history: next.history };
    statsRef.current = saved;
    writeJson(STATS_KEY, saved);
    setStats(saved);
    analytics.gameOver(score, next.isRecord);
    return next.isRecord;
  }, []);

  const handleDrop = useCallback(() => {
    const previous = gameRef.current;
    if (previous.status === "over") return;
    if (previous.status === "ready") analytics.gameStart();

    const next = drop(previous);
    gameRef.current = next;
    const isRecord = next.status === "over" ? finish(next.score) : false;
    setUi({ status: next.status, score: next.score, lastDrop: next.lastDrop, isRecord });
  }, [finish]);

  const restart = useCallback(() => {
    gameRef.current = start(createGame());
    cameraRef.current = 0;
    analytics.gameStart();
    setUi({ status: "playing", score: 0, lastDrop: null, isRecord: false });
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (![" ", "Enter", "ArrowDown"].includes(event.key) || event.target.closest?.("a, button")) return;
      event.preventDefault();
      handleDrop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDrop]);

  return (
    <main
      className="fixed inset-0 select-none overflow-hidden bg-bj-bg text-white [touch-action:manipulation]"
      onPointerDown={(event) => {
        if (!event.target.closest("a, button")) handleDrop();
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
        <Link href="/" className="-ml-2 flex h-11 items-center gap-1 rounded-full pr-3 text-sm font-semibold text-neutral-400 hover:text-white">
          <ChevronLeft size={20} aria-hidden="true" /> Carta
        </Link>
        <p className="text-sm text-neutral-500">
          Récord <span className="font-bold text-bj-yellow">{stats.best}</span>
        </p>
      </header>

      {ui.status === "playing" && (
        <div className="pointer-events-none absolute inset-x-0 top-20 text-center">
          <p className="font-anton text-8xl leading-none text-white" aria-live="polite">
            {ui.score}
          </p>
          {ui.lastDrop === "perfect" && (
            <p key={ui.score} className="fade-in mt-2 text-sm font-bold uppercase tracking-[0.3em] text-bj-yellow">
              ¡Perfecto!
            </p>
          )}
        </div>
      )}

      {ui.status === "ready" && (
        <div className="absolute inset-x-0 top-1/4 px-8 text-center">
          <h1 className="font-anton text-[clamp(3.5rem,16vw,6rem)] uppercase leading-[0.85]">
            Arma tu <span className="text-bj-yellow">burger</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-neutral-400">
            Toca para soltar cada capa. Lo que sobresale se corta. ¿Hasta dónde llegas mientras sale tu pedido?
          </p>
          <button type="button" onClick={restart} className="btn-streetwear mt-8 h-14 rounded-full px-12 text-lg">
            Jugar
          </button>
          {stats.games > 0 && <p className="mt-4 text-xs text-neutral-600">{stats.games} partidas en este dispositivo</p>}
        </div>
      )}

      {ui.status === "over" && (
        <div className="absolute inset-x-0 top-[14%] px-8 text-center" role="status">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{ui.isRecord ? "¡Nuevo récord!" : "Se cayó"}</p>
          <p className="mt-2 font-anton text-8xl leading-none text-white">{ui.score}</p>
          <p className="mt-1 text-neutral-400">{ui.score === 1 ? "capa" : "capas"} · récord {stats.best}</p>
          {stats.history.length > 1 && (
            <p className="mt-3 text-xs text-neutral-600">Últimas: {stats.history.join(" · ")}</p>
          )}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button type="button" onClick={restart} className="btn-streetwear h-14 rounded-full px-12 text-lg">
              Otra vez
            </button>
            <Link href="/" className="text-sm font-semibold text-neutral-400 underline-offset-4 hover:text-white hover:underline">
              Volver a la carta
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
