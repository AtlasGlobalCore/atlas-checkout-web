// ─── Checkout Page ───────────────────────────────────────────────────────────
// Main two-column layout (Stripe-inspired) with order summary and payment form.

"use client";

import { useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { OrderSummary } from "./OrderSummary";
import { PayerForm } from "./PayerForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { getStrategyComponent } from "./strategies";
import { SubmitButton } from "./SubmitButton";

export function CheckoutPage() {
  const {
    session,
    isLoading,
    isProcessing,
    error,
    selectedMethodId,
    selectMethod,
    setSession,
    setError,
  } = useCheckoutStore();

  // Fetch checkout session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(
          "/api/checkout?storeSlug=loja-exemplo&linkId=lnk_xyz789"
        );
        if (!res.ok) throw new Error("Erro ao carregar checkout");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    }
    fetchSession();
  }, [setSession, setError]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm font-medium text-slate-500">
            Carregando checkout...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Algo deu errado
            </h2>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Tentar novamente
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
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left Column - Order Summary (2/5 width on desktop) */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:p-8">
              <OrderSummary />
            </div>
          </div>

          {/* Right Column - Payment Form (3/5 width on desktop) */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:p-8">
              {/* Section: Payment Method Selection */}
              <div className="border-b border-slate-100 pb-6">
                <PaymentMethodSelector
                  methods={session.methods}
                  selectedId={selectedMethodId}
                  onSelect={selectMethod}
                />
              </div>

              {/* Section: Dynamic Content */}
              {selectedMethod && (
                <div className="space-y-6 py-6 border-b border-slate-100">
                  {/* Dynamic Payer Form (Mini-CRM) */}
                  <PayerForm />

                  {/* Payment Strategy Component */}
                  {StrategyComponent && (
                    <div>
                      <div className="h-px bg-slate-100 my-6" />
                      <StrategyComponent />
                    </div>
                  )}
                </div>
              )}

              {/* Section: Submit */}
              <div className="pt-6">
                {!selectedMethod && (
                  <p className="mb-3 text-center text-sm text-slate-400">
                    Selecione um método de pagamento para continuar
                  </p>
                )}
                <SubmitButton />
              </div>
            </div>

            {/* Powered by Atlas */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-300">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                Powered by{" "}
                <span className="font-semibold text-slate-500">Atlas</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
