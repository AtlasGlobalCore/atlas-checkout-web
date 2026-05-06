// ─── Atlas Checkout Types ────────────────────────────────────────────────────
// Core type definitions for the Smart Checkout system.

/** Branding configuration loaded from the Headless API */
export interface StoreBranding {
  logoUrl: string;
  storeName: string;
  primaryColor: string;
  accentColor?: string;
  favicon?: string;
}

/** A single line item in the order */
export interface OrderLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents (smallest currency unit)
  imageUrl?: string;
}

/** Full checkout session returned by the API */
export interface CheckoutSession {
  id: string;
  storeSlug: string;
  linkId: string;
  store: StoreBranding;
  order: {
    id: string;
    title: string;
    description?: string;
    lineItems: OrderLineItem[];
    subtotal: number; // cents
    tax: number; // cents
    discount: number; // cents
    total: number; // cents
    currency: string; // ISO 4217 (e.g. "BRL", "USD")
  };
  payerFields: PayerField[];
  methods: PaymentMethod[];
  metadata?: Record<string, string>;
  expiresAt?: string; // ISO 8601
  status: "active" | "expired" | "completed" | "cancelled";
}

/** Dynamic payer data field (Mini-CRM) */
export type PayerField = {
  id: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "cpf"
    | "cnpj"
    | "address"
    | "number"
    | "select";
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
  options?: { label: string; value: string }[]; // for type "select"
  dependsOnMethod?: string[]; // only show when these method IDs are selected
};

/** Payment method definition from the API */
export type PaymentMethod = {
  id: string;
  type:
    | "credit_card"
    | "debit_card"
    | "pix"
    | "boleto"
    | "crypto"
    | "bank_transfer"
    | "apple_pay"
    | "google_pay";
  label: string;
  description?: string;
  icon: string; // icon name or URL
  enabled: boolean;
  requiresPayerFields?: string[]; // payer field IDs that must be visible
  config?: Record<string, unknown>;
};

/** Form data collected from the payer */
export interface PayerFormData {
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  [key: string]: string | undefined;
}

/** Credit card form data */
export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

/** The full payment payload sent to the API */
export interface PaymentPayload {
  sessionId: string;
  methodId: string;
  payer: PayerFormData;
  paymentData: CreditCardData | Record<string, unknown>;
}

/** Checkout store state */
export interface CheckoutState {
  session: CheckoutSession | null;
  isLoading: boolean;
  isProcessing: boolean;
  selectedMethodId: string | null;
  payerData: PayerFormData;
  paymentData: Record<string, unknown>;
  error: string | null;

  // Actions
  setSession: (session: CheckoutSession) => void;
  setLoading: (loading: boolean) => void;
  setProcessing: (processing: boolean) => void;
  selectMethod: (methodId: string) => void;
  updatePayerData: (field: string, value: string) => void;
  updatePaymentData: (data: Record<string, unknown>) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
