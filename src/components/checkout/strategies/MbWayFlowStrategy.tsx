// ─── MB WAY Mobile Payment Strategy ──────────────────────────────────────────
// Portuguese mobile payment flow with phone input, request, and confirmation stages.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Smartphone, Phone, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

type MbWayStage = "input" | "sent" | "confirming";

function maskPortuguesePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const clean = digits.startsWith("351") ? digits.slice(3) : digits;
  const nine = clean.slice(0, 9);

  if (nine.length === 0) return "+351 ";
  if (nine.length <= 3) return `+351 ${nine}`;
  if (nine.length <= 6) return `+351 ${nine.slice(0, 3)} ${nine.slice(3)}`;
  return `+351 ${nine.slice(0, 3)} ${nine.slice(3, 6)} ${nine.slice(6, 9)}`;
}

export function MbWayFlowStrategy() {
  const { session } = useCheckoutStore();
  const { t, formatAmount } = useI18n();
  const [stage, setStage] = useState<MbWayStage>("input");
  const [phoneRaw, setPhoneRaw] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("+351 ");
  const sentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = session?.order.total ?? 0;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
      if (confirmingTimerRef.current) clearTimeout(confirmingTimerRef.current);
    };
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "");
    setPhoneRaw(digits);
    setPhoneDisplay(maskPortuguesePhone(value));
  }, []);

  const handleSendRequest = useCallback(() => {
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.length < 9) return;

    setStage("sent");

    // After 3 seconds, transition to "confirming"
    sentTimerRef.current = setTimeout(() => {
      setStage("confirming");
    }, 3000);
  }, [phoneRaw]);

  const handleReset = useCallback(() => {
    if (sentTimerRef.current) clearTimeout(sentTimerRef.current);
    if (confirmingTimerRef.current) clearTimeout(confirmingTimerRef.current);
    setStage("input");
    setPhoneRaw("");
    setPhoneDisplay("+351 ");
  }, []);

  // Input stage
  if (stage === "input") {
    return (
      <div className="space-y-4 sm:space-y-5 pt-1">
        {/* Amount */}
        <div className="text-center py-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500">{t.totalAmount}</p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {formatAmount(total)}
          </p>
        </div>

        {/* Phone Icon */}
        <div className="flex justify-center">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/20">
            <Smartphone className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
        </div>

        {/* Phone Input */}
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="mbway-phone" className="text-xs sm:text-sm font-medium text-slate-700">
            Phone number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            <Input
              id="mbway-phone"
              type="tel"
              placeholder="+351 9XX XXX XXX"
              value={phoneDisplay}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-11 bg-white pl-10 font-mono text-sm sm:text-base tracking-wider"
              autoComplete="tel"
              inputMode="numeric"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400">
            Enter your Portuguese mobile number (9XX XXX XXX)
          </p>
        </div>

        {/* Send Request Button */}
        <button
          type="button"
          onClick={handleSendRequest}
          disabled={phoneRaw.replace(/\D/g, "").length < 9}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          <span>Send MB WAY Request</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Sent stage (first 3 seconds)
  if (stage === "sent") {
    return (
      <div className="space-y-5 sm:space-y-6 pt-2">
        {/* Animated Phone Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-200 opacity-40" />
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
              <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Open the MB WAY app
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Open the MB WAY app on your phone to confirm the payment of{" "}
            <span className="font-semibold text-slate-900">{formatAmount(total)}</span>
          </p>
        </div>

        {/* Phone number display */}
        <div className="flex items-center justify-center gap-2 text-sm font-mono text-slate-500">
          <Phone className="h-3.5 w-3.5" />
          <span>{phoneDisplay}</span>
        </div>

        {/* Cancel */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Confirming stage
  return (
    <div className="space-y-5 sm:space-y-6 pt-2">
      {/* Checkmark Icon */}
      <div className="flex justify-center">
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          Awaiting confirmation...
        </h3>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          We are waiting for your confirmation in the MB WAY app.
        </p>
      </div>

      {/* Pulse indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-emerald-600">
            Waiting for payment confirmation
          </span>
        </div>
      </div>

      {/* Loading bar */}
      <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 animate-pulse" />
      </div>

      {/* Cancel */}
      <button
        type="button"
        onClick={handleReset}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
      >
        Cancel
      </button>
    </div>
  );
}
