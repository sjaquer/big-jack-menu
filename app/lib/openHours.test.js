import { describe, expect, it } from "vitest";
import {
  formatMsToCountdown,
  getNextOpenDate,
  getOpenStatusLabel,
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

describe("getOpenStatusLabel", () => {
  it("abierto antes de medianoche muestra la hora de cierre", () => {
    // 21:00 en Lima = 02:00 UTC del día siguiente
    expect(getOpenStatusLabel(at("2026-10-29T02:00:00Z"), everyday)).toEqual({
      isOpen: true,
      label: "Abierto · hasta 1:00 a. m.",
    });
  });

  it("abierto pasada la medianoche usa el cierre del turno de ayer", () => {
    // 00:30 en Lima
    expect(getOpenStatusLabel(at("2026-10-29T05:30:00Z"), everyday).label).toBe(
      "Abierto · hasta 1:00 a. m."
    );
  });

  it("cerrado en la tarde abre hoy", () => {
    // 15:00 en Lima
    const status = getOpenStatusLabel(at("2026-10-28T20:00:00Z"), everyday);
    expect(status.isOpen).toBe(false);
    expect(status.label).toBe("Cerrado · abre hoy 7:00 p. m.");
  });

  it("cerrado el día libre abre mañana", () => {
    const hours = { ...everyday, 3: undefined };
    // Miércoles 28/10/2026 15:00 Lima, miércoles cerrado
    expect(getOpenStatusLabel(at("2026-10-28T20:00:00Z"), hours).label).toBe(
      "Cerrado · abre mañana 7:00 p. m."
    );
  });
});

describe("horario lunes a sábado hasta la medianoche", () => {
  const monToSat = {
    0: null,
    1: { open: "19:00", close: "00:00" },
    2: { open: "19:00", close: "00:00" },
    3: { open: "19:00", close: "00:00" },
    4: { open: "19:00", close: "00:00" },
    5: { open: "19:00", close: "00:00" },
    6: { open: "19:00", close: "00:00" },
  };

  it("está abierto a las 23:59 y cerrado a las 00:00 (hora de Lima)", () => {
    // Miércoles 28/10/2026
    expect(isOpenNow(at("2026-10-29T04:59:00Z"), monToSat)).toBe(true);
    expect(isOpenNow(at("2026-10-29T05:00:00Z"), monToSat)).toBe(false);
  });

  it("muestra el cierre a medianoche", () => {
    expect(getOpenStatusLabel(at("2026-10-29T02:00:00Z"), monToSat).label).toBe(
      "Abierto · hasta 12:00 a. m."
    );
  });

  it("el domingo está cerrado y abre el lunes", () => {
    // Domingo 01/11/2026, 20:00 en Lima
    const sunday = at("2026-11-02T01:00:00Z");
    expect(isOpenNow(sunday, monToSat)).toBe(false);
    expect(getOpenStatusLabel(sunday, monToSat).label).toBe("Cerrado · abre mañana 7:00 p. m.");
  });
});
