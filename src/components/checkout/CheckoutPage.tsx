// ─── Atlas Checkout — Main Page (Step-Based Smart Payment Router) ────────────
// Flow:
//   Step 1 (PAYER): Customer fills name/email/document + selects payment method
//   Step 2 (METHODS): Strategy component rendered (card form, QR, etc.)
//     - For MP_001 cards: tokenizes → sends card payload → gets final gateway response
//   Step 3 (SUCCESS): Animated checkmark → redirect to successUrl

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AlertCircle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n, useDetectLocale, I18nProvider } from "@/lib/i18n";
import { OrderSummary } from "./OrderSummary";
import { PayerForm } from "./PayerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { StrategySwitch } from "./strategies";
import type { PayResponseBody, CardTokenPayload } from "@/lib/checkout/types";
import { LoadingScreen } from "./LoadingScreen";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SuccessScreen } from "./SuccessScreen";

// ─── Step 1: Payer Data + Method Selection ─────────────────────────────────
function StepPayer({ onPaySuccess }: { onPaySuccess: (data: PayResponseBody) => void }) {
  const {
    session,
    payerData,
    selectedMethodId,
    isRegistering,
    setRegistering,
    setPayerId,
    setTransactionId,
    setGatewayResponse,
    setError,
    setStep,
  } = useCheckoutStore();
  const { t } = useI18n();

  // Validate payer data
  const isPayerValid = !!(payerData.fullName && payerData.email && payerData.fullName.length >= 3);

  // Validate method selection
  const isMethodValid = !!selectedMethodId;

  const isValid = isPayerValid && isMethodValid;

  const selectedMethod = session?.methods.find((m) => m.id === selectedMethodId);

  const handleContinue = async () => {
    if (!isValid || !session || !selectedMethod) return;

    setRegistering(true);
    setError(null);

    try {
      // POST to our API → proxies to Atlas Core
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          storeSlug: session.storeSlug,
          linkId: session.linkId,
          payer: payerData,
          methodId: selectedMethod.id,
          methodType: selectedMethod.method_type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao iniciar pagamento");
      }

      const data: PayResponseBody = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao iniciar pagamento");
      }

      // Store gateway data in Zustand
      if (data.payerId) setPayerId(data.payerId);
      if (data.transactionId) setTransactionId(data.transactionId);
      if (data.gatewayResponse) setGatewayResponse(data.gatewayResponse);

      // For non-card methods, advance directly to METHODS step
      // For card methods with MP_001, the CreditCardStrategy will tokenize first
      onPaySuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section: Customer Data */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t.yourData}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.yourDataDescription}</p>
      </div>
      <PayerForm />

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Section: Payment Method Selection */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t.paymentMethod}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.selectToContinue}</p>
      </div>
      {session && (
        <PaymentMethodSelector
          methods={session.methods}
          selectedId={selectedMethodId}
          onSelect={useCheckoutStore.getState().selectMethod}
        />
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!isValid || isRegistering}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all min-h-[48px] ${
          isValid && !isRegistering
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        {isRegistering ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t.processing || "A processar..."}</span>
          </>
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

// ─── Step 2: Payment Strategy (rendered AFTER gatewayResponse is available) ──
function StepPayment() {
  const { session, selectedMethodId, gatewayResponse, setStep, isProcessing, setProcessing, setError } = useCheckoutStore();
  const { t } = useI18n();

  const selectedMethod = session?.methods.find((m) => m.id === selectedMethodId);
  const provider = selectedMethod?.provider || "";
  const publicKey = (selectedMethod?.config?.publicKey as string) || (gatewayResponse?.publishable_key as string) || undefined;

  // ─── Handle card tokenization (MP_001) ────────────────────────────────
  const handleCardToken = useCallback(async (cardPayload: CardTokenPayload) => {
    if (!session || !selectedMethod) return;

    setProcessing(true);
    setError(null);

    try {
      // POST card token to our API → Atlas Core processes payment
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          storeSlug: session.storeSlug,
          linkId: session.linkId,
          payer: useCheckoutStore.getState().payerData,
          methodId: selectedMethod.id,
          methodType: selectedMethod.method_type,
          cardPayload,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao processar pagamento");
      }

      const data: PayResponseBody = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      if (data.transactionId) {
        useCheckoutStore.getState().setTransactionId(data.transactionId);
      }
      if (data.gatewayResponse) {
        useCheckoutStore.getState().setGatewayResponse(data.gatewayResponse);
      }

      setStep("SUCCESS");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.unknownError);
    } finally {
      setProcessing(false);
    }
  }, [session, selectedMethod, setProcessing, setError, setStep, t]);

  if (!session || !gatewayResponse) return null;

  return (
    <div className="space-y-6">
      {/* Back button — goes back to Payer step */}
      <button
        type="button"
        onClick={() => setStep("PAYER")}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.backToDetails}
      </button>

      {/* Selected method label */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {t.paymentMethod}
        </span>
        <span className="text-slate-300">·</span>
        <span className="font-semibold text-slate-900">{selectedMethod?.label}</span>
      </div>

      {/* Strategy component — provider-aware routing */}
      <StrategySwitch
        methodType={selectedMethod?.method_type}
        provider={provider}
        publicKey={publicKey}
        gatewayResponse={gatewayResponse}
        onSubmitCardToken={handleCardToken}
      />
    </div>
  );
}

// ─── Main Checkout Content ──────────────────────────────────────────────────
function CheckoutContent() {
  const { session, step, error, setSession, setError, setLoading, setStep } = useCheckoutStore();
  const detected = useDetectLocale();
  const [showLoading, setShowLoading] = useState(true);
  const hasFetched = useRef(false);

  const handleLoadingComplete = useCallback(() => setShowLoading(false), []);

  // Fetch session on mount
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

  // Handle successful POST /checkout/pay — advance to METHODS step
  const handlePaySuccess = useCallback((_data: PayResponseBody) => {
    setStep("METHODS");
  }, [setStep]);

  // Loading screen
  if (showLoading && !error && step === "LOADING") {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Success screen
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
            <h2 className="text-lg font-semibold text-slate-900">{error}</h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
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
              {step === "PAYER" && <StepPayer onPaySuccess={handlePaySuccess} />}
              {step === "METHODS" && <StepPayment />}
            </div>

            {/* Footer */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                Powered by <span className="font-semibold text-slate-500">Atlas</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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
