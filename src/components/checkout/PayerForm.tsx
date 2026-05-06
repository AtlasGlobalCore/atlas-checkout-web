// ─── Payer Form — Step 1 ────────────────────────────────────────────────────
// Collects payer data BEFORE showing payment methods (Mini-CRM).

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
import { maskCPF, maskNIF, maskPhone } from "@/lib/checkout/utils";

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
  { value: "OTHER", label: "🌍 Other" },
];

const COUNTRY_DOC_FIELD: Record<string, { id: string; label: string; placeholder: string; type: string }> = {
  BR: { id: "document", label: "CPF", placeholder: "000.000.000-00", type: "cpf" },
  PT: { id: "document", label: "NIF", placeholder: "123456789", type: "nif" },
  AO: { id: "document", label: "NIF", placeholder: "000000000", type: "nif" },
  MZ: { id: "document", label: "NUIT", placeholder: "000000000", type: "nif" },
};

function getMask(type: string): ((v: string) => string) | null {
  if (type === "cpf") return maskCPF;
  if (type === "nif") return maskNIF;
  if (type === "phone") return maskPhone;
  return null;
}

export function PayerForm() {
  const { session, payerData, updatePayerData } = useCheckoutStore();
  const { localeConfig } = useI18n();

  if (!session) return null;

  const country = payerData.country || localeConfig.country || "BR";
  const docField = COUNTRY_DOC_FIELD[country];

  return (
    <div className="space-y-4">
      {/* Country */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-slate-700">País / Country</Label>
        <Select value={country} onValueChange={(v) => updatePayerData("country", v)}>
          <SelectTrigger className="h-11 bg-white text-sm">
            <SelectValue placeholder="Selecionar" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        {session.payerFields.map((field) => {
          if (field.id === "country") return null;

          const mask = field.type === "phone" ? maskPhone
            : field.type === "cpf" ? maskCPF
            : field.type === "nif" ? maskNIF
            : null;

          const htmlType = field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text";
          const value = payerData[field.id] ?? "";
          const isFull = field.id === "document" || field.id === "address";

          return (
            <div key={field.id} className={`space-y-1.5 ${isFull ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={`payer-${field.id}`} className="text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </Label>
              <Input
                id={`payer-${field.id}`}
                type={htmlType}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => updatePayerData(field.id, mask ? mask(e.target.value) : e.target.value)}
                className="h-11 bg-white text-sm"
                maxLength={field.validation?.maxLength ? field.validation.maxLength + 5 : undefined}
                required={field.required}
                autoComplete={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "off"}
              />
            </div>
          );
        })}
      </div>

      {/* Country-specific document field (if not already in payerFields) */}
      {docField && !session.payerFields.find((f) => f.id === "document") && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-slate-700">
            {docField.label} {docField.required !== false && <span className="ml-0.5 text-red-500">*</span>}
          </Label>
          <Input
            type="text"
            placeholder={docField.placeholder}
            value={payerData.document ?? ""}
            onChange={(e) => {
              const mask = getMask(docField.type);
              updatePayerData("document", mask ? mask(e.target.value) : e.target.value);
            }}
            className="h-11 bg-white text-sm font-mono"
          />
        </div>
      )}
    </div>
  );
}
