// ─── Submit Button ───────────────────────────────────────────────────────────
// Smart submit button with i18n, responsive touch targets.

"use client";

import { useState } from "react";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

export function SubmitButton() {
  const {
    session,
    selectedMethodId,
    isProcessing,
    setProcessing,
    setError,
  } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [isSuccess, setIsSuccess] = useState(false);

  if (!session) return null;

  const total = session.order.total;
  const selectedMethod = session.methods.find((m) => m.id === selectedMethodId);
  const isDisabled = !selectedMethodId || isProcessing || isSuccess;

  const getButtonText = (): string => {
    if (isSuccess) return t.paymentConfirmed;
    if (isProcessing) return t.processing;
    if (!selectedMethodId) return t.selectMethod;
    switch (selectedMethod?.type) {
      case "pix":
        return `PIX`;
      case "crypto":
        return `${t.payWith} Crypto`;
      case "credit_card":
      case "debit_card":
      default:
        return `${t.payWith} ${formatAmount(total)}`;
    }
  };

  const handleSubmit = async () => {
    if (isDisabled) return;
    setProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));
      setIsSuccess(true);
    } catch {
      setError(t.paymentError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={isDisabled}
      className={`relative flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 min-h-[48px] ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
          : isDisabled
            ? "cursor-not-allowed bg-slate-200 text-slate-400"
            : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
      }`}
    >
      {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
      {isSuccess && <CheckCircle2 className="h-4 w-4" />}
      {!isProcessing && !isSuccess && <Lock className="h-4 w-4" />}
      {getButtonText()}
    </button>
  );
}
