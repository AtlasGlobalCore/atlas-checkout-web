// ─── Mercado Pago SDK Loader (Silent) ────────────────────────────────────────
// Loads https://sdk.mercadopago.com/js/v2 only when needed.
// The script exposes a global `Mercadopago` constructor.

let loadPromise: Promise<void> | null = null;

/**
 * Loads the Mercado Pago SDK script into the DOM.
 * Safe to call multiple times — returns the same promise.
 */
export function loadMercadoPagoSdk(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded?
    if (typeof window !== "undefined" && (window as Record<string, unknown>).Mercadopago) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // Allow retry
      reject(new Error("Failed to load Mercado Pago SDK"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Creates a Mercado Pago SDK instance.
 * Must be called after loadMercadoPagoSdk() resolves.
 */
export function createMercadoPagoInstance(publicKey: string) {
  if (typeof window === "undefined") return null;

  const w = window as unknown as { Mercadopago?: new (key: string, opts?: Record<string, string>) => unknown };
  const MP = w.Mercadopago;
  if (!MP) return null;

  return new MP(publicKey, {
    locale: "pt-BR",
  });
}
