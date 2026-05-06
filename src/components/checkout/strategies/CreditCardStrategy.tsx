// ─── Credit Card Strategy ───────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { CreditCard, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import { maskCardNumber, maskExpiry, getCardBrand } from "@/lib/checkout/utils";

const cardBrandColors: Record<string, string> = {
  visa: "#1a1f71",
  mastercard: "#eb001b",
  amex: "#006fcf",
  unknown: "#6b7280",
};

export function CreditCardStrategy() {
  const [showCvv, setShowCvv] = useState(false);
  const { updatePaymentData, paymentData } = useCheckoutStore();
  const { t } = useI18n();

  const cardNumber = (paymentData.cardNumber as string) || "";
  const cardHolder = (paymentData.cardHolder as string) || "";
  const expiry = (paymentData.expiry as string) || "";
  const cvv = (paymentData.cvv as string) || "";

  const brand = getCardBrand(cardNumber);
  const brandColor = cardBrandColors[brand] || cardBrandColors.unknown;

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Card Visual Preview */}
      <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
        <div
          className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-5 text-white shadow-lg"
          style={{
            background: brand !== "unknown"
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
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">{t.cardHolder}</p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/80">
                {cardHolder || t.cardPreviewName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50">{t.cardExpiry}</p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/80">
                {expiry || t.cardPreviewExpiry}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="cardNumber" className="text-xs sm:text-sm font-medium text-slate-700">{t.cardNumber}</Label>
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

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="cardHolder" className="text-xs sm:text-sm font-medium text-slate-700">{t.cardHolder}</Label>
          <Input
            id="cardHolder"
            placeholder={t.cardPreviewName}
            value={cardHolder}
            onChange={(e) => updatePaymentData({ cardHolder: e.target.value.toUpperCase() })}
            className="h-11 bg-white text-sm sm:text-base uppercase tracking-wide"
            autoComplete="cc-name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="expiry" className="text-xs sm:text-sm font-medium text-slate-700">{t.cardExpiry}</Label>
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
            <Label htmlFor="cvv" className="text-xs sm:text-sm font-medium text-slate-700">{t.cardCvv}</Label>
            <div className="relative">
              <Input
                id="cvv"
                type={showCvv ? "text" : "password"}
                placeholder="•••"
                value={cvv}
                onChange={(e) => updatePaymentData({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
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
      </div>

      {/* Security */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] sm:text-xs text-emerald-700">{t.securityNotice}</p>
      </div>
    </div>
  );
}
