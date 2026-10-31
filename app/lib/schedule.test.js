import { describe, expect, it } from "vitest";
import { formatPrepTime, formatRange, formatTime, groupSchedule } from "./schedule.js";

const everyday = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((day) => [day, { open: "19:00", close: "01:00" }])
);

describe("formatTime", () => {
  it("usa formato de 12 horas con a. m./p. m.", () => {
    expect(formatTime("19:00")).toBe("7:00 p. m.");
    expect(formatTime("01:00")).toBe("1:00 a. m.");
    expect(formatTime("00:30")).toBe("12:30 a. m.");
    expect(formatTime("12:15")).toBe("12:15 p. m.");
  });

  it("devuelve vacío con valores inválidos", () => {
    expect(formatTime("")).toBe("");
    expect(formatTime(undefined)).toBe("");
  });
});

describe("groupSchedule", () => {
  it("resume la semana completa en una sola línea", () => {
    expect(groupSchedule(everyday)).toEqual([
      { days: "Todos los días", hours: "7:00 p. m. – 1:00 a. m." },
    ]);
  });

  it("agrupa días consecutivos y marca los cerrados", () => {
    const hours = {
      ...everyday,
      5: { open: "17:00", close: "01:00" },
      6: { open: "17:00", close: "01:00" },
      0: undefined,
    };
    expect(groupSchedule(hours)).toEqual([
      { days: "Lun – Jue", hours: "7:00 p. m. – 1:00 a. m." },
      { days: "Vie – Sáb", hours: "5:00 p. m. – 1:00 a. m." },
      { days: "Domingo", hours: "Cerrado" },
    ]);
  });
});

describe("formatRange / formatPrepTime", () => {
  it("formatea rangos y tiempos", () => {
    expect(formatRange(null)).toBe("Cerrado");
    expect(formatPrepTime({ min: 15, max: 20 })).toBe("15–20 min");
    expect(formatPrepTime({ min: 15, max: 15 })).toBe("15 min");
  });
});

describe("groupSchedule con domingo cerrado", () => {
  it("agrupa lunes a sábado y marca el domingo", () => {
    const hours = { 0: null, ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((d) => [d, { open: "19:00", close: "00:00" }])) };
    expect(groupSchedule(hours)).toEqual([
      { days: "Lun – Sáb", hours: "7:00 p. m. – 12:00 a. m." },
      { days: "Domingo", hours: "Cerrado" },
    ]);
  });
});
