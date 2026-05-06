// ─── Atlas Checkout — Main Page (Step-Based Router) ─────────────────────────

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AlertCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n, useDetectLocale, I18nProvider } from "@/lib/i18n";
import { OrderSummary } from "./OrderSummary";
import { PayerForm } from "./PayerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { StripeElementsStrategy } from "./strategies/StripeElementsStrategy";
import { PixNativeStrategy } from "./strategies/PixNativeStrategy";
import { VivaModalStrategy } from "./strategies/VivaModalStrategy";
import { SepaInstantStrategy } from "./strategies/SepaInstantStrategy";
import { MbWayFlowStrategy } from "./strategies/MbWayFlowStrategy";
import { CryptoNativeStrategy } from "./strategies/CryptoNativeStrategy";
import type { PaymentMethodType } from "@/lib/checkout/types";
import { LoadingScreen } from "./LoadingScreen";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SuccessScreen } from "./SuccessScreen";

// ─── Step 1: Payer Data ─────────────────────────────────────────────────────
function StepPayer({ onContinue }: { onContinue: () => void }) {
  const { session, payerData, setRegistering, setPayerId, setError, setStep } = useCheckoutStore();
  const { t } = useI18n();

  const isValid = payerData.fullName && payerData.email && payerData.fullName.length >= 3;

  const handleContinue = async () => {
    if (!isValid) return;
    setRegistering(true);
    setError(null);

    try {
      // POST to Atlas Core — register payer in CRM
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session?.id,
          payer: payerData,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registar dados");

      const data = await res.json();
      setPayerId(data.payerId);
      onContinue();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t.yourData}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.yourDataDescription}</p>
      </div>
      <PayerForm />
      <button
        type="button"
        onClick={handleContinue}
        disabled={!isValid || setRegistering === undefined}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all min-h-[48px] ${
          isValid
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        {false ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {t.continueToPayment}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Step 2: Payment Methods + Strategy ─────────────────────────────────────
function StepPayment() {
  const { session, selectedMethodId, selectMethod, setStep } = useCheckoutStore();
  const { t } = useI18n();

  if (!session) return null;

  const selectedMethod = session.methods.find((m) => m.id === selectedMethodId);
  const strategyKey = selectedMethod?.method_type ?? "__none__";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => setStep("PAYER")}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.backToDetails}
      </button>

      {/* Method selector */}
      <PaymentMethodSelector
        methods={session.methods}
        selectedId={selectedMethodId}
        onSelect={selectMethod}
      />

      {/* Strategy component — rendered via key switch */}
      {selectedMethodId && (
        <div className={selectedMethodId === strategyKey ? "" : ""}>
          <div className="h-px bg-slate-100" />
          <StrategySwitch methodType={selectedMethod?.method_type} />
        </div>
      )}

      {!selectedMethodId && (
        <p className="text-center text-sm text-slate-400">{t.selectToContinue}</p>
      )}
    </div>
  );
}

function StrategySwitch({ methodType }: { methodType?: PaymentMethodType }) {
  switch (methodType) {
    case "STRIPE_ELEMENTS":
      return <StripeElementsStrategy />;
    case "PIX_NATIVE":
      return <PixNativeStrategy />;
    case "VIVA_MODAL":
      return <VivaModalStrategy />;
    case "SEPA_INSTANT":
      return <SepaInstantStrategy />;
    case "MBWAY_FLOW":
      return <MbWayFlowStrategy />;
    case "CRYPTO_NATIVE":
      return <CryptoNativeStrategy />;
    default:
      return null;
  }
}

// ─── Main Checkout Content ──────────────────────────────────────────────────
function CheckoutContent() {
  const { session, step, error, setSession, setError, setLoading } = useCheckoutStore();
  const detected = useDetectLocale();
  const [showLoading, setShowLoading] = useState(true);
  const hasFetched = useRef(false);

  const handleLoadingComplete = useCallback(() => setShowLoading(false), []);

  // Fetch session
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchSession() {
      try {
        setLoading(true);
        const res = await fetch("/api/checkout?storeSlug=loja-exemplo&linkId=lnk_xyz789");
        if (!res.ok) throw new Error("Erro ao carregar checkout");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setShowLoading(false);
      }
    }

    const timer = setTimeout(fetchSession, detected.loading ? 300 : 100);
    return () => clearTimeout(timer);
  }, [setSession, setError, setLoading, detected.loading]);

  // Loading
  if (showLoading && !error && step === "LOADING") {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Success
  if (step === "SUCCESS") {
    return <SuccessScreen />;
  }

  // Error (no session)
  if (error && !session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t_error(error)}</h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
                <path d="M14 24L24 14L34 24L24 34Z" fill="white" fillOpacity="0.9" />
                <path d="M24 10L14 20L24 24L34 20L24 10Z" fill="white" />
                <path d="M14 28L24 24L34 28L24 38L14 28Z" fill="white" fillOpacity="0.7" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400 tracking-wide">Atlas Checkout</span>
          </div>
          <LocaleSwitcher />
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-10">
          {/* Left: Order Summary */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
              <OrderSummary />
            </div>
          </div>

          {/* Right: Form */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              {step === "PAYER" && <StepPayer onContinue={() => {}} />}
              {step === "METHODS" && <StepPayment />}
            </div>

            {/* Footer */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Powered by <span className="font-semibold text-slate-500">Atlas</span></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function t_error(error: string) { return error; }

export function CheckoutPage() {
  const detected = useDetectLocale();

  return (
    <I18nProvider
      initialLocale={detected.loading ? "pt-BR" : detected.locale}
      initialCurrency={detected.loading ? "BRL" : detected.currency}
    >
      <CheckoutContent />
    </I18nProvider>
  );
}
