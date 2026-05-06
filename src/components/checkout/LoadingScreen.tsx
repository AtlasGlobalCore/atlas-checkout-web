// ─── Progressive Loading Screen ─────────────────────────────────────────────
// Animated loading that advances through steps instead of staying static.

"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = t.loadingSteps;
  const stepDuration = 700; // ms per step
  const totalDuration = steps.length * stepDuration;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          clearInterval(stepInterval);
          return prev;
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(stepInterval);
  }, [steps.length, stepDuration]);

  // Smooth progress bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [totalDuration, onComplete]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        {/* Atlas Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-lg"
        >
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <path d="M14 24L24 14L34 24L24 34Z" fill="white" fillOpacity="0.9" />
            <path d="M24 10L14 20L24 24L34 20L24 10Z" fill="white" />
            <path d="M14 28L24 24L34 28L24 38L14 28Z" fill="white" fillOpacity="0.7" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-slate-700"
        >
          {t.loading}
        </motion.p>

        {/* Progress Steps */}
        <div className="w-full space-y-3">
          {/* Progress Bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-slate-900"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>

          {/* Step Text */}
          <div className="h-5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-slate-500"
              >
                {steps[currentStep] ?? ""}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.6 }}
                animate={{
                  scale: i <= currentStep ? 1 : 0.6,
                  backgroundColor:
                    i < currentStep
                      ? "#0f172a"
                      : i === currentStep
                        ? "#475569"
                        : "#cbd5e1",
                }}
                className="h-1.5 w-1.5 rounded-full"
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
