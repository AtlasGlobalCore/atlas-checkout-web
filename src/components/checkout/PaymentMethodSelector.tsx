// ─── Payment Method Selector ─────────────────────────────────────────────────
// Renders the payment method selection buttons from the API response.

"use client";

import { CreditCard, QrCode, Bitcoin, Landmark, BarChart3, Smartphone, Building } from "lucide-react";
import type { PaymentMethod } from "@/lib/checkout/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  QrCode,
  Bitcoin,
  Landmark,      // bank_transfer
  BarChart3,      // boleto
  Smartphone,     // apple_pay / google_pay
  Building,       // debit_card
};

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
}: PaymentMethodSelectorProps) {
  const enabledMethods = methods.filter((m) => m.enabled);

  if (enabledMethods.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Método de pagamento
      </h3>

      <div className="grid gap-2">
        {enabledMethods.map((method) => {
          const isSelected = selectedId === method.id;
          const IconComponent = iconMap[method.icon];

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200 ${
                isSelected
                  ? "border-slate-900 bg-slate-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {IconComponent ? (
                  <IconComponent className="h-5 w-5" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-current opacity-50" />
                )}
              </div>

              {/* Label & Description */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    isSelected ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {method.label}
                </p>
                {method.description && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {method.description}
                  </p>
                )}
              </div>

              {/* Selection Indicator */}
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? "border-slate-900 bg-slate-900"
                    : "border-slate-300 bg-white"
                }`}
              >
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
