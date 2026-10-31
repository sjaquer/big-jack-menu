import { describe, expect, it, vi } from "vitest";
import { evaluateSiteverify, verifyTurnstile } from "./turnstile.js";

describe("evaluateSiteverify", () => {
  it("acepta una respuesta válida de la acción y el dominio correctos", () => {
    expect(evaluateSiteverify({ success: true, action: "checkout", hostname: "bigjack.vercel.app" }, { hostname: "bigjack.vercel.app" })).toEqual({ ok: true });
  });

  it("rechaza tokens inválidos, repetidos o de otra acción/dominio", () => {
    expect(evaluateSiteverify({ success: false, "error-codes": ["timeout-or-duplicate"] }).ok).toBe(false);
    expect(evaluateSiteverify({ success: true, action: "login" }).reason).toBe("action-mismatch");
    expect(evaluateSiteverify({ success: true, action: "checkout", hostname: "otro.com" }, { hostname: "bigjack.vercel.app" }).reason).toBe("hostname-mismatch");
  });
});

describe("verifyTurnstile", () => {
  it("rechaza si no llega token", async () => {
    expect(await verifyTurnstile("")).toMatchObject({ ok: false, reason: "missing-token" });
  });

  it("consulta siteverify con el token", async () => {
    const fetchImpl = vi.fn(async () => ({ json: async () => ({ success: true }) }));
    const result = await verifyTurnstile("token-123", { remoteip: "1.2.3.4", fetchImpl });
    expect(result.ok).toBe(true);
    const body = fetchImpl.mock.calls[0][1].body;
    expect(body.get("response")).toBe("token-123");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("falla cerrado si Cloudflare no responde", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("down");
    });
    expect(await verifyTurnstile("t", { fetchImpl })).toMatchObject({ ok: false, reason: "network" });
  });
});
