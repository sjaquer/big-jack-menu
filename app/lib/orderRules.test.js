import { describe, expect, it } from "vitest";
import { buildSkuIndex } from "./catalog.js";
import { validateOrder } from "./orderRules.js";

const menu = [
  { id: 1, category: "LAS INTOCABLES", name: "Hamburguesa", options: [{ id: "simple", sku: "BURGER", label: "Simple", price: 17.9 }] },
  { id: 2, category: "BEBIDAS", name: "Gaseosa", options: [{ id: "botella", sku: "SODA", label: "Botella", price: 4 }] },
  { id: 3, category: "GUARNICIONES", name: "Papas", available: false, options: [{ id: "p", sku: "OFF", label: "P", price: 7 }] },
];
const catalog = buildSkuIndex(menu);
const everyday = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [d, { open: "19:00", close: "00:00" }]));
const OPEN = new Date("2026-10-29T02:00:00Z"); // 21:00 en Lima
const CLOSED = new Date("2026-10-28T20:00:00Z"); // 15:00 en Lima

const base = (overrides = {}) => ({
  eventId: "menu-20261028-abc123",
  customerName: "Ana",
  customerPhone: "999888777",
  paymentMethod: "yape",
  items: [{ sku: "BURGER", quantity: 2, notes: "Simple" }],
  metadata: { orderType: "pickup", pickupTime: "now" },
  ...overrides,
});
const run = (body, now = OPEN) => validateOrder(body, { catalog, now, hours: everyday });

describe("validateOrder", () => {
  it("acepta un pedido válido y arma la salida con lista blanca", () => {
    const result = run(base({ hacker: "x", items: [{ sku: "BURGER", quantity: 2, price: 17.9, extra: 1 }] }));
    expect(result.ok).toBe(true);
    expect(result.order).not.toHaveProperty("hacker");
    expect(result.order.items).toEqual([{ sku: "BURGER", quantity: 2 }]);
    expect(result.order.metadata.isPreOrder).toBe(false);
    expect(result.order.orderDate).toBe(OPEN.toISOString());
  });

  it("rechaza SKUs desconocidos o no disponibles", () => {
    expect(run(base({ items: [{ sku: "NOPE", quantity: 1 }] })).ok).toBe(false);
    expect(run(base({ items: [{ sku: "OFF", quantity: 1 }] })).ok).toBe(false);
  });

  it("rechaza precios manipulados y cantidades fuera de rango", () => {
    expect(run(base({ items: [{ sku: "BURGER", quantity: 1, price: 1 }] })).ok).toBe(false);
    expect(run(base({ items: [{ sku: "BURGER", quantity: 11 }] })).ok).toBe(false);
    expect(run(base({ items: [{ sku: "BURGER", quantity: 1.5 }] })).ok).toBe(false);
  });

  it("bebidas solo con hamburguesa", () => {
    const result = run(base({ items: [{ sku: "SODA", quantity: 1 }] }));
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("delivery no acepta efectivo y exige dirección o ubicación", () => {
    const delivery = { orderType: "delivery", deliveryAddress: "Jr. Test 123" };
    expect(run(base({ paymentMethod: "efectivo", metadata: delivery })).ok).toBe(false);
    expect(run(base({ metadata: { orderType: "delivery" } })).ok).toBe(false);
    expect(run(base({ metadata: delivery })).ok).toBe(true);
  });

  it("fuera de horario solo pre-orden para recojo, decidido por el servidor", () => {
    expect(run(base({ metadata: { orderType: "delivery", deliveryAddress: "X" } }), CLOSED).ok).toBe(false);
    const pickup = run(base({ metadata: { orderType: "pickup", isPreOrder: false } }), CLOSED);
    expect(pickup.ok).toBe(true);
    expect(pickup.order.metadata.isPreOrder).toBe(true);
  });

  it("descarta links de ubicación que no son de Google Maps", () => {
    const result = run(base({
      metadata: { orderType: "delivery", deliveryAddress: "X", locationLink: "https://evil.example/phish" },
    }));
    expect(result.ok).toBe(true);
    expect(result.order.metadata.locationLink).toBeNull();
  });

  it("recorta textos largos y quita caracteres de control", () => {
    const result = run(base({ customerName: `${"A".repeat(200)}\u0000`, notes: "ok\u0007" }));
    expect(result.order.customerName).toHaveLength(60);
    expect(result.order.notes).toBe("ok");
  });

  it("valida eventId y teléfono", () => {
    expect(run(base({ eventId: "x" })).ok).toBe(false);
    expect(run(base({ customerPhone: "<script>" })).ok).toBe(false);
  });
});
