// ─── Payer Form Component ────────────────────────────────────────────────────
// Dynamic Mini-CRM form that renders fields based on API configuration
// and selected payment method.

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutStore } from "@/lib/checkout/checkout-store";
import { maskCPF, maskCNPJ, maskPhone } from "@/lib/checkout/utils";

/**
 * Returns the mask function for a given payer field type.
 */
function getInputMask(type: string): ((value: string) => string) | null {
  switch (type) {
    case "cpf":
      return maskCPF;
    case "cnpj":
      return maskCNPJ;
    case "phone":
      return maskPhone;
    default:
      return null;
  }
}

/**
 * Returns the appropriate input type for HTML.
 */
function getHtmlInputType(type: string): string {
  switch (type) {
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "number":
      return "number";
    default:
      return "text";
  }
}

export function PayerForm() {
  const { session, selectedMethodId, payerData, updatePayerData } =
    useCheckoutStore();

  if (!session) return null;

  // Filter fields based on selected payment method
  const visibleFields = session.payerFields.filter((field) => {
    // Always show fields without dependency
    if (!field.dependsOnMethod || field.dependsOnMethod.length === 0) {
      return true;
    }
    // Show only if the selected method is in the dependency list
    return selectedMethodId != null && field.dependsOnMethod.includes(selectedMethodId);
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-semibold text-slate-900">Seus dados</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visibleFields.map((field) => {
          const mask = getInputMask(field.type);
          const htmlType = getHtmlInputType(field.type);
          const value = payerData[field.id] ?? "";

          // Some fields should take full width
          const isFullWidth = field.type === "address";

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
                {field.required && (
                  <span className="ml-0.5 text-red-500">*</span>
                )}
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
                    ? field.validation.maxLength + 5 // account for mask chars
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
