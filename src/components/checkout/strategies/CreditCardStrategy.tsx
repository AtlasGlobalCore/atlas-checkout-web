// ─── Credit Card Strategy ───────────────────────────────────────────────────
// Renders the credit card payment form.

"use client";

import { useState } from "react";
import { CreditCard, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { maskCardNumber, maskExpiry, getCardBrand } from "@/lib/checkout/utils";

const cardBrandColors: Record<string, string> = {
  visa: "#1a1f71",
  mastercard: "#eb001b",
  amex: "#006fcf",
  unknown: "#6b7280",
};

export function CreditCardStrategy() {
  const [showCvv, setShowCvv] = useState(false);
  const { payerData, updatePaymentData, paymentData } = useCheckoutStore();

  const cardNumber = (paymentData.cardNumber as string) || "";
  const cardHolder = (paymentData.cardHolder as string) || "";
  const expiry = (paymentData.expiry as string) || "";
  const cvv = (paymentData.cvv as string) || "";

  const brand = getCardBrand(cardNumber);
  const brandColor = cardBrandColors[brand] || cardBrandColors.unknown;

  return (
    <div className="space-y-5 pt-1">
      {/* Card Visual Preview */}
      <div className="relative mx-auto w-full max-w-sm">
        <div
          className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-lg"
          style={{
            background:
              brand !== "unknown"
                ? `linear-gradient(135deg, ${brandColor}cc, ${brandColor})`
                : undefined,
          }}
        >
          <div className="flex items-center justify-between">
            <CreditCard className="h-7 w-7 text-white/70" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              {brand !== "unknown" ? brand : "Card"}
            </span>
          </div>
          <div className="mt-5 font-mono text-xl tracking-[0.2em] text-white/90">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">
                Titular
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/80">
                {cardHolder || "Seu nome"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/50">
                Validade
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/80">
                {expiry || "MM/AA"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700">
            Número do cartão
          </Label>
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) =>
              updatePaymentData({ cardNumber: maskCardNumber(e.target.value) })
            }
            className="h-11 bg-white font-mono text-base tracking-wider transition-colors focus:bg-white"
            maxLength={19}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardHolder" className="text-sm font-medium text-slate-700">
            Nome no cartão
          </Label>
          <Input
            id="cardHolder"
            placeholder="Como aparece no cartão"
            value={cardHolder}
            onChange={(e) =>
              updatePaymentData({ cardHolder: e.target.value.toUpperCase() })
            }
            className="h-11 bg-white text-base uppercase tracking-wide"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry" className="text-sm font-medium text-slate-700">
              Validade
            </Label>
            <Input
              id="expiry"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) =>
                updatePaymentData({ expiry: maskExpiry(e.target.value) })
              }
              className="h-11 bg-white font-mono text-base"
              maxLength={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv" className="text-sm font-medium text-slate-700">
              CVV
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
                className="h-11 bg-white pr-10 font-mono text-base"
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCvv ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5">
        <Lock className="h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-xs text-emerald-700">
          Seus dados são criptografados de ponta a ponta. Nunca armazenamos informações do cartão.
        </p>
      </div>
    </div>
  );
}
