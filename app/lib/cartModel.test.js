import { describe, expect, it } from "vitest";
import {
  addItem,
  buildCartItem,
  getCartItemId,
  getCartItemsCount,
  migrateLegacyCartItems,
} from "./cartModel.js";

const item = (id, quantity = 0) => ({ id, category: "LAS INTOCABLES", quantity });

describe("getCartItemId", () => {
  it("usa default cuando la opción no tiene id", () => {
    expect(getCartItemId(7)).toBe("7-default");
    expect(getCartItemId(7, "doble")).toBe("7-doble");
  });
});

describe("getCartItemsCount", () => {
  it("suma cantidades y tolera datos inválidos", () => {
    expect(getCartItemsCount([item("a", 2), item("b", 3)])).toBe(5);
    expect(getCartItemsCount([{ quantity: "4" }, { quantity: -2 }])).toBe(4);
    expect(getCartItemsCount(null)).toBe(0);
  });
});

describe("addItem", () => {
  it("agrega un ítem nuevo con la cantidad pedida", () => {
    const result = addItem([], item("a"), 3);
    expect(result.added).toBe(3);
    expect(result.reason).toBeNull();
    expect(result.items).toEqual([{ ...item("a"), quantity: 3 }]);
  });

  it("acumula sobre un ítem existente", () => {
    const result = addItem([item("a", 4)], item("a"), 2);
    expect(result.added).toBe(2);
    expect(result.items[0].quantity).toBe(6);
  });

  it("recorta al máximo por producto", () => {
    const result = addItem([item("a", 9)], item("a"), 5, { maxPerItem: 10 });
    expect(result.added).toBe(1);
    expect(result.items[0].quantity).toBe(10);
    expect(result.reason).toBeNull();
  });

  it("rechaza cuando el producto ya está en el tope", () => {
    const result = addItem([item("a", 10)], item("a"), 1);
    expect(result.added).toBe(0);
    expect(result.reason).toBe("max_per_item");
  });

  it("recorta al máximo total del pedido", () => {
    const cart = [item("a", 10), item("b", 10), item("c", 9)];
    const result = addItem(cart, item("d"), 5);
    expect(result.added).toBe(1);
    expect(getCartItemsCount(result.items)).toBe(30);
  });

  it("rechaza cuando el pedido ya llegó al máximo total", () => {
    const cart = [item("a", 10), item("b", 10), item("c", 10)];
    const result = addItem(cart, item("d"), 1);
    expect(result.added).toBe(0);
    expect(result.reason).toBe("max_items");
  });
});

describe("buildCartItem", () => {
  it("arma el ítem con los datos de la opción", () => {
    const built = buildCartItem(
      {
        id: 1,
        category: "LAS INTOCABLES",
        name: "La Bacon",
        image: "/images/baconjack.webp",
      },
      { id: "simple", label: "Clásica", sku: "PRD-LAB-JFSY", price: 17.9 },
      2
    );

    expect(built).toEqual({
      id: "1-simple",
      productId: 1,
      category: "LAS INTOCABLES",
      name: "La Bacon",
      optionId: "simple",
      optionLabel: "Clásica",
      sku: "PRD-LAB-JFSY",
      price: 17.9,
      image: "/images/baconjack.webp",
      quantity: 2,
    });
  });
});

describe("migrateLegacyCartItems", () => {
  const menu = [
    {
      id: 1,
      category: "LAS INTOCABLES",
      name: "La Bacon",
      image: "/images/baconjack.webp",
      options: [{ id: "simple", label: "Clásica", sku: "PRD-LAB-JFSY", price: 17.9 }],
    },
  ];

  it("completa datos faltantes desde el menú", () => {
    const migrated = migrateLegacyCartItems(
      [{ productId: 1, optionId: "simple", quantity: 2 }],
      menu
    );

    expect(migrated).toHaveLength(1);
    expect(migrated[0]).toMatchObject({
      id: "1-simple",
      sku: "PRD-LAB-JFSY",
      category: "LAS INTOCABLES",
      name: "La Bacon",
      quantity: 2,
    });
  });

  it("descarta entradas inválidas o sin SKU recuperable", () => {
    const migrated = migrateLegacyCartItems([null, { productId: 99 }], menu);
    expect(migrated).toEqual([]);
  });

  it("recupera el SKU desde el menú si el ítem legacy no lo trae", () => {
    const migrated = migrateLegacyCartItems(
      [{ productId: 1, optionId: "simple", sku: null }],
      menu
    );

    expect(migrated[0].sku).toBe("PRD-LAB-JFSY");
  });

  it("normaliza cantidades mínimas", () => {
    const migrated = migrateLegacyCartItems(
      [{ productId: 1, optionId: "simple", sku: "PRD-LAB-JFSY", quantity: 0 }],
      menu
    );

    expect(migrated[0].quantity).toBe(1);
  });

  it("actualiza nombre, presentación y precio desde el catálogo", () => {
    const migrated = migrateLegacyCartItems(
      [{ productId: 1, optionId: "simple", name: "Nombre viejo", optionLabel: "Vieja", price: 1, quantity: 1 }],
      menu
    );

    expect(migrated[0]).toMatchObject({ name: "La Bacon", optionLabel: "Clásica", price: 17.9 });
  });

  it("descarta productos que ya no están en la carta aunque tengan SKU", () => {
    const migrated = migrateLegacyCartItems(
      [{ productId: 21, optionId: "personal", sku: "PRD-SAL-PERS", name: "Salchipapa", quantity: 1 }],
      menu
    );

    expect(migrated).toEqual([]);
  });
});
