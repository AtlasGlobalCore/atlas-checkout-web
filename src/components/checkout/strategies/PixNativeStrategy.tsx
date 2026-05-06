// ─── PIX Native Payment Strategy (Wired to Atlas Core) ───────────────────────
// Uses qr_code, pix_code, expires_at from gatewayResponse.

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { QrCode, Copy, Check, Clock, RefreshCw, ShieldCheck, AlertTriangle } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import type { GatewayResponse } from "@/lib/checkout/types";

export function PixNativeStrategy({ gatewayResponse }: { gatewayResponse: GatewayResponse }) {
  const { session } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [copied, setCopied] = useState(false);

  const total = session?.order.total ?? 0;

  // Data from Atlas Core gatewayResponse
  const pixCode = (gatewayResponse.pix_code as string) || "";
  const qrCodeBase64 = (gatewayResponse.qr_code_base64 as string) || "";
  const expiresAt = (gatewayResponse.expires_at as string) || "";

  // Calculate countdown from expires_at or default 10 minutes
  const initialSeconds = useMemo(() => {
    if (expiresAt) {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      return Math.min(diff, 3600); // Cap at 1 hour
    }
    return 600; // Default 10 minutes
  }, [expiresAt]);

  const [countdown, setCountdown] = useState(initialSeconds);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const isExpired = countdown <= 0;

  // Generate deterministic QR pattern from pix_code
  const qrPattern = useMemo(() => {
    const source = pixCode || "fallback-pix-code-for-qr";
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
        const charCode = source.charCodeAt(i % source.length);
        cells.push((i + charCode) % 10 > 4);
      }
    }
    return cells;
  }, [pixCode]);

  // Copy handler
  const handleCopy = useCallback(async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = pixCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [pixCode]);

  // Refresh — request a new PIX session
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5 pt-1">
      {/* Status Banner with Countdown */}
      <div className={`rounded-xl border px-3 sm:px-4 py-3 sm:py-3.5 ${
        isExpired
          ? "border-red-200 bg-red-50"
          : "border-amber-200 bg-amber-50"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 shrink-0 ${isExpired ? "text-red-600" : "text-amber-600"}`} />
            <p className={`text-xs sm:text-sm font-medium ${isExpired ? "text-red-800" : "text-amber-800"}`}>
              {isExpired ? (t.expired || "Expirado") : (t.awaitingPayment || "A aguardar pagamento")}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${
            isExpired ? "bg-red-100" : "bg-amber-100"
          }`}>
            <span className={`text-sm sm:text-base font-bold font-mono tracking-wider ${
              isExpired ? "text-red-900" : "text-amber-900"
            }`}>
              {isExpired ? "00:00" : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
            </span>
          </div>
        </div>
      </div>

      {/* Expired warning */}
      {isExpired && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3">
          <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-red-800 leading-relaxed">
            {t.pixExpired || "O código PIX expirou. Clique abaixo para gerar um novo."}
          </p>
        </div>
      )}

      {/* Large Amount Display */}
      <div className="text-center py-2 sm:py-3">
        <p className="text-xs sm:text-sm font-medium text-slate-500">{t.totalAmount}</p>
        <p className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {formatAmount(total)}
        </p>
      </div>

      {/* QR Code — use base64 image from gateway or generate grid */}
      <div className="flex justify-center">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {qrCodeBase64 ? (
            <img
              src={qrCodeBase64}
              alt="PIX QR Code"
              className="w-[176px] h-[176px] object-contain"
            />
          ) : (
            <div
              className="grid gap-[2px]"
              style={{
                gridTemplateColumns: "repeat(11, 1fr)",
                width: 176,
                height: 176,
              }}
            >
              {qrPattern.map((filled, i) => (
                <div
                  key={i}
                  className={`rounded-[1px] ${filled ? "bg-slate-900" : "bg-white"}`}
                />
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">PIX QR Code</span>
          </div>
        </div>
      </div>

      {/* Copy-paste PIX Code */}
      {pixCode && (
        <div className="space-y-2">
          <p className="text-center text-[10px] sm:text-xs font-medium text-slate-500">
            {t.copyPixCode}
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
            <code className="flex-1 truncate text-[10px] sm:text-xs font-mono text-slate-600">
              {pixCode}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              disabled={isExpired}
              className={`shrink-0 rounded-md px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium transition-all min-h-[32px] ${
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : isExpired
                    ? "cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200"
                    : "bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {copied ? (
                <span className="flex items-center gap-1"><Check className="h-3 w-3" />{t.copied}</span>
              ) : (
                <span className="flex items-center gap-1"><Copy className="h-3 w-3" />{t.copy}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button (shown when expired) */}
      {isExpired && (
        <button
          type="button"
          onClick={handleRefresh}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:bg-slate-100 min-h-[44px]"
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t.generateNewQr}
        </button>
      )}

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
