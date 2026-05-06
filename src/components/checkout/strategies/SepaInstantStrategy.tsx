// ─── SEPA Instant Transfer Strategy ──────────────────────────────────────────
// Bank transfer details with copy functionality and email sharing.

"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Mail, Building2, ArrowRightLeft, Clock, ShieldCheck } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

const BENEFICIARY = "ATLAS GLOBAL CORE LDA";
const IBAN = "PT50 1234 5678 9012 3456 78901 234";
const BIC_SWIFT = "ATLSPT21";

export function SepaInstantStrategy() {
  const { session } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [copiedIban, setCopiedIban] = useState(false);

  const total = session?.order.total ?? 0;
  const reference = session?.id ?? "N/A";

  const handleCopyIban = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = IBAN;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2500);
  }, []);

  const handleSendEmail = useCallback(() => {
    // In production, this would call an API to send bank details via email
    const subject = encodeURIComponent("Bank Transfer Details - Atlas Checkout");
    const body = encodeURIComponent(
      `Please transfer ${formatAmount(total)} to:\n\n` +
      `Beneficiary: ${BENEFICIARY}\n` +
      `IBAN: ${IBAN}\n` +
      `BIC/SWIFT: ${BIC_SWIFT}\n` +
      `Reference: ${reference}\n\n` +
      `SEPA Instant transfers process in under 10 seconds.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, [formatAmount, total, reference]);

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Amount */}
      <div className="text-center py-1">
        <p className="text-xs sm:text-sm font-medium text-slate-500">{t.totalAmount}</p>
        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
          {formatAmount(total)}
        </p>
      </div>

      {/* Beneficiary Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-4 py-3">
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            Bank Transfer Details
          </span>
        </div>

        {/* Fields */}
        <div className="divide-y divide-slate-100">
          {/* Beneficiary */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              Beneficiary
            </p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900">
              {BENEFICIARY}
            </p>
          </div>

          {/* IBAN */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              IBAN
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 text-sm sm:text-base font-mono font-semibold text-slate-900 tracking-wide break-all">
                {IBAN}
              </p>
              <button
                type="button"
                onClick={handleCopyIban}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
                  copiedIban
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {copiedIban ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {t.copied}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {t.copy}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* BIC/SWIFT */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              BIC / SWIFT
            </p>
            <p className="mt-1 text-sm sm:text-base font-mono font-semibold text-slate-900 tracking-wider">
              {BIC_SWIFT}
            </p>
          </div>

          {/* Reference */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              Reference
            </p>
            <p className="mt-1 text-sm sm:text-base font-mono text-slate-700 break-all">
              {reference}
            </p>
          </div>
        </div>
      </div>

      {/* Send by Email Button */}
      <button
        type="button"
        onClick={handleSendEmail}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:bg-slate-100 min-h-[44px]"
      >
        <Mail className="h-4 w-4" />
        Send by Email
      </button>

      {/* SEPA Instant Processing Notice */}
      <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-3 sm:px-4 py-2.5 sm:py-3">
        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <p className="text-[11px] sm:text-xs font-medium text-blue-800">
            SEPA Instant Transfer
          </p>
          <p className="mt-0.5 text-[10px] sm:text-xs text-blue-600 leading-relaxed">
            Processing time is typically under 10 seconds for supported banks across the SEPA zone.
          </p>
        </div>
      </div>

      {/* Security */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 sm:px-3 py-2 sm:py-2.5">
        <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-600" />
        <p className="text-[11px] sm:text-xs text-emerald-700 leading-relaxed">
          {t.securityNotice}
        </p>
      </div>

      {/* Exchange icon */}
      <div className="flex items-center justify-center gap-2 pt-1 text-slate-300">
        <ArrowRightLeft className="h-4 w-4" />
      </div>
    </div>
  );
}
