// ─── Atlas Payment Router — Core Types ───────────────────────────────────────

// ─── Checkout Steps ─────────────────────────────────────────────────────────
export type CheckoutStep = "LOADING" | "PAYER" | "METHODS" | "PAYING" | "SUCCESS" | "ERROR";

// ─── Store Branding ─────────────────────────────────────────────────────────
export interface StoreBranding {
  logoUrl: string;
  storeName: string;
  primaryColor: string;
  accentColor?: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export interface OrderLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // cents
  imageUrl?: string;
}

// ─── Payment Method Types (Router) ──────────────────────────────────────────
export type PaymentMethodType =
  | "STRIPE_ELEMENTS"
  | "PIX_NATIVE"
  | "VIVA_MODAL"
  | "SEPA_INSTANT"
  | "MBWAY_FLOW"
  | "CRYPTO_NATIVE";

export interface PaymentMethod {
  id: string;
  method_type: PaymentMethodType;
  label: string;
  description?: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

// ─── Dynamic Payer Fields ───────────────────────────────────────────────────
export type PayerFieldType =
  | "text" | "email" | "phone" | "cpf" | "cnpj" | "nif" | "address";

export interface PayerField {
  id: string;
  type: PayerFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
}

// ─── Checkout Session ───────────────────────────────────────────────────────
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
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  payerFields: PayerField[];
  methods: PaymentMethod[];
  successUrl?: string;
  cancelUrl?: string;
  expiresAt?: string;
  status: "active" | "expired" | "completed" | "cancelled";
  metadata?: Record<string, string>;
}

// ─── Payer Form Data ────────────────────────────────────────────────────────
export interface PayerFormData {
  fullName?: string;
  email?: string;
  phone?: string;
  document?: string;  // CPF, NIF, etc. — unified field
  address?: string;
  country?: string;
  [key: string]: string | undefined;
}

// ─── CRM Registration Response ──────────────────────────────────────────────
export interface CrmRegisterResponse {
  success: boolean;
  payerId: string;
  message?: string;
}

// ─── Payment Status (polling) ───────────────────────────────────────────────
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "expired";

export interface PaymentStatusResponse {
  sessionId: string;
  status: PaymentStatus;
  successUrl?: string;
}

// ─── Store State ─────────────────────────────────────────────────────────────
export interface CheckoutState {
  // Session
  session: CheckoutSession | null;
  isLoading: boolean;

  // Step flow
  step: CheckoutStep;
  error: string | null;

  // Payer data
  payerData: PayerFormData;
  payerId: string | null;
  isRegistering: boolean;

  // Payment
  selectedMethodId: string | null;
  isProcessing: boolean;
  paymentStatus: PaymentStatus | null;

  // Actions
  setSession: (session: CheckoutSession) => void;
  setLoading: (v: boolean) => void;
  setStep: (step: CheckoutStep) => void;
  setError: (error: string | null) => void;

  updatePayerData: (field: string, value: string) => void;
  setPayerId: (id: string) => void;
  setRegistering: (v: boolean) => void;

  selectMethod: (id: string) => void;
  setProcessing: (v: boolean) => void;
  setPaymentStatus: (status: PaymentStatus) => void;

  reset: () => void;
}
