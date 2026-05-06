// ─── Locale Switcher ─────────────────────────────────────────────────────────
// Compact language & currency selector bar at the top of the checkout.

"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, CURRENCIES, type Locale } from "@/lib/i18n/translations";
import { useState, useRef, useEffect } from "react";

export function LocaleSwitcher() {
  const { locale, localeConfig, currency, setLocale, setCurrency, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex items-center justify-end gap-2 sm:gap-3" ref={ref}>
      {/* Language Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97]"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{localeConfig.flag}</span>
          <span>{localeConfig.code}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                  locale === l.code
                    ? "bg-slate-100 font-semibold text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {locale === l.code && (
                  <svg className="h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Currency Selector */}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer appearance-none pr-7"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 6px center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "14px",
        }}
      >
        {Object.entries(CURRENCIES).map(([code, info]) => (
          <option key={code} value={code}>
            {code} ({info.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
