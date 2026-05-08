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
  provider: string;               // e.g. "MP_001", "STRIPE_001", "PICPAY_001"
  label: string;
  description?: string;
  icon: string;
  enabled: boolean;
  config?: Record<string, unknown>; // provider-specific (publicKey, etc.)
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

// ─── Gateway Response (from Atlas Core) ─────────────────────────────────────
// Each payment gateway returns different fields inside gatewayResponse.
export interface GatewayResponse {
  // Stripe
  client_secret?: string;
  publishable_key?: string;

  // PIX
  qr_code?: string;
  qr_code_base64?: string;
  pix_code?: string;
  expires_at?: string;

  // Viva Wallet
  charge_token?: string;
  redirect_url?: string;

  // SEPA Instant
  beneficiary_name?: string;
  iban?: string;
  bic_swift?: string;
  reference?: string;

  // MB WAY
  phone?: string;
  mbway_request_id?: string;

  // Crypto
  wallet_address?: string;
  network?: string;
  estimated_amount?: string;

  // Generic
  [key: string]: unknown;
}

// ─── Card Token Payload (sent after MP_001 tokenization) ────────────────────
export interface CardTokenPayload {
  method: "card";
  provider: string;                 // "MP_001"
  token: string;                    // SDK-generated card token
  installments: number;
  issuer_id: string | null;         // Bank identifier from MP SDK
  payment_method_id: string;        // "visa", "mastercard", "amex", etc.
}

// ─── Pay Request Body (Client → our API) ────────────────────────────────────
export interface PayRequestBody {
  sessionId: string;
  storeSlug: string;
  linkId: string;
  payer: PayerFormData;
  methodId?: string;                // Optional — backend decides if not sent
  methodType?: PaymentMethodType;   // Optional — backend decides if not sent
  cardPayload?: CardTokenPayload;   // Only for card tokenization (e.g. MP_001)
}

// ─── Pay Response (Atlas Core → our API → Client) ───────────────────────────
// Union type: success vs error — forces type narrowing at call sites.
export interface PayResponseSuccess {
  success: true;
  transactionId: string;
  payerId?: string;
  methodType: PaymentMethodType;
  methodId?: string;
  provider?: string;                    // Backend-selected provider (e.g. "MP_001")
  providerConfig?: Record<string, unknown>; // Provider-specific config (e.g. { publicKey: "APP_USR-xxx" })
  gatewayResponse: GatewayResponse;
  message?: string;
}

export interface PayResponseError {
  success: false;
  error: string;
  code?: string;                       // Machine-readable error code for support
}

export type PayResponseBody = PayResponseSuccess | PayResponseError;

// ─── Payment Status (polling) ───────────────────────────────────────────────
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "expired";

export interface PaymentStatusResponse {
  sessionId: string;
  status: PaymentStatus;
  successUrl?: string;
}

// ─── Strategy Component Props ───────────────────────────────────────────────
export interface StrategyProps {
  gatewayResponse: GatewayResponse;
}

// ─── Mercado Pago SDK Instance (typed loosely to avoid bundling) ────────────
type MercadopagoInstance = unknown;

// ─── Backend-resolved method (stored after POST /checkout/pay) ───────────
export interface ResolvedMethod {
  methodType: PaymentMethodType;
  provider: string;
  publicKey?: string;
}

// ─── Store State ────────────────────────────────────────────────────────────
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

  // Card form data (collected before tokenization)
  paymentData: Record<string, string>;

  // Gateway (after POST /checkout/pay)
  transactionId: string | null;
  gatewayResponse: GatewayResponse | null;

  // Mercado Pago SDK
  mpInstance: MercadopagoInstance | null;
  mpReady: boolean;
  initMercadoPago: (publicKey: string) => Promise<void>;

  // Backend-resolved method (after POST /checkout/pay)
  resolvedMethod: ResolvedMethod | null;

  // Actions
  setSession: (session: CheckoutSession) => void;
  setLoading: (v: boolean) => void;
  setStep: (step: CheckoutStep) => void;
  setError: (error: string | null) => void;

  updatePayerData: (field: string, value: string) => void;
  setPayerId: (id: string) => void;
  setRegistering: (v: boolean) => void;

  updatePaymentData: (data: Record<string, string>) => void;
  setProcessing: (v: boolean) => void;
  setPaymentStatus: (status: PaymentStatus) => void;

  setTransactionId: (id: string) => void;
  setGatewayResponse: (response: GatewayResponse) => void;
  clearGatewayResponse: () => void;
  setResolvedMethod: (method: ResolvedMethod) => void;

  reset: () => void;
}
