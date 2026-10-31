// Cloudflare Turnstile en el navegador: un único widget invisible ("solo si hace falta
// interacción") que va dejando listo un token. Al confirmar el pedido se usa y se renueva.
import { TURNSTILE_ACTION, TURNSTILE_SITE_KEY } from "./turnstileConfig";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise = null;
let widgetId = null;
let token = null;
let waiters = [];
let mountSeq = 0; // invalida montajes que terminan de cargar después de desmontarse

export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("turnstile"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function deliver(value) {
  if (value && waiters.length) {
    waiters.splice(0).forEach((resolve) => resolve(value));
    return;
  }
  token = value;
}

export async function mountTurnstile(container) {
  if (!turnstileEnabled || !container || widgetId !== null) return;
  const seq = ++mountSeq;
  try {
    const turnstile = await loadScript();
    if (seq !== mountSeq || widgetId !== null || !container.isConnected) return;
    widgetId = turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      action: TURNSTILE_ACTION,
      appearance: "interaction-only",
      theme: "dark",
      language: "es",
      "refresh-expired": "auto",
      callback: (value) => deliver(value),
      "expired-callback": () => {
        token = null;
      },
      "error-callback": () => {
        token = null;
      },
    });
  } catch {
    widgetId = null; // sin script (bloqueador, red): el servidor rechazará y el cliente verá el aviso
  }
}

export function unmountTurnstile() {
  mountSeq += 1;
  if (widgetId !== null && window.turnstile) window.turnstile.remove(widgetId);
  widgetId = null;
  token = null;
}

// Entrega el token (o espera a que llegue). null si no llega a tiempo.
export function getTurnstileToken(timeoutMs = 15000) {
  if (!turnstileEnabled) return Promise.resolve(null);
  if (token) {
    const value = token;
    token = null;
    return Promise.resolve(value);
  }
  return new Promise((resolve) => {
    const finish = (value) => {
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => {
      waiters = waiters.filter((fn) => fn !== finish);
      resolve(null);
    }, timeoutMs);
    waiters.push(finish);
  });
}

// Los tokens son de un solo uso: tras cada intento se pide uno nuevo.
export function resetTurnstile() {
  token = null;
  if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
}
