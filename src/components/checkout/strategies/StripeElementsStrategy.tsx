// ─── Stripe PaymentElement Strategy (Real Integration) ───────────────────────
// Uses @stripe/react-stripe-js with dynamic publishable_key from gatewayResponse.
// No NEXT_PUBLIC_ environment variables are used — everything comes from the API.

"use client";

import { useState, useMemo, useCallback } from "react";
import { Lock, Loader2 } from "lucide-react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import type { GatewayResponse } from "@/lib/checkout/types";

// ─── Inner form that uses Stripe hooks ──────────────────────────────────────
function StripePaymentForm({ gatewayResponse }: { gatewayResponse: GatewayResponse }) {
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { session, setStep, setPaymentStatus } = useCheckoutStore();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsProcessing(true);
      setErrorMessage(null);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message ?? t.unknownError);
        setIsProcessing(false);
        return;
      }

      // Confirm payment using the client_secret from Atlas Core
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: session?.successUrl
            ? `${session.successUrl}?txn_id=${useCheckoutStore.getState().transactionId}`
            : window.location.href,
        },
        // If the backend uses manual confirmation:
        // clientSecret: gatewayResponse.client_secret,
      });

      if (confirmError) {
        setErrorMessage(confirmError.message ?? t.unknownError);
      } else {
        // Payment succeeded — Stripe handles redirect, but we also update state
        setPaymentStatus("paid");
        setStep("SUCCESS");
      }

      setIsProcessing(false);
    },
    [stripe, elements, gatewayResponse.client_secret, session, t, setStep, setPaymentStatus]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 pt-1">
      {/* Stripe PaymentElement — renders card input, Apple Pay, Google Pay */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <span className="text-xs text-red-700 leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all min-h-[48px] ${
          !stripe || isProcessing
            ? "cursor-not-allowed bg-slate-200 text-slate-400"
            : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t.processing || "A processar..."}</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>{t.payNow || "Pagar agora"}</span>
          </>
        )}
      </button>

      {/* Powered by Stripe Badge */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 rounded-md bg-slate-50 border border-slate-100 px-3 py-1.5">
          <svg viewBox="0 0 60 25" className="h-4 sm:h-5" fill="none">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 01-4.56 1.02c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.3 0 .61-.04 1.18-.06 1.76zm-4.14-5.62c-1.08 0-2.35.8-2.35 2.82h4.53c0-2.02-1.07-2.82-2.18-2.82zM41.04 20.22c-2.14 0-3.45-.89-4.46-1.55l-.02 1.39H32.7V.68l4.82-1.04v6.71c.85-.56 2.19-1.27 3.94-1.27 3.87 0 6.03 3.68 6.03 7.55 0 4.65-2.61 7.59-6.45 7.59zm-.72-10.94c-1.13 0-1.98.38-2.48.88v4.6c.5.5 1.32.87 2.48.87 1.9 0 3.02-1.95 3.02-3.3 0-1.4-1.14-3.05-3.02-3.05zM28.11 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 01-4.56 1.02c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.3 0 .61-.04 1.18-.06 1.76zm-4.14-5.62c-1.08 0-2.35.8-2.35 2.82h4.53c0-2.02-1.07-2.82-2.18-2.82zM10.05 4.53h4.85v15.53h-4.85V4.53zM.35 4.53h4.85v15.53H.35V4.53z" fill="#635BFF" />
          </svg>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400">
            {t.poweredBy} Stripe
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] sm:text-xs text-emerald-700 leading-relaxed">
          {t.securityNotice}
        </p>
      </div>
    </form>
  );
}

// ─── Fallback when Stripe cannot be initialized ─────────────────────────────
function StripeFallback({ error }: { error: string }) {
  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
        <span className="text-xs text-red-700 leading-relaxed">{error}</span>
      </div>
      <p className="text-center text-xs text-slate-400">
        The payment method could not be initialized. Please try again or contact support.
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function StripeElementsStrategy({ gatewayResponse }: { gatewayResponse: GatewayResponse }) {
  const publishableKey = gatewayResponse.publishable_key as string | undefined;
  const clientSecret = gatewayResponse.client_secret as string | undefined;

  // Dynamically load Stripe using the key from Atlas Core (no NEXT_PUBLIC_ env vars)
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  // Missing publishable key from gateway
  if (!publishableKey) {
    return (
      <StripeFallback error="Stripe publishable key was not returned by the payment gateway. Please check the Atlas Core configuration." />
    );
  }

  // Stripe Elements options — client_secret is required for payment confirmation
  const elementsOptions: StripeElementsOptions = {
    ...(clientSecret ? { clientSecret } : {}),
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0f172a",
        colorBackground: "#ffffff",
        colorText: "#1e293b",
        colorDanger: "#ef4444",
        fontFamily: "system-ui, -apple-system, sans-serif",
        borderRadius: "12px",
        fontSizeBase: "14px",
      },
      rules: {
        ".Input": {
          padding: "12px 14px",
          minHeight: "44px",
        },
      },
    },
    loader: "auto",
  };

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <StripePaymentForm gatewayResponse={gatewayResponse} />
    </Elements>
  );
}
