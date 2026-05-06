// ─── Checkout Utilities ──────────────────────────────────────────────────────

/**
 * Format an amount in cents to a display string with currency.
 * e.g., formatCurrency(29820, "BRL") → "R$ 298,20"
 */
export function formatCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100;

  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

/**
 * Simple input mask for CPF: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/**
 * Simple input mask for CNPJ: 00.000.000/0000-00
 */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/**
 * Simple input mask for phone: (00) 00000-0000
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Simple input mask for credit card number: 0000 0000 0000 0000
 */
export function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Simple input mask for expiry: MM/YY
 */
export function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.replace(/(\d{2})(?=\d)/, "$1/");
}

/**
 * Get a time-remaining string from an expiry date.
 */
export function getTimeRemaining(expiresAt: string): {
  text: string;
  minutes: number;
  isUrgent: boolean;
} {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Expirado", minutes: 0, isUrgent: true };

  const minutes = Math.floor(diff / 60000);
  const isUrgent = minutes <= 5;
  const text = `${minutes}m restante${minutes !== 1 ? "s" : ""}`;
  return { text, minutes, isUrgent };
}

/**
 * Format a credit card type from the first digits.
 */
export function getCardBrand(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (/^4/.test(digits)) return "visa";
  if (/^5[1-5]/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return "unknown";
}
