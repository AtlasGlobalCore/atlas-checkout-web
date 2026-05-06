// ─── Viva Wallet Modal Strategy (Wired to Atlas Core) ────────────────────────
// Uses charge_token and redirect_url from gatewayResponse.

"use client";

import { useState, useCallback } from "react";
import { Wallet, ExternalLink, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import type { GatewayResponse } from "@/lib/checkout/types";

export function VivaModalStrategy({ gatewayResponse }: { gatewayResponse: GatewayResponse }) {
  const { session, setPaymentStatus, setStep } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const total = session?.order.total ?? 0;

  // Data from Atlas Core gatewayResponse
  const chargeToken = (gatewayResponse.charge_token as string) || "";
  const redirectUrl = (gatewayResponse.redirect_url as string) || "";

  const handleOpenWallet = useCallback(() => {
    if (redirectUrl) {
      // Real redirect to Viva Wallet payment page
      setIsRedirecting(true);
      window.location.href = redirectUrl;
      return;
    }

    // Fallback if no redirect URL (development mock)
    setIsRedirecting(true);
    setTimeout(() => {
      setIsRedirecting(false);
      setPaymentStatus("paid");
      setStep("SUCCESS");
    }, 2000);
  }, [redirectUrl, setPaymentStatus, setStep]);

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Viva Wallet Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 sm:p-6 text-center">
        {/* Decorative background element */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-50 opacity-60" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-50 opacity-40" />

        <div className="relative">
          {/* Wallet Icon */}
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
            <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="mt-4 text-base sm:text-lg font-semibold text-slate-900">
            Viva Wallet
          </h3>

          {/* Amount */}
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {formatAmount(total)}
          </p>

          {/* Transaction token */}
          {chargeToken && (
            <p className="mt-2 text-[10px] font-mono text-slate-400">
              Token: {chargeToken.slice(0, 16)}...
            </p>
          )}
        </div>
      </div>

      {/* Open Button */}
      <button
        type="button"
        onClick={handleOpenWallet}
        disabled={isRedirecting}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]"
      >
        {isRedirecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t.processing}</span>
          </>
        ) : (
          <>
            <span>{t.payWith} Viva Wallet</span>
            <ExternalLink className="h-4 w-4" />
          </>
        )}
      </button>

      {/* Info Notice */}
      <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3">
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-slate-400 mt-0.5" />
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
          {redirectUrl
            ? "You will be redirected to Viva Wallet's secure payment page to complete your transaction."
            : "Viva Wallet redirect URL not configured. Contact the merchant for support."}
        </p>
      </div>

      {/* Security */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] sm:text-xs text-emerald-700 leading-relaxed">
          {t.securityNotice}
        </p>
      </div>
    </div>
  );
}
