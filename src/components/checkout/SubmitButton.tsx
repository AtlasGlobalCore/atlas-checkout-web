// ─── Submit Button ───────────────────────────────────────────────────────────
// Smart submit button that adapts based on payment method and state.

"use client";

import { useState } from "react";
import { Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { formatCurrency } from "@/lib/checkout/utils";

export function SubmitButton() {
  const { session, selectedMethodId, payerData, paymentData, isProcessing, setProcessing, setError } =
    useCheckoutStore();
  const [isSuccess, setIsSuccess] = useState(false);

  if (!session) return null;

  const total = session.order.total;
  const currency = session.order.currency;
  const selectedMethod = session.methods.find((m) => m.id === selectedMethodId);

  const isDisabled = !selectedMethodId || isProcessing || isSuccess;

  const getButtonText = (): string => {
    if (isSuccess) return "Pagamento confirmado!";
    if (isProcessing) return "Processando...";
    if (!selectedMethodId) return "Selecione um método";
    switch (selectedMethod?.type) {
      case "pix":
        return `Pagar com PIX`;
      case "crypto":
        return `Pagar com Criptomoeda`;
      case "credit_card":
      case "debit_card":
      default:
        return `Pagar ${formatCurrency(total, currency)}`;
    }
  };

  const handleSubmit = async () => {
    if (isDisabled) return;

    setProcessing(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));
      setIsSuccess(true);
    } catch {
      setError("Ocorreu um erro ao processar o pagamento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={isDisabled}
      className={`relative flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ${
        isSuccess
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
          : isDisabled
            ? "cursor-not-allowed bg-slate-200 text-slate-400"
            : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
      }`}
    >
      {isProcessing && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {isSuccess && (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {!isProcessing && !isSuccess && (
        <Lock className="h-4 w-4" />
      )}
      {getButtonText()}
    </button>
  );
}
