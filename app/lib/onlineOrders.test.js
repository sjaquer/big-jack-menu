import { describe, expect, it } from "vitest";
import { buildOnlineOrderPayload } from "./onlineOrders.js";

const baseInput = {
  cart: [
    { sku: "PRD-LAB-JFSY", quantity: 2, optionLabel: "Clásica", name: "La Bacon", price: 17.9 },
    { sku: "PRD-INK-PXC0", quantity: 1, optionLabel: "Botella 600 ml", name: "Inka Cola" },
  ],
  customerName: "  Ana  ",
  customerPhone: " 999111222 ",
  paymentMethod: "cash",
  notes: "  Sin cebolla  ",
  orderType: "pickup",
  pickupTime: "now",
  isPreOrder: false,
};

describe("buildOnlineOrderPayload", () => {
  it("envía solo sku, quantity y notes por ítem", () => {
    const payload = buildOnlineOrderPayload(baseInput);

    expect(payload.items).toEqual([
      { sku: "PRD-LAB-JFSY", quantity: 2, notes: "Clásica" },
      { sku: "PRD-INK-PXC0", quantity: 1, notes: "Botella 600 ml" },
    ]);
  });

  it("normaliza nombre, teléfono y método de pago", () => {
    const payload = buildOnlineOrderPayload(baseInput);

    expect(payload.customerName).toBe("Ana");
    expect(payload.customerPhone).toBe("999111222");
    expect(payload.customer).toEqual({ name: "Ana", phone: "999111222" });
    expect(payload.paymentMethod).toBe("efectivo");
  });

  it("usa valores por defecto sin nombre ni teléfono", () => {
    const payload = buildOnlineOrderPayload({
      ...baseInput,
      customerName: "  ",
      customerPhone: undefined,
    });

    expect(payload.customerName).toBe("Cliente online");
    expect(payload.customerPhone).toBeNull();
  });

  it("compone notas de recojo inmediato y ubicación", () => {
    const payload = buildOnlineOrderPayload({
      ...baseInput,
      locationLink: "https://maps.example/abc",
    });

    expect(payload.notes).toBe(
      "Sin cebolla | Recojo: inmediato (15-20 min) | Ubicacion: https://maps.example/abc"
    );
  });

  it("compone referencia de delivery y anula la dirección en recojo", () => {
    const payload = buildOnlineOrderPayload({
      ...baseInput,
      orderType: "delivery",
      pickupTime: undefined,
      deliveryAddress: "  Av. Siempre Viva 123  ",
      deliveryReference: "Portón negro",
    });

    expect(payload.notes).toBe("Sin cebolla | Referencia: Portón negro");
    expect(payload.metadata.deliveryAddress).toBe("Av. Siempre Viva 123");
  });

  it("compone recojo programado", () => {
    const payload = buildOnlineOrderPayload({
      ...baseInput,
      pickupTime: "schedule",
      scheduledTime: "20:30",
    });

    expect(payload.notes).toBe("Sin cebolla | Recojo programado: 20:30");
  });

  it("marca la pre-orden y genera un eventId único con formato", () => {
    const first = buildOnlineOrderPayload({ ...baseInput, isPreOrder: true });
    const second = buildOnlineOrderPayload({ ...baseInput, isPreOrder: true });

    expect(first.metadata.isPreOrder).toBe(true);
    expect(first.eventId).toMatch(/^menu-\d{8}-[a-z0-9]{6}$/);
    expect(first.eventId).not.toBe(second.eventId);
  });
});
