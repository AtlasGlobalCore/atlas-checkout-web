// ─── Order Summary Component ─────────────────────────────────────────────────
// Left column (desktop) / Bottom section (mobile) with i18n support.

"use client";

import { Store, Tag, ShieldCheck, Clock } from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import { getTimeRemaining } from "@/lib/checkout/utils";

export function OrderSummary() {
  const { session } = useCheckoutStore();
  const { t, formatAmount, locale } = useI18n();

  if (!session) return null;

  const { store, order } = session;
  const timeRemaining = session.expiresAt
    ? getTimeRemaining(session.expiresAt)
    : null;

  const formatLocale =
    locale === "pt-BR" ? "pt-BR" : locale === "pt-PT" ? "pt-PT" : locale === "es" ? "es-ES" : "en-US";

  return (
    <div className="flex flex-col h-full">
      {/* Store Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm"
            style={{ backgroundColor: store.primaryColor }}
          >
            {store.storeName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {store.storeName}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Store className="h-3 w-3" />
              <span>{t.secureCheckout}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 py-5">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          {order.title}
        </h2>
        {order.description && (
          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">
            {order.description}
          </p>
        )}

        {/* Line Items */}
        <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-800">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                )}
              </div>
              <p className="shrink-0 text-xs sm:text-sm font-medium text-slate-700">
                {formatAmount(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-5 sm:mt-6 border-t border-slate-100 pt-3 sm:pt-4 space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500">{t.subtotal}</span>
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              {formatAmount(order.subtotal)}
            </span>
          </div>

          {order.tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-slate-500">{t.taxes}</span>
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                {formatAmount(order.tax)}
              </span>
            </div>
          )}

          {order.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs sm:text-sm text-emerald-600">
                <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {t.discount}
              </span>
              <span className="text-xs sm:text-sm font-medium text-emerald-600">
                -{formatAmount(order.discount)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-3">
            <span className="text-sm sm:text-base font-semibold text-slate-900">{t.total}</span>
            <span className="text-lg sm:text-xl font-bold text-slate-900">
              {formatAmount(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Timer & Trust */}
      <div className="border-t border-slate-100 pt-4 sm:pt-5 space-y-2.5 sm:space-y-3">
        {timeRemaining && !timeRemaining.isUrgent && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>{t.offerExpires} {timeRemaining.text}</span>
          </div>
        )}
        {timeRemaining?.isUrgent && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-2.5 sm:px-3 py-2 text-xs text-red-700">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span className="font-medium">{t.offerUrgent} {timeRemaining.text}!</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{t.secureCheckout}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{t.dataProtected}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
