import { describe, expect, it } from "vitest";
import { formatPrice, getMenuPriceRange, getPriceRange } from "./format.js";

describe("formatPrice", () => {
  it("usa el formato S/ con dos decimales", () => {
    expect(formatPrice(12.9)).toBe("S/ 12.90");
    expect(formatPrice("4")).toBe("S/ 4.00");
    expect(formatPrice(undefined)).toBe("S/ 0.00");
  });
});

describe("getPriceRange", () => {
  it("devuelve mínimo y máximo de las opciones", () => {
    const item = { options: [{ price: 26.9 }, { price: 17.9 }] };
    expect(getPriceRange(item)).toEqual({ min: 17.9, max: 26.9 });
  });

  it("devuelve 0 si no hay opciones", () => {
    expect(getPriceRange({})).toEqual({ min: 0, max: 0 });
  });
});

describe("getMenuPriceRange", () => {
  it("calcula el rango de toda la carta", () => {
    const items = [{ options: [{ price: 2 }] }, { options: [{ price: 12 }, { price: 26.9 }] }, {}];
    expect(getMenuPriceRange(items)).toEqual({ min: 2, max: 26.9 });
  });
});
