// ─── Strategy Registry & Switch ──────────────────────────────────────────────
// Maps payment method types to their strategy components (Strategy Pattern).
// Every strategy receives gatewayResponse as a prop from the Atlas Core API.

"use client";

import type { PaymentMethodType, GatewayResponse } from "@/lib/checkout/types";

import { StripeElementsStrategy } from "./StripeElementsStrategy";
import { PixNativeStrategy } from "./PixNativeStrategy";
import { VivaModalStrategy } from "./VivaModalStrategy";
import { SepaInstantStrategy } from "./SepaInstantStrategy";
import { MbWayFlowStrategy } from "./MbWayFlowStrategy";
import { CryptoNativeStrategy } from "./CryptoNativeStrategy";

type StrategyComponent = React.ComponentType<{ gatewayResponse: GatewayResponse }>;

const strategyMap: Record<string, StrategyComponent> = {
  STRIPE_ELEMENTS: StripeElementsStrategy,
  PIX_NATIVE: PixNativeStrategy,
  VIVA_MODAL: VivaModalStrategy,
  SEPA_INSTANT: SepaInstantStrategy,
  MBWAY_FLOW: MbWayFlowStrategy,
  CRYPTO_NATIVE: CryptoNativeStrategy,
};

/**
 * StrategySwitch — renders the correct strategy component based on methodType.
 * gatewayResponse is injected from the POST /checkout/pay response.
 */
export function StrategySwitch({
  methodType,
  gatewayResponse,
}: {
  methodType?: PaymentMethodType;
  gatewayResponse: GatewayResponse;
}) {
  if (!methodType) return null;

  const Component = strategyMap[methodType];
  if (!Component) return <DefaultStrategy />;

  return <Component gatewayResponse={gatewayResponse} />;
}

/**
 * Returns the strategy component class for a given method_type.
 */
export function getStrategyComponent(methodType: PaymentMethodType): StrategyComponent {
  return strategyMap[methodType] ?? DefaultStrategy;
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
        Payment method coming soon
      </p>
      <p className="mt-1 text-xs text-slate-500">
        This method will be available shortly.
      </p>
    </div>
  );
}
