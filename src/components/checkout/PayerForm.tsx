// ─── Payer Form Component ────────────────────────────────────────────────────
// Dynamic Mini-CRM form that renders fields based on API configuration,
// selected payment method, AND detected country (NIF for PT, CPF for BR, etc.).

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { useI18n } from "@/lib/i18n";
import { maskCPF, maskCNPJ, maskPhone, maskNIF } from "@/lib/checkout/utils";
import type { PayerField } from "@/lib/checkout/types";

const COUNTRY_OPTIONS = [
  { value: "BR", label: "🇧🇷 Brasil" },
  { value: "PT", label: "🇵🇹 Portugal" },
  { value: "AO", label: "🇦🇴 Angola" },
  { value: "MZ", label: "🇲🇿 Moçambique" },
  { value: "US", label: "🇺🇸 United States" },
  { value: "ES", label: "🇪🇸 España" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "DE", label: "🇩🇪 Deutschland" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "IT", label: "🇮🇹 Italia" },
  { value: "OTHER", label: "🌍 Other" },
];

/** Country-specific tax ID field definitions */
const COUNTRY_TAX_FIELDS: Record<string, PayerField> = {
  BR: {
    id: "cpf",
    type: "cpf",
    label: "CPF",
    placeholder: "000.000.000-00",
    required: true,
    dependsOnMethod: ["pix", "boleto", "credit_card"],
    validation: { pattern: "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$", message: "CPF inválido" },
  },
  PT: {
    id: "nif",
    type: "nif",
    label: "NIF",
    placeholder: "123456789",
    required: true,
    validation: { pattern: "^\\d{9}$", message: "NIF inválido (9 dígitos)" },
  },
  AO: {
    id: "nif",
    type: "nif",
    label: "NIF",
    placeholder: "000000000",
    required: false,
  },
  MZ: {
    id: "nif",
    type: "nif",
    label: "NUIT",
    placeholder: "000000000",
    required: false,
  },
};

function getInputMask(type: string): ((value: string) => string) | null {
  switch (type) {
    case "cpf": return maskCPF;
    case "cnpj": return maskCNPJ;
    case "phone": return maskPhone;
    case "nif": return maskNIF;
    default: return null;
  }
}

function getHtmlInputType(type: string): string {
  switch (type) {
    case "email": return "email";
    case "phone": return "tel";
    case "number": return "number";
    default: return "text";
  }
}

export function PayerForm() {
  const { session, selectedMethodId, payerData, updatePayerData } =
    useCheckoutStore();
  const { localeConfig } = useI18n();

  if (!session) return null;

  const selectedCountry = payerData.country || localeConfig.country || "BR";

  // Get country-specific tax field if any
  const countryTaxField = COUNTRY_TAX_FIELDS[selectedCountry] ?? null;

  // Merge API fields with country-specific tax field
  const allFields = [...session.payerFields];
  if (countryTaxField) {
    // Remove any existing tax field (cpf/nif) and replace with country-specific one
    const taxFieldIds = new Set(Object.values(COUNTRY_TAX_FIELDS).map((f) => f.id));
    const filtered = allFields.filter((f) => !taxFieldIds.has(f.id));
    filtered.push(countryTaxField);
    allFields.length = 0;
    allFields.push(...filtered);
  }

  // Filter fields based on selected payment method
  const visibleFields = allFields.filter((field) => {
    if (!field.dependsOnMethod || field.dependsOnMethod.length === 0) {
      return true;
    }
    return selectedMethodId != null && field.dependsOnMethod.includes(selectedMethodId);
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">
        {/* Use i18n for label from CheckoutPage — fallback here */}
        Seus dados
      </h3>

      {/* Country Selector */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">País</Label>
        <Select
          value={selectedCountry}
          onValueChange={(v) => updatePayerData("country", v)}
        >
          <SelectTrigger className="h-11 bg-white text-sm">
            <SelectValue placeholder="Selecione o país" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleFields.map((field) => {
          // Skip country field (we have a select for it)
          if (field.id === "country") return null;

          const mask = getInputMask(field.type);
          const htmlType = getHtmlInputType(field.type);
          const value = payerData[field.id] ?? "";
          const isFullWidth = ["address", "nif", "cpf", "cnpj"].includes(field.type);

          return (
            <div
              key={field.id}
              className={`space-y-1.5 ${isFullWidth ? "sm:col-span-2" : ""}`}
            >
              <Label
                htmlFor={`payer-${field.id}`}
                className="text-sm font-medium text-slate-700"
              >
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </Label>
              <Input
                id={`payer-${field.id}`}
                type={htmlType}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => {
                  const raw = e.target.value;
                  const masked = mask ? mask(raw) : raw;
                  updatePayerData(field.id, masked);
                }}
                className="h-11 bg-white text-sm transition-colors focus:bg-white"
                maxLength={
                  field.validation?.maxLength
                    ? field.validation.maxLength + 5
                    : undefined
                }
                required={field.required}
              />
              {field.validation?.message && (
                <p className="text-xs text-slate-400">{field.validation.message}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
