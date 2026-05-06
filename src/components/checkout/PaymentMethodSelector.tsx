// ─── Payment Method Selector ─────────────────────────────────────────────────

"use client";

import { CreditCard, QrCode, Bitcoin, Landmark, Smartphone, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/lib/checkout/types";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, QrCode, Bitcoin, Landmark, Smartphone, Wallet,
};

interface Props {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PaymentMethodSelector({ methods, selectedId, onSelect }: Props) {
  const { t } = useI18n();
  const enabled = methods.filter((m) => m.enabled);

  if (enabled.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-semibold text-slate-900">{t.paymentMethod}</h3>
      <div className="grid gap-2">
        {enabled.map((method) => {
          const isSelected = selectedId === method.id;
          const Icon = iconMap[method.icon];

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`flex items-center gap-2.5 sm:gap-3 rounded-xl border-2 px-3 sm:px-4 py-3 text-left transition-all min-h-[52px] ${
                isSelected
                  ? "border-slate-900 bg-slate-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 active:scale-[0.99]"
              }`}
            >
              <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {Icon ? <Icon className="h-4 w-4 sm:h-5 sm:w-5" /> : <div className="h-4 w-4 rounded-full bg-current opacity-50" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-semibold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>{method.label}</p>
                {method.description && <p className="mt-0.5 text-xs text-slate-500 hidden sm:block">{method.description}</p>}
              </div>
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                isSelected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white"
              }`}>
                {isSelected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
