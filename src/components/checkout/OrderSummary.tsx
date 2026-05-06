// ─── Order Summary Component ─────────────────────────────────────────────────
// Left column (desktop) / Top section (mobile) showing store branding and order details.

"use client";

import {
  Store,
  Tag,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { formatCurrency, getTimeRemaining } from "@/lib/checkout/utils";

export function OrderSummary() {
  const { session } = useCheckoutStore();

  if (!session) return null;

  const { store, order } = session;
  const timeRemaining = session.expiresAt
    ? getTimeRemaining(session.expiresAt)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Store Header */}
      <div className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          {/* Store Logo */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-sm"
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
              <span>Checkout seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 py-6">
        <h2 className="text-lg font-semibold text-slate-900 leading-tight">
          {order.title}
        </h2>
        {order.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {order.description}
          </p>
        )}

        {/* Line Items */}
        <div className="mt-6 space-y-4">
          {order.lineItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              {/* Item Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <div className="h-5 w-5 rounded bg-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.description}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-sm font-medium text-slate-700">
                {formatCurrency(item.unitPrice * item.quantity, order.currency)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 border-t border-slate-100 pt-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Subtotal</span>
            <span className="text-sm font-medium text-slate-700">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </div>

          {order.tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Impostos</span>
              <span className="text-sm font-medium text-slate-700">
                {formatCurrency(order.tax, order.currency)}
              </span>
            </div>
          )}

          {order.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <Tag className="h-3.5 w-3.5" />
                Desconto
              </span>
              <span className="text-sm font-medium text-emerald-600">
                -{formatCurrency(order.discount, order.currency)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-base font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Timer & Trust Badges */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        {timeRemaining && !timeRemaining.isUrgent && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Oferta expira em {timeRemaining.text}</span>
          </div>
        )}
        {timeRemaining?.isUrgent && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">
              Esta oferta expira em {timeRemaining.text}!
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Dados protegidos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
