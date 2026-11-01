import { describe, expect, it } from "vitest";
import {
  buildDeliveryPaymentReminder,
  buildFriendlyOrderError,
  buildWhatsappOrderMessage,
  normalizePhoneForDisplay,
} from "./orderMessages.js";

describe("normalizePhoneForDisplay", () => {
  it("deja solo dígitos con prefijo +", () => {
    expect(normalizePhoneForDisplay("+51 987-654-321")).toBe("+51987654321");
    expect(normalizePhoneForDisplay("")).toBe("");
    expect(normalizePhoneForDisplay(null)).toBe("");
  });
});

describe("buildDeliveryPaymentReminder", () => {
  it("no genera recordatorio para efectivo", () => {
    expect(buildDeliveryPaymentReminder("efectivo", "+51999")).toBeNull();
  });

  it("genera recordatorio para Yape y Plin", () => {
    expect(buildDeliveryPaymentReminder("yape", "+51999")).toMatchObject({
      title: "Pago por Yape",
    });
    expect(buildDeliveryPaymentReminder("plin", "+51999")).toMatchObject({
      title: "Pago por Plin",
    });
  });

  it("para tarjeta pide el link de pago", () => {
    expect(buildDeliveryPaymentReminder("tarjeta", "+51999")).toEqual({
      title: "Pago por tarjeta",
      body: "Recuerda solicitar por WhatsApp el link de pago para completar tu delivery.",
    });
  });
});

describe("buildFriendlyOrderError", () => {
  it("usa un mensaje por defecto para errores vacíos", () => {
    expect(buildFriendlyOrderError(null)).toContain("Algo falló de nuestro lado");
  });

  it("oculta detalles del webhook", () => {
    const message = buildFriendlyOrderError("Webhook respondió 500");
    expect(message).toContain("Inténtalo otra vez");
    expect(message).not.toMatch(/webhook/i);
  });

  it("conserva mensajes de negocio", () => {
    expect(buildFriendlyOrderError("El producto no está disponible")).toBe(
      "El producto no está disponible"
    );
  });
});

describe("buildWhatsappOrderMessage", () => {
  const base = {
    migratedCart: [
      { quantity: 2, name: "La Bacon", optionLabel: "Clásica" },
      { quantity: 1, name: "Inka Cola", optionLabel: "Botella 600 ml" },
    ],
    orderType: "pickup",
    customerName: "Ana",
    customerPhone: "999111222",
    paymentMethod: "efectivo",
    total: 39.8,
    deliveryAddress: "",
    deliveryReference: "",
    deliveryDetails: "",
    locationLink: "",
    notes: "",
    paymentReminder: null,
  };

  it("incluye el detalle, el cliente y el total", () => {
    const message = buildWhatsappOrderMessage(base);

    expect(message).toContain("2x* La Bacon");
    expect(message).toContain("1x* Inka Cola");
    expect(message).toContain("*Nombre:* Ana");
    expect(message).toContain("*Total:* *S/ 39.80*");
    expect(message).not.toContain("DATOS DE ENTREGA");
  });

  it("agrega entrega, notas y recordatorio de pago en delivery", () => {
    const message = buildWhatsappOrderMessage({
      ...base,
      orderType: "delivery",
      deliveryAddress: "Av. Siempre Viva 123",
      deliveryReference: "Portón negro",
      deliveryDetails: "Timbre 2",
      locationLink: "https://maps.example/abc",
      notes: "Sin cebolla",
      paymentReminder: { title: "Pago por Yape", body: "Paga al número oficial." },
    });

    expect(message).toContain("*Dirección:* Av. Siempre Viva 123");
    expect(message).toContain("*Referencia:* Portón negro | Timbre 2");
    expect(message).toContain("*Ubicación GPS:* https://maps.example/abc");
    expect(message).toContain("*NOTAS DEL PEDIDO*");
    expect(message).toContain("*PAGO POR YAPE*");
    expect(message).toContain("sin costo de envío");
  });
});
