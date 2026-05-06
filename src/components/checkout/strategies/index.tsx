// ─── Strategy Registry ──────────────────────────────────────────────────────
// Maps payment method types to their strategy components (Strategy Pattern).

"use client";

import type { PaymentMethod } from "@/lib/checkout/types";
import { CreditCardStrategy } from "./CreditCardStrategy";
import { PixStrategy } from "./PixStrategy";
import { CryptoStrategy } from "./CryptoStrategy";

type StrategyComponent = React.ComponentType<Record<string, never>>;

const strategyMap: Record<string, StrategyComponent> = {
  credit_card: CreditCardStrategy,
  debit_card: CreditCardStrategy, // reuse credit card UI
  pix: PixStrategy,
  crypto: CryptoStrategy,
};

/**
 * Returns the correct strategy component for a given payment method.
 * Falls back to a placeholder if the method is not implemented.
 */
export function getStrategyComponent(method: PaymentMethod): StrategyComponent {
  return strategyMap[method.type] ?? DefaultStrategy;
}

/** Placeholder for unimplemented methods */
function DefaultStrategy() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="rounded-full bg-slate-100 p-4">
        <svg
          className="h-8 w-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">
        Método de pagamento em breve
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Este método será implementado em breve.
      </p>
    </div>
  );
}
