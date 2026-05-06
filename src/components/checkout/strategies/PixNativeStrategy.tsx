// ─── PIX Native Payment Strategy (Refined) ──────────────────────────────────
// Full PIX payment flow with countdown, QR code, copy-paste code, and refresh.

"use client";

import { useState, useEffect, useCallback } from "react";
import { QrCode, Copy, Check, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

const MOCK_PIX_CODE =
  "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890204000053039865802BR5925TECHNOVA STORE LTDA6009SAO PAULO62070503***63041D3D";

export function PixNativeStrategy() {
  const { session } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const total = session?.order.total ?? 0;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  // Generate consistent pseudo-random QR pattern (deterministic based on code)
  const qrPattern = useCallback(() => {
    const cells: boolean[] = [];
    for (let i = 0; i < 121; i++) {
      const row = Math.floor(i / 11);
      const col = i % 11;
      const isCorner =
        (row < 3 && col < 3) ||
        (row < 3 && col > 7) ||
        (row > 7 && col < 3);
      if (isCorner) {
        cells.push(true);
      } else {
        // Deterministic pseudo-random based on position and PIX code char
        const charCode = MOCK_PIX_CODE.charCodeAt(i % MOCK_PIX_CODE.length);
        cells.push((i + charCode) % 10 > 4);
      }
    }
    return cells;
  }, []);

  const qrCells = qrPattern();

  // Copy handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MOCK_PIX_CODE);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = MOCK_PIX_CODE;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  // Generate new QR (reset countdown)
  const handleRefresh = useCallback(() => {
    setCountdown(600);
    setCopied(false);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Status Banner with Countdown */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 sm:px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs sm:text-sm font-medium text-amber-800">
              {t.awaitingPayment}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1">
            <span className="text-sm sm:text-base font-bold font-mono tracking-wider text-amber-900">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Large Amount Display */}
      <div className="text-center py-2 sm:py-3">
        <p className="text-xs sm:text-sm font-medium text-slate-500">{t.totalAmount}</p>
        <p className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {formatAmount(total)}
        </p>
      </div>

      {/* QR Code Grid (11x11) */}
      <div className="flex justify-center">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: "repeat(11, 1fr)",
              width: 176,
              height: 176,
            }}
          >
            {qrCells.map((filled, i) => (
              <div
                key={i}
                className={`rounded-[1px] ${filled ? "bg-slate-900" : "bg-white"}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">
              PIX QR Code
            </span>
          </div>
        </div>
      </div>

      {/* Copy-paste PIX Code */}
      <div className="space-y-2">
        <p className="text-center text-[10px] sm:text-xs font-medium text-slate-500">
          {t.copyPixCode}
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
          <code className="flex-1 truncate text-[10px] sm:text-xs font-mono text-slate-600">
            {MOCK_PIX_CODE}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className={`shrink-0 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
              copied
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {copied ? (
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

      {/* Generate New QR Button */}
      <button
        type="button"
        onClick={handleRefresh}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:bg-slate-100 min-h-[44px]"
      >
        <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {t.generateNewQr}
      </button>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-[10px] sm:text-xs text-slate-400">
          Pagamento processado pelo Banco Central
        </span>
      </div>
    </div>
  );
}
