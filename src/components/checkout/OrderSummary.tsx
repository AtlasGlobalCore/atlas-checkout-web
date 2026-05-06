// ─── Order Summary ───────────────────────────────────────────────────────────
// Compact order summary for the left column.

"use client";

import { Tag, ShieldCheck, Clock } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import { getTimeRemaining } from "@/lib/checkout/utils";

export function OrderSummary() {
  const { session } = useCheckoutStore();
  const { t, formatAmount } = useI18n();

  if (!session) return null;

  const { store, order } = session;
  const timeRemaining = session.expiresAt ? getTimeRemaining(session.expiresAt) : null;

  return (
    <div className="flex flex-col">
      {/* Store */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm"
            style={{ backgroundColor: store.primaryColor }}
          >
            {store.storeName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{store.storeName}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ShieldCheck className="h-3 w-3" />
              <span>{t.secureCheckout}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order */}
      <div className="flex-1 py-5">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">{order.title}</h2>
        {order.description && <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">{order.description}</p>}

        <div className="mt-5 space-y-3">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-800">{item.name}</p>
              </div>
              <p className="shrink-0 text-xs sm:text-sm font-medium text-slate-700">
                {formatAmount(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-3 space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-500">{t.subtotal}</span>
            <span className="font-medium text-slate-700">{formatAmount(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-1 text-emerald-600"><Tag className="h-3 w-3" />{t.discount}</span>
              <span className="font-medium text-emerald-600">-{formatAmount(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-2.5">
            <span className="text-sm sm:text-base font-semibold text-slate-900">{t.total}</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900">{formatAmount(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer badges */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        {timeRemaining && !timeRemaining.isUrgent && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>{t.offerExpires} {timeRemaining.text}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3 w-3" />
          <span>{t.dataProtected}</span>
        </div>
      </div>
    </div>
  );
}
