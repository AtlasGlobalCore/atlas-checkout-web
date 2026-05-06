// ─── Stripe PaymentElement Strategy ──────────────────────────────────────────
// Simulates Stripe's PaymentElement with card form, Apple/Google Pay, and security notice.

"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, CreditCard, Smartphone, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

export function StripeElementsStrategy() {
  const { session } = useCheckoutStore();
  const { t } = useI18n();

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);

  // Card number mask
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
  };

  // Expiry mask
  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(digits.replace(/(\d{2})(?=\d)/, "$1/"));
  };

  // CVV mask
  const handleCvvChange = (value: string) => {
    setCvv(value.replace(/\D/g, "").slice(0, 4));
  };

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Stripe PaymentElement Simulation */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        {/* Card Number */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="stripe-card-number" className="text-xs sm:text-sm font-medium text-slate-700">
            {t.cardNumber}
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            <Input
              id="stripe-card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              className="h-11 bg-white pl-10 font-mono text-sm sm:text-base tracking-wider"
              maxLength={19}
              autoComplete="cc-number"
            />
          </div>
        </div>

        {/* Card Holder */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="stripe-card-holder" className="text-xs sm:text-sm font-medium text-slate-700">
            {t.cardHolder}
          </Label>
          <Input
            id="stripe-card-holder"
            placeholder="JOHN DOE"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            className="h-11 bg-white text-sm sm:text-base uppercase tracking-wide"
            autoComplete="cc-name"
          />
        </div>

        {/* Expiry + CVV Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="stripe-expiry" className="text-xs sm:text-sm font-medium text-slate-700">
              {t.cardExpiry}
            </Label>
            <Input
              id="stripe-expiry"
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              className="h-11 bg-white font-mono text-sm sm:text-base"
              maxLength={5}
              autoComplete="cc-exp"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="stripe-cvv" className="text-xs sm:text-sm font-medium text-slate-700">
              {t.cardCvv}
            </Label>
            <div className="relative">
              <Input
                id="stripe-cvv"
                type={showCvv ? "text" : "password"}
                placeholder="•••"
                value={cardCvv}
                onChange={(e) => handleCvvChange(e.target.value)}
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

      {/* Apple Pay / Google Pay Buttons */}
      <div className="space-y-2">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
          Or pay with
        </p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Apple Pay */}
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-400 cursor-not-allowed transition-colors min-h-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M18.71 19.5C18.15 20.07 17.56 20.14 17.03 20.14C15.79 20.14 14.66 19.52 13.53 19.52C12.35 19.52 11.15 20.17 10.13 20.17C9.55 20.17 8.99 20.06 8.43 19.56C6.07 17.48 4.0 13.5 4.0 9.71C4.0 7.28 4.85 5.18 6.33 3.98C7.41 3.1 8.8 2.58 10.28 2.58C11.53 2.58 12.56 3.21 13.33 3.21C14.05 3.21 15.26 2.5 16.7 2.5C17.38 2.5 18.72 2.62 19.86 3.5C19.75 3.58 17.86 4.63 17.88 6.95C17.9 9.75 20.3 10.68 20.33 10.69C20.3 10.77 19.9 12.21 18.79 13.69C17.88 14.88 16.93 16.07 15.4 16.07C14.03 16.07 13.6 15.25 12.02 15.25C10.48 15.25 9.88 16.1 8.7 16.1C7.35 16.1 6.49 15.04 5.49 13.81C4.3 12.33 3.38 10.1 3.38 8.01C3.38 4.88 5.22 3.11 7.05 3.11C8.36 3.11 9.45 3.83 10.18 3.83C10.87 3.83 12.08 3.06 13.56 3.06C14.13 3.06 15.32 3.14 16.21 3.93" />
            </svg>
            <span>Apple Pay</span>
          </button>

          {/* Google Pay */}
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-400 cursor-not-allowed transition-colors min-h-[44px]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google Pay</span>
          </button>
        </div>

        {/* Configuration notice */}
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
          <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">
            Configure Stripe publishable key to enable digital wallet payments
          </p>
        </div>
      </div>

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
    </div>
  );
}
