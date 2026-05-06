// ─── i18n React Context & Provider ────────────────────────────────────────────

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  type Locale,
  type LocaleConfig,
  type TranslationKeys,
  LOCALES,
  getTranslations,
  CURRENCIES,
  EXCHANGE_RATES,
} from "./translations";

interface I18nContextValue {
  locale: Locale;
  localeConfig: LocaleConfig;
  t: TranslationKeys;
  currency: string;
  displayCurrency: string;
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: string) => void;
  convertAmount: (amountCentsBRL: number) => number;
  formatAmount: (amountCentsBRL: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  initialCurrency?: string;
}

export function I18nProvider({
  children,
  initialLocale = "pt-BR",
  initialCurrency = "BRL",
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [currency, setCurrencyState] = useState<string>(initialCurrency);

  const t = getTranslations(locale);
  const localeConfig = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    const config = LOCALES.find((l) => l.code === newLocale);
    if (config) setCurrencyState(config.currency);
  }, []);

  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
  }, []);

  const convertAmount = useCallback(
    (amountCentsBRL: number): number => {
      const rate = EXCHANGE_RATES[currency] ?? 1;
      return Math.round((amountCentsBRL * rate) / 100) * 100; // round to cents
    },
    [currency]
  );

  const formatAmount = useCallback(
    (amountCentsBRL: number): string => {
      const converted = convertAmount(amountCentsBRL);
      const amount = converted / 100;
      const currInfo = CURRENCIES[currency];

      try {
        const formatLocale =
          locale === "pt-BR"
            ? "pt-BR"
            : locale === "pt-PT"
              ? "pt-PT"
              : locale === "es"
                ? "es-ES"
                : "en-US";

        return new Intl.NumberFormat(formatLocale, {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `${currency} ${amount.toFixed(2)}`;
      }
    },
    [currency, locale, convertAmount]
  );

  return (
    <I18nContext.Provider
      value={{
        locale,
        localeConfig,
        t,
        currency,
        displayCurrency: currency,
        setLocale,
        setCurrency,
        convertAmount,
        formatAmount,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

/**
 * Hook to detect user's locale from the browser and optionally from IP geolocation.
 * Returns the best matching locale and default currency.
 */
export function useDetectLocale() {
  const [detected, setDetected] = useState<{
    locale: Locale;
    currency: string;
    country: string;
    loading: boolean;
  }>({
    locale: "pt-BR",
    currency: "BRL",
    country: "BR",
    loading: true,
  });

  useEffect(() => {
    async function detect() {
      try {
        // Try IP geolocation first
        const geoRes = await fetch("/api/geolocation");
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.country) {
            const country = geo.country;
            let locale: Locale = "en";
            let currency = "USD";

            if (country === "BR") { locale = "pt-BR"; currency = "BRL"; }
            else if (country === "PT") { locale = "pt-PT"; currency = "EUR"; }
            else if (["ES", "AD", "MX", "AR", "CL", "CO", "PE", "UY"].includes(country)) {
              locale = "es"; currency = "EUR";
            }
            else if (["GB", "IE"].includes(country)) { currency = "GBP"; }

            setDetected({ locale, currency, country, loading: false });
            return;
          }
        }
      } catch {
        // Fallback to browser language
      }

      // Fallback: browser language
      const browserLang = navigator.language || "en";
      let locale: Locale = "en";
      let currency = "USD";

      if (browserLang.startsWith("pt-BR") || browserLang === "pt-BR") {
        locale = "pt-BR"; currency = "BRL";
      } else if (browserLang.startsWith("pt")) {
        locale = "pt-PT"; currency = "EUR";
      } else if (browserLang.startsWith("es")) {
        locale = "es"; currency = "EUR";
      }

      setDetected({ locale, currency, country: "", loading: false });
    }
    detect();
  }, []);

  return detected;
}
