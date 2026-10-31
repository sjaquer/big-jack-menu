import { describe, expect, it } from "vitest";
import { absoluteUrl, formatAddress, formatPhone, instagramUrl, whatsappUrl } from "./site.js";

describe("site helpers", () => {
  it("arma URLs absolutas sin dobles barras", () => {
    expect(absoluteUrl("/")).toMatch(/^https?:\/\/[^/]+$/);
    expect(absoluteUrl("quienes")).toMatch(/\/quienes$/);
    expect(absoluteUrl("https://otro.pe/x")).toBe("https://otro.pe/x");
  });

  it("arma links de WhatsApp con texto codificado", () => {
    expect(whatsappUrl(undefined, "+51 999 888 777")).toBe("https://wa.me/51999888777");
    expect(whatsappUrl("Hola, vecino", "51999888777")).toBe(
      "https://wa.me/51999888777?text=Hola%2C%20vecino"
    );
  });

  it("formatea teléfono peruano", () => {
    expect(formatPhone("51997722704")).toBe("+51 997 722 704");
    expect(formatPhone("123")).toBe("+123");
  });

  it("formatea Instagram y dirección", () => {
    expect(instagramUrl("@bigjackpe")).toBe("https://www.instagram.com/bigjackpe");
    const address = { street: "Pje. Test 1", area: "Centro", locality: "Lima", postalCode: "15001" };
    expect(formatAddress(address)).toBe("Pje. Test 1, Centro");
    expect(formatAddress(address, { full: true })).toBe("Pje. Test 1, Centro, Lima 15001");
  });
});
