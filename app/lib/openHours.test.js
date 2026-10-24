import { describe, expect, it } from "vitest";
import {
  formatMsToCountdown,
  getNextOpenDate,
  isOpenNow,
} from "./openHours.js";

const everyday = {
  0: { open: "19:00", close: "01:00" },
  1: { open: "19:00", close: "01:00" },
  2: { open: "19:00", close: "01:00" },
  3: { open: "19:00", close: "01:00" },
  4: { open: "19:00", close: "01:00" },
  5: { open: "19:00", close: "01:00" },
  6: { open: "19:00", close: "01:00" },
};

const at = (iso) => new Date(iso);

describe("isOpenNow", () => {
  it("abre exactamente a las 19:00 de Lima", () => {
    expect(isOpenNow(at("2026-10-24T18:59:00-05:00"), everyday)).toBe(false);
    expect(isOpenNow(at("2026-10-24T19:00:00-05:00"), everyday)).toBe(true);
  });

  it("sigue abierto después de medianoche", () => {
    expect(isOpenNow(at("2026-10-24T23:59:00-05:00"), everyday)).toBe(true);
    expect(isOpenNow(at("2026-10-25T00:30:00-05:00"), everyday)).toBe(true);
  });

  it("cierra exactamente a la 01:00 de Lima", () => {
    expect(isOpenNow(at("2026-10-25T01:00:00-05:00"), everyday)).toBe(false);
    expect(isOpenNow(at("2026-10-25T12:00:00-05:00"), everyday)).toBe(false);
  });

  it("no depende de la zona horaria del dispositivo", () => {
    expect(isOpenNow(at("2026-10-25T00:30:00-05:00"), everyday)).toBe(true);
    expect(isOpenNow(at("2026-10-25T05:30:00Z"), everyday)).toBe(true);
    expect(isOpenNow(at("2026-10-25T17:00:00+09:00"), everyday)).toBe(false);
  });

  it("maneja días sin horario", () => {
    expect(isOpenNow(at("2026-10-25T20:00:00-05:00"), {})).toBe(false);
  });
});

describe("getNextOpenDate", () => {
  it("devuelve null si ya está abierto", () => {
    expect(getNextOpenDate(at("2026-10-24T20:00:00-05:00"), everyday)).toBeNull();
  });

  it("calcula la apertura del mismo día", () => {
    const next = getNextOpenDate(at("2026-10-24T12:00:00-05:00"), everyday);
    expect(next.toISOString()).toBe("2026-10-25T00:00:00.000Z");
  });

  it("salta al día siguiente tras el cierre", () => {
    const next = getNextOpenDate(at("2026-10-25T01:00:00-05:00"), everyday);
    expect(next.toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
});

describe("formatMsToCountdown", () => {
  it("formatea segundos, minutos y horas", () => {
    expect(formatMsToCountdown(0)).toBe("0m");
    expect(formatMsToCountdown(65_000)).toBe("1m 5s");
    expect(formatMsToCountdown(2 * 3_600_000 + 3 * 60_000)).toBe("2h 3m");
  });
});
