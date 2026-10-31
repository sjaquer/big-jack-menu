import { afterEach, describe, expect, it, vi } from "vitest";
import { analytics, buildEcommerceParams, productToGaItem, toGaItem, track } from "./analytics.js";

const product = {
  sku: "SKU-1",
  name: "Hamburguesa con Tocino",
  category: "LAS INTOCABLES",
  options: [
    { id: "simple", sku: "SKU-1", label: "Simple (1 carne)", price: 17.9 },
    { id: "doble", sku: "SKU-2", label: "Doble (2 carnes)", price: 26.9 },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ítems GA4", () => {
  it("convierte producto + opción con el SKU de la opción", () => {
    expect(productToGaItem(product, product.options[1], 2)).toEqual({
      item_id: "SKU-2",
      item_name: "Hamburguesa con Tocino",
      item_variant: "Doble (2 carnes)",
      item_category: "LAS INTOCABLES",
      price: 26.9,
      quantity: 2,
    });
  });

  it("calcula el valor total en soles", () => {
    const items = [
      toGaItem({ sku: "A", name: "A", price: 17.9, quantity: 2 }),
      toGaItem({ sku: "B", name: "B", price: 4, quantity: 1 }),
    ];
    expect(buildEcommerceParams(items)).toMatchObject({ currency: "PEN", value: 39.8 });
  });
});

describe("track", () => {
  it("no falla si Analytics no está cargado", () => {
    expect(() => track("view_item", {})).not.toThrow();
  });

  it("envía el evento a gtag cuando existe", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });
    analytics.addToCart(product, product.options[0], 1);
    expect(gtag).toHaveBeenCalledWith("event", "add_to_cart", expect.objectContaining({ value: 17.9 }));
  });

  it("envía el evento a dataLayer cuando existe GTM", () => {
    const dataLayer = [];
    vi.stubGlobal("window", { dataLayer });
    analytics.addToCart(product, product.options[0], 1);
    expect(dataLayer).toEqual(
      expect.arrayContaining([
        { ecommerce: null },
        expect.objectContaining({ event: "add_to_cart", ecommerce: expect.objectContaining({ value: 17.9 }) }),
      ])
    );
  });

  it("con GTM no duplica el evento por gtag", () => {
    const dataLayer = [];
    const gtag = vi.fn((...args) => dataLayer.push(args));
    vi.stubGlobal("window", { dataLayer, gtag, __bjUsesGtm: true });
    analytics.addToCart(product, product.options[0], 1);
    expect(gtag).not.toHaveBeenCalled();
    expect(dataLayer.filter((entry) => entry.event === "add_to_cart")).toHaveLength(1);
  });
});
