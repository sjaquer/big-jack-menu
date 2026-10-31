import { describe, expect, it } from "vitest";
import { applyComplementRules, enforceComplementRules } from "./cartRules.js";

const PRIMARY = ["LAS INTOCABLES"];
const COMPLEMENTS = ["BEBIDAS"];

const burger = { id: "1-simple", category: "LAS INTOCABLES", name: "La Bacon" };
const soda = { id: "30-botella", category: "BEBIDAS", name: "Inka Cola" };
const fries = { id: "20-personal", category: "GUARNICIONES", name: "Papas" };

describe("applyComplementRules", () => {
  it("mantiene todo si hay al menos una hamburguesa", () => {
    const result = applyComplementRules([burger, soda, fries], PRIMARY, COMPLEMENTS);
    expect(result.items).toHaveLength(3);
    expect(result.removed).toEqual([]);
  });

  it("retira las bebidas si no queda hamburguesa", () => {
    const result = applyComplementRules([soda, fries], PRIMARY, COMPLEMENTS);
    expect(result.items).toEqual([fries]);
    expect(result.removed).toEqual([soda]);
  });

  it("no toca guarniciones ni productos ajenos a los complementos", () => {
    const result = applyComplementRules([fries, soda], PRIMARY, COMPLEMENTS);
    expect(result.items).toEqual([fries]);
    expect(result.removed).toEqual([soda]);
  });

  it("no falla con entradas vacías", () => {
    expect(applyComplementRules([], PRIMARY, COMPLEMENTS)).toEqual({
      items: [],
      removed: [],
    });
  });
});

describe("enforceComplementRules", () => {
  it("devuelve solo el array de ítems", () => {
    expect(enforceComplementRules([soda], PRIMARY, COMPLEMENTS)).toEqual([]);
  });
});
