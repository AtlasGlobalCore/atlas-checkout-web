// ─── Success Screen ─────────────────────────────────────────────────────────
// Animated checkmark + countdown redirect after payment confirmation.

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";

export function SuccessScreen() {
  const { session } = useCheckoutStore();
  const { t } = useI18n();
  const [countdown, setCountdown] = useState(3);

  const successUrl = session?.successUrl;

  useEffect(() => {
    if (countdown <= 0 && successUrl) {
      window.location.href = successUrl;
      return;
    }
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, successUrl]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
      >
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-full bg-emerald-100 p-1"
          >
            <div className="rounded-full bg-emerald-500 p-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.4, 0.2, 0] }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-4 border-emerald-400"
          />
        </motion.div>

        {/* Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold text-slate-900">
            {t.paymentConfirmed}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {t.paymentSuccessMessage}
          </p>
        </motion.div>

        {/* Reference */}
        {session && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Ref.</span>
              <span className="font-mono font-semibold text-slate-700">
                {session.id.slice(-12).toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}

        {/* Redirect Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          {successUrl ? (
            <>
              <p className="text-xs text-slate-400">
                {t.redirectingIn} {countdown}s...
              </p>
              <a
                href={successUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                {t.goToStore}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{t.paymentProcessed}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
