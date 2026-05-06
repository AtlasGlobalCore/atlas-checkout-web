// ─── Checkout Page ───────────────────────────────────────────────────────────
// Main responsive layout with i18n, locale switcher, progressive loading.

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n, useDetectLocale, I18nProvider } from "@/lib/i18n";
import { OrderSummary } from "./OrderSummary";
import { PayerForm } from "./PayerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { getStrategyComponent } from "./strategies";
import { SubmitButton } from "./SubmitButton";
import { LoadingScreen } from "./LoadingScreen";
import { LocaleSwitcher } from "./LocaleSwitcher";

function CheckoutContent() {
  const {
    session,
    isLoading,
    error,
    selectedMethodId,
    selectMethod,
    setSession,
    setError,
    setLoading,
  } = useCheckoutStore();

  const { t, formatAmount } = useI18n();
  const detected = useDetectLocale();
  const [showLoading, setShowLoading] = useState(true);
  const hasFetched = useRef(false);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  // Fetch checkout session on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchSession() {
      try {
        setLoading(true);
        const res = await fetch(
          "/api/checkout?storeSlug=loja-exemplo&linkId=lnk_xyz789"
        );
        if (!res.ok) throw new Error(t.errorLoading);
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.unknownError);
        setShowLoading(false);
      }
    }

    // Wait a moment for locale detection, then fetch
    const timer = setTimeout(() => {
      fetchSession();
    }, detected.loading ? 300 : 100);

    return () => clearTimeout(timer);
  }, [setSession, setError, setLoading, t.errorLoading, t.unknownError, detected.loading]);

  // Progressive loading screen
  if (showLoading && !error) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Error State
  if (error && !session) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t.errorTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const selectedMethod = session.methods.find((m) => m.id === selectedMethodId);
  const StrategyComponent = selectedMethod
    ? getStrategyComponent(selectedMethod)
    : null;

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {/* Top Bar — Locale Switcher */}
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
            <span className="text-xs font-semibold text-slate-400 tracking-wide">
              Atlas Checkout
            </span>
          </div>
          <LocaleSwitcher />
        </div>
      </header>

      {/* Main Content — responsive two-column layout */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-10">
          {/* Left Column — Order Summary */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="lg:sticky lg:top-20 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-7">
              <OrderSummary />
            </div>
          </div>

          {/* Right Column — Payment Form */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
              {/* Payment Method Selection */}
              <div className="border-b border-slate-100 pb-5 sm:pb-6">
                <PaymentMethodSelector
                  methods={session.methods}
                  selectedId={selectedMethodId}
                  onSelect={selectMethod}
                />
              </div>

              {/* Dynamic Content */}
              {selectedMethod && (
                <div className="space-y-5 py-5 sm:py-6 border-b border-slate-100">
                  <PayerForm />

                  {StrategyComponent && (
                    <div>
                      <div className="h-px bg-slate-100 my-5" />
                      <StrategyComponent />
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="pt-5 sm:pt-6">
                {!selectedMethod && (
                  <p className="mb-3 text-center text-xs sm:text-sm text-slate-400">
                    {t.selectToContinue}
                  </p>
                )}
                <SubmitButton />
              </div>
            </div>

            {/* Powered by Atlas */}
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>
                {t.poweredBy} <span className="font-semibold text-slate-500">Atlas</span>
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
