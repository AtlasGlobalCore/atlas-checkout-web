// ─── SEPA Instant Transfer Strategy (Wired to Atlas Core) ────────────────────
// Uses beneficiary_name, iban, bic_swift, reference from gatewayResponse.

"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Mail, Building2, ArrowRightLeft, Clock, ShieldCheck } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import type { GatewayResponse } from "@/lib/checkout/types";

export function SepaInstantStrategy({ gatewayResponse }: { gatewayResponse: GatewayResponse }) {
  const { session, payerData } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const total = session?.order.total ?? 0;

  // Data from Atlas Core gatewayResponse (fallback to defaults for mock)
  const beneficiary = (gatewayResponse.beneficiary_name as string) || "ATLAS GLOBAL CORE LDA";
  const iban = (gatewayResponse.iban as string) || "PT50 1234 5678 9012 3456 78901 234";
  const bicSwift = (gatewayResponse.bic_swift as string) || "ATLSPT21";
  const reference = (gatewayResponse.reference as string) || session?.id || "N/A";

  const handleCopy = useCallback(async (value: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  }, []);

  const handleSendEmail = useCallback(() => {
    const subject = encodeURIComponent("Detalhes de Transferência Bancária — Atlas Checkout");
    const body = encodeURIComponent(
      `Por favor, transfira ${formatAmount(total)} para:\n\n` +
      `Beneficiário: ${beneficiary}\n` +
      `IBAN: ${iban}\n` +
      `BIC/SWIFT: ${bicSwift}\n` +
      `Referência: ${reference}\n\n` +
      `As transferências SEPA Instant são processadas em menos de 10 segundos.`
    );
    window.open(`mailto:${payerData.email || ""}?subject=${subject}&body=${body}`, "_self");
  }, [formatAmount, total, beneficiary, iban, bicSwift, reference, payerData.email]);

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
            Detalhes da Transferência
          </span>
        </div>

        {/* Fields */}
        <div className="divide-y divide-slate-100">
          {/* Beneficiary */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              Beneficiário
            </p>
            <p className="mt-1 text-sm sm:text-base font-semibold text-slate-900">
              {beneficiary}
            </p>
          </div>

          {/* IBAN */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              IBAN
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 text-sm sm:text-base font-mono font-semibold text-slate-900 tracking-wide break-all">
                {iban}
              </p>
              <button
                type="button"
                onClick={() => handleCopy(iban, "iban")}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
                  copiedField === "iban"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {copiedField === "iban" ? (
                  <span className="flex items-center gap-1"><Check className="h-3 w-3" />{t.copied}</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="h-3 w-3" />{t.copy}</span>
                )}
              </button>
            </div>
          </div>

          {/* BIC/SWIFT */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              BIC / SWIFT
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 text-sm sm:text-base font-mono font-semibold text-slate-900 tracking-wider">
                {bicSwift}
              </p>
              <button
                type="button"
                onClick={() => handleCopy(bicSwift, "bic")}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
                  copiedField === "bic"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {copiedField === "bic" ? (
                  <span className="flex items-center gap-1"><Check className="h-3 w-3" />{t.copied}</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="h-3 w-3" />{t.copy}</span>
                )}
              </button>
            </div>
          </div>

          {/* Reference */}
          <div className="px-4 py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
              Referência
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="flex-1 text-sm sm:text-base font-mono text-slate-700 break-all">
                {reference}
              </p>
              <button
                type="button"
                onClick={() => handleCopy(reference, "ref")}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
                  copiedField === "ref"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {copiedField === "ref" ? (
                  <span className="flex items-center gap-1"><Check className="h-3 w-3" />{t.copied}</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="h-3 w-3" />{t.copy}</span>
                )}
              </button>
            </div>
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
        Enviar por Email
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
    </div>
  );
}
