// ─── Credit Card Strategy (Agnostic) ───────────────────────────────────────
// Provider-agnostic card form. If the provider is MP_001, uses Mercado Pago SDK
// for tokenization. Otherwise, submits raw card data for backend processing.
//
// Zero provider branding. Atlas-native UI.

"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import { maskCardNumber, maskExpiry, getCardBrand } from "@/lib/checkout/utils";
import type { CardTokenPayload } from "@/lib/checkout/types";

// ─── Card brand colors (for visual preview only, no logos) ─────────────────
const cardBrandColors: Record<string, string> = {
  visa: "#1a1f71",
  mastercard: "#eb001b",
  amex: "#006fcf",
  unknown: "#334155",
};

// ─── Installments options ──────────────────────────────────────────────────
const INSTALLMENT_OPTIONS = [
  { value: 1, label: "1× sem juros" },
  { value: 2, label: "2× sem juros" },
  { value: 3, label: "3× sem juros" },
  { value: 4, label: "4× sem juros" },
  { value: 5, label: "5× sem juros" },
  { value: 6, label: "6× sem juros" },
  { value: 7, label: "7× sem juros" },
  { value: 8, label: "8× sem juros" },
  { value: 9, label: "9× sem juros" },
  { value: 10, label: "10× sem juros" },
  { value: 11, label: "11× sem juros" },
  { value: 12, label: "12× sem juros" },
];

interface CreditCardStrategyProps {
  provider: string;
  publicKey?: string;
  gatewayResponse?: Record<string, unknown>;
  onSubmitToken?: (payload: CardTokenPayload) => void;
}

export function CreditCardStrategy({
  provider,
  publicKey,
  onSubmitToken,
}: CreditCardStrategyProps) {
  const { paymentData, updatePaymentData, mpInstance, mpReady, initMercadoPago, session, payerData, isProcessing } =
    useCheckoutStore();
  const { t, formatAmount } = useI18n();

  const [showCvv, setShowCvv] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [installments, setInstallments] = useState(1);

  const cardNumber = paymentData.cardNumber || "";
  const cardHolder = paymentData.cardHolder || "";
  const expiry = paymentData.expiry || "";
  const cvv = paymentData.cvv || "";

  const brand = getCardBrand(cardNumber);
  const brandColor = cardBrandColors[brand] || cardBrandColors.unknown;

  const isMP = provider === "MP_001";

  // ─── Silently init MP SDK when provider is MP_001 ──────────────────────
  useEffect(() => {
    if (isMP && publicKey && !mpReady) {
      initMercadoPago(publicKey);
    }
  }, [isMP, publicKey, mpReady, initMercadoPago]);

  // ─── Validate card fields ──────────────────────────────────────────────
  const isCardValid = useCallback(() => {
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 13) return false;
    if (!cardHolder.trim()) return false;
    if (expiry.replace(/\D/g, "").length < 4) return false;
    if (cvv.length < 3) return false;
    return true;
  }, [cardNumber, cardHolder, expiry, cvv]);

  // ─── MP_001: Tokenize card via SDK ─────────────────────────────────────
  const handleMPSubmit = async () => {
    if (!mpInstance || !isCardValid()) return;

    setIsTokenizing(true);
    setTokenError(null);

    try {
      const cleanNumber = cardNumber.replace(/\s/g, "");
      const [expMonth, expYear] = expiry.split("/");

      // Build the card token via MP SDK
      const tokenResult = await mpInstance.createCardToken({
        cardNumber: cleanNumber,
        cardholderName: cardHolder,
        cardExpirationMonth: expMonth,
        cardExpirationYear: expYear.length === 2 ? `20${expYear}` : expYear,
        securityCode: cvv,
        identificationType: "CPF",
        identificationNumber: payerData.document?.replace(/\D/g, "") || "",
      });

      if (!tokenResult?.id) {
        throw new Error("Falha na tokenização do cartão");
      }

      // Get payment method ID from BIN detection
      const bin = cleanNumber.slice(0, 6);
      let paymentMethodId = brand === "visa" ? "visa"
        : brand === "mastercard" ? "mastercard"
        : brand === "amex" ? "amex"
        : "card";

      let issuerId: string | null = null;

      // Try to get payment methods from MP to detect exact issuer
      try {
        const pmResult = await mpInstance.getPaymentMethods({ bin });
        if (pmResult?.results?.length > 0) {
          const pm = pmResult.results[0];
          paymentMethodId = pm.id || paymentMethodId;
          issuerId = pm.issuer?.id || null;
        }
      } catch {
        // BIN detection failed — use brand-based fallback
      }

      const payload: CardTokenPayload = {
        method: "card",
        provider: "MP_001",
        token: tokenResult.id,
        installments,
        issuer_id: issuerId,
        payment_method_id: paymentMethodId,
      };

      onSubmitToken?.(payload);
    } catch (err) {
      setTokenError(
        err instanceof Error ? err.message : "Erro ao processar cartão"
      );
    } finally {
      setIsTokenizing(false);
    }
  };

  // ─── Generic: Submit raw card data (non-MP) ────────────────────────────
  const handleGenericSubmit = () => {
    if (!isCardValid()) return;

    const payload: CardTokenPayload = {
      method: "card",
      provider,
      token: "",
      installments: 1,
      issuer_id: null,
      payment_method_id: brand !== "unknown" ? brand : "card",
    };

    onSubmitToken?.(payload);
  };

  const handleSubmit = isMP ? handleMPSubmit : handleGenericSubmit;

  const total = session?.order?.total ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* ── Card Visual Preview ─────────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
        <div
          className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-5 text-white shadow-lg transition-colors duration-500"
          style={{
            background:
              brand !== "unknown"
                ? `linear-gradient(135deg, ${brandColor}cc, ${brandColor})`
                : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white/70" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/60">
              {brand !== "unknown" ? brand : "Card"}
            </span>
          </div>
          <div className="mt-4 sm:mt-5 font-mono text-lg sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] text-white/90">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>
          <div className="mt-3 sm:mt-4 flex items-end justify-between">
            <div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">
                {t.cardHolder}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/80">
                {cardHolder || t.cardPreviewName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">
                {t.cardExpiry}
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/80">
                {expiry || t.cardPreviewExpiry}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card Form Fields ────────────────────────────────────────────── */}
      <div className="space-y-3 sm:space-y-4">
        {/* Card Number */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="cardNumber" className="text-xs sm:text-sm font-medium text-slate-700">
            {t.cardNumber}
          </Label>
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => updatePaymentData({ cardNumber: maskCardNumber(e.target.value) })}
            className="h-11 bg-white font-mono text-sm sm:text-base tracking-wider"
            maxLength={19}
            autoComplete="cc-number"
          />
        </div>

        {/* Card Holder */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="cardHolder" className="text-xs sm:text-sm font-medium text-slate-700">
            {t.cardHolder}
          </Label>
          <Input
            id="cardHolder"
            placeholder={t.cardPreviewName}
            value={cardHolder}
            onChange={(e) => updatePaymentData({ cardHolder: e.target.value.toUpperCase() })}
            className="h-11 bg-white text-sm sm:text-base uppercase tracking-wide"
            autoComplete="cc-name"
          />
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="expiry" className="text-xs sm:text-sm font-medium text-slate-700">
              {t.cardExpiry}
            </Label>
            <Input
              id="expiry"
              placeholder={t.cardPreviewExpiry}
              value={expiry}
              onChange={(e) => updatePaymentData({ expiry: maskExpiry(e.target.value) })}
              className="h-11 bg-white font-mono text-sm sm:text-base"
              maxLength={5}
              autoComplete="cc-exp"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="cvv" className="text-xs sm:text-sm font-medium text-slate-700">
              {t.cardCvv}
            </Label>
            <div className="relative">
              <Input
                id="cvv"
                type={showCvv ? "text" : "password"}
                placeholder="•••"
                value={cvv}
                onChange={(e) =>
                  updatePaymentData({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                className="h-11 bg-white pr-10 font-mono text-sm sm:text-base"
                maxLength={4}
                autoComplete="cc-csc"
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Installments (MP_001 only) ────────────────────────────────── */}
        {isMP && (
          <div className="space-y-1.5">
            <Label className="text-xs sm:text-sm font-medium text-slate-700">
              Parcelas
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {INSTALLMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInstallments(opt.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    installments === opt.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {opt.value}×
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Token Error ─────────────────────────────────────────────────── */}
      {tokenError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-xs text-red-700">{tokenError}</p>
        </div>
      )}

      {/* ── Pay Button ──────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isCardValid() || isTokenizing || isProcessing}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition-all min-h-[48px] ${
          isCardValid() && !isTokenizing && !isProcessing
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98]"
            : "cursor-not-allowed bg-slate-200 text-slate-400"
        }`}
      >
        {(isTokenizing || isProcessing) ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t.processing || "A processar..."}</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>
              {t.payWith} {formatAmount(total)}
            </span>
          </>
        )}
      </button>

      {/* ── Security Notice ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] sm:text-xs text-emerald-700">{t.securityNotice}</p>
      </div>
    </div>
  );
}
